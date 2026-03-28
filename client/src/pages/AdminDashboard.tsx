import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import { Trash2, Ban, BarChart3, Users, FileText, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export function AdminDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  
  const [selectedTab, setSelectedTab] = useState<"stats" | "posts" | "users">("stats");

  // Check if user is admin
  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">You do not have access to this page</p>
          <Button onClick={() => setLocation("/")} className="bg-[#00F7FF] text-black">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  // Queries
  const statsQuery = trpc.admin.getStats.useQuery();
  const postsQuery = trpc.admin.getAllPosts.useQuery();
  const usersQuery = trpc.admin.getAllUsers.useQuery();

  // Mutations
  const deletePostMutation = trpc.admin.deletePost.useMutation();
  const deleteCommentMutation = trpc.admin.deleteComment.useMutation();
  const suspendUserMutation = trpc.admin.suspendUser.useMutation();

  const handleDeletePost = async (postId: number) => {
    const reason = prompt("Enter reason for deletion:");
    if (!reason) return;

    try {
      await deletePostMutation.mutateAsync({ postId, reason });
      toast({
        title: "Success",
        description: "Post deleted successfully",
      });
      postsQuery.refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete post",
        variant: "destructive",
      });
    }
  };

  const handleSuspendUser = async (userId: number) => {
    const reason = prompt("Enter reason for suspension:");
    if (!reason) return;

    try {
      await suspendUserMutation.mutateAsync({ userId, reason });
      toast({
        title: "Success",
        description: "User suspended successfully",
      });
      usersQuery.refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to suspend user",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pt-8 pb-20">
      <div className="container max-w-6xl mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-[#00F7FF] to-[#FA00FF]">
          Admin Dashboard
        </h1>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8">
          <Button
            onClick={() => setSelectedTab("stats")}
            className={selectedTab === "stats" ? "bg-[#00F7FF] text-black" : "bg-gray-800"}
          >
            <BarChart3 className="mr-2" size={18} />
            Statistics
          </Button>
          <Button
            onClick={() => setSelectedTab("posts")}
            className={selectedTab === "posts" ? "bg-[#00F7FF] text-black" : "bg-gray-800"}
          >
            <FileText className="mr-2" size={18} />
            Posts
          </Button>
          <Button
            onClick={() => setSelectedTab("users")}
            className={selectedTab === "users" ? "bg-[#00F7FF] text-black" : "bg-gray-800"}
          >
            <Users className="mr-2" size={18} />
            Users
          </Button>
        </div>

        {/* Statistics Tab */}
        {selectedTab === "stats" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-[#FA00FF]/10 to-[#00F7FF]/10 border-2 border-[#FA00FF]/30 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 mb-2">Total Users</p>
                  <p className="text-4xl font-bold text-[#00F7FF]">
                    {statsQuery.data?.totalUsers || 0}
                  </p>
                </div>
                <Users size={48} className="text-[#FA00FF]/50" />
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-[#FA00FF]/10 to-[#00F7FF]/10 border-2 border-[#FA00FF]/30 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 mb-2">Total Posts</p>
                  <p className="text-4xl font-bold text-[#00F7FF]">
                    {statsQuery.data?.totalPosts || 0}
                  </p>
                </div>
                <FileText size={48} className="text-[#FA00FF]/50" />
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-[#FA00FF]/10 to-[#00F7FF]/10 border-2 border-[#FA00FF]/30 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 mb-2">Total Comments</p>
                  <p className="text-4xl font-bold text-[#00F7FF]">
                    {statsQuery.data?.totalComments || 0}
                  </p>
                </div>
                <MessageSquare size={48} className="text-[#FA00FF]/50" />
              </div>
            </Card>
          </div>
        )}

        {/* Posts Tab */}
        {selectedTab === "posts" && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">Manage Posts</h2>
            {postsQuery.data && postsQuery.data.length > 0 ? (
              postsQuery.data.map((post) => (
                <Card
                  key={post.id}
                  className="bg-gradient-to-br from-[#FA00FF]/10 to-[#00F7FF]/10 border-2 border-[#FA00FF]/30 p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-gray-200 mb-2">{post.content}</p>
                      <p className="text-xs text-gray-500">
                        Posted: {new Date(post.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeletePost(post.id)}
                      className="text-red-500 hover:bg-red-500/10"
                    >
                      <Trash2 size={18} />
                    </Button>
                  </div>
                </Card>
              ))
            ) : (
              <p className="text-gray-500">No posts to moderate</p>
            )}
          </div>
        )}

        {/* Users Tab */}
        {selectedTab === "users" && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">Manage Users</h2>
            {usersQuery.data && usersQuery.data.length > 0 ? (
              usersQuery.data.map((u) => (
                <Card
                  key={u.id}
                  className="bg-gradient-to-br from-[#FA00FF]/10 to-[#00F7FF]/10 border-2 border-[#FA00FF]/30 p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-[#00F7FF]">{u.name}</p>
                      <p className="text-sm text-gray-400">{u.email}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Role: {u.role || "user"}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSuspendUser(u.id)}
                      className="text-red-500 hover:bg-red-500/10"
                    >
                      <Ban size={18} />
                    </Button>
                  </div>
                </Card>
              ))
            ) : (
              <p className="text-gray-500">No users found</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
