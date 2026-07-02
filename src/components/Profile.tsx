import type { ComponentType } from 'react';
import type { BadgeId, Identity } from '../types';
import { BookIcon, CrossIcon, EyeIcon, MegaphoneIcon, StaffIcon } from './icons';

interface Props {
  identity: Identity;
}

interface Badge {
  id: BadgeId;
  name: string;
  price: number;
  description: string;
  icon: ComponentType<{ className?: string }>;
}

const BADGES: Badge[] = [
  {
    id: 'evangelist',
    name: 'Evangelist',
    price: 10,
    description: 'For those called to proclaim the gospel.',
    icon: MegaphoneIcon,
  },
  {
    id: 'pastor',
    name: 'Pastor',
    price: 10,
    description: 'For those called to shepherd and care.',
    icon: StaffIcon,
  },
  {
    id: 'teacher',
    name: 'Teacher',
    price: 10,
    description: 'For those called to teach the word.',
    icon: BookIcon,
  },
  {
    id: 'apostle',
    name: 'Apostle',
    price: 20,
    description: 'For those called to plant and build.',
    icon: CrossIcon,
  },
  {
    id: 'prophet',
    name: 'Prophet',
    price: 20,
    description: 'For those called to see and speak.',
    icon: EyeIcon,
  },
];

export default function Profile({ identity }: Props) {
  return (
    <div className="flex-1">
      <header className="sticky top-0 z-10 border-b border-neutral-900 bg-black/80 px-4 py-3 backdrop-blur">
        <h2 className="text-xl font-semibold">My Profile</h2>
        <p className="text-xs text-neutral-500">Your identity and ministry badges.</p>
      </header>

      <div className="flex items-center gap-4 border-b border-neutral-900 px-4 py-6">
        <div
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-2xl font-semibold text-black"
          style={{ background: 'linear-gradient(135deg,#00F7FF,#FA00FF)' }}
        >
          {identity.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <div className="text-lg font-semibold">{identity.name}</div>
          {identity.isAdmin && (
            <span
              className="mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold text-black"
              style={{ background: '#FA00FF' }}
            >
              PROPHET
            </span>
          )}
        </div>
      </div>

      <div className="px-4 py-6">
        <h3 className="text-lg font-semibold text-gradient">Ministry Badges</h3>
        <p className="mt-1 text-sm text-neutral-500">
          Get a badge to mark your calling on Prophet Dian.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {BADGES.map((badge) => {
            const Icon = badge.icon;
            const accent = badge.price === 20 ? '#FA00FF' : '#00F7FF';
            return (
              <div
                key={badge.id}
                className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
                    style={{ background: 'rgba(255,255,255,0.05)', color: accent }}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="font-semibold">{badge.name}</div>
                    <div className="text-xs text-neutral-500">{badge.description}</div>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="text-lg font-bold">
                    ${badge.price}
                    <span className="text-xs font-normal text-neutral-500">/year</span>
                  </div>
                  <button
                    disabled
                    title="Payments launching soon"
                    className="cursor-not-allowed rounded-full px-4 py-1.5 text-xs font-semibold text-black opacity-60"
                    style={{ background: accent }}
                  >
                    Get Badge
                  </button>
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
