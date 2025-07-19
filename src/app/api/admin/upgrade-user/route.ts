import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseFirestore } from '@/lib/firebase';
import { doc, updateDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const firestore = getFirebaseFirestore();
    
    // Find user by email
    const usersRef = collection(firestore, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return NextResponse.json({ error: `No user found with email: ${email}` }, { status: 404 });
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
    
    return NextResponse.json({ 
      success: true, 
      message: `User ${email} has been upgraded to premium (valid until ${endDate.toLocaleDateString()})` 
    });
    
  } catch (error: any) {
    console.error('Error upgrading user:', error);
    return NextResponse.json({ 
      error: `Failed to upgrade user: ${error.message}` 
    }, { status: 500 });
  }
}
