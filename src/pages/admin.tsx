import { useState } from 'react';
import { populateFirestoreSupplements, checkFirestoreSupplements } from '../utils/populate-firestore';
import { fetchAllSupplements } from '../services/firestore-supplements';
import { ref, getDownloadURL } from 'firebase/storage';
import { storage } from '../lib/firebase';
import Image from 'next/image';
import Navigation from '../components/Navigation';

export default function AdminPanel() {
  const [isPopulating, setIsPopulating] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [results, setResults] = useState<string>('');
  const [supplements, setSupplements] = useState<any[]>([]);
  const [imageUrls, setImageUrls] = useState<{[key: string]: string}>({});

  const loadSupplementImages = async (supplementList: any[]) => {
    const urls: {[key: string]: string} = {};
    
    for (const supplement of supplementList) {
      try {
        const imageRef = ref(storage, `supplement-images/${supplement.id}.jpg`);
        const downloadUrl = await getDownloadURL(imageRef);
        urls[supplement.id] = downloadUrl;
        console.log(`✅ Loaded image for ${supplement.id}`);
      } catch (error) {
        console.log(`❌ No image found for ${supplement.id}`);
      }
    }
    
    setImageUrls(urls);
  };

  const handlePopulateDatabase = async () => {
    setIsPopulating(true);
    setResults('🚀 Starting database population...\n');
    
    try {
      const result = await populateFirestoreSupplements();
      setResults(prev => prev + `\n✅ Population complete!\nSuccess: ${result.successCount}\nFailed: ${result.failCount}`);
    } catch (error) {
      setResults(prev => prev + `\n❌ Error: ${error}`);
    }
    
    setIsPopulating(false);
  };

  const handleCheckDatabase = async () => {
    setIsChecking(true);
    setResults('🔍 Checking database...\n');
    
    try {
      const count = await checkFirestoreSupplements();
      setResults(prev => prev + `\n📊 Found ${count} supplements in database`);
      
      // Also fetch detailed data
      const supplementData = await fetchAllSupplements();
      setSupplements(supplementData);
      setResults(prev => prev + `\n✅ Fetched detailed data for ${supplementData.length} supplements`);
      
      // Load images for supplements
      setResults(prev => prev + `\n🖼️ Loading supplement images...`);
      await loadSupplementImages(supplementData);
      setResults(prev => prev + `\n✅ Loaded images from Firebase Storage`);
    } catch (error) {
      setResults(prev => prev + `\n❌ Error: ${error}`);
    }
    
    setIsChecking(false);
  };

  return (
    <>
      <Navigation />
      <div className="p-8 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">NutriWise AI - Admin Panel</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="p-6 border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Database Management</h2>
          <div className="space-y-4">
            <button
              onClick={handlePopulateDatabase}
              disabled={isPopulating}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isPopulating ? '🔄 Populating Database...' : '📥 Populate Database from Product Files'}
            </button>
            
            <button
              onClick={handleCheckDatabase}
              disabled={isChecking}
              className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              {isChecking ? '🔄 Checking...' : '🔍 Check Current Database'}
            </button>
          </div>
        </div>
        
        <div className="p-6 border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Results</h2>
          <pre className="text-sm bg-gray-100 p-4 rounded overflow-auto max-h-60 whitespace-pre-wrap">
            {results || 'No operations performed yet...'}
          </pre>
        </div>
      </div>

      {supplements.length > 0 && (
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Current Database Supplements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {supplements.map((supplement) => (
              <div key={supplement.id} className="border rounded p-4 bg-white shadow-sm">
                {/* Supplement Image */}
                <div className="mb-3">
                  {imageUrls[supplement.id] ? (
                    <div className="relative">
                      <Image
                        src={imageUrls[supplement.id]}
                        alt={supplement.name}
                        width={200}
                        height={150}
                        className="w-full h-32 object-cover rounded border"
                      />
                      <div className="absolute top-1 right-1 bg-green-500 text-white text-xs px-2 py-1 rounded">
                        ✅ Image Found
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-32 bg-gray-200 rounded border flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <div className="text-2xl mb-1">📷</div>
                        <div className="text-xs">No Image</div>
                        <div className="text-xs">({supplement.id}.jpg)</div>
                      </div>
                    </div>
                  )}
                </div>
                
                <h3 className="font-semibold text-sm mb-2">{supplement.name}</h3>
                <div className="text-xs text-gray-600 space-y-1">
                  <p><strong>ID:</strong> {supplement.id}</p>
                  <p><strong>Category:</strong> {supplement.category}</p>
                  <p><strong>Brand:</strong> {supplement.brand}</p>
                  <p><strong>Type:</strong> {supplement.type}</p>
                  <p><strong>Price:</strong> {supplement.price}</p>
                  <p><strong>Rating:</strong> {supplement.rating} ({supplement.reviewCount} reviews)</p>
                  <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                    <strong>Expected Image:</strong> supplement-images/{supplement.id}.jpg
                  </div>
                  {supplement.features && supplement.features.length > 0 && (
                    <div className="mt-2">
                      <strong>Features:</strong>
                      <ul className="list-disc list-inside ml-2 text-xs">
                        {supplement.features.slice(0, 3).map((feature: string, index: number) => (
                          <li key={index}>{feature}</li>
                        ))}
                        {supplement.features.length > 3 && <li>...and {supplement.features.length - 3} more</li>}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="font-semibold text-yellow-800 mb-2">📋 Instructions</h3>
        <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
          <li>First, click "Check Current Database" to see what's already in Firestore</li>
          <li>Click "Populate Database from Product Files" to import supplement data</li>
          <li>This will create supplement documents with IDs like supplement_1, supplement_2, etc.</li>
          <li>Each supplement will be mapped to its corresponding Firebase Storage image</li>
          <li>The component will then use these database IDs for accurate image matching</li>
        </ol>
      </div>
    </div>
    </>
  );
}
