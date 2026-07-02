import type { View } from '../types';

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
        <span className="text-xl">🕊️</span>
        Prophetic Feed
      </button>
      <button
        className={`flex flex-1 flex-col items-center gap-0.5 py-3 text-xs ${
          active === 'navi' ? 'text-[#FA00FF]' : 'text-neutral-500'
        }`}
        onClick={() => onNavigate('navi')}
      >
        <span className="text-xl">✨</span>
        Navi Society
      </button>
      <button
        className={`flex flex-1 flex-col items-center gap-0.5 py-3 text-xs ${
          active === 'notes' ? 'text-[#00FF49]' : 'text-neutral-500'
        }`}
        onClick={() => onNavigate('notes')}
      >
        <span className="text-xl">📝</span>
        Notes
      </button>
    </nav>
  );
}
