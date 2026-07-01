import type { Post } from '../types';

interface Props {
  post: Post;
  onLike: (id: string) => void;
}

function timeAgo(ts: number) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

export default function PostCard({ post, onLike }: Props) {
  return (
    <article className="flex gap-3 border-b border-neutral-900 px-4 py-4">
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-semibold text-black"
        style={{
          background: post.authorIsAdmin
            ? 'linear-gradient(135deg,#FA00FF,#00F7FF)'
            : 'linear-gradient(135deg,#00F7FF,#FA00FF)',
        }}
      >
        {post.authorName.charAt(0).toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-semibold">{post.authorName}</span>
          {post.authorIsAdmin && (
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-bold text-black"
              style={{ background: '#FA00FF' }}
            >
              PROPHET
            </span>
          )}
          <span className="text-neutral-600">· {timeAgo(post.createdAt)}</span>
        </div>
        <p className="mt-1 whitespace-pre-wrap break-words text-[15px] leading-snug">
          {post.text}
        </p>
        <button
          onClick={() => onLike(post.id)}
          className={`mt-2 flex items-center gap-1 text-sm transition-colors ${
            post.likedByMe ? 'text-[#FA00FF]' : 'text-neutral-500 hover:text-[#FA00FF]'
          }`}
        >
          <span>{post.likedByMe ? '♥' : '♡'}</span>
          <span>{post.likes}</span>
        </button>
      </div>
    </article>
  );
}
