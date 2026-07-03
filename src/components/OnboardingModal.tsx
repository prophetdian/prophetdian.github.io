import { useState } from 'react';

interface Props {
  onSignIn: (email: string, password: string) => Promise<void>;
  onSignUp: (name: string, email: string, password: string) => Promise<void>;
}

export default function OnboardingModal({ onSignIn, onSignUp }: Props) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const isSignUp = mode === 'signup';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    if (!email.trim() || !password.trim()) return;
    if (isSignUp && !name.trim()) return;
    setBusy(true);
    setError('');
    try {
      if (isSignUp) {
        await onSignUp(name, email, password);
      } else {
        await onSignIn(email, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Try again.');
    }
    setBusy(false);
  }

  function toggleMode() {
    setMode((m) => (m === 'signin' ? 'signup' : 'signin'));
    setError('');
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
          {isSignUp
            ? 'Create an account with your email and a password.'
            : 'Sign in with your email and password.'}
        </p>
        {isSignUp && (
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-4 py-3 text-white outline-none focus:border-[#00F7FF]"
          />
        )}
        <input
          type="email"
          required
          autoFocus={!isSignUp}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className={`${isSignUp ? 'mt-3 ' : ''}w-full rounded-lg border border-neutral-700 bg-neutral-950 px-4 py-3 text-white outline-none focus:border-[#00F7FF]`}
        />
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="mt-3 w-full rounded-lg border border-neutral-700 bg-neutral-950 px-4 py-3 text-white outline-none focus:border-[#00F7FF]"
        />
        {error && <p className="mt-3 text-xs text-[#FA00FF]">{error}</p>}
        <button
          type="submit"
          disabled={busy || !email.trim() || !password.trim() || (isSignUp && !name.trim())}
          className="mt-4 w-full rounded-full py-3 font-medium text-black transition disabled:cursor-not-allowed disabled:opacity-50"
          style={{ background: 'linear-gradient(90deg,#00F7FF,#FA00FF)' }}
        >
          {busy ? 'Please wait...' : isSignUp ? 'Create account' : 'Sign in'}
        </button>
        <button
          type="button"
          onClick={toggleMode}
          className="mt-4 block w-full text-center text-xs text-neutral-500 underline hover:text-neutral-300"
        >
          {isSignUp ? 'Already have an account? Sign in' : 'New here? Create an account'}
        </button>
      </form>
    </div>
  );
}
