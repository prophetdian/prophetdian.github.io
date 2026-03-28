import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, CreditCard, Banknote } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function Checkout() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [paymentMethod, setPaymentMethod] = useState<"paypal" | "bank-transfer">("paypal");
  const [shippingInfo, setShippingInfo] = useState({
    name: user?.name || "",
    email: user?.email || "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
  });

  const { data: cartItems, isLoading: cartLoading } = trpc.cart.list.useQuery();

  const createOrderMutation = trpc.orders.create.useMutation({
    onSuccess: (result) => {
      toast.success("Order created successfully!");
      // Clear cart
      if (paymentMethod === "paypal") {
        // Redirect to PayPal
        window.location.href = `https://www.paypal.com/checkoutnow?token=order-${Date.now()}`;
      } else {
        // Show bank transfer details
        setLocation("/orders");
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create order");
    },
  });

  const totalAmount = cartItems?.reduce((sum: number, item: any) => sum + (parseFloat(item.productId.toString()) * item.quantity), 0) || 0;

  const handleCheckout = async () => {
    if (!shippingInfo.name || !shippingInfo.address || !shippingInfo.city) {
      toast.error("Please fill in all shipping information");
      return;
    }

    if (!cartItems || cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    createOrderMutation.mutate({
      totalAmount: totalAmount.toFixed(2),
      paymentMethod,
      shippingAddress: JSON.stringify(shippingInfo),
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-xl">Please sign in to checkout</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white py-12">
      <div className="container max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-bold mb-8 text-glow">Checkout</h1>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Shipping & Payment */}
          <div className="md:col-span-2 space-y-6">
            {/* Shipping Information */}
            <Card className="prophet-card">
              <h2 className="text-2xl font-bold mb-4">Shipping Information</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={shippingInfo.name}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, name: e.target.value })}
                  className="w-full bg-black border border-[#00F7FF]/30 rounded-lg px-4 py-2 text-white focus:border-[#00F7FF] focus:outline-none"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={shippingInfo.email}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, email: e.target.value })}
                  className="w-full bg-black border border-[#00F7FF]/30 rounded-lg px-4 py-2 text-white focus:border-[#00F7FF] focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Address"
                  value={shippingInfo.address}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                  className="w-full bg-black border border-[#00F7FF]/30 rounded-lg px-4 py-2 text-white focus:border-[#00F7FF] focus:outline-none"
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="City"
                    value={shippingInfo.city}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                    className="w-full bg-black border border-[#00F7FF]/30 rounded-lg px-4 py-2 text-white focus:border-[#00F7FF] focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={shippingInfo.state}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, state: e.target.value })}
                    className="w-full bg-black border border-[#00F7FF]/30 rounded-lg px-4 py-2 text-white focus:border-[#00F7FF] focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="ZIP Code"
                    value={shippingInfo.zipCode}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, zipCode: e.target.value })}
                    className="w-full bg-black border border-[#00F7FF]/30 rounded-lg px-4 py-2 text-white focus:border-[#00F7FF] focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Country"
                    value={shippingInfo.country}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, country: e.target.value })}
                    className="w-full bg-black border border-[#00F7FF]/30 rounded-lg px-4 py-2 text-white focus:border-[#00F7FF] focus:outline-none"
                  />
                </div>
              </div>
            </Card>

            {/* Payment Method */}
            <Card className="prophet-card">
              <h2 className="text-2xl font-bold mb-4">Payment Method</h2>
              <div className="space-y-3">
                <label className="flex items-center p-4 border border-[#00F7FF]/30 rounded-lg cursor-pointer hover:border-[#00F7FF] transition-colors">
                  <input
                    type="radio"
                    name="payment"
                    value="paypal"
                    checked={paymentMethod === "paypal"}
                    onChange={(e) => setPaymentMethod(e.target.value as "paypal" | "bank-transfer")}
                    className="mr-3"
                  />
                  <CreditCard size={20} className="mr-3 text-[#00F7FF]" />
                  <div>
                    <p className="font-semibold">PayPal</p>
                    <p className="text-sm text-gray-400">Fast and secure payment with PayPal</p>
                  </div>
                </label>

                <label className="flex items-center p-4 border border-[#FA00FF]/30 rounded-lg cursor-pointer hover:border-[#FA00FF] transition-colors">
                  <input
                    type="radio"
                    name="payment"
                    value="bank-transfer"
                    checked={paymentMethod === "bank-transfer"}
                    onChange={(e) => setPaymentMethod(e.target.value as "paypal" | "bank-transfer")}
                    className="mr-3"
                  />
                  <Banknote size={20} className="mr-3 text-[#FA00FF]" />
                  <div>
                    <p className="font-semibold">Bank Transfer</p>
                    <p className="text-sm text-gray-400">Direct bank transfer to our account</p>
                  </div>
                </label>
              </div>

              {paymentMethod === "bank-transfer" && (
                <div className="mt-4 p-4 bg-[#FA00FF]/10 border border-[#FA00FF]/30 rounded-lg">
                  <p className="text-sm font-semibold mb-2">Bank Transfer Details:</p>
                  <p className="text-sm text-gray-300">Please contact us for bank transfer details. We will send you the account information after order confirmation.</p>
                </div>
              )}
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="prophet-card sticky top-24">
              <h2 className="text-2xl font-bold mb-4">Order Summary</h2>
              
              {cartLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 size={24} className="animate-spin text-[#00F7FF]" />
                </div>
              ) : cartItems && cartItems.length > 0 ? (
                <>
                  <div className="space-y-2 mb-4 pb-4 border-b border-[#00F7FF]/20">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>Product #{item.productId} x {item.quantity}</span>
                        <span>$0.00</span>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2 mb-6">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>${totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span>Free</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold pt-2 border-t border-[#00F7FF]/20">
                      <span>Total</span>
                      <span className="text-[#00F7FF]">${totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                  <Button
                    onClick={handleCheckout}
                    disabled={createOrderMutation.isPending}
                    className="w-full bg-[#00F7FF] text-black hover:shadow-lg hover:shadow-[#00F7FF]/50"
                  >
                    {createOrderMutation.isPending ? (
                      <>
                        <Loader2 size={16} className="mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      `Complete Order - $${totalAmount.toFixed(2)}`
                    )}
                  </Button>
                </>
              ) : (
                <p className="text-gray-400">Your cart is empty</p>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
