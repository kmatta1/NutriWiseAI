"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { useCart } from "@/contexts/cart-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Logo from "@/components/ui/logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuthActions } from "@/hooks/use-auth-actions";
import { ShoppingCart, Menu, User, Crown, Zap, Target, TrendingUp, Users } from "lucide-react";

export function SiteHeader() {
  const { user, profile, loading } = useAuth();
  const { state } = useCart();
  const { logout: clientLogout } = useAuthActions();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignOut = async () => {
    try {
      await clientLogout();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const navigationItems = [
    { 
      href: "/advisor", 
      label: "AI Advisor", 
      icon: Target,
      description: "Get personalized supplement recommendations"
    },
    { 
      href: "/my-plans", 
      label: "My Plans", 
      icon: Zap,
      description: "View your supplement schedules"
    },
    { 
      href: "/community", 
      label: "Community", 
      icon: Users,
      description: "Connect with fitness enthusiasts"
    },
    { 
      href: "/tracker", 
      label: "Progress Tracker", 
      icon: TrendingUp,
      description: "Track your fitness journey"
    },
  ];

  const cartItemCount = state.items.reduce((count, item) => count + item.quantity, 0);

  return (
    <header 
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? 'glass-dark shadow-2xl border-b border-primary/20' 
          : 'bg-gradient-to-r from-background/95 via-background/90 to-background/95'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <Logo size="md" variant="default" showText={true} />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group relative px-4 py-2 text-sm font-medium text-foreground/80 hover:text-primary transition-all duration-300"
              >
                <span className="flex items-center space-x-2">
                  {item.icon && <item.icon className="w-4 h-4" />}
                  <span>{item.label}</span>
                </span>
                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-amber-400 transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
            {profile?.isAdmin && (
              <Link
                href="/admin"
                className="group relative px-4 py-2 text-sm font-medium text-primary hover:text-amber-400 transition-all duration-300"
              >
                <span>Admin</span>
                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-amber-400 transition-all duration-300 group-hover:w-full" />
              </Link>
            )}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
            <Link href="/cart" className="relative group">
              <Button variant="ghost" size="icon" className="hover:bg-primary/10">
                <ShoppingCart className="w-5 h-5" />
                {cartItemCount > 0 && (
                  <Badge 
                    variant="default" 
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-primary animate-pulse-slow"
                  >
                    {cartItemCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* User Menu */}
            {!loading && (
              <>
                {user && user.emailVerified ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="flex items-center space-x-2 hover:bg-primary/10">
                        <div className="relative">
                          <User className="w-5 h-5" />
                          {profile?.isPremium && (
                            <Crown className="w-3 h-3 absolute -top-1 -right-1 text-primary" />
                          )}
                        </div>
                        <span className="hidden sm:block text-sm font-medium">
                          {profile?.isPremium ? "Premium" : "Account"}
                        </span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 glass-effect border-primary/20">
                      <DropdownMenuItem asChild>
                        <Link href="/account" className="flex items-center space-x-2">
                          <User className="w-4 h-4" />
                          <span>Account Settings</span>
                        </Link>
                      </DropdownMenuItem>
                      {!profile?.isPremium && (
                        <DropdownMenuItem asChild>
                          <Link href="/subscribe" className="flex items-center space-x-2 text-primary">
                            <Crown className="w-4 h-4" />
                            <span>Upgrade to Premium</span>
                          </Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={handleSignOut} className="text-red-400 hover:text-red-300">
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" asChild className="hover:bg-primary/10">
                      <Link href="/login">Sign In</Link>
                    </Button>
                    <Button asChild className="btn-primary">
                      <Link href="/signup">Get Started</Link>
                    </Button>
                  </div>
                )}
              </>
            )}

            {/* Mobile Menu */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden hover:bg-primary/10">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 glass-dark border-primary/20">
                <div className="flex flex-col space-y-6 mt-8">
                  {navigationItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center space-x-3 p-4 rounded-lg hover:bg-primary/10 transition-colors group"
                    >
                      {item.icon && <item.icon className="w-5 h-5 text-primary" />}
                      <div>
                        <div className="font-medium">{item.label}</div>
                        {item.description && (
                          <div className="text-sm text-muted-foreground">{item.description}</div>
                        )}
                      </div>
                    </Link>
                  ))}
                  
                  {profile?.isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center space-x-3 p-4 rounded-lg hover:bg-primary/10 transition-colors text-primary"
                    >
                      <Crown className="w-5 h-5" />
                      <div>
                        <div className="font-medium">Admin Panel</div>
                        <div className="text-sm text-muted-foreground">Manage users and system</div>
                      </div>
                    </Link>
                  )}
                  
                  {user && !profile?.isPremium && (
                    <Link
                      href="/subscribe"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-center space-x-2 p-4 rounded-lg bg-gradient-to-r from-primary to-amber-400 text-primary-foreground font-medium"
                    >
                      <Crown className="w-5 h-5" />
                      <span>Upgrade to Premium</span>
                    </Link>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}

export default SiteHeader;
