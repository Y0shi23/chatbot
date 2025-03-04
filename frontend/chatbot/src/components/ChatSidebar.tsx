'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

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

  return (
    <div className="w-64 bg-gray-800 text-white h-screen fixed left-0 top-0 overflow-y-auto">
      <div className="p-4">
        <Link
          href="/chat"
          className="block w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded text-center mb-4"
        >
          新規チャット
        </Link>

        {isLoading ? (
          <div className="text-center">読み込み中...</div>
        ) : (
          <div className="space-y-2">
            {chats.map((chat) => (
              <Link
                key={chat.id}
                href={`/chat/${chat.id}`}
                className={`block p-3 rounded hover:bg-gray-700 ${
                  chat.id === currentChatId ? 'bg-gray-700' : ''
                }`}
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
    </div>
  );
} 