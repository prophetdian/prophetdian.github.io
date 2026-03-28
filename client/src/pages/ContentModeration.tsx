import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Flag, Trash2, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface FlaggedContent {
  id: number;
  type: "post" | "comment";
  author: string;
  content: string;
  reason: string;
  flaggedBy: string;
  timestamp: Date;
  status: "pending" | "reviewed" | "removed";
}

export default function ContentModeration() {
  const [flaggedItems, setFlaggedItems] = useState<FlaggedContent[]>([
    {
      id: 1,
      type: "comment",
      author: "User #5",
      content: "This comment contains inappropriate language",
      reason: "Offensive language",
      flaggedBy: "User #3",
      timestamp: new Date(Date.now() - 3600000),
      status: "pending",
    },
    {
      id: 2,
      type: "post",
      author: "User #7",
      content: "Post with spam content and external links",
      reason: "Spam",
      flaggedBy: "User #2",
      timestamp: new Date(Date.now() - 7200000),
      status: "pending",
    },
  ]);

  const [selectedItem, setSelectedItem] = useState<FlaggedContent | null>(null);
  const [moderationNote, setModerationNote] = useState("");
  const [action, setAction] = useState<"approve" | "remove">("remove");

  const handleModerate = (item: FlaggedContent, actionType: "approve" | "remove") => {
    const updatedItems = flaggedItems.map((i) =>
      i.id === item.id
        ? { ...i, status: "reviewed" as const }
        : i
    );
    setFlaggedItems(updatedItems);
    setSelectedItem(null);
    setModerationNote("");
    toast.success(`Content ${actionType === "approve" ? "approved" : "removed"}`);
  };

  const pendingCount = flaggedItems.filter((i) => i.status === "pending").length;

  return (
    <div className="min-h-screen bg-[#000000] text-white">
      <div className="container py-8">
        <h1 className="text-4xl font-bold mb-8 text-glow">Content Moderation</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Flagged Items List */}
          <div className="lg:col-span-1">
            <Card className="prophet-card overflow-hidden">
              <div className="p-4 border-b border-[#00F7FF]/10 bg-black/50">
                <h2 className="font-semibold">Flagged Content ({pendingCount})</h2>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {flaggedItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className={`w-full text-left p-4 border-b border-[#00F7FF]/10 hover:bg-black/50 transition ${
                      selectedItem?.id === item.id ? "bg-black/50 border-l-4 border-l-[#FA00FF]" : ""
                    } ${item.status === "pending" ? "opacity-100" : "opacity-50"}`}
                  >
                    <div className="flex items-start gap-3">
                      <Flag size={16} className="text-[#FA00FF] mt-1 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-white">{item.author}</p>
                        <p className="text-xs text-gray-400 truncate">{item.content}</p>
                        <p className="text-xs text-gray-500 mt-1">{item.reason}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* Moderation Panel */}
          <div className="lg:col-span-2">
            {selectedItem ? (
              <Card className="prophet-card p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-bold mb-4">Review Flagged Content</h2>
                  <div className="space-y-4 bg-black/30 p-4 rounded-lg mb-6">
                    <div>
                      <p className="text-sm text-gray-400">Author</p>
                      <p className="font-semibold">{selectedItem.author}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Type</p>
                      <p className="font-semibold capitalize">{selectedItem.type}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Reason</p>
                      <p className="font-semibold">{selectedItem.reason}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Content</p>
                      <p className="text-sm mt-1">{selectedItem.content}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Flagged by</p>
                      <p className="font-semibold">{selectedItem.flaggedBy}</p>
                    </div>
                  </div>
                </div>

                {/* Moderation Note */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-2">Moderation Note</label>
                  <Textarea
                    value={moderationNote}
                    onChange={(e) => setModerationNote(e.target.value)}
                    placeholder="Add your moderation notes..."
                    className="bg-black/50 border-[#00F7FF]/30 text-white placeholder-gray-600"
                    rows={3}
                  />
                </div>

                {/* Action */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-2">Action</label>
                  <Select value={action} onValueChange={(value: any) => setAction(value)}>
                    <SelectTrigger className="bg-black/50 border-[#00F7FF]/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-black border-[#00F7FF]/30">
                      <SelectItem value="approve">Approve (No action)</SelectItem>
                      <SelectItem value="remove">Remove Content</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Buttons */}
                <div className="flex gap-4">
                  <Button
                    onClick={() => handleModerate(selectedItem, action)}
                    className={`flex-1 ${
                      action === "remove"
                        ? "bg-[#FA00FF] hover:shadow-lg hover:shadow-[#FA00FF]/50"
                        : "bg-[#00F7FF] hover:shadow-lg hover:shadow-[#00F7FF]/50"
                    } text-black`}
                  >
                    {action === "remove" ? (
                      <>
                        <Trash2 size={18} className="mr-2" />
                        Remove Content
                      </>
                    ) : (
                      <>
                        <CheckCircle size={18} className="mr-2" />
                        Approve
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => setSelectedItem(null)}
                    variant="outline"
                    className="flex-1 text-[#00F7FF] border-[#00F7FF]/30 hover:bg-[#00F7FF]/10"
                  >
                    Cancel
                  </Button>
                </div>
              </Card>
            ) : (
              <Card className="prophet-card p-8 flex items-center justify-center h-96">
                <p className="text-gray-400">Select a flagged item to review</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
