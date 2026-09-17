import React from 'react';
import { useApp } from '../../context/AppContext';
import { ActiveMenu } from '../../types';
import {
  LayoutGrid,
  Building2,
  Zap,
  Route,
  Globe2,
  FilePlus2,
  FileText,
  ReceiptText,
  WalletCards,
  ShieldCheck,
  ScrollText,
  Radio,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
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

  const navGroups = [
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
          label: 'Pelanggan',
          icon: Building2,
        },
        {
          id: 'quotations' as ActiveMenu,
          label: 'Penawaran',
          icon: FileText,
        },
        {
          id: 'invoices' as ActiveMenu,
          label: 'Faktur',
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
      title: 'Katalog Jaringan',
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
          label: 'IP Publik',
          icon: Globe2,
        },
      ],
    },
    {
      title: 'Pengaturan',
      items: [
        {
          id: 'users' as ActiveMenu,
          label: 'Pengguna',
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

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen bg-[#0B0F19] text-slate-200 transition-all duration-300 flex flex-col border-r border-slate-800/60 shadow-xl select-none ${
          collapsed ? 'w-20' : 'w-64'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-slate-800/60">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white font-bold flex-shrink-0 shadow-xs">
              <Radio className="w-4 h-4" />
            </div>
            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-[13px] tracking-tight text-white truncate font-sans">
                    ANTEN
                  </span>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                    v1.0.0
                  </span>
                </div>
                <span className="text-[10px] tracking-wider text-slate-400 uppercase font-medium truncate">
                  Business Manager
                </span>
              </div>
            )}
          </div>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/70 transition-colors"
            title={collapsed ? 'Perluas Sidebar' : 'Ciutkan Sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
          {navGroups.map((group) => (
            <div key={group.title} className="space-y-1">
              {!collapsed && (
                <h3 className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
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
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all duration-150 relative group cursor-pointer ${
                      isActive
                        ? 'bg-slate-800 text-white font-semibold shadow-xs'
                        : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 flex-shrink-0 transition-colors ${
                        isActive
                          ? 'text-teal-400'
                          : 'text-slate-400 group-hover:text-slate-200'
                      }`}
                    />
                    {!collapsed && (
                      <span className="truncate text-left flex-1">{item.label}</span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* User Account & Logout */}
        <div className="p-2.5 border-t border-slate-800/80 bg-slate-950/40">
          {!collapsed ? (
            <div className="flex items-center justify-between gap-2 p-1.5 rounded-xl bg-slate-900/60 border border-slate-800/70">
              <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
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
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors cursor-pointer"
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
              className="w-full flex justify-center p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sidebar Version Footer */}
        <div className="p-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400 bg-[#080C14]">
          {!collapsed ? (
            <>
              <span className="text-[10px] font-medium text-slate-400 tracking-wide">Versi Aplikasi</span>
              <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-teal-400 border border-slate-700">
                v1.0.0
              </span>
            </>
          ) : (
            <span className="font-mono text-[9px] font-bold text-teal-400 mx-auto">
              v1.0.0
            </span>
          )}
        </div>
      </aside>
    </>
  );
};
