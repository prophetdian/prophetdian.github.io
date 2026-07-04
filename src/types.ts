export type Feed = 'prophetic' | 'navi';

export type View = Feed | 'profile' | 'badges' | 'dms';

export type BadgeId = 'evangelist' | 'pastor' | 'teacher' | 'apostle' | 'prophet';

export type MediaType = 'image' | 'video';

export interface Post {
  id: string;
  feed: Feed;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  authorIsAdmin: boolean;
  authorBadges?: BadgeId[];
  text: string;
  mediaUrl?: string;
  mediaType?: MediaType;
  createdAt: number;
  likes: number;
  likedByMe: boolean;
}

export interface PublicProfile {
  id: string;
  name: string;
  bio: string;
  avatar: string;
}

export interface Identity {
  id: string;
  name: string;
  email: string;
  bio: string;
  avatar: string;
  isAdmin: boolean;
  isNaviMember: boolean;
  badges: BadgeId[];
}
