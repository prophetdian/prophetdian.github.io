import { useState } from 'react';

interface Props {
  onSubmit: (name: string, email: string) => void;
}

export default function OnboardingModal({ onSubmit }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit(name, email);
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
          Enter your name to enter the Prophetic Feed. Magic link sign-in is coming soon.
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
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email (optional)"
          className="mt-3 w-full rounded-lg border border-neutral-700 bg-neutral-950 px-4 py-3 text-white outline-none focus:border-[#00F7FF]"
        />
        <button
          type="submit"
          className="mt-4 w-full rounded-full py-3 font-medium text-black transition"
          style={{ background: 'linear-gradient(90deg,#00F7FF,#FA00FF)' }}
        >
          Enter
        </button>
      </form>
    </div>
  );
}
