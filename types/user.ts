export interface User {
  id: string;
  name?: string;
  email?: string;
  image?: string;
  followersCount?: number;
  isFollowing?: boolean;
  isFollowedBy?: boolean;
  followStatus?: string;
}

export interface Profile {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
  isFollowedBy: boolean;
  followStatus: string;
  image?: string;
}
