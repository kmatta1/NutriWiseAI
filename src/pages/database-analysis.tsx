import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import Navigation from '../components/Navigation';

interface SupplementData {
  id: string;
  name: string;
  category: string;
  brand?: string;
  amazonUrl?: string;
  affiliateUrl?: string;
  imageUrl?: string;
  price?: string;
  rating?: number;
  reviewCount?: number;
  type?: string;
  features?: string[];
}

export default function DatabaseAnalysis() {
  const [supplements, setSupplements] = useState<SupplementData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchSupplements = async () => {
      try {
        console.log('🔍 Fetching supplements from Firestore...');
        
        // Get all supplements
        const supplementsRef = collection(db, 'supplements');
        const snapshot = await getDocs(supplementsRef);
        
        const supplementsData: SupplementData[] = [];
        
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          supplementsData.push({
            ...data,
            id: docSnap.id
          } as SupplementData);
        });
        
        console.log(`✅ Found ${supplementsData.length} supplements`);
        setSupplements(supplementsData);
        
        // Log the mapping for each supplement
        supplementsData.forEach((supplement) => {
          console.log(`${supplement.id}: ${supplement.name} (Category: ${supplement.category})`);
        });
        
      } catch (err) {
        console.error('❌ Error fetching supplements:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchSupplements();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Loading Database Analysis...</h1>
        <div className="animate-pulse">Fetching supplement data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4 text-red-600">Database Connection Error</h1>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  // Group supplements by category
  const groupedSupplements = supplements.reduce((acc, supplement) => {
    const category = supplement.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(supplement);
    return acc;
  }, {} as Record<string, SupplementData[]>);

  return (
    <>
      <Navigation />
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">Firestore Database Analysis</h1>
      
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Summary</h2>
        <p>Total Supplements: {supplements.length}</p>
        <p>Categories: {Object.keys(groupedSupplements).length}</p>
      </div>

      {Object.entries(groupedSupplements).map(([category, categorySupplements]) => (
        <div key={category} className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-blue-600">
            {category} ({categorySupplements.length} items)
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categorySupplements.map((supplement) => (
              <div key={supplement.id} className="border rounded-lg p-4 bg-white shadow-sm">
                <h3 className="font-semibold text-lg mb-2">{supplement.name}</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>ID:</strong> {supplement.id}</p>
                  <p><strong>Brand:</strong> {supplement.brand || 'N/A'}</p>
                  <p><strong>Price:</strong> {supplement.price || 'N/A'}</p>
                  <p><strong>Rating:</strong> {supplement.rating || 'N/A'}</p>
                  {supplement.features && supplement.features.length > 0 && (
                    <div>
                      <strong>Features:</strong>
                      <ul className="list-disc list-inside ml-2">
                        {supplement.features.map((feature, index) => (
                          <li key={index}>{feature}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {supplement.imageUrl && (
                    <p><strong>Current Image URL:</strong> {supplement.imageUrl.substring(0, 50)}...</p>
                  )}
                  <div className="mt-2 p-2 bg-green-50 rounded">
                    <strong>Suggested Firebase Image:</strong> supplement_{supplement.id.replace('supplement_', '')}.jpg
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Image Mapping Strategy</h2>
        <p className="text-sm text-gray-600 mb-2">
          Based on the database structure, each supplement should use its database ID as the image filename:
        </p>
        <div className="text-sm font-mono bg-white p-2 rounded border">
          {supplements.slice(0, 5).map((supplement) => (
            <div key={supplement.id}>
              {supplement.id} → supplement-images/{supplement.id}.jpg
            </div>
          ))}
          {supplements.length > 5 && <div>... and {supplements.length - 5} more</div>}
        </div>
      </div>
    </div>
    </>
  );
}
