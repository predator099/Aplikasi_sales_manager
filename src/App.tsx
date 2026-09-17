import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { ToastContainer } from './components/common/ToastContainer';
import { DashboardView } from './components/dashboard/DashboardView';
import { CustomerListView } from './components/customers/CustomerListView';
import { MasterPricingView } from './components/pricing/MasterPricingView';
import { MasterMetroView } from './components/metro/MasterMetroView';
import { MasterPublicIpView } from './components/publicIp/MasterPublicIpView';
import { CreateServiceView } from './components/services/CreateServiceView';
import { QuotationListView } from './components/quotations/QuotationListView';
import { InvoiceListView } from './components/invoices/InvoiceListView';
import { MarketingFeeDashboard } from './components/marketing/MarketingFeeDashboard';
import { UsersManagementView } from './components/users/UsersManagementView';
import { AuditLogView } from './components/audit/AuditLogView';
import { LoginPage } from './components/auth/LoginPage';

const MainContent: React.FC = () => {
  const { activeMenu, isAuthenticated } = useApp();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const renderActiveView = () => {
    switch (activeMenu) {
      case 'dashboard':
        return <DashboardView />;
      case 'customers':
        return <CustomerListView />;
      case 'master-pricing':
        return <MasterPricingView />;
      case 'metro':
      case 'master-metro':
        return <MasterMetroView />;
      case 'public-ip':
      case 'master-ip':
        return <MasterPublicIpView />;
      case 'create-service':
        return <CreateServiceView />;
      case 'quotations':
        return <QuotationListView />;
      case 'invoices':
        return <InvoiceListView />;
      case 'marketing-fee':
        return <MarketingFeeDashboard />;
      case 'users':
        return <UsersManagementView />;
      case 'audit-log':
        return <AuditLogView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased selection:bg-teal-100 selection:text-teal-900">
      {/* Sidebar */}
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Column */}
      <div className="flex-1 flex flex-col transition-all duration-300">
        <Topbar
          collapsed={collapsed}
          onToggleMobileMenu={() => setMobileOpen(!mobileOpen)}
        />

        <main
          className={`flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto transition-all duration-300 ${
            collapsed ? 'lg:pl-24' : 'lg:pl-72'
          }`}
        >
          {renderActiveView()}
        </main>

        <footer
          className={`py-4 px-6 text-center text-xs text-slate-400 border-t border-slate-200/70 transition-all duration-300 ${
            collapsed ? 'lg:pl-24' : 'lg:pl-72'
          }`}
        >
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>ANTEN Business Manager — Solusi Bisnis & Penjualan ISP</span>
            <span className="font-mono text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              v1.0.0
            </span>
          </div>
        </footer>
      </div>

      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
