import { useState } from "react";
import { Heart, MessageCircle, Share2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";

export default function InstagramFeed() {
  const { user } = useAuth();
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [postImage, setPostImage] = useState("");
  const [expandedComments, setExpandedComments] = useState<Set<number>>(new Set());
  const [newComments, setNewComments] = useState<Record<number, string>>({});

  // Fetch posts
  const { data: posts, isLoading, refetch } = trpc.posts.list.useQuery({
    limit: 20,
    offset: 0,
  });

  // Create post mutation
  const createPostMutation = trpc.posts.create.useMutation({
    onSuccess: () => {
      toast.success("Post created!");
      setPostTitle("");
      setPostContent("");
      setPostImage("");
      setShowCreatePost(false);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create post");
    },
  });

  // Like mutations
  const likeMutation = trpc.posts.like.useMutation({
    onSuccess: () => {
      refetch();
    },
    onError: () => {
      toast.error("Failed to like post");
    },
  });

  const unlikeMutation = trpc.posts.unlike.useMutation({
    onSuccess: () => {
      refetch();
    },
    onError: () => {
      toast.error("Failed to unlike post");
    },
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

  // Fetch likes for a post
  const { data: likesData } = trpc.posts.getLikes.useQuery(posts?.[0]?.id || 0);

  // Fetch comments for a post
  const { data: commentsData } = trpc.posts.getComments.useQuery(posts?.[0]?.id || 0);

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-[#00F7FF]" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-8">
      {/* Create Post Section */}
      {user && (
        <Card className="prophet-card p-6">
          {!showCreatePost ? (
            <Button
              onClick={() => setShowCreatePost(true)}
              className="w-full bg-gradient-to-r from-[#00F7FF] to-[#FA00FF] text-black font-semibold hover:shadow-lg hover:shadow-[#00F7FF]/50"
            >
              Share Your Prophetic Message
            </Button>
          ) : (
            <div className="space-y-4">
              <Input
                placeholder="Post Title"
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
                className="bg-black/50 border-[#00F7FF]/30 text-white placeholder-gray-500"
              />
              <Textarea
                placeholder="What's on your heart? Share your prophetic message..."
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                className="bg-black/50 border-[#00F7FF]/30 text-white placeholder-gray-500 min-h-[120px]"
              />
              <Input
                placeholder="Image URL (optional)"
                value={postImage}
                onChange={(e) => setPostImage(e.target.value)}
                className="bg-black/50 border-[#00F7FF]/30 text-white placeholder-gray-500"
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleCreatePost}
                  disabled={createPostMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-[#00F7FF] to-[#FA00FF] text-black font-semibold hover:shadow-lg hover:shadow-[#FA00FF]/50"
                >
                  {createPostMutation.isPending ? (
                    <Loader2 className="animate-spin mr-2" size={16} />
                  ) : null}
                  Post
                </Button>
                <Button
                  onClick={() => {
                    setShowCreatePost(false);
                    setPostTitle("");
                    setPostContent("");
                    setPostImage("");
                  }}
                  variant="outline"
                  className="flex-1 border-[#FA00FF]/30 text-[#FA00FF]"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Posts Feed */}
      <div className="space-y-6">
        {posts && posts.length > 0 ? (
          posts.map((post: any) => (
            <Card key={post.id} className="prophet-card overflow-hidden">
              {/* Post Header */}
              <div className="p-4 border-b border-[#00F7FF]/10">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-white">{post.title}</h3>
                    <p className="text-xs text-gray-400">
                      {post.publishedAt ? formatDistanceToNow(new Date(post.publishedAt), { addSuffix: true }) : "Just now"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Post Image */}
              {post.featuredImage && (
                <div className="w-full h-96 bg-black/50 overflow-hidden">
                  <img
                    src={post.featuredImage}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Post Content */}
              <div className="p-4">
                <p className="text-gray-300 whitespace-pre-wrap">{post.content}</p>
              </div>

              {/* Like/Comment Actions */}
              <div className="px-4 py-3 border-t border-[#00F7FF]/10 flex gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2 text-gray-400 hover:text-[#FA00FF]"
                  onClick={() => handleLike(post.id, false)}
                >
                  <Heart size={20} className="text-[#FA00FF]" fill="#FA00FF" />
                  <span className="text-sm">{likesData?.count || 0}</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2 text-gray-400 hover:text-[#00F7FF]"
                  onClick={() => toggleComments(post.id)}
                >
                  <MessageCircle size={20} />
                  <span className="text-sm">{commentsData?.length || 0}</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2 text-gray-400 hover:text-[#00F7FF]"
                >
                  <Share2 size={20} />
                </Button>
              </div>

              {/* Comments Section */}
              {expandedComments.has(post.id) && (
                <div className="px-4 py-4 border-t border-[#00F7FF]/10 space-y-4">
                  {/* Comments List */}
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {commentsData && commentsData.length > 0 ? (
                      commentsData.map((comment: any) => (
                        <div key={comment.id} className="bg-black/30 p-3 rounded-lg">
                          <p className="text-sm font-semibold text-[#00F7FF]">User #{comment.userId}</p>
                          <p className="text-sm text-gray-300 mt-1">{comment.content}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-400">No comments yet</p>
                    )}
                  </div>

                  {/* Add Comment */}
                  {user && (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a comment..."
                        value={newComments[post.id] || ""}
                        onChange={(e) =>
                          setNewComments({ ...newComments, [post.id]: e.target.value })
                        }
                        className="bg-black/50 border-[#00F7FF]/30 text-white placeholder-gray-500 text-sm"
                      />
                      <Button
                        size="sm"
                        onClick={() => handleAddComment(post.id)}
                        disabled={addCommentMutation.isPending}
                        className="bg-[#FA00FF] text-black hover:bg-[#FA00FF]/80"
                      >
                        {addCommentMutation.isPending ? (
                          <Loader2 className="animate-spin" size={16} />
                        ) : (
                          "Post"
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))
        ) : (
          <Card className="prophet-card p-8 text-center">
            <p className="text-gray-400">No prophetic messages yet. Be the first to share!</p>
          </Card>
        )}
      </div>
    </div>
  );
}
