import { useRef, useState } from 'react';
import type { Identity } from '../types';
import { badgeById } from '../lib/badges';
import { GearIcon } from './icons';

interface Props {
  identity: Identity;
  onUpdate: (changes: Partial<Pick<Identity, 'name' | 'bio' | 'avatar'>>) => void;
  onSignOut: () => void;
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

export default function Profile({ identity, onUpdate, onSignOut }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

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
              className="mt-3 inline-block rounded-full px-6 py-2 text-2xl font-bold text-black"
              style={{ background: '#FA00FF' }}
            >
              PROPHET
            </span>
          )}
        </div>

        <label className="mt-6 block text-sm font-medium text-black">Username</label>
        <div className="mt-2 flex items-center rounded-2xl border-2 border-black bg-white px-4 py-3">
          <input
            value={identity.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            placeholder="Your username"
            className="w-full bg-transparent text-lg font-semibold text-black outline-none placeholder:text-black/40"
          />
        </div>

        <h3 className="mt-8 text-2xl font-semibold text-black">Bio</h3>
        <textarea
          value={identity.bio}
          onChange={(e) => onUpdate({ bio: e.target.value })}
          placeholder="Tell people who you are and what you are called to..."
          className="mt-3 min-h-44 w-full resize-y rounded-2xl border-2 border-black bg-white p-4 text-black outline-none placeholder:text-black/40"
        />
        <p className="mt-2 text-xs text-black/60">Saved to your profile automatically.</p>

        <h3 className="mt-8 text-center text-2xl font-semibold text-black">Badges</h3>
        {identity.badges.length > 0 ? (
          <div className="mt-3 flex flex-col items-center gap-3">
            {identity.badges.map((id) => {
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
        ) : (
          <p className="mt-3 text-center text-sm text-black/60">No badges yet.</p>
        )}

        <button
          type="button"
          onClick={() => setSettingsOpen((v) => !v)}
          className="mt-8 flex items-center gap-2 rounded-2xl border-2 border-black bg-black px-4 py-3 font-semibold text-white"
        >
          <GearIcon className="h-5 w-5 shrink-0" />
          <span>Settings</span>
        </button>
        {settingsOpen && (
          <div className="mt-3 rounded-2xl border-2 border-black bg-white p-4">
            <label className="block text-sm font-medium text-black">Email</label>
            <div className="mt-2 mb-4 truncate rounded-xl border-2 border-black bg-white px-4 py-3 text-black">
              {identity.email}
            </div>
            <button
              type="button"
              onClick={onSignOut}
              className="w-full rounded-full bg-black px-4 py-2.5 font-semibold text-white"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
