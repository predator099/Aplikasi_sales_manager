import {
  Metro,
  PublicIp,
  PricingConfig,
  BandwidthTier,
  CalculationFormulaConfig,
} from '../types';

export interface PricingCalculationResult {
  bandwidthMbps: number;
  metroCapacityMbps: number;
  internetCost: number;
  metroCost: number;
  publicIpCost: number;
  bottomPrice: number; // Harga Bottom resmi dari Master Pricing
  subtotal: number; // Subtotal dasar komponen biaya
  sellingPrice: number; // Harga Jual yang ditawarkan oleh Sales
  margin: number; // Margin = sellingPrice - bottomPrice
  marginPercentage: number; // (Margin / bottomPrice) * 100
  discountAmount: number;
  dpp: number; // Dasar Pengenaan Pajak (sellingPrice - discountAmount)
  ppnPercentage: number;
  ppnAmount: number;
  totalMonthly: number; // DPP + PPN
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
  metroCapacityMbps?: number; // Kapasitas Metro manual dalam Mbps
  publicIp?: PublicIp | null;
  discountType: 'nominal' | 'percentage';
  discountValue: number;
  formula?: CalculationFormulaConfig | null;
  sellingPrice?: number; // Harga Jual yang diisi oleh Sales
}): PricingCalculationResult {
  const {
    bandwidthMbps,
    pricingConfig,
    metro,
    metroCapacityMbps,
    publicIp,
    discountType,
    discountValue,
    formula,
    sellingPrice,
  } = params;

  // 1. Internet cost from custom tier or baseline
  const internetRate = getInternetCost(bandwidthMbps, pricingConfig, formula);
  const internetCost = internetRate.cost;

  // 2. Metro cost calculated based on manual metro capacity (defaulting to bandwidthMbps)
  const effMetroCapacity = typeof metroCapacityMbps === 'number' && !isNaN(metroCapacityMbps) && metroCapacityMbps >= 0
    ? metroCapacityMbps
    : bandwidthMbps;

  let metroCost = 0;
  if (metro && metro.status === 'Aktif' && metro.price > 0 && effMetroCapacity > 0) {
    const method = formula?.metroCalculationMethod;

    if (method === 'flat_port') {
      metroCost = metro.price;
    } else if (metro.priceMethod === 'Per Gbps' || method === 'per_gbps') {
      metroCost = Math.round((effMetroCapacity / 1000) * metro.price);
    } else if (metro.priceMethod === 'Per 100 Mbps' || method === 'per_100mbps') {
      metroCost = Math.round((effMetroCapacity / 100) * metro.price);
    } else if (metro.priceMethod === 'Per Mbps' || method === 'per_mbps') {
      metroCost = Math.round(effMetroCapacity * metro.price);
    } else {
      // Default: Per 100 Mbps
      metroCost = Math.round((effMetroCapacity / 100) * metro.price);
    }

    // Multiplier ratio if configured
    if (formula?.metroMultiplierRatio && formula.metroMultiplierRatio > 0) {
      metroCost = Math.round(metroCost * formula.metroMultiplierRatio);
    }

    // Minimum price rule
    if (formula?.metroMinimumPrice && formula.metroMinimumPrice > 0) {
      metroCost = Math.max(metroCost, formula.metroMinimumPrice);
    }

    // Rounding rule
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

  // 4. Harga Bottom = Internet + Metro + Public IP (Read-Only)
  const bottomPrice = internetCost + metroCost + publicIpCost;
  const subtotal = bottomPrice;

  // 5. Harga Jual yang diisi oleh Sales (jika belum diisi atau 0, default sama dengan bottomPrice)
  const resolvedSellingPrice = typeof sellingPrice === 'number' && !isNaN(sellingPrice)
    ? Math.max(0, sellingPrice)
    : bottomPrice;

  // 6. Margin = Harga Jual - Harga Bottom
  const margin = resolvedSellingPrice - bottomPrice;
  const marginPercentage = bottomPrice > 0 ? (margin / bottomPrice) * 100 : 0;

  // 7. Diskon Penjualan terhadap Harga Jual
  let discountAmount = 0;
  const maxAllowedPct = formula?.maxDiscountPercentage ?? 50;
  if (discountType === 'percentage') {
    const pct = Math.min(maxAllowedPct, Math.max(0, Number(discountValue) || 0));
    discountAmount = Math.round((resolvedSellingPrice * pct) / 100);
  } else {
    discountAmount = Math.min(resolvedSellingPrice, Math.max(0, Number(discountValue) || 0));
  }

  // 8. DPP (Dasar Pengenaan Pajak)
  const dpp = Math.max(0, resolvedSellingPrice - discountAmount);

  // 9. PPN
  const ppnPercentage = formula?.ppnPercentage ?? pricingConfig?.ppnPercentage ?? 11;
  const ppnAmount = Math.round(dpp * (ppnPercentage / 100));

  // 10. Total Tagihan Bulanan (DPP + PPN)
  const totalMonthly = dpp + ppnAmount;

  return {
    bandwidthMbps,
    metroCapacityMbps: effMetroCapacity,
    internetCost,
    metroCost,
    publicIpCost,
    bottomPrice,
    subtotal,
    sellingPrice: resolvedSellingPrice,
    margin,
    marginPercentage,
    discountAmount,
    dpp,
    ppnPercentage,
    ppnAmount,
    totalMonthly,
    tierUsed: internetRate.tierUsed,
    isCustomTier: internetRate.isCustomTier,
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
  formula?: CalculationFormulaConfig | null,
  targetUserIdOrName?: string
) {
  const safeBottom = Math.max(0, Math.round(Number(bottomPrice) || 0));
  const safeSelling = Math.max(0, Math.round(Number(sellingPrice) || 0));
  const margin = Math.max(0, safeSelling - safeBottom);

  let kantorPct = formula?.kantorPercentage ?? 60;
  let poolPct = formula?.marketingPoolPercentage ?? 40;
  let salesPct = formula?.salesPercentageOfPool ?? 75;
  let amPct = formula?.amPercentageOfPool ?? 25;

  // Cek apakah ada override persentase khusus per user (Sales / Marketing / AM)
  if (formula?.userFeeRates && formula.userFeeRates.length > 0) {
    if (targetUserIdOrName) {
      const target = targetUserIdOrName.toLowerCase().trim();
      const userRate = formula.userFeeRates.find(
        (r) =>
          r.enabled &&
          (r.userId.toLowerCase() === target ||
            r.userName.toLowerCase() === target ||
            target.includes(r.userName.toLowerCase()) ||
            r.userName.toLowerCase().includes(target))
      );

      if (userRate) {
        if (userRate.userRole === 'Sales') {
          salesPct = userRate.customPercentage;
          amPct = Math.max(0, 100 - salesPct);
        } else if (userRate.userRole === 'Marketing') {
          poolPct = userRate.customPercentage;
          kantorPct = Math.max(0, 100 - poolPct);
        } else if (userRate.userRole === 'AM') {
          amPct = userRate.customPercentage;
          salesPct = Math.max(0, 100 - amPct);
        }
      }
    } else {
      // Jika tidak ada user spesifik, periksa apakah ada pool marketing override yang aktif
      const marketingOverride = formula.userFeeRates.find(
        (r) => r.enabled && r.userRole === 'Marketing'
      );
      if (marketingOverride) {
        poolPct = marketingOverride.customPercentage;
        kantorPct = Math.max(0, 100 - poolPct);
      }
    }
  }

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

