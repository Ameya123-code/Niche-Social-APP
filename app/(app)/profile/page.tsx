'use client';

import React, { useEffect, useCallback, useState } from 'react';
import { Settings, Pencil, LogOut, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Stores
import { useProfileStore, type GlobalProfile } from '@/store/profile';
import { useThemeStore } from '@/store/theme';
import { useUIStore } from '@/store/ui';

// Components
import { ThemeProvider } from '@/app/components/profile/ThemeProvider';
import ProfileCard from '@/components/ReactBitsProfileCard';
import { ProfileEditor } from '@/app/components/profile/ProfileEditor';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AuthUser {
  id: string;
  name: string;
  age: number;
  email: string;
  profileImageUrl?: string;
  selfDescription?: string;
  isAgeVerified: boolean;
  opinions: { id: string; content: string; hashtags: string; createdAt: string; likes: number }[];
}

type CardDesign = {
  isCustomized?: boolean;
  themeId?: string;
  stickers?: string[];
  borderStyle?: 'glass' | 'neon' | 'minimal';
  fontStyle?: 'modern' | 'mono' | 'playful';
  backgroundMode?: 'theme' | 'gif' | 'image' | 'gradient';
  gifUrl?: string;
};

const parseGradientCss = (raw?: string): string | undefined => {
  if (!raw) return undefined;
  try {
    const g = JSON.parse(raw) as { type?: string; angle?: number; colors?: string[] };
    if (g?.type === 'gradient' && Array.isArray(g.colors) && g.colors.length >= 2) {
      return `linear-gradient(${g.angle ?? 135}deg, ${g.colors.join(', ')})`;
    }
  } catch {
    // ignore non-JSON values
  }
  return undefined;
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const router = useRouter();

  // Auth user data
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [cardDesign, setCardDesign] = useState<CardDesign | undefined>(undefined);
  const [hasPromptedCustomization, setHasPromptedCustomization] = useState(false);

  // Stores
  const loadProfile = useProfileStore((s) => s.loadProfile);
  const effectiveProfile = useProfileStore((s) => s.effectiveProfile);
  const isProfileLoaded = useProfileStore((s) => s.isLoaded);
  const setIsSaving = useProfileStore((s) => s.setIsSaving);
  const setTheme = useThemeStore((s) => s.setTheme);
  const openEditor = useUIStore((s) => s.openEditor);

  // ─── Load auth user ───────────────────────────────────────────────────────

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) { router.push('/auth'); return; }
    fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => { if (d.user) setAuthUser(d.user as AuthUser); })
      .catch(() => {})
      .finally(() => setAuthLoading(false));
  }, [router]);

  // ─── Load profile customization ──────────────────────────────────────────

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token || !authUser) return;

    fetch('/api/users/me/profile', { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' })
      .then(async (r) => {
        if (!r.ok) throw new Error('Failed to load profile');
        return r.json();
      })
      .then((d) => {
        const p = d?.profile;
        const g = p?.global;
        loadProfile({
          userId: authUser.id,
          global: {
            avatar: g?.avatar ?? authUser.profileImageUrl ?? '',
            banner: g?.banner ?? '',
            avatarType: g?.avatarType ?? 'static',
            bannerType: g?.bannerType ?? 'gradient',
            theme: g?.theme ?? { primary: '#ef4444', accent: '#f97316' },
            bio: g?.bio ?? authUser.selfDescription ?? '',
            decorations: g?.decorations ?? [],
            badges: g?.badges ?? [],
            status: g?.status ?? 'online',
          },
          contexts: p?.contexts ?? {},
        });
        if (g?.theme?.primary && g?.theme?.accent) {
          setTheme({ primary: g.theme.primary, accent: g.theme.accent });
        }
      })
      .catch(() => {
        if (authUser) {
          loadProfile({
            userId: authUser.id,
            global: {
              avatar: authUser.profileImageUrl ?? '',
              banner: '',
              avatarType: 'static',
              bannerType: 'gradient',
              theme: { primary: '#ef4444', accent: '#f97316' },
              bio: authUser.selfDescription ?? '',
              decorations: [],
              badges: [],
              status: 'online',
            },
            contexts: {},
          });
        }
      });
  }, [authUser, loadProfile, setTheme]);

  const loadCardDesign = useCallback(async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;
    try {
      const res = await fetch('/api/users/me/card-design', {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      if (!res.ok) return;
      const d = await res.json() as { cardDesign?: CardDesign };
      if (d?.cardDesign) setCardDesign(d.cardDesign);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (!authUser) return;
    loadCardDesign();
  }, [authUser, loadCardDesign]);

  useEffect(() => {
    const onUpdated = () => { loadCardDesign(); };
    window.addEventListener('card-design-updated', onUpdated);
    return () => window.removeEventListener('card-design-updated', onUpdated);
  }, [loadCardDesign]);

  useEffect(() => {
    const requestedTab = typeof window !== 'undefined' ? localStorage.getItem('open_profile_editor_tab') : null;
    if (!requestedTab) return;
    localStorage.removeItem('open_profile_editor_tab');
    openEditor(requestedTab === 'card' ? 'card' : 'avatar');
  }, [openEditor]);

  useEffect(() => {
    if (!authUser || hasPromptedCustomization) return;
    if (!cardDesign) return;
    if (cardDesign.isCustomized) return;
    setHasPromptedCustomization(true);
    openEditor('card');
  }, [authUser, cardDesign, hasPromptedCustomization, openEditor]);

  // ─── Save handler ─────────────────────────────────────────────────────────

  const handleSave = useCallback(
    async (patch: { global?: Partial<GlobalProfile> }) => {
      const token = localStorage.getItem('auth_token');
      if (!token || !authUser) return;
      setIsSaving(true);
      try {
        const res = await fetch('/api/users/me/profile', {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          cache: 'no-store',
          body: JSON.stringify(patch),
        });
        if (!res.ok) throw new Error('Failed to save profile');
        const data = await res.json() as {
          profile?: {
            global?: GlobalProfile;
            contexts?: Record<string, import('@/store/profile').ProfileContextData>;
          };
        };

        const savedGlobal = data?.profile?.global;
        if (savedGlobal) {
          loadProfile({
            userId: authUser.id,
            global: savedGlobal,
            contexts: data.profile?.contexts ?? {},
          });

          if (savedGlobal.theme?.primary && savedGlobal.theme?.accent) {
            setTheme({ primary: savedGlobal.theme.primary, accent: savedGlobal.theme.accent });
          }
        }

        const mirroredPatch: { profileImageUrl?: string; selfDescription?: string } = {};
        if (typeof patch.global?.avatar === 'string') mirroredPatch.profileImageUrl = patch.global.avatar;
        if (typeof patch.global?.bio === 'string') mirroredPatch.selfDescription = patch.global.bio;

        if (Object.keys(mirroredPatch).length > 0) {
          const userRes = await fetch('/api/users/me', {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            cache: 'no-store',
            body: JSON.stringify(mirroredPatch),
          });

          if (userRes.ok) {
            const userData = await userRes.json() as {
              user?: AuthUser & { selfDescription?: string | null; profileImageUrl?: string | null };
            };
            if (userData.user) {
              setAuthUser((prev) => {
                if (!prev) return userData.user as AuthUser;
                return {
                  ...prev,
                  ...userData.user,
                } as AuthUser;
              });
            }
          }
        }
      } catch { /* ignore */ }
      finally { setIsSaving(false); }
    },
    [authUser, loadProfile, setAuthUser, setIsSaving, setTheme]
  );

  const parseHashtags = (s: string) => { try { return JSON.parse(s) as string[]; } catch { return [] as string[]; } };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    document.cookie = 'auth_token=; path=/; max-age=0';
    router.push('/');
  };

  // ─── Loading ──────────────────────────────────────────────────────────────

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-10 h-10 rounded-full border-4 border-[var(--primary,#ef4444)] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!authUser) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4 px-8 text-center">
        <p className="text-gray-500">Failed to load profile</p>
        <button onClick={() => router.push('/auth')} className="px-6 py-3 bg-red-500 text-white rounded-full font-semibold">Sign In</button>
      </div>
    );
  }

  const token = typeof window !== 'undefined' ? (localStorage.getItem('auth_token') ?? '') : '';
  const totalLikes = (authUser.opinions ?? []).reduce((s, o) => s + o.likes, 0);
  const interests = Array.from(new Set((authUser.opinions ?? [])
    .flatMap((o) => parseHashtags(o.hashtags))
    .map((tag) => tag.trim())
    .filter(Boolean)))
    .slice(0, 8)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1));
  const selectedAvatarFrame = [...(effectiveProfile.decorations ?? [])]
    .reverse()
    .find((d) => [
      'none',
      'neon-pink',
      'gold',
      'ice',
      'emerald',
      'fire',
      'rainbow',
      'sapphire',
      'amethyst',
      'ruby',
      'obsidian',
      'pearl',
      'rainbow-spin',
      'aurora',
      'pulse-neon',
      'cyber',
    ].includes(d)) ?? 'none';

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <ThemeProvider primary={effectiveProfile.theme.primary} accent={effectiveProfile.theme.accent}>
      <div
        className="min-h-screen"
        style={{
          background:
            `radial-gradient(900px 520px at 8% -10%, ${effectiveProfile.theme.primary}25 0%, transparent 55%),
             radial-gradient(860px 520px at 92% 0%, ${effectiveProfile.theme.accent}22 0%, transparent 58%),
             linear-gradient(180deg, #05070f 0%, #0a0d18 52%, #070a12 100%)`,
        }}
      >

        {/* Top bar */}
        <div className="relative z-30 mx-auto w-full max-w-7xl px-5 pt-8 pb-3">
          <div className="rounded-2xl border border-white/10 bg-black/35 backdrop-blur-md px-4 py-3 flex items-center justify-between">
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold text-white">Profile</h1>
              <p className="text-[11px] text-white/55">Card-first profile experience</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => openEditor('avatar')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-white"
                style={{ background: `linear-gradient(135deg, var(--primary), var(--accent))` }}
              >
                <Pencil className="w-3.5 h-3.5" />
                Edit Profile &amp; Card
              </button>
              <button
                type="button"
                onClick={() => router.push('/settings')}
                className="p-2 rounded-xl hover:bg-white/10 transition"
              >
                <Settings className="w-5 h-5 text-white/75" />
              </button>
              <button onClick={handleLogout} className="p-2 rounded-xl hover:bg-white/10 transition">
                <LogOut className="w-5 h-5 text-white/75" />
              </button>
            </div>
          </div>
        </div>

        {/* First-time customization prompt */}
        {cardDesign && !cardDesign.isCustomized && (
          <div className="w-full pb-3 px-5 sm:px-6 lg:px-8">
            <div className="rounded-2xl border border-fuchsia-300/35 bg-fuchsia-500/12 backdrop-blur-md px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-fuchsia-100">Finish your profile setup</p>
                <p className="text-xs text-fuchsia-100/80">New account detected. Complete your profile and card style in one editor.</p>
              </div>
              <button
                onClick={() => openEditor('card')}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-white"
                style={{ background: `linear-gradient(135deg, var(--primary), var(--accent))` }}
              >
                Open Profile Editor
              </button>
            </div>
          </div>
        )}

        <div className="w-full pb-10 px-5 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 xl:grid-cols-[420px,1fr] gap-6 items-start">
            {/* Profile Card */}
            <div className="xl:sticky xl:top-8">
              {isProfileLoaded ? (
                <ProfileCard
                  avatarUrl={effectiveProfile.avatar || authUser.profileImageUrl || ''}
                  bannerUrl=""
                  avatarFrame={selectedAvatarFrame as
                    | 'none'
                    | 'neon-pink'
                    | 'gold'
                    | 'ice'
                    | 'emerald'
                    | 'fire'
                    | 'rainbow'
                    | 'sapphire'
                    | 'amethyst'
                    | 'ruby'
                    | 'obsidian'
                    | 'pearl'
                    | 'rainbow-spin'
                    | 'aurora'
                    | 'pulse-neon'
                    | 'cyber'}
                  name={authUser.name}
                  title={effectiveProfile.bio || authUser.selfDescription || ''}
                  handle={authUser.email.split('@')[0]}
                  status={
                    effectiveProfile.status === 'dnd' ? 'Do Not Disturb' :
                    effectiveProfile.status === 'idle' ? 'Away' :
                    effectiveProfile.status === 'offline' ? 'Offline' : 'Online'
                  }
                  themeId={cardDesign?.themeId ?? 'rose'}
                  borderStyle={cardDesign?.borderStyle ?? 'glass'}
                  fontStyle={cardDesign?.fontStyle ?? 'modern'}
                  backgroundMode={cardDesign?.backgroundMode ?? 'theme'}
                  gifUrl={cardDesign?.backgroundMode === 'gif' || cardDesign?.backgroundMode === 'image' ? cardDesign?.gifUrl : undefined}
                  innerGradient={cardDesign?.backgroundMode === 'gradient' ? parseGradientCss(cardDesign?.gifUrl) : undefined}
                  enableTilt={true}
                  showUserInfo={true}
                  contactText="Message"
                  opinionCount={authUser.opinions?.length ?? 0}
                  likeCount={totalLikes}
                  interests={Array.isArray(cardDesign?.stickers) && cardDesign.stickers.length
                    ? cardDesign.stickers
                    : (effectiveProfile.badges?.length ? effectiveProfile.badges : interests)}
                  onContactClick={() => {}}
                />
              ) : (
                <div className="rounded-3xl border border-white/10 bg-black/35 overflow-hidden animate-pulse">
                  <div className="h-28 bg-white/10" />
                  <div className="p-5 space-y-3">
                    <div className="h-5 w-40 bg-white/15 rounded-full" />
                    <div className="h-3 w-60 bg-white/10 rounded-full" />
                  </div>
                </div>
              )}

              <div className="mt-4 rounded-2xl border border-white/10 bg-black/35 backdrop-blur-md p-4">
                <p className="text-xs uppercase tracking-wider text-white/45 font-semibold">Card Setup</p>
                <p className="mt-1.5 text-sm text-white/85">
                  {cardDesign?.isCustomized
                    ? 'Your card is customized. You can keep tweaking theme, border, stickers and GIF background anytime.'
                    : 'Your card is still in default mode. Open the designer to set your unique profile style.'}
                </p>
                <button
                  onClick={() => openEditor('avatar')}
                  className="mt-3 w-full rounded-xl py-2.5 text-sm font-semibold text-white"
                  style={{ background: `linear-gradient(135deg, var(--primary), var(--accent))` }}
                >
                  {cardDesign?.isCustomized ? 'Edit Profile & Card' : 'Start Profile & Card Setup'}
                </button>
              </div>

            </div>

            {/* Profile insights */}
            <div className="rounded-2xl border border-white/10 bg-black/35 backdrop-blur-md p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-white/80" />
                <h3 className="font-bold text-white">Profile Insights</h3>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-wider text-white/55 font-semibold mb-2">Interests</p>
                  <div className="flex flex-wrap gap-2">
                    {(Array.isArray(cardDesign?.stickers) && cardDesign.stickers.length ? cardDesign.stickers : interests).slice(0, 10).map((interest, i) => (
                      <span key={`${interest}-${i}`} className="px-2.5 py-1 rounded-full text-xs border border-white/15 bg-white/10 text-white/90">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Editor (full-screen side panel, portal-rendered) */}
        <ProfileEditor name={authUser.name} token={token} onSave={handleSave} />
      </div>
    </ThemeProvider>
  );
}