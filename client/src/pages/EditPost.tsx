import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Save } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

interface Post {
  id: number;
  title: string;
  content: string;
  category: string;
  hashtags: string;
  image?: string;
}

export default function EditPost() {
  const [, setLocation] = useLocation();
  const [post, setPost] = useState<Post>({
    id: 1,
    title: "Prophetic Wisdom",
    content: "This is a prophetic message about spiritual growth and transformation.",
    category: "prophecy",
    hashtags: "#prophecy #wisdom #growth",
    image: "https://via.placeholder.com/400",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!post.title.trim() || !post.content.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Post updated successfully!");
      setLocation("/feed");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#000000] text-white">
      <div className="container py-8 max-w-2xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-glow">Edit Post</h1>
          <Button
            onClick={() => setLocation("/feed")}
            variant="ghost"
            className="text-gray-400 hover:text-[#FA00FF]"
          >
            <X size={24} />
          </Button>
        </div>

        <Card className="prophet-card p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold mb-2">Title</label>
            <Input
              value={post.title}
              onChange={(e) => setPost({ ...post, title: e.target.value })}
              placeholder="Post title"
              className="bg-black/50 border-[#00F7FF]/30 text-white placeholder-gray-600"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-semibold mb-2">Content</label>
            <Textarea
              value={post.content}
              onChange={(e) => setPost({ ...post, content: e.target.value })}
              placeholder="Write your prophetic message..."
              className="bg-black/50 border-[#00F7FF]/30 text-white placeholder-gray-600 min-h-32"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold mb-2">Category</label>
            <Select value={post.category} onValueChange={(value) => setPost({ ...post, category: value })}>
              <SelectTrigger className="bg-black/50 border-[#00F7FF]/30 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-black border-[#00F7FF]/30">
                <SelectItem value="prophecy">Prophecy</SelectItem>
                <SelectItem value="testimony">Testimony</SelectItem>
                <SelectItem value="prayer">Prayer</SelectItem>
                <SelectItem value="teaching">Teaching</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Hashtags */}
          <div>
            <label className="block text-sm font-semibold mb-2">Hashtags</label>
            <Input
              value={post.hashtags}
              onChange={(e) => setPost({ ...post, hashtags: e.target.value })}
              placeholder="#prophecy #wisdom"
              className="bg-black/50 border-[#00F7FF]/30 text-white placeholder-gray-600"
            />
          </div>

          {/* Image Preview */}
          {post.image && (
            <div>
              <label className="block text-sm font-semibold mb-2">Image Preview</label>
              <img src={post.image} alt="Post" className="w-full h-64 object-cover rounded-lg" />
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-[#00F7FF] to-[#FA00FF] text-black hover:shadow-lg hover:shadow-[#FA00FF]/50"
            >
              <Save size={18} className="mr-2" />
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
            <Button
              onClick={() => setLocation("/feed")}
              variant="outline"
              className="flex-1 text-[#00F7FF] border-[#00F7FF]/30 hover:bg-[#00F7FF]/10"
            >
              Cancel
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
