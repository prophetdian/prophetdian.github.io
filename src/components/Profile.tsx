import { useRef } from 'react';
import type { Identity } from '../types';

interface Props {
  identity: Identity;
  onUpdate: (changes: Partial<Pick<Identity, 'bio' | 'avatar'>>) => void;
}

const AVATAR_SIZE = 256;

function fileToAvatar(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = AVATAR_SIZE;
      canvas.height = AVATAR_SIZE;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error('no canvas'));
        return;
      }
      // Cover-crop the image into a square
      const side = Math.min(img.width, img.height);
      const sx = (img.width - side) / 2;
      const sy = (img.height - side) / 2;
      ctx.drawImage(img, sx, sy, side, side, 0, 0, AVATAR_SIZE, AVATAR_SIZE);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('bad image'));
    };
    img.src = url;
  });
}

export default function Profile({ identity, onUpdate }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      onUpdate({ avatar: await fileToAvatar(file) });
    } catch {
      // Ignore unreadable files
    }
    e.target.value = '';
  }

  return (
    <div className="min-h-full flex-1" style={{ background: '#00F7FF' }}>
      <header className="px-4 pt-6 pb-2 sm:px-6">
        <h2 className="text-2xl font-semibold text-black">My Profile</h2>
      </header>

      <div className="mx-auto max-w-xl px-4 pb-24 sm:px-6">
        <div className="flex flex-col items-center">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFile}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-2 border-black bg-black"
            title="Add profile pic"
          >
            {identity.avatar ? (
              <img
                src={identity.avatar}
                alt="Profile"
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-5xl font-semibold text-[#00F7FF]">
                {identity.name.charAt(0).toUpperCase()}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="mt-3 rounded-full bg-black px-4 py-1.5 text-xs font-semibold text-white"
          >
            {identity.avatar ? 'Change profile pic' : 'Add profile pic'}
          </button>
          {identity.isAdmin && (
            <span
              className="mt-3 inline-block rounded-full px-3 py-1 text-xs font-bold text-black"
              style={{ background: '#FA00FF' }}
            >
              PROPHET
            </span>
          )}
        </div>

        <label className="mt-6 block text-sm font-medium text-black">Username</label>
        <div className="mt-2 flex items-center rounded-2xl border-2 border-black bg-white px-4 py-3">
          <div className="truncate text-lg font-semibold text-black">{identity.name}</div>
        </div>

        <label className="mt-5 block text-sm font-medium text-black">Email</label>
        <div className="mt-2 flex items-center rounded-2xl border-2 border-black bg-white px-4 py-3">
          <div className="truncate text-black">{identity.email}</div>
        </div>

        <h3 className="mt-8 text-2xl font-semibold text-black">Bio</h3>
        <textarea
          value={identity.bio}
          onChange={(e) => onUpdate({ bio: e.target.value })}
          placeholder="Tell people who you are and what you are called to..."
          className="mt-3 min-h-44 w-full resize-y rounded-2xl border-2 border-black bg-white p-4 text-black outline-none placeholder:text-black/40"
        />
        <p className="mt-2 text-xs text-black/60">Saved to your profile automatically.</p>
      </div>
    </div>
  );
}
