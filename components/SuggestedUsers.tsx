"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";

interface User {
  id: string;
  name: string;
  email?: string;
  image?: string;
  followersCount?: number;
  isFollowing?: boolean;
  isFollowedBy?: boolean;
  followStatus?: string;
}

export default function SuggestedUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      try {
        const res = await fetch(`/api/proxy/users?sort=followers&excludeFollowed=true`, { credentials: "include" });
        if (!res.ok) throw new Error("Error fetching users");
        const data = await res.json();
        // Backend may return several shapes: array, { users: [...] } or { data: [...] }
        let list: any[] = [];
        if (Array.isArray(data)) list = data;
        else if (Array.isArray(data.users)) list = data.users;
        else if (Array.isArray(data.data)) list = data.data;
        else list = [];
        setUsers(list as User[]);
      } catch (e) {
        setUsers([]);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  return (
    <div className="w-full flex justify-center items-start">
      <div className="w-full max-w-[380px] mx-auto -mt-3 rounded-md shadow border border-zinc-600 p-4" style={{ backgroundColor: '#0b0b0b' }}>
        <h2 className="text-lg font-bold mb-4 text-zinc-100">Suggested users</h2>
        {loading ? (
          <div className="text-zinc-400">Loading…</div>
        ) : users.length === 0 ? (
          <div className="text-zinc-400">No suggestions</div>
        ) : (
          <ul className="divide-y divide-zinc-600">
            {users.slice(0, 5).map((user) => (
              <li key={user.id} className="flex items-center gap-3 py-3">
                <Link href={`/profile/${user.id}`} className="flex items-center gap-3 hover:underline">
                  {user.image ? (
                    <img src={user.image} alt={user.name} className="w-9 h-9 rounded-full object-cover bg-zinc-700" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-zinc-700 flex items-center justify-center text-sm font-medium text-zinc-100">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="font-semibold text-zinc-100 leading-tight">{user.name}</div>
                    <div className="text-xs text-zinc-400">@{user.email ? user.email.split("@")[0] : user.id}</div>
                  </div>
                </Link>
                <div className="ml-auto">
                  {(() => {
                    const isFollowing = !!user.isFollowing;
                    const isFollowedBy = !!user.isFollowedBy;
                    const status = user.followStatus ?? (isFollowing ? 'following' : (isFollowedBy ? 'follow_back' : 'none'));
                    const busy = !!processing[user.id];

                    async function handleToggleFollow(e: React.MouseEvent) {
                      e.preventDefault();
                      e.stopPropagation();
                      if (busy) return;
                      setProcessing((s) => ({ ...s, [user.id]: true }));
                      const toFollow = !isFollowing;
                      try {
                        const res = await fetch(`/api/proxy/users/${encodeURIComponent(user.id)}/follow`, {
                          method: toFollow ? 'POST' : 'DELETE',
                          credentials: 'include',
                        });
                        if (!res.ok) throw new Error('Network error');
                        // update local state optimistically
                        setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, isFollowing: toFollow, followStatus: toFollow ? 'following' : (u.isFollowedBy ? 'follow_back' : 'none') } : u));
                      } catch (err) {
                        console.error('follow toggle failed', err);
                      } finally {
                        setProcessing((s) => { const n = { ...s }; delete n[user.id]; return n; });
                      }
                    }

                    const label = isFollowing ? 'Following' : (status === 'follow_back' ? 'Follow back' : 'Follow');
                    const btnClass = isFollowing
                      ? 'text-xs text-zinc-200 border border-zinc-700 bg-transparent px-3 py-1 rounded-md'
                      : 'text-xs text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-md';

                    return (
                      <button
                        onClick={handleToggleFollow}
                        disabled={busy}
                        className={btnClass}
                        aria-pressed={isFollowing}
                        title={isFollowing ? 'Unfollow' : 'Follow'}
                      >
                        {busy ? '…' : label}
                      </button>
                    );
                  })()}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
