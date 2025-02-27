'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ChatSidebar from '../../../components/ChatSidebar';

interface Message {
  id: string;
  content: string;
  role: string;
  timestamp: string;
}

export default function ChatPage() {
  const params = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // チャット履歴を取得
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        // 一時メッセージがあれば追加
        const tempMessage = sessionStorage.getItem('temp-message');
        if (tempMessage) {
          setMessages([JSON.parse(tempMessage)]);
          sessionStorage.removeItem('temp-message');
        }
        
        // 新規作成時のメッセージがあれば読み込む
        const savedMessages = sessionStorage.getItem(`chat-${params.id}`);
        if (savedMessages) {
          setMessages(JSON.parse(savedMessages));
          sessionStorage.removeItem(`chat-${params.id}`);
          return;
        }
        
        const response = await fetch(`http://localhost:3000/api/chat/${params.id}`);
        if (!response.ok) {
          throw new Error('チャット履歴の取得に失敗しました');
        }
        const data = await response.json();
        setMessages(data.messages);
      } catch (err) {
        setError(err instanceof Error ? err.message : '予期せぬエラーが発生しました');
      }
    };

    fetchMessages();
  }, [params.id]);

  // 新しいメッセージを送信
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setIsLoading(true);
    try {
      // ユーザーメッセージを先に表示
      const userMessage = {
        id: 'temp-' + Date.now(),
        content: newMessage,
        role: 'user',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, userMessage]);

      const response = await fetch(`http://localhost:3000/api/chat/${params.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: newMessage }),
      });

      if (!response.ok) {
        throw new Error('メッセージの送信に失敗しました');
      }

      const data = await response.json();
      // アシスタントの応答を追加
      if (data.message) {
        setMessages(prev => [...prev, data.message]);
      }
      setNewMessage('');
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期せぬエラーが発生しました');
      // エラー時は最新のユーザーメッセージを削除
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex">
      <ChatSidebar currentChatId={params.id as string} />
      <div className="flex-1 ml-64 container mx-auto px-4">
        <div className="h-[calc(100vh-4rem)]"> {/* ヘッダーの高さを引いた全画面高 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            {/* メッセージ履歴 */}
            <div className="space-y-4 mb-6 h-[calc(100vh-16rem)] overflow-y-auto">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`p-4 rounded-lg ${
                    message.role === 'user' 
                      ? 'bg-blue-100 ml-auto max-w-[80%]' 
                      : 'bg-gray-100 mr-auto max-w-[80%]'
                  }`}
                >
                  <p className="text-gray-800 whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(message.timestamp).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>

            {/* エラーメッセージ */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            {/* メッセージ入力フォーム */}
            <form onSubmit={sendMessage} className="flex gap-2 sticky bottom-0 bg-white pt-4">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="メッセージを入力..."
                className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[50px] max-h-[200px]"
                disabled={isLoading}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(e);
                  }
                }}
              />
              <button
                type="submit"
                className={`px-4 py-2 bg-blue-500 text-white rounded-lg
                  ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'}
                `}
                disabled={isLoading}
              >
                送信
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 