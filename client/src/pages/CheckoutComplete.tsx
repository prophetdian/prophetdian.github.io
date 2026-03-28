import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import { CreditCard, Building2, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface PaymentOption {
  id: "paypal" | "bank_transfer";
  name: string;
  icon: React.ReactNode;
  description: string;
}

export function CheckoutComplete() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedPayment, setSelectedPayment] = useState<"paypal" | "bank_transfer" | null>(null);
  const [loading, setLoading] = useState(false);
  const [orderAmount, setOrderAmount] = useState(500);
  const [orderType, setOrderType] = useState<"navi" | "badge">("navi");

  const createPayPalOrderMutation = trpc.payments.createPayPalOrder.useMutation();
  const createBankTransferMutation = trpc.payments.createBankTransfer.useMutation();

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Please log in to proceed with payment</p>
          <Button onClick={() => setLocation("/")} className="bg-[#00F7FF] text-black">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  const paymentOptions: PaymentOption[] = [
    {
      id: "paypal",
      name: "PayPal",
      icon: <CreditCard size={32} className="text-blue-500" />,
      description: "Fast and secure payment with PayPal",
    },
    {
      id: "bank_transfer",
      name: "Bank Transfer",
      icon: <Building2 size={32} className="text-green-500" />,
      description: "Direct bank transfer to our account",
    },
  ];

  const handlePayPalPayment = async () => {
    try {
      setLoading(true);
      const result = await createPayPalOrderMutation.mutateAsync({
        amount: orderAmount,
        type: orderType,
      });

      if (result.approvalUrl) {
        window.location.href = result.approvalUrl;
      } else {
        toast.error("Failed to create PayPal order");
      }
    } catch (error) {
      toast.error("Payment failed. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleBankTransferPayment = async () => {
    try {
      setLoading(true);
      const result = await createBankTransferMutation.mutateAsync({
        amount: orderAmount,
        type: orderType,
      });

      if (result.success) {
        toast.success("Bank transfer details sent to your email");
        setLocation("/payment-status");
      } else {
        toast.error("Failed to create bank transfer order");
      }
    } catch (error) {
      toast.error("Payment setup failed. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pt-8 pb-20">
      <div className="container max-w-2xl mx-auto px-4">
        <h1 className="text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-[#00F7FF] to-[#FA00FF]">
          Complete Your Purchase
        </h1>
        <p className="text-gray-400 mb-8">Choose your payment method to proceed</p>

        <Card className="bg-gradient-to-br from-[#FA00FF]/10 to-[#00F7FF]/10 border-2 border-[#FA00FF]/30 p-6 mb-8">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">
                {orderType === "navi" ? "Navi Society Monthly Access" : "Badge Purchase"}
              </span>
              <span className="text-2xl font-bold text-[#00F7FF]">${orderAmount}</span>
            </div>
            <div className="border-t border-[#FA00FF]/30 pt-4">
              <p className="text-xs text-gray-400 mb-2">Order Details:</p>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Auto-renewal: Monthly</li>
                <li>• Cancel anytime from your account</li>
                <li>• Instant access upon payment confirmation</li>
              </ul>
            </div>
          </div>
        </Card>

        <div className="space-y-4 mb-8">
          <h2 className="text-xl font-bold mb-4">Select Payment Method</h2>
          {paymentOptions.map((option) => (
            <Card
              key={option.id}
              onClick={() => setSelectedPayment(option.id)}
              className={`p-6 cursor-pointer transition-all ${
                selectedPayment === option.id
                  ? "bg-gradient-to-br from-[#FA00FF]/20 to-[#00F7FF]/20 border-2 border-[#00F7FF]"
                  : "bg-gradient-to-br from-[#FA00FF]/10 to-[#00F7FF]/10 border-2 border-[#FA00FF]/30 hover:border-[#FA00FF]/50"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="mt-1">{option.icon}</div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-1">{option.name}</h3>
                  <p className="text-sm text-gray-400">{option.description}</p>
                </div>
                {selectedPayment === option.id && (
                  <CheckCircle size={24} className="text-[#00F7FF]" />
                )}
              </div>
            </Card>
          ))}
        </div>

        {selectedPayment === "bank_transfer" && (
          <Card className="bg-gradient-to-br from-[#FA00FF]/10 to-[#00F7FF]/10 border-2 border-[#FA00FF]/30 p-6 mb-8">
            <div className="flex gap-3 mb-4">
              <AlertCircle size={20} className="text-yellow-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-300">
                Bank transfer details will be sent to your email after you proceed. Please complete the transfer within 48 hours.
              </p>
            </div>
          </Card>
        )}

        <div className="flex gap-4">
          <Button
            onClick={() => setLocation("/")}
            variant="outline"
            className="flex-1 border-[#FA00FF]/30 text-gray-300 hover:bg-[#FA00FF]/10"
          >
            Cancel
          </Button>
          <Button
            onClick={
              selectedPayment === "paypal" ? handlePayPalPayment : handleBankTransferPayment
            }
            disabled={!selectedPayment || loading}
            className="flex-1 bg-gradient-to-r from-[#00F7FF] to-[#FA00FF] text-black font-bold hover:opacity-90"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              `Proceed to ${selectedPayment === "paypal" ? "PayPal" : "Bank Transfer"}`
            )}
          </Button>
        </div>

        <div className="mt-8 text-center text-xs text-gray-500">
          <p>🔒 Your payment information is secure and encrypted</p>
        </div>
      </div>
    </div>
  );
}

export default CheckoutComplete;
