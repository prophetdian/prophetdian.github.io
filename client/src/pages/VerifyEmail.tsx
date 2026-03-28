import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function VerifyEmail() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [isLoading, setIsLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300);

  useEffect(() => {
    if (step === "code" && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, step]);

  const handleSendCode = async () => {
    if (!email) {
      toast.error("Please enter your email");
      return;
    }
    setIsLoading(true);
    // Simulate sending verification code
    setTimeout(() => {
      setStep("code");
      setTimeLeft(300);
      setIsLoading(false);
      toast.success("Verification code sent to your email");
    }, 1500);
  };

  const handleVerifyCode = async () => {
    if (!code || code.length !== 6) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }
    setIsLoading(true);
    // Simulate code verification
    setTimeout(() => {
      setVerified(true);
      setIsLoading(false);
      toast.success("Email verified successfully!");
    }, 1500);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (verified) {
    return (
      <div className="min-h-screen bg-[#000000] text-white flex items-center justify-center">
        <Card className="prophet-card p-8 max-w-md w-full text-center">
          <CheckCircle size={64} className="mx-auto mb-4 text-[#00F7FF]" />
          <h1 className="text-2xl font-bold mb-2">Email Verified!</h1>
          <p className="text-gray-400 mb-6">Your email has been successfully verified.</p>
          <Button className="w-full bg-gradient-to-r from-[#00F7FF] to-[#FA00FF] text-black hover:shadow-lg hover:shadow-[#FA00FF]/50">
            Continue to Platform
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#000000] text-white flex items-center justify-center p-4">
      <Card className="prophet-card p-8 max-w-md w-full">
        <div className="flex justify-center mb-6">
          <Mail size={48} className="text-[#00F7FF]" />
        </div>

        <h1 className="text-2xl font-bold text-center mb-2">Verify Your Email</h1>
        <p className="text-gray-400 text-center mb-6">
          {step === "email"
            ? "Enter your email to receive a verification code"
            : "Enter the 6-digit code sent to your email"}
        </p>

        {step === "email" ? (
          <div className="space-y-4">
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-black/50 border-[#00F7FF]/30 text-white placeholder-gray-600"
            />
            <Button
              onClick={handleSendCode}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#00F7FF] to-[#FA00FF] text-black hover:shadow-lg hover:shadow-[#FA00FF]/50"
            >
              {isLoading ? "Sending..." : "Send Code"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Input
                type="text"
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.slice(0, 6))}
                maxLength={6}
                className="bg-black/50 border-[#00F7FF]/30 text-white placeholder-gray-600 text-center text-2xl tracking-widest"
              />
              <p className="text-xs text-gray-500 mt-2">
                Code expires in {formatTime(timeLeft)}
              </p>
            </div>

            <Button
              onClick={handleVerifyCode}
              disabled={isLoading || code.length !== 6}
              className="w-full bg-gradient-to-r from-[#00F7FF] to-[#FA00FF] text-black hover:shadow-lg hover:shadow-[#FA00FF]/50"
            >
              {isLoading ? "Verifying..." : "Verify Code"}
            </Button>

            <Button
              onClick={() => {
                setStep("email");
                setCode("");
              }}
              variant="outline"
              className="w-full text-[#00F7FF] border-[#00F7FF]/30 hover:bg-[#00F7FF]/10"
            >
              Back
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
