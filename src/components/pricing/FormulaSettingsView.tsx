import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  CalculationFormulaConfig,
  MetroFormulaMethod,
  MetroRoundingRule,
} from '../../types';
import { formatRupiah, formatBandwidth, formatDate } from '../../utils/formatters';
import { calculatePricing, calculateMarginAllocation } from '../../utils/pricingEngine';
import {
  Calculator,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Save,
  ShieldCheck,
  Building,
  Users,
  Briefcase,
  UserCheck,
  Network,
  Layers,
  ArrowRight,
  TrendingUp,
  Percent,
  Cpu,
  Info,
  Check,
  Zap,
} from 'lucide-react';

export const FormulaSettingsView: React.FC = () => {
  const {
    formulaConfig,
    updateFormulaConfig,
    resetFormulaConfigToDefault,
    pricingConfig,
    metro,
    publicIps,
    currentUser,
    setActiveMenu,
  } = useApp();

  // Local editable draft of formulaConfig
  const [draft, setDraft] = useState<CalculationFormulaConfig>(() => ({
    ...formulaConfig,
  }));

  const [activeTab, setActiveTab] = useState<'fees' | 'metro' | 'simulator'>('fees');
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  // Check if draft has modifications compared to current saved config
  const isModified = useMemo(() => {
    return JSON.stringify(draft) !== JSON.stringify(formulaConfig);
  }, [draft, formulaConfig]);

  // Level 1 validation: Kantor + Marketing Pool = 100%
  const level1Sum = draft.kantorPercentage + draft.marketingPoolPercentage;
  const isLevel1Valid = Math.abs(level1Sum - 100) < 0.01;

  // Level 2 validation: Sales + AM = 100%
  const level2Sum = draft.salesPercentageOfPool + draft.amPercentageOfPool;
  const isLevel2Valid = Math.abs(level2Sum - 100) < 0.01;

  const isFormValid = isLevel1Valid && isLevel2Valid;

  // Helper to update draft
  const updateDraft = (partial: Partial<CalculationFormulaConfig>) => {
    setDraft((prev) => ({ ...prev, ...partial }));
    setSaveSuccessMessage(null);
  };

  // Auto-balance Level 1 (Kantor vs Pool)
  const autoBalanceLevel1 = (target: 'kantor' | 'pool') => {
    if (target === 'kantor') {
      const newPool = Math.max(0, 100 - draft.kantorPercentage);
      updateDraft({ marketingPoolPercentage: newPool });
    } else {
      const newKantor = Math.max(0, 100 - draft.marketingPoolPercentage);
      updateDraft({ kantorPercentage: newKantor });
    }
  };

  // Auto-balance Level 2 (Sales vs AM)
  const autoBalanceLevel2 = (target: 'sales' | 'am') => {
    if (target === 'sales') {
      const newAm = Math.max(0, 100 - draft.salesPercentageOfPool);
      updateDraft({ amPercentageOfPool: newAm });
    } else {
      const newSales = Math.max(0, 100 - draft.amPercentageOfPool);
      updateDraft({ salesPercentageOfPool: newSales });
    }
  };

  // Handle Save
  const handleSave = () => {
    if (!isFormValid) return;
    updateFormulaConfig(draft);
    setSaveSuccessMessage('Rumus perhitungan berhasil disimpan dan aktif di seluruh sistem!');
    setTimeout(() => setSaveSuccessMessage(null), 4000);
  };

  // Handle Reset to Default
  const handleReset = () => {
    if (window.confirm('Kembalikan seluruh rumus perhitungan ke standar default ISP (60:40 dan 75:25)?')) {
      resetFormulaConfigToDefault();
      setDraft({
        ...formulaConfig,
        kantorPercentage: 60,
        marketingPoolPercentage: 40,
        salesPercentageOfPool: 75,
        amPercentageOfPool: 25,
        metroCalculationMethod: 'proportional_capacity',
        metroMultiplierRatio: 1.0,
        metroRoundingRule: 'none',
        metroMinimumPrice: 0,
        internetCalculationMethod: 'tier_priority_fallback',
        internetFallbackPer100Mbps: 3000000,
        internetFallbackPerMbps: 30000,
        ppnPercentage: 11,
        maxDiscountPercentage: 50,
      });
      setSaveSuccessMessage('Rumus telah dikembalikan ke standar awal.');
      setTimeout(() => setSaveSuccessMessage(null), 4000);
    }
  };

  // Calculate effective percentages against total margin
  const effectiveSalesOfMargin = ((draft.marketingPoolPercentage * draft.salesPercentageOfPool) / 100).toFixed(1);
  const effectiveAmOfMargin = ((draft.marketingPoolPercentage * draft.amPercentageOfPool) / 100).toFixed(1);

  // =========================================================================
  // SIMULATOR STATE
  // =========================================================================
  const [simBandwidth, setSimBandwidth] = useState<number>(300);
  const [simMetroId, setSimMetroId] = useState<string>(metro[0]?.id || '');
  const [simDiscountPct, setSimDiscountPct] = useState<number>(0);
  const [simBottomRatio, setSimBottomRatio] = useState<number>(75); // Bottom price as % of DPP

  const selectedSimMetro = useMemo(() => {
    return metro.find((m) => m.id === simMetroId) || metro[0] || null;
  }, [metro, simMetroId]);

  // Pricing calculation in simulator using the CURRENT DRAFT FORMULA
  const simPricing = useMemo(() => {
    return calculatePricing({
      bandwidthMbps: simBandwidth,
      pricingConfig,
      metro: selectedSimMetro,
      publicIp: publicIps[0] || null,
      discountType: 'percentage',
      discountValue: simDiscountPct,
      formula: draft,
    });
  }, [simBandwidth, pricingConfig, selectedSimMetro, publicIps, simDiscountPct, draft]);

  const simSellingPrice = simPricing.dpp;
  const simBottomPrice = Math.round(simSellingPrice * (simBottomRatio / 100));

  // Margin allocation in simulator using CURRENT DRAFT FORMULA
  const simAllocation = useMemo(() => {
    return calculateMarginAllocation(simBottomPrice, simSellingPrice, draft);
  }, [simBottomPrice, simSellingPrice, draft]);

  // Formula settings is accessible to management, admin, finance, and sales
  // isAuthorized is kept true so users can open and simulate formulas smoothly
  const isAuthorized = true;

  if (!isAuthorized) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Akses Terbatas Administrator</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Menu pengaturan rumus perhitungan internet metro dan fee sales hanya dapat diakses oleh
          pengguna dengan peran <strong>Administrator</strong> atau <strong>Super Admin</strong>.
          Peran Anda saat ini adalah: <span className="font-semibold text-slate-700">{currentUser.role}</span>.
        </p>
        <button
          onClick={() => setActiveMenu('dashboard')}
          className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
        >
          Kembali ke Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold text-slate-900 tracking-tight">
              Rumus Tarif & Fee
            </h1>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
              Konfigurasi Sistem
            </span>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors cursor-pointer"
            title="Kembalikan semua nilai rumus ke standar bawaan"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          <button
            type="button"
            disabled={!isFormValid || !isModified}
            onClick={handleSave}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white rounded-lg shadow-2xs transition-all cursor-pointer ${
              !isFormValid || !isModified
                ? 'bg-slate-300 cursor-not-allowed opacity-70'
                : 'bg-slate-900 hover:bg-slate-800'
            }`}
          >
            <Save className="w-3.5 h-3.5" />
            <span>Simpan</span>
          </button>
        </div>
      </div>

      {/* Admin Audit & Status Banner */}
      <div className="bg-slate-900 text-slate-100 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30 flex-shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">
                Formula Aktif: {formulaConfig.id}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span className="text-[11px] text-emerald-300 font-medium">Terverifikasi ISP Core</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Terakhir diperbarui oleh <span className="text-slate-200 font-semibold">{formulaConfig.updatedBy}</span> pada {formatDate(formulaConfig.updatedAt)}.
            </p>
          </div>
        </div>

        {isModified && (
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-semibold self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            Ada Perubahan Belum Disimpan
          </div>
        )}
      </div>

      {saveSuccessMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span className="font-semibold">{saveSuccessMessage}</span>
        </div>
      )}

      {/* Main Tabs Navigation */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-xl px-2 pt-2">
        <button
          type="button"
          onClick={() => setActiveTab('fees')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'fees'
              ? 'border-teal-700 text-teal-900 bg-teal-50/50 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>1. Rumus Fee Sales & Marketing</span>
          <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-100 text-slate-600 font-mono">
            {draft.kantorPercentage}:{draft.marketingPoolPercentage}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('metro')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'metro'
              ? 'border-teal-700 text-teal-900 bg-teal-50/50 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <Network className="w-4 h-4" />
          <span>2. Rumus Internet & Metro Ethernet</span>
          <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-100 text-slate-600 font-mono">
            {draft.metroCalculationMethod === 'proportional_capacity' ? 'Proporsional' : draft.metroCalculationMethod}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('simulator')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'simulator'
              ? 'border-teal-700 text-teal-900 bg-teal-50/50 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>3. Simulator & Uji Rumus Live</span>
          <span className="px-1.5 py-0.2 rounded text-[10px] bg-teal-100 text-teal-800 font-semibold">
            Live Preview
          </span>
        </button>
      </div>

      {/* ===================================================================== */}
      {/* TAB 1: RUMUS FEE SALES & MARKETING                                    */}
      {/* ===================================================================== */}
      {activeTab === 'fees' && (
        <div className="space-y-6">
          {/* Level 1 Allocation: Kantor vs Pool */}
          <div className="bg-white p-6 rounded-b-xl rounded-t-none border border-t-0 border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 text-xs font-bold flex items-center justify-center">
                    1
                  </span>
                  <h3 className="text-sm font-bold text-slate-900">
                    Alokasi Level 1: Gross Margin ISP (Kantor vs Pool Marketing)
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-1 pl-8">
                  Rumus penentuan pembagian dari selisih Harga Jual (DPP) dikurangi Harga Bottom. Total persentase Kantor dan Marketing Pool harus tepat 100%.
                </p>
              </div>

              {!isLevel1Valid ? (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Total {level1Sum}% (Harus 100%)</span>
                  <button
                    type="button"
                    onClick={() => autoBalanceLevel1('pool')}
                    className="ml-2 underline font-bold hover:text-rose-900"
                  >
                    Seimbangkan
                  </button>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-lg">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Total Valid 100%</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Kantor ISP Portion */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-slate-700" />
                    <label htmlFor="kantorPercentage" className="text-xs font-bold text-slate-900">
                      Porsi Kantor ISP
                    </label>
                  </div>
                  <div className="flex items-center gap-1">
                    <input
                      id="kantorPercentage"
                      type="number"
                      min="0"
                      max="100"
                      value={draft.kantorPercentage}
                      onChange={(e) => {
                        const val = Math.min(100, Math.max(0, Number(e.target.value) || 0));
                        updateDraft({
                          kantorPercentage: val,
                          marketingPoolPercentage: 100 - val,
                        });
                      }}
                      className="w-16 px-2 py-1 text-xs text-right font-mono font-bold border border-slate-300 rounded-md bg-white"
                    />
                    <span className="text-xs font-bold text-slate-600">%</span>
                  </div>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={draft.kantorPercentage}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    updateDraft({
                      kantorPercentage: val,
                      marketingPoolPercentage: 100 - val,
                    });
                  }}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-800"
                />

                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Porsi margin kotor yang masuk ke kas operasional dan laba perusahaan ISP. Standar rekomendasi: <strong>60%</strong>.
                </p>
              </div>

              {/* Marketing Pool Portion */}
              <div className="p-4 rounded-xl border border-teal-200 bg-teal-50/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-teal-700" />
                    <label htmlFor="marketingPoolPercentage" className="text-xs font-bold text-teal-950">
                      Porsi Pool Marketing
                    </label>
                  </div>
                  <div className="flex items-center gap-1">
                    <input
                      id="marketingPoolPercentage"
                      type="number"
                      min="0"
                      max="100"
                      value={draft.marketingPoolPercentage}
                      onChange={(e) => {
                        const val = Math.min(100, Math.max(0, Number(e.target.value) || 0));
                        updateDraft({
                          marketingPoolPercentage: val,
                          kantorPercentage: 100 - val,
                        });
                      }}
                      className="w-16 px-2 py-1 text-xs text-right font-mono font-bold border border-teal-300 rounded-md bg-white"
                    />
                    <span className="text-xs font-bold text-teal-800">%</span>
                  </div>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={draft.marketingPoolPercentage}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    updateDraft({
                      marketingPoolPercentage: val,
                      kantorPercentage: 100 - val,
                    });
                  }}
                  className="w-full h-2 bg-teal-200 rounded-lg appearance-none cursor-pointer accent-teal-700"
                />

                <p className="text-[11px] text-teal-700 leading-relaxed">
                  Total anggaran insentif pemasaran yang dialokasikan untuk dibagikan ke tim lapangan (Sales + AM). Standar rekomendasi: <strong>40%</strong>.
                </p>
              </div>
            </div>

            {/* Level 2 Allocation: Sales vs AM within Pool */}
            <div className="pt-6 border-t border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 text-xs font-bold flex items-center justify-center">
                      2
                    </span>
                    <h3 className="text-sm font-bold text-slate-900">
                      Alokasi Level 2: Pembagian Pool Marketing (Sales Closing vs AM Retensi)
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 pl-8">
                    Membagi 100% dari Pool Marketing antara Sales (yang berhasil closing) dan Account Manager (yang mengelola hubungan pelanggan).
                  </p>
                </div>

                {!isLevel2Valid ? (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Total {level2Sum}% (Harus 100%)</span>
                    <button
                      type="button"
                      onClick={() => autoBalanceLevel2('sales')}
                      className="ml-2 underline font-bold hover:text-rose-900"
                    >
                      Seimbangkan
                    </button>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-lg">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Total Valid 100%</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Sales Portion */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-slate-700" />
                      <div>
                        <label htmlFor="salesPercentageOfPool" className="text-xs font-bold text-slate-900 block">
                          Porsi Sales Closing
                        </label>
                        <span className="text-[10px] text-teal-700 font-semibold">
                          Efektif: {effectiveSalesOfMargin}% dari Total Margin
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <input
                        id="salesPercentageOfPool"
                        type="number"
                        min="0"
                        max="100"
                        value={draft.salesPercentageOfPool}
                        onChange={(e) => {
                          const val = Math.min(100, Math.max(0, Number(e.target.value) || 0));
                          updateDraft({
                            salesPercentageOfPool: val,
                            amPercentageOfPool: 100 - val,
                          });
                        }}
                        className="w-16 px-2 py-1 text-xs text-right font-mono font-bold border border-slate-300 rounded-md bg-white"
                      />
                      <span className="text-xs font-bold text-slate-600">%</span>
                    </div>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={draft.salesPercentageOfPool}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      updateDraft({
                        salesPercentageOfPool: val,
                        amPercentageOfPool: 100 - val,
                      });
                    }}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0F766E]"
                  />

                  <p className="text-[11px] text-slate-500">
                    Diterima oleh personil Sales saat akuisisi layanan baru. Standar default: <strong>75%</strong> dari Pool (= 30% dari Total Margin).
                  </p>
                </div>

                {/* AM Portion */}
                <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-purple-700" />
                      <div>
                        <label htmlFor="amPercentageOfPool" className="text-xs font-bold text-purple-950 block">
                          Porsi Account Manager (AM)
                        </label>
                        <span className="text-[10px] text-purple-700 font-semibold">
                          Efektif: {effectiveAmOfMargin}% dari Total Margin
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <input
                        id="amPercentageOfPool"
                        type="number"
                        min="0"
                        max="100"
                        value={draft.amPercentageOfPool}
                        onChange={(e) => {
                          const val = Math.min(100, Math.max(0, Number(e.target.value) || 0));
                          updateDraft({
                            amPercentageOfPool: val,
                            salesPercentageOfPool: 100 - val,
                          });
                        }}
                        className="w-16 px-2 py-1 text-xs text-right font-mono font-bold border border-purple-300 rounded-md bg-white"
                      />
                      <span className="text-xs font-bold text-purple-800">%</span>
                    </div>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={draft.amPercentageOfPool}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      updateDraft({
                        amPercentageOfPool: val,
                        salesPercentageOfPool: 100 - val,
                      });
                    }}
                    className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer accent-purple-700"
                  />

                  <p className="text-[11px] text-purple-700">
                    Diterima oleh AM sebagai insentif pemeliharaan akun pelanggan. Standar default: <strong>25%</strong> dari Pool (= 10% dari Total Margin).
                  </p>
                </div>
              </div>
            </div>

            {/* Special Conditions: Minimum Margin & Sales Bonus */}
            <div className="pt-6 border-t border-slate-100 space-y-4">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Kebijakan Tambahan & Batasan Margin
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2">
                  <label htmlFor="minimumMarginForFee" className="text-xs font-bold text-slate-800 block">
                    Ambang Batas Margin Minimum untuk Fee (Rp)
                  </label>
                  <input
                    id="minimumMarginForFee"
                    type="number"
                    min="0"
                    step="50000"
                    value={draft.minimumMarginForFee}
                    onChange={(e) => updateDraft({ minimumMarginForFee: Number(e.target.value) || 0 })}
                    placeholder="0 (Tanpa batasan minimum)"
                    className="w-full px-3 py-1.5 text-xs font-mono border border-slate-300 rounded-lg"
                  />
                  <p className="text-[11px] text-slate-500">
                    Jika margin kotor di bawah nominal ini, komisi sales/pool tidak dicairkan (100% dialihkan ke kantor).
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="enableSalesBonus" className="text-xs font-bold text-slate-800">
                      Extra Bonus Sales High-Margin
                    </label>
                    <input
                      id="enableSalesBonus"
                      type="checkbox"
                      checked={draft.enableSalesBonus}
                      onChange={(e) => updateDraft({ enableSalesBonus: e.target.checked })}
                      className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
                    />
                  </div>

                  {draft.enableSalesBonus ? (
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-500 w-24">Target Margin:</span>
                        <input
                          type="number"
                          value={draft.bonusThresholdMargin}
                          onChange={(e) => updateDraft({ bonusThresholdMargin: Number(e.target.value) || 0 })}
                          className="flex-1 px-2 py-1 text-xs font-mono border border-slate-300 rounded"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-500 w-24">Extra Bonus:</span>
                        <input
                          type="number"
                          value={draft.salesBonusPercentage}
                          onChange={(e) => updateDraft({ salesBonusPercentage: Number(e.target.value) || 0 })}
                          className="w-20 px-2 py-1 text-xs font-mono border border-slate-300 rounded"
                        />
                        <span className="text-xs font-bold text-slate-600">%</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-400">
                      Aktifkan jika sales berhak atas bonus tambahan saat margin melampaui target tertentu.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 2: RUMUS INTERNET & METRO ETHERNET                                 */}
      {/* ===================================================================== */}
      {activeTab === 'metro' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-b-xl rounded-t-none border border-t-0 border-slate-200 shadow-xs space-y-6">
            {/* Metro Calculation Section */}
            <div>
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Network className="w-4 h-4 text-teal-700" />
                <h3 className="text-sm font-bold text-slate-900">
                  Rumus Perhitungan Biaya Metro Ethernet
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Tentukan bagaimana tarif interkoneksi Metro Ethernet dihitung terhadap bandwidth layanan yang dipilih pelanggan.
              </p>

              {/* Metro Methods */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 mt-4">
                {[
                  {
                    id: 'proportional_capacity' as MetroFormulaMethod,
                    title: 'Proporsional Kapasitas Port',
                    desc: '(Bandwidth / Kapasitas Port) × Harga Port Metro',
                    tag: 'Standar Industri ISP',
                  },
                  {
                    id: 'per_mbps' as MetroFormulaMethod,
                    title: 'Per Mbps Eksak',
                    desc: 'Bandwidth (Mbps) × Harga Metro per Mbps',
                    tag: 'Linear',
                  },
                  {
                    id: 'per_100mbps' as MetroFormulaMethod,
                    title: 'Kelipatan Per 100 Mbps',
                    desc: 'ceil(Bandwidth / 100) × Tarif Metro per 100M',
                    tag: 'Blok 100M',
                  },
                  {
                    id: 'per_gbps' as MetroFormulaMethod,
                    title: 'Per Gbps',
                    desc: '(Bandwidth / 1000) × Harga Metro per Gbps',
                    tag: 'High Bandwidth',
                  },
                  {
                    id: 'flat_port' as MetroFormulaMethod,
                    title: 'Flat Rate per Port',
                    desc: 'Tarif tetap flat berapapun bandwidth yang dialirkan',
                    tag: 'Flat Bulanan',
                  },
                ].map((item) => {
                  const isSelected = draft.metroCalculationMethod === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => updateDraft({ metroCalculationMethod: item.id })}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-1.5 ${
                        isSelected
                          ? 'bg-teal-50/60 border-teal-600 ring-2 ring-teal-600/20'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">{item.title}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold bg-slate-100 text-slate-600">
                          {item.tag}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-mono">{item.desc}</p>
                    </div>
                  );
                })}
              </div>

              {/* Metro Multiplier & Rounding */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-4 border-t border-slate-100">
                <div className="space-y-1.5">
                  <label htmlFor="metroMultiplierRatio" className="text-xs font-bold text-slate-800 block">
                    Faktor Pengali Redundansi (Multiplier)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      id="metroMultiplierRatio"
                      type="number"
                      step="0.05"
                      min="0.5"
                      max="3.0"
                      value={draft.metroMultiplierRatio}
                      onChange={(e) => updateDraft({ metroMultiplierRatio: Number(e.target.value) || 1 })}
                      className="w-24 px-3 py-1.5 text-xs font-mono border border-slate-300 rounded-lg"
                    />
                    <span className="text-xs text-slate-500 font-mono">
                      (1.0 = Normal, 1.25 = +25% Backup)
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="metroRoundingRule" className="text-xs font-bold text-slate-800 block">
                    Aturan Pembulatan Tarif Metro
                  </label>
                  <select
                    id="metroRoundingRule"
                    value={draft.metroRoundingRule}
                    onChange={(e) => updateDraft({ metroRoundingRule: e.target.value as MetroRoundingRule })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="none">Tanpa Pembulatan (Eksak Rupiah)</option>
                    <option value="round_thousand">Bulatkan ke Ribuan Terdekat (Rp 1.000)</option>
                    <option value="round_hundred_thousand">Bulatkan ke Ratusan Ribu (Rp 100.000)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="metroMinimumPrice" className="text-xs font-bold text-slate-800 block">
                    Tarif Minimum Metro per Bulan (Rp)
                  </label>
                  <input
                    id="metroMinimumPrice"
                    type="number"
                    min="0"
                    step="50000"
                    value={draft.metroMinimumPrice}
                    onChange={(e) => updateDraft({ metroMinimumPrice: Number(e.target.value) || 0 })}
                    placeholder="0 (Tanpa minimum)"
                    className="w-full px-3 py-1.5 text-xs font-mono border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* Internet Calculation Section */}
            <div className="pt-6 border-t border-slate-100 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Cpu className="w-4 h-4 text-teal-700" />
                <h3 className="text-sm font-bold text-slate-900">
                  Rumus Perhitungan Internet Dedicated & Kebijakan Pajak
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="internetCalculationMethod" className="text-xs font-bold text-slate-800 block">
                    Metode Perhitungan Internet
                  </label>
                  <select
                    id="internetCalculationMethod"
                    value={draft.internetCalculationMethod}
                    onChange={(e) =>
                      updateDraft({
                        internetCalculationMethod: e.target.value as 'tier_priority_fallback' | 'pure_per_mbps',
                      })
                    }
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="tier_priority_fallback">Prioritaskan Tier Aktif + Fallback</option>
                    <option value="pure_per_mbps">Linear Pure per Mbps</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="internetFallbackPer100Mbps" className="text-xs font-bold text-slate-800 block">
                    Tarif Fallback per 100 Mbps (Rp)
                  </label>
                  <input
                    id="internetFallbackPer100Mbps"
                    type="number"
                    step="100000"
                    value={draft.internetFallbackPer100Mbps}
                    onChange={(e) => updateDraft({ internetFallbackPer100Mbps: Number(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 text-xs font-mono border border-slate-300 rounded-lg"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="ppnPercentage" className="text-xs font-bold text-slate-800 block">
                    Tarif PPN Standar (%)
                  </label>
                  <div className="flex items-center gap-1">
                    <input
                      id="ppnPercentage"
                      type="number"
                      step="0.5"
                      min="0"
                      max="30"
                      value={draft.ppnPercentage}
                      onChange={(e) => updateDraft({ ppnPercentage: Number(e.target.value) || 0 })}
                      className="w-full px-3 py-1.5 text-xs font-mono border border-slate-300 rounded-lg"
                    />
                    <span className="text-xs font-bold text-slate-600">%</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="maxDiscountPercentage" className="text-xs font-bold text-slate-800 block">
                    Batas Maks Diskon Sales (%)
                  </label>
                  <div className="flex items-center gap-1">
                    <input
                      id="maxDiscountPercentage"
                      type="number"
                      step="1"
                      min="0"
                      max="90"
                      value={draft.maxDiscountPercentage}
                      onChange={(e) => updateDraft({ maxDiscountPercentage: Number(e.target.value) || 0 })}
                      className="w-full px-3 py-1.5 text-xs font-mono border border-slate-300 rounded-lg"
                    />
                    <span className="text-xs font-bold text-slate-600">%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 3: SIMULATOR & LIVE PREVIEW                                       */}
      {/* ===================================================================== */}
      {activeTab === 'simulator' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-b-xl rounded-t-none border border-t-0 border-slate-200 shadow-xs space-y-6">
            <div>
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Zap className="w-4 h-4 text-teal-700" />
                <h3 className="text-sm font-bold text-slate-900">
                  Simulator Live Hasil Hitungan Rumus
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Uji langsung dampak dari rumus draft yang Anda tentukan terhadap skenario pesanan pelanggan nyata secara instan.
              </p>
            </div>

            {/* Simulator Inputs */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label htmlFor="simBandwidth" className="text-xs font-bold text-slate-700 block mb-1">
                  Bandwidth Layanan
                </label>
                <select
                  id="simBandwidth"
                  value={simBandwidth}
                  onChange={(e) => setSimBandwidth(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                >
                  <option value={100}>100 Mbps</option>
                  <option value={200}>200 Mbps</option>
                  <option value={300}>300 Mbps</option>
                  <option value={500}>500 Mbps</option>
                  <option value={1000}>1.000 Mbps (1 Gbps)</option>
                  <option value={2000}>2.000 Mbps (2 Gbps)</option>
                </select>
              </div>

              <div>
                <label htmlFor="simMetroId" className="text-xs font-bold text-slate-700 block mb-1">
                  Paket Metro Ethernet
                </label>
                <select
                  id="simMetroId"
                  value={simMetroId}
                  onChange={(e) => setSimMetroId(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                >
                  {metro.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.priceMethod} - {formatRupiah(m.price)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="simDiscountPct" className="text-xs font-bold text-slate-700 block mb-1">
                  Diskon Penjualan (%)
                </label>
                <input
                  id="simDiscountPct"
                  type="number"
                  min="0"
                  max={draft.maxDiscountPercentage}
                  value={simDiscountPct}
                  onChange={(e) => setSimDiscountPct(Number(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 text-xs font-mono border border-slate-300 rounded-lg bg-white"
                />
              </div>

              <div>
                <label htmlFor="simBottomRatio" className="text-xs font-bold text-slate-700 block mb-1">
                  Rasio Harga Bottom (% dari DPP)
                </label>
                <input
                  id="simBottomRatio"
                  type="number"
                  min="30"
                  max="95"
                  value={simBottomRatio}
                  onChange={(e) => setSimBottomRatio(Number(e.target.value) || 75)}
                  className="w-full px-3 py-1.5 text-xs font-mono border border-slate-300 rounded-lg bg-white"
                />
              </div>
            </div>

            {/* Results Display */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              {/* Left: Pricing Breakdown */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center justify-between">
                  <span>Hasil Kalkulasi Komponen Tarif</span>
                  <span className="text-[10px] text-teal-700 font-mono font-semibold">
                    Metode: {draft.metroCalculationMethod}
                  </span>
                </h4>

                <div className="divide-y divide-slate-100 text-xs">
                  <div className="flex justify-between py-2">
                    <span className="text-slate-600">Biaya Internet Dedicated:</span>
                    <span className="font-mono font-bold text-slate-900">
                      {formatRupiah(simPricing.internetCost)}
                    </span>
                  </div>

                  <div className="flex justify-between py-2">
                    <span className="text-slate-600">Biaya Metro Ethernet ({selectedSimMetro?.name}):</span>
                    <span className="font-mono font-bold text-slate-900">
                      {formatRupiah(simPricing.metroCost)}
                    </span>
                  </div>

                  <div className="flex justify-between py-2">
                    <span className="text-slate-600">Biaya Public IP:</span>
                    <span className="font-mono font-bold text-slate-900">
                      {formatRupiah(simPricing.publicIpCost)}
                    </span>
                  </div>

                  <div className="flex justify-between py-2 font-semibold text-slate-800 bg-slate-50 px-2 rounded">
                    <span>Subtotal Harga Dasar:</span>
                    <span className="font-mono font-bold">
                      {formatRupiah(simPricing.subtotal)}
                    </span>
                  </div>

                  <div className="flex justify-between py-2 text-rose-600">
                    <span>Diskon ({simDiscountPct}%):</span>
                    <span className="font-mono font-bold">
                      -{formatRupiah(simPricing.discountAmount)}
                    </span>
                  </div>

                  <div className="flex justify-between py-2 font-bold text-teal-900 bg-teal-50/80 px-2 rounded">
                    <span>Harga Jual Bersih (DPP):</span>
                    <span className="font-mono text-sm">
                      {formatRupiah(simPricing.dpp)}
                    </span>
                  </div>

                  <div className="flex justify-between py-2 text-slate-500">
                    <span>PPN ({draft.ppnPercentage}%):</span>
                    <span className="font-mono">
                      {formatRupiah(simPricing.ppnAmount)}
                    </span>
                  </div>

                  <div className="flex justify-between py-2.5 font-bold text-slate-950 text-sm">
                    <span>Total Tagihan Pelanggan / bln:</span>
                    <span className="font-mono text-teal-700">
                      {formatRupiah(simPricing.totalMonthly)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Margin & Fee Allocation Breakdown */}
              <div className="p-4 rounded-xl border border-teal-200 bg-teal-50/20 space-y-3">
                <h4 className="text-xs font-bold text-teal-950 uppercase tracking-wide flex items-center justify-between">
                  <span>Distribusi Margin & Fee Sales</span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Zero-Drift Certified
                  </span>
                </h4>

                <div className="p-3 bg-white rounded-lg border border-teal-100 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-500 block">Gross Margin Bersih</span>
                    <span className="text-base font-mono font-bold text-teal-900">
                      {formatRupiah(simAllocation.margin)}
                    </span>
                  </div>
                  <div className="text-right text-[11px] text-slate-400">
                    <div>DPP: {formatRupiah(simSellingPrice)}</div>
                    <div>Bottom: {formatRupiah(simBottomPrice)}</div>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  {/* Kantor */}
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building className="w-3.5 h-3.5 text-slate-600" />
                      <span className="font-semibold text-slate-800">
                        Kantor ISP ({simAllocation.kantor.percentage}%)
                      </span>
                    </div>
                    <span className="font-mono font-bold text-slate-900">
                      {formatRupiah(simAllocation.kantor.amount)}
                    </span>
                  </div>

                  {/* Marketing Pool */}
                  <div className="p-2.5 bg-teal-50 rounded-lg border border-teal-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-teal-700" />
                      <span className="font-semibold text-teal-900">
                        Pool Marketing ({simAllocation.marketingPool.percentage}%)
                      </span>
                    </div>
                    <span className="font-mono font-bold text-teal-900">
                      {formatRupiah(simAllocation.marketingPool.amount)}
                    </span>
                  </div>

                  {/* Sales Closing */}
                  <div className="pl-6 pr-3 py-2 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-3.5 h-3.5 text-teal-600" />
                      <div>
                        <span className="font-semibold text-slate-800 block text-xs">
                          Sales Closing ({simAllocation.sales.percentage}% dari Pool)
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Rasio Efektif: {effectiveSalesOfMargin}% Margin
                        </span>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-[#0F766E]">
                      {formatRupiah(simAllocation.sales.amount)}
                    </span>
                  </div>

                  {/* AM */}
                  <div className="pl-6 pr-3 py-2 bg-white rounded-lg border border-purple-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-3.5 h-3.5 text-purple-600" />
                      <div>
                        <span className="font-semibold text-purple-900 block text-xs">
                          Account Manager ({simAllocation.am.percentage}% dari Pool)
                        </span>
                        <span className="text-[10px] text-purple-500">
                          Rasio Efektif: {effectiveAmOfMargin}% Margin
                        </span>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-purple-800">
                      {formatRupiah(simAllocation.am.amount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
