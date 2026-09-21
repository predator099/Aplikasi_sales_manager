import {
  Metro,
  PublicIp,
  PricingConfig,
  BandwidthTier,
  CalculationFormulaConfig,
} from '../types';

export interface PricingCalculationResult {
  bandwidthMbps: number;
  internetCost: number;
  metroCost: number;
  publicIpCost: number;
  subtotal: number;
  discountAmount: number;
  dpp: number;
  ppnPercentage: number;
  ppnAmount: number;
  totalMonthly: number;
  tierUsed?: BandwidthTier | null;
  isCustomTier?: boolean;
}

/**
 * Resolves the internet cost for a given bandwidth.
 * 1. If an exact active BandwidthTier exists for bandwidthMbps (e.g. 100M, 200M, 1000M / 1G), use its exact price!
 * 2. If not, use method specified in formula or fallback per 100 Mbps.
 */
export function getInternetCost(
  bandwidthMbps: number,
  pricingConfig: PricingConfig,
  formula?: CalculationFormulaConfig | null
): { cost: number; tierUsed: BandwidthTier | null; isCustomTier: boolean } {
  const tiers = pricingConfig?.bandwidthTiers || [];
  const exactTier = tiers.find((t) => t.isActive && t.bandwidthMbps === bandwidthMbps);

  if (exactTier) {
    return {
      cost: exactTier.price,
      tierUsed: exactTier,
      isCustomTier: true,
    };
  }

  if (formula?.internetCalculationMethod === 'pure_per_mbps') {
    const ratePerMbps = formula.internetFallbackPerMbps || 30000;
    return {
      cost: Math.round(bandwidthMbps * ratePerMbps),
      tierUsed: null,
      isCustomTier: false,
    };
  }

  const ratePer100 = formula?.internetFallbackPer100Mbps || pricingConfig?.internetPricePer100Mbps || 3000000;
  const units100M = Math.max(1, Math.ceil(bandwidthMbps / 100));
  const fallback = units100M * ratePer100;

  return {
    cost: fallback,
    tierUsed: null,
    isCustomTier: false,
  };
}

