import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Check, X } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

export default function BadgeShop() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedBadge, setSelectedBadge] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>("paypal");

  const { data: badges, isLoading: badgesLoading } = trpc.badges.getShop.useQuery();
  const { data: userBadges, refetch: refetchUserBadges } = trpc.badges.getActiveBadges.useQuery(
    undefined,
    { enabled: !!user }
  );

  const purchaseMutation = trpc.badges.purchaseBadge.useMutation({
    onSuccess: () => {
      toast.success("Badge purchased successfully!");
      setSelectedBadge(null);
      refetchUserBadges();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to purchase badge");
    },
  });

  const handlePurchase = async (badgeId: string) => {
    if (!user) {
      toast.error("Please sign in first");
      return;
    }
    setLocation(`/badge-checkout?badge=${badgeId}`);
  };

  const hasBadge = (badgeId: string) => {
    return userBadges?.some((b: any) => b.badgeType === badgeId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center pt-20">
        <Loader2 size={32} className="animate-spin text-[#00F7FF]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-20 pb-12 font-fredoka">
      <div className="container max-w-6xl mx-auto px-4">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-[#00F7FF]">Badge Shop</h1>
        <p className="text-gray-400 mb-12 text-lg">Upgrade your profile with exclusive badges</p>

        {/* Payment Method Selection */}
        {user && (
          <Card className="bg-gradient-to-r from-[#FA00FF]/10 to-[#00F7FF]/10 border-[#FA00FF]/30 p-6 mb-12">
            <h2 className="text-xl font-bold mb-4 text-[#FA00FF]">Payment Method</h2>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="paypal"
                  checked={paymentMethod === "paypal"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-4 h-4"
                />
                <span>PayPal</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="bank"
                  checked={paymentMethod === "bank"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-4 h-4"
                />
                <span>Bank Transfer</span>
              </label>
            </div>
          </Card>
        )}

        {/* Badges Grid */}
        {badgesLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-[#00F7FF]" size={32} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {badges?.map((badge: any) => {
              const owned = hasBadge(badge.id);
              return (
                <Card
                  key={badge.id}
                  className={`relative overflow-hidden transition-all ${
                    owned
                      ? "bg-gradient-to-br from-[#00F7FF]/20 to-[#FA00FF]/20 border-[#00F7FF] shadow-lg shadow-[#00F7FF]/50"
                      : "bg-gradient-to-br from-[#FA00FF]/10 to-[#00F7FF]/10 border-[#FA00FF]/30 hover:border-[#FA00FF]/50"
                  }`}
                >
                  {owned && (
                    <div className="absolute top-4 right-4 bg-[#00F7FF] text-black px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      <Check size={14} /> Owned
                    </div>
                  )}

                  <div className="p-6">
                    {/* Badge Icon */}
                    <div className="text-6xl mb-4 text-center">{badge.icon}</div>

                    {/* Badge Name */}
                    <h3 className="text-2xl font-bold text-center mb-2">{badge.name}</h3>

                    {/* Price */}
                    <p className="text-center text-2xl font-bold mb-4">
                      <span className="text-[#FA00FF]">${badge.price}</span>
                      <span className="text-sm text-gray-400">/month</span>
                    </p>

                    {/* Badge Type */}
                    <p className="text-center text-gray-400 text-sm mb-6">
                      {badge.id === "pastor" && "Spiritual Leader"}
                      {badge.id === "teacher" && "Knowledge Sharer"}
                      {badge.id === "evangelist" && "Message Spreader"}
                      {badge.id === "apostle" && "Chosen Messenger"}
                      {badge.id === "prophet" && "Divine Messenger"}
                    </p>

                    {/* Purchase Button */}
                    {!user ? (
                      <Button className="w-full bg-[#00F7FF] text-black hover:shadow-lg hover:shadow-[#00F7FF]/50">
                        Sign In to Purchase
                      </Button>
                    ) : owned ? (
                      <Button disabled className="w-full bg-gray-600 text-gray-300">
                        <Check className="mr-2" size={18} />
                        Already Owned
                      </Button>
                      ) : (
                        <Button
                          onClick={() => setLocation(`/badge-checkout?badge=${badge.id}`)}
                          className="w-full bg-[#FA00FF] text-black hover:shadow-lg hover:shadow-[#FA00FF]/50"
                        >
                          Purchase - ${badge.price}/month
                        </Button>
                      )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Info Section */}
        <Card className="bg-black/50 border-[#00F7FF]/20 p-8 mt-12">
          <h2 className="text-2xl font-bold text-[#00F7FF] mb-4">About Badges</h2>
          <div className="space-y-4 text-gray-300">
            <p>
              <span className="text-[#FA00FF] font-bold">Purchasable Badges:</span> Pastor, Teacher, and Evangelist badges cost $5 per month, while Apostle and Prophet badges cost $10 per month. Your subscription will auto-renew monthly.
            </p>
            <p>
              <span className="text-[#FA00FF] font-bold">Permanent Badges:</span> Only members chosen by Prophet Dian receive permanent badges. These badges never expire and are a mark of being part of the church leadership.
            </p>
            <p>
              <span className="text-[#FA00FF] font-bold">Badge Display:</span> Your active badges will appear on your profile and next to your posts in the feed, helping the community recognize your role.
            </p>
            <p>
              <span className="text-[#FA00FF] font-bold">Cancellation:</span> You can cancel your badge subscription at any time. Permanent badges cannot be cancelled.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
