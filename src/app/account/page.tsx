"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { userProfileManager } from "@/lib/user-profile-store";
import { 
  Crown, 
  User, 
  CreditCard, 
  Calendar, 
  DollarSign,
  Package,
  Shield,
  Mail
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

export default function AccountPage() {
  const { user, profile, loading } = useAuth();
  const { toast } = useToast();
  const [savedStacks, setSavedStacks] = useState<any[]>([]);
  const [formData, setFormData] = useState<any>(null);

  useEffect(() => {
    if (user) {
      // Load user's saved stacks and form data
      const stacks = userProfileManager.getSavedStacks();
      const savedFormData = userProfileManager.getFormData();
      setSavedStacks(stacks);
      setFormData(savedFormData);
    }
  }, [user]);

  const handleClearProfile = () => {
    userProfileManager.clearFormData();
    setFormData(null);
    toast({
      title: "Profile Cleared",
      description: "Your saved profile has been cleared.",
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-12 px-4">
        <Card className="text-center py-12">
          <CardHeader>
            <CardTitle>Please Sign In</CardTitle>
            <CardDescription>You need to be signed in to view your account.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/login">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold font-headline">Account</h1>
            <p className="text-muted-foreground mt-2">
              Manage your account settings and view your activity
            </p>
          </div>
          <div className="flex items-center gap-2">
            {profile?.isPremium ? (
              <Badge variant="default" className="bg-gradient-to-r from-yellow-400 to-orange-500">
                <Crown className="w-4 h-4 mr-1" />
                Premium Member
              </Badge>
            ) : (
              <Button asChild variant="premium" size="sm">
                <Link href="/subscribe">
                  <Crown className="w-4 h-4 mr-1" />
                  Upgrade to Premium
                </Link>
              </Button>
            )}
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
            <TabsTrigger value="history">Purchase History</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Account Status</CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {profile?.isPremium ? "Premium" : "Free"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {user.emailVerified ? "Email verified" : "Email not verified"}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Saved Plans</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{savedStacks.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Supplement stacks saved
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Profile Status</CardTitle>
                  <User className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formData ? "Complete" : "Incomplete"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Health profile completion
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Member Since</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {user.metadata?.creationTime ? 
                      new Date(user.metadata.creationTime).toLocaleDateString() : 
                      "Unknown"
                    }
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Account creation date
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Your account details and contact information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{user.email}</span>
                      {user.emailVerified && (
                        <Badge variant="secondary" className="text-xs">Verified</Badge>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">User ID</label>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-mono">{user.uid.substring(0, 8)}...</span>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Health Profile</h4>
                  {formData ? (
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Age</label>
                        <p className="text-sm text-muted-foreground">{formData.age} years old</p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Gender</label>
                        <p className="text-sm text-muted-foreground">{formData.gender}</p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Fitness Goals</label>
                        <p className="text-sm text-muted-foreground">{formData.fitnessGoals}</p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Activity Level</label>
                        <p className="text-sm text-muted-foreground">{formData.activityLevel}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-sm text-muted-foreground mb-4">No health profile saved yet</p>
                      <Button asChild variant="outline">
                        <Link href="/advisor">Complete Health Profile</Link>
                      </Button>
                    </div>
                  )}
                </div>
                
                {formData && (
                  <div className="pt-4">
                    <Button 
                      variant="outline" 
                      onClick={handleClearProfile}
                      className="mr-2"
                    >
                      Clear Profile
                    </Button>
                    <Button asChild variant="default">
                      <Link href="/advisor">Update Profile</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscription" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Subscription Details
                </CardTitle>
                <CardDescription>Manage your subscription and billing</CardDescription>
              </CardHeader>
              <CardContent>
                {profile?.isPremium ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Premium Membership</p>
                        <p className="text-sm text-muted-foreground">Active subscription</p>
                      </div>
                      <Badge variant="default" className="bg-gradient-to-r from-yellow-400 to-orange-500">
                        <Crown className="w-4 h-4 mr-1" />
                        Premium
                      </Badge>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Benefits:</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Unlimited AI recommendations</li>
                        <li>• Save and manage supplement plans</li>
                        <li>• Priority customer support</li>
                        <li>• Advanced personalization</li>
                      </ul>
                    </div>
                    <Button variant="outline" className="w-full">
                      Manage Subscription
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Crown className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="font-medium mb-2">You're on the Free plan</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Upgrade to Premium for unlimited recommendations and plan saving
                    </p>
                    <Button asChild variant="premium">
                      <Link href="/subscribe">
                        <Crown className="w-4 h-4 mr-2" />
                        Upgrade to Premium
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Purchase History
                </CardTitle>
                <CardDescription>View your past purchases and transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="font-medium mb-2">No purchases yet</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Your purchase history will appear here once you make your first order
                  </p>
                  <Button asChild variant="outline">
                    <Link href="/my-plans">View Saved Plans</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
