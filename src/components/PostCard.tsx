import { Fragment } from 'react';
import type { Post } from '../types';
import { badgeById } from '../lib/badges';
import { HeartIcon } from './icons';

interface Props {
  post: Post;
  onLike: (id: string) => void;
  onDelete?: (id: string) => void;
  onOpenProfile?: (authorId: string) => void;
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

const URL_SPLIT_RE = /(https?:\/\/[^\s]+)/g;
const URL_TEST_RE = /^https?:\/\/[^\s]+$/;

// Render post text with any http(s) links turned into clickable anchors.
function renderText(text: string) {
  return text.split(URL_SPLIT_RE).map((part, i) =>
    URL_TEST_RE.test(part) ? (
      <a
        key={i}
        href={part}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="text-[#00F7FF] underline underline-offset-2 break-all hover:text-[#FA00FF]"
      >
        {part}
      </a>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}

export default function PostCard({ post, onLike, onDelete, onOpenProfile }: Props) {
  const canOpen = !!onOpenProfile && post.authorId !== 'preview';
  const openProfile = () => onOpenProfile?.(post.authorId);
  return (
    <article className="flex gap-3 border-b border-neutral-900 px-4 py-4">
      <button
        type="button"
        onClick={canOpen ? openProfile : undefined}
        disabled={!canOpen}
        aria-label={canOpen ? `View ${post.authorName}'s profile` : undefined}
        className={`flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold text-black ${
          canOpen ? 'cursor-pointer' : 'cursor-default'
        }`}
        style={{
          background: post.authorIsAdmin
            ? 'linear-gradient(135deg,#FA00FF,#00F7FF)'
            : 'linear-gradient(135deg,#00F7FF,#FA00FF)',
        }}
      >
        {post.authorAvatar ? (
          <img src={post.authorAvatar} alt="" className="h-full w-full object-cover" />
        ) : (
          post.authorName.charAt(0).toUpperCase()
        )}
      </button>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 text-sm">
          {canOpen ? (
            <button
              type="button"
              onClick={openProfile}
              className="font-semibold hover:underline"
            >
              {post.authorName}
            </button>
          ) : (
            <span className="font-semibold">{post.authorName}</span>
          )}
          {post.authorBadges?.map((id) => {
            const badge = badgeById(id);
            return (
              <img
                key={id}
                src={badge.image}
                alt={badge.name}
                title={badge.name}
                className="h-4.5 w-4.5 shrink-0"
              />
            );
          })}
          <span className="text-neutral-600">· {timeAgo(post.createdAt)}</span>
        </div>
        {post.authorIsAdmin && (
          <div className="mt-1">
            <span
              className="inline-block rounded-full px-2 py-0.5 text-[10px] font-bold text-black"
              style={{ background: '#FA00FF' }}
            >
              PROPHET
            </span>
          </div>
        )}
        {post.text && (
          <p className="mt-1 whitespace-pre-wrap break-words text-[15px] leading-snug">
            {renderText(post.text)}
          </p>
        )}
        {post.mediaUrl && (
          <div className="mt-2 overflow-hidden rounded-2xl border border-neutral-800">
            {post.mediaType === 'video' ? (
              <video src={post.mediaUrl} controls playsInline className="max-h-[32rem] w-full bg-black" />
            ) : (
              <img
                src={post.mediaUrl}
                alt=""
                loading="lazy"
                className="max-h-[32rem] w-full object-cover"
              />
            )}
          </div>
        )}
        <div className="mt-2 flex items-center gap-4">
          <button
            onClick={() => onLike(post.id)}
            className={`flex items-center gap-1 text-sm transition-colors ${
              post.likedByMe ? 'text-[#FA00FF]' : 'text-neutral-500 hover:text-[#FA00FF]'
            }`}
          >
            <HeartIcon filled={post.likedByMe} className="h-4 w-4" />
            <span>{post.likes}</span>
          </button>
          {onDelete && (
            <button
              onClick={() => onDelete(post.id)}
              className="text-sm text-neutral-500 transition-colors hover:text-red-500"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
