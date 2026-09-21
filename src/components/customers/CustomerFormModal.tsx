import React, { useState, useEffect } from 'react';
import { Customer, CustomerStatus, DocumentAttachment } from '../../types';
import { DocumentUploader } from './DocumentUploader';
import { useApp } from '../../context/AppContext';
import {
  X,
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Briefcase,
  ShieldCheck,
  Headphones,
  CreditCard,
  FileCheck,
} from 'lucide-react';

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
  const { currentUser } = useApp();

  // Company & Identity
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [nik, setNik] = useState('');
  const [npwp, setNpwp] = useState('');
  const [nib, setNib] = useState('');
  const [npwpDocument, setNpwpDocument] = useState<DocumentAttachment | null>(null);
  const [nibDocument, setNibDocument] = useState<DocumentAttachment | null>(null);
  const [picPosition, setPicPosition] = useState('');
  const [status, setStatus] = useState<CustomerStatus>('Aktif');

  // Contact & Address
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [notes, setNotes] = useState('');

  // Required Fields: Sales, Technical PIC, Finance PIC, Subscription Period, Responsible Person
  const [salesName, setSalesName] = useState('');
  const [salesPhone, setSalesPhone] = useState('');
  const [picTechnicalPhone, setPicTechnicalPhone] = useState('');
  const [picFinanceName, setPicFinanceName] = useState('');
  const [picFinancePhone, setPicFinancePhone] = useState('');
  const [subscriptionPeriod, setSubscriptionPeriod] = useState('12 Bulan (1 Tahun)');
  const [responsiblePerson, setResponsiblePerson] = useState('');
  const [responsiblePersonPhone, setResponsiblePersonPhone] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (customerToEdit) {
      setFullName(customerToEdit.fullName || '');
      setCompanyName(customerToEdit.companyName || '');
      setNik(customerToEdit.nik || '');
      setNpwp(customerToEdit.npwp || '');
      setNib(customerToEdit.nib || '');
      setNpwpDocument(customerToEdit.npwpDocument || null);
      setNibDocument(customerToEdit.nibDocument || null);
      setPicPosition(customerToEdit.picPosition || '');
      setWhatsapp(customerToEdit.whatsapp || '');
      setEmail(customerToEdit.email || '');
      setAddress(customerToEdit.address || '');
      setCity(customerToEdit.city || '');
      setProvince(customerToEdit.province || '');
      setPostalCode(customerToEdit.postalCode || '');
      setStatus(customerToEdit.status || 'Aktif');
      setNotes(customerToEdit.notes || '');

      setSalesName(customerToEdit.salesName || '');
      setSalesPhone(customerToEdit.salesPhone || '');
      setPicTechnicalPhone(customerToEdit.picTechnicalPhone || '');
      setPicFinanceName(customerToEdit.picFinanceName || '');
      setPicFinancePhone(customerToEdit.picFinancePhone || '');
      setSubscriptionPeriod(customerToEdit.subscriptionPeriod || '12 Bulan (1 Tahun)');
      setResponsiblePerson(customerToEdit.responsiblePerson || '');
      setResponsiblePersonPhone(customerToEdit.responsiblePersonPhone || '');
    } else {
      setFullName('');
      setCompanyName('');
      setNik('');
      setNpwp('');
      setNib('');
      setNpwpDocument(null);
      setNibDocument(null);
      setPicPosition('');
      setWhatsapp('');
      setEmail('');
      setAddress('');
      setCity('');
      setProvince('');
      setPostalCode('');
      setStatus('Aktif');
      setNotes('');

      setSalesName(
        currentUser.role === 'Sales' || currentUser.role === 'AM'
          ? currentUser.name
          : ''
      );
      setSalesPhone('');
      setPicTechnicalPhone('');
      setPicFinanceName('');
      setPicFinancePhone('');
      setSubscriptionPeriod('12 Bulan (1 Tahun)');
      setResponsiblePerson('');
      setResponsiblePersonPhone('');
    }
    setErrors({});
  }, [customerToEdit, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs: Record<string, string> = {};

    if (!companyName.trim()) {
      errs.companyName = 'Nama perusahaan wajib diisi.';
    }
    if (!fullName.trim()) {
      errs.fullName = 'Nama lengkap PIC wajib diisi.';
    }
    if (!whatsapp.trim()) {
      errs.whatsapp = 'Nomor WhatsApp wajib diisi.';
    } else if (!/^[0-9+ -]{8,18}$/.test(whatsapp.trim())) {
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
      npwpDocument,
      nibDocument,
      picPosition: picPosition.trim(),
      whatsapp: whatsapp.trim(),
      email: email.trim(),
      address: address.trim(),
      city: city.trim(),
      province: province.trim(),
      postalCode: postalCode.trim(),
      status,
      notes: notes.trim(),

      salesName: salesName.trim(),
      salesPhone: salesPhone.trim(),
      picTechnicalPhone: picTechnicalPhone.trim(),
      picFinanceName: picFinanceName.trim(),
      picFinancePhone: picFinancePhone.trim(),
      subscriptionPeriod: subscriptionPeriod.trim(),
      responsiblePerson: responsiblePerson.trim() || fullName.trim(),
      responsiblePersonPhone: responsiblePersonPhone.trim() || whatsapp.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {customerToEdit ? 'Edit Data Pelanggan' : 'Tambah Pelanggan Baru'}
            </h3>
            <p className="text-xs text-slate-500">
              {customerToEdit
                ? `Perbarui informasi & dokumen legal untuk ${customerToEdit.id}`
                : 'Lengkapi profil pelanggan, tim sales, kontak operasional, dan lampiran dokumen NPWP & NIB'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Section 1: Data Perusahaan & Legalitas */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-800 mb-3 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" /> 1. Identitas Perusahaan & Legalitas
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Perusahaan / Badan Usaha <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: PT Contoh Digital Solusindo"
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

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-teal-700" /> Jangka Waktu Berlangganan
                </label>
                <select
                  value={subscriptionPeriod}
                  onChange={(e) => setSubscriptionPeriod(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-600/20 bg-white"
                >
                  <option value="Bulanan (Tanpa Kontrak)">Bulanan (Tanpa Kontrak / Fleksibel)</option>
                  <option value="3 Bulan">3 Bulan</option>
                  <option value="6 Bulan">6 Bulan</option>
                  <option value="12 Bulan (1 Tahun)">12 Bulan (1 Tahun) - Standar</option>
                  <option value="24 Bulan (2 Tahun)">24 Bulan (2 Tahun)</option>
                  <option value="36 Bulan (3 Tahun)">36 Bulan (3 Tahun)</option>
                  <option value="Khusus / Custom Agreement">Khusus / Custom Agreement</option>
                </select>
              </div>
            </div>

            {/* Lampiran Dokumen NPWP & NIB */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <DocumentUploader
                label="Dokumen NPWP Perusahaan"
                numberLabel="Nomor NPWP"
                numberPlaceholder="01.234.567.8-012.000"
                documentNumberValue={npwp}
                onDocumentNumberChange={setNpwp}
                document={npwpDocument}
                onChange={setNpwpDocument}
              />

              <DocumentUploader
                label="Dokumen NIB (Nomor Induk Berusaha)"
                numberLabel="Nomor NIB"
                numberPlaceholder="9120001234567"
                documentNumberValue={nib}
                onDocumentNumberChange={setNib}
                document={nibDocument}
                onChange={setNibDocument}
              />
            </div>
          </div>

          {/* Section 2: Penanggung Jawab & Tim Sales */}
          <div className="pt-3 border-t border-slate-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-800 mb-3 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5" /> 2. Penanggung Jawab & Account Executive (Sales)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-teal-700" /> Penanggung Jawab Perusahaan
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Ir. Bambang Trihatmojo (Direktur Utama)"
                  value={responsiblePerson}
                  onChange={(e) => setResponsiblePerson(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-600/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  No. Telpon Penanggung Jawab
                </label>
                <input
                  type="text"
                  placeholder="08119887766"
                  value={responsiblePersonPhone}
                  onChange={(e) => setResponsiblePersonPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-600/20 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Sales Representatif / Account Executive
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Rian Pratama"
                  value={salesName}
                  onChange={(e) => setSalesName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-600/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nomor Telpon Sales
                </label>
                <input
                  type="text"
                  placeholder="081298765432"
                  value={salesPhone}
                  onChange={(e) => setSalesPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-600/20 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Data PIC Teknis & PIC Keuangan */}
          <div className="pt-3 border-t border-slate-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-800 mb-3 flex items-center gap-1.5">
              <Headphones className="w-3.5 h-3.5" /> 3. PIC Utama, PIC Teknis & PIC Keuangan
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* PIC Utama */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Lengkap PIC Utama <span className="text-rose-500">*</span>
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
                  Jabatan PIC Utama
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
                  Nomor WhatsApp PIC Utama <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="081234567890"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className={`w-full px-3 py-2 text-xs border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-600/20 font-mono ${
                    errors.whatsapp ? 'border-rose-400 bg-rose-50/50' : 'border-slate-300'
                  }`}
                />
                {errors.whatsapp && (
                  <p className="text-[11px] text-rose-500 mt-1">{errors.whatsapp}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  No. PIC Teknis / NOC Client
                </label>
                <input
                  type="text"
                  placeholder="081211223344 (Hotline Teknisi / Network Admin)"
                  value={picTechnicalPhone}
                  onChange={(e) => setPicTechnicalPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-600/20 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama PIC Keuangan / Finance
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Ratna Wulandari"
                  value={picFinanceName}
                  onChange={(e) => setPicFinanceName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-600/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  No. PIC Keuangan (WhatsApp / Telepon)
                </label>
                <input
                  type="text"
                  placeholder="081255667788"
                  value={picFinancePhone}
                  onChange={(e) => setPicFinancePhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-600/20 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Perusahaan / Tagihan <span className="text-rose-500">*</span>
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

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  NIK PIC / KTP
                </label>
                <input
                  type="text"
                  placeholder="3171012304850001"
                  value={nik}
                  onChange={(e) => setNik(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-600/20 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Alamat Pemasangan */}
          <div className="pt-3 border-t border-slate-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-800 mb-3 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" /> 4. Alamat Pemasangan & Kantor
            </h4>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Alamat Lengkap Kantor / Titik Terminasi Link
                </label>
                <textarea
                  rows={2}
                  placeholder="Nama gedung, lantai, ruangan server, jalan, nomor kavling..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-600/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-600/20 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Catatan Operasional / Kebutuhan Khusus
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Port SFP+ 10G di Rack 4B, perlu izin akses gedung H-1..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-600/20"
                />
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3 sticky bottom-0 bg-white">
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
