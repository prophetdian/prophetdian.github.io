import { useState, useEffect, useRef, useCallback } from "react";
import { Heart, MessageCircle, Share2, Loader2, Search, X, Bookmark, Flame, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { formatDistanceToNow } from "date-fns";

const EMOJI_REACTIONS = ["🙏", "❤️", "🔥", "😍", "🤔", "😢", "😂", "👍"];
const POSTS_PER_PAGE = 10;

export default function XStyleFeed() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [postImage, setPostImage] = useState("");
  const [postCategory, setPostCategory] = useState("Prophecy");
  const [postHashtags, setPostHashtags] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [offset, setOffset] = useState(0);
  const [allPosts, setAllPosts] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [expandedComments, setExpandedComments] = useState<Set<number>>(new Set());
  const [newComments, setNewComments] = useState<Record<number, string>>({});
  const [showReactions, setShowReactions] = useState<Record<number, boolean>>({});
  const [savedPosts, setSavedPosts] = useState<Set<number>>(new Set());
  const [followedUsers, setFollowedUsers] = useState<Set<number>>(new Set());
  const [trendingHashtags, setTrendingHashtags] = useState<string[]>([]);
  const observerTarget = useRef<HTMLDivElement>(null);

  // Fetch posts with pagination
  const { data: posts, isLoading, refetch } = trpc.posts.list.useQuery({
    limit: POSTS_PER_PAGE,
    offset,
  });

  // Create post mutation
  const createPostMutation = trpc.posts.create.useMutation({
    onSuccess: () => {
      toast.success("Post created!");
      setPostTitle("");
      setPostContent("");
      setPostImage("");
      setPostCategory("Prophecy");
      setPostHashtags("");
      setShowCreatePost(false);
      setOffset(0);
      setAllPosts([]);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create post");
    },
  });

  // Like mutations
  const likeMutation = trpc.posts.like.useMutation({
    onSuccess: () => refetch(),
    onError: () => toast.error("Failed to like post"),
  });

  const unlikeMutation = trpc.posts.unlike.useMutation({
    onSuccess: () => refetch(),
    onError: () => toast.error("Failed to unlike post"),
  });

  // Comment mutations
  const addCommentMutation = trpc.posts.addComment.useMutation({
    onSuccess: () => {
      toast.success("Comment added!");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add comment");
    },
  });

  // Fetch likes and comments
  const { data: likesData } = trpc.posts.getLikes.useQuery(posts?.[0]?.id || 0);
  const { data: commentsData } = trpc.posts.getComments.useQuery(posts?.[0]?.id || 0);

  // Calculate trending hashtags
  useEffect(() => {
    if (allPosts.length > 0) {
      const hashtagMap = new Map<string, number>();
      allPosts.forEach((post) => {
        if (post.hashtags) {
          post.hashtags.split(" ").forEach((tag: string) => {
            hashtagMap.set(tag, (hashtagMap.get(tag) || 0) + 1);
          });
        }
      });
      const trending = Array.from(hashtagMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([tag]) => tag);
      setTrendingHashtags(trending);
    }
  }, [allPosts]);

  // Handle infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore && !isLoading) {
          setIsLoadingMore(true);
          setOffset((prev) => prev + POSTS_PER_PAGE);
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, isLoading]);

  // Update allPosts when new posts are fetched
  useEffect(() => {
    if (posts) {
      if (offset === 0) {
        setAllPosts(posts);
      } else {
        setAllPosts((prev) => [...prev, ...posts]);
        setIsLoadingMore(false);
      }
      setHasMore(posts.length === POSTS_PER_PAGE);
    }
  }, [posts, offset]);

  const handleCreatePost = () => {
    if (!postTitle.trim() || !postContent.trim()) {
      toast.error("Please fill in title and content");
      return;
    }

    createPostMutation.mutate({
      title: postTitle,
      content: postContent,
      featuredImage: postImage,
      status: "published",
    });
  };

  const handleLike = (postId: number, isLiked: boolean) => {
    if (isLiked) {
      unlikeMutation.mutate(postId);
    } else {
      likeMutation.mutate(postId);
    }
  };

  const handleAddComment = (postId: number) => {
    const comment = newComments[postId];
    if (!comment?.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    addCommentMutation.mutate({
      postId,
      content: comment,
    });

    setNewComments({ ...newComments, [postId]: "" });
  };

  const toggleComments = (postId: number) => {
    const newExpanded = new Set(expandedComments);
    if (newExpanded.has(postId)) {
      newExpanded.delete(postId);
    } else {
      newExpanded.add(postId);
    }
    setExpandedComments(newExpanded);
  };

  const handleShare = (post: any) => {
    const shareText = `Check out this prophetic message: "${post.title}" - ${window.location.origin}`;
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: shareText,
      });
    } else {
      navigator.clipboard.writeText(shareText);
      toast.success("Link copied to clipboard!");
    }
  };

  const handleUserClick = (userId: number) => {
    navigate(`/user/${userId}`);
  };

  const toggleSavePost = (postId: number) => {
    const newSaved = new Set(savedPosts);
    if (newSaved.has(postId)) {
      newSaved.delete(postId);
      toast.success("Post removed from bookmarks");
    } else {
      newSaved.add(postId);
      toast.success("Post saved to bookmarks");
    }
    setSavedPosts(newSaved);
  };

  const toggleFollow = (userId: number) => {
    const newFollowed = new Set(followedUsers);
    if (newFollowed.has(userId)) {
      newFollowed.delete(userId);
      toast.success("Unfollowed");
    } else {
      newFollowed.add(userId);
      toast.success("Following!");
    }
    setFollowedUsers(newFollowed);
  };

  // Filter posts based on search query
  const filteredPosts = allPosts.filter((post) => {
    const query = searchQuery.toLowerCase();
    return (
      post.title.toLowerCase().includes(query) ||
      post.content.toLowerCase().includes(query) ||
      post.excerpt?.toLowerCase().includes(query)
    );
  });

  const displayPosts = searchQuery ? filteredPosts : allPosts;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 py-8">
      {/* Main Feed */}
      <div className="lg:col-span-2 space-y-0">
        {/* Search Bar */}
        <div className="sticky top-0 z-40 bg-black/80 backdrop-blur border-b border-[#00F7FF]/10 p-4">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 text-[#00F7FF]" size={18} />
              <Input
                placeholder="Search prophetic messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-black/50 border-[#00F7FF]/30 text-white placeholder-gray-500 rounded-full"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-3 text-gray-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Create Post Section */}
        {user && (
          <div className="border-b border-[#00F7FF]/10 p-4 hover:bg-black/30 transition">
            {!showCreatePost ? (
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-[#00F7FF] to-[#FA00FF] rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-black">U</span>
                </div>
                <button
                  onClick={() => setShowCreatePost(true)}
                  className="flex-1 text-left text-gray-500 hover:text-gray-400 rounded-full border border-[#00F7FF]/20 px-4 py-3 hover:bg-black/50 transition"
                >
                  What's happening?
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#00F7FF] to-[#FA00FF] rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-black">U</span>
                  </div>
                  <div className="flex-1 space-y-4">
                    <Input
                      placeholder="Post Title"
                      value={postTitle}
                      onChange={(e) => setPostTitle(e.target.value)}
                      className="bg-transparent border-0 text-2xl font-bold text-white placeholder-gray-600 focus:outline-none"
                    />
                    <Textarea
                      placeholder="What's on your heart?"
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                      className="bg-transparent border-0 text-xl text-white placeholder-gray-600 focus:outline-none min-h-[100px] resize-none"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={postCategory}
                        onChange={(e) => setPostCategory(e.target.value)}
                        className="bg-black/50 border border-[#00F7FF]/30 text-white rounded px-3 py-2 text-sm"
                      >
                        <option>Prophecy</option>
                        <option>Testimony</option>
                        <option>Prayer</option>
                        <option>Teaching</option>
                        <option>Announcement</option>
                      </select>
                      <Input
                        placeholder="Hashtags"
                        value={postHashtags}
                        onChange={(e) => setPostHashtags(e.target.value)}
                        className="bg-black/50 border-[#00F7FF]/30 text-white placeholder-gray-600 text-sm"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Input
                        type="file"
                        accept="image/*,video/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              setPostImage(event.target?.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="bg-black/50 border-[#00F7FF]/30 text-white placeholder-gray-600 text-sm flex-1"
                      />
                      {postImage && (
                        <Button
                          onClick={() => setPostImage("")}
                          variant="outline"
                          className="border-[#FA00FF]/30 text-[#FA00FF] text-sm"
                        >
                          Clear
                        </Button>
                      )}
                    </div>
                    {postImage && (
                      <div className="relative">
                        <img src={postImage} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                      </div>
                    )}
                    <div className="flex gap-2 justify-end">
                      <Button
                        onClick={() => {
                          setShowCreatePost(false);
                          setPostTitle("");
                          setPostContent("");
                          setPostImage("");
                          setPostCategory("Prophecy");
                          setPostHashtags("");
                        }}
                        variant="outline"
                        className="border-[#FA00FF]/30 text-[#FA00FF]"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleCreatePost}
                        disabled={createPostMutation.isPending}
                        className="bg-gradient-to-r from-[#00F7FF] to-[#FA00FF] text-black font-bold px-8 rounded-full hover:shadow-lg hover:shadow-[#FA00FF]/50"
                      >
                        {createPostMutation.isPending ? (
                          <Loader2 className="animate-spin mr-2" size={16} />
                        ) : null}
                        Post
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Posts Feed */}
        <div>
          {displayPosts && displayPosts.length > 0 ? (
            <>
              {displayPosts.map((post: any) => (
                <div key={post.id} className="border-b border-[#00F7FF]/10 p-4 hover:bg-black/30 transition cursor-pointer group">
                  {/* Post Header */}
                  <div className="flex gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-[#00F7FF] to-[#FA00FF] rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-black">U</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          onClick={() => handleUserClick(post.authorId)}
                          className="font-bold text-white hover:underline"
                        >
                          {post.authorName || `User #${post.authorId}`}
                        </button>
                        <span className="text-gray-500">@{post.authorUsername || `user${post.authorId}`}</span>
                        <span className="text-gray-500">·</span>
                        <span className="text-gray-500 text-sm">
                          {post.publishedAt ? formatDistanceToNow(new Date(post.publishedAt), { addSuffix: true }) : "now"}
                        </span>
                      </div>

                      {/* Post Content */}
                      <h3 className="text-xl font-bold text-white mt-2 mb-1">{post.title}</h3>
                      <p className="text-gray-300 text-base mb-3">{post.content}</p>

                      {/* Hashtags */}
                      {post.hashtags && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {post.hashtags.split(" ").map((tag: string, i: number) => (
                            <span key={i} className="text-[#00F7FF] text-sm hover:underline">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Post Image */}
                      {post.featuredImage && (
                        <div className="rounded-2xl overflow-hidden mb-3 bg-black/50 max-h-96">
                          <img
                            src={post.featuredImage}
                            alt={post.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      {/* Category Badge */}
                      <div className="mb-3">
                        <span className="text-xs bg-[#FA00FF]/20 text-[#FA00FF] px-3 py-1 rounded-full">
                          {post.category || "Prophecy"}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex justify-between text-gray-500 max-w-md text-sm mt-3 group-hover:text-[#00F7FF]">
                        <button className="flex items-center gap-2 hover:text-[#00F7FF] hover:bg-[#00F7FF]/10 px-3 py-2 rounded-full transition">
                          <MessageCircle size={16} />
                          <span>{commentsData?.length || 0}</span>
                        </button>
                        <button className="flex items-center gap-2 hover:text-[#FA00FF] hover:bg-[#FA00FF]/10 px-3 py-2 rounded-full transition">
                          <Heart size={16} fill="currentColor" />
                          <span>{likesData?.count || 0}</span>
                        </button>
                        <button
                          onClick={() => toggleSavePost(post.id)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-full transition ${
                            savedPosts.has(post.id)
                              ? "text-[#00F7FF] bg-[#00F7FF]/10"
                              : "hover:text-[#00F7FF] hover:bg-[#00F7FF]/10"
                          }`}
                        >
                          <Bookmark size={16} fill={savedPosts.has(post.id) ? "currentColor" : "none"} />
                        </button>
                        <button onClick={() => handleShare(post)} className="flex items-center gap-2 hover:text-[#00F7FF] hover:bg-[#00F7FF]/10 px-3 py-2 rounded-full transition">
                          <Share2 size={16} />
                        </button>
                      </div>

                      {/* Comments Section */}
                      {expandedComments.has(post.id) && (
                        <div className="mt-4 pt-4 border-t border-[#00F7FF]/10 space-y-4">
                          {commentsData && commentsData.length > 0 ? (
                            commentsData.map((comment: any) => (
                              <div key={comment.id} className="flex gap-3">
                                <div className="w-8 h-8 bg-gradient-to-r from-[#00F7FF] to-[#FA00FF] rounded-full flex items-center justify-center flex-shrink-0">
                                  <span className="text-xs font-bold text-black">U</span>
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-[#00F7FF]">User #{comment.userId}</p>
                                  <p className="text-sm text-gray-300">{comment.content}</p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                  </p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-gray-500">No comments yet</p>
                          )}

                          {user && (
                            <div className="flex gap-2 mt-3">
                              <Input
                                placeholder="Post your reply..."
                                value={newComments[post.id] || ""}
                                onChange={(e) =>
                                  setNewComments({ ...newComments, [post.id]: e.target.value })
                                }
                                className="bg-black/50 border-[#00F7FF]/30 text-white placeholder-gray-600 text-sm rounded-full"
                              />
                              <Button
                                size="sm"
                                onClick={() => handleAddComment(post.id)}
                                disabled={addCommentMutation.isPending}
                                className="bg-[#FA00FF] text-black hover:bg-[#FA00FF]/80 rounded-full"
                              >
                                Reply
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {/* Infinite scroll observer target */}
              <div ref={observerTarget} className="flex justify-center py-8">
                {isLoadingMore && (
                  <Loader2 className="animate-spin text-[#00F7FF]" size={32} />
                )}
                {!hasMore && displayPosts.length > 0 && (
                  <p className="text-gray-500">No more posts to load</p>
                )}
              </div>
            </>
          ) : isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-[#00F7FF]" size={32} />
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              {searchQuery ? "No posts match your search" : "No prophetic messages yet"}
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar - Trending */}
      <div className="hidden lg:block space-y-4">
        {/* Trending Section */}
        <div className="bg-black/30 border border-[#00F7FF]/10 rounded-2xl p-4 sticky top-20">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={20} className="text-[#FA00FF]" />
            <h3 className="text-xl font-bold text-white">Trending</h3>
          </div>
          <div className="space-y-3">
            {trendingHashtags.length > 0 ? (
              trendingHashtags.map((tag, i) => (
                <button
                  key={i}
                  onClick={() => setSearchQuery(tag)}
                  className="w-full text-left p-3 hover:bg-black/50 rounded-lg transition group"
                >
                  <p className="text-[#00F7FF] font-semibold group-hover:text-[#FA00FF]">{tag}</p>
                  <p className="text-xs text-gray-500">Trending Prophetic</p>
                </button>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No trending hashtags yet</p>
            )}
          </div>
        </div>

        {/* What's Happening */}
        <div className="bg-black/30 border border-[#00F7FF]/10 rounded-2xl p-4">
          <h3 className="text-xl font-bold text-white mb-4">What's Happening</h3>
          <div className="space-y-3">
            <div className="p-3 hover:bg-black/50 rounded-lg transition cursor-pointer">
              <p className="text-xs text-gray-500">Prophetic Category</p>
              <p className="font-bold text-white">Prophecy</p>
              <p className="text-xs text-gray-500">1.2K posts</p>
            </div>
            <div className="p-3 hover:bg-black/50 rounded-lg transition cursor-pointer">
              <p className="text-xs text-gray-500">Prophetic Category</p>
              <p className="font-bold text-white">Testimony</p>
              <p className="text-xs text-gray-500">856 posts</p>
            </div>
            <div className="p-3 hover:bg-black/50 rounded-lg transition cursor-pointer">
              <p className="text-xs text-gray-500">Prophetic Category</p>
              <p className="font-bold text-white">Prayer</p>
              <p className="text-xs text-gray-500">634 posts</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
