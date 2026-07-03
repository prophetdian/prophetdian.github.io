import type { BadgeId, Identity, Post } from '../types';

const IDENTITY_KEY = 'pd_identity';
const POSTS_KEY = 'pd_posts';
const ADMIN_NAME = 'prophet dian';
const PERMANENT_BADGE_EMAIL = 'prophetdian@gmail.com';
const PERMANENT_BADGES: BadgeId[] = ['apostle', 'prophet'];

export function permanentBadgesFor(email: string): BadgeId[] {
  return email.trim().toLowerCase() === PERMANENT_BADGE_EMAIL ? [...PERMANENT_BADGES] : [];
}

function seedPosts(): Post[] {
  const now = Date.now();
  return [
    {
      id: crypto.randomUUID(),
      feed: 'prophetic',
      authorName: 'Prophet Dian',
      authorIsAdmin: true,
      authorBadges: ['apostle', 'prophet'],
      text: 'Welcome to the Prophetic Feed. Speak what the Spirit gives you. This is a place for the body to prophesy, encourage, and build up.',
      createdAt: now - 1000 * 60 * 60,
      likes: 12,
      likedByMe: false,
    },
    {
      id: crypto.randomUUID(),
      feed: 'navi',
      authorName: 'Prophet Dian',
      authorIsAdmin: true,
      authorBadges: ['apostle', 'prophet'],
      text: 'Navi Society is where I go deeper — teaching, strategy, and direct impartation for those who are planted in. Join to receive it all.',
      createdAt: now - 1000 * 60 * 30,
      likes: 8,
      likedByMe: false,
    },
  ];
}

function normalizeIdentity(raw: Partial<Identity> & { name: string }): Identity {
  const name = raw.name.trim();
  const email = (raw.email ?? '').trim();
  return {
    name,
    email,
    bio: raw.bio ?? '',
    avatar: raw.avatar ?? '',
    isAdmin: name.toLowerCase() === ADMIN_NAME,
    isNaviMember: name.toLowerCase() === ADMIN_NAME,
    badges: permanentBadgesFor(email),
  };
}

export function loadIdentity(): Identity | null {
  const raw = localStorage.getItem(IDENTITY_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<Identity> & { name?: string };
    if (!parsed.name) return null;
    return normalizeIdentity(parsed as Partial<Identity> & { name: string });
  } catch {
    return null;
  }
}

export function saveIdentity(name: string, email = ''): Identity {
  const identity = normalizeIdentity({ name, email });
  localStorage.setItem(IDENTITY_KEY, JSON.stringify(identity));
  return identity;
}

export function updateIdentity(
  current: Identity,
  changes: Partial<Pick<Identity, 'email' | 'bio' | 'avatar'>>,
): Identity {
  const identity = normalizeIdentity({ ...current, ...changes });
  localStorage.setItem(IDENTITY_KEY, JSON.stringify(identity));
  return identity;
}

export function clearIdentity() {
  localStorage.removeItem(IDENTITY_KEY);
}

export function loadPosts(): Post[] {
  const raw = localStorage.getItem(POSTS_KEY);
  if (!raw) {
    const seeded = seedPosts();
    localStorage.setItem(POSTS_KEY, JSON.stringify(seeded));
    return seeded;
  }
  try {
    return JSON.parse(raw) as Post[];
  } catch {
    return [];
  }
}

export function savePosts(posts: Post[]) {
  localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
}
