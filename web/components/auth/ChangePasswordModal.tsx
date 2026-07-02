'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { api, ApiError } from '@/lib/api';

// UF-02 Change Password. Validasi konfirmasi (E2) di klien, password lama (E1)
// diverifikasi backend. Feedback jelas tiap aksi (DS §19).
export function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 8) {
      setError('Password baru minimal 8 karakter.');
      return;
    }
    if (newPassword !== confirm) {
      setError('Konfirmasi password tidak cocok.'); // E2
      return;
    }

    setBusy(true);
    try {
      await api('/auth/change-password', {
        method: 'POST',
        body: { currentPassword, newPassword },
      });
      setDone(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal mengubah password.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Ganti Password"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-card border border-line bg-ink-800 p-6 shadow-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-extrabold">Ganti Password</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="text-paper-dim hover:text-paper"
          >
            <X size={18} aria-hidden />
          </button>
        </div>

        {done ? (
          <div className="space-y-4">
            <p className="rounded-input border border-up/40 bg-up/10 px-3 py-2 text-sm text-up">
              Password berhasil diubah.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-chip bg-flash px-3 py-2 text-sm font-semibold text-ink-900"
            >
              Selesai
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <Field
              label="Password lama"
              value={currentPassword}
              onChange={setCurrentPassword}
            />
            <Field label="Password baru" value={newPassword} onChange={setNewPassword} />
            <Field label="Konfirmasi password baru" value={confirm} onChange={setConfirm} />

            {error && (
              <p className="rounded-input border border-down/40 bg-down/10 px-3 py-2 text-sm text-down">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-chip bg-flash px-3 py-2 text-sm font-semibold text-ink-900 transition-opacity disabled:opacity-60"
            >
              {busy ? 'Menyimpan…' : 'Simpan'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="mb-1 block font-mono text-xs text-paper-faint">{label}</label>
      <input
        type="password"
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-input border border-line bg-ink-900 px-3 py-2 text-sm text-paper outline-none focus:border-flash"
      />
    </div>
  );
}
