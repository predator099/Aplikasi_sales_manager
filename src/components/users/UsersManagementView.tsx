import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User, UserRole } from '../../types';
import { UserRoleBadge } from '../common/Badge';
import { ConfirmDialog } from '../common/ConfirmDialog';
import {
  Shield,
  Plus,
  Edit2,
  Trash2,
  X,
  UserCheck,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export const UsersManagementView: React.FC = () => {
  const { users, addUser, updateUser, deleteUser, currentUser } = useApp();

  const [modalOpen, setModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('Sales');
  const [status, setStatus] = useState<'Aktif' | 'Tidak Aktif' | 'Nonaktif'>('Aktif');
  const [password, setPassword] = useState('');

  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const openAddModal = () => {
    setUserToEdit(null);
    setName('');
    setUsername('');
    setEmail('');
    setRole('Sales');
    setStatus('Aktif');
    setPassword('anten123');
    setModalOpen(true);
  };

  const openEditModal = (u: User) => {
    setUserToEdit(u);
    setName(u.name);
    setUsername(u.username);
    setEmail(u.email);
    setRole(u.role);
    setStatus(u.status);
    setPassword(u.password || '');
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !username.trim() || !email.trim()) return;

    if (userToEdit) {
      updateUser(userToEdit.id, {
        name: name.trim(),
        username: username.trim(),
        email: email.trim(),
        role,
        status,
        ...(password.trim() ? { password: password.trim() } : {}),
      });
    } else {
      addUser({
        name: name.trim(),
        username: username.trim(),
        email: email.trim(),
        role,
        status,
        password: password.trim() || 'anten123',
      });
    }
    setModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Pengguna & Hak Akses
            </h1>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
              {users.length} Pengguna
            </span>
          </div>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tambah Pengguna</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-3.5 border-b border-slate-200/80 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-slate-700" />
            <h2 className="text-sm font-bold text-slate-900">
              Daftar Staf Internal ({users.length})
            </h2>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200/80 text-slate-500 font-semibold text-[11px]">
                <th className="py-2.5 px-3.5">ID Pengguna</th>
                <th className="py-2.5 px-3.5">Nama Lengkap</th>
                <th className="py-2.5 px-3.5">Username</th>
                <th className="py-2.5 px-3.5">Email</th>
                <th className="py-2.5 px-3.5">Peran (Role)</th>
                <th className="py-2.5 px-3.5">Status</th>
                <th className="py-2.5 px-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => {
                const isCurrent = currentUser?.id === u.id;

                return (
                  <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-3.5 font-mono font-semibold text-slate-900">
                      {u.id}
                      {isCurrent && (
                        <span className="ml-2 text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-sans font-medium border border-slate-200">
                          Anda
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3.5 font-semibold text-slate-900">{u.name}</td>
                    <td className="py-3 px-3.5 font-mono text-slate-500">@{u.username}</td>
                    <td className="py-3 px-3.5 text-slate-600">{u.email}</td>
                    <td className="py-3 px-3.5">
                      <UserRoleBadge role={u.role} />
                    </td>
                    <td className="py-3 px-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-medium border ${
                          u.status === 'Aktif'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'Aktif' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(u)}
                          className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                          title="Ubah Data Pengguna"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setUserToDelete(u)}
                          disabled={isCurrent}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                          title="Hapus Pengguna"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit User */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-xl border border-slate-200/80 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                {userToEdit ? 'Ubah Data Pengguna' : 'Tambah Pengguna Baru'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs mt-3.5">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Lengkap <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Rian Pratama"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Username <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="rian_sales"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Email Korporat <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="rian@anten.net.id"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Peran / Hak Akses</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-900 font-medium"
                >
                  <option value="Administrator">Administrator (Semua Menu & Konfigurasi)</option>
                  <option value="Marketing">Marketing (Dashboard, Pelanggan, Penawaran, Komisi, Katalog & Rumus)</option>
                  <option value="Sales">Sales (Dashboard, Pelanggan, Penawaran, Buat Layanan, Komisi & Katalog)</option>
                  <option value="Finance">Finance (Faktur, Komisi & Keuangan)</option>
                  <option value="NOC / Teknis">NOC / Teknis (IP Publik & Metro)</option>
                  <option value="Super Admin">Super Admin</option>
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Sidebar dan akses menu aplikasi akan otomatis disesuaikan dengan peran yang dipilih.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Kata Sandi (Password)
                </label>
                <input
                  type="text"
                  placeholder="Masukkan sandi (default: anten123)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 font-mono text-sm"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  {userToEdit ? 'Kosongkan jika tidak ingin mengubah sandi.' : 'Sandi untuk login pengguna ke portal ANTEN.'}
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Status Akun</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'Aktif' | 'Tidak Aktif')}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-900 font-medium"
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Tidak Aktif">Tidak Aktif</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3.5 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-slate-900 hover:bg-slate-800 rounded-lg font-semibold shadow-xs cursor-pointer transition-colors"
                >
                  Simpan Pengguna
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      <ConfirmDialog
        isOpen={!!userToDelete}
        title="Hapus Akun Pengguna?"
        message={`Apakah Anda yakin ingin menghapus akun "${userToDelete?.name}" (${userToDelete?.username})?`}
        confirmLabel="Ya, Hapus"
        onConfirm={() => {
          if (userToDelete) deleteUser(userToDelete.id);
        }}
        onCancel={() => setUserToDelete(null)}
      />
    </div>
  );
};
