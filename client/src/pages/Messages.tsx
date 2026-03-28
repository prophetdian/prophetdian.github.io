import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Send, Search, X } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

interface Message {
  id: number;
  senderId: number;
  senderName: string;
  content: string;
  timestamp: Date;
}

interface Conversation {
  id: number;
  userId: number;
  userName: string;
  lastMessage: string;
  lastMessageTime: Date;
  unread: number;
  messages: Message[];
}

export default function Messages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: 1,
      userId: 2,
      userName: "User #2",
      lastMessage: "Thank you for the prophetic message",
      lastMessageTime: new Date(Date.now() - 3600000),
      unread: 2,
      messages: [
        {
          id: 1,
          senderId: 2,
          senderName: "User #2",
          content: "Hello Prophet Dian",
          timestamp: new Date(Date.now() - 7200000),
        },
        {
          id: 2,
          senderId: user?.id || 1,
          senderName: "You",
          content: "Blessings to you",
          timestamp: new Date(Date.now() - 5400000),
        },
        {
          id: 3,
          senderId: 2,
          senderName: "User #2",
          content: "Thank you for the prophetic message",
          timestamp: new Date(Date.now() - 3600000),
        },
      ],
    },
  ]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(conversations[0]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) {
      toast.error("Message cannot be empty");
      return;
    }

    const updatedConversations = conversations.map((conv) => {
      if (conv.id === selectedConversation.id) {
        return {
          ...conv,
          messages: [
            ...conv.messages,
            {
              id: conv.messages.length + 1,
              senderId: user?.id || 1,
              senderName: "You",
              content: newMessage,
              timestamp: new Date(),
            },
          ],
          lastMessage: newMessage,
          lastMessageTime: new Date(),
        };
      }
      return conv;
    });

    setConversations(updatedConversations);
    setSelectedConversation(updatedConversations.find((c) => c.id === selectedConversation.id) || null);
    setNewMessage("");
    toast.success("Message sent!");
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.userName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container py-8">
        <h1 className="text-4xl font-bold mb-8 text-glow">Messages</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversations List */}
          <div className="lg:col-span-1">
            <Card className="prophet-card overflow-hidden">
              {/* Search */}
              <div className="p-4 border-b border-[#00F7FF]/10">
                <div className="relative">
                  <Search className="absolute left-3 top-3 text-[#00F7FF]" size={18} />
                  <Input
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-black/50 border-[#00F7FF]/30 text-white placeholder-gray-500 rounded-full"
                  />
                </div>
              </div>

              {/* Conversations */}
              <div className="max-h-96 overflow-y-auto">
                {filteredConversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv)}
                    className={`w-full text-left p-4 border-b border-[#00F7FF]/10 hover:bg-black/50 transition ${
                      selectedConversation?.id === conv.id ? "bg-black/50 border-l-4 border-l-[#FA00FF]" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-[#00F7FF] to-[#FA00FF] rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-black">U</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white">{conv.userName}</p>
                        <p className="text-sm text-gray-400 truncate">{conv.lastMessage}</p>
                      </div>
                      {conv.unread > 0 && (
                        <span className="bg-[#FA00FF] text-black text-xs font-bold px-2 py-1 rounded-full flex-shrink-0">
                          {conv.unread}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2">
            {selectedConversation ? (
              <Card className="prophet-card h-full flex flex-col">
                {/* Chat Header */}
                <div className="p-4 border-b border-[#00F7FF]/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-[#00F7FF] to-[#FA00FF] rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-black">U</span>
                    </div>
                    <div>
                      <p className="font-semibold text-white">{selectedConversation.userName}</p>
                      <p className="text-xs text-gray-400">Online</p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {selectedConversation.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.senderId === user?.id ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-xs px-4 py-2 rounded-lg ${
                          msg.senderId === user?.id
                            ? "bg-[#FA00FF] text-black"
                            : "bg-black/50 border border-[#00F7FF]/30 text-white"
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <p className={`text-xs mt-1 ${msg.senderId === user?.id ? "text-black/70" : "text-gray-400"}`}>
                          {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-[#00F7FF]/10 flex gap-2">
                  <Textarea
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="bg-black/50 border-[#00F7FF]/30 text-white placeholder-gray-600 resize-none"
                    rows={2}
                  />
                  <Button
                    onClick={handleSendMessage}
                    className="bg-gradient-to-r from-[#00F7FF] to-[#FA00FF] text-black hover:shadow-lg hover:shadow-[#FA00FF]/50 self-end"
                  >
                    <Send size={20} />
                  </Button>
                </div>
              </Card>
            ) : (
              <Card className="prophet-card h-full flex items-center justify-center">
                <p className="text-gray-400">Select a conversation to start messaging</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
