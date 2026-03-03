import React from "react";

interface Profile {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
  isFollowedBy: boolean;
  followStatus: string;
}

export default function ProfileCard({ profile }: { profile: Profile }) {
  const isSelf = profile.followStatus === "self";
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-4 mb-6 flex flex-col items-center justify-center text-center w-full">
      <h2 className="text-2xl font-bold mb-2">{profile.name}</h2>
      <div className="text-sm text-zinc-500 mb-2">{profile.email}</div>
      <div className="text-xs text-zinc-400 mb-4">Joined: {profile.createdAt ? new Date(profile.createdAt).toLocaleString() : "Fecha desconocida"}</div>
      <div className="flex gap-6 mb-4 justify-center">
        <div>
          <span className="font-bold">{profile.followersCount}</span> Followers
        </div>
        <div>
          <span className="font-bold">{profile.followingCount}</span> Following
        </div>
      </div>
      {!isSelf && (
        <button className="px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition">
          {profile.isFollowing ? "Unfollow" : "Follow"}
        </button>
      )}
    </div>
  );
}
