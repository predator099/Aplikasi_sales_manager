import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PublicIp } from '../../types';
import { formatRupiah } from '../../utils/formatters';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { Globe2, Plus, Pencil, Trash2, X, Server, CheckCircle2 } from 'lucide-react';

export const MasterPublicIpView: React.FC = () => {
  const { publicIps, addPublicIp, updatePublicIp, deletePublicIp } = useApp();

  const [modalOpen, setModalOpen] = useState(false);
  const [ipToEdit, setIpToEdit] = useState<PublicIp | null>(null);
  const [prefix, setPrefix] = useState('');
  const [price, setPrice] = useState('0');
  const [status, setStatus] = useState<'Aktif' | 'Tidak Aktif'>('Aktif');

  const [ipToDelete, setIpToDelete] = useState<PublicIp | null>(null);

  const openAddModal = () => {
    setIpToEdit(null);
    setPrefix('');
    setPrice('0');
    setStatus('Aktif');
    setModalOpen(true);
  };

  const openEditModal = (p: PublicIp) => {
    setIpToEdit(p);
    setPrefix(p.prefix);
    setPrice(p.price.toString());
    setStatus(p.status);
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prefix.trim()) return;
    const parsedPrice = parseInt(price.replace(/[^0-9]/g, ''), 10) || 0;

    if (ipToEdit) {
      updatePublicIp(ipToEdit.id, {
        prefix: prefix.trim(),
        price: parsedPrice,
        status,
      });
    } else {
      addPublicIp({
        prefix: prefix.trim(),
        price: parsedPrice,
        status,
      });
    }
    setModalOpen(false);
  };

  const getUsableIps = (p: string) => {
    switch (p.trim()) {
      case 'Tanpa Public IP':
        return '0 IP';
      case '/32':
        return '1 IP';
      case '/31':
        return '2 IP';
      case '/30':
        return '2 IP';
      case '/29':
        return '6 IP';
      case '/28':
        return '14 IP';
      case '/27':
        return '30 IP';
      case '/26':
        return '62 IP';
      case '/25':
        return '126 IP';
      case '/24':
        return '254 IP';
      default: {
        const match = p.match(/\/(\d+)/);
        if (match) {
          const cidr = parseInt(match[1], 10);
          if (cidr === 32) return '1 IP';
          if (cidr === 31) return '2 IP';
          if (cidr >= 0 && cidr < 31) {
            return `${Math.pow(2, 32 - cidr) - 2} IP`;
          }
        }
        return '-';
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            IP Publik
          </h1>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tambah Prefix IP</span>
        </button>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200/80 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <Globe2 className="w-4 h-4 text-slate-700" />
            <h2 className="text-sm font-bold text-slate-900">
              Daftar Prefix IP Publik
            </h2>
          </div>
          <span className="text-slate-400 font-mono text-[11px]">
            {publicIps.length} entri terdaftar
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-2.5 px-4">Prefix / Subnet</th>
                <th className="py-2.5 px-4">Kapasitas Usable Host</th>
                <th className="py-2.5 px-4">Tarif Bulanan (DPP)</th>
                <th className="py-2.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {publicIps.map((ip) => (
                <tr key={ip.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-slate-100 rounded text-slate-800 border border-slate-200">
                      <Server className="w-3 h-3 text-slate-600" />
                      {ip.prefix}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-medium text-slate-700">{getUsableIps(ip.prefix)}</td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">
                    {ip.price === 0 ? (
                      <span className="text-emerald-700 font-medium font-sans">Termasuk Paket (Rp 0)</span>
                    ) : (
                      <>
                        {formatRupiah(ip.price)}
                        <span className="text-slate-400 text-[11px] font-normal font-sans"> / bulan</span>
                      </>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEditModal(ip)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                        title="Edit Prefix"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setIpToDelete(ip)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                        title="Hapus Prefix"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-xl border border-slate-200 animate-in zoom-in-95">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Globe2 className="w-4 h-4 text-slate-700" />
                <h3 className="text-sm font-bold text-slate-900">
                  {ipToEdit ? 'Edit Alokasi IP Publik' : 'Tambah Alokasi IP Publik'}
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Prefix / Blok Subnet <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: /29 atau /28"
                  value={prefix}
                  onChange={(e) => setPrefix(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-slate-400 focus:border-slate-400 bg-white"
                  required
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Kapasitas: {getUsableIps(prefix)}
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tarif Bulanan (DPP) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-xs font-mono">
                    Rp
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="50000"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 font-mono font-semibold border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-slate-400 focus:border-slate-400 bg-white"
                    required
                  />
                </div>
              </div>

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
                  Simpan Prefix
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      <ConfirmDialog
        isOpen={!!ipToDelete}
        title="Hapus Prefix Public IP?"
        message={`Apakah Anda yakin ingin menghapus prefix "${ipToDelete?.prefix}"?`}
        confirmLabel="Ya, Hapus"
        onConfirm={() => {
          if (ipToDelete) deletePublicIp(ipToDelete.id);
        }}
        onCancel={() => setIpToDelete(null)}
      />
    </div>
  );
};
