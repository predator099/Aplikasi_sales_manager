import React from 'react';
import { useApp } from '../../context/AppContext';
import { ActiveMenu } from '../../types';
import {
  LayoutGrid,
  Building2,
  Zap,
  Globe2,
  ReceiptText,
  FilePlus2,
  FileText,
  WalletCards,
  Calculator,
  ShieldCheck,
  ScrollText,
  ChevronLeft,
  ChevronRight,
  Route,
  Radio,
  LogOut,
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
}) => {
  const { activeMenu, setActiveMenu, currentUser, logout } = useApp();

  const handleNavClick = (menu: ActiveMenu) => {
    setActiveMenu(menu);
    setMobileOpen(false);
  };

  // Filter menu berdasarkan peran pengguna (Administrator, Marketing, Sales)
  const isAllowedMenu = (menuId: ActiveMenu): boolean => {
    const role = currentUser.role;

    // Administrator memiliki akses ke seluruh menu
    if (role === 'Administrator' || role === 'Super Admin') {
      return true;
    }

    // Role Marketing: Dashboard, Database Pelanggan, Penawaran, Komisi Marketing, Katalog Layanan (Paket Internet, Metro, IP Publik), Rumus Tarif
    if (role === 'Marketing') {
      return [
        'dashboard',
        'customers',
        'quotations',
        'marketing-fee',
        'master-pricing',
        'metro',
        'public-ip',
        'formula-settings',
      ].includes(menuId);
    }

    // Role Sales: Dashboard, Database Pelanggan, Penawaran, Buat Layanan, Komisi Marketing, Katalog Layanan (Paket Internet, Metro, IP Publik)
    if (role === 'Sales' || role === 'AM') {
      return [
        'dashboard',
        'customers',
        'quotations',
        'create-service',
        'marketing-fee',
        'master-pricing',
        'metro',
        'public-ip',
      ].includes(menuId);
    }

    // Default fallback untuk role lain (Finance, NOC, dll)
    if (role === 'Finance' || role === 'Accounting') {
      return [
        'dashboard',
        'customers',
        'invoices',
        'marketing-fee',
        'master-pricing',
        'metro',
        'audit-log',
      ].includes(menuId);
    }

    if (role === 'NOC / Teknis') {
      return [
        'dashboard',
        'customers',
        'public-ip',
        'metro',
        'audit-log',
      ].includes(menuId);
    }

    return true;
  };

  const rawNavGroups = [
    {
      title: 'Utama',
      items: [
        {
          id: 'dashboard' as ActiveMenu,
          label: 'Dashboard',
          icon: LayoutGrid,
        },
        {
          id: 'customers' as ActiveMenu,
          label: 'Database Pelanggan',
          icon: Building2,
        },
        {
          id: 'quotations' as ActiveMenu,
          label: 'Penawaran (Quotation)',
          icon: FileText,
        },
        {
          id: 'invoices' as ActiveMenu,
          label: 'Faktur & Tagihan',
          icon: ReceiptText,
        },
        {
          id: 'create-service' as ActiveMenu,
          label: 'Buat Layanan',
          icon: FilePlus2,
        },
        {
          id: 'marketing-fee' as ActiveMenu,
          label: 'Komisi Marketing',
          icon: WalletCards,
        },
      ],
    },
    {
      title: 'Katalog Layanan',
      items: [
        {
          id: 'master-pricing' as ActiveMenu,
          label: 'Paket Internet',
          icon: Zap,
        },
        {
          id: 'metro' as ActiveMenu,
          label: 'Metro Ethernet',
          icon: Route,
        },
        {
          id: 'public-ip' as ActiveMenu,
          label: 'Alokasi IP Publik',
          icon: Globe2,
        },
      ],
    },
    {
      title: 'Sistem & Konfigurasi',
      items: [
        {
          id: 'formula-settings' as ActiveMenu,
          label: 'Rumus Tarif & Fee',
          icon: Calculator,
        },
        {
          id: 'users' as ActiveMenu,
          label: 'Pengguna Sistem',
          icon: ShieldCheck,
        },
        {
          id: 'audit-log' as ActiveMenu,
          label: 'Log Aktivitas',
          icon: ScrollText,
        },
      ],
    },
  ];

  const navGroups = rawNavGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => isAllowedMenu(item.id)),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen bg-[#0E1526] text-slate-300 transition-all duration-200 flex flex-col border-r border-slate-800/80 shadow-lg select-none ${
          collapsed ? 'w-20' : 'w-64'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-slate-800/80 bg-[#0A101D]">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-7 h-7 rounded-md bg-teal-600 flex items-center justify-center text-white flex-shrink-0 shadow-xs">
              <Radio className="w-3.5 h-3.5" />
            </div>
            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs tracking-tight text-white truncate">
                    ANTEN
                  </span>
                  <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-slate-800 text-teal-400 border border-slate-700">
                    v1.0
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium truncate">
                  ISP Business Manager
                </span>
              </div>
            )}
          </div>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title={collapsed ? 'Perluas Sidebar' : 'Ciutkan Sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto py-3 px-2.5 space-y-4">
          {navGroups.map((group) => (
            <div key={group.title} className="space-y-0.5">
              {!collapsed && (
                <h3 className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  {group.title}
                </h3>
              )}
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeMenu === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    title={collapsed ? item.label : undefined}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs transition-colors relative group cursor-pointer ${
                      isActive
                        ? 'bg-teal-700/20 text-teal-300 font-semibold border border-teal-500/30'
                        : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 flex-shrink-0 ${
                        isActive
                          ? 'text-teal-400'
                          : 'text-slate-400 group-hover:text-slate-200'
                      }`}
                    />
                    {!collapsed && (
                      <span className="truncate text-left flex-1 font-medium">{item.label}</span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* User Account & Logout */}
        <div className="p-2 border-t border-slate-800/80 bg-[#0A101D]">
          {!collapsed ? (
            <div className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-slate-900/80 border border-slate-800">
              <div className="w-7 h-7 rounded-md bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                {currentUser.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  currentUser.name.charAt(0)
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-200 truncate leading-tight">
                  {currentUser.name}
                </p>
                <p className="text-[10px] text-teal-400 font-medium truncate">
                  {currentUser.role}
                </p>
              </div>
              <button
                id="sidebar-logout-btn"
                type="button"
                onClick={logout}
                title="Keluar dari Akun (Logout)"
                className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              id="sidebar-collapsed-logout-btn"
              type="button"
              onClick={logout}
              title="Keluar dari Akun (Logout)"
              className="w-full flex justify-center p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
