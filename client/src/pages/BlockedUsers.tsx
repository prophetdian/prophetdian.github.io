import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Search, Shield } from "lucide-react";
import { toast } from "sonner";

interface BlockedUser {
  id: number;
  name: string;
  email: string;
  blockedAt: Date;
}

export default function BlockedUsers() {
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([
    {
      id: 1,
      name: "Spam User",
      email: "spam@example.com",
      blockedAt: new Date(Date.now() - 86400000),
    },
    {
      id: 2,
      name: "Troll Account",
      email: "troll@example.com",
      blockedAt: new Date(Date.now() - 172800000),
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [userToBlock, setUserToBlock] = useState("");

  const handleBlockUser = () => {
    if (!userToBlock.trim()) {
      toast.error("Please enter a username or email");
      return;
    }

    const newBlockedUser: BlockedUser = {
      id: Math.max(...blockedUsers.map((u) => u.id), 0) + 1,
      name: userToBlock,
      email: `${userToBlock}@example.com`,
      blockedAt: new Date(),
    };

    setBlockedUsers([...blockedUsers, newBlockedUser]);
    setUserToBlock("");
    toast.success("User blocked successfully");
  };

  const handleUnblock = (id: number) => {
    setBlockedUsers(blockedUsers.filter((u) => u.id !== id));
    toast.success("User unblocked");
  };

  const filteredUsers = blockedUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#000000] text-white">
      <div className="container py-8 max-w-2xl">
        <h1 className="text-4xl font-bold mb-8 text-glow">Blocked Users</h1>

        {/* Block User Form */}
        <Card className="prophet-card p-6 mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Shield size={24} className="text-[#FA00FF]" />
            Block a User
          </h2>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Username or email"
              value={userToBlock}
              onChange={(e) => setUserToBlock(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleBlockUser()}
              className="bg-black/50 border-[#00F7FF]/30 text-white placeholder-gray-600"
            />
            <Button
              onClick={handleBlockUser}
              className="bg-gradient-to-r from-[#00F7FF] to-[#FA00FF] text-black hover:shadow-lg hover:shadow-[#FA00FF]/50"
            >
              Block
            </Button>
          </div>
        </Card>

        {/* Blocked Users List */}
        <Card className="prophet-card overflow-hidden">
          {/* Search */}
          <div className="p-4 border-b border-[#00F7FF]/10 bg-black/50">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-[#00F7FF]" size={18} />
              <Input
                placeholder="Search blocked users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-black/50 border-[#00F7FF]/30 text-white placeholder-gray-500"
              />
            </div>
          </div>

          {/* Users List */}
          <div className="divide-y divide-[#00F7FF]/10">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <div key={user.id} className="p-4 hover:bg-black/30 transition flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-white">{user.name}</p>
                    <p className="text-sm text-gray-400">{user.email}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Blocked {new Date(user.blockedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    onClick={() => handleUnblock(user.id)}
                    variant="ghost"
                    className="text-[#FA00FF] hover:text-[#00F7FF]"
                  >
                    <Trash2 size={18} />
                  </Button>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-400">
                {blockedUsers.length === 0 ? "No blocked users" : "No results found"}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
