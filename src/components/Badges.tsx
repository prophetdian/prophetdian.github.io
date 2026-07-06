import { useState } from 'react';
import type { Identity } from '../types';
import { BADGES, type Badge } from '../lib/badges';
import PaypalButton from './PaypalButton';

interface Props {
  identity: Identity;
  onPurchased: () => void;
}

function accentFor(badge: Badge) {
  return badge.price === 20 ? '#FA00FF' : '#00F7FF';
}

function PayScreen({
  badge,
  identity,
  onBack,
  onPurchased,
}: {
  badge: Badge;
  identity: Identity;
  onBack: () => void;
  onPurchased: () => void;
}) {
  const accent = accentFor(badge);
  return (
    <div className="flex-1">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-neutral-900 bg-black/80 px-4 py-3 backdrop-blur">
        <button
          onClick={onBack}
          className="rounded-full px-3 py-1 text-sm text-neutral-400 hover:text-white"
        >
          ← Back
        </button>
        <h2 className="text-xl font-semibold">Get Badge</h2>
      </header>

      <div className="flex justify-center px-4 py-8">
        <div
          className="w-full max-w-sm rounded-2xl border bg-neutral-950 p-6 text-center"
          style={{ borderColor: accent }}
        >
          <div
            className="mx-auto flex h-20 w-20 items-center justify-center rounded-full"
            style={{ background: 'rgba(255,255,255,0.06)' }}
          >
            <img src={badge.image} alt={badge.name} className="h-12 w-12" />
          </div>
          <h3 className="mt-4 text-xl font-semibold">{badge.name}</h3>
          <p className="mt-1 text-sm text-neutral-500">{badge.description}</p>
          <div className="mt-4 text-3xl font-bold">
            ${badge.price}
            <span className="text-base font-normal text-neutral-400">/year</span>
          </div>
          <div className="mt-5">
            <PaypalButton
              planKey={badge.id}
              userId={identity.id}
              email={identity.email}
              onSuccess={onPurchased}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Badges({ identity, onPurchased }: Props) {
  const [selected, setSelected] = useState<Badge | null>(null);

  if (selected) {
    return (
      <PayScreen
        badge={selected}
        identity={identity}
        onBack={() => setSelected(null)}
        onPurchased={() => {
          onPurchased();
          setSelected(null);
        }}
      />
    );
  }

  return (
    <div className="flex-1">
      <header className="sticky top-0 z-10 border-b border-neutral-900 bg-black/80 px-4 py-3 backdrop-blur">
        <h2 className="text-xl font-semibold">Ministry Badges</h2>
        <p className="text-xs text-neutral-500">Get a badge to mark your calling.</p>
      </header>

      <div className="px-4 py-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {BADGES.map((badge) => {
            const accent = accentFor(badge);
            const owned = identity.badges.includes(badge.id);
            return (
              <div
                key={badge.id}
                className="rounded-2xl border bg-neutral-950 p-4"
                style={{ borderColor: owned ? accent : '#262626' }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
                    style={{ background: 'rgba(255,255,255,0.06)' }}
                  >
                    <img src={badge.image} alt={badge.name} className="h-8 w-8" />
                  </div>
                  <div>
                    <div className="font-semibold">{badge.name}</div>
                    <div className="text-xs text-neutral-500">{badge.description}</div>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div>
                    {owned ? (
                      <div className="text-sm font-semibold" style={{ color: accent }}>
                        Permanent
                      </div>
                    ) : (
                      <div className="text-lg font-bold">
                        ${badge.price}
                        <span className="text-xs font-normal text-neutral-500">/year</span>
                      </div>
                    )}
                  </div>
                  {owned ? (
                    <span
                      className="rounded-full px-4 py-1.5 text-xs font-bold text-black"
                      style={{ background: accent }}
                    >
                      OWNED
                    </span>
                  ) : (
                    <button
                      onClick={() => setSelected(badge)}
                      className="rounded-full px-4 py-1.5 text-xs font-bold text-black"
                      style={{ background: accent }}
                    >
                      Get Badge
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
