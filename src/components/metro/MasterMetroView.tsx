import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Metro } from '../../types';
import { formatRupiah, formatBandwidth } from '../../utils/formatters';
import { ConfirmDialog } from '../common/ConfirmDialog';
import {
  Network,
  Plus,
  Edit2,
  Trash2,
  Calculator,
  X,
  CheckCircle2,
  ToggleLeft,
  ToggleRight,
  Search,
  Info,
} from 'lucide-react';

export const MasterMetroView: React.FC = () => {
  const { metro, addMetro, updateMetro, deleteMetro, pricingConfig } = useApp();

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [metroToEdit, setMetroToEdit] = useState<Metro | null>(null);
  const [name, setName] = useState('');
  const [bandwidthValue, setBandwidthValue] = useState<string>('500');
  const [bandwidthUnit, setBandwidthUnit] = useState<'Mbps' | 'Gbps'>('Mbps');
  const [priceInput, setPriceInput] = useState('2500000');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<'Aktif' | 'Tidak Aktif'>('Aktif');

  // Delete Confirm
  const [metroToDelete, setMetroToDelete] = useState<Metro | null>(null);

  // Metro Calculator State
  const [calcMetroId, setCalcMetroId] = useState<string>(metro[0]?.id || '');
  const [calcBandwidth, setCalcBandwidth] = useState<number>(500);
  const [includePpn, setIncludePpn] = useState<boolean>(true);

  const selectedCalcMetro = useMemo(() => {
    return metro.find((m) => m.id === calcMetroId) || metro[0];
  }, [metro, calcMetroId]);

  // Filtered metro list
  const filteredMetro = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return metro;
    return metro.filter((m) => {
      const bwStr = m.bandwidthMbps
        ? `${m.bandwidthMbps} mbps ${formatBandwidth(m.bandwidthMbps)}`
        : '';
      return (
        m.name.toLowerCase().includes(q) ||
        bwStr.toLowerCase().includes(q) ||
        (m.notes && m.notes.toLowerCase().includes(q))
      );
    });
  }, [metro, searchQuery]);

  // Metro Calculator Output
  const calcOutput = useMemo(() => {
    if (!selectedCalcMetro) {
      return {
        unitLabel: '-',
        pricePerUnit: 0,
        subtotal: 0,
        dpp: 0,
        ppn: 0,
        total: 0,
      };
    }

    let subtotal = 0;
    let unitLabel = '';

    if (
      selectedCalcMetro.bandwidthMbps &&
      selectedCalcMetro.bandwidthMbps === calcBandwidth
    ) {
      subtotal = selectedCalcMetro.price;
      unitLabel = `Tarif Tetap ${formatBandwidth(selectedCalcMetro.bandwidthMbps)}`;
    } else if (
      selectedCalcMetro.bandwidthMbps &&
      selectedCalcMetro.bandwidthMbps > 0
    ) {
      subtotal = Math.round(
        (calcBandwidth / selectedCalcMetro.bandwidthMbps) * selectedCalcMetro.price
      );
      unitLabel = `${calcBandwidth}/${selectedCalcMetro.bandwidthMbps} × tarif`;
    } else if (
      selectedCalcMetro.priceMethod === 'Per Gbps' ||
      (selectedCalcMetro.priceMethod as string) === 'Per GB'
    ) {
      const unit = calcBandwidth / 1000;
      subtotal = unit * selectedCalcMetro.price;
      unitLabel = `${unit} Gbps`;
    } else if (selectedCalcMetro.priceMethod === 'Per Mbps') {
      subtotal = calcBandwidth * selectedCalcMetro.price;
      unitLabel = `${calcBandwidth} Mbps`;
    } else {
      const unit = calcBandwidth / 100;
      subtotal = unit * selectedCalcMetro.price;
      unitLabel = `${unit} × 100 Mbps`;
    }

    const dpp = subtotal;
    const ppnRate = pricingConfig.ppnPercentage || 11;
    const ppn = includePpn ? Math.round(dpp * (ppnRate / 100)) : 0;
    const total = dpp + ppn;

    return {
      unitLabel,
      pricePerUnit: selectedCalcMetro.price,
      subtotal,
      dpp,
      ppn,
      total,
    };
  }, [selectedCalcMetro, calcBandwidth, includePpn, pricingConfig]);

  const openAddModal = () => {
    setMetroToEdit(null);
    setName('');
    setBandwidthValue('500');
    setBandwidthUnit('Mbps');
    setPriceInput('2500000');
    setNotes('');
    setStatus('Aktif');
    setModalOpen(true);
  };

  const openEditModal = (m: Metro) => {
    setMetroToEdit(m);
    setName(m.name);

    if (m.bandwidthMbps) {
      if (m.bandwidthMbps >= 1000 && m.bandwidthMbps % 1000 === 0) {
        setBandwidthValue((m.bandwidthMbps / 1000).toString());
        setBandwidthUnit('Gbps');
      } else {
        setBandwidthValue(m.bandwidthMbps.toString());
        setBandwidthUnit('Mbps');
      }
    } else if (m.priceMethod === 'Per Gbps') {
      setBandwidthValue('1');
      setBandwidthUnit('Gbps');
    } else {
      setBandwidthValue('100');
      setBandwidthUnit('Mbps');
    }

    setPriceInput(m.price.toString());
    setNotes(m.notes || '');
    setStatus(m.status);
    setModalOpen(true);
  };

  const handlePriceInputChange = (val: string) => {
    // Keep only numbers
    const clean = val.replace(/[^0-9]/g, '');
    setPriceInput(clean);
  };

  const calculatedBandwidthMbps = useMemo(() => {
    const val = parseFloat(bandwidthValue) || 0;
    return bandwidthUnit === 'Gbps' ? Math.round(val * 1000) : Math.round(val);
  }, [bandwidthValue, bandwidthUnit]);

  const handleSaveMetro = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const parsedPrice = parseInt(priceInput, 10) || 0;
    const finalBandwidthMbps = calculatedBandwidthMbps > 0 ? calculatedBandwidthMbps : 500;
    const finalPriceMethod = bandwidthUnit === 'Gbps' ? 'Per Gbps' : 'Per Mbps';

    if (metroToEdit) {
      updateMetro(metroToEdit.id, {
        name: name.trim(),
        bandwidthMbps: finalBandwidthMbps,
        priceMethod: finalPriceMethod,
        price: parsedPrice,
        notes: notes.trim() || undefined,
        status,
      });
    } else {
      addMetro({
        name: name.trim(),
        bandwidthMbps: finalBandwidthMbps,
        priceMethod: finalPriceMethod,
        price: parsedPrice,
        notes: notes.trim() || undefined,
        status,
      });
    }
    setModalOpen(false);
  };

  const handleToggleStatus = (m: Metro) => {
    updateMetro(m.id, {
      status: m.status === 'Aktif' ? 'Tidak Aktif' : 'Aktif',
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Metro Ethernet
          </h1>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tambah Layanan Metro</span>
        </button>
      </div>

      {/* Main Section: Master Table of Metro */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="p-3.5 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Daftar Layanan Metro
            </h2>
            <span className="text-[10px] text-slate-400 font-mono">
              ({filteredMetro.length} rute)
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari rute / kapasitas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50/70 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-slate-400 focus:border-slate-400"
              />
            </div>

            <button
              onClick={openAddModal}
              className="px-3 py-1.5 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah</span>
            </button>
          </div>
        </div>

        {/* Table with Clear Columns */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-2.5 px-4 w-12 text-center">No</th>
                <th className="py-2.5 px-4">Provider / Rute Metro</th>
                <th className="py-2.5 px-4">Kecepatan</th>
                <th className="py-2.5 px-4">Harga DPP</th>
                <th className="py-2.5 px-4 text-center">Status</th>
                <th className="py-2.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMetro.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    <Info className="w-6 h-6 mx-auto mb-1.5 opacity-40 text-slate-400" />
                    <p className="text-xs">Tidak ada data Layanan Metro yang cocok.</p>
                  </td>
                </tr>
              ) : (
                filteredMetro.map((m, idx) => {
                  const bwDisplay = m.bandwidthMbps
                    ? formatBandwidth(m.bandwidthMbps)
                    : m.priceMethod === 'Per Gbps'
                    ? '1 Gbps (Per GB)'
                    : 'Per Mbps';

                  return (
                    <tr
                      key={m.id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        m.status !== 'Aktif' ? 'opacity-50 bg-slate-50/30' : ''
                      }`}
                    >
                      {/* No */}
                      <td className="py-3 px-4 text-slate-400 font-mono text-center">
                        {idx + 1}
                      </td>

                      {/* Provider / Rute */}
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-900 block">{m.name}</span>
                        {m.notes ? (
                          <span className="text-[11px] text-slate-500 line-clamp-1">{m.notes}</span>
                        ) : (
                          <span className="text-[10px] font-mono text-slate-400">{m.id}</span>
                        )}
                      </td>

                      {/* Kolom Kecepatan */}
                      <td className="py-3 px-4 font-mono">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border bg-slate-100 text-slate-800 border-slate-200">
                          {bwDisplay}
                        </span>
                      </td>

                      {/* Kolom Harga (DPP) */}
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {formatRupiah(m.price)}
                        <span className="text-slate-400 text-[11px] font-normal font-sans"> / bulan</span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(m)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium border transition-colors cursor-pointer ${
                            m.status === 'Aktif'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              m.status === 'Aktif' ? 'bg-emerald-500' : 'bg-slate-400'
                            }`}
                          />
                          {m.status}
                        </button>
                      </td>

                      {/* Aksi */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditModal(m)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setMetroToDelete(m)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                            title="Hapus"
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

        {/* Footer Info */}
        <div className="p-3 bg-slate-50/50 border-t border-slate-100 text-xs text-slate-500 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
            <span>
              Tarif Metro disinkronkan langsung saat pembuatan Quotation dan Layanan pelanggan.
            </span>
          </div>
          <span className="text-slate-400 font-mono text-[11px]">
            {filteredMetro.length} entri terdaftar
          </span>
        </div>
      </div>

      {/* Simulator Layanan Metro */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-100">
          <Calculator className="w-4 h-4 text-slate-600" />
          <div>
            <h3 className="text-sm font-bold text-slate-900">Simulator Kalkulasi Layanan Metro</h3>
            <p className="text-xs text-slate-500">
              Simulasi estimasi tarif link Metro-E berdasarkan rute dan kapasitas bandwidth.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
          {/* Controls */}
          <div className="lg:col-span-2 space-y-4">
            {/* Select Metro */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Pilih Provider Layanan Metro:
              </label>
              <select
                value={calcMetroId}
                onChange={(e) => setCalcMetroId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-600/20 bg-white font-medium"
              >
                {metro.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} — {m.bandwidthMbps ? formatBandwidth(m.bandwidthMbps) : m.priceMethod} ({formatRupiah(m.price)}/bln)
                  </option>
                ))}
              </select>
            </div>

            {/* Bandwidth Slider & Chips */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">Kecepatan Bandwidth Pesanan:</label>
                <span className="text-xs font-bold text-teal-700 font-mono">
                  {formatBandwidth(calcBandwidth)}
                </span>
              </div>
              <input
                type="range"
                min="100"
                max="10000"
                step="100"
                value={calcBandwidth}
                onChange={(e) => setCalcBandwidth(Number(e.target.value))}
                className="w-full accent-teal-700 h-2 bg-slate-200 rounded-lg cursor-pointer mb-2"
              />
              <div className="flex flex-wrap gap-1.5">
                {[100, 200, 500, 1000, 2000, 5000, 10000].map((bw) => (
                  <button
                    key={bw}
                    type="button"
                    onClick={() => setCalcBandwidth(bw)}
                    className={`px-2.5 py-1 text-[11px] rounded-lg font-medium transition-colors cursor-pointer ${
                      calcBandwidth === bw
                        ? 'bg-teal-700 text-white font-semibold shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {formatBandwidth(bw)}
                  </button>
                ))}
              </div>
            </div>

            {/* PPN Toggle */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="text-xs font-semibold text-slate-800 block">
                  Hitung PPN ({pricingConfig.ppnPercentage}%)
                </span>
                <span className="text-[11px] text-slate-500">
                  Sertakan pajak pertambahan nilai pada total tagihan bulanan
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIncludePpn(!includePpn)}
                className="text-teal-700 hover:text-teal-800 transition-colors cursor-pointer"
              >
                {includePpn ? (
                  <ToggleRight className="w-7 h-7 text-teal-700" />
                ) : (
                  <ToggleLeft className="w-7 h-7 text-slate-400" />
                )}
              </button>
            </div>
          </div>

          {/* Result Card */}
          <div className="p-5 bg-slate-900 text-white rounded-2xl space-y-3 text-xs shadow-inner flex flex-col justify-between">
            <div className="space-y-2.5">
              <span className="text-[11px] font-bold text-teal-300 uppercase tracking-wider block border-b border-slate-800 pb-1.5">
                Hasil Simulasi Metro
              </span>
              <div className="flex justify-between text-slate-300">
                <span>Provider:</span>
                <span className="font-semibold text-white">{selectedCalcMetro?.name}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Skema:</span>
                <span className="font-mono text-white">{calcOutput.unitLabel}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Tarif Terdaftar:</span>
                <span className="text-white font-mono">{formatRupiah(calcOutput.pricePerUnit)}</span>
              </div>
              <div className="border-t border-slate-700 pt-2 flex justify-between">
                <span className="text-slate-300">Subtotal / DPP:</span>
                <span className="font-semibold text-white font-mono">{formatRupiah(calcOutput.dpp)}</span>
              </div>
              {includePpn && (
                <div className="flex justify-between text-slate-300">
                  <span>PPN ({pricingConfig.ppnPercentage}%):</span>
                  <span className="text-amber-300 font-mono">{formatRupiah(calcOutput.ppn)}</span>
                </div>
              )}
            </div>

            <div className="border-t border-slate-700 pt-3 flex justify-between items-baseline">
              <div>
                <span className="font-bold text-slate-200 block text-xs">Total per Bulan:</span>
                <span className="text-[10px] text-slate-400">Termasuk PPN</span>
              </div>
              <span className="text-lg font-bold text-teal-300 font-mono">
                {formatRupiah(calcOutput.total)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Add/Edit Metro: Form Bersih Minimalis */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-xl border border-slate-200 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Network className="w-4 h-4 text-slate-700" />
                <h3 className="text-sm font-bold text-slate-900">
                  {metroToEdit ? 'Edit Layanan Metro' : 'Tambah Layanan Metro'}
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMetro} className="space-y-4 text-xs">
              {/* 1. Nama Provider / Rute Metro */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Provider / Rute Metro <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Metro Provider Alpha atau Lintasarta Metro-E"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-slate-400 focus:border-slate-400 bg-white"
                  required
                />
              </div>

              {/* 2. Kolom Kecepatan */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Kecepatan Bandwidth: <span className="text-rose-500">*</span>
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      min="1"
                      step={bandwidthUnit === 'Gbps' ? '0.5' : '50'}
                      placeholder={bandwidthUnit === 'Gbps' ? '1' : '500'}
                      value={bandwidthValue}
                      onChange={(e) => setBandwidthValue(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono font-semibold border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-slate-400 focus:border-slate-400 bg-white"
                      required
                    />
                  </div>
                  <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setBandwidthUnit('Mbps')}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                        bandwidthUnit === 'Mbps'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Mbps
                    </button>
                    <button
                      type="button"
                      onClick={() => setBandwidthUnit('Gbps')}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                        bandwidthUnit === 'Gbps'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Gbps
                    </button>
                  </div>
                </div>

                {/* Preset Cepat Kecepatan */}
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className="text-[10px] text-slate-400">Preset:</span>
                  {[
                    { label: '100M', val: '100', unit: 'Mbps' as const },
                    { label: '200M', val: '200', unit: 'Mbps' as const },
                    { label: '500M', val: '500', unit: 'Mbps' as const },
                    { label: '1 Gbps', val: '1', unit: 'Gbps' as const },
                    { label: '2 Gbps', val: '2', unit: 'Gbps' as const },
                    { label: '10 Gbps', val: '10', unit: 'Gbps' as const },
                  ].map((chip) => (
                    <button
                      key={chip.label}
                      type="button"
                      onClick={() => {
                        setBandwidthValue(chip.val);
                        setBandwidthUnit(chip.unit);
                      }}
                      className={`px-2 py-0.5 text-[10px] rounded font-medium transition-colors cursor-pointer border ${
                        bandwidthValue === chip.val && bandwidthUnit === chip.unit
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Kolom Harga (Langsung Masukkan Harga setelah Kecepatan) */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tarif Harga Metro (DPP): <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-xs font-mono">
                    Rp
                  </span>
                  <input
                    type="text"
                    value={
                      priceInput
                        ? new Intl.NumberFormat('id-ID').format(Number(priceInput) || 0)
                        : ''
                    }
                    onChange={(e) => handlePriceInputChange(e.target.value)}
                    placeholder="Contoh: 2.500.000"
                    className="w-full pl-9 pr-16 py-2 text-xs font-semibold font-mono text-slate-900 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-slate-400 focus:border-slate-400 bg-white"
                    required
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-[11px]">
                    / bln
                  </span>
                </div>
              </div>

              {/* 4. Catatan / Rute */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Catatan / Rute (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Jalur FO Ring 1 via PoP Cyber"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-slate-400 focus:border-slate-400 bg-white"
                />
              </div>

              {/* 5. Status Keaktifan */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Status Keaktifan</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'Aktif' | 'Tidak Aktif')}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-slate-400 focus:border-slate-400 bg-white text-slate-700"
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Tidak Aktif">Tidak Aktif</option>
                </select>
              </div>

              {/* Modal Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3.5 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-slate-900 hover:bg-slate-800 rounded-lg font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  Simpan Layanan Metro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!metroToDelete}
        title="Hapus Layanan Metro?"
        message={`Apakah Anda yakin ingin menghapus "${metroToDelete?.name}"? Tindakan ini akan menghapus opsi metro dari pilihan pembuatan layanan baru.`}
        confirmLabel="Ya, Hapus"
        onConfirm={() => {
          if (metroToDelete) deleteMetro(metroToDelete.id);
        }}
        onCancel={() => setMetroToDelete(null)}
      />
    </div>
  );
};