export function calculatePricing(params: {
  bandwidthMbps: number;
  pricingConfig: PricingConfig;
  metro?: Metro | null;
  publicIp?: PublicIp | null;
  discountType: 'nominal' | 'percentage';
  discountValue: number;
  formula?: CalculationFormulaConfig | null;
}): PricingCalculationResult {
  const { bandwidthMbps, pricingConfig, metro, publicIp, discountType, discountValue, formula } = params;

  // 1. Internet cost from custom tier or baseline
  const internetRate = getInternetCost(bandwidthMbps, pricingConfig, formula);
  const internetCost = internetRate.cost;

  // 2. Metro cost with configurable formula
  let metroCost = 0;
  if (metro && metro.status === 'Aktif') {
    const method = formula?.metroCalculationMethod || 'proportional_capacity';

    if (method === 'flat_port') {
      metroCost = metro.price;
    } else if (method === 'per_mbps') {
      metroCost = bandwidthMbps * metro.price;
    } else if (method === 'per_gbps') {
      metroCost = (bandwidthMbps / 1000) * metro.price;
    } else if (method === 'per_100mbps') {
      metroCost = (bandwidthMbps / 100) * metro.price;
    } else {
      // proportional_capacity
      if (metro.bandwidthMbps && metro.bandwidthMbps === bandwidthMbps) {
        metroCost = metro.price;
      } else if (metro.bandwidthMbps && metro.bandwidthMbps > 0) {
        metroCost = Math.round((bandwidthMbps / metro.bandwidthMbps) * metro.price);
      } else if (metro.priceMethod === 'Per Gbps' || (metro.priceMethod as string) === 'Per GB') {
        metroCost = (bandwidthMbps / 1000) * metro.price;
      } else if (metro.priceMethod === 'Per Mbps') {
        metroCost = bandwidthMbps * metro.price;
      } else {
        // Fallback: Per 100 Mbps
        metroCost = (bandwidthMbps / 100) * metro.price;
      }
    }

    // Apply multiplier ratio if configured (e.g. 1.0 or 1.25)
    if (formula?.metroMultiplierRatio && formula.metroMultiplierRatio > 0) {
      metroCost = Math.round(metroCost * formula.metroMultiplierRatio);
    }

    // Apply minimum charge if configured
    if (formula?.metroMinimumPrice && formula.metroMinimumPrice > 0) {
      metroCost = Math.max(metroCost, formula.metroMinimumPrice);
    }

    // Apply rounding rule
    if (formula?.metroRoundingRule === 'round_thousand') {
      metroCost = Math.round(metroCost / 1000) * 1000;
    } else if (formula?.metroRoundingRule === 'round_hundred_thousand') {
      metroCost = Math.round(metroCost / 100000) * 100000;
    }
  }

  // 3. Public IP cost
  let publicIpCost = 0;
  if (publicIp && publicIp.status === 'Aktif') {
    publicIpCost = publicIp.price;
  }

  // 4. Subtotal
  const subtotal = internetCost + metroCost + publicIpCost;

  // 5. Discount (constrained by maxDiscountPercentage if in percentage mode)
  let discountAmount = 0;
  const maxAllowedPct = formula?.maxDiscountPercentage ?? 50;
  if (discountType === 'percentage') {
    const pct = Math.min(maxAllowedPct, Math.max(0, Number(discountValue) || 0));
    discountAmount = (subtotal * pct) / 100;
  } else {
    discountAmount = Math.min(subtotal, Math.max(0, Number(discountValue) || 0));
  }

  // 6. DPP
  const dpp = Math.max(0, subtotal - discountAmount);

  // 7. PPN
  const ppnPercentage = formula?.ppnPercentage ?? pricingConfig?.ppnPercentage ?? 11;
  const ppnAmount = Math.round(dpp * (ppnPercentage / 100));

  // 8. Total per month
  const totalMonthly = dpp + ppnAmount;

  return {
    bandwidthMbps,
    internetCost,
    metroCost,
    publicIpCost,
    subtotal,
    discountAmount,
    dpp,
    ppnPercentage,
    ppnAmount,
    totalMonthly,
  };
}

export interface AllocationValidation {
  level1Valid: boolean;
  level1Message: string;
  level1Diff: number; // margin - (kantor + pool)
  level2Valid: boolean;
  level2Message: string;
  level2Diff: number; // pool - (sales + am)
  isValid: boolean;
}

// ============================================================================
// SINGLE SOURCE OF TRUTH: FIXED FEE RULES (RUMUS DIPATENKAN)
// ============================================================================
export const FEE_RULES = {
  kantor: 0.60,        // 60% dari Margin (Kantor ISP)
  marketingPool: 0.40, // 40% dari Margin (Pool Marketing)
  sales: 0.75,         // 75% dari Marketing Pool (efektif 30% dari Margin)
  am: 0.25,            // 25% dari Marketing Pool (efektif 10% dari Margin)
} as const;

/**
 * Realtime Margin & Fee Allocation Calculator with Admin-Configurable Formula
 * Rules:
 *  - Margin = Harga Jual - Harga Bottom
 *  - Kantor = % Kantor × Margin (default 60%)
 *  - Marketing Pool = % Pool × Margin (default 40%)
 *  - Sales = % Sales × Marketing Pool (default 75% dari Pool = 30% dari Margin)
 *  - AM = % AM × Marketing Pool (default 25% dari Pool = 10% dari Margin)
 * Rounded to full Rupiah with zero drift.
 */
