import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { getInternetCost, calculateMarginAllocation } from '../../utils/pricingEngine';
import { formatRupiah, formatBandwidth } from '../../utils/formatters';
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
  ArrowRight,
  ArrowLeft,
  Lock,
  Sparkles,
  Users,
  Briefcase,
  Building,
  UserCheck,
  TrendingUp,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { PricingAllocation } from '../../types';

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
    formulaConfig,
    currentUser,
  } = useApp();

  const isSales = currentUser.role === 'Sales';

  // Navigation tabs: 'create' | 'list'
  const [activeTab, setActiveTab] = useState<'create' | 'list'>('create');
  // Wizard steps: 1 (Konfigurasi & Harga) -> 2 (Review & Finalisasi)
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  // =========================================================================
  // 1. SALES MEMILIH CUSTOMER
  // =========================================================================
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(
    customers[0]?.id || ''
  );

  const selectedCustomer = useMemo(() => {
    return customers.find((c) => c.id === selectedCustomerId) || null;
  }, [customers, selectedCustomerId]);

  // =========================================================================
  // 2. SALES MENENTUKAN BANDWIDTH LAYANAN
  // =========================================================================
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

  const selectedTier = useMemo(() => {
    return activeBandwidthTiers.find((t) => t.bandwidthMbps === bandwidthMbps) || null;
  }, [activeBandwidthTiers, bandwidthMbps]);

  // =========================================================================
  // 3. SALES MEMILIH METRO ETHERNET
  // =========================================================================
  const [selectedMetroId, setSelectedMetroId] = useState<string>(() => {
    // Default: Cari Tanpa Metro atau metro pertama
    const directOption = metro.find((m) => m.price === 0 || m.name.toLowerCase().includes('tanpa metro'));
    return directOption?.id || metro[0]?.id || '';
  });

  const selectedMetro = useMemo(() => {
    return metro.find((m) => m.id === selectedMetroId) || null;
  }, [metro, selectedMetroId]);

  // =========================================================================
  // 4. SALES MENGISI KAPASITAS METRO SECARA MANUAL DALAM MBPS
  // =========================================================================
  const [metroCapacityMbps, setMetroCapacityMbps] = useState<number>(bandwidthMbps);
  const [hasManuallyEditedMetroCapacity, setHasManuallyEditedMetroCapacity] = useState<boolean>(false);

  // Auto-sync kapasitas metro dengan bandwidth jika Sales belum mengubah manual
  useEffect(() => {
    if (!hasManuallyEditedMetroCapacity) {
      setMetroCapacityMbps(bandwidthMbps);
    }
  }, [bandwidthMbps, hasManuallyEditedMetroCapacity]);

  // =========================================================================
  // 5. SALES MEMILIH PUBLIC IP
  // =========================================================================
  const [selectedPublicIpId, setSelectedPublicIpId] = useState<string>(
    publicIps[0]?.id || ''
  );

  const selectedPublicIp = useMemo(() => {
    return publicIps.find((p) => p.id === selectedPublicIpId) || null;
  }, [publicIps, selectedPublicIpId]);

  // =========================================================================
  // 6 & 7. SISTEM MENGAMBIL HARGA KOMPONEN & MENGHITUNG HARGA BOTTOM (READ-ONLY)
  // =========================================================================
  // 6a. Harga Internet dari Master Pricing
  const internetRate = useMemo(() => {
    return getInternetCost(bandwidthMbps, pricingConfig, formulaConfig);
  }, [bandwidthMbps, pricingConfig, formulaConfig]);
  const internetCost = internetRate.cost;

  // 6b. Harga Metro dihitung dari Kapasitas Metro Manual (Mbps) & Tarif Master Metro
  const metroCost = useMemo(() => {
    if (!selectedMetro || selectedMetro.status !== 'Aktif' || selectedMetro.price === 0 || metroCapacityMbps <= 0) {
      return 0;
    }
    // Per Gbps
    if (selectedMetro.priceMethod === 'Per Gbps') {
      return Math.round((metroCapacityMbps / 1000) * selectedMetro.price);
    }
    // Per 100 Mbps
    if (selectedMetro.priceMethod === 'Per 100 Mbps') {
      return Math.round((metroCapacityMbps / 100) * selectedMetro.price);
    }
    // Per Mbps
    if (selectedMetro.priceMethod === 'Per Mbps') {
      return Math.round(metroCapacityMbps * selectedMetro.price);
    }
    // Fallback: Per 100 Mbps
    return Math.round((metroCapacityMbps / 100) * selectedMetro.price);
  }, [selectedMetro, metroCapacityMbps]);

  // 6c. Harga Public IP dari Master IP
  const publicIpCost = useMemo(() => {
    return selectedPublicIp && selectedPublicIp.status === 'Aktif' ? selectedPublicIp.price : 0;
  }, [selectedPublicIp]);

  // 7. HARGA BOTTOM OTOMATIS = Internet + Metro + Public IP (HANYA BACA / READ-ONLY)
  const bottomPrice = internetCost + metroCost + publicIpCost;

  // =========================================================================
  // 8. SALES MENGISI HARGA JUAL YANG DITAWARKAN KEPADA CUSTOMER
  // =========================================================================
  const [sellingPriceInput, setSellingPriceInput] = useState<string>('');
  const [hasManuallyEditedSellingPrice, setHasManuallyEditedSellingPrice] = useState<boolean>(false);

  // Jika Sales belum menginput harga jual khusus, inisialisasi default dari bottomPrice
  useEffect(() => {
    if (!hasManuallyEditedSellingPrice) {
      setSellingPriceInput(bottomPrice.toString());
    }
  }, [bottomPrice, hasManuallyEditedSellingPrice]);

  const rawSellingPrice = parseInt(sellingPriceInput.replace(/[^0-9]/g, ''), 10);
  const sellingPrice = !isNaN(rawSellingPrice) ? rawSellingPrice : 0;

  // =========================================================================
  // 9. SISTEM MENGHITUNG MARGIN & PEMBAGIAN FEE SECARA REALTIME
  // =========================================================================
  const margin = sellingPrice - bottomPrice;
  const isBelowBottom = sellingPrice < bottomPrice;
  const isEqualBottom = sellingPrice === bottomPrice && bottomPrice > 0;
  const isPositiveMargin = margin > 0;

  // Persentase Margin
  const markupPercentage = bottomPrice > 0 ? ((margin / bottomPrice) * 100) : 0;
  const marginSharePercentage = sellingPrice > 0 ? ((margin / sellingPrice) * 100) : 0;

  // Formula Pembagian Fee Tetap (Paten Perusahaan):
  // Kantor = 60% Margin
  // Marketing Pool = 40% Margin
  // Sales = 75% Pool (30% Margin)
  // AM = 25% Pool (10% Margin)
  const feeAllocation: PricingAllocation = useMemo(() => {
    if (margin <= 0) {
      return {
        bottomPrice,
        sellingPrice,
        margin: Math.max(0, margin),
        kantor: { amount: 0, percentage: 60 },
        marketingPool: { amount: 0, percentage: 40 },
        sales: { amount: 0, percentage: 75 },
        am: { amount: 0, percentage: 25 },
      };
    }

    const safeMargin = Math.round(margin);
    const kantorAmount = Math.round(safeMargin * 0.60);
    const marketingPoolAmount = safeMargin - kantorAmount; // 40% exact, zero drift
    const salesAmount = Math.round(marketingPoolAmount * 0.75); // 75% of Pool (30% of Margin)
    const amAmount = marketingPoolAmount - salesAmount; // 25% of Pool (10% of Margin), zero drift

    return {
      bottomPrice,
      sellingPrice,
      margin: safeMargin,
      kantor: { amount: kantorAmount, percentage: 60 },
      marketingPool: { amount: marketingPoolAmount, percentage: 40 },
      sales: { amount: salesAmount, percentage: 75 },
      am: { amount: amAmount, percentage: 25 },
    };
  }, [bottomPrice, sellingPrice, margin]);

  // =========================================================================
  // DISKON PENJUALAN & PAJAK PPN
  // =========================================================================
  const [discountType, setDiscountType] = useState<'nominal' | 'percentage'>('nominal');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');

  let discountAmount = 0;
  if (discountType === 'percentage') {
    const pct = Math.min(50, Math.max(0, Number(discountValue) || 0));
    discountAmount = Math.round((sellingPrice * pct) / 100);
  } else {
    discountAmount = Math.min(sellingPrice, Math.max(0, Number(discountValue) || 0));
  }

  // DPP = Harga Jual - Diskon
  const dpp = Math.max(0, sellingPrice - discountAmount);
  const ppnPercentage = pricingConfig.ppnPercentage || 11;
  const ppnAmount = Math.round(dpp * (ppnPercentage / 100));
  // Total Bulanan Pelanggan (DPP + PPN)
  const totalMonthly = dpp + ppnAmount;

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // =========================================================================
  // HANDLER SIMPAN LAYANAN & TERBITKAN QUOTATION
  // =========================================================================
  const handleSave = (createQuotationAlso = false) => {
    if (!selectedCustomerId) {
      setErrorMsg('Pilih pelanggan terlebih dahulu.');
      return;
    }
    if (bandwidthMbps < 100 || bandwidthMbps > 20000 || bandwidthMbps % 100 !== 0) {
      setErrorMsg('Bandwidth harus kelipatan 100 Mbps antara 100 Mbps - 20 Gbps.');
      return;
    }
    if (metroCapacityMbps < 0) {
      setErrorMsg('Kapasitas Metro tidak boleh bernilai negatif.');
      return;
    }
    if (sellingPrice <= 0) {
      setErrorMsg('Harga Jual layanan harus diisi dan lebih besar dari Rp 0.');
      return;
    }

    setErrorMsg(null);

    createService(
      {
        customerId: selectedCustomerId,
        bandwidthMbps,
        metroId: selectedMetroId,
        metroCapacityMbps,
        publicIpId: selectedPublicIpId,
        discountType,
        discountValue,
        notes,
        internetCost,
        metroCost,
        publicIpCost,
        bottomPrice,
        sellingPrice,
        margin,
        subtotal: sellingPrice, // Harga penawaran dasar sebelum diskon
        discountAmount,
        dpp,
        ppnAmount,
        totalMonthly,
        pricingAllocation: feeAllocation,
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

  const displayedServices = useMemo(() => {
    if (!isSales) return services;
    const sName = (currentUser.name || '').toLowerCase();
    const uName = (currentUser.username || '').toLowerCase();
    const myCustIds = new Set(
      customers
        .filter((c) => {
          const cSales = (c.salesName || '').toLowerCase();
          return cSales === sName || cSales === uName;
        })
        .map((c) => c.id)
    );
    return services.filter((s) => myCustIds.has(s.customerId));
  }, [services, customers, currentUser, isSales]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Buat Layanan Pelanggan
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
              Input Harga Jual Sales
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Sistem menghitung Harga Bottom otomatis dari Master Pricing. Sales menginput Harga Jual untuk setiap customer guna menghasilkan Margin dan pembagian fee secara realtime.
          </p>
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
            Daftar Layanan Aktif ({displayedServices.length})
          </button>
        </div>
      </div>

      {activeTab === 'create' ? (
        <div className="space-y-6">
          {/* Wizard Step Progress Bar */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="grid grid-cols-2 gap-2">
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
                  <span className="text-xs font-bold block">Parameter Layanan & Harga Jual</span>
                  <span className="text-[10px] text-slate-400">Harga Bottom, Harga Jual, & Margin Realtime</span>
                </div>
              </button>

              {/* Step 2 */}
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
                  <span className="text-xs font-bold block">Review & Terbitkan Quotation</span>
                  <span className="text-[10px] text-slate-400">Verifikasi Tagihan Klien & Fee Sales</span>
                </div>
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="font-medium">{errorMsg}</span>
            </div>
          )}

          {/* STEP 1: ALUR PENGGUNAAN LENGKAP */}
          {currentStep === 1 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Kolom Kiri: Input Parameter Layanan */}
              <div className="lg:col-span-7 space-y-6">
                {/* Panel Parameter Layanan */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                      <PlusCircle className="w-5 h-5 text-teal-700" />
                      Konfigurasi Komponen Layanan
                    </div>
                  </div>

                  {/* SALES MEMILIH CUSTOMER */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-teal-700" />
                        Pilih Pelanggan / Akun Usaha:
                      </span>
                      {selectedCustomer?.salesName && (
                        <span className="text-[10px] text-slate-400 font-normal">
                          Sales: <strong className="text-slate-600">{selectedCustomer.salesName}</strong>
                        </span>
                      )}
                    </label>
                    <select
                      value={selectedCustomerId}
                      onChange={(e) => setSelectedCustomerId(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-600/20 bg-white font-medium text-slate-900"
                    >
                      {customers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.companyName} — {c.fullName} ({c.city || 'Kota'})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* SALES MENENTUKAN BANDWIDTH LAYANAN */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Wifi className="w-4 h-4 text-teal-700" />
                        Tentukan Bandwidth Dedicated:
                      </span>
                      <span className="text-[10px] text-teal-700 font-bold font-mono">
                        Master: {formatRupiah(internetCost)}/bln
                      </span>
                    </label>

                    {activeBandwidthTiers.length > 0 ? (
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
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min="100"
                          max="20000"
                          step="100"
                          value={bandwidthMbps}
                          onChange={(e) => setBandwidthMbps(Math.max(100, Number(e.target.value) || 100))}
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl font-bold font-mono"
                        />
                        <span className="self-center text-xs font-bold text-slate-500">Mbps</span>
                      </div>
                    )}
                    <p className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                      <span>Tarif internet diambil otomatis dari Master Pricing.</span>
                      <span className="font-semibold text-slate-700 font-mono">Rp {Math.round(internetCost / bandwidthMbps).toLocaleString('id-ID')}/Mbps</span>
                    </p>
                  </div>

                  {/* METRO ETHERNET & KAPASITAS METRO MANUAL (MBPS) */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Network className="w-4 h-4 text-teal-700" />
                        Pilih Metro Ethernet:
                      </label>
                      <span className="text-[10px] font-semibold text-teal-800 bg-teal-100/70 px-2 py-0.5 rounded">
                        Metode: {selectedMetro?.priceMethod || 'Per 100 Mbps'}
                      </span>
                    </div>

                    <select
                      value={selectedMetroId}
                      onChange={(e) => setSelectedMetroId(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-600/20 bg-white font-medium text-slate-800"
                    >
                      {metro.map((m) => {
                        const unitLabel = m.priceMethod === 'Per Gbps' ? 'Gbps' : m.priceMethod === 'Per Mbps' ? 'Mbps' : '100 Mbps';
                        return (
                          <option key={m.id} value={m.id}>
                            {m.name} ({m.priceMethod}) — {m.price === 0 ? 'Gratis / Rp 0' : `${formatRupiah(m.price)} / ${unitLabel}`}
                          </option>
                        );
                      })}
                    </select>

                    {/* SALES MENGISI KAPASITAS METRO SECARA MANUAL DALAM MBPS */}
                    <div className="pt-2 border-t border-slate-200">
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                          <span>Kapasitas Metro Manual (Mbps):</span>
                        </label>
                        <span className="text-[10px] text-teal-700 font-mono font-bold">
                          Biaya Metro: {formatRupiah(metroCost)}/bln
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <input
                            type="number"
                            min="0"
                            step="50"
                            value={metroCapacityMbps}
                            onChange={(e) => {
                              setHasManuallyEditedMetroCapacity(true);
                              setMetroCapacityMbps(Math.max(0, Number(e.target.value) || 0));
                            }}
                            placeholder="Kapasitas Metro dalam Mbps..."
                            className="w-full px-3 py-2 text-xs font-mono font-bold border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-600/20"
                          />
                        </div>
                        <span className="text-xs font-bold text-slate-500 font-mono">Mbps</span>
                      </div>

                      <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                        {selectedMetro?.price === 0 ? (
                          <span className="text-emerald-700 font-medium">✓ Opsi direct link / tanpa lastmile (Biaya Metro Rp 0).</span>
                        ) : selectedMetro?.priceMethod === 'Per Gbps' ? (
                          <span>Kalkulasi: ({metroCapacityMbps} Mbps / 1000) × {formatRupiah(selectedMetro.price)} = <strong>{formatRupiah(metroCost)}</strong></span>
                        ) : selectedMetro?.priceMethod === 'Per 100 Mbps' ? (
                          <span>Kalkulasi: ({metroCapacityMbps} Mbps / 100) × {formatRupiah(selectedMetro.price)} = <strong>{formatRupiah(metroCost)}</strong></span>
                        ) : (
                          <span>Kalkulasi: {metroCapacityMbps} Mbps × {formatRupiah(selectedMetro?.price || 0)} = <strong>{formatRupiah(metroCost)}</strong></span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* SALES MEMILIH PUBLIC IP */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Globe className="w-4 h-4 text-teal-700" />
                        Pilih Blok Public IP:
                      </span>
                      <span className="text-[10px] text-teal-700 font-bold font-mono">
                        Biaya IP: {formatRupiah(publicIpCost)}/bln
                      </span>
                    </label>
                    <select
                      value={selectedPublicIpId}
                      onChange={(e) => setSelectedPublicIpId(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-600/20 bg-white font-medium text-slate-800"
                    >
                      {publicIps.map((ip) => (
                        <option key={ip.id} value={ip.id}>
                          {ip.prefix} — {ip.price === 0 ? 'Termasuk Paket (Rp 0)' : `${formatRupiah(ip.price)} / bulan`}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Diskon Penjualan Khusus (Opsional) */}
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
                          className={`px-2 py-0.5 rounded font-semibold transition-all cursor-pointer ${
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
                          className={`px-2 py-0.5 rounded font-semibold transition-all cursor-pointer ${
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
                          className={`w-full py-1.5 text-xs font-mono font-bold border border-slate-300 rounded-lg bg-white ${
                            discountType === 'nominal' ? 'pl-9 pr-3' : 'px-3'
                          }`}
                        />
                      </div>
                      {discountType === 'percentage' && (
                        <span className="text-xs font-bold text-slate-600">%</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Catatan Layanan */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Catatan Teknis / Penawaran (Opsional):
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Contoh: Port SFP #12 VLAN 410, SLA 99.8%, kontrak 1 tahun..."
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white"
                  />
                </div>
              </div>

              {/* Kolom Kanan: Rincian Bottom, Input Harga Jual, Margin & Fee Realtime */}
              <div className="lg:col-span-5 space-y-6">
                {/* 6 & 7. HARGA BOTTOM OTOMATIS (READ-ONLY) */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                      <Calculator className="w-5 h-5 text-teal-700" />
                      Komponen Harga & Harga Bottom
                    </div>
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      <Lock className="w-3 h-3 text-slate-500" />
                      Hanya Baca
                    </span>
                  </div>

                  {/* Breakdown Komponen Harga Bottom */}
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center py-1 border-b border-slate-100">
                      <span className="text-slate-600">
                        Biaya Internet ({formatBandwidth(bandwidthMbps)}):
                      </span>
                      <span className="font-mono font-bold text-slate-900">
                        {formatRupiah(internetCost)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-1 border-b border-slate-100">
                      <span className="text-slate-600">
                        Biaya Metro ({metroCapacityMbps} Mbps):
                      </span>
                      <span className="font-mono font-bold text-slate-900">
                        {formatRupiah(metroCost)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-1 border-b border-slate-100">
                      <span className="text-slate-600">
                        Biaya Public IP ({selectedPublicIp?.prefix}):
                      </span>
                      <span className="font-mono font-bold text-slate-900">
                        {formatRupiah(publicIpCost)}
                      </span>
                    </div>

                    {/* HARGA BOTTOM TOTAL (READ ONLY) */}
                    <div className="p-3.5 bg-slate-100/80 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">
                          Harga Bottom (HPP Resmi)
                        </span>
                        <span className="text-[10px] text-slate-500">
                          Internet + Metro + Public IP
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-extrabold text-slate-900 font-mono">
                          {formatRupiah(bottomPrice)}
                        </span>
                        <span className="block text-[10px] text-slate-500 font-mono">/ bulan</span>
                      </div>
                    </div>
                  </div>

                  {/* INPUT HARGA JUAL SALES (MANUAL EDITABLE PER CUSTOMER) */}
                  <div className="p-4 bg-teal-50/60 rounded-xl border-2 border-teal-500 space-y-2 shadow-xs">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-teal-950 block">
                        Input Harga Jual (Penawaran Sales)
                      </label>
                      <span className="text-[10px] font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded">
                        Dapat Diedit Sales
                      </span>
                    </div>

                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-teal-700 font-mono">
                        Rp
                      </span>
                      <input
                        type="text"
                        value={sellingPriceInput}
                        onChange={(e) => {
                          setHasManuallyEditedSellingPrice(true);
                          setSellingPriceInput(e.target.value);
                        }}
                        placeholder="Masukkan harga penawaran..."
                        className="w-full pl-10 pr-3 py-2 text-base font-extrabold font-mono border-2 border-teal-500 rounded-lg bg-white text-teal-950 focus:outline-hidden focus:ring-2 focus:ring-teal-600/30"
                      />
                    </div>
                    <p className="text-[10px] text-teal-800/90 leading-relaxed">
                      Harga penawaran bulanan ke customer (sebelum PPN). Dapat disesuaikan khusus untuk tiap klien.
                    </p>
                  </div>

                  {/* 9. MARGIN REALTIME */}
                  <div className={`p-4 rounded-xl border space-y-2 ${
                    isBelowBottom
                      ? 'bg-rose-50 border-rose-300'
                      : isEqualBottom
                      ? 'bg-amber-50 border-amber-300'
                      : 'bg-slate-900 border-slate-800 text-white'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold uppercase tracking-wider ${
                        isBelowBottom ? 'text-rose-800' : isEqualBottom ? 'text-amber-800' : 'text-emerald-400'
                      }`}>
                        Margin (Harga Jual − Bottom)
                      </span>
                      <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded ${
                        isBelowBottom
                          ? 'bg-rose-200 text-rose-900'
                          : isEqualBottom
                          ? 'bg-amber-200 text-amber-900'
                          : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      }`}>
                        {isBelowBottom ? 'Defisit' : `${markupPercentage.toFixed(1)}% Markup`}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between">
                      <span className={`text-xs font-medium ${isBelowBottom ? 'text-rose-600' : isEqualBottom ? 'text-amber-700' : 'text-slate-400'}`}>
                        Nominal Margin:
                      </span>
                      <span className={`text-xl font-extrabold font-mono ${
                        isBelowBottom ? 'text-rose-700' : isEqualBottom ? 'text-amber-800' : 'text-emerald-300'
                      }`}>
                        {formatRupiah(margin)}
                      </span>
                    </div>

                    <div className="text-[10px] pt-1 border-t border-slate-700/50 flex justify-between font-mono text-slate-400">
                      <span>{formatRupiah(sellingPrice)} − {formatRupiah(bottomPrice)}</span>
                      <span>Share: {marginSharePercentage.toFixed(1)}%</span>
                    </div>
                  </div>

                  {/* Alert Peringatan jika Harga Jual <= Bottom */}
                  {isBelowBottom && (
                    <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2.5">
                      <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <strong className="block font-bold">Peringatan: Harga Jual di Bawah Harga Bottom!</strong>
                        <p className="text-[11px] text-rose-700 mt-0.5">
                          Harga Jual ({formatRupiah(sellingPrice)}) lebih kecil dari Harga Bottom ({formatRupiah(bottomPrice)}). Sesuai aturan perusahaan, <strong>tidak ada komisi fee marketing/sales yang dapat dicairkan</strong>.
                        </p>
                      </div>
                    </div>
                  )}

                  {isEqualBottom && (
                    <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2.5">
                      <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <strong className="block font-bold">Perhatian: Harga Jual Sama dengan Harga Bottom</strong>
                        <p className="text-[11px] text-amber-700 mt-0.5">
                          Margin bernilai Rp 0. Tidak ada alokasi pembagian fee atau komisi penjualan yang terbentuk.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* FORMULA PEMBAGIAN FEE PATEN REALTIME */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                      <Users className="w-5 h-5 text-teal-700" />
                      Formula Pembagian Fee Paten Realtime
                    </div>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                      Paten Perusahaan
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    {/* Kantor */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between text-slate-500">
                        <span className="font-semibold text-slate-700 flex items-center gap-1">
                          <Building className="w-3.5 h-3.5" /> Kantor
                        </span>
                        <span className="font-mono font-bold text-[11px]">60%</span>
                      </div>
                      <span className="text-sm font-bold text-slate-900 font-mono block">
                        {formatRupiah(feeAllocation.kantor.amount)}
                      </span>
                      <span className="text-[10px] text-slate-400 block font-mono">60% Margin</span>
                    </div>

                    {/* Marketing Pool */}
                    <div className="p-3 bg-teal-50/70 rounded-xl border border-teal-200 space-y-1">
                      <div className="flex items-center justify-between text-teal-800">
                        <span className="font-semibold flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" /> Pool Marketing
                        </span>
                        <span className="font-mono font-bold text-[11px]">40%</span>
                      </div>
                      <span className="text-sm font-bold text-teal-950 font-mono block">
                        {formatRupiah(feeAllocation.marketingPool.amount)}
                      </span>
                      <span className="text-[10px] text-teal-700 block font-mono">40% Margin</span>
                    </div>

                    {/* Sales Closing */}
                    <div className="p-3 bg-amber-50/80 rounded-xl border-2 border-amber-300 space-y-1 shadow-2xs">
                      <div className="flex items-center justify-between text-amber-900">
                        <span className="font-bold flex items-center gap-1">
                          <Briefcase className="w-3.5 h-3.5" /> Fee Sales
                        </span>
                        <span className="font-mono font-bold text-[11px] bg-amber-200 px-1 rounded">75% Pool</span>
                      </div>
                      <span className="text-base font-extrabold text-amber-950 font-mono block">
                        {formatRupiah(feeAllocation.sales.amount)}
                      </span>
                      <span className="text-[10px] text-amber-800 block font-mono">30% Margin Efektif</span>
                    </div>

                    {/* Account Manager */}
                    <div className="p-3 bg-purple-50/70 rounded-xl border border-purple-200 space-y-1">
                      <div className="flex items-center justify-between text-purple-900">
                        <span className="font-semibold flex items-center gap-1">
                          <UserCheck className="w-3.5 h-3.5" /> Fee AM
                        </span>
                        <span className="font-mono font-bold text-[11px]">25% Pool</span>
                      </div>
                      <span className="text-sm font-bold text-purple-950 font-mono block">
                        {formatRupiah(feeAllocation.am.amount)}
                      </span>
                      <span className="text-[10px] text-purple-700 block font-mono">10% Margin Efektif</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 flex items-center justify-between">
                    <span>Formula dipatenkan: Kantor 60% • Pool 40% (Sales 75% : AM 25%)</span>
                    <span className="font-mono text-emerald-700 font-bold">100% Margin Valid</span>
                  </p>
                </div>

                {/* Tagihan Pelanggan (Billing Final) */}
                <div className="p-5 bg-teal-50 rounded-2xl border border-teal-200 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600">DPP (Harga Jual setelah Diskon):</span>
                    <span className="font-mono font-bold text-slate-900">{formatRupiah(dpp)}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between items-center text-xs text-rose-600">
                      <span>Diskon ({discountType === 'percentage' ? `${discountValue}%` : 'Nominal'}):</span>
                      <span className="font-mono font-bold">- {formatRupiah(discountAmount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600">PPN 11%:</span>
                    <span className="font-mono font-bold text-slate-900">{formatRupiah(ppnAmount)}</span>
                  </div>

                  <div className="pt-2 border-t border-teal-200/80 flex items-baseline justify-between">
                    <div>
                      <span className="text-xs font-bold text-teal-900 uppercase tracking-wider block">
                        Total Tagihan Pelanggan
                      </span>
                      <span className="text-[10px] text-teal-700">Termasuk PPN 11% & SLA ISP</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-extrabold text-teal-950 font-mono">
                        {formatRupiah(totalMonthly)}
                      </span>
                      <span className="block text-[10px] text-teal-800 font-mono">/ bulan</span>
                    </div>
                  </div>
                </div>

                {/* Tombol Lanjut ke Review */}
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="w-full py-3 px-4 text-xs font-bold text-white bg-[#0F766E] hover:bg-teal-800 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Lanjut ke Review & Finalisasi Penawaran</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: REVIEW & FINALISASI */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Review & Konfirmasi Layanan ISP
                    </h3>
                    <p className="text-xs text-slate-500">
                      Pastikan parameter teknis, Harga Bottom, Harga Jual, dan rincian komisi sudah sesuai sebelum disimpan.
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Siap Diterbitkan
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Summary Pelanggan & Teknis */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block border-b border-slate-200 pb-1">
                      Pelanggan & Spesifikasi Teknis
                    </span>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Pelanggan:</span>
                        <span className="font-bold text-slate-800">{selectedCustomer?.companyName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">PIC / Kontak:</span>
                        <span className="font-medium text-slate-800">{selectedCustomer?.fullName} ({selectedCustomer?.whatsapp})</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Bandwidth:</span>
                        <span className="font-mono font-bold text-teal-800">{formatBandwidth(bandwidthMbps)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Metro:</span>
                        <span className="text-slate-800">{selectedMetro?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Kapasitas Metro:</span>
                        <span className="font-mono font-bold text-slate-800">{metroCapacityMbps} Mbps</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">IP Publik:</span>
                        <span className="font-mono text-slate-800">{selectedPublicIp?.prefix}</span>
                      </div>
                    </div>
                  </div>

                  {/* Summary Finansial Penawaran ke Customer */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block border-b border-slate-200 pb-1">
                      Tagihan ke Customer (Penawaran)
                    </span>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Harga Jual (DPP):</span>
                        <span className="font-mono font-bold text-slate-900">{formatRupiah(sellingPrice)}</span>
                      </div>
                      {discountAmount > 0 && (
                        <div className="flex justify-between text-rose-600">
                          <span>Diskon:</span>
                          <span className="font-mono font-bold">- {formatRupiah(discountAmount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-slate-500">DPP Netto:</span>
                        <span className="font-mono font-medium text-slate-800">{formatRupiah(dpp)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">PPN 11%:</span>
                        <span className="font-mono font-medium text-slate-800">{formatRupiah(ppnAmount)}</span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-slate-200 font-bold text-sm">
                        <span className="text-teal-900">Total Tagihan / Bln:</span>
                        <span className="font-mono text-teal-900">{formatRupiah(totalMonthly)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Summary Internal Margin & Fee Allocation */}
                  <div className="p-4 bg-slate-900 text-white rounded-xl border border-slate-800 space-y-3">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block border-b border-slate-800 pb-1">
                      Margin & Fee Internal (Paten)
                    </span>
                    <div className="space-y-1.5 text-xs font-mono">
                      <div className="flex justify-between text-slate-400">
                        <span>Harga Bottom:</span>
                        <span className="text-white">{formatRupiah(bottomPrice)}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Harga Jual:</span>
                        <span className="text-teal-300 font-bold">{formatRupiah(sellingPrice)}</span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-slate-800 text-emerald-400 font-bold">
                        <span>Margin:</span>
                        <span>{formatRupiah(margin)}</span>
                      </div>
                      <div className="pt-1 border-t border-slate-800 space-y-1 text-[11px]">
                        <div className="flex justify-between text-slate-300">
                          <span>Fee Kantor (60%):</span>
                          <span>{formatRupiah(feeAllocation.kantor.amount)}</span>
                        </div>
                        <div className="flex justify-between text-teal-300">
                          <span>Pool Mkt (40%):</span>
                          <span>{formatRupiah(feeAllocation.marketingPool.amount)}</span>
                        </div>
                        <div className="flex justify-between text-amber-300 font-bold">
                          <span>Fee Sales (75% Pool):</span>
                          <span>{formatRupiah(feeAllocation.sales.amount)}</span>
                        </div>
                        <div className="flex justify-between text-purple-300">
                          <span>Fee AM (25% Pool):</span>
                          <span>{formatRupiah(feeAllocation.am.amount)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Final Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-300 rounded-xl flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Kembali ke Konfigurasi Layanan</span>
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
                  <th className="py-3 px-4">Metro (Kapasitas)</th>
                  <th className="py-3 px-4">Harga Bottom</th>
                  <th className="py-3 px-4">Harga Jual</th>
                  <th className="py-3 px-4">Margin</th>
                  <th className="py-3 px-4">Total / Bln</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayedServices.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-slate-400">
                      Belum ada data layanan {isSales ? 'untuk akun Anda' : ''}.
                    </td>
                  </tr>
                ) : (
                  displayedServices.map((svc) => {
                    const cust = customers.find((c) => c.id === svc.customerId);
                    const metroObj = metro.find((m) => m.id === svc.metroId);
                    const bottom = svc.bottomPrice ?? (svc.internetCost + svc.metroCost + svc.publicIpCost);
                    const selling = svc.sellingPrice ?? svc.subtotal;
                    const sMargin = svc.margin ?? (selling - bottom);

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
                        <td className="py-3 px-4 text-slate-700">
                          <span className="block font-medium">{metroObj?.name || '-'}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {svc.metroCapacityMbps ? `${svc.metroCapacityMbps} Mbps` : `${svc.bandwidthMbps} Mbps`}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-600">
                          {formatRupiah(bottom)}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">
                          {formatRupiah(selling)}
                        </td>
                        <td className="py-3 px-4 font-mono font-semibold text-emerald-700">
                          {formatRupiah(sMargin)}
                        </td>
                        <td className="py-3 px-4 font-bold text-teal-700">
                          {formatRupiah(svc.totalMonthly)}
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
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
