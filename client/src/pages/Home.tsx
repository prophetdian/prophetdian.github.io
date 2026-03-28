import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { useEffect } from "react";

const PROPHET_LOGO = "https://d2xsxph8kpxj0f.cloudfront.net/310519663473172666/jSyACvgbZubNmuo5RoP2m5/IMG_20260324_234538_727_31ee9840.jpg";

export default function Home() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect authenticated users to feed
  useEffect(() => {
    if (user && !loading) {
      setLocation("/feed");
    }
  }, [user, loading, setLocation]);

  return (
    <div className="min-h-screen bg-[#000000] text-white font-fredoka">
      {/* Hero Section - Full Black Background */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#000000]">
        {/* Animated Background Gradients */}
        <div className="absolute inset-0 opacity-15">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00F7FF] rounded-full mix-blend-screen filter blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#FA00FF] rounded-full mix-blend-screen filter blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        </div>

        {/* Content Container */}
        <div className="container relative z-10 text-center flex flex-col items-center justify-center gap-8 px-4">
          {/* Prophet Dian Logo - Optimized Size and Quality */}
          <div className="mb-2 inline-block transform hover:scale-105 transition-transform duration-300">
            <img 
              src={PROPHET_LOGO} 
              alt="Prophet Dian Eye Logo" 
              className="h-64 w-64 rounded-full shadow-2xl shadow-[#00F7FF]/60 mx-auto object-cover ring-4 ring-[#FA00FF]/30 filter brightness-110"
              loading="eager"
              decoding="async"
            />
          </div>

          {/* Prophet Dian Header - High Quality Typography */}
          <div className="space-y-3">
            <h1 className="text-7xl md:text-8xl font-bold tracking-wider text-[#FFFFFF] drop-shadow-2xl">
              Prophet Dian
            </h1>
            
            {/* "All Things Prophetic" Subtitle */}
            <p className="text-2xl md:text-3xl font-semibold text-[#FA00FF] tracking-wide drop-shadow-lg">
              All Things Prophetic
            </p>
          </div>

          {/* Login Button - Premium Quality */}
          {!user && !loading && (
            <Button
              onClick={() => (window.location.href = getLoginUrl())}
              className="bg-gradient-to-r from-[#00F7FF] to-[#00F7FF] text-black hover:from-[#00F7FF] hover:to-[#00E8FF] text-black font-bold px-16 py-4 text-lg rounded-full shadow-2xl shadow-[#00F7FF]/50 hover:shadow-[#00F7FF]/80 transition-all duration-300 transform hover:scale-105 active:scale-95 border-2 border-[#FA00FF]/30"
            >
              Log In
            </Button>
          )}
        </div>
      </section>
    </div>
  );
}
