import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Loader2, Lock, Eye } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";

export default function NaviSociety() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [showSubscribeForm, setShowSubscribeForm] = useState(false);

  // Get subscription status
  const { data: subscription, isLoading: subscriptionLoading } = trpc.naviSociety.getSubscription.useQuery();

  // Subscribe mutation
  const subscribeMutation = trpc.naviSociety.subscribe.useMutation({
    onSuccess: () => {
      toast.success("Welcome to Navi Society!");
      setShowSubscribeForm(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to subscribe");
    },
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Please log in to access Navi Society</p>
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

  if (subscriptionLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Loader2 className="animate-spin text-[#00F7FF]" size={32} />
      </div>
    );
  }

  const isSubscribed = subscription?.status === "active";

  return (
    <div className="min-h-screen bg-black text-white pt-8 md:pt-0 md:ml-24">
      {/* Header */}
      <div className="container py-12 border-b border-[#00F7FF]/20">
        <div className="flex items-center gap-4 mb-4">
          <Eye className="text-[#FA00FF]" size={32} />
          <h1 className="text-4xl md:text-5xl font-bold text-glow">Navi Society</h1>
        </div>
        <p className="text-lg text-gray-300 max-w-2xl">
          Exclusive private room for prophetic secrets and divine revelations. Members only - $500/month
        </p>
      </div>

      {/* Content */}
      <div className="container py-12">
        {!isSubscribed ? (
          // Not Subscribed View
          <div className="max-w-2xl mx-auto">
            <Card className="bg-gradient-to-br from-[#FA00FF]/10 to-[#00F7FF]/10 border-[#FA00FF]/30 p-8 text-center">
              <Lock className="mx-auto mb-4 text-[#FA00FF]" size={48} />
              <h2 className="text-2xl font-bold mb-4">Unlock Navi Society</h2>
              <p className="text-gray-300 mb-6">
                Join our exclusive community and receive private prophetic messages, divine revelations, and spiritual insights directly from Prophet Dian.
              </p>

              <div className="bg-black/50 rounded-lg p-6 mb-6 border border-[#00F7FF]/20">
                <p className="text-3xl font-bold text-[#FA00FF] mb-2">$500/month</p>
                <p className="text-gray-400">Billed monthly • Cancel anytime</p>
              </div>

              <div className="text-left mb-6 space-y-3">
                <p className="flex items-center gap-2 text-gray-300">
                  <span className="text-[#00F7FF]">✓</span> Private prophetic posts
                </p>
                <p className="flex items-center gap-2 text-gray-300">
                  <span className="text-[#00F7FF]">✓</span> Exclusive divine revelations
                </p>
                <p className="flex items-center gap-2 text-gray-300">
                  <span className="text-[#00F7FF]">✓</span> Spiritual insights and guidance
                </p>
                <p className="flex items-center gap-2 text-gray-300">
                  <span className="text-[#00F7FF]">✓</span> Direct access to Prophet Dian's wisdom
                </p>
              </div>

              <Button
                onClick={() => setLocation("/navi-checkout")}
                className="w-full bg-[#FA00FF] text-black hover:shadow-lg hover:shadow-[#FA00FF]/50 py-6 text-lg font-semibold"
              >
                Subscribe Now
              </Button>
            </Card>
          </div>
        ) : (
          // Subscribed View - Redirect to Feed
          <div className="text-center py-12">
            <Eye className="mx-auto mb-4 text-[#FA00FF]" size={48} />
            <h2 className="text-2xl font-bold mb-4 text-[#00F7FF]">Welcome to Navi Society</h2>
            <p className="text-gray-400 mb-8 text-lg max-w-md mx-auto">
              You have access to exclusive prophetic content. Enter the sacred feed to view divine revelations.
            </p>
            <Button
              onClick={() => setLocation("/navi-feed")}
              className="bg-gradient-to-r from-[#00F7FF] to-[#FA00FF] text-black hover:shadow-lg hover:shadow-[#FA00FF]/50 px-8 py-3 font-semibold text-lg"
            >
              <Eye className="mr-2" size={20} />
              Enter Prophetic Feed
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