export function calculateMarginAllocation(
  bottomPrice: number,
  sellingPrice: number,
  formula?: CalculationFormulaConfig | null
) {
  const safeBottom = Math.max(0, Math.round(Number(bottomPrice) || 0));
  const safeSelling = Math.max(0, Math.round(Number(sellingPrice) || 0));
  const margin = Math.max(0, safeSelling - safeBottom);

  const kantorPct = formula?.kantorPercentage ?? 60;
  const poolPct = formula?.marketingPoolPercentage ?? 40;
  const salesPct = formula?.salesPercentageOfPool ?? 75;
  const amPct = formula?.amPercentageOfPool ?? 25;

  // Check minimum margin threshold if set
  if (formula?.minimumMarginForFee && margin < formula.minimumMarginForFee) {
    return {
      bottomPrice: safeBottom,
      sellingPrice: safeSelling,
      margin,
      kantor: {
        amount: margin,
        percentage: 100,
      },
      marketingPool: {
        amount: 0,
        percentage: 0,
      },
      sales: {
        amount: 0,
        percentage: salesPct,
      },
      am: {
        amount: 0,
        percentage: amPct,
      },
    };
  }

  // Exact rounded rupiah calculations with zero drift
  const kantorRatio = kantorPct / 100;
  const kantorAmount = Math.round(margin * kantorRatio);
  const marketingPoolAmount = margin - kantorAmount; // Ensures kantor + pool === margin

  const salesRatio = salesPct / 100;
  let salesAmount = Math.round(marketingPoolAmount * salesRatio);

  // Optional Sales Extra Bonus if margin exceeds bonus threshold
  if (
    formula?.enableSalesBonus &&
    formula?.bonusThresholdMargin &&
    margin >= formula.bonusThresholdMargin &&
    formula?.salesBonusPercentage
  ) {
    const bonusAmount = Math.round(margin * (formula.salesBonusPercentage / 100));
    salesAmount = Math.min(marketingPoolAmount, salesAmount + bonusAmount);
  }

  const amAmount = Math.max(0, marketingPoolAmount - salesAmount); // Ensures sales + am === pool

  return {
    bottomPrice: safeBottom,
    sellingPrice: safeSelling,
    margin,
    kantor: {
      amount: kantorAmount,
      percentage: kantorPct,
    },
    marketingPool: {
      amount: marketingPoolAmount,
      percentage: poolPct,
    },
    sales: {
      amount: salesAmount,
      percentage: salesPct,
    },
    am: {
      amount: amAmount,
      percentage: amPct,
    },
  };
}

export function validatePricingAllocation(
  margin: number,
  kantorAmount: number,
  marketingPoolAmount: number,
  salesAmount: number,
  amAmount: number,
  formatRupiahFn: (val: number) => string
): AllocationValidation {
  const level1Sum = Math.round(kantorAmount + marketingPoolAmount);
  const roundedMargin = Math.round(margin);
  const level1Diff = roundedMargin - level1Sum;
  let level1Valid = false;
  let level1Message = '';

  if (level1Sum < roundedMargin) {
    level1Message = `Sisa margin belum dialokasikan sebesar ${formatRupiahFn(level1Diff)}.`;
  } else if (level1Sum > roundedMargin) {
    level1Message = `Pembagian melebihi margin sebesar ${formatRupiahFn(Math.abs(level1Diff))}.`;
  } else {
    level1Valid = true;
    level1Message = 'Pembagian margin sesuai.';
  }

  const level2Sum = Math.round(salesAmount + amAmount);
  const roundedPool = Math.round(marketingPoolAmount);
  const level2Diff = roundedPool - level2Sum;
  let level2Valid = false;
  let level2Message = '';

  if (level2Sum < roundedPool) {
    level2Message = `Sisa Pool Marketing sebesar ${formatRupiahFn(level2Diff)}.`;
  } else if (level2Sum > roundedPool) {
    level2Message = `Pembagian Sales + AM melebihi Pool Marketing sebesar ${formatRupiahFn(Math.abs(level2Diff))}.`;
  } else {
    level2Valid = true;
    level2Message = 'Pool Marketing sudah teralokasi seluruhnya.';
  }

  return {
    level1Valid,
    level1Message,
    level1Diff,
    level2Valid,
    level2Message,
    level2Diff,
    isValid: level1Valid && level2Valid,
  };
}

