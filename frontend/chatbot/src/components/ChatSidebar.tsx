'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSidebar } from '@/context/SidebarContext';

interface Chat {
  id: string;
  title: string;
  lastMessageAt: string;
  messageCount: number;
}

export default function ChatSidebar() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const currentChatId = pathname.split('/').pop();
  const { isSidebarOpen, closeSidebar } = useSidebar();

  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3000/api/chat/history', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('チャット履歴の取得に失敗しました');
        }

        const data = await response.json();
        setChats(data.chats);
      } catch (error) {
        console.error('Error fetching chat history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChatHistory();
  }, []);

  // モバイル表示時にリンククリック後にサイドバーを閉じる
  const handleLinkClick = () => {
    if (window.innerWidth <= 768) {
      closeSidebar();
    }
  };

  return (
    <>
      <div 
        className={`
          bg-gray-800 text-white h-[calc(100vh-4rem)] fixed left-0 top-16 overflow-y-auto
          transition-all duration-300 z-40
          ${isSidebarOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full md:translate-x-0'}
          md:w-64
        `}
      >
        <Link
          href="/chat"
          className="block w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-center"
          onClick={handleLinkClick}
        >
          新規チャット
        </Link>

        {isLoading ? (
          <div className="text-center p-4">読み込み中...</div>
        ) : (
          <div className="space-y-1 mt-2">
            {chats.map((chat) => (
              <Link
                key={chat.id}
                href={`/chat/${chat.id}`}
                className={`block px-4 py-2 hover:bg-gray-700 ${
                  chat.id === currentChatId ? 'bg-gray-700' : ''
                }`}
                onClick={handleLinkClick}
              >
                <div className="font-medium truncate">{chat.title}</div>
                <div className="text-sm text-gray-400">
                  {new Date(chat.lastMessageAt).toLocaleDateString()}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      
      {/* モバイル表示時のオーバーレイ */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={closeSidebar}
        />
      )}
    </>
  );
} 