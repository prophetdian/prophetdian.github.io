export type Feed = 'prophetic' | 'navi';

export type View = Feed | 'profile';

export type BadgeId = 'evangelist' | 'pastor' | 'teacher' | 'apostle' | 'prophet';

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
