export type Feed = 'prophetic' | 'navi';

export type View = Feed | 'profile' | 'badges';

export type BadgeId = 'evangelist' | 'pastor' | 'teacher' | 'apostle' | 'prophet';

export interface Post {
  id: string;
  feed: Feed;
  authorName: string;
  authorIsAdmin: boolean;
  authorBadges?: BadgeId[];
  text: string;
  createdAt: number;
  likes: number;
  likedByMe: boolean;
}

export interface Identity {
  name: string;
  email: string;
  bio: string;
  avatar: string;
  isAdmin: boolean;
  isNaviMember: boolean;
  badges: BadgeId[];
}
