import type { Identity, Note, Post } from '../types';

const IDENTITY_KEY = 'pd_identity';
const POSTS_KEY = 'pd_posts';
const NOTES_KEY = 'pd_notes';
const ADMIN_NAME = 'prophet dian';

function seedPosts(): Post[] {
  const now = Date.now();
  return [
    {
      id: crypto.randomUUID(),
      feed: 'prophetic',
      authorName: 'Prophet Dian',
      authorIsAdmin: true,
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
      text: 'Navi Society is where I go deeper — teaching, strategy, and direct impartation for those who are planted in. Join to receive it all.',
      createdAt: now - 1000 * 60 * 30,
      likes: 8,
      likedByMe: false,
    },
  ];
}

export function loadIdentity(): Identity | null {
  const raw = localStorage.getItem(IDENTITY_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Identity;
  } catch {
    return null;
  }
}

export function saveIdentity(name: string): Identity {
  const trimmed = name.trim();
  const identity: Identity = {
    name: trimmed,
    isAdmin: trimmed.toLowerCase() === ADMIN_NAME,
    isNaviMember: trimmed.toLowerCase() === ADMIN_NAME,
  };
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

export function loadNotes(): Note[] {
  const raw = localStorage.getItem(NOTES_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Note[];
  } catch {
    return [];
  }
}

export function saveNotes(notes: Note[]) {
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
}
