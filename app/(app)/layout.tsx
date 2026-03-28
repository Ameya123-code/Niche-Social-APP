'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Heart, Map, Search, User, MessageCircle } from 'lucide-react';
import ThemeToggle from '@/app/components/ThemeToggle';
import LikeNotificationPopup from '@/app/components/LikeNotificationPopup';

const NAV = [
  { href: '/cards', icon: Heart, label: 'Discover' },
  { href: '/chat', icon: MessageCircle, label: 'Chat' },
  { href: '/map', icon: Map, label: 'Events' },
  { href: '/search', icon: Search, label: 'Search' },
  { href: '/profile', icon: User, label: 'Profile' },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const validateSession = async () => {
      const token = localStorage.getItem('auth_token');

      if (!token) {
        router.replace('/auth');
        return;
      }

      const now = Date.now();
      const lastCheckRaw = sessionStorage.getItem('last_session_check_ms');
      const lastCheck = lastCheckRaw ? Number(lastCheckRaw) : 0;

      // Throttle DB validation checks to avoid performance overhead on each navigation.
      if (lastCheck && now - lastCheck < 120000) {
        setCheckingSession(false);
        return;
      }

      try {
        const response = await fetch('/api/auth/session', {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
        });

        if (response.status === 200) {
          sessionStorage.setItem('last_session_check_ms', String(now));
          setCheckingSession(false);
          return;
        }

        if (response.status === 403) {
          router.replace('/auth/verify');
          return;
        }

        localStorage.removeItem('auth_token');
        document.cookie = 'auth_token=; path=/; max-age=0';
        router.replace('/auth');
      } catch {
        // Fail open for transient network issues to keep UX responsive.
        setCheckingSession(false);
      }
    };

    validateSession();
  }, [router]);

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-red-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-black overflow-hidden">
      <div className="w-full relative h-full flex flex-col">
        <header className="sticky top-0 z-40 py-4 backdrop-blur bg-white/70 dark:bg-black/40 border-b border-gray-100 dark:border-gray-800 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <p className="text-lg font-semibold text-black dark:text-white">Niche</p>
            <ThemeToggle />
          </div>
        </header>
        <main className="flex-1 pb-20 overflow-y-auto w-full">{children}</main>
        <LikeNotificationPopup />
        <BottomNav />
      </div>
    </div>
  );
}

function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white dark:bg-black border-t border-gray-100 dark:border-gray-900 z-50">
      <div className="flex">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center py-3 gap-0.5 transition-colors ${
                active
                  ? 'text-red-500'
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
              }`}
            >
              <Icon
                className={`w-6 h-6 transition-all ${active ? 'scale-110' : ''}`}
                fill={active && href === '/cards' ? 'currentColor' : 'none'}
              />
              <span className={`text-[10px] font-semibold ${active ? 'text-red-500' : ''}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
