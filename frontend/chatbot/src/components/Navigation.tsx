'use client';

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  
  const handleLogout = () => {
    logout();
    router.push('/');
  };
  
  return (
    <nav className="bg-gray-800 text-white h-16 fixed top-0 w-full z-50">
      <div className="h-full px-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          ChatBot
        </Link>
        <div className="flex items-center gap-4">          
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-300">
                こんにちは、{user?.username}さん
              </span>
              <button 
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-white text-sm"
              >
                ログアウト
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Link 
                href="/login" 
                className={`bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-white text-sm ${
                  pathname === '/login' ? 'bg-blue-700' : ''
                }`}
              >
                ログイン
              </Link>
              <Link 
                href="/register" 
                className={`bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-white text-sm ${
                  pathname === '/register' ? 'bg-green-700' : ''
                }`}
              >
                新規登録
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
} 