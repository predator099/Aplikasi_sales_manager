import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  CalculationFormulaConfig,
  MetroFormulaMethod,
  MetroRoundingRule,
  UserFeeRate,
} from '../../types';
import { formatRupiah } from '../../utils/formatters';
import { calculatePricing, calculateMarginAllocation } from '../../utils/pricingEngine';
import {
  RotateCcw,
  Save,
  Building,
  Users,
  Briefcase,
  UserCheck,
  Network,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  UserPlus,
  X,
  Check,
} from 'lucide-react';

export const FormulaSettingsView: React.FC = () => {
  const {
    formulaConfig,
    updateFormulaConfig,
    resetFormulaConfigToDefault,
    pricingConfig,
    metro,
    publicIps,
    users,
  } = useApp();

  // Local editable draft of formulaConfig
  const [draft, setDraft] = useState<CalculationFormulaConfig>(() => ({
    ...formulaConfig,
    userFeeRates: formulaConfig.userFeeRates ? [...formulaConfig.userFeeRates] : [],
  }));

  const [activeTab, setActiveTab] = useState<'fees' | 'metro' | 'simulator'>('fees');
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  // Per-User Custom Fee Rate Form State
  const [isAddingUserRate, setIsAddingUserRate] = useState<boolean>(false);
  const [newUserId, setNewUserId] = useState<string>('');
  const [newUserName, setNewUserName] = useState<string>('');
  const [newUserRole, setNewUserRole] = useState<'Sales' | 'Marketing' | 'AM' | 'Staff'>('Sales');
  const [newUserPct, setNewUserPct] = useState<number>(80);
  const [newUserNotes, setNewUserNotes] = useState<string>('');

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
    setSaveSuccessMessage('Perubahan rumus perhitungan berhasil disimpan.');
    setTimeout(() => setSaveSuccessMessage(null), 3500);
  };

  // Handle Reset to Default
  const handleReset = () => {
    if (window.confirm('Kembalikan seluruh rumus perhitungan ke konfigurasi standar bawaan?')) {
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
        userFeeRates: [
          {
            userId: 'USR-001',
            userName: 'Ahmad Fauzi',
            userRole: 'Sales',
            customPercentage: 80,
            enabled: true,
            notes: 'Senior Sales Executive - Top Performer',
          },
          {
            userId: 'USR-004',
            userName: 'Rina Kusuma',
            userRole: 'Marketing',
            customPercentage: 75,
            enabled: true,
            notes: 'Senior Marketing Lead',
          },
          {
            userId: 'USR-006',
            userName: 'Dian Permata',
            userRole: 'AM',
            customPercentage: 30,
            enabled: true,
            notes: 'Key Account Manager',
          },
          {
            userId: 'USR-007',
            userName: 'Budi Hartono',
            userRole: 'Sales',
            customPercentage: 70,
            enabled: true,
            notes: 'Junior Sales Representative',
          },
        ],
      });
      setSaveSuccessMessage('Rumus telah dikembalikan ke standar bawaan.');
      setTimeout(() => setSaveSuccessMessage(null), 3500);
    }
  };

  // Handlers for User Fee Overrides
  const handleAddUserRate = () => {
    if (!newUserName.trim()) return;
    const newRate: UserFeeRate = {
      userId: newUserId || `USR-CUSTOM-${Date.now().toString().slice(-4)}`,
      userName: newUserName.trim(),
      userRole: newUserRole,
      customPercentage: Number(newUserPct) || 75,
      enabled: true,
      notes: newUserNotes.trim() || undefined,
    };
    const currentRates = draft.userFeeRates || [];
    const updatedRates = [
      ...currentRates.filter(
        (u) =>
          u.userId !== newRate.userId &&
          u.userName.toLowerCase() !== newRate.userName.toLowerCase()
      ),
      newRate,
    ];
    updateDraft({ userFeeRates: updatedRates });
    setIsAddingUserRate(false);
    setNewUserId('');
    setNewUserName('');
    setNewUserRole('Sales');
    setNewUserPct(80);
    setNewUserNotes('');
  };

  const handleUpdateUserRate = (index: number, partial: Partial<UserFeeRate>) => {
    const list = [...(draft.userFeeRates || [])];
    if (list[index]) {
      list[index] = { ...list[index], ...partial };
      updateDraft({ userFeeRates: list });
    }
  };

  const handleDeleteUserRate = (index: number) => {
    const list = [...(draft.userFeeRates || [])];
    list.splice(index, 1);
    updateDraft({ userFeeRates: list });
  };

  // Effective percentages of gross margin
  const effectiveSalesOfMargin = ((draft.marketingPoolPercentage * draft.salesPercentageOfPool) / 100).toFixed(1);
  const effectiveAmOfMargin = ((draft.marketingPoolPercentage * draft.amPercentageOfPool) / 100).toFixed(1);

  // =========================================================================
  // SIMULATOR STATE
  // =========================================================================
  const [simBandwidth, setSimBandwidth] = useState<number>(300);
  const [simMetroId, setSimMetroId] = useState<string>(metro[0]?.id || '');
  const [simDiscountPct, setSimDiscountPct] = useState<number>(0);
  const [simBottomRatio, setSimBottomRatio] = useState<number>(75);
  const [simTargetUser, setSimTargetUser] = useState<string>('');

  const selectedSimMetro = useMemo(() => {
    return metro.find((m) => m.id === simMetroId) || metro[0] || null;
  }, [metro, simMetroId]);

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

  const simAllocation = useMemo(() => {
    return calculateMarginAllocation(simBottomPrice, simSellingPrice, draft, simTargetUser || undefined);
  }, [simBottomPrice, simSellingPrice, draft, simTargetUser]);

  const isTargetUserCustom = Boolean(
    simTargetUser &&
    draft.userFeeRates?.some((u) => u.enabled && (u.userId === simTargetUser || u.userName === simTargetUser))
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          Rumus Tarif & Fee
        </h1>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset Standar</span>
          </button>

          <button
            type="button"
            disabled={!isFormValid || !isModified}
            onClick={handleSave}
            className={`inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              !isFormValid || !isModified
                ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                : 'bg-teal-700 hover:bg-teal-800 text-white'
            }`}
          >
            <Save className="w-3.5 h-3.5" />
            <span>Simpan Perubahan</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {saveSuccessMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span className="font-medium">{saveSuccessMessage}</span>
        </div>
      )}

      {/* Clean Segmented Tabs */}
      <div className="flex border-b border-slate-200 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('fees')}
          className={`flex items-center gap-2 pb-3 px-4 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'fees'
              ? 'border-teal-700 text-teal-800 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Alokasi Fee Margin</span>
          <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
            {draft.kantorPercentage}:{draft.marketingPoolPercentage}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('metro')}
          className={`flex items-center gap-2 pb-3 px-4 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'metro'
              ? 'border-teal-700 text-teal-800 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Network className="w-4 h-4" />
          <span>Tarif Metro & Internet</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('simulator')}
          className={`flex items-center gap-2 pb-3 px-4 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'simulator'
              ? 'border-teal-700 text-teal-800 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Simulator Live</span>
        </button>
      </div>

      {/* ===================================================================== */}
      {/* TAB 1: ALOKASI FEE MARGIN                                             */}
      {/* ===================================================================== */}
      {activeTab === 'fees' && (
        <div className="space-y-6">
          {/* Main Card: Margin & Pool Splits */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-6">
            {/* Level 1: Kantor vs Pool */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-900">
                  1. Alokasi Gross Margin: Kantor ISP vs Pool Marketing
                </span>
                {!isLevel1Valid ? (
                  <div className="flex items-center gap-1.5 text-rose-600 font-medium text-[11px]">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Total {level1Sum}% (Harus 100%)</span>
                    <button
                      type="button"
                      onClick={() => autoBalanceLevel1('pool')}
                      className="underline font-bold hover:text-rose-800 cursor-pointer ml-1"
                    >
                      Seimbangkan
                    </button>
                  </div>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700">
                    <Check className="w-3.5 h-3.5" />
                    100% Seimbang
                  </span>
                )}
              </div>

              {/* Progress Bar */}
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
                <div
                  style={{ width: `${Math.min(100, draft.kantorPercentage)}%` }}
                  className="bg-slate-800 transition-all duration-150"
                />
                <div
                  style={{ width: `${Math.min(100, draft.marketingPoolPercentage)}%` }}
                  className="bg-teal-600 transition-all duration-150"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {/* Kantor Box */}
                <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-slate-700" />
                      <label htmlFor="kantorPercentage" className="text-xs font-semibold text-slate-800">
                        Kantor ISP
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
                        className="w-16 px-2 py-1 text-xs text-right font-mono font-bold border border-slate-300 rounded bg-white"
                      />
                      <span className="text-xs font-bold text-slate-500">%</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={draft.kantorPercentage}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      updateDraft({
                        kantorPercentage: val,
                        marketingPoolPercentage: 100 - val,
                      });
                    }}
                    className="w-full h-1.5 bg-slate-200 rounded appearance-none cursor-pointer accent-slate-800"
                  />
                </div>

                {/* Pool Marketing Box */}
                <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-teal-700" />
                      <label htmlFor="marketingPoolPercentage" className="text-xs font-semibold text-slate-800">
                        Pool Marketing
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
                        className="w-16 px-2 py-1 text-xs text-right font-mono font-bold border border-slate-300 rounded bg-white"
                      />
                      <span className="text-xs font-bold text-slate-500">%</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={draft.marketingPoolPercentage}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      updateDraft({
                        marketingPoolPercentage: val,
                        kantorPercentage: 100 - val,
                      });
                    }}
                    className="w-full h-1.5 bg-slate-200 rounded appearance-none cursor-pointer accent-teal-700"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100" />

            {/* Level 2: Sales vs AM */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-900">
                  2. Pembagian Pool Marketing: Sales vs Account Manager (AM)
                </span>
                {!isLevel2Valid ? (
                  <div className="flex items-center gap-1.5 text-rose-600 font-medium text-[11px]">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Total {level2Sum}% (Harus 100%)</span>
                    <button
                      type="button"
                      onClick={() => autoBalanceLevel2('sales')}
                      className="underline font-bold hover:text-rose-800 cursor-pointer ml-1"
                    >
                      Seimbangkan
                    </button>
                  </div>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700">
                    <Check className="w-3.5 h-3.5" />
                    100% Seimbang
                  </span>
                )}
              </div>

              {/* Progress Bar */}
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
                <div
                  style={{ width: `${Math.min(100, draft.salesPercentageOfPool)}%` }}
                  className="bg-teal-700 transition-all duration-150"
                />
                <div
                  style={{ width: `${Math.min(100, draft.amPercentageOfPool)}%` }}
                  className="bg-purple-600 transition-all duration-150"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {/* Sales Box */}
                <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-teal-700" />
                        <label htmlFor="salesPercentageOfPool" className="text-xs font-semibold text-slate-800">
                          Sales Closing
                        </label>
                      </div>
                      <span className="text-[10px] text-teal-700 font-medium pl-6 block">
                        Efektif {effectiveSalesOfMargin}% Margin Kotor
                      </span>
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
                        className="w-16 px-2 py-1 text-xs text-right font-mono font-bold border border-slate-300 rounded bg-white"
                      />
                      <span className="text-xs font-bold text-slate-500">%</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={draft.salesPercentageOfPool}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      updateDraft({
                        salesPercentageOfPool: val,
                        amPercentageOfPool: 100 - val,
                      });
                    }}
                    className="w-full h-1.5 bg-slate-200 rounded appearance-none cursor-pointer accent-teal-700"
                  />
                </div>

                {/* AM Box */}
                <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-purple-700" />
                        <label htmlFor="amPercentageOfPool" className="text-xs font-semibold text-slate-800">
                          Account Manager (AM)
                        </label>
                      </div>
                      <span className="text-[10px] text-purple-700 font-medium pl-6 block">
                        Efektif {effectiveAmOfMargin}% Margin Kotor
                      </span>
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
                        className="w-16 px-2 py-1 text-xs text-right font-mono font-bold border border-slate-300 rounded bg-white"
                      />
                      <span className="text-xs font-bold text-slate-500">%</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={draft.amPercentageOfPool}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      updateDraft({
                        amPercentageOfPool: val,
                        salesPercentageOfPool: 100 - val,
                      });
                    }}
                    className="w-full h-1.5 bg-slate-200 rounded appearance-none cursor-pointer accent-purple-700"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100" />

            {/* Threshold & Bonus */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label htmlFor="minimumMarginForFee" className="font-semibold text-slate-800 block">
                  Batas Minimum Margin untuk Fee (Rp)
                </label>
                <input
                  id="minimumMarginForFee"
                  type="number"
                  min="0"
                  step="50000"
                  value={draft.minimumMarginForFee}
                  onChange={(e) => updateDraft({ minimumMarginForFee: Number(e.target.value) || 0 })}
                  placeholder="0 (Tanpa batasan)"
                  className="w-full px-3 py-1.5 font-mono border border-slate-300 rounded-lg bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="enableSalesBonus" className="font-semibold text-slate-800">
                    Bonus Ekstra High-Margin
                  </label>
                  <input
                    id="enableSalesBonus"
                    type="checkbox"
                    checked={draft.enableSalesBonus}
                    onChange={(e) => updateDraft({ enableSalesBonus: e.target.checked })}
                    className="w-4 h-4 rounded text-teal-700 focus:ring-teal-600 accent-teal-700 cursor-pointer"
                  />
                </div>

                {draft.enableSalesBonus && (
                  <div className="grid grid-cols-2 gap-2 pt-0.5">
                    <input
                      type="number"
                      placeholder="Target Margin (Rp)"
                      value={draft.bonusThresholdMargin}
                      onChange={(e) => updateDraft({ bonusThresholdMargin: Number(e.target.value) || 0 })}
                      className="w-full px-2.5 py-1.5 font-mono border border-slate-300 rounded-lg bg-white text-xs"
                    />
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        placeholder="Bonus %"
                        value={draft.salesBonusPercentage}
                        onChange={(e) => updateDraft({ salesBonusPercentage: Number(e.target.value) || 0 })}
                        className="w-full px-2.5 py-1.5 font-mono border border-slate-300 rounded-lg bg-white text-xs"
                      />
                      <span className="text-slate-500 font-bold">%</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section: Tarif Personil Override */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Tarif Fee Khusus Personil
                </h2>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                  {(draft.userFeeRates || []).length} Personil
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsAddingUserRate(!isAddingUserRate)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Tambah Personil</span>
              </button>
            </div>

            {/* Add User Form */}
            {isAddingUserRate && (
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 block mb-1">
                      Pilih User Sistem
                    </label>
                    <select
                      value={newUserId}
                      onChange={(e) => {
                        const selectedId = e.target.value;
                        setNewUserId(selectedId);
                        const foundUser = users.find((u) => u.id === selectedId);
                        if (foundUser) {
                          setNewUserName(foundUser.name);
                          if (['Sales', 'Marketing', 'AM'].includes(foundUser.role)) {
                            setNewUserRole(foundUser.role as any);
                          }
                        }
                      }}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-xs"
                    >
                      <option value="">-- Manual / Pilih User --</option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.role})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-slate-700 block mb-1">
                      Nama Personil
                    </label>
                    <input
                      type="text"
                      placeholder="Nama lengkap"
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-slate-700 block mb-1">
                      Peran
                    </label>
                    <select
                      value={newUserRole}
                      onChange={(e) => setNewUserRole(e.target.value as any)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-xs"
                    >
                      <option value="Sales">Sales</option>
                      <option value="Marketing">Marketing</option>
                      <option value="AM">Account Manager (AM)</option>
                      <option value="Staff">Staff</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-slate-700 block mb-1">
                      Fee (% Pool)
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={newUserPct}
                        onChange={(e) => setNewUserPct(Number(e.target.value) || 0)}
                        className="w-full px-2.5 py-1.5 font-mono font-bold border border-slate-300 rounded bg-white text-xs"
                      />
                      <span className="font-bold text-slate-500">%</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="Catatan tambahan (opsional)"
                    value={newUserNotes}
                    onChange={(e) => setNewUserNotes(e.target.value)}
                    className="flex-1 px-2.5 py-1.5 border border-slate-300 rounded bg-white text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setIsAddingUserRate(false)}
                    className="px-3 py-1.5 font-medium text-slate-600 hover:text-slate-800 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    disabled={!newUserName.trim()}
                    onClick={handleAddUserRate}
                    className={`px-3 py-1.5 font-semibold text-white rounded transition-colors cursor-pointer ${
                      !newUserName.trim()
                        ? 'bg-slate-300 cursor-not-allowed'
                        : 'bg-teal-700 hover:bg-teal-800'
                    }`}
                  >
                    Simpan
                  </button>
                </div>
              </div>
            )}

            {/* Clean Table */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[11px]">
                    <th className="py-2.5 px-3">Personil</th>
                    <th className="py-2.5 px-3">Peran</th>
                    <th className="py-2.5 px-3">Fee (% Pool)</th>
                    <th className="py-2.5 px-3">Efektif Margin</th>
                    <th className="py-2.5 px-3">Catatan</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(!draft.userFeeRates || draft.userFeeRates.length === 0) ? (
                    <tr>
                      <td colSpan={7} className="py-6 text-center text-slate-400 text-xs">
                        Belum ada personil khusus. Semua personil menggunakan rumus standar.
                      </td>
                    </tr>
                  ) : (
                    draft.userFeeRates.map((userRate, idx) => {
                      const effectiveOfMargin = (
                        (draft.marketingPoolPercentage * userRate.customPercentage) /
                        100
                      ).toFixed(1);

                      return (
                        <tr key={userRate.userId || idx} className="hover:bg-slate-50/50">
                          <td className="py-2.5 px-3 font-semibold text-slate-900">
                            {userRate.userName}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">
                            {userRate.userRole}
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={userRate.customPercentage}
                                onChange={(e) => {
                                  const val = Math.min(100, Math.max(0, Number(e.target.value) || 0));
                                  handleUpdateUserRate(idx, { customPercentage: val });
                                }}
                                className="w-14 px-1.5 py-0.5 text-xs text-right font-mono font-semibold border border-slate-200 rounded bg-white"
                              />
                              <span className="text-slate-500">%</span>
                            </div>
                          </td>
                          <td className="py-2.5 px-3 font-mono text-slate-700">
                            {effectiveOfMargin}%
                          </td>
                          <td className="py-2.5 px-3 text-slate-500">
                            <input
                              type="text"
                              value={userRate.notes || ''}
                              placeholder="Tambah catatan..."
                              onChange={(e) => handleUpdateUserRate(idx, { notes: e.target.value })}
                              className="w-full px-1.5 py-0.5 text-xs border border-transparent hover:border-slate-200 focus:border-slate-300 rounded bg-transparent focus:bg-white"
                            />
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleUpdateUserRate(idx, { enabled: !userRate.enabled })}
                              className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer ${
                                userRate.enabled
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-slate-100 text-slate-500 border border-slate-200'
                              }`}
                            >
                              {userRate.enabled ? 'Aktif' : 'Nonaktif'}
                            </button>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleDeleteUserRate(idx)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                              title="Hapus"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 2: TARIF METRO & INTERNET                                         */}
      {/* ===================================================================== */}
      {activeTab === 'metro' && (
        <div className="space-y-6">
          {/* Metro Methods */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Metode Perhitungan Metro Ethernet
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                {
                  id: 'proportional_capacity' as MetroFormulaMethod,
                  title: 'Proporsional Kapasitas Port',
                  desc: '(Bandwidth / Kapasitas Port) × Tarif Port',
                  tag: 'Standar ISP',
                },
                {
                  id: 'per_mbps' as MetroFormulaMethod,
                  title: 'Per Mbps Eksak',
                  desc: 'Bandwidth (Mbps) × Tarif per Mbps',
                  tag: 'Linear',
                },
                {
                  id: 'per_100mbps' as MetroFormulaMethod,
                  title: 'Kelipatan Blok 100 Mbps',
                  desc: 'ceil(Bandwidth / 100) × Tarif Blok 100M',
                  tag: 'Blok 100M',
                },
                {
                  id: 'per_gbps' as MetroFormulaMethod,
                  title: 'Per Gbps',
                  desc: '(Bandwidth / 1000) × Tarif per Gbps',
                  tag: 'High Bandwidth',
                },
                {
                  id: 'flat_port' as MetroFormulaMethod,
                  title: 'Flat Rate per Port',
                  desc: 'Tarif tetap flat berapapun bandwidth dialirkan',
                  tag: 'Flat Bulanan',
                },
              ].map((item) => {
                const isSelected = draft.metroCalculationMethod === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => updateDraft({ metroCalculationMethod: item.id })}
                    className={`p-3 rounded-lg border transition-all cursor-pointer space-y-1 ${
                      isSelected
                        ? 'bg-teal-50/40 border-teal-600 ring-1 ring-teal-600'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{item.title}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded font-medium bg-slate-100 text-slate-600">
                        {item.tag}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-mono">{item.desc}</p>
                  </div>
                );
              })}
            </div>

            {/* Metro Multiplier & Rounding */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-100 text-xs">
              <div className="space-y-1.5">
                <label htmlFor="metroMultiplierRatio" className="font-semibold text-slate-800 block">
                  Faktor Multiplier Redundansi
                </label>
                <input
                  id="metroMultiplierRatio"
                  type="number"
                  step="0.05"
                  min="0.5"
                  max="3.0"
                  value={draft.metroMultiplierRatio}
                  onChange={(e) => updateDraft({ metroMultiplierRatio: Number(e.target.value) || 1 })}
                  className="w-full px-3 py-1.5 font-mono border border-slate-300 rounded-lg bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="metroRoundingRule" className="font-semibold text-slate-800 block">
                  Aturan Pembulatan Metro
                </label>
                <select
                  id="metroRoundingRule"
                  value={draft.metroRoundingRule}
                  onChange={(e) => updateDraft({ metroRoundingRule: e.target.value as MetroRoundingRule })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="none">Tanpa Pembulatan (Eksak)</option>
                  <option value="round_thousand">Bulatkan ke Ribuan (Rp 1.000)</option>
                  <option value="round_hundred_thousand">Bulatkan ke Ratusan Ribu (Rp 100.000)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="metroMinimumPrice" className="font-semibold text-slate-800 block">
                  Tarif Minimum Metro / bln (Rp)
                </label>
                <input
                  id="metroMinimumPrice"
                  type="number"
                  min="0"
                  step="50000"
                  value={draft.metroMinimumPrice}
                  onChange={(e) => updateDraft({ metroMinimumPrice: Number(e.target.value) || 0 })}
                  placeholder="0 (Tanpa minimum)"
                  className="w-full px-3 py-1.5 font-mono border border-slate-300 rounded-lg bg-white"
                />
              </div>
            </div>
          </div>

          {/* Internet Dedicated & PPN */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Internet Dedicated & Kebijakan Pajak
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="space-y-1.5">
                <label htmlFor="internetCalculationMethod" className="font-semibold text-slate-800 block">
                  Metode Internet Dedicated
                </label>
                <select
                  id="internetCalculationMethod"
                  value={draft.internetCalculationMethod}
                  onChange={(e) =>
                    updateDraft({
                      internetCalculationMethod: e.target.value as 'tier_priority_fallback' | 'pure_per_mbps',
                    })
                  }
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="tier_priority_fallback">Prioritas Tier + Fallback</option>
                  <option value="pure_per_mbps">Linear Pure per Mbps</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="internetFallbackPer100Mbps" className="font-semibold text-slate-800 block">
                  Tarif Fallback / 100 Mbps (Rp)
                </label>
                <input
                  id="internetFallbackPer100Mbps"
                  type="number"
                  step="100000"
                  value={draft.internetFallbackPer100Mbps}
                  onChange={(e) => updateDraft({ internetFallbackPer100Mbps: Number(e.target.value) || 0 })}
                  className="w-full px-3 py-1.5 font-mono border border-slate-300 rounded-lg bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="ppnPercentage" className="font-semibold text-slate-800 block">
                  Tarif PPN (%)
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
                    className="w-full px-3 py-1.5 font-mono border border-slate-300 rounded-lg bg-white"
                  />
                  <span className="font-bold text-slate-500">%</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="maxDiscountPercentage" className="font-semibold text-slate-800 block">
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
                    className="w-full px-3 py-1.5 font-mono border border-slate-300 rounded-lg bg-white"
                  />
                  <span className="font-bold text-slate-500">%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 3: SIMULATOR LIVE                                                 */}
      {/* ===================================================================== */}
      {activeTab === 'simulator' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-5">
            {/* Input Controls Grid */}
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
              <div>
                <label htmlFor="simBandwidth" className="font-semibold text-slate-700 block mb-1">
                  Bandwidth
                </label>
                <select
                  id="simBandwidth"
                  value={simBandwidth}
                  onChange={(e) => setSimBandwidth(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-xs"
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
                <label htmlFor="simMetroId" className="font-semibold text-slate-700 block mb-1">
                  Paket Metro
                </label>
                <select
                  id="simMetroId"
                  value={simMetroId}
                  onChange={(e) => setSimMetroId(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-xs"
                >
                  {metro.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.priceMethod})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="simDiscountPct" className="font-semibold text-slate-700 block mb-1">
                  Diskon (%)
                </label>
                <input
                  id="simDiscountPct"
                  type="number"
                  min="0"
                  max={draft.maxDiscountPercentage}
                  value={simDiscountPct}
                  onChange={(e) => setSimDiscountPct(Number(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 font-mono border border-slate-300 rounded-lg bg-white text-xs"
                />
              </div>

              <div>
                <label htmlFor="simBottomRatio" className="font-semibold text-slate-700 block mb-1">
                  Bottom Price (% DPP)
                </label>
                <input
                  id="simBottomRatio"
                  type="number"
                  min="30"
                  max="95"
                  value={simBottomRatio}
                  onChange={(e) => setSimBottomRatio(Number(e.target.value) || 75)}
                  className="w-full px-2.5 py-1.5 font-mono border border-slate-300 rounded-lg bg-white text-xs"
                />
              </div>

              <div>
                <label htmlFor="simTargetUser" className="font-semibold text-slate-700 block mb-1">
                  Uji Personil
                </label>
                <select
                  id="simTargetUser"
                  value={simTargetUser}
                  onChange={(e) => setSimTargetUser(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-xs"
                >
                  <option value="">-- Standar ISP --</option>
                  {(draft.userFeeRates || []).map((u) => (
                    <option key={u.userId} value={u.userId}>
                      {u.userName} ({u.customPercentage}%)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Results Grid - Flattened Minimalist Hierarchy */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
              {/* Left: Pricing Breakdown */}
              <div className="border border-slate-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Rincian Tarif Pelanggan
                  </h3>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {draft.metroCalculationMethod}
                  </span>
                </div>

                <div className="divide-y divide-slate-100 text-xs">
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-600">Internet Dedicated</span>
                    <span className="font-mono font-medium text-slate-900">
                      {formatRupiah(simPricing.internetCost)}
                    </span>
                  </div>

                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-600">Metro Ethernet ({selectedSimMetro?.name})</span>
                    <span className="font-mono font-medium text-slate-900">
                      {formatRupiah(simPricing.metroCost)}
                    </span>
                  </div>

                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-600">Public IP</span>
                    <span className="font-mono font-medium text-slate-900">
                      {formatRupiah(simPricing.publicIpCost)}
                    </span>
                  </div>

                  {simDiscountPct > 0 && (
                    <div className="flex justify-between py-1.5 text-rose-600">
                      <span>Diskon ({simDiscountPct}%)</span>
                      <span className="font-mono font-medium">
                        -{formatRupiah(simPricing.discountAmount)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between py-2 font-bold text-slate-900 bg-slate-50 px-2 rounded mt-1">
                    <span>Harga Jual Bersih (DPP)</span>
                    <span className="font-mono text-teal-800">
                      {formatRupiah(simPricing.dpp)}
                    </span>
                  </div>

                  <div className="flex justify-between py-1.5 text-slate-500">
                    <span>PPN ({draft.ppnPercentage}%)</span>
                    <span className="font-mono">
                      {formatRupiah(simPricing.ppnAmount)}
                    </span>
                  </div>

                  <div className="flex justify-between py-2.5 font-bold text-slate-900 border-t border-slate-200 mt-1">
                    <span>Total Tagihan / bulan</span>
                    <span className="font-mono text-sm text-teal-700">
                      {formatRupiah(simPricing.totalMonthly)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Margin Allocation */}
              <div className="border border-slate-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Distribusi Margin & Fee
                  </h3>
                  <span className="text-[10px] text-emerald-700 font-medium">
                    Zero-Drift
                  </span>
                </div>

                {/* Gross Margin Row */}
                <div className="p-3 bg-slate-50 rounded border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">
                      Gross Margin Bersih
                    </span>
                    <span className="text-base font-mono font-bold text-slate-900">
                      {formatRupiah(simAllocation.margin)}
                    </span>
                  </div>
                  <div className="text-right text-[11px] text-slate-500 font-mono">
                    <div>DPP: {formatRupiah(simSellingPrice)}</div>
                    <div>Bottom: {formatRupiah(simBottomPrice)}</div>
                  </div>
                </div>

                <div className="divide-y divide-slate-100 text-xs">
                  {/* Kantor */}
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2">
                      <Building className="w-3.5 h-3.5 text-slate-600" />
                      <span className="font-medium text-slate-800">
                        Kantor ISP ({simAllocation.kantor.percentage}%)
                      </span>
                    </div>
                    <span className="font-mono font-bold text-slate-900">
                      {formatRupiah(simAllocation.kantor.amount)}
                    </span>
                  </div>

                  {/* Marketing Pool */}
                  <div className="flex items-center justify-between py-2 bg-slate-50/50 px-2 rounded">
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-slate-700" />
                      <span className="font-semibold text-slate-800">
                        Pool Marketing ({simAllocation.marketingPool.percentage}%)
                      </span>
                    </div>
                    <span className="font-mono font-bold text-slate-800">
                      {formatRupiah(simAllocation.marketingPool.amount)}
                    </span>
                  </div>

                  {/* Sales */}
                  <div className="flex items-center justify-between py-2 pl-4">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-3.5 h-3.5 text-teal-700" />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-slate-800">
                            Sales Closing ({simAllocation.sales.percentage}% Pool)
                          </span>
                          {isTargetUserCustom && (
                            <span className="px-1 py-0.2 rounded text-[9px] bg-teal-50 text-teal-800 border border-teal-200 font-bold">
                              Custom
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {((draft.marketingPoolPercentage * simAllocation.sales.percentage) / 100).toFixed(1)}% Margin Kotor
                        </span>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-teal-700">
                      {formatRupiah(simAllocation.sales.amount)}
                    </span>
                  </div>

                  {/* AM */}
                  <div className="flex items-center justify-between py-2 pl-4">
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-3.5 h-3.5 text-purple-700" />
                      <div>
                        <span className="font-medium text-slate-800 block">
                          Account Manager ({simAllocation.am.percentage}% Pool)
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {((draft.marketingPoolPercentage * simAllocation.am.percentage) / 100).toFixed(1)}% Margin Kotor
                        </span>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-purple-700">
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
