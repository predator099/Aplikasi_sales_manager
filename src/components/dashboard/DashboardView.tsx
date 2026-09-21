import React from 'react';
import { useApp } from '../../context/AppContext';
import { AdminDashboard } from './AdminDashboard';
import { MarketingDashboard } from './MarketingDashboard';
import { SalesDashboard } from './SalesDashboard';

export const DashboardView: React.FC = () => {
  const { currentUser } = useApp();

  // Tampilkan dashboard yang disesuaikan secara spesifik berdasarkan role
  switch (currentUser.role) {
    case 'Marketing':
      return <MarketingDashboard />;

    case 'Sales':
    case 'AM':
      return <SalesDashboard />;

    case 'Administrator':
    case 'Super Admin':
    default:
      return <AdminDashboard />;
  }
};
