import type { Identity, Post } from '../types';
import type { PostMedia } from '../lib/api';
import Composer from './Composer';
import PostCard from './PostCard';
import PaypalButton from './PaypalButton';
import { StarIcon } from './icons';

interface Props {
  identity: Identity;
  posts: Post[];
  onPost: (text: string, media?: PostMedia | null) => void;
  onLike: (id: string) => void;
  onOpenProfile: (authorId: string) => void;
  onJoined: () => void;
}

function JoinGate({ identity, onJoined }: { identity: Identity; onJoined: () => void }) {
  return (
    <div className="relative flex-1 overflow-hidden">
      <div className="pointer-events-none select-none blur-sm opacity-40">
        <PostCard
          post={{
            id: 'preview',
            feed: 'navi',
            authorId: 'preview',
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
            $200<span className="text-base font-normal text-neutral-400">/month</span>
          </div>
          <div className="mt-4">
            <PaypalButton
              planKey="society"
              userId={identity.id}
              email={identity.email}
              onSuccess={onJoined}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NaviSociety({ identity, posts, onPost, onLike, onOpenProfile, onJoined }: Props) {
  const hasAccess = identity.isAdmin || identity.isNaviMember;

  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-10 border-b border-neutral-900 bg-black/80 px-4 py-3 backdrop-blur">
        <h2 className="text-xl font-semibold">Navi Society</h2>
        <p className="text-xs text-neutral-500">Only Prophet Dian posts here.</p>
      </header>

      {!hasAccess && <JoinGate identity={identity} onJoined={onJoined} />}

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
              <PostCard key={post.id} post={post} onLike={onLike} onOpenProfile={onOpenProfile} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
