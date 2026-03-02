"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";

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
      <div className="mx-auto grid max-w-6xl grid-cols-3 items-center gap-8 p-2">
        <div className="flex items-center justify-start">
          <Link href="/home" className="text-xl font-bold">
            MiniTwitter
          </Link>
        </div>

        <nav className="flex items-center justify-center gap-6">
          <Link
            href="/home"
            className={`px-4 py-2 rounded-t font-semibold transition border-b-2 ${pathname.startsWith("/home") || pathname === "/" ? "border-blue-600 text-blue-600" : "border-transparent text-zinc-400"}`}
          >
            Feed
          </Link>
          <Link
            href="/trending"
            className={`px-4 py-2 rounded-t font-semibold transition border-b-2 ${pathname.startsWith("/trending") ? "border-blue-600 text-blue-600" : "border-transparent text-zinc-400"}`}
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
        <nav className="flex items-center justify-end gap-6">
          <ThemeToggle />

          {loading ? (
            <div>Loading…</div>
          ) : user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm">{user.name ?? user.email}</span>
              <Button
                onClick={async () => {
                  await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
                  try { window.dispatchEvent(new Event('auth:changed')); } catch (e) {}
                  window.location.href = '/';
                }}
                className="bg-red-600 hover:bg-red-700"
              >
                Sign out
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/auth/login">
                <Button className="bg-blue-600 hover:bg-blue-700">Sign in</Button>
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
