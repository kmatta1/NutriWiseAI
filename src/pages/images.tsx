import { useState, useEffect } from 'react';
import { ref, listAll, getDownloadURL } from 'firebase/storage';
import { storage } from '../lib/firebase';
import Image from 'next/image';
import Navigation from '../components/Navigation';

interface StorageImage {
  name: string;
  fullPath: string;
  downloadURL: string;
}

export default function ImageViewer() {
  const [images, setImages] = useState<StorageImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<StorageImage | null>(null);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        console.log('🔍 Fetching images from Firebase Storage...');
        const imagesRef = ref(storage, 'supplement-images/');
        
        // List all files in the supplement-images folder
        const result = await listAll(imagesRef);
        console.log(`📁 Found ${result.items.length} images in Firebase Storage`);
        
        const imagePromises = result.items.map(async (imageRef) => {
          try {
            const downloadURL = await getDownloadURL(imageRef);
            return {
              name: imageRef.name,
              fullPath: imageRef.fullPath,
              downloadURL
            };
          } catch (urlError) {
            console.error(`❌ Error getting URL for ${imageRef.name}:`, urlError);
            return null;
          }
        });
        
        const imageResults = await Promise.all(imagePromises);
        const validImages = imageResults.filter((img): img is StorageImage => img !== null);
        
        // Sort by name for better organization
        validImages.sort((a, b) => {
          const aNum = parseInt(a.name.match(/\d+/)?.[0] || '0');
          const bNum = parseInt(b.name.match(/\d+/)?.[0] || '0');
          return aNum - bNum;
        });
        
        setImages(validImages);
        console.log(`✅ Successfully loaded ${validImages.length} images`);
        
      } catch (err) {
        console.error('❌ Error fetching images:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">Firebase Storage Image Viewer</h1>
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span>Loading images from Firebase Storage...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6 text-red-600">Error Loading Images</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
          <p className="text-sm text-red-600 mt-2">
            Make sure you have images uploaded to Firebase Storage in the 'supplement-images/' folder.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navigation />
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">Firebase Storage Image Viewer</h1>
      
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h2 className="text-lg font-semibold text-blue-800 mb-2">
          📊 Storage Summary
        </h2>
        <p className="text-blue-700">
          Found <strong>{images.length}</strong> images in Firebase Storage
        </p>
        <p className="text-sm text-blue-600 mt-1">
          Storage Path: <code>gs://nutriwise-ai-3fmvs.firebasestorage.app/supplement-images/</code>
        </p>
      </div>

      {images.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-xl mb-4">📷</div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Images Found</h3>
          <p className="text-gray-600">
            Upload images to Firebase Storage in the 'supplement-images/' folder to see them here.
          </p>
        </div>
      ) : (
        <>
          {/* Image Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8">
            {images.map((image) => (
              <div
                key={image.name}
                className="border rounded-lg p-3 bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedImage(image)}
              >
                <div className="aspect-square mb-2 bg-gray-100 rounded overflow-hidden">
                  <Image
                    src={image.downloadURL}
                    alt={image.name}
                    width={200}
                    height={200}
                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                    onError={(e) => {
                      console.error(`❌ Error loading image ${image.name}`);
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-sm">{image.name}</p>
                  <p className="text-xs text-gray-500 truncate">
                    {image.name.replace('.jpg', '').replace('supplement_', 'ID: ')}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Image Details Table */}
          <div className="bg-white border rounded-lg overflow-hidden">
            <h2 className="text-xl font-semibold p-4 bg-gray-50 border-b">
              📋 Image Details
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Preview</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Filename</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Supplement ID</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Full Path</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">URL</th>
                  </tr>
                </thead>
                <tbody>
                  {images.map((image, index) => (
                    <tr key={image.name} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="px-4 py-2">
                        <Image
                          src={image.downloadURL}
                          alt={image.name}
                          width={40}
                          height={40}
                          className="w-10 h-10 object-cover rounded border"
                        />
                      </td>
                      <td className="px-4 py-2 font-mono text-sm">{image.name}</td>
                      <td className="px-4 py-2">
                        <code className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                          {image.name.replace('.jpg', '')}
                        </code>
                      </td>
                      <td className="px-4 py-2 text-xs text-gray-600 font-mono">{image.fullPath}</td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() => window.open(image.downloadURL, '_blank')}
                          className="text-blue-600 hover:text-blue-800 text-xs underline"
                        >
                          View Full Size
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-full overflow-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">{selectedImage.name}</h3>
              <button
                onClick={() => setSelectedImage(null)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ✕
              </button>
            </div>
            <div className="p-4">
              <Image
                src={selectedImage.downloadURL}
                alt={selectedImage.name}
                width={800}
                height={600}
                className="max-w-full h-auto rounded"
              />
              <div className="mt-4 text-sm text-gray-600">
                <p><strong>File:</strong> {selectedImage.name}</p>
                <p><strong>Path:</strong> {selectedImage.fullPath}</p>
                <p><strong>URL:</strong> <a href={selectedImage.downloadURL} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Open in new tab</a></p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
