"use client";
import React from "react";
import FollowButton from "./FollowButton";
import { Profile } from "@/types/user";

export default function ProfileCard({ profile, onChange }: { profile: Profile; onChange?: (next: any) => void }) {
  const isSelf = profile.followStatus === "self";
  const handle = (profile as any).username ?? (profile as any).handle ?? (profile.email ? profile.email.split("@")[0] : profile.id?.slice(0, 8));
  return (
    <div className="w-full text-center">
      {profile.image ? (
        <img
          src={profile.image}
          alt={profile.name ?? 'avatar'}
          className="mx-auto h-20 w-20 rounded-full object-cover bg-zinc-200 dark:bg-zinc-700 mb-3"
        />
      ) : (
        <div className="mx-auto h-20 w-20 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center mb-3 text-xl font-medium text-zinc-800 dark:text-zinc-100">
          {((profile.name ?? profile.email ?? profile.id ?? 'A') + '').charAt(0).toUpperCase()}
        </div>
      )}
      <h2 className="text-2xl font-bold mb-1 text-zinc-900 dark:text-zinc-50">{profile.name}</h2>
      <div className="text-sm text-zinc-700 dark:text-zinc-200 mb-2">{profile.email}</div>
      <div className="text-xs text-zinc-600 dark:text-zinc-400 mb-4">Joined: {profile.createdAt ? new Date(profile.createdAt).toLocaleString() : "Date not available"}</div>
      <div className="flex gap-6 mb-4 justify-center">
        <div className="text-zinc-700 dark:text-zinc-100">
          <span className="font-bold">{profile.followersCount}</span> Followers
        </div>
        <div className="text-zinc-700 dark:text-zinc-100">
          <span className="font-bold">{profile.followingCount}</span> Following
        </div>
      </div>
      {!isSelf && (
        <div>
          <FollowButton user={profile} onChange={(next) => {
            // propagate change to parent page
            onChange?.(next);
          }} />
        </div>
      )}
    </div>
  );
}
