import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Lock, User, Eye, EyeOff, AlertCircle, Radio, ShieldCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, users } = useApp();

  const [identifier, setIdentifier] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!identifier.trim()) {
      setErrorMsg('Masukkan username atau email.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = login(identifier, password);
      setIsLoading(false);
      if (!res.success) {
        setErrorMsg(res.message);
      }
    }, 250);
  };

  const handleSelectDemo = (uName: string, pass: string) => {
    setIdentifier(uName);
    setPassword(pass);
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col justify-center items-center px-4 py-12 selection:bg-teal-100">
      <div className="w-full max-w-sm">
        {/* Brand Header */}
        <div className="text-center mb-7">
          <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-teal-800 text-white shadow-sm mb-3">
            <Radio className="w-5 h-5" />
          </div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">ANTEN</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            ISP Business & Billing Manager
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-6 sm:p-7">
          <div className="mb-5">
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              Autentikasi Pengguna
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Silakan masuk dengan akun terdaftar Anda
            </p>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label
                htmlFor="username-input"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Username / Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="username-input"
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="admin"
                  disabled={isLoading}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-teal-700 focus:ring-1 focus:ring-teal-700 transition-colors"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password-input"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Kata Sandi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={isLoading}
                  className="w-full pl-9 pr-10 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-teal-700 focus:ring-1 focus:ring-teal-700 transition-colors font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-hidden"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 px-4 rounded-lg bg-teal-800 hover:bg-teal-900 text-white font-semibold text-xs transition-colors shadow-2xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
            >
              {isLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                <span>Masuk ke Dashboard</span>
              )}
            </button>
          </form>

          {/* Quick Demo Selector */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            <p className="text-[11px] font-semibold text-slate-500 mb-2 text-center uppercase tracking-wider">
              Akses Cepat Demo:
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              {users.slice(0, 3).map((u) => {
                const pass = u.password || 'admin123';
                const isSelected = identifier === u.username;
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleSelectDemo(u.username, pass)}
                    className={`px-2 py-1.5 rounded-lg text-left text-xs transition-colors border cursor-pointer ${
                      isSelected
                        ? 'bg-teal-50 border-teal-300 text-teal-900 font-semibold'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div className="truncate font-semibold text-[11px]">{u.role}</div>
                    <div className="text-[10px] text-slate-400 font-mono truncate">@{u.username}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-slate-400 mt-5 px-1">
          <span>&copy; 2026 ANTEN ISP</span>
          <span className="font-mono text-[10px] font-semibold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded shadow-2xs">
            v1.0.0
          </span>
        </div>
      </div>
    </div>
  );
};
