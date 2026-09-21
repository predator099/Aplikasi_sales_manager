import React from 'react';

interface BadgeProps {
  variant:
    | 'success'
    | 'warning'
    | 'danger'
    | 'info'
    | 'neutral'
    | 'primary';
  children: React.ReactNode;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ variant, children, size = 'md' }) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-0.5 text-xs';

  const variantClasses = {
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200/80 font-medium',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200/80 font-medium',
    danger: 'bg-rose-50 text-rose-700 border border-rose-200/80 font-medium',
    info: 'bg-sky-50 text-sky-700 border border-sky-200/80 font-medium',
    neutral: 'bg-slate-100 text-slate-700 border border-slate-200 font-medium',
    primary: 'bg-teal-50 text-teal-800 border border-teal-200 font-medium',
  }[variant];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md whitespace-nowrap tracking-normal transition-colors ${sizeClasses} ${variantClasses}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75 shrink-0" />
      <span>{children}</span>
    </span>
  );
};

export const CustomerStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  switch (status) {
    case 'Aktif':
      return <Badge variant="success">Aktif</Badge>;
    case 'Tidak Aktif':
      return <Badge variant="neutral">Tidak Aktif</Badge>;
    case 'Suspended':
      return <Badge variant="danger">Suspended</Badge>;
    case 'Prospek':
      return <Badge variant="info">Prospek</Badge>;
    default:
      return <Badge variant="neutral">{status}</Badge>;
  }
};

export const QuotationStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  switch (status) {
    case 'Draft':
      return <Badge variant="neutral">Draft</Badge>;
    case 'Sent':
      return <Badge variant="info">Terkirim</Badge>;
    case 'Accepted':
      return <Badge variant="success">Diterima</Badge>;
    case 'Rejected':
      return <Badge variant="danger">Ditolak</Badge>;
    case 'Expired':
      return <Badge variant="warning">Kadaluarsa</Badge>;
    default:
      return <Badge variant="neutral">{status}</Badge>;
  }
};

export const InvoiceStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  switch (status) {
    case 'Paid':
      return <Badge variant="success">Lunas</Badge>;
    case 'Partially Paid':
      return <Badge variant="warning">Sebagian</Badge>;
    case 'Unpaid':
      return <Badge variant="danger">Belum Bayar</Badge>;
    case 'Overdue':
      return <Badge variant="danger">Jatuh Tempo</Badge>;
    case 'Draft':
      return <Badge variant="neutral">Draft</Badge>;
    case 'Cancelled':
      return <Badge variant="neutral">Dibatalkan</Badge>;
    default:
      return <Badge variant="neutral">{status}</Badge>;
  }
};

export const UserRoleBadge: React.FC<{ role: string }> = ({ role }) => {
  switch (role) {
    case 'Super Admin':
    case 'Administrator':
      return <Badge variant="primary">{role}</Badge>;
    case 'Finance':
    case 'Accounting':
      return <Badge variant="success">{role}</Badge>;
    case 'Sales':
    case 'Manager':
      return <Badge variant="info">{role}</Badge>;
    case 'NOC / Teknis':
    case 'NOC/Teknis':
      return <Badge variant="neutral">{role}</Badge>;
    default:
      return <Badge variant="neutral">{role}</Badge>;
  }
};
