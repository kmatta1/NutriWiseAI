import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Navigation() {
  const router = useRouter();
  
  const navItems = [
    { href: '/', label: 'Home', icon: '🏠' },
    { href: '/admin', label: 'Admin Panel', icon: '⚙️' },
    { href: '/images', label: 'Image Viewer', icon: '🖼️' },
    { href: '/database-analysis', label: 'Database Analysis', icon: '📊' },
    { href: '/firebase-debug', label: 'Firebase Debug', icon: '🔧' },
    { href: '/product-tester', label: 'Product Tester', icon: '🧪' },
    { href: '/advisor', label: 'Advisor', icon: '💡' },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-blue-600">
              NutriWise AI
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  router.pathname === item.href
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
