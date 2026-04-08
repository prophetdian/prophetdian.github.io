import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

interface BankTransferCheckoutProps {
  amount: number;
  type: "badge" | "navi";
  badgeType?: string;
  onSuccess?: () => void;
}

export default function BankTransferCheckout({
  amount,
  type,
  badgeType,
  onSuccess,
}: BankTransferCheckoutProps) {
  const [copied, setCopied] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createOrderMutation = trpc.orders.create.useMutation();

  const bankDetails = {
    accountName: "Prophet Dian Ministry",
    accountNumber: "1234567890",
    bankName: "PayPal Bank",
    routingNumber: "021000021",
    swiftCode: "PBNAUS33",
    reference: `PROPHET-${Date.now()}`,
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success(`${label} copied to clipboard`);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmitTransfer = async () => {
    if (!referenceNumber.trim()) {
      toast.error("Please enter your bank transfer reference number");
      return;
    }

    setIsSubmitting(true);
    try {
      await createOrderMutation.mutateAsync({
        type,
        amount: amount.toString(),
        paymentMethod: "bank_transfer",
        badgeType: badgeType || undefined,
        bankTransferReference: referenceNumber,
      });

      toast.success("Bank transfer recorded! Your order is pending confirmation.");
      setReferenceNumber("");
      onSuccess?.();
    } catch (error) {
      toast.error("Failed to process bank transfer");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white py-8">
      <div className="container max-w-2xl">
        <h1 className="text-4xl font-bold mb-8">Bank Transfer Payment</h1>

        <Card className="p-8 bg-gray-900 border-gray-800 mb-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Order Summary</h2>
            <div className="space-y-2 text-gray-300">
              <p>
                <span className="text-white font-semibold">Type:</span>{" "}
                {type === "badge" ? `Badge - ${badgeType}` : "Navi Society Subscription"}
              </p>
              <p>
                <span className="text-white font-semibold">Amount:</span> ${amount.toFixed(2)} USD
              </p>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-8">
            <h2 className="text-2xl font-bold mb-6">Bank Transfer Details</h2>

            <div className="space-y-4 mb-8">
              <div className="bg-gray-800 p-4 rounded">
                <label className="text-sm text-gray-400">Account Name</label>
                <div className="flex justify-between items-center mt-2">
                  <p className="font-mono text-white">{bankDetails.accountName}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(bankDetails.accountName, "Account name")}
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </Button>
                </div>
              </div>

              <div className="bg-gray-800 p-4 rounded">
                <label className="text-sm text-gray-400">Bank Name</label>
                <div className="flex justify-between items-center mt-2">
                  <p className="font-mono text-white">{bankDetails.bankName}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(bankDetails.bankName, "Bank name")}
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </Button>
                </div>
              </div>

              <div className="bg-gray-800 p-4 rounded">
                <label className="text-sm text-gray-400">Account Number</label>
                <div className="flex justify-between items-center mt-2">
                  <p className="font-mono text-white">{bankDetails.accountNumber}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(bankDetails.accountNumber, "Account number")}
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </Button>
                </div>
              </div>

              <div className="bg-gray-800 p-4 rounded">
                <label className="text-sm text-gray-400">Routing Number</label>
                <div className="flex justify-between items-center mt-2">
                  <p className="font-mono text-white">{bankDetails.routingNumber}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(bankDetails.routingNumber, "Routing number")}
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </Button>
                </div>
              </div>

              <div className="bg-gray-800 p-4 rounded">
                <label className="text-sm text-gray-400">SWIFT Code</label>
                <div className="flex justify-between items-center mt-2">
                  <p className="font-mono text-white">{bankDetails.swiftCode}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(bankDetails.swiftCode, "SWIFT code")}
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </Button>
                </div>
              </div>

              <div className="bg-yellow-900 border border-yellow-700 p-4 rounded">
                <label className="text-sm text-yellow-300">Reference (Required)</label>
                <p className="font-mono text-yellow-100 mt-2">{bankDetails.reference}</p>
                <p className="text-xs text-yellow-200 mt-2">
                  ⚠️ Please include this reference in your bank transfer memo/description
                </p>
              </div>
            </div>

            <div className="border-t border-gray-700 pt-8">
              <h3 className="text-xl font-bold mb-4">Confirm Transfer</h3>
              <p className="text-gray-300 mb-6">
                After you've sent the bank transfer with the reference number above, enter your
                bank's transaction reference number below to confirm the payment:
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Your Transfer Reference</label>
                  <Input
                    type="text"
                    placeholder="Enter your bank transaction reference"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    This is the confirmation number from your bank after sending the transfer
                  </p>
                </div>

                <Button
                  onClick={handleSubmitTransfer}
                  disabled={isSubmitting || !referenceNumber.trim()}
                  className="w-full bg-purple-600 hover:bg-purple-700 h-12 text-lg"
                >
                  {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : null}
                  Confirm Bank Transfer
                </Button>
              </div>

              <div className="bg-blue-900 border border-blue-700 p-4 rounded mt-6">
                <p className="text-blue-200 text-sm">
                  ℹ️ Your order will be marked as pending until we receive and verify your bank
                  transfer. This typically takes 1-3 business days.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
