"use client";
import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
// using native input here to avoid nested borders
import NotificationsButton from "./NotificationsButton";

type UserInfo = { id?: string; name?: string | null; email?: string | null };

export default function Header() {
  const pathname = usePathname() || "/home";
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function loadUser() {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        if (!res.ok) return mounted && setUser(null);
        const data = await res.json();
        if (mounted) setUser(data);
      } catch (e) {
        if (mounted) setUser(null);
      } finally { if (mounted) setLoading(false); }
    }

    loadUser();

    const onAuthChanged = () => {
      // re-fetch user when auth changes elsewhere in the app
      setLoading(true);
      loadUser();
    };
    window.addEventListener('auth:changed', onAuthChanged);

    return () => { mounted = false; window.removeEventListener('auth:changed', onAuthChanged); };
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100">
      <div className="relative mx-auto max-w-6xl p-2 grid grid-cols-[auto_1fr_auto] items-center gap-x-54">
        {/* Left: App name */}
        <div className="flex items-center justify-self-start px-54 -ml-86">
          <LeftGroup />
        </div>

        {/* Center: Navigation tabs */}
        <div className="flex items-center justify-center">
          <CenterNav pathname={pathname} user={user} />
        </div>

        {/* Right: Theme, Search, Notifications, User */}
        <div className="flex items-center justify-end gap-8 z-20 justify-self-end px-8">
          <RightGroup user={user} loading={loading} setLoading={setLoading} />
        </div>
      </div>
    </header>
  );
}

function LeftGroup() {
  return (
    <Link href="/home" className="text-xl font-bold">
      MiniTwitter
    </Link>
  );
}

function CenterNav({ pathname, user }: { pathname: string; user: UserInfo | null }) {
  return (
    <nav className="flex items-center gap-8 z-10 mx-auto max-w-[640px]">
      <Link
        href="/home"
        className={`px-3 py-2 rounded-t font-semibold transition border-b-2 ${pathname.startsWith("/home") || pathname === "/" ? "border-blue-600 text-blue-600" : "border-transparent text-zinc-400"}`}
      >
        Feed
      </Link>
      <Link
        href="/trending"
        className={`px-3 py-2 rounded-t font-semibold transition border-b-2 ${pathname.startsWith("/trending") ? "border-blue-600 text-blue-600" : "border-transparent text-zinc-400"}`}
      >
        Trending
      </Link>
      <Link
        href={user?.id ? `/profile/${user.id}` : '/auth/login'}
        className={`px-4 py-2 rounded-t font-semibold transition border-b-2 ${pathname.startsWith("/profile") ? "border-blue-600 text-blue-600" : "border-transparent text-zinc-400"}`}
      >
        Profile
      </Link>
    </nav>
  );
}

function RightGroup({ user, loading, setLoading }: { user: UserInfo | null; loading: boolean; setLoading: React.Dispatch<React.SetStateAction<boolean>> }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const target = e.target as Node;
      if (menuOpen) {
        if (menuRef.current && !menuRef.current.contains(target) && buttonRef.current && !buttonRef.current.contains(target)) {
          setMenuOpen(false);
        }
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  return (
    <>
      {loading ? (
        <div>Loading…</div>
      ) : user ? (
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 w-56 rounded-full border border-zinc-200 dark:border-zinc-700 px-3 py-2 bg-transparent">
            <button
              type="button"
              className="p-0 m-0 flex items-center justify-center text-zinc-400"
              onClick={() => {
                const el = document.getElementById('header-search-input') as HTMLInputElement | null;
                if (el) el.focus();
              }}
              aria-label="Focus search"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
            <input
              id="header-search-input"
              type="search"
              placeholder="Search"
              aria-label="Search"
              className="bg-transparent placeholder:text-zinc-500 focus:outline-none w-full text-sm py-0"
            />
          </div>
          <NotificationsButton />

          <Link href={user.id ? `/profile/${user.id}` : '/auth/login'} className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-zinc-300 dark:bg-zinc-700 flex items-center justify-center text-sm font-medium text-zinc-800 dark:text-zinc-100">
              {(user.name ?? user.email ?? "?").charAt(0).toUpperCase()}
            </div>
            <div className="hidden lg:flex flex-col leading-tight">
              <span className="text-sm font-semibold">{user.name ?? user.email}</span>
              <span className="text-xs text-zinc-500">@{(user.email ? user.email.split('@')[0] : (user.name ? user.name.replace(/\s+/g, "") : '')).toLowerCase()}</span>
            </div>
          </Link>

          <div className="relative">
            <button
              ref={buttonRef}
              aria-label="More"
              className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800"
              onClick={() => setMenuOpen((s) => !s)}
              aria-expanded={menuOpen}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-zinc-600" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="5" r="1.5" />
                <circle cx="12" cy="12" r="1.5" />
                <circle cx="12" cy="19" r="1.5" />
              </svg>
            </button>

            {menuOpen && (
              <div ref={menuRef} className="absolute right-0 mt-2 w-40 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-md shadow-md py-1 z-50">
                <button
                  className="w-full text-left px-3 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  onClick={async () => {
                    setMenuOpen(false);
                    setLoading(true);
                    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
                    try { window.dispatchEvent(new Event('auth:changed')); } catch (e) {}
                    window.location.href = '/';
                  }}
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Link href="/auth/login">
            <Button className="bg-blue-600 hover:bg-blue-700">Sign in</Button>
          </Link>
        </div>
      )}
    </>
  );
}
