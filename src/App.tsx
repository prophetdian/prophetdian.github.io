import { useEffect, useRef, useState } from 'react';
import type { Feed, Identity, Post, View } from './types';
import { supabase } from './lib/supabase';
import {
  buildIdentity,
  createPost,
  deletePost,
  fetchPosts,
  saveProfile,
  signInWithPassword,
  signUpWithPassword,
  setLike,
  signOut,
  type PostMedia,
} from './lib/api';
import OnboardingModal from './components/OnboardingModal';
import Sidebar from './components/Sidebar';
import MobileNav from './components/MobileNav';
import PropheticFeed from './components/PropheticFeed';
import NaviSociety from './components/NaviSociety';
import Profile from './components/Profile';
import UserProfile from './components/UserProfile';
import Badges from './components/Badges';
import Dms from './components/Dms';

type AuthStatus = 'loading' | 'signedout' | 'ready';

export default function App() {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [activeFeed, setActiveFeed] = useState<View>('prophetic');
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Switching feeds always closes any open user profile.
  function navigate(view: View) {
    setViewingId(null);
    setActiveFeed(view);
  }

  // Tapping a post's author opens their public profile; tapping your own
  // routes to your editable profile instead.
  function openProfile(authorId: string) {
    if (identity && authorId === identity.id) {
      setViewingId(null);
      setActiveFeed('profile');
    } else {
      setViewingId(authorId);
    }
  }

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

  // Re-derive isNaviMember/badges from pd_subscriptions after a PayPal activation.
  function refreshIdentity() {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) buildIdentity(session.user).then(setIdentity).catch(() => {});
    });
  }

  if (status === 'loading') {
    return <div className="h-screen" />;
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

  async function addPost(feed: Feed, text: string, media?: PostMedia | null) {
    if (!identity) return;
    try {
      const post = await createPost(identity, feed, text, media);
      setPosts((prev) => [post, ...prev]);
    } catch {
      // Post rejected (offline or not permitted) — leave the feed as is
    }
  }

  function removePost(id: string) {
    if (!identity) return;
    const target = posts.find((p) => p.id === id);
    if (!target || target.authorId !== identity.id) return;
    setPosts((prev) => prev.filter((p) => p.id !== id));
    deletePost(id, identity.id).catch(() => {
      // Restore on failure
      setPosts((prev) => [target, ...prev]);
    });
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
  const myPosts = posts
    .filter((p) => p.authorId === identity.id)
    .sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div className="mx-auto flex h-screen max-w-5xl">
      <Sidebar
        active={activeFeed}
        onNavigate={navigate}
        identity={identity}
        onSignOut={() => {
          signOut().catch(() => {});
        }}
      />
      <main
        className="flex flex-1 flex-col overflow-y-auto pb-16 md:pb-0"
        style={
          viewingId || activeFeed === 'profile'
            ? { background: '#00F7FF' }
            : activeFeed === 'dms'
              ? { background: '#FFFFFF' }
              : undefined
        }
      >
        {viewingId ? (
          <UserProfile
            userId={viewingId}
            posts={posts}
            onBack={() => setViewingId(null)}
            onLike={toggleLike}
          />
        ) : (
          <>
            {activeFeed === 'prophetic' && (
              <PropheticFeed
                identity={identity}
                posts={propheticPosts}
                onPost={(text, media) => addPost('prophetic', text, media)}
                onLike={toggleLike}
                onOpenBadges={() => navigate('badges')}
                onOpenProfile={openProfile}
              />
            )}
            {activeFeed === 'navi' && (
              <NaviSociety
                identity={identity}
                posts={naviPosts}
                onPost={(text, media) => addPost('navi', text, media)}
                onLike={toggleLike}
                onOpenProfile={openProfile}
                onJoined={refreshIdentity}
              />
            )}
            {activeFeed === 'profile' && (
              <Profile
                identity={identity}
                posts={myPosts}
                onUpdate={updateProfile}
                onSignOut={() => {
                  signOut().catch(() => {});
                }}
                onOpenBadges={() => navigate('badges')}
                onLike={toggleLike}
                onDelete={removePost}
              />
            )}
            {activeFeed === 'badges' && <Badges identity={identity} onPurchased={refreshIdentity} />}
            {activeFeed === 'dms' && <Dms />}
          </>
        )}
      </main>
      <MobileNav active={activeFeed} onNavigate={navigate} />
    </div>
  );
}
