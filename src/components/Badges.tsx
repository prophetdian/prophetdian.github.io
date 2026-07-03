import type { Identity } from '../types';
import { BADGES } from '../lib/badges';

interface Props {
  identity: Identity;
}

export default function Badges({ identity }: Props) {
  return (
    <div className="flex-1">
      <header className="sticky top-0 z-10 border-b border-neutral-900 bg-black/80 px-4 py-3 backdrop-blur">
        <h2 className="text-xl font-semibold">Ministry Badges</h2>
        <p className="text-xs text-neutral-500">
          Get a badge to mark your calling on Prophet Dian.
        </p>
      </header>

      <div className="px-4 py-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {BADGES.map((badge) => {
            const accent = badge.price === 20 ? '#FA00FF' : '#00F7FF';
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
                  {owned ? (
                    <span
                      className="rounded-full px-4 py-1.5 text-xs font-bold text-black"
                      style={{ background: accent }}
                    >
                      OWNED
                    </span>
                  ) : (
                    <button
                      disabled
                      title="Payments launching soon"
                      className="cursor-not-allowed rounded-full px-4 py-1.5 text-xs font-semibold text-black opacity-60"
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
        <p className="mt-3 text-xs text-neutral-600">Payments launching soon.</p>
      </div>
    </div>
  );
}
