export type Feed = 'prophetic' | 'navi';

export type View = Feed | 'notes';

export interface Note {
  id: string;
  title: string;
  body: string;
  createdAt: number;
  updatedAt: number;
}

export interface Post {
  id: string;
  feed: Feed;
  authorName: string;
  authorIsAdmin: boolean;
  text: string;
  createdAt: number;
  likes: number;
  likedByMe: boolean;
}

export interface Identity {
  name: string;
  isAdmin: boolean;
  isNaviMember: boolean;
}
