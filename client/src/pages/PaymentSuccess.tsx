import { useState, useEffect } from "react";
import { useSearchParams } from "wouter";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, Download, Home } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

export default function PaymentSuccess() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [params] = useSearchParams();
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const paypalOrderId = params.token;
  const ordersQuery = trpc.orders.list.useQuery();

  useEffect(() => {
    if (ordersQuery.data && paypalOrderId) {
      const order = ordersQuery.data.find(
        (o: any) => o.items && JSON.parse(o.items).paypalOrderId === paypalOrderId
      );
      if (order) {
        setOrderDetails(order);
      }
      setLoading(false);
    }
  }, [ordersQuery.data, paypalOrderId]);

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Please log in to view payment details</p>
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
        <div className="text-center mb-12">
          <div className="mb-8 flex justify-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-[#00F7FF] to-[#FA00FF] flex items-center justify-center animate-pulse">
              <CheckCircle size={48} className="text-black" />
            </div>
          </div>

          <h1 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-[#FA00FF] to-[#00F7FF]">
            Payment Successful!
          </h1>

          <p className="text-gray-400 mb-8 text-lg">
            Thank you for your purchase. Your subscription is now active.
          </p>
        </div>

        {/* Order Details */}
        <Card className="bg-gradient-to-br from-[#FA00FF]/10 to-[#00F7FF]/10 border-2 border-[#FA00FF]/30 p-8 mb-8">
          <div className="space-y-6">
            <div>
              <p className="text-gray-400 text-sm mb-2">Order Number</p>
              <p className="text-2xl font-bold text-[#00F7FF]">
                {orderDetails?.orderNumber || "Processing..."}
              </p>
            </div>

            <div className="border-t border-[#FA00FF]/30 pt-6">
              <p className="text-gray-400 text-sm mb-2">Subscription Type</p>
              <p className="text-xl font-semibold text-white capitalize">
                {orderDetails && JSON.parse(orderDetails.items).type === "navi"
                  ? "Navi Society Monthly"
                  : `${JSON.parse(orderDetails?.items || "{}").badgeType} Badge`}
              </p>
            </div>

            <div className="border-t border-[#FA00FF]/30 pt-6">
              <p className="text-gray-400 text-sm mb-2">Amount Paid</p>
              <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#00F7FF] to-[#FA00FF]">
                ${(parseFloat(orderDetails?.totalAmount || "0") / 100).toFixed(2)}
              </p>
            </div>

            <div className="border-t border-[#FA00FF]/30 pt-6">
              <p className="text-gray-400 text-sm mb-2">Payment Method</p>
              <p className="text-lg text-white capitalize">
                {orderDetails?.paymentMethod?.replace("-", " ")}
              </p>
            </div>

            <div className="border-t border-[#FA00FF]/30 pt-6">
              <p className="text-gray-400 text-sm mb-2">Renewal Date</p>
              <p className="text-lg text-white">
                {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
              </p>
            </div>

            <div className="bg-[#00F7FF]/10 border border-[#00F7FF]/30 rounded-lg p-4 mt-6">
              <p className="text-sm text-gray-300">
                ✓ A confirmation email has been sent to your registered email address
              </p>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            onClick={() => setLocation("/payment-status")}
            variant="outline"
            className="flex-1 border-[#FA00FF]/30 text-gray-300 hover:bg-[#FA00FF]/10"
          >
            <Download size={18} className="mr-2" />
            View Orders
          </Button>
          <Button
            onClick={() =>
              setLocation(
                orderDetails && JSON.parse(orderDetails.items).type === "navi"
                  ? "/navi-society"
                  : "/profile"
              )
            }
            className="flex-1 bg-gradient-to-r from-[#00F7FF] to-[#FA00FF] text-black font-bold hover:opacity-90"
          >
            <Home size={18} className="mr-2" />
            Go to Dashboard
          </Button>
        </div>

        {/* Info Box */}
        <Card className="bg-gradient-to-br from-[#FA00FF]/10 to-[#00F7FF]/10 border-2 border-[#FA00FF]/30 p-6 mt-8">
          <h3 className="text-lg font-semibold text-white mb-4">What's Next?</h3>
          <ul className="space-y-3 text-sm text-gray-300">
            <li>✓ Your subscription is active immediately</li>
            <li>✓ Check your email for confirmation and receipt</li>
            <li>✓ You can manage your subscription from your profile</li>
            <li>✓ Your subscription will auto-renew on the renewal date</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
