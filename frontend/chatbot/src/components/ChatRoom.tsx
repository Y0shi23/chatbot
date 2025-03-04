'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ChatSidebar from './ChatSidebar';
import { useSidebar } from '@/context/SidebarContext';
import { parseMessageContent } from '@/utils/messageParser';

interface Message {
  id: string;
  content: string;
  role: string;
  timestamp: string;
}

export default function ChatRoom() {
  const params = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { isSidebarOpen } = useSidebar();

  useEffect(() => {
    fetchMessages();
  }, [params.id]);

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/chat/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('メッセージの取得に失敗しました');
      }

      const data = await response.json();
      setMessages(data.messages);
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期せぬエラーが発生しました');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setIsLoading(true);
    setError('');

    // 送信前にユーザーメッセージを一時的に表示
    const tempUserMessage: Message = {
      id: `temp-${Date.now()}`,
      content: newMessage,
      role: 'user',
      timestamp: new Date().toISOString(),
    };
    
    setMessages(prev => [...prev, tempUserMessage]);
    const messageToSend = newMessage;
    setNewMessage('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/chat/${params.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ message: messageToSend }),
      });

      if (!response.ok) {
        throw new Error('メッセージの送信に失敗しました');
      }

      const data = await response.json();
      
      // 一時メッセージを削除して、サーバーからの応答で更新
      fetchMessages();
    } catch (err) {
      // エラーの場合、一時メッセージを削除
      setMessages(prev => prev.filter(msg => msg.id !== tempUserMessage.id));
      setError(err instanceof Error ? err.message : '予期せぬエラーが発生しました');
      // 入力内容を復元
      setNewMessage(messageToSend);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <ChatSidebar />
      <div 
        className={`
          flex-1 transition-all duration-300
          ${isSidebarOpen ? 'ml-0 md:ml-64' : 'ml-0'}
        `}
      >
        <div className="h-[calc(100vh-4rem)] bg-gray-100 flex flex-col overflow-hidden">
          <div className="flex-1 p-4 overflow-hidden">
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-4 h-full flex flex-col overflow-hidden">
              <div className="flex-1 space-y-4 overflow-y-auto mb-4 pt-2">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-4 rounded-lg ${
                      message.role === 'user' 
                        ? 'bg-blue-100 ml-auto max-w-[80%]' 
                        : 'bg-gray-100 mr-auto max-w-[80%]'
                    }`}
                  >
                    <div className="text-gray-800">
                      {parseMessageContent(message.content)}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(message.timestamp).toLocaleString()}
                    </p>
                  </div>
                ))}
                {isLoading && (
                  <div className="bg-gray-100 mr-auto max-w-[80%] p-4 rounded-lg">
                    <p className="text-gray-500">応答を生成中...</p>
                  </div>
                )}
              </div>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                <div className="rounded-lg overflow-hidden">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="メッセージを入力してください..."
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
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
                  {isLoading ? '送信中...' : '送信'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 