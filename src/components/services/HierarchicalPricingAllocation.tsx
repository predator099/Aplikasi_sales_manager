import React, { useEffect } from 'react';
import { PricingAllocation } from '../../types';
import { formatRupiah } from '../../utils/formatters';
import { calculateMarginAllocation } from '../../utils/pricingEngine';
import {
  Users,
  Briefcase,
  AlertCircle,
  CheckCircle2,
  Lock,
  Sparkles,
} from 'lucide-react';

interface HierarchicalPricingAllocationProps {
  bottomPrice: number;
  sellingPrice: number;
  onBottomPriceChange?: (newPrice: number) => void;
  onSellingPriceChange?: (newPrice: number) => void;
  allocation: PricingAllocation;
  onChangeAllocation: (newAlloc: PricingAllocation) => void;
  readOnly?: boolean;
}

export const HierarchicalPricingAllocation: React.FC<HierarchicalPricingAllocationProps> = ({
  bottomPrice,
  sellingPrice,
  onSellingPriceChange,
  onChangeAllocation,
  readOnly = false,
}) => {
  // Always calculate realtime based on fixed formula
  const calculated = calculateMarginAllocation(bottomPrice, sellingPrice);

  // Sync to parent when bottomPrice or sellingPrice changes
  useEffect(() => {
    onChangeAllocation(calculated);
  }, [bottomPrice, sellingPrice]);

  const { margin, marketingPool, sales } = calculated;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. INPUT HARGA SECTION: HARGA BOTTOM SUDAH FIX, HANYA HARGA JUAL YANG BISA DIEDIT */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 text-xs font-bold flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
            <h3 className="text-sm font-bold text-slate-900">
              Pengaturan Harga & Margin Layanan
            </h3>
          </div>

          <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold self-start sm:self-auto">
            <Lock className="w-3.5 h-3.5 text-slate-500" />
            <span>Harga Bottom Fix</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* 1. Harga Bottom (FIXED - TIDAK BISA DIUBAH) */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 block">
                1. Harga Bottom (HPP)
              </label>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500 bg-slate-200/80 px-1.5 py-0.5 rounded">
                <Lock className="w-3 h-3 text-slate-500" />
                Fix / Terkunci
              </span>
            </div>
            <div className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-mono font-semibold">Rp</span>
              <span className="text-sm font-extrabold text-slate-800 font-mono">
                {bottomPrice.toLocaleString('id-ID')}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 block">
              Harga dasar sistem (tidak dapat diubah)
            </span>
          </div>

          {/* 2. Harga Jual (DAPAT DIEDIT) */}
          <div className="p-4 rounded-xl bg-teal-50/50 border-2 border-teal-400 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-teal-950 block">
                2. Harga Jual (DPP)
              </label>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-teal-800 bg-teal-100 px-1.5 py-0.5 rounded">
                Bisa Diedit
              </span>
            </div>
            {onSellingPriceChange && !readOnly ? (
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-teal-700 font-mono">
                  Rp
                </span>
                <input
                  type="number"
                  min={bottomPrice}
                  step="50000"
                  value={sellingPrice}
                  onChange={(e) => onSellingPriceChange(Math.max(0, Number(e.target.value) || 0))}
                  className="w-full pl-10 pr-3 py-2 text-xs font-bold font-mono border border-teal-400 rounded-lg bg-white text-teal-950 focus:outline-hidden focus:ring-2 focus:ring-teal-600/30 shadow-xs"
                />
              </div>
            ) : (
              <div className="p-2.5 bg-white rounded-lg border border-teal-200">
                <span className="text-sm font-bold text-teal-900 font-mono">
                  {formatRupiah(sellingPrice)}
                </span>
              </div>
            )}
            <span className="text-[10px] text-teal-800/80 block">
              Ubah harga jual untuk menentukan margin & fee
            </span>
          </div>

          {/* 3. Margin */}
          <div className="p-4 rounded-xl bg-slate-900 text-white border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-emerald-400 block uppercase tracking-wider">
                3. Margin (100%)
              </label>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800 font-mono">
                {bottomPrice > 0 ? `${Math.max(0, Math.round(((sellingPrice - bottomPrice) / bottomPrice) * 100))}% Markup` : ''}
              </span>
            </div>
            <div className="p-2.5 bg-slate-800/90 rounded-lg border border-slate-700 flex items-center justify-between">
              <span className="text-xs text-emerald-400 font-mono font-semibold">Rp</span>
              <span className="text-sm font-extrabold text-emerald-300 font-mono">
                {margin.toLocaleString('id-ID')}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block font-mono">
              Harga Jual − Harga Bottom
            </span>
          </div>
        </div>

        {margin <= 0 && (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-600" />
            <span>
              Harga Jual sama atau lebih rendah dari Harga Bottom (Margin Rp 0). Naikkan Harga Jual agar margin dan fee marketing/sales terbentuk.
            </span>
          </div>
        )}
      </div>

      {/* 2. HASIL FEE MARKETING DAN SALES LANGSUNG */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-teal-700" />
              Hasil Fee Marketing & Sales
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Rincian komisi yang langsung dihitung secara proporsional dari total margin.
            </p>
          </div>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold self-start sm:self-auto">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Kalkulasi Otomatis</span>
          </div>
        </div>

        {/* 2 Kartu Utama: Fee Marketing & Fee Sales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card: Fee Marketing (Pool) */}
          <div className="p-4 rounded-xl bg-teal-50/70 border-2 border-teal-300 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-700 text-white flex items-center justify-center font-bold">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-teal-950 block">Fee Marketing (Pool)</span>
                  <span className="text-[10px] text-teal-700">Alokasi pool marketing</span>
                </div>
              </div>
              <span className="px-2 py-0.5 bg-teal-100 text-teal-900 border border-teal-300 rounded text-xs font-bold font-mono">
                40% Margin
              </span>
            </div>

            <div className="p-3.5 bg-white rounded-lg border border-teal-200 flex items-baseline justify-between">
              <span className="text-xs text-slate-500 font-medium">Nominal Fee Marketing:</span>
              <span className="text-xl font-extrabold text-teal-950 font-mono">
                {formatRupiah(marketingPool.amount)}
              </span>
            </div>

            <div className="text-[11px] text-teal-800 bg-teal-100/50 p-2 rounded-lg font-mono flex items-center justify-between">
              <span>Rumus: {formatRupiah(margin)} × 40%</span>
              <span className="font-bold">= {formatRupiah(marketingPool.amount)}</span>
            </div>
          </div>

          {/* Card: Fee Sales Closing */}
          <div className="p-4 rounded-xl bg-amber-50/70 border-2 border-amber-300 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-amber-950 block">Fee Sales</span>
                  <span className="text-[10px] text-amber-700">Komisi sales closing</span>
                </div>
              </div>
              <span className="px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded text-xs font-bold font-mono">
                75% Pool (30% Margin)
              </span>
            </div>

            <div className="p-3.5 bg-white rounded-lg border border-amber-200 flex items-baseline justify-between">
              <span className="text-xs text-slate-500 font-medium">Nominal Fee Sales:</span>
              <span className="text-xl font-extrabold text-amber-950 font-mono">
                {formatRupiah(sales.amount)}
              </span>
            </div>

            <div className="text-[11px] text-amber-900 bg-amber-100/60 p-2 rounded-lg font-mono flex items-center justify-between">
              <span>Rumus: {formatRupiah(marketingPool.amount)} × 75%</span>
              <span className="font-bold">= {formatRupiah(sales.amount)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
