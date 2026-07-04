import { MailIcon } from './icons';

export default function Dms() {
  return (
    <div className="min-h-full flex-1 text-black" style={{ background: '#FFFFFF' }}>
      <header className="px-4 pt-6 pb-2 sm:px-6">
        <h2 className="text-2xl font-semibold">DMs</h2>
      </header>
      <div className="mx-auto flex max-w-xl flex-col items-center px-4 pb-24 pt-16 text-center sm:px-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-black">
          <MailIcon className="h-10 w-10" />
        </div>
        <h3 className="mt-6 text-xl font-semibold">No messages yet</h3>
        <p className="mt-2 max-w-xs text-sm text-black/60">
          Direct messages are on the way. Your conversations will live right here.
        </p>
        <button
          type="button"
          disabled
          className="mt-8 cursor-not-allowed rounded-full bg-black px-6 py-3 font-semibold text-white opacity-60"
        >
          New Message — coming soon
        </button>
      </div>
    </div>
  );
}
