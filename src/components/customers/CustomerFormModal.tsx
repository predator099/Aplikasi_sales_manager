import React, { useState, useEffect } from 'react';
import { Customer, CustomerStatus } from '../../types';
import { X, Building2, User, Phone, Mail, MapPin } from 'lucide-react';

interface CustomerFormModalProps {
  isOpen: boolean;
  customerToEdit: Customer | null;
  onClose: () => void;
  onSubmit: (data: Omit<Customer, 'id' | 'createdAt'>) => void;
}

export const CustomerFormModal: React.FC<CustomerFormModalProps> = ({
  isOpen,
  customerToEdit,
  onClose,
  onSubmit,
}) => {
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [nik, setNik] = useState('');
  const [npwp, setNpwp] = useState('');
  const [nib, setNib] = useState('');
  const [picPosition, setPicPosition] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [status, setStatus] = useState<CustomerStatus>('Aktif');
  const [notes, setNotes] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (customerToEdit) {
      setFullName(customerToEdit.fullName || '');
      setCompanyName(customerToEdit.companyName || '');
      setNik(customerToEdit.nik || '');
      setNpwp(customerToEdit.npwp || '');
      setNib(customerToEdit.nib || '');
      setPicPosition(customerToEdit.picPosition || '');
      setWhatsapp(customerToEdit.whatsapp || '');
      setEmail(customerToEdit.email || '');
      setAddress(customerToEdit.address || '');
      setCity(customerToEdit.city || '');
      setProvince(customerToEdit.province || '');
      setPostalCode(customerToEdit.postalCode || '');
      setStatus(customerToEdit.status || 'Aktif');
      setNotes(customerToEdit.notes || '');
    } else {
      setFullName('');
      setCompanyName('');
      setNik('');
      setNpwp('');
      setNib('');
      setPicPosition('');
      setWhatsapp('');
      setEmail('');
      setAddress('');
      setCity('');
      setProvince('');
      setPostalCode('');
      setStatus('Aktif');
      setNotes('');
    }
    setErrors({});
  }, [customerToEdit, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs: Record<string, string> = {};

    if (!fullName.trim()) {
      errs.fullName = 'Nama lengkap PIC wajib diisi.';
    }
    if (!companyName.trim()) {
      errs.companyName = 'Nama perusahaan wajib diisi.';
    }
    if (!whatsapp.trim()) {
      errs.whatsapp = 'Nomor WhatsApp wajib diisi.';
    } else if (!/^[0-9+ -]{8,16}$/.test(whatsapp.trim())) {
      errs.whatsapp = 'Format nomor WhatsApp tidak valid.';
    }
    if (!email.trim()) {
      errs.email = 'Alamat email wajib diisi.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Format email tidak valid (contoh: info@perusahaan.com).';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      fullName: fullName.trim(),
      companyName: companyName.trim(),
      nik: nik.trim(),
      npwp: npwp.trim(),
      nib: nib.trim(),
      picPosition: picPosition.trim(),
      whatsapp: whatsapp.trim(),
      email: email.trim(),
      address: address.trim(),
      city: city.trim(),
      province: province.trim(),
      postalCode: postalCode.trim(),
      status,
      notes: notes.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {customerToEdit ? 'Edit Data Pelanggan' : 'Tambah Pelanggan Baru'}
            </h3>
            <p className="text-xs text-slate-500">
              {customerToEdit
                ? `Perbarui informasi untuk ${customerToEdit.id}`
                : 'Lengkapi data identitas perusahaan dan PIC untuk registrasi ISP'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* Section: Perusahaan */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-800 mb-3 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" /> Data Perusahaan
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Perusahaan / Badan Usaha <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: PT Contoh Digital"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className={`w-full px-3 py-2 text-xs border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-600/20 ${
                    errors.companyName ? 'border-rose-400 bg-rose-50/50' : 'border-slate-300'
                  }`}
                />
                {errors.companyName && (
                  <p className="text-[11px] text-rose-500 mt-1">{errors.companyName}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  NPWP Perusahaan
                </label>
                <input
                  type="text"
                  placeholder="01.234.567.8-012.000"
                  value={npwp}
                  onChange={(e) => setNpwp(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-600/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  NIB (Nomor Induk Berusaha)
                </label>
                <input
                  type="text"
                  placeholder="9120001234567"
                  value={nib}
                  onChange={(e) => setNib(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-600/20"
                />
              </div>
            </div>
          </div>

          {/* Section: PIC / Personal */}
          <div className="pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-800 mb-3 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> Data PIC (Penanggung Jawab)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Lengkap PIC <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Budi Santoso"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={`w-full px-3 py-2 text-xs border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-600/20 ${
                    errors.fullName ? 'border-rose-400 bg-rose-50/50' : 'border-slate-300'
                  }`}
                />
                {errors.fullName && (
                  <p className="text-[11px] text-rose-500 mt-1">{errors.fullName}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Jabatan PIC
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Direktur IT / Manager Operasional"
                  value={picPosition}
                  onChange={(e) => setPicPosition(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-600/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  NIK / KTP
                </label>
                <input
                  type="text"
                  placeholder="3171012304850001"
                  value={nik}
                  onChange={(e) => setNik(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-600/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Status Pelanggan
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as CustomerStatus)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-600/20 bg-white"
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Prospek">Prospek</option>
                  <option value="Suspended">Suspended</option>
                  <option value="Tidak Aktif">Tidak Aktif</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section: Kontak */}
          <div className="pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-800 mb-3 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" /> Kontak & Komunikasi
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nomor WhatsApp <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="081234567890"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className={`w-full px-3 py-2 text-xs border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-600/20 ${
                    errors.whatsapp ? 'border-rose-400 bg-rose-50/50' : 'border-slate-300'
                  }`}
                />
                {errors.whatsapp && (
                  <p className="text-[11px] text-rose-500 mt-1">{errors.whatsapp}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Perusahaan / Billing <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="finance@contoh.co.id"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-3 py-2 text-xs border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-600/20 ${
                    errors.email ? 'border-rose-400 bg-rose-50/50' : 'border-slate-300'
                  }`}
                />
                {errors.email && (
                  <p className="text-[11px] text-rose-500 mt-1">{errors.email}</p>
                )}
              </div>
            </div>
          </div>

          {/* Section: Alamat */}
          <div className="pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-800 mb-3 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" /> Lokasi & Alamat
            </h4>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Alamat Lengkap Kantor / Pemasangan
                </label>
                <textarea
                  rows={2}
                  placeholder="Nama gedung, lantai, jalan, nomor kavling..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-600/20"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kota</label>
                  <input
                    type="text"
                    placeholder="Jakarta Selatan"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-600/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Provinsi</label>
                  <input
                    type="text"
                    placeholder="DKI Jakarta"
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-600/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kode Pos</label>
                  <input
                    type="text"
                    placeholder="12950"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-600/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Catatan Operasional / Kebutuhan Khusus
                </label>
                <input
                  type="text"
                  placeholder="Kebutuhan SLA 99.8%, port fiber optic, dll..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-600/20"
                />
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-[#0F766E] hover:bg-teal-800 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              {customerToEdit ? 'Simpan Perubahan' : 'Tambah Pelanggan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
