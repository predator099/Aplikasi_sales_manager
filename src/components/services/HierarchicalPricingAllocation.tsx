import React, { useEffect } from 'react';
import { PricingAllocation } from '../../types';
import { formatRupiah } from '../../utils/formatters';
import { calculateMarginAllocation } from '../../utils/pricingEngine';
import { useApp } from '../../context/AppContext';
import {
  Users,
  Briefcase,
  AlertCircle,
  CheckCircle2,
  Lock,
  Sparkles,
  Building,
  UserCheck,
} from 'lucide-react';

interface HierarchicalPricingAllocationProps {
  bottomPrice: number;
  sellingPrice: number;
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
  const { currentUser } = useApp();
  const isSales = currentUser.role === 'Sales';

  // Always calculate realtime based on fixed formula
  const calculated = calculateMarginAllocation(bottomPrice, sellingPrice);

  // Sync to parent when bottomPrice or sellingPrice changes
  useEffect(() => {
    onChangeAllocation(calculated);
  }, [bottomPrice, sellingPrice]);

  const { margin, kantor, marketingPool, sales, am } = calculated;

  const isBelowBottom = sellingPrice < bottomPrice;
  const isEqualBottom = sellingPrice === bottomPrice && bottomPrice > 0;
  const markupPercentage = bottomPrice > 0 ? Math.round(((sellingPrice - bottomPrice) / bottomPrice) * 100) : 0;
  const marginPercentage = sellingPrice > 0 ? Math.round((margin / sellingPrice) * 100) : 0;

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* 1. INPUT HARGA SECTION: HARGA BOTTOM (READ-ONLY) & HARGA JUAL (EDITABLE SALES) & MARGIN */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 text-xs font-bold flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
            <h3 className="text-sm font-bold text-slate-900">
              Perhitungan Harga Bottom, Harga Jual & Margin
            </h3>
          </div>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold self-start sm:self-auto">
            <Lock className="w-3.5 h-3.5 text-slate-500" />
            <span>Harga Bottom Hanya-Baca</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Harga Bottom (Read-Only) */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 block">
                Harga Bottom (Dasar)
              </label>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-600 bg-slate-200/80 px-1.5 py-0.5 rounded">
                <Lock className="w-3 h-3 text-slate-500" />
                Otomatis / Hanya Baca
              </span>
            </div>
            <div className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-mono font-semibold">Rp</span>
              <span className="text-base font-extrabold text-slate-800 font-mono">
                {bottomPrice.toLocaleString('id-ID')}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 block">
              Dihitung otomatis dari Master Pricing (Internet + Metro + IP)
            </span>
          </div>

          {/* Harga Jual (Input Manual oleh Sales) */}
          <div className="p-4 rounded-xl bg-teal-50/50 border-2 border-teal-500 space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-teal-950 block">
                Harga Jual (Penawaran Sales)
              </label>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-teal-800 bg-teal-100 px-1.5 py-0.5 rounded">
                {readOnly ? 'Layanan Tersimpan' : 'Input Manual Sales'}
              </span>
            </div>
            {onSellingPriceChange && !readOnly ? (
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-teal-700 font-mono">
                  Rp
                </span>
                <input
                  type="number"
                  min="0"
                  step="50000"
                  value={sellingPrice}
                  onChange={(e) => onSellingPriceChange(Math.max(0, Number(e.target.value) || 0))}
                  placeholder="0"
                  className="w-full pl-10 pr-3 py-2 text-sm font-bold font-mono border-2 border-teal-500 rounded-lg bg-white text-teal-950 focus:outline-hidden focus:ring-2 focus:ring-teal-600/30 shadow-xs"
                />
              </div>
            ) : (
              <div className="p-2.5 bg-white rounded-lg border border-teal-200 flex items-center justify-between">
                <span className="text-xs text-teal-700 font-mono font-semibold">Rp</span>
                <span className="text-base font-extrabold text-teal-900 font-mono">
                  {sellingPrice.toLocaleString('id-ID')}
                </span>
              </div>
            )}
            <span className="text-[10px] text-teal-800 block">
              Harga penawaran yang disepakati dengan customer
            </span>
          </div>

