import type { View } from '../types';
import { FeedIcon, MailIcon, StarIcon, UserIcon } from './icons';

interface Props {
  active: View;
  onNavigate: (view: View) => void;
}

export default function MobileNav({ active, onNavigate }: Props) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 flex border-t border-neutral-900 bg-black/95 backdrop-blur md:hidden">
      <button
        className={`flex flex-1 flex-col items-center gap-0.5 py-3 text-xs ${
          active === 'prophetic' ? 'text-[#00F7FF]' : 'text-neutral-500'
        }`}
        onClick={() => onNavigate('prophetic')}
      >
        <FeedIcon className="h-5 w-5" />
        Prophetic Feed
      </button>
      <button
        className={`flex flex-1 flex-col items-center gap-0.5 py-3 text-xs ${
          active === 'navi' ? 'text-[#FA00FF]' : 'text-neutral-500'
        }`}
        onClick={() => onNavigate('navi')}
      >
        <StarIcon className="h-5 w-5" />
        Navi Society
      </button>
      <button
        className={`flex flex-1 flex-col items-center gap-0.5 py-3 text-xs ${
          active === 'profile' ? 'text-[#00F7FF]' : 'text-neutral-500'
        }`}
        onClick={() => onNavigate('profile')}
      >
        <UserIcon className="h-5 w-5" />
        My Profile
      </button>
      <button
        className={`flex flex-1 flex-col items-center gap-0.5 py-3 text-xs ${
          active === 'dms' ? 'text-white' : 'text-neutral-500'
        }`}
        onClick={() => onNavigate('dms')}
      >
        <MailIcon className="h-5 w-5" />
        DMs
      </button>
    </nav>
  );
}
