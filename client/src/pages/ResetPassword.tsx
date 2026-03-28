import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, CheckCircle, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function ResetPassword() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<"email" | "code" | "password" | "success">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendReset = async () => {
    if (!email) {
      toast.error("Please enter your email");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setStep("code");
      setIsLoading(false);
      toast.success("Reset code sent to your email");
    }, 1500);
  };

  const handleVerifyCode = async () => {
    if (!code || code.length !== 6) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setStep("password");
      setIsLoading(false);
      toast.success("Code verified");
    }, 1500);
  };

  const handleResetPassword = async () => {
    if (!password || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setStep("success");
      setIsLoading(false);
      toast.success("Password reset successfully!");
    }, 1500);
  };

  if (step === "success") {
    return (
      <div className="min-h-screen bg-[#000000] text-white flex items-center justify-center">
        <Card className="prophet-card p-8 max-w-md w-full text-center">
          <CheckCircle size={64} className="mx-auto mb-4 text-[#00F7FF]" />
          <h1 className="text-2xl font-bold mb-2">Password Reset!</h1>
          <p className="text-gray-400 mb-6">Your password has been successfully reset.</p>
          <Button
            onClick={() => setLocation("/")}
            className="w-full bg-gradient-to-r from-[#00F7FF] to-[#FA00FF] text-black hover:shadow-lg hover:shadow-[#FA00FF]/50"
          >
            Back to Login
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#000000] text-white flex items-center justify-center p-4">
      <Card className="prophet-card p-8 max-w-md w-full">
        <div className="flex justify-center mb-6">
          <Lock size={48} className="text-[#FA00FF]" />
        </div>

        <h1 className="text-2xl font-bold text-center mb-2">Reset Password</h1>
        <p className="text-gray-400 text-center mb-6">
          {step === "email" && "Enter your email to receive a reset code"}
          {step === "code" && "Enter the 6-digit code sent to your email"}
          {step === "password" && "Create a new password"}
        </p>

        <div className="space-y-4">
          {step === "email" && (
            <>
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-black/50 border-[#00F7FF]/30 text-white placeholder-gray-600"
              />
              <Button
                onClick={handleSendReset}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-[#00F7FF] to-[#FA00FF] text-black hover:shadow-lg hover:shadow-[#FA00FF]/50"
              >
                {isLoading ? "Sending..." : "Send Reset Code"}
              </Button>
            </>
          )}

          {step === "code" && (
            <>
              <Input
                type="text"
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.slice(0, 6))}
                maxLength={6}
                className="bg-black/50 border-[#00F7FF]/30 text-white placeholder-gray-600 text-center text-2xl tracking-widest"
              />
              <Button
                onClick={handleVerifyCode}
                disabled={isLoading || code.length !== 6}
                className="w-full bg-gradient-to-r from-[#00F7FF] to-[#FA00FF] text-black hover:shadow-lg hover:shadow-[#FA00FF]/50"
              >
                {isLoading ? "Verifying..." : "Verify Code"}
              </Button>
              <Button
                onClick={() => setStep("email")}
                variant="outline"
                className="w-full text-[#00F7FF] border-[#00F7FF]/30 hover:bg-[#00F7FF]/10"
              >
                <ArrowLeft size={16} className="mr-2" />
                Back
              </Button>
            </>
          )}

          {step === "password" && (
            <>
              <Input
                type="password"
                placeholder="New password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-black/50 border-[#00F7FF]/30 text-white placeholder-gray-600"
              />
              <Input
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-black/50 border-[#00F7FF]/30 text-white placeholder-gray-600"
              />
              <p className="text-xs text-gray-500">Password must be at least 8 characters</p>
              <Button
                onClick={handleResetPassword}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-[#00F7FF] to-[#FA00FF] text-black hover:shadow-lg hover:shadow-[#FA00FF]/50"
              >
                {isLoading ? "Resetting..." : "Reset Password"}
              </Button>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
