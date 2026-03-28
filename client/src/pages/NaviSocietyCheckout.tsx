import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Check, Loader2, ArrowLeft } from "lucide-react";

export default function NaviSocietyCheckout() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<"review" | "payment" | "success">("review");
  const [paymentMethod, setPaymentMethod] = useState<"paypal" | "bank">("paypal");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paypalOrderId, setPaypalOrderId] = useState<string | null>(null);

  const createPayPalOrderMutation = trpc.payments.createPayPalOrder.useMutation();
  const createBankTransferMutation = trpc.payments.createBankTransfer.useMutation();

  const handleCreateOrder = async () => {
    setIsProcessing(true);
    try {
      if (paymentMethod === "paypal") {
        const result = await createPayPalOrderMutation.mutateAsync({
          type: "navi",
          amount: 500,
        });
        if (result.approvalUrl) {
          window.location.href = result.approvalUrl;
        } else {
          toast.error("Failed to create PayPal order");
        }
      } else {
        const result = await createBankTransferMutation.mutateAsync({
          type: "navi",
          amount: 500,
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

  const handleCapturePayment = async () => {
    // This function is no longer needed as PayPal redirects handle capture
  };

  if (step === "review") {
    return (
      <div className="min-h-screen bg-black text-white pt-20 pb-20">
        <div className="container max-w-2xl mx-auto px-4">
          <Button
            onClick={() => setLocation("/navi-society")}
            variant="ghost"
            className="mb-8 text-[#FA00FF] hover:text-[#00F7FF]"
          >
            <ArrowLeft className="mr-2" size={20} />
            Back
          </Button>

          <h1 className="text-4xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-[#FA00FF] to-[#00F7FF]">
            Navi Society Subscription
          </h1>

          <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border-[#FA00FF]/30 mb-8 p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Exclusive Access</h2>
              <p className="text-gray-400">Get unlimited access to Prophet Dian's exclusive prophetic content</p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3">
                <Check className="text-[#00F7FF]" size={24} />
                <span>Daily prophetic messages from Prophet Dian</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="text-[#00F7FF]" size={24} />
                <span>Exclusive video teachings and revelations</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="text-[#00F7FF]" size={24} />
                <span>Private community with other members</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="text-[#00F7FF]" size={24} />
                <span>Monthly prayer sessions and guidance</span>
              </div>
            </div>

            <div className="text-center mb-8 py-6 border-t border-[#FA00FF]/20">
              <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#00F7FF] to-[#FA00FF]">
                $500
              </div>
              <p className="text-gray-400 mt-2">per month • Auto-renews monthly</p>
            </div>

            <div className="space-y-3 mb-8">
              <label className="flex items-center gap-3 p-4 border-2 border-[#00F7FF]/50 rounded-lg cursor-pointer hover:border-[#00F7FF] transition">
                <input
                  type="radio"
                  checked={paymentMethod === "paypal"}
                  onChange={() => setPaymentMethod("paypal")}
                  className="w-4 h-4"
                />
                <span>PayPal</span>
              </label>
              <label className="flex items-center gap-3 p-4 border-2 border-[#FA00FF]/50 rounded-lg cursor-pointer hover:border-[#FA00FF] transition">
                <input
                  type="radio"
                  checked={paymentMethod === "bank"}
                  onChange={() => setPaymentMethod("bank")}
                  className="w-4 h-4"
                />
                <span>Bank Transfer</span>
              </label>
            </div>

            <Button
              onClick={handleCreateOrder}
              disabled={isProcessing}
              className="w-full bg-gradient-to-r from-[#00F7FF] to-[#FA00FF] text-black hover:shadow-xl hover:shadow-[#FA00FF]/50 py-6 text-lg font-bold rounded-lg transition-all"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={20} />
                  Processing...
                </>
              ) : (
                "Complete Purchase"
              )}
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  if (step === "payment") {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center pt-20 pb-20">
        <div className="container max-w-2xl mx-auto px-4 text-center">
          <div className="mb-12">
            <h1 className="text-6xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-[#00F7FF] to-[#FA00FF]">
              $500.00
            </h1>
            <p className="text-gray-400 text-lg">Navi Society Monthly Subscription</p>
          </div>

          <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border-[#FA00FF]/30 p-8 mb-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-4">Payment Method: {paymentMethod.toUpperCase()}</h2>

              {paymentMethod === "paypal" && (
                <div className="bg-[#003087]/20 border border-[#003087]/50 rounded-lg p-6 mb-6">
                  <p className="text-sm text-gray-300 mb-4">
                    You will be redirected to PayPal to complete your payment securely.
                  </p>
                  <p className="text-sm font-semibold text-[#00F7FF]">
                    Amount: $500.00 USD
                  </p>
                </div>
              )}

              {paymentMethod === "bank" && (
                <div className="bg-[#1a5f1a]/20 border border-[#1a5f1a]/50 rounded-lg p-6 mb-6">
                  <p className="text-sm text-gray-300 mb-4">
                    Bank transfer details will be provided after confirming payment.
                  </p>
                  <p className="text-sm font-semibold text-[#00F7FF]">
                    Amount: $500.00 USD
                  </p>
                </div>
              )}
            </div>

            <Button
              onClick={handleCreateOrder}
              disabled={isProcessing}
              className="w-full bg-gradient-to-r from-[#00F7FF] to-[#FA00FF] text-black hover:shadow-xl hover:shadow-[#FA00FF]/50 py-6 text-lg font-bold rounded-lg transition-all mb-3"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={20} />
                  Processing...
                </>
              ) : (
                "Complete Purchase"
              )}
            </Button>

            <Button
              onClick={() => setStep("review")}
              variant="outline"
              className="w-full border-[#FA00FF] text-[#FA00FF] hover:bg-[#FA00FF]/10"
            >
              Back
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-20 pb-20">
      <div className="container max-w-2xl mx-auto px-4">
        <div className="text-center">
          <div className="mb-8 flex justify-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-[#00F7FF] to-[#FA00FF] flex items-center justify-center">
              <Check size={40} className="text-black" />
            </div>
          </div>

          <h1 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-[#FA00FF] to-[#00F7FF]">
            Welcome to Navi Society!
          </h1>

          <p className="text-gray-400 mb-8 text-lg">
            Your subscription is now active. You have unlimited access to exclusive prophetic content.
          </p>

          <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border-[#FA00FF]/30 p-8 mb-8">
            <div className="text-left space-y-4">
              <div>
                <p className="text-gray-400 text-sm">Order Confirmation</p>
                <p className="text-xl font-bold text-[#00F7FF]">#{paypalOrderId?.slice(0, 12)}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Amount Paid</p>
                <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#00F7FF] to-[#FA00FF]">
                  $500.00 USD
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Renewal Date</p>
                <p className="text-lg text-white">
                  {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                </p>
              </div>
            </div>
          </Card>

          <Button
            onClick={() => setLocation("/navi-society/feed")}
            className="w-full bg-gradient-to-r from-[#00F7FF] to-[#FA00FF] text-black hover:shadow-xl hover:shadow-[#FA00FF]/50 py-6 text-lg font-bold rounded-lg transition-all"
          >
            Enter Navi Society
          </Button>
        </div>
      </div>
    </div>
  );
}
