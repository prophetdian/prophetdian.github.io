import { useState } from 'react';
import type { Identity, Post } from '../types';
import type { PostMedia } from '../lib/api';
import Composer from './Composer';
import PostCard from './PostCard';
import { BadgeIcon, SearchIcon } from './icons';

interface Props {
  identity: Identity;
  posts: Post[];
  onPost: (text: string, media?: PostMedia | null) => void;
  onLike: (id: string) => void;
  onOpenBadges: () => void;
  onOpenProfile: (authorId: string) => void;
}

export default function PropheticFeed({
  identity,
  posts,
  onPost,
  onLike,
  onOpenBadges,
  onOpenProfile,
}: Props) {
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const visible = q
    ? posts.filter(
        (p) => p.text.toLowerCase().includes(q) || p.authorName.toLowerCase().includes(q),
      )
    : posts;

  return (
    <div className="flex-1">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-neutral-900 bg-black/80 px-4 py-3 backdrop-blur">
        <h2 className="text-xl font-semibold">Prophetic Feed</h2>
        <button
          type="button"
          onClick={onOpenBadges}
          aria-label="Badges"
          title="Badges"
          className="flex h-9 w-9 items-center justify-center rounded-full text-black md:hidden"
          style={{ background: '#FA00FF' }}
        >
          <BadgeIcon className="h-5 w-5" />
        </button>
      </header>
      <Composer
        identity={identity}
        accent="cyan"
        light
        placeholder="What's the Word?"
        onPost={onPost}
      />
      <div className="border-b border-neutral-900 px-4 py-3" style={{ background: '#00F7FF' }}>
        <div className="flex items-center gap-2 rounded-full border-2 border-black/25 px-4 py-2 text-black">
          <SearchIcon className="h-5 w-5 shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search the feed"
            className="w-full bg-transparent outline-none placeholder:text-black/50"
          />
        </div>
      </div>
      <div>
        {posts.length === 0 && (
          <p className="px-4 py-10 text-center text-neutral-600">
            No posts yet. Be the first to prophesy.
          </p>
        )}
        {posts.length > 0 && visible.length === 0 && (
          <p className="px-4 py-10 text-center text-neutral-600">
            No posts match your search.
          </p>
        )}
        {visible.map((post) => (
          <PostCard key={post.id} post={post} onLike={onLike} onOpenProfile={onOpenProfile} />
        ))}
      </div>
    </div>
  );
}
