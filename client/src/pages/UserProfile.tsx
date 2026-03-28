import { useRoute } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Heart, MessageCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { formatDistanceToNow } from "date-fns";

export default function UserProfile() {
  const [match, params] = useRoute("/user/:userId");
  const [, navigate] = useLocation();
  const userId = params?.userId ? parseInt(params.userId) : 0;

  // Fetch user's posts
  const { data: userPosts, isLoading } = trpc.posts.list.useQuery({
    limit: 50,
    offset: 0,
  });

  // Filter posts by user
  const filteredPosts = userPosts?.filter((post: any) => post.authorId === userId) || [];

  // Fetch likes for first post
  const { data: likesData } = trpc.posts.getLikes.useQuery(filteredPosts[0]?.id || 0);
  const { data: commentsData } = trpc.posts.getComments.useQuery(filteredPosts[0]?.id || 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Loader2 className="animate-spin text-[#00F7FF]" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container py-8">
        {/* Back Button */}
        <Button
          onClick={() => navigate("/feed")}
          variant="ghost"
          className="mb-6 text-[#00F7FF] hover:text-[#FA00FF]"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Feed
        </Button>

        {/* User Header */}
        <Card className="prophet-card p-8 mb-8">
          <div className="text-center">
            <div className="w-24 h-24 bg-gradient-to-r from-[#00F7FF] to-[#FA00FF] rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-3xl font-bold text-black">U</span>
            </div>
            <h1 className="text-3xl font-bold mb-2">User #{userId}</h1>
            <p className="text-gray-400 mb-4">{filteredPosts.length} posts</p>
            <div className="flex justify-center gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-[#00F7FF]">{filteredPosts.length}</p>
                <p className="text-sm text-gray-400">Posts</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-[#FA00FF]">{likesData?.count || 0}</p>
                <p className="text-sm text-gray-400">Likes</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-[#00F7FF]">{commentsData?.length || 0}</p>
                <p className="text-sm text-gray-400">Comments</p>
              </div>
            </div>
          </div>
        </Card>

        {/* User's Posts */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold mb-6">Prophetic Messages</h2>
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post: any) => (
              <Card key={post.id} className="prophet-card overflow-hidden">
                {/* Post Header */}
                <div className="p-4 border-b border-[#00F7FF]/10">
                  <h3 className="font-semibold text-white mb-2">{post.title}</h3>
                  <p className="text-xs text-gray-400">
                    {post.publishedAt ? formatDistanceToNow(new Date(post.publishedAt), { addSuffix: true }) : "Just now"}
                  </p>
                </div>

                {/* Post Image */}
                {post.featuredImage && (
                  <div className="w-full h-64 bg-black/50 overflow-hidden">
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

                {/* Actions */}
                <div className="px-4 py-3 border-t border-[#00F7FF]/10 flex gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-2 text-gray-400 hover:text-[#FA00FF]"
                  >
                    <Heart size={20} className="text-[#FA00FF]" fill="#FA00FF" />
                    <span className="text-sm">{likesData?.count || 0}</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-2 text-gray-400 hover:text-[#00F7FF]"
                  >
                    <MessageCircle size={20} />
                    <span className="text-sm">{commentsData?.length || 0}</span>
                  </Button>
                </div>
              </Card>
            ))
          ) : (
            <Card className="prophet-card p-8 text-center">
              <p className="text-gray-400">This user hasn't posted any prophetic messages yet</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
