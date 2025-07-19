"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getFirebaseFirestore } from '@/lib/firebase';
import { doc, updateDoc, serverTimestamp, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export default function AdminUserUpgrade() {
  const [email, setEmail] = useState('ramakrismatta@gmail.com');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const upgradeUserToPremium = async () => {
    setLoading(true);
    try {
      const firestore = getFirebaseFirestore();
      
      // Find user by email
      const usersRef = collection(firestore, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        toast({
          variant: "destructive",
          title: "User not found",
          description: `No user found with email: ${email}`
        });
        return;
      }

      const userDoc = querySnapshot.docs[0];
      const userId = userDoc.id;
      
      // Calculate end date (1 year from now)
      const endDate = new Date();
      endDate.setFullYear(endDate.getFullYear() + 1);

      // Update user to premium
      await updateDoc(doc(firestore, 'users', userId), {
        isPremium: true,
        subscription: {
          plan: 'yearly',
          status: 'active',
          startDate: new Date(),
          endDate: endDate,
          price: '$99/year'
        },
        upgradeDate: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      toast({
        title: "Success!",
        description: `User ${email} has been upgraded to premium (valid until ${endDate.toLocaleDateString()})`
      });
      
    } catch (error: any) {
      console.error('Error upgrading user:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to upgrade user: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Admin: Upgrade User to Premium</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2">
            User Email
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter user email"
          />
        </div>
        <Button 
          onClick={upgradeUserToPremium} 
          disabled={loading || !email}
          className="w-full"
        >
          {loading ? 'Upgrading...' : 'Upgrade to Premium'}
        </Button>
      </CardContent>
    </Card>
  );
}
