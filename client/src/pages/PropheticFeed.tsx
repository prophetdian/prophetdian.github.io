import { useState, useRef } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Heart, MessageCircle, Share2, Trash2, Image as ImageIcon, Video, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function PropheticFeed() {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const [postContent, setPostContent] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const [expandedComments, setExpandedComments] = useState<number[]>([]);

  // Queries and mutations
  const feedQuery = trpc.feed.list.useQuery({ limit: 50, offset: 0 });
  const createPostMutation = trpc.feed.create.useMutation();
  const deletePostMutation = trpc.feed.delete.useMutation();
  const likePostMutation = trpc.feed.like.useMutation();
  const unlikePostMutation = trpc.feed.unlike.useMutation();
  const addCommentMutation = trpc.feed.addComment.useMutation();
  const deleteCommentMutation = trpc.feed.deleteComment.useMutation();

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "Image must be less than 10MB",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "Video must be less than 100MB",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedVideo(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreatePost = async () => {
    if (!postContent.trim() && !selectedImage && !selectedVideo) {
      toast({
        title: "Error",
        description: "Post content or media is required",
        variant: "destructive",
      });
      return;
    }

    setIsPosting(true);
    try {
      await createPostMutation.mutateAsync({
        content: postContent,
        title: postContent.substring(0, 100) || "New Post",
        featuredImage: selectedImage || selectedVideo || undefined,
      });

      setPostContent("");
      setSelectedImage(null);
      setSelectedVideo(null);
      toast({
        title: "Success",
        description: "Post created successfully",
      });

      // Refetch feed
      feedQuery.refetch();
    } catch (error) {
      console.error("Error creating post:", error);
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive",
      });
    } finally {
      setIsPosting(false);
    }
  };

  const handleDeletePost = async (postId: number) => {
    try {
      await deletePostMutation.mutateAsync({ postId });
      toast({
        title: "Success",
        description: "Post deleted successfully",
      });
      feedQuery.refetch();
    } catch (error) {
      console.error("Error deleting post:", error);
      toast({
        title: "Error",
        description: "Failed to delete post",
        variant: "destructive",
      });
    }
  };

  const handleLikePost = async (postId: number) => {
    try {
      await likePostMutation.mutateAsync({ postId });
      feedQuery.refetch();
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleUnlikePost = async (postId: number) => {
    try {
      await unlikePostMutation.mutateAsync({ postId });
      feedQuery.refetch();
    } catch (error) {
      console.error("Error unliking post:", error);
    }
  };

  const toggleComments = (postId: number) => {
    setExpandedComments((prev) =>
      prev.includes(postId) ? prev.filter((id) => id !== postId) : [...prev, postId]
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Please log in to view the prophetic feed</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-8 pb-20">
      <div className="container max-w-2xl mx-auto px-4">
        {/* Create Post Section */}
        <Card className="bg-gradient-to-br from-[#FA00FF]/10 to-[#00F7FF]/10 border-2 border-[#FA00FF]/30 p-6 mb-8">
          <div className="flex gap-4">
            {user.profilePicture && (
              <img
                src={user.profilePicture}
                alt={user.name}
                className="w-12 h-12 rounded-full object-cover"
              />
            )}
            <div className="flex-1">
              <Textarea
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                placeholder="Share your prophetic insight..."
                className="bg-black/50 border-2 border-[#00F7FF]/30 text-white placeholder-gray-600 focus:border-[#00F7FF] mb-4 resize-none"
                rows={3}
              />

              {/* Media Preview */}
              {(selectedImage || selectedVideo) && (
                <div className="mb-4 relative">
                  {selectedImage && (
                    <div className="relative inline-block">
                      <img
                        src={selectedImage}
                        alt="Preview"
                        className="max-h-48 rounded-lg"
                      />
                      <button
                        onClick={() => setSelectedImage(null)}
                        className="absolute top-2 right-2 bg-red-500 rounded-full p-1 hover:bg-red-600"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                  {selectedVideo && (
                    <div className="relative inline-block">
                      <video
                        src={selectedVideo}
                        className="max-h-48 rounded-lg"
                        controls
                      />
                      <button
                        onClick={() => setSelectedVideo(null)}
                        className="absolute top-2 right-2 bg-red-500 rounded-full p-1 hover:bg-red-600"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Media Upload Buttons */}
              <div className="flex gap-2 mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="gap-2"
                >
                  <ImageIcon size={16} />
                  Photo
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => videoInputRef.current?.click()}
                  className="gap-2"
                >
                  <Video size={16} />
                  Video
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleVideoSelect}
                  className="hidden"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setPostContent("");
                    setSelectedImage(null);
                    setSelectedVideo(null);
                  }}
                  disabled={isPosting}
                >
                  Clear
                </Button>
                <Button
                  onClick={handleCreatePost}
                  disabled={isPosting || (!postContent.trim() && !selectedImage && !selectedVideo)}
                  className="bg-gradient-to-r from-[#00F7FF] to-[#FA00FF] text-black hover:shadow-lg"
                >
                  {isPosting ? "Posting..." : "Post"}
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Feed Posts */}
        <div className="space-y-6">
          {feedQuery.data && feedQuery.data.length > 0 ? (
            feedQuery.data.map((post) => (
              <Card
                key={post.id}
                className="bg-gradient-to-br from-[#FA00FF]/10 to-[#00F7FF]/10 border-2 border-[#FA00FF]/30 p-6"
              >
                {/* Post Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {post.author?.profilePicture && (
                      <img
                        src={post.author.profilePicture}
                        alt={post.author.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    )}
                    <div>
                      <p className="font-semibold text-[#00F7FF]">{post.author?.name || "Anonymous"}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(post.publishedAt || post.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {user.id === post.authorId && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeletePost(post.id)}
                      className="text-red-500 hover:bg-red-500/10"
                    >
                      <Trash2 size={16} />
                    </Button>
                  )}
                </div>

                {/* Post Content */}
                <p className="text-gray-200 mb-4">{post.content}</p>

                {post.featuredImage && (
                  <div className="mb-4">
                    {post.featuredImage.startsWith("data:video") ? (
                      <video
                        src={post.featuredImage}
                        className="w-full rounded-lg max-h-96 object-cover"
                        controls
                      />
                    ) : (
                      <img
                        src={post.featuredImage}
                        alt="Post"
                        className="w-full rounded-lg max-h-96 object-cover"
                      />
                    )}
                  </div>
                )}

                {/* Post Actions */}
                <div className="flex gap-4 pt-4 border-t border-[#FA00FF]/20">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-[#FA00FF]"
                    onClick={() => handleLikePost(post.id)}
                  >
                    <Heart size={18} className="mr-2" />
                    Like
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-[#00F7FF]"
                    onClick={() => toggleComments(post.id)}
                  >
                    <MessageCircle size={18} className="mr-2" />
                    Comment
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-[#FA00FF]"
                  >
                    <Share2 size={18} className="mr-2" />
                    Share
                  </Button>
                </div>

                {/* Comments Section */}
                {expandedComments.includes(post.id) && (
                  <div className="mt-4 pt-4 border-t border-[#FA00FF]/20">
                    <div className="space-y-3 mb-4">
                      <p className="text-gray-500 text-sm">Comments feature available</p>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a comment..."
                        className="bg-black/50 border-2 border-[#00F7FF]/30"
                      />
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-[#00F7FF] to-[#FA00FF] text-black"
                      >
                        Reply
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No posts yet. Be the first to share!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PropheticFeed;
