import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Loader2, Heart, MessageCircle, Share, Upload, X, Eye } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";

export default function NaviSocietyFeed() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Check if user is authorized to post (Dian or designated pastors)
  const isAuthorizedToPost = user?.email === "prophetdian@gmail.com" || user?.hasPastorBadge;

  // Get subscription status
  const { data: subscription, isLoading: subscriptionLoading } = trpc.naviSociety.getSubscription.useQuery();

  // Get Navi posts
  const { data: naviPosts, isLoading: postsLoading, refetch: refetchPosts } = trpc.naviSociety.getPosts.useQuery(undefined, {
    enabled: subscription?.status === "active",
  });

  // Create post mutation
  const createPostMutation = trpc.naviSociety.createPost.useMutation({
    onSuccess: () => {
      toast.success("Post published to Navi Society!");
      setTitle("");
      setContent("");
      setImageUrl("");
      setPreviewUrl("");
      setShowCreateForm(false);
      refetchPosts();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create post");
    },
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        toast.error("Image must be less than 50MB");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setImageUrl(result);
        setPreviewUrl(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreatePost = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error("Title and content are required");
      return;
    }

    setIsCreating(true);
    createPostMutation.mutate({
      title,
      content,
      excerpt: content.substring(0, 100),
      featuredImage: imageUrl,
    });
    setIsCreating(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Please log in to access Navi Society</p>
          <Button
            onClick={() => setLocation("/")}
            className="bg-[#00F7FF] text-black hover:shadow-lg hover:shadow-[#00F7FF]/50"
          >
            Go to Home
          </Button>
        </div>
      </div>
    );
  }

  if (subscriptionLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Loader2 className="animate-spin text-[#00F7FF]" size={32} />
      </div>
    );
  }

  const isSubscribed = subscription?.status === "active";

  if (!isSubscribed) {
    return (
      <div className="min-h-screen bg-black text-white pt-8 md:pt-0 md:ml-24">
        <div className="container py-12 text-center">
          <Eye className="mx-auto mb-4 text-[#FA00FF]" size={48} />
          <h1 className="text-3xl font-bold mb-4 text-[#00F7FF]">Navi Society</h1>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            You need an active subscription to access Navi Society. Subscribe now to view exclusive prophetic content.
          </p>
          <Button
            onClick={() => setLocation("/navi-society")}
            className="bg-[#FA00FF] text-black hover:shadow-lg hover:shadow-[#FA00FF]/50 px-8 py-3"
          >
            Subscribe Now
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-20 pb-12 font-fredoka">
      <div className="container max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Eye className="text-[#FA00FF]" size={32} />
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#00F7FF] to-[#FA00FF]">
              Navi Society
            </h1>
          </div>
          <p className="text-gray-400">Exclusive prophetic messages from Prophet Dian</p>
        </div>

        {/* Create Post Form - Only for authorized users */}
        {isAuthorizedToPost && (
          <Card className="bg-gradient-to-br from-[#FA00FF]/10 to-[#00F7FF]/10 border-[#FA00FF]/30 p-6 mb-8">
            {!showCreateForm ? (
              <Button
                onClick={() => setShowCreateForm(true)}
                className="w-full bg-gradient-to-r from-[#00F7FF] to-[#FA00FF] text-black hover:shadow-lg hover:shadow-[#FA00FF]/50 py-6 text-lg font-semibold"
              >
                <Upload className="mr-2" size={20} />
                Share Prophetic Message
              </Button>
            ) : (
              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-300">Title</label>
                  <Input
                    type="text"
                    placeholder="Prophetic revelation title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-black/50 border-[#00F7FF]/30 text-white placeholder-gray-600 focus:border-[#00F7FF]/60"
                  />
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-300">Message</label>
                  <Textarea
                    placeholder="Share your prophetic message..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="bg-black/50 border-[#00F7FF]/30 text-white placeholder-gray-600 focus:border-[#00F7FF]/60 min-h-[120px] resize-none"
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-300">Image (Optional)</label>
                  <label className="block">
                    <div className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-[#00F7FF]/30 rounded-lg hover:border-[#FA00FF]/50 transition-colors cursor-pointer bg-black/50">
                      <div className="text-center">
                        <Upload className="mx-auto mb-2 text-[#00F7FF]" size={24} />
                        <p className="text-sm text-gray-400">Click to upload image</p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </div>
                  </label>
                </div>

                {/* Image Preview */}
                {previewUrl && (
                  <div className="relative">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg border border-[#00F7FF]/30"
                    />
                    <button
                      onClick={() => {
                        setImageUrl("");
                        setPreviewUrl("");
                      }}
                      className="absolute top-2 right-2 bg-[#FA00FF] text-black rounded-full p-2 hover:bg-[#FA00FF]/80"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    onClick={handleCreatePost}
                    disabled={createPostMutation.isPending}
                    className="flex-1 bg-gradient-to-r from-[#00F7FF] to-[#FA00FF] text-black hover:shadow-lg hover:shadow-[#FA00FF]/50 font-semibold"
                  >
                    {createPostMutation.isPending ? (
                      <>
                        <Loader2 className="animate-spin mr-2" size={16} />
                        Publishing...
                      </>
                    ) : (
                      "Publish Message"
                    )}
                  </Button>
                  <Button
                    onClick={() => {
                      setShowCreateForm(false);
                      setTitle("");
                      setContent("");
                      setImageUrl("");
                      setPreviewUrl("");
                    }}
                    variant="outline"
                    className="flex-1 border-[#FA00FF]/30 text-[#FA00FF] hover:bg-[#FA00FF]/10 font-semibold"
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
          {postsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-[#00F7FF]" size={32} />
            </div>
          ) : naviPosts && naviPosts.length > 0 ? (
            naviPosts.map((post: any) => (
              <Card
                key={post.id}
                className="bg-gradient-to-r from-[#FA00FF]/10 to-[#00F7FF]/10 border-[#00F7FF]/30 p-6 hover:border-[#FA00FF]/50 transition-all"
              >
                {/* Post Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#00F7FF] to-[#FA00FF] rounded-full flex items-center justify-center flex-shrink-0">
                    <Eye className="text-black" size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{post.authorName || "Prophet Dian"}</h3>
                    <p className="text-gray-500 text-sm">
                      {post.publishedAt
                        ? formatDistanceToNow(new Date(post.publishedAt), { addSuffix: true })
                        : "now"}
                    </p>
                  </div>
                </div>

                {/* Post Content */}
                <h2 className="text-xl font-bold text-[#00F7FF] mb-3">{post.title}</h2>
                <p className="text-gray-300 mb-4 leading-relaxed">{post.content}</p>

                {/* Post Image */}
                {post.featuredImage && (
                  <img
                    src={post.featuredImage}
                    alt={post.title}
                    className="w-full h-64 object-cover rounded-lg mb-4 border border-[#00F7FF]/30"
                  />
                )}

                {/* Engagement */}
                <div className="flex gap-6 pt-4 border-t border-[#00F7FF]/20">
                  <button className="flex items-center gap-2 text-gray-400 hover:text-[#FA00FF] transition-colors">
                    <Heart size={18} />
                    <span className="text-sm">Like</span>
                  </button>
                  <button className="flex items-center gap-2 text-gray-400 hover:text-[#00F7FF] transition-colors">
                    <MessageCircle size={18} />
                    <span className="text-sm">Comment</span>
                  </button>
                  <button className="flex items-center gap-2 text-gray-400 hover:text-[#FA00FF] transition-colors">
                    <Share size={18} />
                    <span className="text-sm">Share</span>
                  </button>
                </div>
              </Card>
            ))
          ) : (
            <Card className="bg-black/50 border-[#00F7FF]/20 p-8 text-center">
              <Eye className="mx-auto mb-4 text-[#FA00FF]" size={32} />
              <p className="text-gray-400 text-lg">No prophetic messages yet.</p>
              <p className="text-gray-500 text-sm mt-2">Check back soon for exclusive revelations.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
