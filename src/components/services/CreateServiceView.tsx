import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { calculatePricing, calculateMarginAllocation } from '../../utils/pricingEngine';
import { formatRupiah, formatBandwidth, formatDate } from '../../utils/formatters';
import {
  PlusCircle,
  Calculator,
  Building2,
  Wifi,
  Network,
  Globe,
  Tag,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  ListFilter,
  Layers,
  ArrowRight,
  ArrowLeft,
  Eye,
  Check,
  Sparkles,
  Building,
  Users,
  Briefcase,
  UserCheck,
} from 'lucide-react';
import { PricingAllocation, ServiceItem } from '../../types';
import { HierarchicalPricingAllocation } from './HierarchicalPricingAllocation';

export const CreateServiceView: React.FC = () => {
  const {
    customers,
    metro,
    publicIps,
    pricingConfig,
    createService,
    services,
    updateServiceStatus,
    setActiveMenu,
  } = useApp();

  // Navigation tabs: 'create' | 'list'
  const [activeTab, setActiveTab] = useState<'create' | 'list'>('create');
  // Wizard steps: 1 (Config) -> 2 (Hierarchical Allocation) -> 3 (Review & Save)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(
    customers[0]?.id || ''
  );

  const activeBandwidthTiers = useMemo(() => {
    return (pricingConfig.bandwidthTiers || [])
      .filter((t) => t.isActive !== false)
      .slice()
      .sort((a, b) => a.bandwidthMbps - b.bandwidthMbps);
  }, [pricingConfig.bandwidthTiers]);

  const [bandwidthMbps, setBandwidthMbps] = useState<number>(() => {
    const active = (pricingConfig.bandwidthTiers || []).filter((t) => t.isActive !== false);
    if (active.length > 0) {
      const found500 = active.find((t) => t.bandwidthMbps === 500);
      return found500 ? 500 : active[0].bandwidthMbps;
    }
    return 500;
  });

  useEffect(() => {
    if (activeBandwidthTiers.length > 0) {
      const exists = activeBandwidthTiers.some((t) => t.bandwidthMbps === bandwidthMbps);
      if (!exists) {
        setBandwidthMbps(activeBandwidthTiers[0].bandwidthMbps);
      }
    }
  }, [activeBandwidthTiers, bandwidthMbps]);

  const selectedTier = useMemo(() => {
    return activeBandwidthTiers.find((t) => t.bandwidthMbps === bandwidthMbps) || null;
  }, [activeBandwidthTiers, bandwidthMbps]);

  const [selectedMetroId, setSelectedMetroId] = useState<string>(
    metro[0]?.id || ''
  );
  const [selectedPublicIpId, setSelectedPublicIpId] = useState<string>(
    publicIps[0]?.id || ''
  );
  const [discountType, setDiscountType] = useState<'nominal' | 'percentage'>('nominal');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [viewingServiceModal, setViewingServiceModal] = useState<ServiceItem | null>(null);

  // Selected entities
  const selectedCustomer = useMemo(() => {
    return customers.find((c) => c.id === selectedCustomerId) || null;
  }, [customers, selectedCustomerId]);

  const selectedMetro = useMemo(() => {
    return metro.find((m) => m.id === selectedMetroId) || null;
  }, [metro, selectedMetroId]);

  const selectedPublicIp = useMemo(() => {
    return publicIps.find((p) => p.id === selectedPublicIpId) || null;
  }, [publicIps, selectedPublicIpId]);

  // Realtime Price Calculation
  const calculation = useMemo(() => {
    return calculatePricing({
      bandwidthMbps,
      pricingConfig,
      metro: selectedMetro,
      publicIp: selectedPublicIp,
      discountType,
      discountValue,
    });
  }, [
    bandwidthMbps,
    pricingConfig,
    selectedMetro,
    selectedPublicIp,
    discountType,
    discountValue,
  ]);

  // Pricing Allocation State (Hierarchical Fixed Formula)
  const [pricingAllocation, setPricingAllocation] = useState<PricingAllocation>(() => {
    const selling = calculation.dpp > 0 ? calculation.dpp : 3500000;
    const bottom = Math.round(selling * 0.85);
    return calculateMarginAllocation(bottom, selling);
  });

  // Keep selling price synced when Step 1 calculation updates
  useEffect(() => {
    if (calculation.dpp > 0) {
      setPricingAllocation((prev) => {
        const newSelling = calculation.dpp;
        const newBottom = Math.min(
          newSelling,
          prev.bottomPrice > 0 ? prev.bottomPrice : Math.round(newSelling * 0.85)
        );
        return calculateMarginAllocation(newBottom, newSelling);
      });
    }
  }, [calculation.dpp]);

  const handleSave = (createQuotationAlso = false) => {
    if (!selectedCustomerId) {
      setErrorMsg('Pilih pelanggan terlebih dahulu.');
      return;
    }
    if (bandwidthMbps < 100 || bandwidthMbps > 20000 || bandwidthMbps % 100 !== 0) {
      setErrorMsg('Bandwidth harus kelipatan 100 Mbps antara 100 Mbps - 20 Gbps.');
      return;
    }

    setErrorMsg(null);

    createService(
      {
        customerId: selectedCustomerId,
        bandwidthMbps,
        metroId: selectedMetroId,
        publicIpId: selectedPublicIpId,
        discountType,
        discountValue,
        notes,
        internetCost: calculation.internetCost,
        metroCost: calculation.metroCost,
        publicIpCost: calculation.publicIpCost,
        subtotal: calculation.subtotal,
        discountAmount: calculation.discountAmount,
        dpp: calculation.dpp,
        ppnAmount: calculation.ppnAmount,
        totalMonthly: calculation.totalMonthly,
        pricingAllocation: pricingAllocation,
        status: 'Aktif',
      },
      createQuotationAlso
    );

    if (createQuotationAlso) {
      setActiveMenu('quotations');
    } else {
      setActiveTab('list');
      setCurrentStep(1);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Buat Layanan Pelanggan
          </h1>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('create')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'create'
                ? 'bg-white text-teal-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            + Form Buat Layanan
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'list'
                ? 'bg-white text-teal-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Daftar Layanan Aktif ({services.length})
          </button>
        </div>
      </div>

      {activeTab === 'create' ? (
        <div className="space-y-6">
          {/* Wizard Step Progress Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="grid grid-cols-3 gap-2">
              {/* Step 1 */}
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className={`flex items-center gap-2.5 p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                  currentStep === 1
                    ? 'bg-teal-50 border border-teal-200 text-teal-900'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                    currentStep === 1
                      ? 'bg-teal-700 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  1
                </div>
                <div className="hidden sm:block">
                  <span className="text-xs font-bold block">Konfigurasi Layanan</span>
                  <span className="text-[10px] text-slate-400">Bandwidth, Metro & IP</span>
                </div>
              </button>

              {/* Step 2: Pembagian Margin / Fee */}
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className={`flex items-center gap-2.5 p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                  currentStep === 2
                    ? 'bg-teal-50 border border-teal-200 text-teal-900'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                    currentStep === 2
                      ? 'bg-teal-700 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  2
                </div>
                <div className="hidden sm:block">
                  <span className="text-xs font-bold block">Pembagian Margin & Fee</span>
                  <span className="text-[10px] text-slate-400">Hierarki Bertingkat ISP</span>
                </div>
              </button>

              {/* Step 3: Review & Simpan */}
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className={`flex items-center gap-2.5 p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                  currentStep === 3
                    ? 'bg-teal-50 border border-teal-200 text-teal-900'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                    currentStep === 3
                      ? 'bg-teal-700 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  3
                </div>
                <div className="hidden sm:block">
                  <span className="text-xs font-bold block">Review & Finalisasi</span>
                  <span className="text-[10px] text-slate-400">Simpan & Terbitkan Quotation</span>
                </div>
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* STEP 1: PARAMETER & HARGA */}
          {currentStep === 1 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Side: Parameters Form */}
              <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-slate-900 font-bold text-sm">
                  <PlusCircle className="w-5 h-5 text-teal-700" />
                  Parameter Teknis Layanan ISP
                </div>

                {/* Customer Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-teal-700" />
                    Pilih Pelanggan / Akun Usaha:
                  </label>
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-600/20 bg-white"
                  >
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.companyName} — {c.fullName} ({c.city || 'Kota'})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Bandwidth Configuration */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                    <Wifi className="w-4 h-4 text-teal-700" />
                    Kapasitas Bandwidth Dedicated:
                  </label>

                  {activeBandwidthTiers.length > 0 ? (
                    <>
                      <select
                        value={bandwidthMbps}
                        onChange={(e) => setBandwidthMbps(Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-600/20 bg-white font-medium text-slate-800"
                      >
                        {activeBandwidthTiers.map((tier) => (
                          <option key={tier.id} value={tier.bandwidthMbps}>
                            {tier.name ? `${tier.name} — ` : ''}{formatBandwidth(tier.bandwidthMbps)} ({formatRupiah(tier.price)} / bulan)
                          </option>
                        ))}
                      </select>
                      {selectedTier && (
                        <p className="text-[11px] text-teal-700 font-medium mt-1">
                          Tarif Internet:{' '}
                          <span className="font-bold font-mono text-teal-900">
                            {formatRupiah(selectedTier.price)}/bln
                          </span>
                          {selectedTier.notes && (
                            <span className="text-slate-400 font-normal ml-1.5">
                              • {selectedTier.notes}
                            </span>
                          )}
                        </p>
                      )}
                    </>
                  ) : (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center justify-between">
                      <span>Belum ada paket internet aktif yang dibuat.</span>
                      <button
                        type="button"
                        onClick={() => setActiveMenu('master-pricing')}
                        className="text-xs font-bold text-amber-900 underline hover:no-underline cursor-pointer"
                      >
                        Kelola Paket Internet &rarr;
                      </button>
                    </div>
                  )}
                </div>

                {/* Metro-E Provider */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                    <Network className="w-4 h-4 text-teal-700" />
                    Rute Metro-E / Lastmile Provider:
                  </label>
                  <select
                    value={selectedMetroId}
                    onChange={(e) => setSelectedMetroId(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-600/20 bg-white font-medium"
                  >
                    {metro.map((m) => {
                      const unitText =
                        m.priceMethod === 'Per Gbps'
                          ? 'Gbps'
                          : m.priceMethod === 'Per Mbps'
                          ? 'Mbps'
                          : '100 Mbps';
                      return (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.priceMethod}) — {formatRupiah(m.price)} / {unitText}
                        </option>
                      );
                    })}
                  </select>
                  {selectedMetro && (
                    <p className="text-[11px] text-teal-700 font-medium mt-1">
                      Tarif Metro: {formatRupiah(selectedMetro.price)} /{' '}
                      {selectedMetro.priceMethod === 'Per Gbps'
                        ? 'Gbps'
                        : selectedMetro.priceMethod === 'Per Mbps'
                        ? 'Mbps'
                        : '100 Mbps'}{' '}
                      → Total untuk {formatBandwidth(bandwidthMbps)}:{' '}
                      <span className="font-bold font-mono text-teal-900">
                        {formatRupiah(calculation.metroCost)}/bln
                      </span>
                    </p>
                  )}
                </div>

                {/* Public IP Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-teal-700" />
                    Blok Public IP Dedicated:
                  </label>
                  <select
                    value={selectedPublicIpId}
                    onChange={(e) => setSelectedPublicIpId(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-600/20 bg-white"
                  >
                    {publicIps.map((ip) => (
                      <option key={ip.id} value={ip.id}>
                        {ip.prefix} — {formatRupiah(ip.price)}/bln
                      </option>
                    ))}
                  </select>
                </div>

                {/* Discount Control */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Tag className="w-4 h-4 text-teal-700" />
                      Diskon Penjualan Khusus (Opsional):
                    </span>
                    <div className="flex bg-slate-200/80 p-0.5 rounded-lg text-xs">
                      <button
                        type="button"
                        onClick={() => setDiscountType('nominal')}
                        className={`px-2 py-0.5 rounded font-semibold transition-all ${
                          discountType === 'nominal'
                            ? 'bg-white text-teal-800 shadow-xs'
                            : 'text-slate-600'
                        }`}
                      >
                        Rp Nominal
                      </button>
                      <button
                        type="button"
                        onClick={() => setDiscountType('percentage')}
                        className={`px-2 py-0.5 rounded font-semibold transition-all ${
                          discountType === 'percentage'
                            ? 'bg-white text-teal-800 shadow-xs'
                            : 'text-slate-600'
                        }`}
                      >
                        % Persen
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      {discountType === 'nominal' && (
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                          Rp
                        </span>
                      )}
                      <input
                        type="number"
                        min="0"
                        value={discountValue}
                        onChange={(e) => setDiscountValue(Number(e.target.value) || 0)}
                        placeholder="0"
                        className={`w-full py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-600/20 bg-white ${
                          discountType === 'nominal' ? 'pl-9 pr-3' : 'px-3'
                        }`}
                      />
                    </div>
                    {discountType === 'percentage' && (
                      <span className="text-xs font-bold text-slate-600">%</span>
                    )}
                  </div>
                </div>

                {/* Next Step Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="w-full py-2.5 px-4 text-xs font-bold text-white bg-[#0F766E] hover:bg-teal-800 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Lanjut ke Step 2: Pembagian Margin & Fee</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Right Side: Realtime Price Calculation Card */}
              <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-slate-900 font-bold text-sm">
                  <Calculator className="w-5 h-5 text-teal-700" />
                  Kalkulasi Biaya & Tagihan Realtime
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="text-slate-600 flex items-center gap-1.5 flex-wrap">
                      <span>Internet Dedicated ({formatBandwidth(bandwidthMbps)}):</span>
                      {calculation.isCustomTier && (
                        <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                          Tarif Khusus
                        </span>
                      )}
                    </span>
                    <span className="font-mono font-bold text-slate-800">
                      {formatRupiah(calculation.internetCost)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="text-slate-600">Metro-E ({selectedMetro?.name || '-'}):</span>
                    <span className="font-mono font-bold text-slate-800">
                      {formatRupiah(calculation.metroCost)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="text-slate-600">Public IP ({selectedPublicIp?.prefix || '-'}):</span>
                    <span className="font-mono font-bold text-slate-800">
                      {formatRupiah(calculation.publicIpCost)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1.5 border-b border-slate-200 font-semibold text-slate-700 bg-slate-50/70 px-2 rounded-lg">
                    <span>Subtotal Harga Dasar:</span>
                    <span className="font-mono font-bold text-slate-900">
                      {formatRupiah(calculation.subtotal)}
                    </span>
                  </div>

                  {calculation.discountAmount > 0 && (
                    <div className="flex justify-between items-center py-1 text-emerald-700 font-medium">
                      <span>Diskon ({discountType === 'percentage' ? `${discountValue}%` : 'Nominal'}):</span>
                      <span className="font-mono font-bold">
                        - {formatRupiah(calculation.discountAmount)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center py-1 font-semibold text-slate-800">
                    <span>DPP (Dasar Pengenaan Pajak):</span>
                    <span className="font-mono font-bold text-teal-800">
                      {formatRupiah(calculation.dpp)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1 text-slate-600">
                    <span>PPN 11%:</span>
                    <span className="font-mono font-bold text-slate-800">
                      {formatRupiah(calculation.ppnAmount)}
                    </span>
                  </div>
                </div>

                {/* Total Monthly Final */}
                <div className="p-4 bg-teal-50 rounded-xl border border-teal-200 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-semibold text-teal-800 uppercase tracking-wider block">
                      Total Tagihan Pelanggan
                    </span>
                    <span className="text-[10px] text-teal-600">Termasuk PPN 11% & SLA ISP</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold text-teal-900">
                      {formatRupiah(calculation.totalMonthly)}
                    </span>
                    <span className="block text-[10px] text-teal-700">/ bulan</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: PEMBAGIAN MARGIN / FEE (HIERARKI BERTINGKAT) */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <HierarchicalPricingAllocation
                bottomPrice={pricingAllocation.bottomPrice}
                sellingPrice={pricingAllocation.sellingPrice}
                onSellingPriceChange={(newPrice) => {
                  const updated = calculateMarginAllocation(pricingAllocation.bottomPrice, newPrice);
                  setPricingAllocation(updated);
                }}
                allocation={pricingAllocation}
                onChangeAllocation={(newAlloc) => {
                  setPricingAllocation(newAlloc);
                }}
              />

              {/* Navigation buttons */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-300 rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Kembali ke Step 1 (Konfigurasi)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-[#0F766E] hover:bg-teal-800 rounded-xl shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  <span>Lanjut ke Step 3: Review & Finalisasi</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: REVIEW & FINALISASI */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Review & Konfirmasi Layanan ISP
                    </h3>
                    <p className="text-xs text-slate-500">
                      Pastikan parameter teknis dan kalkulasi tagihan pelanggan sudah tepat sebelum disimpan.
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Siap Diterbitkan
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Summary Pelanggan & Teknis */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block border-b border-slate-200 pb-1">
                      Data Pelanggan & Teknis
                    </span>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Nama Usaha/Pelanggan:</span>
                        <span className="font-bold text-slate-800">{selectedCustomer?.companyName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">PIC / Kontak:</span>
                        <span className="font-medium text-slate-800">{selectedCustomer?.fullName} ({selectedCustomer?.whatsapp})</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Bandwidth Dedicated:</span>
                        <span className="font-mono font-bold text-teal-800">{formatBandwidth(bandwidthMbps)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Metro-E Provider:</span>
                        <span className="text-slate-800">{selectedMetro?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Alokasi IP Publik:</span>
                        <span className="font-mono text-slate-800">{selectedPublicIp?.prefix}</span>
                      </div>
                    </div>
                  </div>

                  {/* Summary Finansial Pelanggan */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block border-b border-slate-200 pb-1">
                      Penagihan Bulanan (Billing Pelanggan)
                    </span>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Subtotal:</span>
                        <span className="font-mono font-medium text-slate-800">{formatRupiah(calculation.subtotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">DPP (Harga Jual):</span>
                        <span className="font-mono font-bold text-slate-800">{formatRupiah(calculation.dpp)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">PPN 11%:</span>
                        <span className="font-mono font-medium text-slate-800">{formatRupiah(calculation.ppnAmount)}</span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-slate-200 font-bold text-sm">
                        <span className="text-teal-900">Total Tagihan:</span>
                        <span className="font-mono text-teal-900">{formatRupiah(calculation.totalMonthly)} / bln</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Final Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-300 rounded-xl flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Kembali Ubah Pembagian Fee</span>
                  </button>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => handleSave(false)}
                      className="flex-1 sm:flex-initial py-2.5 px-4 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                    >
                      Simpan Layanan Saja
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSave(true)}
                      className="flex-1 sm:flex-initial py-2.5 px-5 text-xs font-bold text-white bg-[#0F766E] hover:bg-teal-800 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <FileCheck className="w-4 h-4" />
                      <span>Simpan & Terbitkan Quotation</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* List of existing services */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
            <h3 className="text-sm font-bold text-slate-900">
              Daftar Seluruh Layanan Pelanggan ({services.length})
            </h3>
            <button
              onClick={() => {
                setActiveTab('create');
                setCurrentStep(1);
              }}
              className="text-xs font-semibold text-teal-700 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" /> Buat Layanan Baru
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Service ID</th>
                  <th className="py-3 px-4">Pelanggan</th>
                  <th className="py-3 px-4">Bandwidth</th>
                  <th className="py-3 px-4">Total / Bulan</th>
                  <th className="py-3 px-4">Alokasi Margin</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {services.map((svc) => {
                  const cust = customers.find((c) => c.id === svc.customerId);
                  const alloc = svc.pricingAllocation;

                  return (
                    <tr key={svc.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-teal-800">
                        {svc.id}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {cust?.companyName || svc.customerId}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">
                        {formatBandwidth(svc.bandwidthMbps)}
                      </td>
                      <td className="py-3 px-4 font-bold text-teal-700">
                        {formatRupiah(svc.totalMonthly)}
                      </td>
                      <td className="py-3 px-4">
                        {alloc ? (
                          <button
                            onClick={() => setViewingServiceModal(svc)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-900 text-[11px] font-semibold border border-teal-200 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-teal-700" />
                            <span>Margin: {formatRupiah(alloc.margin)}</span>
                          </button>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Standar</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                            svc.status === 'Aktif'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {svc.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <select
                          value={svc.status}
                          onChange={(e) =>
                            updateServiceStatus(
                              svc.id,
                              e.target.value as 'Aktif' | 'Nonaktif' | 'Suspended'
                            )
                          }
                          className="text-xs border border-slate-200 rounded px-2 py-1 bg-white"
                        >
                          <option value="Aktif">Aktif</option>
                          <option value="Nonaktif">Nonaktif</option>
                          <option value="Suspended">Suspended</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Detail Alokasi Margin Hierarkis */}
      {viewingServiceModal && viewingServiceModal.pricingAllocation && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Rincian Hierarki Margin & Fee: {viewingServiceModal.id}
                </h3>
                <p className="text-xs text-slate-500">
                  Pelanggan:{' '}
                  {customers.find((c) => c.id === viewingServiceModal.customerId)?.companyName}
                </p>
              </div>
              <button
                onClick={() => setViewingServiceModal(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <HierarchicalPricingAllocation
              bottomPrice={viewingServiceModal.pricingAllocation.bottomPrice}
              sellingPrice={viewingServiceModal.pricingAllocation.sellingPrice}
              allocation={viewingServiceModal.pricingAllocation}
              onChangeAllocation={() => {}}
              readOnly={true}
            />

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setViewingServiceModal(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
