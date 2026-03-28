import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import {
  Calendar,
  CreditCard,
  Download,
  Eye,
  Zap,
  AlertCircle,
  CheckCircle,
  Clock,
  X,
} from "lucide-react";
import { toast } from "sonner";

export default function SubscriptionsDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // Query subscriptions
  const naviQuery = trpc.subscriptions.getNaviSubscription.useQuery();
  const badgesQuery = trpc.subscriptions.getBadgeSubscriptions.useQuery();
  const ordersQuery = trpc.orders.list.useQuery();

  const cancelSubscriptionMutation = trpc.subscriptions.cancelSubscription.useMutation();
  const pauseSubscriptionMutation = trpc.subscriptions.pauseSubscription.useMutation();

  const handleCancelSubscription = async (subscriptionId: string, type: "navi" | "badge") => {
    setCancellingId(subscriptionId);
    try {
      await cancelSubscriptionMutation.mutateAsync({
        subscriptionId,
        type,
      });
      toast.success("Subscription cancelled successfully");
      naviQuery.refetch();
      badgesQuery.refetch();
    } catch (error) {
      toast.error("Failed to cancel subscription");
      console.error(error);
    } finally {
      setCancellingId(null);
    }
  };

  const handlePauseSubscription = async (subscriptionId: string, type: "navi" | "badge") => {
    try {
      await pauseSubscriptionMutation.mutateAsync({
        subscriptionId,
        type,
      });
      toast.success("Subscription paused successfully");
      naviQuery.refetch();
      badgesQuery.refetch();
    } catch (error) {
      toast.error("Failed to pause subscription");
      console.error(error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Please log in to view subscriptions</p>
          <Button onClick={() => setLocation("/")} className="bg-[#00F7FF] text-black">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  const naviSubscription = naviQuery.data?.[0];
  const badgeSubscriptions = badgesQuery.data || [];
  const orders = ordersQuery.data || [];

  return (
    <div className="min-h-screen bg-black text-white pt-20 pb-20">
      <div className="container max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-[#00F7FF] to-[#FA00FF]">
          My Subscriptions
        </h1>
        <p className="text-gray-400 mb-8">Manage your active subscriptions and billing</p>

        {/* Active Subscriptions */}
        <div className="space-y-6 mb-12">
          {/* Navi Society Subscription */}
          {naviSubscription && naviSubscription.status === "active" && (
            <Card className="bg-gradient-to-br from-[#FA00FF]/10 to-[#00F7FF]/10 border-2 border-[#FA00FF]/30 p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#00F7FF] to-[#FA00FF] flex items-center justify-center">
                    <Eye size={24} className="text-black" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">Navi Society</h3>
                    <p className="text-sm text-gray-400">Exclusive prophetic content</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={24} className="text-[#00F7FF]" />
                  <span className="text-sm font-semibold text-[#00F7FF]">Active</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-[#FA00FF]/30">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Monthly Price</p>
                  <p className="text-2xl font-bold text-[#00F7FF]">$500</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Renewal Date</p>
                  <p className="text-lg font-semibold text-white">
                    {new Date(naviSubscription.renewalDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => handlePauseSubscription(naviSubscription.id, "navi")}
                  variant="outline"
                  className="flex-1 border-[#FA00FF]/30 text-gray-300 hover:bg-[#FA00FF]/10"
                >
                  <Clock size={18} className="mr-2" />
                  Pause
                </Button>
                <Button
                  onClick={() => handleCancelSubscription(naviSubscription.id, "navi")}
                  disabled={cancellingId === naviSubscription.id}
                  variant="outline"
                  className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10"
                >
                  <X size={18} className="mr-2" />
                  Cancel
                </Button>
              </div>
            </Card>
          )}

          {/* Badge Subscriptions */}
          {badgeSubscriptions.map((badge: any) => (
            <Card
              key={badge.id}
              className="bg-gradient-to-br from-[#FA00FF]/10 to-[#00F7FF]/10 border-2 border-[#FA00FF]/30 p-6"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#00F7FF] to-[#FA00FF] flex items-center justify-center">
                    <Zap size={24} className="text-black" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1 capitalize">
                      {badge.badgeType} Badge
                    </h3>
                    <p className="text-sm text-gray-400">Monthly subscription</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={24} className="text-[#00F7FF]" />
                  <span className="text-sm font-semibold text-[#00F7FF]">Active</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-[#FA00FF]/30">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Monthly Price</p>
                  <p className="text-2xl font-bold text-[#00F7FF]">$5-$10</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Renewal Date</p>
                  <p className="text-lg font-semibold text-white">
                    {new Date(badge.renewalDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => handlePauseSubscription(badge.id, "badge")}
                  variant="outline"
                  className="flex-1 border-[#FA00FF]/30 text-gray-300 hover:bg-[#FA00FF]/10"
                >
                  <Clock size={18} className="mr-2" />
                  Pause
                </Button>
                <Button
                  onClick={() => handleCancelSubscription(badge.id, "badge")}
                  disabled={cancellingId === badge.id}
                  variant="outline"
                  className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10"
                >
                  <X size={18} className="mr-2" />
                  Cancel
                </Button>
              </div>
            </Card>
          ))}

          {!naviSubscription && badgeSubscriptions.length === 0 && (
            <Card className="bg-gradient-to-br from-[#FA00FF]/10 to-[#00F7FF]/10 border-2 border-[#FA00FF]/30 p-8 text-center">
              <AlertCircle size={48} className="mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold text-white mb-2">No Active Subscriptions</h3>
              <p className="text-gray-400 mb-6">
                You don't have any active subscriptions yet. Explore our offerings!
              </p>
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={() => setLocation("/navi-society-checkout")}
                  className="bg-gradient-to-r from-[#00F7FF] to-[#FA00FF] text-black font-bold"
                >
                  Subscribe to Navi Society
                </Button>
                <Button
                  onClick={() => setLocation("/badge-shop")}
                  variant="outline"
                  className="border-[#FA00FF]/30 text-gray-300"
                >
                  Browse Badges
                </Button>
              </div>
            </Card>
          )}
        </div>

        {/* Payment Methods */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-white">Payment Methods</h2>
          <Card className="bg-gradient-to-br from-[#FA00FF]/10 to-[#00F7FF]/10 border-2 border-[#FA00FF]/30 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <CreditCard size={32} className="text-[#00F7FF]" />
                <div>
                  <h3 className="text-lg font-semibold text-white">PayPal</h3>
                  <p className="text-sm text-gray-400">Primary payment method</p>
                </div>
              </div>
              <Button
                onClick={() => setLocation("/payment-methods")}
                variant="outline"
                className="border-[#FA00FF]/30 text-gray-300"
              >
                Manage
              </Button>
            </div>
          </Card>
        </div>

        {/* Order History */}
        <div>
          <h2 className="text-2xl font-bold mb-6 text-white">Order History</h2>
          <div className="space-y-4">
            {orders.slice(0, 5).map((order: any) => (
              <Card
                key={order.id}
                className="bg-gradient-to-br from-[#FA00FF]/10 to-[#00F7FF]/10 border-2 border-[#FA00FF]/30 p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Order #{order.orderNumber}</p>
                    <p className="text-lg font-semibold text-white">
                      ${(parseFloat(order.totalAmount) / 100).toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                    <p className={`text-sm font-semibold ${
                      order.status === "completed"
                        ? "text-[#00F7FF]"
                        : order.status === "pending"
                        ? "text-yellow-400"
                        : "text-red-400"
                    }`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          {orders.length === 0 && (
            <Card className="bg-gradient-to-br from-[#FA00FF]/10 to-[#00F7FF]/10 border-2 border-[#FA00FF]/30 p-6 text-center">
              <p className="text-gray-400">No orders yet</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
