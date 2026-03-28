import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Loader2, Lock, CreditCard, Building2, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";

export default function NaviCheckout() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [paymentMethod, setPaymentMethod] = useState<"paypal" | "bank" | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  // PayPal payment mutation
  const paypalMutation = trpc.payments.createPayPalOrder.useMutation({
    onSuccess: (data) => {
      if (data.approvalUrl) {
        window.location.href = data.approvalUrl;
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create PayPal order");
      setIsProcessing(false);
    },
  });

  // Bank transfer mutation
  const bankMutation = trpc.payments.createBankTransfer.useMutation({
    onSuccess: () => {
      toast.success("Bank transfer details sent to your email");
      setLocation("/navi-society");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create bank transfer");
      setIsProcessing(false);
    },
  });

  const handlePayPalPayment = async () => {
    if (!agreeToTerms) {
      toast.error("Please agree to the terms and conditions");
      return;
    }
    setIsProcessing(true);
    paypalMutation.mutate();
  };

  const handleBankTransfer = async () => {
    if (!agreeToTerms) {
      toast.error("Please agree to the terms and conditions");
      return;
    }
    setIsProcessing(true);
    bankMutation.mutate();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Please log in to subscribe</p>
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
      <div className="container max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-[#00F7FF] to-[#FA00FF]">
            Subscribe to Navi Society
          </h1>
          <p className="text-gray-400 text-lg">Exclusive access to Prophet Dian's private prophetic messages</p>
        </div>

        {/* Pricing Card */}
        <Card className="bg-gradient-to-br from-[#FA00FF]/10 to-[#00F7FF]/10 border-[#FA00FF]/30 p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Navi Society Membership</h2>
              <p className="text-gray-400 mt-1">Monthly subscription</p>
            </div>
            <Lock className="text-[#FA00FF]" size={40} />
          </div>

          <div className="bg-black/50 rounded-lg p-6 mb-6 border border-[#00F7FF]/20">
            <p className="text-4xl font-bold text-[#FA00FF] mb-2">$500</p>
            <p className="text-gray-400">per month • Cancel anytime</p>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 text-gray-300">
              <Check className="text-[#00F7FF]" size={20} />
              <span>Private prophetic posts from Prophet Dian</span>
            </div>
            <div className="flex items-center gap-3 text-gray-300">
              <Check className="text-[#00F7FF]" size={20} />
              <span>Exclusive divine revelations and insights</span>
            </div>
            <div className="flex items-center gap-3 text-gray-300">
              <Check className="text-[#00F7FF]" size={20} />
              <span>Direct spiritual guidance and wisdom</span>
            </div>
            <div className="flex items-center gap-3 text-gray-300">
              <Check className="text-[#00F7FF]" size={20} />
              <span>Access to exclusive member community</span>
            </div>
          </div>
        </Card>

        {/* Payment Methods */}
        {!paymentMethod ? (
          <div className="space-y-4">
            <p className="text-center text-gray-400 mb-6">Choose your payment method</p>

            <Button
              onClick={() => setPaymentMethod("paypal")}
              className="w-full h-20 bg-gradient-to-r from-[#003087] to-[#009cde] text-white hover:shadow-lg hover:shadow-blue-500/50 flex items-center justify-center gap-3 font-semibold text-lg"
            >
              <CreditCard size={24} />
              Pay with PayPal
            </Button>

            <Button
              onClick={() => setPaymentMethod("bank")}
              className="w-full h-20 bg-gradient-to-r from-[#1a1a1a] to-[#2a2a2a] text-white hover:shadow-lg hover:shadow-[#00F7FF]/50 border-2 border-[#00F7FF]/30 flex items-center justify-center gap-3 font-semibold text-lg"
            >
              <Building2 size={24} />
              Bank Transfer
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Payment Details */}
            {paymentMethod === "paypal" && (
              <Card className="bg-black/50 border-[#00F7FF]/30 p-6">
                <h3 className="text-xl font-bold mb-4 text-[#00F7FF]">PayPal Payment</h3>
                <p className="text-gray-400 mb-6">
                  You will be redirected to PayPal to complete your payment securely. Your subscription will activate immediately after payment confirmation.
                </p>
              </Card>
            )}

            {paymentMethod === "bank" && (
              <Card className="bg-black/50 border-[#00F7FF]/30 p-6">
                <h3 className="text-xl font-bold mb-4 text-[#00F7FF]">Bank Transfer</h3>
                <p className="text-gray-400 mb-4">
                  Bank transfer details will be sent to your email. Your subscription will activate once we receive and verify your payment.
                </p>
                <div className="bg-black/50 rounded-lg p-4 border border-[#FA00FF]/20 text-sm text-gray-300">
                  <p className="mb-2"><strong>Transfer Amount:</strong> $500 USD</p>
                  <p className="mb-2"><strong>Account Email:</strong> iamdiangrobbelaar@gmail.com</p>
                  <p><strong>Reference:</strong> Your account email will be provided</p>
                </div>
              </Card>
            )}

            {/* Terms and Conditions */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-[#00F7FF]/30 bg-black/50 cursor-pointer"
              />
              <label className="text-sm text-gray-400 cursor-pointer">
                I agree to the subscription terms. This is a recurring monthly charge of $500. I can cancel anytime from my account settings.
              </label>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={paymentMethod === "paypal" ? handlePayPalPayment : handleBankTransfer}
                disabled={!agreeToTerms || isProcessing}
                className="w-full bg-gradient-to-r from-[#00F7FF] to-[#FA00FF] text-black hover:shadow-lg hover:shadow-[#FA00FF]/50 py-6 text-lg font-semibold"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={20} />
                    Processing...
                  </>
                ) : (
                  `Continue with ${paymentMethod === "paypal" ? "PayPal" : "Bank Transfer"}`
                )}
              </Button>

              <Button
                onClick={() => setPaymentMethod(null)}
                variant="outline"
                className="w-full border-[#FA00FF]/30 text-[#FA00FF] hover:bg-[#FA00FF]/10"
              >
                Back to Payment Methods
              </Button>

              <Button
                onClick={() => setLocation("/navi-society")}
                variant="outline"
                className="w-full border-gray-500 text-gray-400 hover:bg-gray-500/10"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Security Note */}
        <div className="mt-8 p-4 bg-black/50 border border-[#00F7FF]/20 rounded-lg text-center text-sm text-gray-400">
          <p>🔒 Your payment information is secure and encrypted</p>
        </div>
      </div>
    </div>
  );
}
