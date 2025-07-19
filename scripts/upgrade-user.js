const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: 'nutriwise-ai' // Replace with your actual project ID
  });
}

const db = admin.firestore();

async function upgradeUserToPremium(email) {
  try {
    // Find user by email
    const usersSnapshot = await db.collection('users').where('email', '==', email).get();
    
    if (usersSnapshot.empty) {
      console.log(`No user found with email: ${email}`);
      return;
    }

    const userDoc = usersSnapshot.docs[0];
    const userId = userDoc.id;
    
    console.log(`Found user: ${userId}`);
    
    // Update user to premium
    await db.collection('users').doc(userId).update({
      isPremium: true,
      subscriptionStatus: 'active',
      subscriptionPlan: 'premium',
      upgradeDate: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log(`Successfully upgraded user ${email} to premium!`);
    
    // Also update their profile if it exists
    try {
      await db.collection('profiles').doc(userId).update({
        isPremium: true,
        subscriptionStatus: 'active',
        subscriptionPlan: 'premium',
        upgradeDate: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log(`Updated profile for user ${email}`);
    } catch (profileError) {
      console.log(`No profile found for user ${email}, or error updating profile:`, profileError.message);
    }
    
  } catch (error) {
    console.error('Error upgrading user:', error);
  }
}

// Run the upgrade
const emailToUpgrade = process.argv[2] || 'ramakrismatta@gmail.com';
upgradeUserToPremium(emailToUpgrade)
  .then(() => {
    console.log('Upgrade process completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error in upgrade process:', error);
    process.exit(1);
  });
