import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Menu,
  ChevronDown,
  User,
  LogOut,
} from 'lucide-react';

interface TopbarProps {
  onToggleMobileMenu: () => void;
  collapsed: boolean;
}

export const Topbar: React.FC<TopbarProps> = ({ onToggleMobileMenu, collapsed }) => {
  const { currentUser, logout } = useApp();
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

  return (
    <header
      id="topbar-header"
      className={`sticky top-0 z-30 h-14 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all duration-300 flex items-center justify-between px-4 sm:px-8 ${
        collapsed ? 'lg:pl-24' : 'lg:pl-72'
      }`}
    >
      {/* Sisi Kiri: Tombol Menu Mobile & Badge Versi */}
      <div className="flex items-center gap-2.5">
        <button
          id="mobile-menu-toggle-btn"
          onClick={onToggleMobileMenu}
          className="lg:hidden p-1.5 -ml-1.5 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Buka menu"
        >
          <Menu className="w-4 h-4" />
        </button>
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200/70">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
          ANTEN v1.0.0
        </span>
      </div>

      {/* Sisi Kanan: Informasi Pengguna yang Login */}
      <div className="flex items-center gap-2" ref={dropdownRef}>
        <div className="relative">
          <button
            id="user-profile-menu-btn"
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-slate-100 transition-colors text-left cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-semibold overflow-hidden flex-shrink-0">
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

            <span className="hidden sm:inline text-xs font-medium text-slate-700 max-w-[150px] truncate">
              {currentUser.name}
            </span>

            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-150 ${
                userDropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Menu Informasi User Login Saja */}
          {userDropdownOpen && (
            <div
              id="user-profile-dropdown"
              className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-3.5 z-50 animate-in fade-in duration-100"
            >
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <div className="w-10 h-10 rounded-lg bg-slate-900 text-white flex items-center justify-center text-sm font-semibold overflow-hidden flex-shrink-0">
                  {currentUser.avatarUrl ? (
                    <img
                      src={currentUser.avatarUrl}
                      alt={currentUser.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-5 h-5" />
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

              <div className="pt-3 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="text-slate-400 text-[11px]">Peran:</span>
                  <span className="font-medium text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                    {currentUser.role}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="text-slate-400 text-[11px]">Username:</span>
                  <span className="font-mono text-slate-700 text-[11px]">
                    @{currentUser.username}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="text-slate-400 text-[11px]">Status Akun:</span>
                  <span className="inline-flex items-center gap-1.5 text-emerald-600 font-medium text-[11px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Aktif
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-600 pt-2 border-t border-slate-100">
                  <span className="text-slate-400 text-[11px]">Versi Sistem:</span>
                  <span className="font-mono font-bold text-teal-700 bg-teal-50 border border-teal-200 px-1.5 py-0.5 rounded text-[10px]">
                    v1.0.0
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
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Keluar (Logout)</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tombol Cepat Logout */}
        <button
          id="topbar-quick-logout-btn"
          type="button"
          onClick={logout}
          title="Keluar dari Sistem (Logout)"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-red-50 hover:border-red-200 text-slate-600 hover:text-red-700 text-xs font-medium transition-colors cursor-pointer shadow-xs"
        >
          <LogOut className="w-3.5 h-3.5 text-slate-400 group-hover:text-red-600" />
          <span className="hidden md:inline">Keluar</span>
        </button>
      </div>
    </header>
  );
};
