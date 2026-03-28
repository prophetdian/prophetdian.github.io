import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, UserPlus, Bookmark, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  id: number;
  type: "like" | "comment" | "follow" | "bookmark";
  user: string;
  userId: number;
  message: string;
  timestamp: Date;
  read: boolean;
  postId?: number;
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      type: "like",
      user: "User #5",
      userId: 5,
      message: "liked your prophetic post",
      timestamp: new Date(Date.now() - 1800000),
      read: false,
      postId: 1,
    },
    {
      id: 2,
      type: "comment",
      user: "User #3",
      userId: 3,
      message: 'commented: "This is powerful wisdom"',
      timestamp: new Date(Date.now() - 3600000),
      read: false,
      postId: 1,
    },
    {
      id: 3,
      type: "follow",
      user: "User #7",
      userId: 7,
      message: "started following you",
      timestamp: new Date(Date.now() - 7200000),
      read: true,
    },
    {
      id: 4,
      type: "like",
      user: "User #2",
      userId: 2,
      message: "liked your post",
      timestamp: new Date(Date.now() - 86400000),
      read: true,
      postId: 2,
    },
  ]);

  const handleMarkAsRead = (id: number) => {
    setNotifications(
      notifications.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const handleDelete = (id: number) => {
    setNotifications(notifications.filter((notif) => notif.id !== id));
    toast.success("Notification deleted");
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map((notif) => ({ ...notif, read: true })));
    toast.success("All notifications marked as read");
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "like":
        return <Heart size={20} className="text-[#FA00FF]" fill="#FA00FF" />;
      case "comment":
        return <MessageCircle size={20} className="text-[#00F7FF]" />;
      case "follow":
        return <UserPlus size={20} className="text-[#00F7FF]" />;
      case "bookmark":
        return <Bookmark size={20} className="text-[#FA00FF]" fill="#FA00FF" />;
      default:
        return null;
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container py-8 max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-glow">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-sm text-gray-400 mt-2">
                {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
              </p>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              onClick={handleMarkAllAsRead}
              className="bg-[#00F7FF] text-black hover:shadow-lg hover:shadow-[#00F7FF]/50"
            >
              Mark all as read
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <div className="space-y-2">
          {notifications.length > 0 ? (
            notifications.map((notif) => (
              <Card
                key={notif.id}
                className={`prophet-card p-4 transition ${
                  !notif.read ? "bg-black/50 border-l-4 border-l-[#FA00FF]" : "bg-black/30"
                } hover:bg-black/40`}
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 bg-gradient-to-r from-[#00F7FF] to-[#FA00FF] rounded-full flex items-center justify-center flex-shrink-0">
                    {getNotificationIcon(notif.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-white">{notif.user}</p>
                      <p className="text-gray-400">{notif.message}</p>
                      {!notif.read && (
                        <div className="w-2 h-2 bg-[#FA00FF] rounded-full flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      {formatDistanceToNow(notif.timestamp, { addSuffix: true })}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 flex-shrink-0">
                    {!notif.read && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleMarkAsRead(notif.id)}
                        className="text-[#00F7FF] hover:text-[#FA00FF]"
                      >
                        Mark read
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(notif.id)}
                      className="text-gray-400 hover:text-[#FA00FF]"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card className="prophet-card p-8 text-center">
              <p className="text-gray-400">No notifications yet</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
