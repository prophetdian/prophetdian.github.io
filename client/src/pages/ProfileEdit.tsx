import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Upload, Loader2 } from "lucide-react";

export default function ProfileEdit() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const updateProfileMutation = trpc.profile.update.useMutation();

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setUsername(user.username || "");
      setBio(user.bio || "");
      setPreviewUrl(user.profilePicture || "");
    }
  }, [user]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setPreviewUrl(result);
        setHasChanges(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    if (field === "username") setUsername(value);
    if (field === "name") setName(value);
    if (field === "bio") setBio(value);
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!username.trim()) {
      toast.error("Username is required");
      return;
    }

    if (username.length < 3) {
      toast.error("Username must be at least 3 characters");
      return;
    }

    if (username.length > 50) {
      toast.error("Username must be less than 50 characters");
      return;
    }

    setIsLoading(true);
    try {
      // Update profile in database
      await updateProfileMutation.mutateAsync({
        name: name || undefined,
        username: username,
        bio: bio || undefined,
        profilePicture: previewUrl || undefined,
      });

      toast.success("Profile updated successfully!");
      setIsLoading(false);
      setHasChanges(false);
      setLocation("/profile");
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to update profile");
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Please log in to edit your profile</p>
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

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-20 font-fredoka">
      <div className="container max-w-3xl mx-auto px-4">
        {/* Header with Back Button */}
        <div className="mb-12 flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-3">
              <button
                onClick={() => setLocation("/profile")}
                className="p-2 hover:bg-[#00F7FF]/10 rounded-lg transition-colors"
              >
                <ArrowLeft size={28} className="text-[#00F7FF]" />
              </button>
              <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#00F7FF] to-[#FA00FF]">
                Edit Profile
              </h1>
            </div>
            <p className="text-gray-400 ml-16">Customize your profile and make it uniquely yours</p>
          </div>
          {hasChanges && (
            <div className="flex items-center gap-2 bg-[#FA00FF]/20 px-4 py-2 rounded-lg border border-[#FA00FF]/50">
              <div className="w-2 h-2 bg-[#FA00FF] rounded-full animate-pulse"></div>
              <span className="text-sm text-[#FA00FF]">Unsaved changes</span>
            </div>
          )}
        </div>

        {/* Profile Picture Section */}
        <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border-[#FA00FF]/30 p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6 text-[#00F7FF]">Profile Picture</h2>
          <div className="flex items-center gap-8">
            <div className="flex-shrink-0">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-[#00F7FF]/50"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#00F7FF] to-[#FA00FF] flex items-center justify-center">
                  <span className="text-4xl text-black font-bold">
                    {username.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <label className="flex items-center justify-center gap-2 px-6 py-3 bg-[#00F7FF]/10 border-2 border-dashed border-[#00F7FF]/50 rounded-lg cursor-pointer hover:border-[#00F7FF] transition">
                <Upload size={20} className="text-[#00F7FF]" />
                <span className="text-[#00F7FF] font-semibold">Upload New Picture</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
              <p className="text-gray-400 text-sm mt-3">JPG, PNG or GIF (Max 5MB)</p>
            </div>
          </div>
        </Card>

        {/* Profile Information Section */}
        <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border-[#FA00FF]/30 p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6 text-[#00F7FF]">Profile Information</h2>
          <div className="space-y-6">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Full Name</label>
              <Input
                type="text"
                value={name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter your full name"
                className="bg-[#0a0a0a] border-[#FA00FF]/30 text-white placeholder-gray-500 focus:border-[#FA00FF] focus:ring-[#FA00FF]/30"
              />
            </div>

            {/* Username Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Username <span className="text-[#FA00FF]">*</span>
              </label>
              <Input
                type="text"
                value={username}
                onChange={(e) => handleInputChange("username", e.target.value)}
                placeholder="Enter your username"
                className="bg-[#0a0a0a] border-[#FA00FF]/30 text-white placeholder-gray-500 focus:border-[#FA00FF] focus:ring-[#FA00FF]/30"
              />
              <p className="text-gray-400 text-sm mt-1">3-50 characters, no spaces</p>
            </div>

            {/* Bio Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Bio</label>
              <Textarea
                value={bio}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                placeholder="Tell us about yourself..."
                rows={4}
                className="bg-[#0a0a0a] border-[#FA00FF]/30 text-white placeholder-gray-500 focus:border-[#FA00FF] focus:ring-[#FA00FF]/30 resize-none"
              />
              <p className="text-gray-400 text-sm mt-1">{bio.length}/500 characters</p>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            onClick={() => setLocation("/profile")}
            variant="outline"
            className="flex-1 border-[#FA00FF] text-[#FA00FF] hover:bg-[#FA00FF]/10"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading || !hasChanges}
            className="flex-1 bg-gradient-to-r from-[#00F7FF] to-[#FA00FF] text-black hover:shadow-lg hover:shadow-[#FA00FF]/50 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin mr-2" size={20} />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
