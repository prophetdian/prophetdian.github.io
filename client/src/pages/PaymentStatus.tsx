import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import { Clock, CheckCircle, AlertCircle, Download } from "lucide-react";
import { useState } from "react";

export function PaymentStatus() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [filter, setFilter] = useState<"all" | "pending" | "completed" | "failed">("all");

  // Get user's orders
  const ordersQuery = trpc.orders.getUserOrders.useQuery();

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Please log in to view payment status</p>
          <Button onClick={() => setLocation("/")} className="bg-[#00F7FF] text-black">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="text-green-500" size={24} />;
      case "pending":
        return <Clock className="text-yellow-500" size={24} />;
      case "failed":
        return <AlertCircle className="text-red-500" size={24} />;
      default:
        return <Clock className="text-gray-500" size={24} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-400";
      case "pending":
        return "text-yellow-400";
      case "failed":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  const filteredOrders = ordersQuery.data?.filter((order) => {
    if (filter === "all") return true;
    return order.status === filter;
  }) || [];

  return (
    <div className="min-h-screen bg-black text-white pt-8 pb-20">
      <div className="container max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-[#00F7FF] to-[#FA00FF]">
          Payment Status
        </h1>
        <p className="text-gray-400 mb-8">Track your orders and payments</p>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {["all", "pending", "completed", "failed"].map((status) => (
            <Button
              key={status}
              onClick={() => setFilter(status as any)}
              className={
                filter === status
                  ? "bg-[#00F7FF] text-black"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <Card
                key={order.id}
                className="bg-gradient-to-br from-[#FA00FF]/10 to-[#00F7FF]/10 border-2 border-[#FA00FF]/30 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    {getStatusIcon(order.status)}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">
                        Order #{order.orderNumber}
                      </h3>
                      <p className={`text-sm font-medium ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-[#00F7FF]">
                      ${(order.totalAmount / 100).toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4 pb-4 border-b border-[#FA00FF]/30">
                  <div>
                    <p className="text-gray-400">Payment Method</p>
                    <p className="text-white capitalize">
                      {order.paymentMethod?.replace("_", " ")}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Order Date</p>
                    <p className="text-white">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Shipping Address</p>
                    <p className="text-white text-xs">{order.shippingAddress || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Items</p>
                    <p className="text-white">
                      {order.items ? JSON.parse(order.items as string).length : 0}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-[#FA00FF]/30 text-gray-300 hover:bg-[#FA00FF]/10"
                  >
                    <Download size={16} className="mr-2" />
                    Download Invoice
                  </Button>
                  {order.status === "pending" && (
                    <Button
                      size="sm"
                      className="bg-[#00F7FF] text-black hover:opacity-90"
                    >
                      Complete Payment
                    </Button>
                  )}
                </div>
              </Card>
            ))
          ) : (
            <Card className="bg-gradient-to-br from-[#FA00FF]/10 to-[#00F7FF]/10 border-2 border-[#FA00FF]/30 p-8 text-center">
              <p className="text-gray-400 mb-4">No orders found</p>
              <Button
                onClick={() => setLocation("/checkout")}
                className="bg-[#00F7FF] text-black"
              >
                Start Shopping
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default PaymentStatus;
