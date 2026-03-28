import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Calendar, Eye, Award } from "lucide-react";
import { useRouter } from "wouter";
import { toast } from "sonner";

export default function SubscriptionManagement() {
  const { user } = useAuth();
  const [, navigate] = useRouter();
  const [selectedTab, setSelectedTab] = useState<"active" | "history">("active");

  // Fetch active subscriptions
  const { data: naviSubscription, isLoading: naviLoading } = trpc.naviSubscriptions.getActive.useQuery(
    undefined,
    { enabled: !!user }
  );

  const { data: badgeSubscriptions, isLoading: badgesLoading } = trpc.badgeSubscriptions.getActive.useQuery(
    undefined,
    { enabled: !!user }
  );

  // Fetch order history
  const { data: orderHistory, isLoading: ordersLoading } = trpc.orders.getByUser.useQuery(
    undefined,
    { enabled: !!user }
  );

  const cancelSubscription = trpc.subscriptions.cancel.useMutation();

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Card className="bg-[#1a1a1a] border-[#FA00FF]">
          <CardContent className="pt-6">
            <p className="text-center">Please log in to manage your subscriptions</p>
            <Button
              onClick={() => navigate("/")}
              className="w-full mt-4 bg-gradient-to-r from-[#00F7FF] to-[#FA00FF] text-black"
            >
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleCancelSubscription = async (subscriptionId: number, type: "navi" | "badge") => {
    if (confirm("Are you sure you want to cancel this subscription? You will lose access immediately.")) {
      try {
        await cancelSubscription.mutateAsync({ subscriptionId, type });
        toast.success("Subscription cancelled successfully");
      } catch (error) {
        toast.error("Failed to cancel subscription");
      }
    }
  };

  const isLoading = naviLoading || badgesLoading || ordersLoading;

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-[#00F7FF] to-[#FA00FF] bg-clip-text text-transparent">
            Subscription Management
          </h1>
          <p className="text-gray-400">Manage your active subscriptions and billing</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-[#333333]">
          <button
            onClick={() => setSelectedTab("active")}
            className={`pb-4 px-2 font-semibold transition-colors ${
              selectedTab === "active"
                ? "text-[#00F7FF] border-b-2 border-[#00F7FF]"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Active Subscriptions
          </button>
          <button
            onClick={() => setSelectedTab("history")}
            className={`pb-4 px-2 font-semibold transition-colors ${
              selectedTab === "history"
                ? "text-[#00F7FF] border-b-2 border-[#00F7FF]"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Billing History
          </button>
        </div>

        {/* Active Subscriptions Tab */}
        {selectedTab === "active" && (
          <div className="space-y-6">
            {isLoading ? (
              <Card className="bg-[#1a1a1a] border-[#333333]">
                <CardContent className="pt-6">
                  <p className="text-center text-gray-400">Loading subscriptions...</p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Navi Society Subscription */}
                {naviSubscription ? (
                  <Card className="bg-[#1a1a1a] border-[#FA00FF] border-2">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Eye className="w-6 h-6 text-[#FA00FF]" />
                          <div>
                            <CardTitle className="text-[#FA00FF]">Navi Society</CardTitle>
                            <CardDescription>Premium prophetic content access</CardDescription>
                          </div>
                        </div>
                        <Badge className="bg-[#00F7FF] text-black">Active</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-gray-400 text-sm">Price</p>
                          <p className="text-2xl font-bold text-[#FA00FF]">$500/month</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">Status</p>
                          <p className="text-lg font-semibold text-[#00F7FF]">Active</p>
                        </div>
                      </div>

                      <div className="bg-black rounded p-4 border border-[#333333]">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="w-4 h-4 text-[#00F7FF]" />
                          <span className="text-sm text-gray-400">Next Renewal</span>
                        </div>
                        <p className="text-lg font-semibold">
                          {naviSubscription.renewalDate
                            ? new Date(naviSubscription.renewalDate).toLocaleDateString()
                            : "N/A"}
                        </p>
                      </div>

                      <div className="bg-[#FA00FF]/10 border border-[#FA00FF] rounded p-4">
                        <div className="flex gap-2">
                          <AlertCircle className="w-5 h-5 text-[#FA00FF] flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-[#FA00FF]">
                            Your subscription will automatically renew on the renewal date. You can cancel anytime.
                          </p>
                        </div>
                      </div>

                      <Button
                        onClick={() => handleCancelSubscription(naviSubscription.id, "navi")}
                        variant="outline"
                        className="w-full border-red-500 text-red-500 hover:bg-red-500/10"
                        disabled={cancelSubscription.isPending}
                      >
                        {cancelSubscription.isPending ? "Cancelling..." : "Cancel Subscription"}
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="bg-[#1a1a1a] border-[#333333]">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <Eye className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400 mb-4">No active Navi Society subscription</p>
                        <Button
                          onClick={() => navigate("/navi-checkout")}
                          className="bg-gradient-to-r from-[#00F7FF] to-[#FA00FF] text-black"
                        >
                          Subscribe Now
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Badge Subscriptions */}
                {badgeSubscriptions && badgeSubscriptions.length > 0 ? (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-[#00F7FF]">Active Badges</h3>
                    {badgeSubscriptions.map((badge) => (
                      <Card key={badge.id} className="bg-[#1a1a1a] border-[#00F7FF]">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <Award className="w-6 h-6 text-[#00F7FF]" />
                              <div>
                                <CardTitle className="text-[#00F7FF]">{badge.badgeType} Badge</CardTitle>
                                <CardDescription>Premium badge subscription</CardDescription>
                              </div>
                            </div>
                            <Badge className="bg-[#FA00FF] text-black">Active</Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-gray-400 text-sm">Price</p>
                              <p className="text-2xl font-bold text-[#00F7FF]">$5-10/month</p>
                            </div>
                            <div>
                              <p className="text-gray-400 text-sm">Status</p>
                              <p className="text-lg font-semibold text-[#FA00FF]">Active</p>
                            </div>
                          </div>

                          <div className="bg-black rounded p-4 border border-[#333333]">
                            <div className="flex items-center gap-2 mb-2">
                              <Calendar className="w-4 h-4 text-[#FA00FF]" />
                              <span className="text-sm text-gray-400">Next Renewal</span>
                            </div>
                            <p className="text-lg font-semibold">
                              {badge.renewalDate
                                ? new Date(badge.renewalDate).toLocaleDateString()
                                : "N/A"}
                            </p>
                          </div>

                          <Button
                            onClick={() => handleCancelSubscription(badge.id, "badge")}
                            variant="outline"
                            className="w-full border-red-500 text-red-500 hover:bg-red-500/10"
                            disabled={cancelSubscription.isPending}
                          >
                            {cancelSubscription.isPending ? "Cancelling..." : "Cancel Badge"}
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="bg-[#1a1a1a] border-[#333333]">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <Award className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400 mb-4">No active badge subscriptions</p>
                        <Button
                          onClick={() => navigate("/badge-shop")}
                          className="bg-gradient-to-r from-[#00F7FF] to-[#FA00FF] text-black"
                        >
                          Browse Badges
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        )}

        {/* Billing History Tab */}
        {selectedTab === "history" && (
          <div>
            {ordersLoading ? (
              <Card className="bg-[#1a1a1a] border-[#333333]">
                <CardContent className="pt-6">
                  <p className="text-center text-gray-400">Loading order history...</p>
                </CardContent>
              </Card>
            ) : orderHistory && orderHistory.length > 0 ? (
              <div className="space-y-4">
                {orderHistory.map((order) => (
                  <Card key={order.id} className="bg-[#1a1a1a] border-[#333333]">
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-gray-400 text-sm">Order Number</p>
                          <p className="font-mono text-sm">{order.orderNumber}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">Amount</p>
                          <p className="text-lg font-semibold text-[#00F7FF]">
                            ${parseFloat(order.totalAmount.toString()).toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">Status</p>
                          <Badge
                            className={
                              order.status === "completed"
                                ? "bg-[#00F7FF] text-black"
                                : order.status === "pending"
                                  ? "bg-yellow-500 text-black"
                                  : "bg-red-500 text-white"
                            }
                          >
                            {order.status}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">Date</p>
                          <p className="text-sm">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-[#1a1a1a] border-[#333333]">
                <CardContent className="pt-6">
                  <p className="text-center text-gray-400">No order history found</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
