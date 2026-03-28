import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Loader2, Send, Plus, Search, Paperclip, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";

export default function DirectMessages() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get conversations
  const { data: conversations, isLoading: conversationsLoading, refetch: refetchConversations } = 
    trpc.messages.getConversations.useQuery();

  // Get messages for selected conversation
  const { data: messages, isLoading: messagesLoading, refetch: refetchMessages } = 
    trpc.messages.getMessages.useQuery(
      { conversationId: selectedConversation?.id },
      { enabled: !!selectedConversation }
    );

  // Search users
  const { data: searchResults } = trpc.messages.searchUsers.useQuery(
    { query: searchQuery },
    { enabled: searchQuery.length > 0 }
  );

  // Send message mutation
  const sendMessageMutation = trpc.messages.sendMessage.useMutation({
    onSuccess: () => {
      setMessageText("");
      refetchMessages();
      refetchConversations();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to send message");
    },
  });

  // Create conversation mutation
  const createConversationMutation = trpc.messages.createConversation.useMutation({
    onSuccess: (data) => {
      setSelectedConversation(data);
      setShowNewConversation(false);
      setSelectedUser(null);
      setSearchQuery("");
      refetchConversations();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create conversation");
    },
  });

  // Mark messages as read
  useEffect(() => {
    if (selectedConversation && messages) {
      messages.forEach((msg: any) => {
        if (!msg.isRead && msg.senderId !== user?.id) {
          trpc.messages.markAsRead.mutate({ messageId: msg.id });
        }
      });
    }
  }, [messages, selectedConversation, user?.id]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversation) {
      toast.error("Please enter a message");
      return;
    }

    sendMessageMutation.mutate({
      conversationId: selectedConversation.id,
      content: messageText,
    });
  };

  const handleStartConversation = async () => {
    if (!selectedUser) {
      toast.error("Please select a user");
      return;
    }

    createConversationMutation.mutate({
      userId: selectedUser.id,
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Please log in to access messages</p>
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
    <div className="min-h-screen bg-black text-white pt-20 pb-12 font-fredoka">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px]">
          {/* Conversations List */}
          <Card className="bg-gradient-to-br from-[#FA00FF]/10 to-[#00F7FF]/10 border-[#FA00FF]/30 p-4 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[#00F7FF]">Messages</h2>
              <button
                onClick={() => setShowNewConversation(!showNewConversation)}
                className="p-2 hover:bg-[#00F7FF]/20 rounded-full transition-colors"
              >
                <Plus size={20} className="text-[#FA00FF]" />
              </button>
            </div>

            {/* Search */}
            <div className="relative mb-4">
              <Search size={16} className="absolute left-3 top-3 text-gray-500" />
              <Input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-black/50 border-[#00F7FF]/30 text-white placeholder-gray-600 pl-9 text-sm"
              />
            </div>

            {/* New Conversation Form */}
            {showNewConversation && (
              <div className="mb-4 p-3 bg-black/50 rounded-lg border border-[#00F7FF]/20">
                <p className="text-xs text-gray-400 mb-2">Start new conversation</p>
                <div className="space-y-2">
                  {searchResults && searchResults.length > 0 ? (
                    searchResults.map((u: any) => (
                      <button
                        key={u.id}
                        onClick={() => setSelectedUser(u)}
                        className={`w-full text-left p-2 rounded text-sm transition-colors ${
                          selectedUser?.id === u.id
                            ? "bg-[#FA00FF]/30 border border-[#FA00FF]"
                            : "hover:bg-[#00F7FF]/20"
                        }`}
                      >
                        {u.name || u.username}
                      </button>
                    ))
                  ) : (
                    <p className="text-xs text-gray-500">Type to search users</p>
                  )}
                </div>
                {selectedUser && (
                  <Button
                    onClick={handleStartConversation}
                    disabled={createConversationMutation.isPending}
                    className="w-full mt-2 bg-[#FA00FF] text-black text-xs py-1 hover:shadow-lg hover:shadow-[#FA00FF]/50"
                  >
                    {createConversationMutation.isPending ? "Creating..." : "Start Chat"}
                  </Button>
                )}
              </div>
            )}

            {/* Conversations */}
            <div className="flex-1 overflow-y-auto space-y-2">
              {conversationsLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="animate-spin text-[#00F7FF]" size={20} />
                </div>
              ) : conversations && conversations.length > 0 ? (
                conversations.map((conv: any) => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv)}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      selectedConversation?.id === conv.id
                        ? "bg-[#FA00FF]/30 border border-[#FA00FF]"
                        : "hover:bg-[#00F7FF]/20 border border-[#00F7FF]/20"
                    }`}
                  >
                    <p className="font-semibold text-sm">{conv.otherUserName}</p>
                    <p className="text-xs text-gray-400 truncate">{conv.lastMessage}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDistanceToNow(new Date(conv.lastMessageAt), { addSuffix: true })}
                    </p>
                  </button>
                ))
              ) : (
                <p className="text-gray-400 text-sm text-center py-4">No conversations yet</p>
              )}
            </div>
          </Card>

          {/* Chat Area */}
          <div className="md:col-span-2 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <Card className="bg-gradient-to-r from-[#FA00FF]/10 to-[#00F7FF]/10 border-[#FA00FF]/30 p-4 mb-4">
                  <h3 className="text-lg font-bold text-[#00F7FF]">{selectedConversation.otherUserName}</h3>
                  <p className="text-xs text-gray-400">Active now</p>
                </Card>

                {/* Messages */}
                <Card className="bg-black/50 border-[#00F7FF]/20 p-4 flex-1 overflow-y-auto mb-4 space-y-4">
                  {messagesLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="animate-spin text-[#00F7FF]" size={24} />
                    </div>
                  ) : messages && messages.length > 0 ? (
                    messages.map((msg: any) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.senderId === user?.id ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-xs px-4 py-2 rounded-lg ${
                            msg.senderId === user?.id
                              ? "bg-gradient-to-r from-[#00F7FF] to-[#FA00FF] text-black"
                              : "bg-[#00F7FF]/20 text-gray-300 border border-[#00F7FF]/30"
                          }`}
                        >
                          <p className="text-sm break-words">{msg.content}</p>
                          <p className={`text-xs mt-1 ${msg.senderId === user?.id ? "text-black/70" : "text-gray-500"}`}>
                            {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-8">No messages yet. Start the conversation!</p>
                  )}
                  <div ref={messagesEndRef} />
                </Card>

                {/* Message Input */}
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Type a message..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    className="bg-black/50 border-[#00F7FF]/30 text-white placeholder-gray-600 focus:border-[#00F7FF]/60"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={sendMessageMutation.isPending || !messageText.trim()}
                    className="bg-gradient-to-r from-[#00F7FF] to-[#FA00FF] text-black hover:shadow-lg hover:shadow-[#FA00FF]/50 px-6"
                  >
                    {sendMessageMutation.isPending ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      <Send size={18} />
                    )}
                  </Button>
                </div>
              </>
            ) : (
              <Card className="bg-black/50 border-[#00F7FF]/20 flex items-center justify-center h-full">
                <div className="text-center">
                  <p className="text-gray-400 mb-4">Select a conversation to start chatting</p>
                  <Button
                    onClick={() => setShowNewConversation(true)}
                    className="bg-[#FA00FF] text-black hover:shadow-lg hover:shadow-[#FA00FF]/50"
                  >
                    <Plus className="mr-2" size={18} />
                    New Conversation
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
