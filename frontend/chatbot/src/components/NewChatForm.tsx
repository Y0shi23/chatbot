'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ChatSidebar from './ChatSidebar';

export default function NewChatForm() {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error('チャットの開始に失敗しました');
      }

      const data = await response.json();
      setMessage('');
      router.push(`/chat/${data.chatId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期せぬエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex">
      <ChatSidebar />
      <div className="flex-1 ml-64">
        <div className="h-[calc(100vh-4rem)] bg-gray-100 flex flex-col items-center p-4">
          <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-6">
            <h1 className="text-2xl font-bold text-center mb-6">新規チャット</h1>
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="メッセージを入力してください..."
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  disabled={isLoading}
                />
              </div>
              <button
                type="submit"
                className={`w-full bg-blue-500 text-white py-2 px-4 rounded-lg
                  ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'}
                `}
                disabled={isLoading}
              >
                {isLoading ? '送信中...' : 'チャットを開始'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 