import { useRef, useState } from 'react';
import type { Identity } from '../types';
import { uploadPostMedia, type PostMedia } from '../lib/api';
import { ImageIcon } from './icons';

interface Props {
  identity: Identity;
  placeholder: string;
  accent: 'cyan' | 'magenta';
  light?: boolean;
  onPost: (text: string, media?: PostMedia | null) => void;
}

interface Attachment {
  file: File;
  previewUrl: string;
  kind: 'image' | 'video';
}

export default function Composer({ identity, placeholder, accent, light, onPost }: Props) {
  const [text, setText] = useState('');
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const color = accent === 'cyan' ? '#00F7FF' : '#FA00FF';

  const canPost = (text.trim().length > 0 || attachment !== null) && !busy;

  function pickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setError('');
    if (attachment) URL.revokeObjectURL(attachment.previewUrl);
    setAttachment({
      file,
      previewUrl: URL.createObjectURL(file),
      kind: file.type.startsWith('video/') ? 'video' : 'image',
    });
  }

  function clearAttachment() {
    if (attachment) URL.revokeObjectURL(attachment.previewUrl);
    setAttachment(null);
  }

  async function submit() {
    if (!canPost) return;
    setBusy(true);
    setError('');
    try {
      let media: PostMedia | null = null;
      if (attachment) {
        media = await uploadPostMedia(identity.id, attachment.file);
      }
      onPost(text.trim(), media);
      setText('');
      clearAttachment();
    } catch {
      setError('Upload failed. Try a smaller file or check your connection.');
    }
    setBusy(false);
  }

  return (
    <div
      className={`border-b px-4 py-4 ${light ? 'border-neutral-200' : 'border-neutral-900'}`}
      style={light ? { background: '#FFFFFF' } : undefined}
    >
      <div className="flex gap-3">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold text-black"
          style={{ background: 'linear-gradient(135deg,#00F7FF,#FA00FF)' }}
        >
          {identity.avatar ? (
            <img src={identity.avatar} alt="" className="h-full w-full object-cover" />
          ) : (
            identity.name.charAt(0).toUpperCase()
          )}
        </div>
        <div className="flex-1">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={placeholder}
            rows={2}
            className={`w-full resize-none bg-transparent text-lg outline-none ${
              light ? 'text-black placeholder:text-neutral-500' : 'placeholder:text-neutral-600'
            }`}
          />

          {attachment && (
            <div className="relative mt-2 overflow-hidden rounded-2xl border border-neutral-300">
              {attachment.kind === 'video' ? (
                <video src={attachment.previewUrl} controls className="max-h-72 w-full bg-black" />
              ) : (
                <img
                  src={attachment.previewUrl}
                  alt="Attachment preview"
                  className="max-h-72 w-full object-cover"
                />
              )}
              <button
                type="button"
                onClick={clearAttachment}
                aria-label="Remove attachment"
                className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-lg font-bold text-white"
              >
                ×
              </button>
            </div>
          )}

          {error && <p className="mt-2 text-xs text-[#FA00FF]">{error}</p>}

          <input
            ref={fileRef}
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={pickFile}
          />
          <div className="mt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={busy}
              aria-label="Add photo or video"
              title="Add photo or video"
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition disabled:opacity-40 ${
                light
                  ? 'text-neutral-700 hover:bg-neutral-100'
                  : 'text-neutral-300 hover:bg-neutral-900'
              }`}
            >
              <ImageIcon className="h-5 w-5" />
              <span>Photo / video</span>
            </button>
            <button
              onClick={submit}
              disabled={!canPost}
              className="rounded-full px-5 py-2 text-sm font-semibold text-black transition disabled:cursor-not-allowed disabled:opacity-40"
              style={{ background: color }}
            >
              {busy ? 'Posting…' : 'Post'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
