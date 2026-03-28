import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Home, Rss, ShoppingBag, BookOpen, User, Eye, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";

export default function Navigation() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const utils = trpc.useUtils();
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: async () => {
      await utils.auth.me.invalidate();
      setLocation("/");
    },
  });

  if (!user) {
    return null;
  }

  const navItems = [
    { icon: Rss, label: "Feed", path: "/feed", tooltip: "Prophetic Feed" },
    { icon: ShoppingBag, label: "Shop", path: "/shop", tooltip: "Shop Products" },
    { icon: BookOpen, label: "Courses", path: "/courses", tooltip: "Courses" },
    { icon: Eye, label: "Navi Society", path: "/navi-society", tooltip: "Navi Society ($500/mo)" },
    { icon: User, label: "Profile", path: "/profile", tooltip: "My Profile" },
  ];

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <>
      {/* Desktop Navigation - Icon Only Sidebar */}
      <nav className="hidden md:flex fixed left-0 top-1/2 -translate-y-1/2 z-40 flex-col gap-4 bg-black/80 backdrop-blur-md border-r border-[#00F7FF]/20 p-4 rounded-r-lg">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => setLocation(item.path)}
              title={item.tooltip}
              className="p-3 rounded-lg hover:bg-[#00F7FF]/20 hover:text-[#00F7FF] transition-all duration-200 text-gray-400 hover:shadow-lg hover:shadow-[#00F7FF]/30"
            >
              <Icon size={24} />
            </button>
          );
        })}
        
        <div className="border-t border-[#00F7FF]/20 my-2" />
        
        <button
          onClick={handleLogout}
          title="Logout"
          className="p-3 rounded-lg hover:bg-[#FA00FF]/20 hover:text-[#FA00FF] transition-all duration-200 text-gray-400"
        >
          <LogOut size={24} />
        </button>
      </nav>

      {/* Mobile Navigation - Top Bar */}
      <nav className="md:hidden fixed top-0 left-0 right-0 z-40 bg-black/90 backdrop-blur-md border-b border-[#00F7FF]/20">
        <div className="flex items-center justify-between h-16 px-4">
          <h1 className="text-lg font-bold text-glow">Prophet Dian</h1>
          
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-[#00F7FF]/20 text-[#00F7FF]"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="bg-black/95 border-t border-[#00F7FF]/20 p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    setLocation(item.path);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-[#00F7FF]/20 hover:text-[#00F7FF] transition-all text-gray-300"
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </button>
              );
            })}
            
            <div className="border-t border-[#00F7FF]/20 my-2" />
            
            <button
              onClick={() => {
                handleLogout();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-[#FA00FF]/20 hover:text-[#FA00FF] transition-all text-gray-300"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        )}
      </nav>

      {/* Spacer for mobile */}
      <div className="md:hidden h-16" />
    </>
  );
}
