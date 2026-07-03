import type { Identity, Post } from '../types';
import Composer from './Composer';
import PostCard from './PostCard';

interface Props {
  identity: Identity;
  posts: Post[];
  onPost: (text: string) => void;
  onLike: (id: string) => void;
}

export default function PropheticFeed({ identity, posts, onPost, onLike }: Props) {
  return (
    <div className="flex-1">
      <header className="sticky top-0 z-10 border-b border-neutral-900 bg-black/80 px-4 py-3 backdrop-blur">
        <h2 className="text-xl font-semibold">Prophetic Feed</h2>
      </header>
      <Composer
        identity={identity}
        accent="cyan"
        placeholder="What's the prophetic word?"
        onPost={onPost}
      />
      <div>
        {posts.length === 0 && (
          <p className="px-4 py-10 text-center text-neutral-600">
            No posts yet. Be the first to prophesy.
          </p>
        )}
        {posts.map((post) => (
          <PostCard key={post.id} post={post} onLike={onLike} />
        ))}
      </div>
    </div>
  );
}
