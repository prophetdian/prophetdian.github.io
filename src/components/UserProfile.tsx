import { useEffect, useState } from 'react';
import type { BadgeId, Post, PublicProfile } from '../types';
import { fetchPublicProfile } from '../lib/api';
import { badgeById } from '../lib/badges';
import { ArrowLeftIcon } from './icons';
import PostCard from './PostCard';

interface Props {
  userId: string;
  posts: Post[];
  onBack: () => void;
  onLike: (id: string) => void;
}

// Ministry standing is public (it already shows on every post card), so we
// derive it from the user's posts rather than exposing any private profile data.
function publicStanding(posts: Post[]): { isAdmin: boolean; badges: BadgeId[] } {
  let isAdmin = false;
  const badges = new Set<BadgeId>();
  for (const p of posts) {
    if (p.authorIsAdmin) isAdmin = true;
    p.authorBadges?.forEach((b) => badges.add(b));
  }
  return { isAdmin, badges: [...badges] };
}

export default function UserProfile({ userId, posts, onBack, onLike }: Props) {
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const userPosts = posts
    .filter((p) => p.authorId === userId)
    .sort((a, b) => b.createdAt - a.createdAt);
  const { isAdmin, badges } = publicStanding(userPosts);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchPublicProfile(userId)
      .then((p) => {
        if (active) setProfile(p);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [userId]);

  // Fall back to the name shown on their posts until the fetch resolves.
  const name = profile?.name || userPosts[0]?.authorName || 'Believer';
  const bio = profile?.bio ?? '';
  const avatar = profile?.avatar ?? '';

  return (
    <div className="min-h-full flex-1" style={{ background: '#00F7FF' }}>
      <header className="flex items-center gap-3 px-4 pt-6 pb-2 sm:px-6">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back"
          title="Back"
          className="flex h-9 w-9 items-center justify-center rounded-full text-white"
          style={{ background: '#000000' }}
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </button>
        <h2 className="text-2xl font-semibold text-black">Profile</h2>
      </header>

      <div className="mx-auto max-w-xl px-4 pb-24 sm:px-6">
        <div className="mt-4 flex flex-col items-center">
          <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-2 border-black bg-black">
            {avatar ? (
              <img src={avatar} alt={name} className="h-full w-full object-cover" />
            ) : (
              <span className="text-5xl font-semibold text-[#00F7FF]">
                {name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="mt-4 text-2xl font-semibold text-black">{name}</div>
          {isAdmin && (
            <span
              className="mt-3 inline-block rounded-full px-6 py-2 text-2xl font-bold text-black"
              style={{ background: '#FA00FF' }}
            >
              PROPHET
            </span>
          )}
        </div>

        {badges.length > 0 && (
          <>
            <h3 className="mt-8 text-center text-2xl font-semibold text-black">Badges</h3>
            <div className="mt-3 flex flex-col items-center gap-3">
              {badges.map((id) => {
                const badge = badgeById(id);
                return (
                  <div
                    key={id}
                    className="flex items-center gap-2 rounded-2xl border-2 border-black bg-white px-4 py-2"
                  >
                    <img src={badge.image} alt={badge.name} className="h-6 w-6 shrink-0" />
                    <span className="font-semibold text-black">{badge.name}</span>
                  </div>
                );
              })}
            </div>
          </>
        )}

        <h3 className="mt-8 text-2xl font-semibold text-black">Bio</h3>
        {bio ? (
          <p className="mt-3 whitespace-pre-wrap break-words rounded-2xl border-2 border-black bg-white p-4 text-black">
            {bio}
          </p>
        ) : (
          <p className="mt-3 text-sm text-black/60">
            {loading ? 'Loading…' : 'No bio yet.'}
          </p>
        )}

        <h3 className="mt-8 text-center text-2xl font-semibold text-black">Posts</h3>
        {userPosts.length > 0 ? (
          <div className="mt-3 overflow-hidden rounded-2xl border-2 border-black bg-black">
            {userPosts.map((post) => (
              <PostCard key={post.id} post={post} onLike={onLike} />
            ))}
          </div>
        ) : (
          <p className="mt-3 text-center text-sm text-black/60">No posts yet.</p>
        )}
      </div>
    </div>
  );
}
