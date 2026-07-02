import type { Identity, Post } from '../types';
import Composer from './Composer';
import PostCard from './PostCard';
import { StarIcon } from './icons';

interface Props {
  identity: Identity;
  posts: Post[];
  onPost: (text: string) => void;
  onLike: (id: string) => void;
}

function JoinGate() {
  return (
    <div className="relative flex-1 overflow-hidden">
      <div className="pointer-events-none select-none blur-sm opacity-40">
        <PostCard
          post={{
            id: 'preview',
            feed: 'navi',
            authorName: 'Prophet Dian',
            authorIsAdmin: true,
            text: 'This is where deeper teaching, prophetic strategy, and direct impartation live — for those planted in Navi Society.',
            createdAt: Date.now(),
            likes: 42,
            likedByMe: false,
          }}
          onLike={() => {}}
        />
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-black/70 px-6">
        <div
          className="w-full max-w-sm rounded-2xl border p-6 text-center glow-magenta"
          style={{ borderColor: 'rgba(250,0,255,0.35)' }}
        >
          <StarIcon className="mx-auto h-8 w-8 text-[#FA00FF]" />
          <h3 className="mt-2 text-xl font-semibold text-gradient">Navi Society</h3>
          <p className="mt-2 text-sm text-neutral-400">
            A personal platform from Prophet Dian. Only Prophet Dian posts here — deep teaching,
            strategy, and direct impartation for those who are planted in.
          </p>
          <div className="mt-4 text-3xl font-bold">
            $500<span className="text-base font-normal text-neutral-400">/month</span>
          </div>
          <button
            disabled
            title="PayPal checkout is launching soon"
            className="mt-4 w-full cursor-not-allowed rounded-full py-3 font-semibold text-black opacity-60"
            style={{ background: 'linear-gradient(90deg,#00F7FF,#FA00FF)' }}
          >
            Join Navi Society — $500/mo
          </button>
          <p className="mt-2 text-xs text-neutral-600">Payments launching soon.</p>
        </div>
      </div>
    </div>
  );
}

export default function NaviSociety({ identity, posts, onPost, onLike }: Props) {
  const hasAccess = identity.isAdmin || identity.isNaviMember;

  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-10 border-b border-neutral-900 bg-black/80 px-4 py-3 backdrop-blur">
        <h2 className="text-xl font-semibold">Navi Society</h2>
        <p className="text-xs text-neutral-500">Only Prophet Dian posts here.</p>
      </header>

      {!hasAccess && <JoinGate />}

      {hasAccess && (
        <div className="flex flex-1 flex-col">
          {identity.isAdmin && (
            <Composer
              identity={identity}
              accent="magenta"
              placeholder="Share with Navi Society..."
              onPost={onPost}
            />
          )}
          <div>
            {posts.length === 0 && (
              <p className="px-4 py-10 text-center text-neutral-600">
                Nothing posted yet.
              </p>
            )}
            {posts.map((post) => (
              <PostCard key={post.id} post={post} onLike={onLike} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
