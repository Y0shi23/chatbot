'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ChatSidebar from '../components/ChatSidebar';

export default function Home() {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [displayedMessage, setDisplayedMessage] = useState<{
    content: string;
    timestamp: string;
  } | null>(null);

  const startNewChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsLoading(true);
    setError('');

    setDisplayedMessage({
      content: message,
      timestamp: new Date().toISOString()
    });

    try {
      const response = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'チャットの開始に失敗しました');
      }

      const data = await response.json();
      sessionStorage.setItem(`chat-${data.chatId}`, JSON.stringify(data.messages));
      setMessage('');  // 入力内容をクリア
      router.push(`/chat/${data.chatId}`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('予期せぬエラーが発生しました');
      }
      setDisplayedMessage(null);  // エラー時はメッセージを非表示
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex">
      <ChatSidebar />
      <div className="flex-1 ml-64 container mx-auto px-4">
        <div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h1 className="text-2xl font-bold mb-6 text-center">新規チャットを開始</h1>
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            {/* 送信メッセージの表示 */}
            {displayedMessage && (
              <div className="mb-6">
                <div className="p-4 rounded-lg bg-blue-100 ml-auto max-w-[80%]">
                  <p className="text-gray-800 whitespace-pre-wrap">{displayedMessage.content}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(displayedMessage.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={startNewChat} className="space-y-4">
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
