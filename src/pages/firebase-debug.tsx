import { useEffect, useState } from 'react';
import { app, storage, db } from '../lib/firebase';
import { ref, listAll } from 'firebase/storage';
import { collection, getDocs } from 'firebase/firestore';
import Navigation from '../components/Navigation';

export default function FirebaseDebug() {
  const [firebaseStatus, setFirebaseStatus] = useState<{
    app: boolean;
    storage: boolean;
    firestore: boolean;
    config: any;
    error?: string;
  }>({
    app: false,
    storage: false,
    firestore: false,
    config: null
  });

  useEffect(() => {
    const testFirebase = async () => {
      try {
        console.log('🔍 Testing Firebase connection...');
        
        // Test app initialization
        const appInitialized = !!app;
        console.log('App initialized:', appInitialized);
        
        // Test config
        const config = {
          apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.substring(0, 10) + '...',
          authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
          messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
          appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID?.substring(0, 20) + '...',
        };
        
        // Test Storage
        let storageWorking = false;
        try {
          const storageRef = ref(storage, 'supplement-images/');
          await listAll(storageRef);
          storageWorking = true;
          console.log('✅ Storage connection working');
        } catch (storageError) {
          console.error('❌ Storage error:', storageError);
        }
        
        // Test Firestore
        let firestoreWorking = false;
        try {
          const supplementsRef = collection(db, 'supplements');
          await getDocs(supplementsRef);
          firestoreWorking = true;
          console.log('✅ Firestore connection working');
        } catch (firestoreError) {
          console.error('❌ Firestore error:', firestoreError);
        }
        
        setFirebaseStatus({
          app: appInitialized,
          storage: storageWorking,
          firestore: firestoreWorking,
          config
        });
        
      } catch (error) {
        console.error('❌ Firebase test error:', error);
        setFirebaseStatus(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Unknown error'
        }));
      }
    };

    testFirebase();
  }, []);

  return (
    <>
      <Navigation />
      <div className="p-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Firebase Connection Debug</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Status Cards */}
          <div className="space-y-4">
            <div className={`p-4 rounded-lg border ${firebaseStatus.app ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <h3 className="font-semibold flex items-center gap-2">
                {firebaseStatus.app ? '✅' : '❌'} Firebase App
              </h3>
              <p className="text-sm text-gray-600">
                {firebaseStatus.app ? 'Successfully initialized' : 'Failed to initialize'}
              </p>
            </div>
            
            <div className={`p-4 rounded-lg border ${firebaseStatus.storage ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <h3 className="font-semibold flex items-center gap-2">
                {firebaseStatus.storage ? '✅' : '❌'} Firebase Storage
              </h3>
              <p className="text-sm text-gray-600">
                {firebaseStatus.storage ? 'Connection successful' : 'Connection failed'}
              </p>
            </div>
            
            <div className={`p-4 rounded-lg border ${firebaseStatus.firestore ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <h3 className="font-semibold flex items-center gap-2">
                {firebaseStatus.firestore ? '✅' : '❌'} Firestore Database
              </h3>
              <p className="text-sm text-gray-600">
                {firebaseStatus.firestore ? 'Connection successful' : 'Connection failed'}
              </p>
            </div>
          </div>
          
          {/* Configuration */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-3">Firebase Configuration</h3>
            <div className="text-sm space-y-2 font-mono">
              <div><strong>API Key:</strong> {firebaseStatus.config?.apiKey || 'Not set'}</div>
              <div><strong>Auth Domain:</strong> {firebaseStatus.config?.authDomain || 'Not set'}</div>
              <div><strong>Project ID:</strong> {firebaseStatus.config?.projectId || 'Not set'}</div>
              <div><strong>Storage Bucket:</strong> {firebaseStatus.config?.storageBucket || 'Not set'}</div>
              <div><strong>Messaging Sender ID:</strong> {firebaseStatus.config?.messagingSenderId || 'Not set'}</div>
              <div><strong>App ID:</strong> {firebaseStatus.config?.appId || 'Not set'}</div>
            </div>
          </div>
        </div>
        
        {firebaseStatus.error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="font-semibold text-red-800 mb-2">Error Details</h3>
            <pre className="text-sm text-red-700 whitespace-pre-wrap">{firebaseStatus.error}</pre>
          </div>
        )}
        
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">Troubleshooting</h3>
          <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
            <li>Check that all environment variables are set in .env.local</li>
            <li>Verify Firebase project configuration matches your project</li>
            <li>Ensure Firebase Storage has been enabled for your project</li>
            <li>Check that Firestore database is created and has proper security rules</li>
            <li>Verify storage bucket name matches exactly (including .firebasestorage.app)</li>
          </ul>
        </div>
        
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-semibold text-yellow-800 mb-2">Expected Environment Variables</h3>
          <div className="text-sm text-yellow-700 font-mono space-y-1">
            <div>NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...</div>
            <div>NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=project.firebaseapp.com</div>
            <div>NEXT_PUBLIC_FIREBASE_PROJECT_ID=project-id</div>
            <div>NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=project.firebasestorage.app</div>
            <div>NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789</div>
            <div>NEXT_PUBLIC_FIREBASE_APP_ID=1:123:web:abc123</div>
          </div>
        </div>
      </div>
    </>
  );
}
