'use client';

import { useEffect, useMemo, useState } from 'react';

type AdminConversation = {
  id: string;
  partner: { id: string; name: string; email: string };
  level: number;
  totalXp: number;
};

type AdminUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  age: number;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isAgeVerified: boolean;
  selfDescription: string | null;
  city: string | null;
  country: string | null;
  ageMin: number | null;
  ageMax: number | null;
  conversations: AdminConversation[];
};

function getToken() {
  return typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
}

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  const selected = useMemo(
    () => users.find((u) => u.id === selectedUserId) ?? null,
    [selectedUserId, users]
  );

  const loadUsers = async (query = '') => {
    const token = getToken();
    if (!token) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users?search=${encodeURIComponent(query)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401 || res.status === 403 || res.status === 503) {
        setForbidden(true);
        setUsers([]);
        return;
      }

      const data = await res.json();
      const list = (data?.users ?? []) as AdminUser[];
      setUsers(list);
      setSelectedUserId((prev) => prev ?? list[0]?.id ?? null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const patchUser = async (id: string, payload: Partial<AdminUser>) => {
    const token = getToken();
    if (!token) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Update failed');
      await loadUsers(search);
    } catch {
      alert('Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  const updateConversationLevel = async (conversationId: string, level: number, totalXp: number) => {
    const token = getToken();
    if (!token) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/conversations/${conversationId}/level`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ level, totalXp }),
      });
      if (!res.ok) throw new Error('Update failed');
      await loadUsers(search);
    } catch {
      alert('Failed to update level');
    } finally {
      setSaving(false);
    }
  };

  const resetPassword = async () => {
    if (!selected) return;
    if (newPassword.length < 8) {
      alert('Password must be at least 8 characters');
      return;
    }

    const token = getToken();
    if (!token) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${selected.id}/password`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newPassword }),
      });
      if (!res.ok) throw new Error('Password reset failed');
      setNewPassword('');
      alert('Password updated. Existing password cannot be viewed.');
    } catch {
      alert('Failed to update password');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white dark:bg-black">
        <div className="w-10 h-10 rounded-full border-4 border-rose-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (forbidden) {
    return (
      <div className="h-screen bg-white dark:bg-black flex items-center justify-center px-6 text-center">
        <div>
          <h1 className="text-2xl font-bold text-black dark:text-white">Admin access denied</h1>
          <p className="text-sm text-gray-500 mt-2">Set `ADMIN_EMAILS` with your email(s) in env, comma-separated.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black p-4 sm:p-6">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-[340px_1fr] gap-4">
        <aside className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-zinc-950 p-4">
          <h1 className="text-xl font-bold text-black dark:text-white">Admin Panel</h1>
          <p className="text-xs text-gray-500 mt-1">Manage users, levels, and password resets.</p>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, phone"
            className="mt-3 w-full h-10 px-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-zinc-900 text-sm"
          />
          <button
            onClick={() => loadUsers(search)}
            className="mt-2 h-9 w-full rounded-xl bg-rose-500 text-white text-sm font-semibold"
          >
            Search
          </button>

          <div className="mt-3 space-y-2 max-h-[70vh] overflow-y-auto">
            {users.map((u) => (
              <button
                key={u.id}
                onClick={() => setSelectedUserId(u.id)}
                className={`w-full text-left rounded-xl border p-3 ${
                  selectedUserId === u.id
                    ? 'border-rose-400 bg-rose-50 dark:bg-rose-900/20'
                    : 'border-gray-200 dark:border-gray-800'
                }`}
              >
                <p className="text-sm font-semibold text-black dark:text-white truncate">{u.name}</p>
                <p className="text-xs text-gray-500 truncate">{u.email}</p>
                <p className="text-[11px] text-gray-400 mt-1">{u.conversations.length} convs</p>
              </button>
            ))}
          </div>
        </aside>

        <section className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-zinc-950 p-4">
          {!selected ? (
            <p className="text-sm text-gray-500">Select a user to edit.</p>
          ) : (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-black dark:text-white">{selected.name}</h2>
                <p className="text-xs text-gray-500">{selected.email}</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <label className="text-sm">
                  <span className="text-xs text-gray-500">Name</span>
                  <input
                    defaultValue={selected.name}
                    onBlur={(e) => patchUser(selected.id, { name: e.target.value })}
                    className="mt-1 w-full h-10 px-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent"
                  />
                </label>
                <label className="text-sm">
                  <span className="text-xs text-gray-500">Age</span>
                  <input
                    type="number"
                    defaultValue={selected.age}
                    onBlur={(e) => patchUser(selected.id, { age: Number(e.target.value) })}
                    className="mt-1 w-full h-10 px-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent"
                  />
                </label>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => patchUser(selected.id, { isEmailVerified: !selected.isEmailVerified })}
                  className="px-3 py-2 rounded-xl text-xs font-semibold border border-gray-300 dark:border-gray-700"
                >
                  Email: {selected.isEmailVerified ? 'Verified' : 'Pending'}
                </button>
                <button
                  onClick={() => patchUser(selected.id, { isPhoneVerified: !selected.isPhoneVerified })}
                  className="px-3 py-2 rounded-xl text-xs font-semibold border border-gray-300 dark:border-gray-700"
                >
                  Phone: {selected.isPhoneVerified ? 'Verified' : 'Pending'}
                </button>
                <button
                  onClick={() => patchUser(selected.id, { isAgeVerified: !selected.isAgeVerified })}
                  className="px-3 py-2 rounded-xl text-xs font-semibold border border-gray-300 dark:border-gray-700"
                >
                  Age: {selected.isAgeVerified ? 'Verified' : 'Pending'}
                </button>
              </div>

              <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-3">
                <p className="text-sm font-semibold text-black dark:text-white">Password reset</p>
                <p className="text-xs text-gray-500 mt-1">Passwords are hashed and cannot be viewed.</p>
                <div className="mt-2 flex gap-2">
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Set new password"
                    className="flex-1 h-10 px-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent"
                  />
                  <button
                    onClick={resetPassword}
                    disabled={saving}
                    className="h-10 px-4 rounded-xl bg-rose-500 text-white text-sm font-semibold disabled:opacity-50"
                  >
                    Update
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-3">
                <p className="text-sm font-semibold text-black dark:text-white">Conversations & levels</p>
                <div className="mt-2 space-y-2">
                  {selected.conversations.length === 0 ? (
                    <p className="text-xs text-gray-500">No conversations.</p>
                  ) : (
                    selected.conversations.map((c) => (
                      <div key={c.id} className="rounded-lg border border-gray-200 dark:border-gray-800 p-2 flex items-center gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-black dark:text-white truncate">{c.partner.name}</p>
                          <p className="text-[11px] text-gray-500 truncate">{c.partner.email}</p>
                        </div>
                        <input
                          type="number"
                          defaultValue={c.level}
                          min={1}
                          className="w-16 h-8 px-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent text-xs"
                          id={`lvl-${c.id}`}
                        />
                        <input
                          type="number"
                          defaultValue={c.totalXp}
                          min={0}
                          className="w-24 h-8 px-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent text-xs"
                          id={`xp-${c.id}`}
                        />
                        <button
                          onClick={() => {
                            const lvl = Number((document.getElementById(`lvl-${c.id}`) as HTMLInputElement)?.value ?? c.level);
                            const xp = Number((document.getElementById(`xp-${c.id}`) as HTMLInputElement)?.value ?? c.totalXp);
                            updateConversationLevel(c.id, lvl, xp);
                          }}
                          className="h-8 px-3 rounded-lg bg-black text-white dark:bg-white dark:text-black text-xs font-semibold"
                        >
                          Save
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
