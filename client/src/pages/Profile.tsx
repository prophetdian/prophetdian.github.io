import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, ShoppingBag, BookOpen, Trash2, Edit2 } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export default function Profile() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "");

  const { data: orders } = trpc.orders.list.useQuery(undefined, {
    enabled: !!user,
  });

  const { data: userPosts, refetch: refetchPosts, isLoading: postsLoading } = trpc.posts.getUserPosts.useQuery(
    { userId: user?.id },
    { enabled: !!user }
  );

  const { data: userBadges } = trpc.badges.getUserBadges.useQuery(
    { userId: user?.id },
    { enabled: !!user }
  );

  const deletePostMutation = trpc.posts.delete.useMutation({
    onSuccess: () => {
      toast.success("Post deleted successfully");
      refetchPosts();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete post");
    },
  });

  const handleDeletePost = async (postId: number) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      deletePostMutation.mutate({ postId });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-[#00F7FF]" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl mb-4">Please sign in to view your profile</p>
          <Button className="bg-[#00F7FF] text-black hover:shadow-lg hover:shadow-[#00F7FF]/50">
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-20 pb-12 font-fredoka">
      <div className="container max-w-4xl mx-auto px-4">
        <h1 className="text-4xl md:text-5xl font-bold mb-8 text-[#00F7FF]">My Profile</h1>

        {/* Profile Card */}
        <Card className="bg-gradient-to-br from-[#FA00FF]/10 to-[#00F7FF]/10 border-[#FA00FF]/30 p-8 mb-8">
          <div className="flex flex-col items-center text-center mb-8">
            {user.profilePicture ? (
              <img
                src={user.profilePicture}
                alt={user.name}
                className="w-32 h-32 rounded-full object-cover border-4 border-[#00F7FF] mb-6 shadow-lg shadow-[#00F7FF]/30"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gradient-to-r from-[#00F7FF] to-[#FA00FF] flex items-center justify-center text-4xl font-bold mb-6 shadow-lg shadow-[#FA00FF]/30">
                {user.name?.charAt(0) || user.username?.charAt(0) || "U"}
              </div>
            )}
            <h2 className="text-4xl font-bold text-white mb-2">{user.name || user.username}</h2>
            <p className="text-gray-400 text-lg mb-3">@{user.username}</p>
            {user.bio && <p className="text-gray-300 max-w-2xl mb-6">{user.bio}</p>}
            <Button
              onClick={() => setLocation("/profile-edit")}
              className="bg-gradient-to-r from-[#FA00FF] to-[#00F7FF] text-black hover:shadow-lg hover:shadow-[#FA00FF]/50 py-3 px-8 text-lg font-bold"
            >
              <Edit2 className="mr-2" size={20} />
              Edit Profile
            </Button>
          </div>

          {/* Badges */}
          {userBadges && userBadges.length > 0 && (
            <div className="flex gap-3 flex-wrap mt-4">
              {userBadges.map((badge: any) => {
                const badgeInfo: Record<string, any> = {
                  pastor: { icon: "🙏", color: "#00F7FF", name: "Pastor" },
                  teacher: { icon: "📚", color: "#00F7FF", name: "Teacher" },
                  evangelist: { icon: "📢", color: "#00F7FF", name: "Evangelist" },
                  apostle: { icon: "⚔️", color: "#00F7FF", name: "Apostle" },
                  prophet: { icon: "👁️", color: "#FA00FF", name: "Prophet" },
                };
                const info = badgeInfo[badge.badgeType];
                return (
                  <div
                    key={badge.id}
                    className="flex items-center gap-2 px-3 py-1 rounded-full border"
                    style={{
                      backgroundColor: `${info.color}20`,
                      borderColor: info.color,
                    }}
                  >
                    <span>{info.icon}</span>
                    <span className="text-sm font-semibold">{info.name}</span>
                    {badge.isPermanent && <span className="text-xs text-yellow-400">★</span>}
                  </div>
                );
              })}
            </div>
          )}
          <Button
            onClick={() => setLocation("/badges")}
            className="mt-4 bg-[#00F7FF]/20 text-[#00F7FF] hover:bg-[#00F7FF]/30 border border-[#00F7FF]"
          >
            Browse Badges
          </Button>
        </Card>

        {/* User Posts Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#00F7FF] mb-6">My Posts</h2>
          
          {postsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-[#00F7FF]" size={32} />
            </div>
          ) : userPosts && userPosts.length > 0 ? (
            <div className="grid gap-6">
              {userPosts.map((post: any) => (
                <Card
                  key={post.id}
                  className="bg-gradient-to-r from-[#FA00FF]/10 to-[#00F7FF]/10 border-[#00F7FF]/30 p-6 hover:border-[#FA00FF]/50 transition-all"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-[#00F7FF] mb-2">{post.title}</h3>
                      <p className="text-gray-300 mb-3 line-clamp-2">{post.content}</p>
                      <p className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(post.publishedAt || post.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        onClick={() => setLocation(`/edit-post/${post.id}`)}
                        size="sm"
                        className="bg-[#00F7FF]/20 text-[#00F7FF] hover:bg-[#00F7FF]/30"
                      >
                        <Edit2 size={16} />
                      </Button>
                      <Button
                        onClick={() => handleDeletePost(post.id)}
                        disabled={deletePostMutation.isPending}
                        size="sm"
                        className="bg-red-500/20 text-red-400 hover:bg-red-500/30"
                      >
                        {deletePostMutation.isPending ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </Button>
                    </div>
                  </div>

                  {post.featuredImage && (
                    <img
                      src={post.featuredImage}
                      alt={post.title}
                      className="w-full h-40 object-cover rounded-lg border border-[#00F7FF]/20 mt-4"
                    />
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-black/50 border-[#00F7FF]/20 p-8 text-center">
              <p className="text-gray-400 text-lg">No posts yet.</p>
              <p className="text-gray-500 text-sm mt-2">Create your first post to share with the community!</p>
              <Button
                onClick={() => setLocation("/feed")}
                className="mt-4 bg-[#FA00FF] text-black hover:shadow-lg hover:shadow-[#FA00FF]/50"
              >
                Create Post
              </Button>
            </Card>
          )}
        </div>

        {/* Orders Section */}
        {orders && orders.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#00F7FF] mb-6 flex items-center gap-2">
              <ShoppingBag size={24} />
              Orders
            </h2>
            <div className="grid gap-4">
              {orders.map((order: any) => (
                <Card key={order.id} className="bg-black/50 border-[#00F7FF]/20 p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">Order #{order.id}</p>
                      <p className="text-sm text-gray-400">Status: {order.status}</p>
                    </div>
                    <p className="text-[#FA00FF] font-bold">${order.total}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
