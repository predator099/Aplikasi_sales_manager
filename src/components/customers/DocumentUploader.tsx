import React, { useRef } from 'react';
import { DocumentAttachment } from '../../types';
import { UploadCloud, FileText, Trash2, Eye, Download, CheckCircle2 } from 'lucide-react';

interface DocumentUploaderProps {
  label: string;
  document: DocumentAttachment | null | undefined;
  onChange: (doc: DocumentAttachment | null) => void;
  documentNumberValue?: string;
  onDocumentNumberChange?: (val: string) => void;
  numberPlaceholder?: string;
  numberLabel?: string;
  required?: boolean;
}

export const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  label,
  document,
  onChange,
  documentNumberValue,
  onDocumentNumberChange,
  numberPlaceholder,
  numberLabel,
  required = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Read as Base64 data URL so user can view/preview immediately
    const reader = new FileReader();
    reader.onload = () => {
      onChange({
        name: file.name,
        size: file.size,
        type: file.type,
        fileData: typeof reader.result === 'string' ? reader.result : undefined,
        uploadedAt: new Date().toISOString(),
      });
    };
    reader.readAsDataURL(file);

    // Reset input value to allow re-uploading same filename if needed
    e.target.value = '';
  };

  const handleRemove = () => {
    onChange(null);
  };

  const handleDownloadOrOpen = () => {
    if (document?.fileData) {
      const link = window.document.createElement('a');
      link.href = document.fileData;
      link.download = document.name;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
    } else {
      alert(`File lampiran: ${document?.name}`);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/90 space-y-2.5">
      {/* Header and number input */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
        <label className="text-xs font-semibold text-slate-800 flex items-center gap-1">
          {label}
          {required && <span className="text-rose-500">*</span>}
          <span className="text-[10px] font-normal text-slate-500 bg-slate-200/70 px-1.5 py-0.2 rounded">
            Lampiran Dokumen
          </span>
        </label>
      </div>

      {onDocumentNumberChange && (
        <div>
          {numberLabel && (
            <span className="block text-[11px] text-slate-500 mb-0.5">{numberLabel}</span>
          )}
          <input
            type="text"
            placeholder={numberPlaceholder || 'Masukkan nomor resmi...'}
            value={documentNumberValue || ''}
            onChange={(e) => onDocumentNumberChange(e.target.value)}
            className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-600/20 bg-white font-mono"
          />
        </div>
      )}

      {/* Upload Drop Area or Document Preview Card */}
      {document ? (
        <div className="flex items-center justify-between p-2.5 bg-white border border-teal-200 rounded-lg shadow-2xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-800 truncate" title={document.name}>
                {document.name}
              </p>
              <div className="flex items-center gap-2 text-[10px] text-slate-500">
                <span className="inline-flex items-center gap-0.5 text-emerald-600 font-medium">
                  <CheckCircle2 className="w-3 h-3" /> Terlampir
                </span>
                {document.size && <span>• {formatFileSize(document.size)}</span>}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {document.fileData && (
              <button
                type="button"
                onClick={handleDownloadOrOpen}
                title="Buka / Unduh Berkas"
                className="p-1.5 text-slate-600 hover:text-teal-700 hover:bg-teal-50 rounded-md transition-colors"
              >
                <Download className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={handleRemove}
              title="Hapus Lampiran"
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.webp"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-slate-300 hover:border-teal-600 hover:bg-teal-50/40 rounded-lg text-slate-600 hover:text-teal-800 transition-all cursor-pointer group"
          >
            <UploadCloud className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition-colors" />
            <span className="text-xs font-medium">
              Klik untuk Unggah Berkas Dokumen <span className="text-slate-400 font-normal">(PDF, JPG, PNG maks 10MB)</span>
            </span>
          </button>
        </div>
      )}
    </div>
  );
};
