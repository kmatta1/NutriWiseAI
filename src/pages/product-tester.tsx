import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  ExternalLink,
  DollarSign,
  Image as ImageIcon,
  Link as LinkIcon,
  Clock
} from 'lucide-react';

interface ProductData {
  name: string;
  brand: string;
  price: string | null;
  reviews: string;
  stars: string;
  imageUrl: string;
  affiliateUrl: string;
  sourceUrl: string;
}

interface TestResult {
  fileName: string;
  productData: ProductData | null;
  issues: string[];
  urlStatus: 'loading' | 'success' | 'failed' | 'not-tested';
  priceIssues: string[];
  imageStatus: 'loading' | 'success' | 'failed' | 'not-tested';
}

export default function ProductDataTester() {
  const [productFiles, setProductFiles] = useState<string[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTest, setSelectedTest] = useState<TestResult | null>(null);

  // Product files we know exist
  const knownProductFiles = [
    'Turmeric_Curcumin_with_BioPerine_by_BioSchwartz',
    'Optimum_Nutrition_Gold_Standard_100%_Whey_Protein_Powder_-_Vanilla',
    'Creatine_Monohydrate',
    'Ashwagandha_Root_Extract_by_Nutricost',
    'Omega-3_Fish_Oil_1200mg_by_Nature_Made',
    'Vitamin_D3_5000_IU_by_NOW_Foods',
    'Magnesium_Glycinate_400mg_by_Doctor\'s_Best',
    'Probiotics_50_Billion_CFU_by_Physician\'s_Choice',
    'Melatonin_3mg_by_Nature_Made',
    'BCAA_Energy_Amino_Acid_Supplement_by_Cellucor_C4',
    'Pre-Workout_Supplement_by_Legion_Pulse',
    'Whole_Food_Multivitamin_by_Garden_of_Life',
    'Green_Tea_Extract_Supplement_by_NOW_Foods',
    'Collagen_Peptides_Powder_by_Vital_Proteins'
  ];

  const testProductFile = async (fileName: string): Promise<TestResult> => {
    const result: TestResult = {
      fileName,
      productData: null,
      issues: [],
      urlStatus: 'not-tested',
      priceIssues: [],
      imageStatus: 'not-tested'
    };

    try {
      // Try to load the product data
      const response = await fetch(`/product-data-${fileName}.json`);
      if (!response.ok) {
        result.issues.push(`Failed to load JSON file: ${response.status} ${response.statusText}`);
        return result;
      }

      const productData: ProductData = await response.json();
      result.productData = productData;

      // Test price data
      if (!productData.price) {
        result.priceIssues.push('Price is null or undefined');
      } else if (productData.price === '') {
        result.priceIssues.push('Price is empty string');
      } else if (!productData.price.includes('$')) {
        result.priceIssues.push('Price does not contain $ symbol');
      } else {
        // Try to parse the price
        const priceNumber = parseFloat(productData.price.replace(/[$,]/g, ''));
        if (isNaN(priceNumber)) {
          result.priceIssues.push('Price cannot be parsed as a number');
        } else if (priceNumber <= 0) {
          result.priceIssues.push('Price is zero or negative');
        }
      }

      // Test required fields
      if (!productData.name) result.issues.push('Missing product name');
      if (!productData.imageUrl) result.issues.push('Missing image URL');
      if (!productData.affiliateUrl) result.issues.push('Missing affiliate URL');

      // Test image URL format
      if (productData.imageUrl && !productData.imageUrl.startsWith('https://')) {
        result.issues.push('Image URL is not HTTPS');
      }

      // Test affiliate URL format
      if (productData.affiliateUrl && !productData.affiliateUrl.includes('amazon.com')) {
        result.issues.push('Affiliate URL is not an Amazon URL');
      }

      // Test if affiliate URL includes our tag
      if (productData.affiliateUrl && !productData.affiliateUrl.includes('tag=nutriwiseai-20')) {
        result.issues.push('Affiliate URL missing our tag (tag=nutriwiseai-20)');
      }

    } catch (error) {
      result.issues.push(`Error loading/parsing JSON: ${error}`);
    }

    return result;
  };

  const testUrlAccess = async (result: TestResult) => {
    if (!result.productData?.affiliateUrl) return;

    setTestResults(prev => 
      prev.map(r => 
        r.fileName === result.fileName 
          ? { ...r, urlStatus: 'loading' }
          : r
      )
    );

    try {
      // Test URL accessibility (just checking if it's a valid URL structure)
      const url = new URL(result.productData.affiliateUrl);
      
      // Since we can't actually test the URL due to CORS, we'll just validate the structure
      if (url.hostname === 'www.amazon.com') {
        setTestResults(prev => 
          prev.map(r => 
            r.fileName === result.fileName 
              ? { ...r, urlStatus: 'success' }
              : r
          )
        );
      } else {
        setTestResults(prev => 
          prev.map(r => 
            r.fileName === result.fileName 
              ? { ...r, urlStatus: 'failed' }
              : r
          )
        );
      }
    } catch (error) {
      setTestResults(prev => 
        prev.map(r => 
          r.fileName === result.fileName 
            ? { ...r, urlStatus: 'failed' }
            : r
        )
      );
    }
  };

  const testImageAccess = async (result: TestResult) => {
    if (!result.productData?.imageUrl) return;

    setTestResults(prev => 
      prev.map(r => 
        r.fileName === result.fileName 
          ? { ...r, imageStatus: 'loading' }
          : r
      )
    );

    const img = new Image();
    img.onload = () => {
      setTestResults(prev => 
        prev.map(r => 
          r.fileName === result.fileName 
            ? { ...r, imageStatus: 'success' }
            : r
        )
      );
    };
    img.onerror = () => {
      setTestResults(prev => 
        prev.map(r => 
          r.fileName === result.fileName 
            ? { ...r, imageStatus: 'failed' }
            : r
        )
      );
    };
    img.src = result.productData.imageUrl;
  };

  useEffect(() => {
    const runTests = async () => {
      setIsLoading(true);
      const results: TestResult[] = [];

      for (const fileName of knownProductFiles) {
        const result = await testProductFile(fileName);
        results.push(result);
      }

      setTestResults(results);
      setIsLoading(false);
    };

    runTests();
  }, []);

  const getStatusIcon = (status: 'loading' | 'success' | 'failed' | 'not-tested') => {
    switch (status) {
      case 'loading': return <Clock className="w-4 h-4 animate-spin" />;
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const openAmazonUrl = (url: string) => {
    window.open(url, '_blank');
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">Testing Product Data...</h1>
        <div className="animate-pulse">Loading and testing all product files...</div>
      </div>
    );
  }

  const successfulTests = testResults.filter(r => r.issues.length === 0 && r.priceIssues.length === 0);
  const failedTests = testResults.filter(r => r.issues.length > 0 || r.priceIssues.length > 0);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Product Data Test Results</h1>
      
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Products</p>
                <p className="text-2xl font-bold">{testResults.length}</p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Successful</p>
                <p className="text-2xl font-bold text-green-600">{successfulTests.length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Failed</p>
                <p className="text-2xl font-bold text-red-600">{failedTests.length}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Test Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {testResults.map((result, index) => (
          <Card key={index} className={`${
            result.issues.length > 0 || result.priceIssues.length > 0 
              ? 'border-red-200 bg-red-50' 
              : 'border-green-200 bg-green-50'
          }`}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">
                  {result.fileName.replace(/_/g, ' ')}
                </CardTitle>
                <Badge variant={
                  result.issues.length > 0 || result.priceIssues.length > 0 
                    ? 'destructive' 
                    : 'default'
                }>
                  {result.issues.length + result.priceIssues.length === 0 ? 'PASS' : 'FAIL'}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent>
              {result.productData && (
                <div className="space-y-3">
                  {/* Product Info */}
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <strong>Name:</strong> {result.productData.name?.substring(0, 50)}...
                    </div>
                    <div>
                      <strong>Price:</strong> 
                      <span className={result.priceIssues.length > 0 ? 'text-red-600 font-semibold' : 'text-green-600'}>
                        {result.productData.price || 'NULL'}
                      </span>
                    </div>
                    <div>
                      <strong>Reviews:</strong> {result.productData.reviews}
                    </div>
                    <div>
                      <strong>Stars:</strong> {result.productData.stars}
                    </div>
                  </div>

                  {/* Test Actions */}
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => testUrlAccess(result)}
                      className="flex items-center gap-1"
                    >
                      {getStatusIcon(result.urlStatus)}
                      Test URL
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => testImageAccess(result)}
                      className="flex items-center gap-1"
                    >
                      {getStatusIcon(result.imageStatus)}
                      Test Image
                    </Button>
                    
                    {result.productData.affiliateUrl && (
                      <Button
                        size="sm"
                        onClick={() => openAmazonUrl(result.productData!.affiliateUrl)}
                        className="flex items-center gap-1"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Open Amazon
                      </Button>
                    )}
                  </div>

                  {/* Issues */}
                  {result.priceIssues.length > 0 && (
                    <div className="bg-red-100 p-3 rounded border border-red-200">
                      <h4 className="font-semibold text-red-800 mb-1">Price Issues:</h4>
                      <ul className="text-sm text-red-700 space-y-1">
                        {result.priceIssues.map((issue, i) => (
                          <li key={i}>• {issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {result.issues.length > 0 && (
                    <div className="bg-red-100 p-3 rounded border border-red-200">
                      <h4 className="font-semibold text-red-800 mb-1">Data Issues:</h4>
                      <ul className="text-sm text-red-700 space-y-1">
                        {result.issues.map((issue, i) => (
                          <li key={i}>• {issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
              
              {!result.productData && (
                <div className="text-red-600">
                  Failed to load product data
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
