

"use client";

import Link from "next/link";
import { ShoppingCart, Menu, LogOut, Crown, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useCart } from "@/contexts/cart-context";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { logout } from "@/lib/auth-actions";
import { Skeleton } from "@/components/ui/skeleton";

const Logotype = () => (
  <div className="flex items-center" title="NutriWise AI">
    <svg
      viewBox="0 0 200 28"
      height="28"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <style>
          {`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@700&display=swap');`}
        </style>
      </defs>
      <text x="0" y="22" fontFamily="Poppins, sans-serif" fontSize="24" fontWeight="700" letterSpacing="-1" className="fill-foreground">NUTRI</text>
      <text x="78" y="22" fontFamily="Poppins, sans-serif" fontSize="24" fontWeight="700" letterSpacing="-1" className="fill-primary">WISE</text>
    </svg>
  </div>
);

const AuthNavDesktop = () => {
  const { user, profile } = useAuth();

  return (
    <div className="flex items-center gap-2">
      {user ? (
        <>
          {!profile?.isPremium && (
             <Button asChild variant="premium">
                <Link href="/subscribe"><Crown className="mr-2 h-4 w-4"/> Upgrade</Link>
              </Button>
          )}
          <form action={logout}>
            <Button variant="outline" type="submit">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </form>
        </>
      ) : (
        <>
           <Button variant="ghost" asChild><Link href="/login">Login</Link></Button>
           <Button asChild><Link href="/signup">Create Free Account</Link></Button>
        </>
      )}
    </div>
  );
};


const AuthNavMobile = ({ closeSheet }: { closeSheet: () => void }) => {
  const { user, profile } = useAuth();
  return (
    <div className="flex flex-col space-y-4">
      {user ? (
        <>
         {!profile?.isPremium && (
             <Button asChild variant="premium" onClick={closeSheet}>
                <Link href="/subscribe"><Crown className="mr-2 h-4 w-4"/> Upgrade</Link>
              </Button>
          )}
          <form action={logout}>
            <Button variant="ghost" className="w-full justify-start" type="submit" onClick={closeSheet}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </form>
        </>
      ) : (
        <>
          <Button variant="ghost" onClick={closeSheet} asChild><Link href="/login">Login</Link></Button>
          <Button onClick={closeSheet} asChild><Link href="/signup">Create Free Account</Link></Button>
        </>
      )}
    </div>
  )
}


export function SiteHeader() {
  const { state } = useCart();
  const { user, profile, loading } = useAuth();
  const isMobile = useIsMobile();
  const [isSheetOpen, setSheetOpen] = useState(false);
  const cartItemCount = state.items.reduce((count, item) => count + item.quantity, 0);

  const navLinks = (
    <>
      <Button variant="ghost" asChild onClick={() => setSheetOpen(false)}>
        <Link href="/advisor">AI Advisor</Link>
      </Button>
      <Button variant="ghost" asChild onClick={() => setSheetOpen(false)}>
        <Link href="/tracker">Fitness Tracker</Link>
      </Button>
      <Button variant="ghost" asChild onClick={() => setSheetOpen(false)}>
        <Link href="/community">Community</Link>
      </Button>
      <Button variant="ghost" asChild onClick={() => setSheetOpen(false)}>
        <Link href="/my-plans">My Plans</Link>
      </Button>
       {profile?.isAdmin && (
        <Button variant="ghost" asChild onClick={() => setSheetOpen(false)}>
            <Link href="/admin/users" className="flex items-center gap-2"><Shield className="w-4 h-4"/>Admin</Link>
        </Button>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Logotype />
          </Link>
        </div>
        
        {isMobile ? (
          <>
            <div className="flex flex-1 items-center justify-end space-x-2">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/cart">
                  <ShoppingCart />
                  {cartItemCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                      {cartItemCount}
                    </span>
                  )}
                  <span className="sr-only">Cart</span>
                </Link>
              </Button>
              <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Toggle Menu">
                    <Menu />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right">
                  <SheetHeader className="sr-only">
                    <SheetTitle>Navigation Menu</SheetTitle>
                    <SheetDescription>Main links for navigating the site, including AI advisor, fitness tracker, and your account.</SheetDescription>
                  </SheetHeader>
                  <div className="mt-8 flex flex-col space-y-4">
                    {navLinks}
                    <hr />
                    {loading ? <Skeleton className="h-10 w-full" data-testid="skeleton" /> : <AuthNavMobile closeSheet={() => setSheetOpen(false)} />}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </>
        ) : (
          <>
            <nav className="hidden md:flex items-center space-x-1 text-sm font-medium">
              {navLinks}
            </nav>
            <div className="flex flex-1 items-center justify-end space-x-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/cart" className="relative">
                  <ShoppingCart />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                      {cartItemCount}
                    </span>
                  )}
                  <span className="sr-only">Cart</span>
                </Link>
              </Button>
              {loading ? (
                <div className="flex items-center gap-2" data-testid="skeleton">
                  <Skeleton className="h-10 w-24" />
                  <Skeleton className="h-10 w-36" />
                </div>
              ) : (
                <AuthNavDesktop />
              )}
            </div>
          </>
        )}
      </div>
    </header>
  );
}
