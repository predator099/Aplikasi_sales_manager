import { Metro, PublicIp, PricingConfig, BandwidthTier } from '../types';

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
 * 2. If not, use ceil(bandwidthMbps / 100) * pricingConfig.internetPricePer100Mbps as baseline fallback.
 */
export function getInternetCost(
  bandwidthMbps: number,
  pricingConfig: PricingConfig
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

  const units100M = Math.max(1, Math.ceil(bandwidthMbps / 100));
  const fallback = units100M * (pricingConfig?.internetPricePer100Mbps || 3000000);

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
}): PricingCalculationResult {
  const { bandwidthMbps, pricingConfig, metro, publicIp, discountType, discountValue } = params;

  // 1. Internet cost from custom tier or baseline
  const internetRate = getInternetCost(bandwidthMbps, pricingConfig);
  const internetCost = internetRate.cost;

  // 2. Metro cost
  let metroCost = 0;
  if (metro && metro.status === 'Aktif') {
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

  // 3. Public IP cost
  let publicIpCost = 0;
  if (publicIp && publicIp.status === 'Aktif') {
    publicIpCost = publicIp.price;
  }

  // 4. Subtotal
  const subtotal = internetCost + metroCost + publicIpCost;

  // 5. Discount
  let discountAmount = 0;
  if (discountType === 'percentage') {
    const pct = Math.min(100, Math.max(0, Number(discountValue) || 0));
    discountAmount = (subtotal * pct) / 100;
  } else {
    discountAmount = Math.min(subtotal, Math.max(0, Number(discountValue) || 0));
  }

  // 6. DPP
  const dpp = Math.max(0, subtotal - discountAmount);

  // 7. PPN
  const ppnPercentage = pricingConfig.ppnPercentage ?? 11;
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
 * Patented Realtime Margin & Fee Allocation Calculator
 * Rules:
 *  - Margin = Harga Jual - Harga Bottom
 *  - Kantor = 60% × Margin
 *  - Marketing Pool = 40% × Margin
 *  - Sales = 75% × Marketing Pool
 *  - AM = 25% × Marketing Pool
 * Rounded to full Rupiah with zero drift.
 */
export function calculateMarginAllocation(
  bottomPrice: number,
  sellingPrice: number
) {
  const safeBottom = Math.max(0, Math.round(Number(bottomPrice) || 0));
  const safeSelling = Math.max(0, Math.round(Number(sellingPrice) || 0));
  const margin = Math.max(0, safeSelling - safeBottom);

  // Exact rounded rupiah calculations
  const kantorAmount = Math.round(margin * FEE_RULES.kantor);
  const marketingPoolAmount = margin - kantorAmount; // Exactly 40% of margin, ensures kantor + pool === margin
  const salesAmount = Math.round(marketingPoolAmount * FEE_RULES.sales);
  const amAmount = marketingPoolAmount - salesAmount; // Exactly 25% of pool, ensures sales + am === pool

  return {
    bottomPrice: safeBottom,
    sellingPrice: safeSelling,
    margin,
    kantor: {
      amount: kantorAmount,
      percentage: 60,
    },
    marketingPool: {
      amount: marketingPoolAmount,
      percentage: 40,
    },
    sales: {
      amount: salesAmount,
      percentage: 75,
    },
    am: {
      amount: amAmount,
      percentage: 25,
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

