import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Rss, ShoppingBag, BookOpen, Eye, User, LogOut, Menu, X, Mail, Bell } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";

export default function HorizontalNav() {
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
    { icon: Rss, label: "Feed", path: "/feed" },
    { icon: ShoppingBag, label: "Shop", path: "/shop" },
    { icon: BookOpen, label: "Courses", path: "/courses" },
    { icon: Eye, label: "Navi Society", path: "/navi-society" },
    { icon: Mail, label: "Messages", path: "/messages" },
    { icon: Bell, label: "Notifications", path: "/notifications" },
    { icon: User, label: "Profile", path: "/profile" },
  ];

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <nav className="bg-black/90 backdrop-blur-md border-b border-[#00F7FF]/20 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Title */}
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-glow hidden sm:block">Prophet Dian</h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => setLocation(item.path)}
                  className="flex items-center gap-2 text-gray-300 hover:text-[#00F7FF] transition-colors duration-200"
                >
                  <Icon size={20} />
                  <span className="text-sm">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Desktop Logout */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-gray-300 hover:text-[#FA00FF] transition-colors"
            >
              <LogOut size={20} />
              <span className="text-sm">Logout</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-[#00F7FF] hover:text-[#FA00FF] transition-colors"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#00F7FF]/20 py-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    setLocation(item.path);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-[#00F7FF]/20 hover:text-[#00F7FF] transition-all text-gray-300"
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
              className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-[#FA00FF]/20 hover:text-[#FA00FF] transition-all text-gray-300"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
