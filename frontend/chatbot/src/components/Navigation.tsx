'use client';

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navigation() {
  const pathname = usePathname();
  
  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          ChatBot
        </Link>
        <div className="flex gap-4">
          <Link
            href="/"
            className={`hover:text-gray-300 ${
              pathname === '/' ? 'text-blue-400' : ''
            }`}
          >
            新規チャット
          </Link>
        </div>
      </div>
    </nav>
  )
} 