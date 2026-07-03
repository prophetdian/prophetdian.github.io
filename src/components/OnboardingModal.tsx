import { useState } from 'react';

interface Props {
  onSubmit: (name: string, email: string) => Promise<void>;
}

export default function OnboardingModal({ onSubmit }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sentTo, setSentTo] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || sending) return;
    setSending(true);
    setError('');
    try {
      await onSubmit(name, email);
      setSentTo(email.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send the link. Try again.');
    }
    setSending(false);
  }

  if (sentTo) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 px-4">
        <div
          className="w-full max-w-sm rounded-2xl border bg-black p-6 text-center glow-cyan"
          style={{ borderColor: 'rgba(0,247,255,0.3)' }}
        >
          <h1 className="text-2xl font-semibold text-gradient mb-2">Check your email</h1>
          <p className="text-sm text-neutral-400">
            A magic sign-in link is on its way to{' '}
            <span className="font-semibold text-[#00F7FF]">{sentTo}</span>. Open it on this
            device to enter the Prophetic Feed.
          </p>
          <button
            type="button"
            onClick={() => setSentTo('')}
            className="mt-5 text-xs text-neutral-500 underline hover:text-neutral-300"
          >
            Use a different email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border border-cyan/30 bg-black p-6 glow-cyan"
        style={{ borderColor: 'rgba(0,247,255,0.3)' }}
      >
        <h1 className="text-2xl font-semibold text-gradient mb-1">Prophet Dian</h1>
        <p className="text-sm text-neutral-400 mb-5">
          Enter your name and email — we&apos;ll send you a magic link to sign in.
        </p>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-4 py-3 text-white outline-none focus:border-[#00F7FF]"
        />
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="mt-3 w-full rounded-lg border border-neutral-700 bg-neutral-950 px-4 py-3 text-white outline-none focus:border-[#00F7FF]"
        />
        {error && <p className="mt-3 text-xs text-[#FA00FF]">{error}</p>}
        <button
          type="submit"
          disabled={sending || !name.trim() || !email.trim()}
          className="mt-4 w-full rounded-full py-3 font-medium text-black transition disabled:cursor-not-allowed disabled:opacity-50"
          style={{ background: 'linear-gradient(90deg,#00F7FF,#FA00FF)' }}
        >
          {sending ? 'Sending link...' : 'Send magic link'}
        </button>
      </form>
    </div>
  );
}
