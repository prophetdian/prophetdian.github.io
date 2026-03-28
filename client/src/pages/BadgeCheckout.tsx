import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import { useSearchParams } from "wouter";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Check, Loader2, ArrowLeft, CreditCard, Building2 } from "lucide-react";
import { useState } from "react";

const BADGE_PRICES: Record<string, number> = {
  pastor: 5,
  teacher: 5,
  evangelist: 5,
  apostle: 10,
  prophet: 10,
};

const BADGE_DESCRIPTIONS: Record<string, string> = {
  pastor: "Pastor Badge - Lead and guide your community",
  teacher: "Teacher Badge - Share knowledge and wisdom",
  evangelist: "Evangelist Badge - Spread the message",
  apostle: "Apostle Badge - Chosen messenger of God",
  prophet: "Prophet Badge - Divine revelations and prophecies",
};

export default function BadgeCheckout() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [params] = useSearchParams();
  const badgeType = params.badge || "pastor";

  const [step, setStep] = useState<"review" | "payment" | "success">("review");
  const [paymentMethod, setPaymentMethod] = useState<"paypal" | "bank">("paypal");
  const [isProcessing, setIsProcessing] = useState(false);

  const createPayPalOrderMutation = trpc.payments.createPayPalOrder.useMutation();
  const createBankTransferMutation = trpc.payments.createBankTransfer.useMutation();

  const price = BADGE_PRICES[badgeType] || 5;
  const description = BADGE_DESCRIPTIONS[badgeType] || "Badge Subscription";

  const handleCreateOrder = async () => {
    setIsProcessing(true);
    try {
      if (paymentMethod === "paypal") {
        const result = await createPayPalOrderMutation.mutateAsync({
          type: "badge",
          badgeType,
          amount: price,
        });
        if (result.approvalUrl) {
          window.location.href = result.approvalUrl;
        } else {
          toast.error("Failed to create PayPal order");
        }
      } else {
        const result = await createBankTransferMutation.mutateAsync({
          type: "badge",
          badgeType,
          amount: price,
        });
        if (result.success) {
          toast.success("Bank transfer details sent to your email");
          setTimeout(() => setLocation("/payment-status"), 2000);
        }
      }
    } catch (error) {
      toast.error("Failed to create order. Please try again.");
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Please log in to purchase a badge</p>
          <Button onClick={() => setLocation("/")} className="bg-[#00F7FF] text-black">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-20 pb-20">
      <div className="container max-w-2xl mx-auto px-4">
        <Button
          onClick={() => setLocation("/badge-shop")}
          variant="ghost"
          className="mb-8 text-[#FA00FF] hover:text-[#00F7FF]"
        >
          <ArrowLeft className="mr-2" size={20} />
          Back to Badges
        </Button>

        <h1 className="text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-[#00F7FF] to-[#FA00FF]">
          Purchase {badgeType.charAt(0).toUpperCase() + badgeType.slice(1)} Badge
        </h1>
        <p className="text-gray-400 mb-8">{description}</p>

        {/* Order Summary */}
        <Card className="bg-gradient-to-br from-[#FA00FF]/10 to-[#00F7FF]/10 border-2 border-[#FA00FF]/30 p-6 mb-8">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Monthly Badge Subscription</span>
              <span className="text-2xl font-bold text-[#00F7FF]">${price}</span>
            </div>
            <div className="border-t border-[#FA00FF]/30 pt-4">
              <p className="text-xs text-gray-400 mb-2">What You Get:</p>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>✓ Display {badgeType} badge on your profile</li>
                <li>✓ Monthly subscription (auto-renews)</li>
                <li>✓ Cancel anytime from your account</li>
                <li>✓ Instant access upon payment</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Payment Method Selection */}
        <div className="space-y-4 mb-8">
          <h2 className="text-xl font-bold mb-4">Select Payment Method</h2>
          
          <Card
            onClick={() => setPaymentMethod("paypal")}
            className={`p-6 cursor-pointer transition-all ${
              paymentMethod === "paypal"
                ? "bg-gradient-to-br from-[#FA00FF]/20 to-[#00F7FF]/20 border-2 border-[#00F7FF]"
                : "bg-gradient-to-br from-[#FA00FF]/10 to-[#00F7FF]/10 border-2 border-[#FA00FF]/30 hover:border-[#FA00FF]/50"
            }`}
          >
            <div className="flex items-start gap-4">
              <CreditCard size={32} className="text-blue-500" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-1">PayPal</h3>
                <p className="text-sm text-gray-400">Fast and secure payment</p>
              </div>
              {paymentMethod === "paypal" && <Check size={24} className="text-[#00F7FF]" />}
            </div>
          </Card>

          <Card
            onClick={() => setPaymentMethod("bank")}
            className={`p-6 cursor-pointer transition-all ${
              paymentMethod === "bank"
                ? "bg-gradient-to-br from-[#FA00FF]/20 to-[#00F7FF]/20 border-2 border-[#00F7FF]"
                : "bg-gradient-to-br from-[#FA00FF]/10 to-[#00F7FF]/10 border-2 border-[#FA00FF]/30 hover:border-[#FA00FF]/50"
            }`}
          >
            <div className="flex items-start gap-4">
              <Building2 size={32} className="text-green-500" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-1">Bank Transfer</h3>
                <p className="text-sm text-gray-400">Direct bank transfer</p>
              </div>
              {paymentMethod === "bank" && <Check size={24} className="text-[#00F7FF]" />}
            </div>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            onClick={() => setLocation("/badge-shop")}
            variant="outline"
            className="flex-1 border-[#FA00FF]/30 text-gray-300 hover:bg-[#FA00FF]/10"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateOrder}
            disabled={isProcessing}
            className="flex-1 bg-gradient-to-r from-[#00F7FF] to-[#FA00FF] text-black font-bold hover:opacity-90"
          >
            {isProcessing ? (
              <>
                <Loader2 size={18} className="mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              `Complete Purchase`
            )}
          </Button>
        </div>

        {/* Security Info */}
        <div className="mt-8 text-center text-xs text-gray-500">
          <p>🔒 Your payment information is secure and encrypted</p>
        </div>

        {/* Info Box */}
        <Card className="bg-gradient-to-br from-[#FA00FF]/10 to-[#00F7FF]/10 border-2 border-[#FA00FF]/30 p-4 mt-8">
          <p className="text-sm text-gray-300">
            After payment is confirmed, you'll be redirected to your profile where your new badge will be displayed.
          </p>
        </Card>
      </div>
    </div>
  );
}
