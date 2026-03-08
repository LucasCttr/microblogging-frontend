"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Header from "./Header";
import SuggestedUsers from "./SuggestedUsers";
import TrendingTopics from "./TrendingTopics";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/";

  if (pathname.startsWith("/auth")) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center" style={{ backgroundColor: '#18181b' }}>
        <div className="w-full max-w-md mx-4">{children}</div>
      </div>
    );
  }

  return (
    <div className="relative z-20 min-h-screen w-full flex flex-col" style={{ backgroundColor: '#18181c' }}>
      <Header />
      <div className="w-full flex justify-center items-start">
        <div className="xl:grid xl:grid-cols-[340px_minmax(0,45rem)_340px] xl:gap-0 mx-auto">
          <aside
            className="hidden xl:block w-[340px] p-4 pt-6 sticky top-16 h-[calc(100vh-64px)] overflow-auto border-r border-white/30"
            style={{ backgroundColor: '#18181b', borderLeft: '1px solid rgba(255, 255, 255, 0.28)' }}
          >
            <div>
              <nav aria-label="Main menu">
                <ul className="space-y-4">
                  <li>
                    <Link href="/" className="flex items-center gap-8 px-6 py-4 rounded-md hover:bg-white/3 text-zinc-100">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 text-zinc-100"><path d="M3 12l9-9 9 9v8a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      <span className="font-semibold text-2xl">Home</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/explore" className="flex items-center gap-8 px-6 py-4 rounded-md hover:bg-white/3 text-zinc-100">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0"><path d="M21 10l-9 4-4-9-4 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      <span className="font-semibold text-2xl">Explore</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/notifications" className="flex items-center gap-8 px-6 py-4 rounded-md hover:bg-white/3 text-zinc-100">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11a6 6 0 1 0-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      <span className="font-semibold text-2xl">Notifications</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/following" className="flex items-center gap-8 px-6 py-4 rounded-md hover:bg-white/3 text-zinc-100">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0"><path d="M16 11c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM8 11c1.657 0 3-1.343 3-3S9.657 5 8 5 5 6.343 5 8s1.343 3 3 3zM2 20c0-2.21 3.582-4 8-4s8 1.79 8 4v1H2v-1z" stroke="currentColor" strokeWidth="0" fill="currentColor"/></svg>
                      <span className="font-semibold text-2xl">Following</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/messages" className="flex items-center gap-8 px-6 py-4 rounded-md hover:bg-white/3 text-zinc-100">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      <span className="font-semibold text-2xl">Messages</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/bookmarks" className="flex items-center gap-8 px-6 py-4 rounded-md hover:bg-white/3 text-zinc-100">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      <span className="font-semibold text-2xl">Bookmarks</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/profile" className="flex items-center gap-8 px-6 py-4 rounded-md hover:bg-white/3 text-zinc-100">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      <span className="font-semibold text-2xl">Profile</span>
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>
          </aside>

          <section className="w-full min-w-0" style={{ backgroundColor: '#18181b' }}>
            <main className="w-full z-10 min-h-screen px-0" style={{ backgroundColor: '#0b0b0b' }}>
              {children}
            </main>
          </section>

          <aside
            className="hidden xl:block w-[360px] p-4 pt-6 sticky top-16 h-[calc(100vh-64px)] overflow-auto border-l border-white/30"
            style={{ backgroundColor: '#18181b', borderRight: '1px solid rgba(255, 255, 255, 0.28)' }}
          >
            <div className="space-y-4">
              <SuggestedUsers />
              <TrendingTopics limit={10} />
            </div>
          </aside>
        </div>

    </div>    
    </div>)}
  