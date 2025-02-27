import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Chat {
  id: string;
  title: string;
  createdAt: string;
  lastMessageAt: string;
  messageCount: number;
  firstMessage: string;
}

interface ChatSidebarProps {
  currentChatId?: string;
}

export default function ChatSidebar({ currentChatId }: ChatSidebarProps) {
  const router = useRouter();
  const [chatHistory, setChatHistory] = useState<Chat[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('http://localhost:3000/api/chat/history');
        if (!response.ok) throw new Error('履歴の取得に失敗しました');
        const data = await response.json();
        setChatHistory(data.chats || []);
      } catch (error) {
        setError(error instanceof Error ? error.message : '履歴の取得に失敗しました');
      } finally {
        setIsLoading(false);
      }
    };

    fetchChatHistory();
  }, []);

  return (
    <div className="w-64 bg-gray-100 fixed top-16 left-0 bottom-0 p-4 overflow-y-auto">
      <div className="mb-4">
        <button
          onClick={() => router.push('/')}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        >
          新規チャット
        </button>
      </div>

      {error && (
        <div className="text-red-500 mb-4">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-4 text-gray-500">
          読み込み中...
        </div>
      ) : (
        <div className="space-y-2">
          {chatHistory.map((chat) => (
            <div
              key={chat.id}
              onClick={() => router.push(`/chat/${chat.id}`)}
              className={`p-2 rounded cursor-pointer ${
                chat.id === currentChatId
                  ? 'bg-blue-100 hover:bg-blue-200'
                  : 'hover:bg-gray-200'
              }`}
            >
              <div className="font-medium truncate">{chat.title || '無題のチャット'}</div>
              <div className="text-sm text-gray-500">
                メッセージ数: {chat.messageCount}
              </div>
              <div className="text-xs text-gray-400">
                {new Date(chat.lastMessageAt).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 