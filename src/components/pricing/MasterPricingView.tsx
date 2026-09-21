import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatRupiah, formatBandwidth } from '../../utils/formatters';
import { BandwidthTier } from '../../types';
import { getInternetCost } from '../../utils/pricingEngine';
import {
  Tags,
  Calculator,
  Save,
  CheckCircle2,
  Plus,
  Edit2,
  Trash2,
  X,
  Search,
  Sliders,
  Info,
} from 'lucide-react';

export const MasterPricingView: React.FC = () => {
  const {
    pricingConfig,
    updatePricingConfig,
    saveBandwidthTier,
    deleteBandwidthTier,
    toggleBandwidthTier,
  } = useApp();

  // Fallback & Tax Settings State
  const [fallbackPriceInput, setFallbackPriceInput] = useState(
    pricingConfig.internetPricePer100Mbps.toString()
  );
  const [ppnInput, setPpnInput] = useState(
    pricingConfig.ppnPercentage.toString()
  );

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');

  // Simulator Bandwidth
  const [simulatorBandwidth, setSimulatorBandwidth] = useState<number>(200);

  // Modal State for Adding/Editing Bandwidth Tier
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTierId, setEditingTierId] = useState<string | null>(null);
  const [formBandwidthValue, setFormBandwidthValue] = useState<number>(200);
  const [formBandwidthUnit, setFormBandwidthUnit] = useState<'Mbps' | 'Gbps'>('Mbps');
  const [formTierName, setFormTierName] = useState<string>('Dedicated 200 Mbps');
  const [formTierPrice, setFormTierPrice] = useState<string>('5500000');
  const [formTierNotes, setFormTierNotes] = useState<string>('');
  const [formTierIsActive, setFormTierIsActive] = useState<boolean>(true);

  // Fallback settings submit
  const handleSaveBaseSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedPrice = parseInt(fallbackPriceInput.replace(/[^0-9]/g, ''), 10) || 3000000;
    const parsedPpn = parseFloat(ppnInput) || 11;

    updatePricingConfig({
      internetPricePer100Mbps: parsedPrice,
      ppnPercentage: parsedPpn,
    });
  };

  // Open Modal for Create
  const handleOpenCreateModal = () => {
    setEditingTierId(null);
    setFormBandwidthValue(200);
    setFormBandwidthUnit('Mbps');
    setFormTierName('Dedicated 200 Mbps');
    setFormTierPrice('5500000');
    setFormTierNotes('Paket tarif bandwidth internet dedicated');
    setFormTierIsActive(true);
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEditModal = (tier: BandwidthTier) => {
    setEditingTierId(tier.id);
    if (tier.bandwidthMbps >= 1000 && tier.bandwidthMbps % 1000 === 0) {
      setFormBandwidthValue(tier.bandwidthMbps / 1000);
      setFormBandwidthUnit('Gbps');
    } else {
      setFormBandwidthValue(tier.bandwidthMbps);
      setFormBandwidthUnit('Mbps');
    }
    setFormTierName(tier.name);
    setFormTierPrice(tier.price.toString());
    setFormTierNotes(tier.notes || '');
    setFormTierIsActive(tier.isActive);
    setIsModalOpen(true);
  };

  // Handle Save Tier in Modal
  const handleSaveTier = (e: React.FormEvent) => {
    e.preventDefault();
    const multiplier = formBandwidthUnit === 'Gbps' ? 1000 : 1;
    const finalBandwidth = Math.max(100, Math.round(formBandwidthValue * multiplier));
    const finalPrice = Math.max(0, parseInt(formTierPrice.replace(/[^0-9]/g, ''), 10) || 0);

    const tierToSave: BandwidthTier = {
      id: editingTierId || `tier-${finalBandwidth}m-${Date.now()}`,
      bandwidthMbps: finalBandwidth,
      name: formTierName.trim() || `Dedicated ${formatBandwidth(finalBandwidth)}`,
      price: finalPrice,
      notes: formTierNotes.trim(),
      isActive: formTierIsActive,
    };

    saveBandwidthTier(tierToSave);
    setIsModalOpen(false);
  };

  // Helper for bandwidth change in form
  const handleBandwidthValueChange = (val: number) => {
    setFormBandwidthValue(val);
    const multiplier = formBandwidthUnit === 'Gbps' ? 1000 : 1;
    const totalMbps = val * multiplier;
    setFormTierName(`Dedicated ${formatBandwidth(totalMbps)}`);
  };

  const handleBandwidthUnitChange = (unit: 'Mbps' | 'Gbps') => {
    setFormBandwidthUnit(unit);
    const multiplier = unit === 'Gbps' ? 1000 : 1;
    const totalMbps = formBandwidthValue * multiplier;
    setFormTierName(`Dedicated ${formatBandwidth(totalMbps)}`);
  };

  // Tiers list sorted
  const tiers = (pricingConfig.bandwidthTiers || []).slice().sort((a, b) => a.bandwidthMbps - b.bandwidthMbps);

  // Filtered tiers for table
  const filteredTiers = tiers.filter((t) => {
    const q = searchQuery.toLowerCase();
    return (
      t.name.toLowerCase().includes(q) ||
      t.bandwidthMbps.toString().includes(q) ||
      formatBandwidth(t.bandwidthMbps).toLowerCase().includes(q) ||
      (t.notes && t.notes.toLowerCase().includes(q))
    );
  });

  // Simulator calculations
  const simResult = getInternetCost(simulatorBandwidth, pricingConfig);
  const simInternetCost = simResult.cost;
  const simPpn = Math.round(simInternetCost * (pricingConfig.ppnPercentage / 100));
  const simTotal = simInternetCost + simPpn;
  const simEffectivePerMbps = Math.round(simInternetCost / simulatorBandwidth);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Paket Internet
          </h1>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tambah Layanan Internet</span>
        </button>
      </div>

      {/* Main Section: Master Table of Bandwidth Tiers */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="p-3.5 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Daftar Paket & Tarif
            </h2>
            <span className="text-[10px] text-slate-400 font-mono">
              ({filteredTiers.length} tier)
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari kapasitas / paket..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50/70 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-slate-400 focus:border-slate-400"
              />
            </div>

            <button
              onClick={handleOpenCreateModal}
              className="px-3 py-1.5 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah</span>
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-2.5 px-4">Kapasitas</th>
                <th className="py-2.5 px-4">Nama Paket</th>
                <th className="py-2.5 px-4">Harga (DPP)</th>
                <th className="py-2.5 px-4">Efektif / Mbps</th>
                <th className="py-2.5 px-4">Total + PPN</th>
                <th className="py-2.5 px-4 text-center">Status</th>
                <th className="py-2.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTiers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    <Info className="w-7 h-7 mx-auto mb-1.5 opacity-50 text-slate-400" />
                    <p className="text-xs font-medium">Tidak ada tarif kapasitas bandwidth ditemukan.</p>
                  </td>
                </tr>
              ) : (
                filteredTiers.map((tier) => {
                  const ppn = Math.round(tier.price * (pricingConfig.ppnPercentage / 100));
                  const totalGross = tier.price + ppn;
                  const pricePerMbps = Math.round(tier.price / tier.bandwidthMbps);

                  return (
                    <tr
                      key={tier.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        !tier.isActive ? 'opacity-60 bg-slate-50/40' : ''
                      }`}
                    >
                      {/* Kapasitas */}
                      <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                        {formatBandwidth(tier.bandwidthMbps)}
                      </td>

                      {/* Nama */}
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-800 text-xs">{tier.name}</span>
                        {tier.notes && (
                          <span className="text-[11px] text-slate-400 block">{tier.notes}</span>
                        )}
                      </td>

                      {/* Harga DPP */}
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 text-xs">
                        {formatRupiah(tier.price)}
                      </td>

                      {/* Efektif per Mbps */}
                      <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">
                        Rp {pricePerMbps.toLocaleString('id-ID')}
                      </td>

                      {/* Total Gross */}
                      <td className="py-3 px-4 font-mono font-semibold text-teal-800 text-xs">
                        {formatRupiah(totalGross)}
                      </td>

                      {/* Status Toggle */}
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => toggleBandwidthTier(tier.id)}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium cursor-pointer transition-colors ${
                            tier.isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              tier.isActive ? 'bg-emerald-600' : 'bg-slate-400'
                            }`}
                          />
                          {tier.isActive ? 'Aktif' : 'Nonaktif'}
                        </button>
                      </td>

                      {/* Aksi */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(tier)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Edit Tarif Kapasitas"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Hapus tarif paket ${tier.name}?`)) {
                                deleteBandwidthTier(tier.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Hapus Tarif"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Note */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-teal-700" />
            <span>
              Tarif paket di atas adalah <strong>prioritas utama (Custom Rate)</strong> yang otomatis dipakai oleh kalkulator Quotation & Service.
            </span>
          </div>
          <span className="text-slate-400">
            Total {filteredTiers.length} tier terdaftar
          </span>
        </div>
      </div>

      {/* 2 Columns: Interactive Simulator & Fallback Base Rate Config */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Bandwidth Simulator (2 Columns) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-teal-700" />
                <h3 className="text-base font-bold text-slate-900">
                  Simulasi & Cek Tarif Realtime
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
                {formatBandwidth(simulatorBandwidth)}
              </span>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Geser kapasitas atau pilih tombol cepat di bawah untuk memverifikasi tarif yang akan dikenakan ke pelanggan:
            </p>

            {/* Quick Preset Buttons */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {[100, 200, 300, 500, 1000, 2000, 5000, 10000].map((bw) => {
                const isMatch = simulatorBandwidth === bw;
                const tierMatch = tiers.find((t) => t.isActive && t.bandwidthMbps === bw);

                return (
                  <button
                    key={bw}
                    type="button"
                    onClick={() => setSimulatorBandwidth(bw)}
                    className={`px-3 py-1.5 text-xs rounded-xl font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                      isMatch
                        ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>{formatBandwidth(bw)}</span>
                    {tierMatch && (
                      <span
                        className={`text-[9px] px-1 rounded ${
                          isMatch ? 'bg-teal-800 text-teal-100' : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        Khusus
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Slider */}
            <div className="space-y-1.5 mb-6">
              <input
                type="range"
                min="100"
                max="10000"
                step="100"
                value={simulatorBandwidth}
                onChange={(e) => setSimulatorBandwidth(Number(e.target.value))}
                className="w-full accent-teal-700 h-2 bg-slate-200 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>100 Mbps</span>
                <span>1 Gbps (1000M)</span>
                <span>5 Gbps</span>
                <span>10 Gbps</span>
              </div>
            </div>

            {/* Status Match Box */}
            <div className="mb-4">
              {simResult.isCustomTier && simResult.tierUsed ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <div>
                      <span className="font-bold text-emerald-900">
                        Menggunakan Tarif Khusus: {simResult.tierUsed.name}
                      </span>
                      <p className="text-[11px] text-emerald-700">
                        Ditetapkan manual sesuai master pricing (Rp {simEffectivePerMbps.toLocaleString('id-ID')}/Mbps).
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-800 whitespace-nowrap">
                    {formatRupiah(simResult.cost)}
                  </span>
                </div>
              ) : (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-slate-500 flex-shrink-0" />
                    <div>
                      <span className="font-bold text-slate-800">
                        Menggunakan Tarif Dasar Linier (Fallback)
                      </span>
                      <p className="text-[11px] text-slate-500">
                        {Math.ceil(simulatorBandwidth / 100)} unit × {formatRupiah(pricingConfig.internetPricePer100Mbps)} per 100M
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-800 whitespace-nowrap">
                    {formatRupiah(simResult.cost)}
                  </span>
                </div>
              )}
            </div>

            {/* Output Calculation Grid */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-500 block text-[11px]">Kapasitas:</span>
                <span className="text-sm font-bold text-slate-900 font-mono">
                  {formatBandwidth(simulatorBandwidth)}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Harga DPP Internet:</span>
                <span className="text-sm font-bold text-slate-900 font-mono">
                  {formatRupiah(simInternetCost)}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">
                  PPN ({pricingConfig.ppnPercentage}%):
                </span>
                <span className="text-sm font-bold text-slate-700 font-mono">
                  {formatRupiah(simPpn)}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Total Tagihan / Bln:</span>
                <span className="text-base font-bold text-teal-800 font-mono">
                  {formatRupiah(simTotal)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Fallback Configuration & PPN Card (1 Column) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
              <Sliders className="w-5 h-5 text-teal-700" />
              <h2 className="text-base font-bold text-slate-900">
                Tarif Fallback & PPN
              </h2>
            </div>

            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Tarif dasar ini digunakan apabila kapasitas bandwidth yang dipesan belum didaftarkan pada daftar tarif kustom di atas.
            </p>

            <form onSubmit={handleSaveBaseSettings} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tarif Dasar per 100 Mbps (IDR)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    Rp
                  </span>
                  <input
                    type="text"
                    value={fallbackPriceInput}
                    onChange={(e) => setFallbackPriceInput(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-xs font-bold text-slate-900 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-600/20"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Saat ini: {formatRupiah(pricingConfig.internetPricePer100Mbps)} / 100 Mbps
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Persentase PPN Regulasi (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={ppnInput}
                    onChange={(e) => setPpnInput(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold text-slate-900 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-600/20"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    %
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Pajak Pertambahan Nilai berlaku (11%)
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1 text-slate-600">
                <div className="flex justify-between">
                  <span>Minimum Order:</span>
                  <span className="font-bold text-slate-800">100 Mbps</span>
                </div>
                <div className="flex justify-between">
                  <span>Maksimum Port:</span>
                  <span className="font-bold text-slate-800">20 Gbps</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-[#0F766E] hover:bg-teal-800 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Pengaturan Dasar</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Modal: Tambah / Edit Tarif Kapasitas Bandwidth */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2">
                <Tags className="w-5 h-5 text-teal-700" />
                <h3 className="text-base font-bold text-slate-900">
                  {editingTierId ? 'Edit Tarif Kapasitas Bandwidth' : 'Tambah Tarif Kapasitas Bandwidth Baru'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveTier} className="p-6 space-y-4">
              {/* Kapasitas Bandwidth Input with Unit Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Kapasitas Bandwidth:
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      min="1"
                      step={formBandwidthUnit === 'Gbps' ? '0.5' : '50'}
                      value={formBandwidthValue}
                      onChange={(e) => handleBandwidthValueChange(Number(e.target.value))}
                      required
                      placeholder={formBandwidthUnit === 'Gbps' ? '1' : '200'}
                      className="w-full px-3 py-2 text-xs font-bold text-slate-900 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-600/20"
                    />
                  </div>

                  <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() => handleBandwidthUnitChange('Mbps')}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        formBandwidthUnit === 'Mbps'
                          ? 'bg-white text-teal-800 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Mbps
                    </button>
                    <button
                      type="button"
                      onClick={() => handleBandwidthUnitChange('Gbps')}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        formBandwidthUnit === 'Gbps'
                          ? 'bg-white text-teal-800 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Gbps
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Setara dengan:{' '}
                  <span className="font-bold text-teal-800 font-mono">
                    {formatBandwidth(formBandwidthValue * (formBandwidthUnit === 'Gbps' ? 1000 : 1))}
                  </span>
                </p>
              </div>

              {/* Nama Paket */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Nama Paket / Label Tarif:
                </label>
                <input
                  type="text"
                  value={formTierName}
                  onChange={(e) => setFormTierName(e.target.value)}
                  required
                  placeholder="Contoh: Dedicated 200 Mbps"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-600/20"
                />
              </div>

              {/* Harga Internet (DPP) */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Harga Internet Bulanan (IDR / DPP):
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    Rp
                  </span>
                  <input
                    type="number"
                    min="100000"
                    step="50000"
                    value={formTierPrice}
                    onChange={(e) => setFormTierPrice(e.target.value)}
                    required
                    placeholder="5500000"
                    className="w-full pl-10 pr-4 py-2 text-xs font-bold text-slate-900 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-600/20"
                  />
                </div>
              </div>

              {/* Catatan / Keterangan */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Keterangan / Catatan Paket (Opsional):
                </label>
                <input
                  type="text"
                  value={formTierNotes}
                  onChange={(e) => setFormTierNotes(e.target.value)}
                  placeholder="Contoh: Paket hemat bisnis menengah CIR 1:1"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-600/20"
                />
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Status Tarif</span>
                  <span className="text-[11px] text-slate-500">
                    {formTierIsActive
                      ? 'Tarif ini aktif dan dapat langsung dipilih pada Quotation'
                      : 'Tarif dinonaktifkan sementara'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setFormTierIsActive(!formTierIsActive)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    formTierIsActive ? 'bg-teal-700' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 bg-white rounded-full transition-transform absolute top-1 ${
                      formTierIsActive ? 'right-1' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              {/* Live Preview Box */}
              {(() => {
                const totalMbps = formBandwidthValue * (formBandwidthUnit === 'Gbps' ? 1000 : 1);
                const price = parseInt(formTierPrice.replace(/[^0-9]/g, ''), 10) || 0;
                const ppn = Math.round(price * (pricingConfig.ppnPercentage / 100));
                const totalGross = price + ppn;
                const pricePerMbps = totalMbps > 0 ? Math.round(price / totalMbps) : 0;

                return (
                  <div className="p-3 bg-teal-50/60 rounded-xl border border-teal-200 text-xs space-y-1 text-slate-700">
                    <span className="font-bold text-teal-900 block text-[11px]">
                      Kalkulasi Otomatis Paket:
                    </span>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Harga per Mbps:</span>
                      <span className="font-mono font-bold text-slate-800">
                        Rp {pricePerMbps.toLocaleString('id-ID')} / Mbps
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">PPN ({pricingConfig.ppnPercentage}%):</span>
                      <span className="font-mono text-slate-700">{formatRupiah(ppn)}</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-teal-200/80 font-bold">
                      <span className="text-teal-900">Total Tagihan (Gross):</span>
                      <span className="font-mono text-teal-800">{formatRupiah(totalGross)}/bln</span>
                    </div>
                  </div>
                );
              })()}

              {/* Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#0F766E] hover:bg-teal-800 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Tarif Kapasitas</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
