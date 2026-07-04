import { useState } from 'react';
import type { Identity } from '../types';

interface Props {
  identity: Identity;
  placeholder: string;
  accent: 'cyan' | 'magenta';
  light?: boolean;
  onPost: (text: string) => void;
}

export default function Composer({ identity, placeholder, accent, light, onPost }: Props) {
  const [text, setText] = useState('');
  const color = accent === 'cyan' ? '#00F7FF' : '#FA00FF';

  function submit() {
    if (!text.trim()) return;
    onPost(text.trim());
    setText('');
  }

  return (
    <div
      className={`border-b px-4 py-4 ${light ? 'border-neutral-200' : 'border-neutral-900'}`}
      style={light ? { background: '#FFFFFF' } : undefined}
    >
      <div className="flex gap-3">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-semibold text-black"
          style={{ background: 'linear-gradient(135deg,#00F7FF,#FA00FF)' }}
        >
          {identity.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={placeholder}
            rows={2}
            className={`w-full resize-none bg-transparent text-lg outline-none ${
              light ? 'text-black placeholder:text-neutral-500' : 'placeholder:text-neutral-600'
            }`}
          />
          <div className="mt-2 flex justify-end">
            <button
              onClick={submit}
              disabled={!text.trim()}
              className="rounded-full px-5 py-2 text-sm font-semibold text-black transition disabled:cursor-not-allowed disabled:opacity-40"
              style={{ background: color }}
            >
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
