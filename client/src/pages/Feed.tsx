import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, MessageCircle, Share2, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

export default function Feed() {
  const { user } = useAuth();
  const [newPost, setNewPost] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: posts, isLoading } = trpc.posts.list.useQuery({ limit: 20, offset: 0 });
  const createPostMutation = trpc.posts.create.useMutation();

  const handleCreatePost = async () => {
    if (!newPost.trim()) {
      toast.error("Post cannot be empty");
      return;
    }

    setIsSubmitting(true);
    try {
      await createPostMutation.mutateAsync({
        title: "Post",
        content: newPost,
      });
      setNewPost("");
      toast.success("Post created successfully!");
    } catch (error) {
      toast.error("Failed to create post");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container py-8 pt-20 max-w-2xl">
        <h1 className="text-4xl md:text-5xl font-bold mb-8 text-glow">Prophetic Feed</h1>

        {user && (
          <Card className="p-6 mb-8 bg-gray-900 border-gray-800">
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="Share your prophetic message..."
              className="w-full bg-gray-800 text-white rounded p-4 mb-4 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
              rows={4}
            />
            <Button
              onClick={handleCreatePost}
              disabled={isSubmitting || !newPost.trim()}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : null}
              Post
            </Button>
          </Card>
        )}

        <div className="space-y-6">
          {isLoading ? (
            <div className="text-center py-8">
              <Loader2 className="animate-spin mx-auto" />
            </div>
          ) : posts && posts.length > 0 ? (
            posts.map((post) => (
              <Card key={post.id} className="p-6 bg-gray-900 border-gray-800">
                <h3 className="text-xl font-bold mb-2">{post.title}</h3>
                <p className="text-gray-300 mb-4">{post.content}</p>
                <div className="flex gap-4 text-gray-400">
                  <button className="flex items-center gap-2 hover:text-red-500">
                    <Heart size={18} />
                    <span>Like</span>
                  </button>
                  <button className="flex items-center gap-2 hover:text-blue-500">
                    <MessageCircle size={18} />
                    <span>Comment</span>
                  </button>
                  <button className="flex items-center gap-2 hover:text-green-500">
                    <Share2 size={18} />
                    <span>Share</span>
                  </button>
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center py-8 text-gray-400">
              <p>No posts yet. Be the first to share!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