          {/* Margin (Read-Only) */}
          <div className={`p-4 rounded-xl border space-y-2 ${
            isBelowBottom
              ? 'bg-rose-50 border-rose-300 text-rose-950'
              : isEqualBottom
              ? 'bg-amber-50 border-amber-300 text-amber-950'
              : 'bg-slate-900 border-slate-800 text-white'
          }`}>
            <div className="flex items-center justify-between">
              <label className={`text-xs font-bold uppercase tracking-wider block ${
                isBelowBottom ? 'text-rose-800' : isEqualBottom ? 'text-amber-800' : 'text-emerald-400'
              }`}>
                Margin (Keuntungan)
              </label>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ${
                isBelowBottom
                  ? 'bg-rose-200 text-rose-900'
                  : isEqualBottom
                  ? 'bg-amber-200 text-amber-900'
                  : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
              }`}>
                {isBelowBottom ? 'Defisit' : `${markupPercentage}% Markup`}
              </span>
            </div>
            <div className={`p-2.5 rounded-lg border flex items-center justify-between ${
              isBelowBottom
                ? 'bg-white border-rose-200'
                : isEqualBottom
                ? 'bg-white border-amber-200'
                : 'bg-slate-800/90 border-slate-700'
            }`}>
              <span className={`text-xs font-mono font-semibold ${
                isBelowBottom ? 'text-rose-600' : isEqualBottom ? 'text-amber-600' : 'text-emerald-400'
              }`}>
                Rp
              </span>
              <span className={`text-base font-extrabold font-mono ${
                isBelowBottom ? 'text-rose-700' : isEqualBottom ? 'text-amber-700' : 'text-emerald-300'
              }`}>
                {(sellingPrice - bottomPrice).toLocaleString('id-ID')}
              </span>
            </div>
            <span className={`text-[10px] block font-mono ${
              isBelowBottom ? 'text-rose-700' : isEqualBottom ? 'text-amber-700' : 'text-slate-400'
            }`}>
              Rumus: Harga Jual − Harga Bottom
            </span>
          </div>
        </div>

        {/* Warning Alerts */}
        {isBelowBottom && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600 mt-0.5" />
            <div>
              <p className="font-bold">
                Peringatan: Harga Jual berada di bawah Harga Bottom!
              </p>
              <p className="text-[11px] text-rose-700 mt-0.5">
                Harga Jual ({formatRupiah(sellingPrice)}) lebih kecil dari Harga Bottom ({formatRupiah(bottomPrice)}). Margin bernilai defisit ({formatRupiah(sellingPrice - bottomPrice)}). Sesuai aturan perusahaan, <strong>tidak ada komisi atau pembagian fee yang dapat dicairkan</strong>.
              </p>
            </div>
          </div>
        )}

        {isEqualBottom && (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-amber-600 mt-0.5" />
            <div>
              <p className="font-bold">
                Perhatian: Harga Jual sama dengan Harga Bottom
              </p>
              <p className="text-[11px] text-amber-700 mt-0.5">
                Margin adalah Rp 0. Tidak ada pembagian fee atau komisi marketing/sales yang terbentuk.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 2. FORMULA PEMBAGIAN FEE PATEN (KANTOR 60%, POOL 40%, SALES 75% POOL, AM 25% POOL) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-teal-700" />
              Formula Pembagian Fee Paten Realtime
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Kantor = 60% Margin • Marketing Pool = 40% Margin (Sales 75% Pool : AM 25% Pool).
            </p>
          </div>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold self-start sm:self-auto">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Formula Dipatenkan (Fixed)</span>
          </div>
        </div>

        {/* 4 Cards: Kantor, Marketing Pool, Fee Sales, Fee AM */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Kantor (60% Margin) */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Building className="w-4 h-4 text-slate-600" />
                Fee Kantor
              </span>
              <span className="px-2 py-0.5 bg-slate-200 text-slate-800 rounded text-[10px] font-bold font-mono">
                60% Margin
              </span>
            </div>
            <div className="p-2.5 bg-white rounded-lg border border-slate-200">
              <span className="text-base font-extrabold text-slate-900 font-mono block">
                {formatRupiah(kantor.amount)}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 block font-mono">
              60% × {formatRupiah(margin)}
            </span>
          </div>

          {/* Card 2: Marketing Pool (40% Margin) */}
          <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-300 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-teal-950 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-teal-700" />
                Marketing Pool
              </span>
              <span className="px-2 py-0.5 bg-teal-100 text-teal-900 border border-teal-300 rounded text-[10px] font-bold font-mono">
                40% Margin
              </span>
            </div>
            <div className="p-2.5 bg-white rounded-lg border border-teal-200">
              <span className="text-base font-extrabold text-teal-950 font-mono block">
                {formatRupiah(marketingPool.amount)}
              </span>
            </div>
            <span className="text-[10px] text-teal-800 block font-mono">
              40% × {formatRupiah(margin)}
            </span>
          </div>

          {/* Card 3: Fee Sales (75% Pool = 30% Margin) */}
          <div className="p-4 rounded-xl bg-amber-50/70 border-2 border-amber-300 space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-amber-700" />
                Fee Sales Closing
              </span>
              <span className="px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded text-[10px] font-bold font-mono">
                75% Pool (30% Margin)
              </span>
            </div>
            <div className="p-2.5 bg-white rounded-lg border border-amber-200">
              <span className="text-base font-extrabold text-amber-950 font-mono block">
                {formatRupiah(sales.amount)}
              </span>
            </div>
            <span className="text-[10px] text-amber-800 block font-mono">
              75% × {formatRupiah(marketingPool.amount)}
            </span>
          </div>

          {/* Card 4: Fee AM (25% Pool = 10% Margin) */}
          <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-300 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-950 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-purple-700" />
                Fee Account Mgr (AM)
              </span>
              <span className="px-2 py-0.5 bg-purple-100 text-purple-900 border border-purple-300 rounded text-[10px] font-bold font-mono">
                25% Pool (10% Margin)
              </span>
            </div>
            <div className="p-2.5 bg-white rounded-lg border border-purple-200">
              <span className="text-base font-extrabold text-purple-950 font-mono block">
                {formatRupiah(am.amount)}
              </span>
            </div>
            <span className="text-[10px] text-purple-800 block font-mono">
              25% × {formatRupiah(marketingPool.amount)}
            </span>
          </div>
        </div>

        {/* Verification Status Bar */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-700 flex-shrink-0" />
            <span>
              Verifikasi Nol Selisih: Kantor ({formatRupiah(kantor.amount)}) + Marketing Pool ({formatRupiah(marketingPool.amount)}) = Total Margin ({formatRupiah(margin)}).
            </span>
          </div>
          <span className="text-[11px] font-mono font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 self-start sm:self-auto">
            100% Margin Teralokasi
          </span>
        </div>
      </div>
    </div>
  );
};
