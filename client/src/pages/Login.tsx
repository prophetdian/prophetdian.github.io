import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Mail, Chrome, Apple, Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

export default function Login() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState<"email" | "google" | "apple" | null>(null);
  const [hasAccount, setHasAccount] = useState(true);

  // Email validation
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailLogin = async () => {
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }

    if (!isValidEmail(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    
    // Simulate API call to verify credentials
    setTimeout(() => {
      // In production, this would call a backend endpoint to verify email and password
      // For now, we'll show a message that real authentication is needed
      toast.error("Email/password authentication requires backend setup. Please use Google or Apple login.");
      setIsLoading(false);
    }, 1500);
  };

  const handleGoogleLogin = () => {
    setIsLoading(true);
    // Redirect to Google OAuth
    window.location.href = "/api/oauth/google";
  };

  const handleAppleLogin = () => {
    setIsLoading(true);
    // Redirect to Apple OAuth
    window.location.href = "/api/oauth/apple";
  };

  return (
    <div className="min-h-screen bg-[#000000] text-white flex items-center justify-center p-4 font-fredoka">
      <Card className="prophet-card p-8 max-w-md w-full bg-black/50 border-[#00F7FF]/30">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-[#00F7FF] to-[#FA00FF]">
            Welcome Back
          </h1>
          <p className="text-gray-400">Sign in to access the prophetic platform</p>
        </div>

        {!loginMethod ? (
          <div className="space-y-4">
            {/* Social Login Buttons */}
            <Button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full bg-white text-black hover:bg-gray-200 flex items-center justify-center gap-2 font-semibold"
            >
              <Chrome size={18} />
              Continue with Google
            </Button>

            <Button
              onClick={handleAppleLogin}
              disabled={isLoading}
              className="w-full bg-black border-2 border-white text-white hover:bg-gray-900 flex items-center justify-center gap-2 font-semibold"
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
                <span className="px-2 bg-black/50 text-gray-400">Or</span>
              </div>
            </div>

            {/* Email Login Button */}
            <Button
              onClick={() => setLoginMethod("email")}
              className="w-full bg-gradient-to-r from-[#00F7FF] to-[#FA00FF] text-black hover:shadow-lg hover:shadow-[#FA00FF]/50 flex items-center justify-center gap-2 font-semibold"
            >
              <Mail size={18} />
              Continue with Email
            </Button>

            {/* Sign Up Link */}
            <p className="text-center text-sm text-gray-400 mt-6">
              Don't have an account?{" "}
              <button
                onClick={() => setLocation("/signup")}
                className="text-[#00F7FF] hover:text-[#FA00FF] font-semibold transition-colors"
              >
                Sign up
              </button>
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Email/Password Form */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-300">Email Address</label>
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-black/50 border-[#00F7FF]/30 text-white placeholder-gray-600 focus:border-[#00F7FF]/60"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-300">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-black/50 border-[#00F7FF]/30 text-white placeholder-gray-600 focus:border-[#00F7FF]/60 pr-10"
                  onKeyPress={(e) => e.key === "Enter" && handleEmailLogin()}
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button
              onClick={handleEmailLogin}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#00F7FF] to-[#FA00FF] text-black hover:shadow-lg hover:shadow-[#FA00FF]/50 font-semibold"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={16} />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>

            <Button
              onClick={() => setLoginMethod(null)}
              variant="outline"
              className="w-full text-[#00F7FF] border-[#00F7FF]/30 hover:bg-[#00F7FF]/10 font-semibold"
            >
              Back
            </Button>

            <p className="text-center text-sm text-gray-400 mt-6">
              Don't have an account?{" "}
              <button
                onClick={() => setLocation("/signup")}
                className="text-[#00F7FF] hover:text-[#FA00FF] font-semibold transition-colors"
              >
                Sign up
              </button>
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
