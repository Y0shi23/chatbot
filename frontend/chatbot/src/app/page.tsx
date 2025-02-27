'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const startNewChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsLoading(true);
    setError('');
    console.log('チャット開始リクエスト送信:', message);

    try {
      const response = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      console.log('サーバーレスポンス:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('エラーレスポンス:', errorData);
        throw new Error(errorData.error || 'チャットの開始に失敗しました');
      }

      const data = await response.json();
      console.log('チャット開始成功:', data);
      router.push(`/chat/${data.chatId}`);
    } catch (err: unknown) {
      console.error('エラー発生:', err);
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          setError('リクエストがタイムアウトしました');
        } else {
          setError(err.message);
        }
      } else {
        setError('予期せぬエラーが発生しました');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">新規チャットを開始</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
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
  );
}
