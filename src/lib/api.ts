import type { User } from '@supabase/supabase-js';
import { supabase } from './supabase';
import type { BadgeId, Feed, Identity, Post } from '../types';

const ADMIN_EMAIL = 'prophetdian@gmail.com';
const PERMANENT_BADGES: BadgeId[] = ['apostle', 'prophet'];

export function permanentBadgesFor(email: string): BadgeId[] {
  return email.trim().toLowerCase() === ADMIN_EMAIL ? [...PERMANENT_BADGES] : [];
}

export async function signUpWithPassword(name: string, email: string, password: string) {
  const { error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: {
      data: { name: name.trim() },
    },
  });
  if (error) throw error;
}

export async function signInWithPassword(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });
  if (error) throw error;
}

export async function signOut() {
  await supabase.auth.signOut();
}

interface ProfileRow {
  id: string;
  name: string;
  email: string;
  bio: string;
  avatar: string;
}

export async function buildIdentity(user: User): Promise<Identity> {
  const email = (user.email ?? '').trim().toLowerCase();
  const { data } = await supabase
    .from('profiles')
    .select('id, name, email, bio, avatar')
    .eq('id', user.id)
    .maybeSingle();

  let profile = data as ProfileRow | null;
  if (!profile) {
    const metaName = typeof user.user_metadata?.name === 'string' ? user.user_metadata.name.trim() : '';
    const fresh: ProfileRow = {
      id: user.id,
      name: metaName || email.split('@')[0] || 'Believer',
      email,
      bio: '',
      avatar: '',
    };
    const { data: inserted } = await supabase
      .from('profiles')
      .upsert(fresh)
      .select('id, name, email, bio, avatar')
      .maybeSingle();
    profile = (inserted as ProfileRow | null) ?? fresh;
  }

  const isAdmin = email === ADMIN_EMAIL;
  return {
    id: user.id,
    name: profile.name,
    email,
    bio: profile.bio,
    avatar: profile.avatar,
    isAdmin,
    isNaviMember: isAdmin,
    badges: permanentBadgesFor(email),
  };
}

interface PostRow {
  id: string;
  feed: Feed;
  author_id: string;
  author_name: string;
  author_is_admin: boolean;
  author_badges: BadgeId[];
  text: string;
  base_likes: number;
  created_at: string;
  likes: { user_id: string }[];
}

const POST_COLUMNS =
  'id, feed, author_id, author_name, author_is_admin, author_badges, text, base_likes, created_at, likes(user_id)';

function toPost(row: PostRow, myId: string): Post {
  return {
    id: row.id,
    feed: row.feed,
    authorId: row.author_id,
    authorName: row.author_name,
    authorIsAdmin: row.author_is_admin,
    authorBadges: row.author_badges,
    text: row.text,
    createdAt: new Date(row.created_at).getTime(),
    likes: row.base_likes + row.likes.length,
    likedByMe: row.likes.some((like) => like.user_id === myId),
  };
}

export async function fetchPosts(myId: string): Promise<Post[]> {
  const { data, error } = await supabase
    .from('posts')
    .select(POST_COLUMNS)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return ((data ?? []) as PostRow[]).map((row) => toPost(row, myId));
}

export async function createPost(identity: Identity, feed: Feed, text: string): Promise<Post> {
  const { data, error } = await supabase
    .from('posts')
    .insert({
      feed,
      author_id: identity.id,
      author_name: identity.name,
      author_is_admin: identity.isAdmin,
      author_badges: identity.badges,
      text,
    })
    .select(POST_COLUMNS)
    .single();
  if (error) throw error;
  return toPost(data as PostRow, identity.id);
}

export async function deletePost(postId: string, authorId: string) {
  const { error } = await supabase.from('posts').delete().match({ id: postId, author_id: authorId });
  if (error) throw error;
}

export async function setLike(postId: string, userId: string, liked: boolean) {
  if (liked) {
    const { error } = await supabase.from('likes').insert({ post_id: postId, user_id: userId });
    if (error && error.code !== '23505') throw error; // ignore already-liked
  } else {
    const { error } = await supabase.from('likes').delete().match({ post_id: postId, user_id: userId });
    if (error) throw error;
  }
}

export async function saveProfile(
  id: string,
  changes: Partial<Pick<ProfileRow, 'name' | 'bio' | 'avatar'>>,
) {
  const { error } = await supabase.from('profiles').update(changes).eq('id', id);
  if (error) throw error;
}
