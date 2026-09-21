import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Menu,
  ChevronDown,
  User,
  LogOut,
  Bell,
} from 'lucide-react';

interface TopbarProps {
  onToggleMobileMenu: () => void;
  collapsed: boolean;
}

export const Topbar: React.FC<TopbarProps> = ({ onToggleMobileMenu, collapsed }) => {
  const { currentUser, logout, activeMenu } = useApp();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getMenuBreadcrumb = () => {
    switch (activeMenu) {
      case 'dashboard':
        return 'Dashboard';
      case 'customers':
        return 'Database Pelanggan';
      case 'quotations':
        return 'Penawaran (Quotation)';
      case 'invoices':
        return 'Faktur & Tagihan (Billing)';
      case 'create-service':
        return 'Buat Layanan Pelanggan';
      case 'marketing-fee':
        return 'Alokasi & Pencairan Fee Marketing';
      case 'master-pricing':
        return 'Katalog Paket Internet Dedicated';
      case 'metro':
      case 'master-metro':
        return 'Katalog Metro Ethernet';
      case 'public-ip':
      case 'master-ip':
        return 'Katalog IP Publik';
      case 'formula-settings':
        return 'Pengaturan Rumus Tarif & Fee';
      case 'users':
        return 'Manajemen Pengguna';
      case 'audit-log':
        return 'Log Aktivitas Sistem';
      default:
        return 'Dashboard';
    }
  };

  return (
    <header
      id="topbar-header"
      className={`sticky top-0 z-30 h-14 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all duration-300 flex items-center justify-between px-4 sm:px-8 ${
        collapsed ? 'lg:pl-24' : 'lg:pl-72'
      }`}
    >
      {/* Sisi Kiri: Tombol Menu Mobile & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          id="mobile-menu-toggle-btn"
          onClick={onToggleMobileMenu}
          className="lg:hidden p-1.5 -ml-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Buka menu"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 hidden sm:inline">ANTEN Business</span>
          <span className="text-slate-300 hidden sm:inline">/</span>
          <span className="font-semibold text-slate-900">{getMenuBreadcrumb()}</span>
        </div>
      </div>

      {/* Sisi Kanan: Informasi Pengguna yang Login */}
      <div className="flex items-center gap-3" ref={dropdownRef}>
        <div className="relative">
          <button
            id="user-profile-menu-btn"
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex items-center gap-2.5 py-1 px-2 rounded-lg hover:bg-slate-100/80 transition-colors text-left cursor-pointer border border-transparent hover:border-slate-200"
          >
            <div className="w-7 h-7 rounded-md bg-slate-900 text-white flex items-center justify-center text-xs font-semibold overflow-hidden flex-shrink-0">
              {currentUser.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-3.5 h-3.5" />
              )}
            </div>

            <div className="hidden sm:block text-left">
              <span className="text-xs font-semibold text-slate-800 block leading-tight max-w-[140px] truncate">
                {currentUser.name}
              </span>
              <span className="text-[10px] text-slate-400 font-medium block">
                {currentUser.role}
              </span>
            </div>

            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-150 ${
                userDropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Menu Dropdown Profil Akun */}
          {userDropdownOpen && (
            <div
              id="user-profile-dropdown"
              className="absolute right-0 mt-1.5 w-60 bg-white rounded-xl shadow-lg border border-slate-200/90 p-3 z-50 animate-in fade-in duration-100"
            >
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center text-xs font-bold overflow-hidden flex-shrink-0">
                  {currentUser.avatarUrl ? (
                    <img
                      src={currentUser.avatarUrl}
                      alt={currentUser.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {currentUser.name}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">
                    {currentUser.email}
                  </p>
                </div>
              </div>

              <div className="pt-2.5 space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="text-slate-400 text-[11px]">Role Akun</span>
                  <span className="font-semibold text-teal-800 bg-teal-50 border border-teal-200/60 px-2 py-0.5 rounded text-[10px]">
                    {currentUser.role}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="text-slate-400 text-[11px]">Username</span>
                  <span className="font-mono text-slate-700 text-[11px]">
                    @{currentUser.username}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="text-slate-400 text-[11px]">Status</span>
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-medium text-[11px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Aktif
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <button
                    id="user-logout-dropdown-btn"
                    type="button"
                    onClick={() => {
                      setUserDropdownOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Keluar dari Sistem</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
