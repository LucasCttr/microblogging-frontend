export interface Author {
  id?: string;
  name?: string;
  email?: string;
  image?: string;
}

export interface TweetItem {
  id: string;
  parentId?: string | null;
  retweetOfId?: string | null;
  retweetOf?: TweetItem | null;
  content?: string | null;
  text?: string | null;
  image?: string | null;
  likesCount?: number;
  retweetsCount?: number;
  repliesCount?: number;
  createdAt?: string;
  author?: Author;
  // Agregada la propiedad replies para comentarios
  replies?: TweetItem[];
  likedByCurrentUser?: boolean;
  retweetedByCurrentUser?: boolean;
}

export type Tweet = TweetItem;