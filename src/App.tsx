import { useState } from 'react';
import type { Feed, Identity, Post, View } from './types';
import {
  clearIdentity,
  loadIdentity,
  loadPosts,
  saveIdentity,
  savePosts,
  updateIdentity,
} from './lib/storage';
import OnboardingModal from './components/OnboardingModal';
import Sidebar from './components/Sidebar';
import MobileNav from './components/MobileNav';
import PropheticFeed from './components/PropheticFeed';
import NaviSociety from './components/NaviSociety';
import Profile from './components/Profile';
import Badges from './components/Badges';

export default function App() {
  const [identity, setIdentity] = useState(loadIdentity());
  const [activeFeed, setActiveFeed] = useState<View>('prophetic');
  const [posts, setPosts] = useState<Post[]>(loadPosts());

  if (!identity) {
    return (
      <OnboardingModal
        onSubmit={(name, email) => {
          setIdentity(saveIdentity(name, email));
        }}
      />
    );
  }

  function addPost(feed: Feed, text: string) {
    if (!identity) return;
    const newPost: Post = {
      id: crypto.randomUUID(),
      feed,
      authorName: identity.name,
      authorIsAdmin: identity.isAdmin,
      authorBadges: identity.badges,
      text,
      createdAt: Date.now(),
      likes: 0,
      likedByMe: false,
    };
    const next = [newPost, ...posts];
    setPosts(next);
    savePosts(next);
  }

  function toggleLike(id: string) {
    const next = posts.map((p) =>
      p.id === id
        ? { ...p, likedByMe: !p.likedByMe, likes: p.likes + (p.likedByMe ? -1 : 1) }
        : p,
    );
    setPosts(next);
    savePosts(next);
  }

  function updateProfile(changes: Partial<Pick<Identity, 'email' | 'bio' | 'avatar'>>) {
    if (!identity) return;
    setIdentity(updateIdentity(identity, changes));
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
          clearIdentity();
          setIdentity(null);
        }}
      />
      <main className="flex flex-1 flex-col overflow-y-auto pb-16 md:pb-0">
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
        {activeFeed === 'profile' && <Profile identity={identity} onUpdate={updateProfile} />}
        {activeFeed === 'badges' && <Badges identity={identity} />}
      </main>
      <MobileNav active={activeFeed} onNavigate={setActiveFeed} />
    </div>
  );
}
