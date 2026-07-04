import type { User } from '@supabase/supabase-js';
import { supabase } from './supabase';
import type { BadgeId, Feed, Identity, MediaType, Post, PublicProfile } from '../types';

const MEDIA_BUCKET = 'post-media';

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

// Public, non-sensitive profile fields for viewing other users.
// Reads from the `public_profiles` view, which never exposes email.
export async function fetchPublicProfile(userId: string): Promise<PublicProfile | null> {
  const { data, error } = await supabase
    .from('public_profiles')
    .select('id, name, bio, avatar')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  return (data as PublicProfile | null) ?? null;
}

interface PostRow {
  id: string;
  feed: Feed;
  author_id: string;
  author_name: string;
  author_is_admin: boolean;
  author_badges: BadgeId[];
  text: string;
  media_url: string | null;
  media_type: MediaType | null;
  base_likes: number;
  created_at: string;
  likes: { user_id: string }[];
}

const POST_COLUMNS =
  'id, feed, author_id, author_name, author_is_admin, author_badges, text, media_url, media_type, base_likes, created_at, likes(user_id)';

function toPost(row: PostRow, myId: string): Post {
  return {
    id: row.id,
    feed: row.feed,
    authorId: row.author_id,
    authorName: row.author_name,
    authorIsAdmin: row.author_is_admin,
    authorBadges: row.author_badges,
    text: row.text,
    mediaUrl: row.media_url ?? undefined,
    mediaType: row.media_type ?? undefined,
    createdAt: new Date(row.created_at).getTime(),
    likes: row.base_likes + row.likes.length,
    likedByMe: row.likes.some((like) => like.user_id === myId),
  };
}

// Attach each author's current avatar (from public_profiles) to their posts.
// Best-effort: if the lookup fails, posts still render with the letter fallback.
async function hydrateAvatars(posts: Post[]): Promise<Post[]> {
  const ids = [...new Set(posts.map((p) => p.authorId).filter(Boolean))];
  if (ids.length === 0) return posts;
  try {
    const { data, error } = await supabase
      .from('public_profiles')
      .select('id, avatar')
      .in('id', ids);
    if (error) throw error;
    const avatarById = new Map<string, string>();
    for (const row of (data ?? []) as { id: string; avatar: string }[]) {
      if (row.avatar) avatarById.set(row.id, row.avatar);
    }
    return posts.map((p) => ({ ...p, authorAvatar: avatarById.get(p.authorId) }));
  } catch {
    return posts;
  }
}

export async function fetchPosts(myId: string): Promise<Post[]> {
  const { data, error } = await supabase
    .from('posts')
    .select(POST_COLUMNS)
    .order('created_at', { ascending: false });
  if (error) throw error;
  const posts = ((data ?? []) as PostRow[]).map((row) => toPost(row, myId));
  return hydrateAvatars(posts);
}

export interface PostMedia {
  url: string;
  type: MediaType;
}

// Upload a photo or video to the public post-media bucket and return its URL + kind.
export async function uploadPostMedia(userId: string, file: File): Promise<PostMedia> {
  const type: MediaType = file.type.startsWith('video/') ? 'video' : 'image';
  const ext = file.name.includes('.') ? file.name.split('.').pop() : type === 'video' ? 'mp4' : 'jpg';
  const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage
    .from(MEDIA_BUCKET)
    .upload(path, file, { cacheControl: '3600', upsert: false, contentType: file.type });
  if (error) throw error;
  const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
  return { url: data.publicUrl, type };
}

export async function createPost(
  identity: Identity,
  feed: Feed,
  text: string,
  media?: PostMedia | null,
): Promise<Post> {
  const { data, error } = await supabase
    .from('posts')
    .insert({
      feed,
      author_id: identity.id,
      author_name: identity.name,
      author_is_admin: identity.isAdmin,
      author_badges: identity.badges,
      text,
      media_url: media?.url ?? null,
      media_type: media?.type ?? null,
    })
    .select(POST_COLUMNS)
    .single();
  if (error) throw error;
  return { ...toPost(data as PostRow, identity.id), authorAvatar: identity.avatar || undefined };
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
