import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Mail, Chrome, Apple } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function SocialLogin() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState<"email" | "google" | "apple" | null>(null);

  const handleEmailLogin = async () => {
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Logged in successfully!");
      setLocation("/feed");
    }, 1500);
  };

  const handleGoogleLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Logged in with Google!");
      setLocation("/feed");
    }, 1500);
  };

  const handleAppleLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Logged in with Apple!");
      setLocation("/feed");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#000000] text-white flex items-center justify-center p-4">
      <Card className="prophet-card p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome to Prophet Dian</h1>
          <p className="text-gray-400">Sign in to access the prophetic platform</p>
        </div>

        {!loginMethod ? (
          <div className="space-y-4">
            {/* Social Login Buttons */}
            <Button
              onClick={() => handleGoogleLogin()}
              className="w-full bg-white text-black hover:bg-gray-200 flex items-center justify-center gap-2"
            >
              <Chrome size={18} />
              Continue with Google
            </Button>

            <Button
              onClick={() => handleAppleLogin()}
              className="w-full bg-black border border-white text-white hover:bg-gray-900 flex items-center justify-center gap-2"
            >
              <Apple size={18} />
              Continue with Apple
            </Button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#00F7FF]/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[#000000] text-gray-400">Or</span>
              </div>
            </div>

            {/* Email Login Button */}
            <Button
              onClick={() => setLoginMethod("email")}
              className="w-full bg-gradient-to-r from-[#00F7FF] to-[#FA00FF] text-black hover:shadow-lg hover:shadow-[#FA00FF]/50 flex items-center justify-center gap-2"
            >
              <Mail size={18} />
              Continue with Email
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Email/Password Form */}
            <Input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-black/50 border-[#00F7FF]/30 text-white placeholder-gray-600"
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-black/50 border-[#00F7FF]/30 text-white placeholder-gray-600"
              onKeyPress={(e) => e.key === "Enter" && handleEmailLogin()}
            />

            <Button
              onClick={handleEmailLogin}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#00F7FF] to-[#FA00FF] text-black hover:shadow-lg hover:shadow-[#FA00FF]/50"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>

            <Button
              onClick={() => setLoginMethod(null)}
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
