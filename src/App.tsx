import { useState } from 'react';
import type { Feed, Post } from './types';
import { clearIdentity, loadIdentity, loadPosts, saveIdentity, savePosts } from './lib/storage';
import OnboardingModal from './components/OnboardingModal';
import Sidebar from './components/Sidebar';
import MobileNav from './components/MobileNav';
import PropheticFeed from './components/PropheticFeed';
import NaviSociety from './components/NaviSociety';

export default function App() {
  const [identity, setIdentity] = useState(loadIdentity());
  const [activeFeed, setActiveFeed] = useState<Feed>('prophetic');
  const [posts, setPosts] = useState<Post[]>(loadPosts());

  if (!identity) {
    return (
      <OnboardingModal
        onSubmit={(name) => {
          setIdentity(saveIdentity(name));
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
        {activeFeed === 'prophetic' ? (
          <PropheticFeed
            identity={identity}
            posts={propheticPosts}
            onPost={(text) => addPost('prophetic', text)}
            onLike={toggleLike}
          />
        ) : (
          <NaviSociety
            identity={identity}
            posts={naviPosts}
            onPost={(text) => addPost('navi', text)}
            onLike={toggleLike}
          />
        )}
      </main>
      <MobileNav active={activeFeed} onNavigate={setActiveFeed} />
    </div>
  );
}
