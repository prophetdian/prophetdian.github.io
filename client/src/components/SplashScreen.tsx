import { useEffect, useState } from "react";
import { useLocation } from "wouter";

interface SplashScreenProps {
  onComplete?: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [, navigate] = useLocation();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
      navigate("/");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
      <div className="text-center">
        {/* Prophet Dian Logo */}
        <div className="mb-8">
          <img
            src="https://cdn.manus.im/IMG_20260324_234538_727.jpg"
            alt="Prophet Dian"
            className="w-48 h-48 mx-auto object-contain animate-fade-in rounded-full"
          />
        </div>
        
        {/* Loading indicator */}
        <div className="flex justify-center gap-2">
          <div className="w-3 h-3 bg-black rounded-full animate-bounce" style={{ animationDelay: "0s" }}></div>
          <div className="w-3 h-3 bg-black rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
          <div className="w-3 h-3 bg-black rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
        </div>
      </div>
    </div>
  );
}
