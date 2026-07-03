import { useEffect, useRef, useState } from 'react';
import type { Feed, Identity, Post, View } from './types';
import { supabase } from './lib/supabase';
import {
  buildIdentity,
  createPost,
  fetchPosts,
  saveProfile,
  signInWithPassword,
  signUpWithPassword,
  setLike,
  signOut,
} from './lib/api';
import OnboardingModal from './components/OnboardingModal';
import Sidebar from './components/Sidebar';
import MobileNav from './components/MobileNav';
import PropheticFeed from './components/PropheticFeed';
import NaviSociety from './components/NaviSociety';
import Profile from './components/Profile';
import Badges from './components/Badges';

type AuthStatus = 'loading' | 'signedout' | 'ready';

export default function App() {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [activeFeed, setActiveFeed] = useState<View>('prophetic');
  const [posts, setPosts] = useState<Post[]>([]);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      // Defer Supabase calls out of the auth callback to avoid the client lock
      setTimeout(() => {
        if (session?.user) {
          buildIdentity(session.user)
            .then((id) => {
              setIdentity(id);
              setStatus('ready');
            })
            .catch(() => setStatus('signedout'));
        } else {
          setIdentity(null);
          setStatus('signedout');
        }
      }, 0);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!identity) {
      setPosts([]);
      return;
    }
    fetchPosts(identity.id)
      .then(setPosts)
      .catch(() => {});
  }, [identity?.id]);

  if (status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-2xl font-bold text-gradient">Prophet Dian</div>
      </div>
    );
  }

  if (status === 'signedout' || !identity) {
    return (
      <OnboardingModal
        onSignIn={async (email, password) => {
          await signInWithPassword(email, password);
        }}
        onSignUp={async (name, email, password) => {
          await signUpWithPassword(name, email, password);
        }}
      />
    );
  }

  async function addPost(feed: Feed, text: string) {
    if (!identity) return;
    try {
      const post = await createPost(identity, feed, text);
      setPosts((prev) => [post, ...prev]);
    } catch {
      // Post rejected (offline or not permitted) — leave the feed as is
    }
  }

  function toggleLike(id: string) {
    if (!identity) return;
    const target = posts.find((p) => p.id === id);
    if (!target) return;
    const liked = !target.likedByMe;
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, likedByMe: liked, likes: p.likes + (liked ? 1 : -1) } : p,
      ),
    );
    setLike(id, identity.id, liked).catch(() => {});
  }

  function updateProfile(changes: Partial<Pick<Identity, 'name' | 'bio' | 'avatar'>>) {
    if (!identity) return;
    const next = { ...identity, ...changes };
    setIdentity(next);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveProfile(next.id, { name: next.name, bio: next.bio, avatar: next.avatar }).catch(() => {});
    }, 600);
  }

  const propheticPosts = posts
    .filter((p) => p.feed === 'prophetic')
    .sort((a, b) => b.createdAt - a.createdAt);
  const naviPosts = posts
    .filter((p) => p.feed === 'navi')
    .sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div className="mx-auto flex h-screen max-w-5xl">
      <Sidebar
        active={activeFeed}
        onNavigate={setActiveFeed}
        identity={identity}
        onSignOut={() => {
          signOut().catch(() => {});
        }}
      />
      <main
        className="flex flex-1 flex-col overflow-y-auto pb-16 md:pb-0"
        style={activeFeed === 'profile' ? { background: '#00F7FF' } : undefined}
      >
        {activeFeed === 'prophetic' && (
          <PropheticFeed
            identity={identity}
            posts={propheticPosts}
            onPost={(text) => addPost('prophetic', text)}
            onLike={toggleLike}
          />
        )}
        {activeFeed === 'navi' && (
          <NaviSociety
            identity={identity}
            posts={naviPosts}
            onPost={(text) => addPost('navi', text)}
            onLike={toggleLike}
          />
        )}
        {activeFeed === 'profile' && (
          <Profile
            identity={identity}
            onUpdate={updateProfile}
            onSignOut={() => {
              signOut().catch(() => {});
            }}
          />
        )}
        {activeFeed === 'badges' && <Badges identity={identity} />}
      </main>
      <MobileNav active={activeFeed} onNavigate={setActiveFeed} />
    </div>
  );
}
