import type { Identity, View } from '../types';

interface Props {
  active: View;
  onNavigate: (view: View) => void;
  identity: Identity;
  onSignOut: () => void;
}

const navItemBase =
  'flex items-center gap-3 rounded-full px-4 py-3 text-lg font-medium transition-colors cursor-pointer select-none';

export default function Sidebar({ active, onNavigate, identity, onSignOut }: Props) {
  return (
    <aside className="hidden h-full w-64 shrink-0 flex-col justify-between border-r border-neutral-900 px-3 py-4 md:flex">
      <div>
        <div className="px-3 pb-6 text-2xl font-bold text-gradient">Prophet Dian</div>
        <nav className="flex flex-col gap-1">
          <button
            className={`${navItemBase} ${
              active === 'prophetic' ? 'text-[#00F7FF]' : 'text-white hover:bg-neutral-900'
            }`}
            onClick={() => onNavigate('prophetic')}
          >
            <span>🕊️</span>
            <span>Prophetic Feed</span>
          </button>
          <button
            className={`${navItemBase} ${
              active === 'navi' ? 'text-[#FA00FF]' : 'text-white hover:bg-neutral-900'
            }`}
            onClick={() => onNavigate('navi')}
          >
            <span>✨</span>
            <span>Navi Society</span>
          </button>
          <button
            className={`${navItemBase} ${
              active === 'notes' ? 'text-[#00FF49]' : 'text-white hover:bg-neutral-900'
            }`}
            onClick={() => onNavigate('notes')}
          >
            <span>📝</span>
            <span>Notes</span>
          </button>
        </nav>
      </div>

      <div className="flex items-center justify-between rounded-full border border-neutral-800 px-3 py-2">
        <div className="flex items-center gap-2 overflow-hidden">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-semibold text-black"
            style={{ background: 'linear-gradient(135deg,#00F7FF,#FA00FF)' }}
          >
            {identity.name.charAt(0).toUpperCase()}
          </div>
          <div className="truncate text-sm">
            <div className="truncate font-medium">{identity.name}</div>
            {identity.isAdmin && <div className="text-xs text-[#FA00FF]">Admin</div>}
          </div>
        </div>
        <button
          onClick={onSignOut}
          className="shrink-0 text-xs text-neutral-500 hover:text-neutral-300"
        >
          Switch
        </button>
      </div>
    </aside>
  );
}
