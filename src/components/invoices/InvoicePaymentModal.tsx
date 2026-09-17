import React, { useState, useEffect } from 'react';
import { Invoice } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatRupiah } from '../../utils/formatters';
import { X, DollarSign, CreditCard, Calendar, CheckCircle2 } from 'lucide-react';

interface InvoicePaymentModalProps {
  invoice: Invoice | null;
  onClose: () => void;
}

export const InvoicePaymentModal: React.FC<InvoicePaymentModalProps> = ({
  invoice,
  onClose,
}) => {
  const { recordPayment } = useApp();

  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('Bank Transfer BCA');
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (invoice) {
      const remaining = Math.max(0, invoice.total - invoice.paidAmount);
      setPaymentAmount(remaining.toString());
      setNotes('');
      setError(null);
    }
  }, [invoice]);

  if (!invoice) return null;

  const remaining = Math.max(0, invoice.total - invoice.paidAmount);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseInt(paymentAmount.replace(/[^0-9]/g, ''), 10) || 0;

    if (amountNum <= 0) {
      setError('Nominal pembayaran harus lebih dari Rp 0.');
      return;
    }
    if (amountNum > remaining) {
      setError(`Nominal pembayaran melebihi sisa tagihan (${formatRupiah(remaining)}).`);
      return;
    }

    recordPayment(invoice.id, {
      amount: amountNum,
      date: new Date().toISOString().slice(0, 10),
      paymentMethod,
      referenceNumber: notes || `TRX-${Date.now().toString().slice(-6)}`,
      notes: notes || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Catat Pembayaran Invoice</h3>
            <p className="text-xs text-slate-500 font-mono">{invoice.id}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Invoice Summary Box */}
        <div className="my-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
          <div className="flex justify-between text-slate-600">
            <span>Total Tagihan:</span>
            <span className="font-bold text-slate-900">{formatRupiah(invoice.total)}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Sudah Dibayar:</span>
            <span className="font-semibold text-emerald-700">{formatRupiah(invoice.paidAmount)}</span>
          </div>
          <div className="flex justify-between text-slate-800 font-bold pt-1 border-t border-slate-200">
            <span>Sisa Tagihan Belum Dibayar:</span>
            <span className="text-rose-700">{formatRupiah(remaining)}</span>
          </div>
        </div>

        {error && (
          <p className="mb-3 text-xs text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-200">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Nominal Pembayaran (IDR) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                Rp
              </span>
              <input
                type="number"
                min="1000"
                max={remaining}
                step="50000"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                className="w-full pl-9 pr-3 py-2 font-bold text-slate-900 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-600/20"
                required
              />
            </div>
            <div className="flex gap-2 mt-1.5">
              <button
                type="button"
                onClick={() => setPaymentAmount(remaining.toString())}
                className="text-[11px] font-semibold text-teal-700 hover:underline"
              >
                Bayar Lunas ({formatRupiah(remaining)})
              </button>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Metode Pembayaran</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-600/20"
            >
              <option value="Bank Transfer BCA">Bank Transfer BCA (Virtual Account / Rek. Utama)</option>
              <option value="Bank Transfer Mandiri">Bank Transfer Mandiri</option>
              <option value="Bank Transfer BNI">Bank Transfer BNI</option>
              <option value="QRIS Bisnis">QRIS Bisnis Perusahaan</option>
              <option value="Giro / Cek Perusahaan">Giro / Cek Perusahaan</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Referensi Transaksi / Catatan Kasir
            </label>
            <input
              type="text"
              placeholder="Nomor referensi mutasi bank atau nama pembayar..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-600/20"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl font-semibold shadow-xs transition-colors"
            >
              Konfirmasi Pembayaran
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
