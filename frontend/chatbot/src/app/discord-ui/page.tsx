'use client';

import { useEffect, useState } from 'react';
import DiscordLayout from '@/components/layout/DiscordLayout';

// サンプルメッセージデータ
type Message = {
  id: string;
  content: string;
  author: {
    id: string;
    username: string;
    avatar?: string;
  };
  timestamp: Date;
  attachments?: {
    id: string;
    url: string;
    name: string;
    type: string;
  }[];
  reactions?: {
    emoji: string;
    count: number;
    reacted: boolean;
  }[];
};

export default function DiscordUIPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // サンプルメッセージを生成
  useEffect(() => {
    // ローディング状態を模倣
    const timer = setTimeout(() => {
      const sampleMessages: Message[] = [
        {
          id: '1',
          content: 'こんにちは！Discord風UIのサンプルへようこそ！',
          author: {
            id: '1',
            username: 'システム',
            avatar: '🤖',
          },
          timestamp: new Date(Date.now() - 3600000 * 2), // 2時間前
        },
        {
          id: '2',
          content: 'このUIはReactとTailwind CSSで構築されています。',
          author: {
            id: '2',
            username: '開発者',
            avatar: '👨‍💻',
          },
          timestamp: new Date(Date.now() - 3600000), // 1時間前
        },
        {
          id: '3',
          content: 'サイドバー、チャンネルリスト、メッセージ入力など、Discord/Slack風の機能が実装されています。',
          author: {
            id: '2',
            username: '開発者',
            avatar: '👨‍💻',
          },
          timestamp: new Date(Date.now() - 3600000 + 60000), // 1時間前 + 1分
        },
        {
          id: '4',
          content: '画像やファイルの添付機能もサポートしています！',
          author: {
            id: '3',
            username: 'デザイナー',
            avatar: '🎨',
          },
          timestamp: new Date(Date.now() - 1800000), // 30分前
          attachments: [
            {
              id: '1',
              url: 'https://via.placeholder.com/300x200',
              name: 'サンプル画像.png',
              type: 'image/png',
            },
          ],
        },
        {
          id: '5',
          content: 'リアクション機能も実装されています！👍',
          author: {
            id: '4',
            username: 'ユーザー',
            avatar: '👤',
          },
          timestamp: new Date(Date.now() - 900000), // 15分前
          reactions: [
            { emoji: '👍', count: 3, reacted: true },
            { emoji: '❤️', count: 2, reacted: false },
            { emoji: '🎉', count: 1, reacted: false },
          ],
        },
        {
          id: '6',
          content: 'コードブロックもサポートしています：\n```typescript\nconst greeting = "Hello, World!";\nconsole.log(greeting);\n```',
          author: {
            id: '2',
            username: '開発者',
            avatar: '👨‍💻',
          },
          timestamp: new Date(Date.now() - 600000), // 10分前
        },
        {
          id: '7',
          content: 'メッセージを入力して送信してみてください！（実際には送信されません）',
          author: {
            id: '1',
            username: 'システム',
            avatar: '🤖',
          },
          timestamp: new Date(Date.now() - 60000), // 1分前
        },
        // スクロールをテストするために追加のメッセージ
        ...Array.from({ length: 10 }, (_, i) => ({
          id: `extra-${i + 1}`,
          content: `これはスクロールテスト用のメッセージです。 #${i + 1}`,
          author: {
            id: '5',
            username: 'テスト',
            avatar: '🧪',
          },
          timestamp: new Date(Date.now() - 30000 - i * 1000), // 30秒前から1秒ずつ
        })),
      ];

      setMessages(sampleMessages);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // メッセージをフォーマット
  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays}日前`;
    } else if (diffHours > 0) {
      return `${diffHours}時間前`;
    } else if (diffMins > 0) {
      return `${diffMins}分前`;
    } else {
      return '今';
    }
  };

  // コードブロックを処理
  const formatMessageContent = (content: string) => {
    // コードブロックを検出して処理
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      // コードブロック前のテキスト
      if (match.index > lastIndex) {
        parts.push(
          <span key={`text-${lastIndex}`} className="whitespace-pre-wrap">
            {content.substring(lastIndex, match.index)}
          </span>
        );
      }

      // コードブロック
      const language = match[1] || '';
      const code = match[2];
      parts.push(
        <div key={`code-${match.index}`} className="bg-gray-900 rounded p-3 my-2 font-mono text-sm overflow-x-auto">
          {language && <div className="text-xs text-gray-500 mb-1">{language}</div>}
          <pre>{code}</pre>
        </div>
      );

      lastIndex = match.index + match[0].length;
    }

    // 残りのテキスト
    if (lastIndex < content.length) {
      parts.push(
        <span key={`text-${lastIndex}`} className="whitespace-pre-wrap">
          {content.substring(lastIndex)}
        </span>
      );
    }

    return parts.length > 0 ? parts : <span className="whitespace-pre-wrap">{content}</span>;
  };

  return (
    <DiscordLayout>
      {isLoading ? (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <div className="space-y-4 py-4 px-4 h-full">
          {messages.map((message, index) => {
            // 前のメッセージと同じ作者かつ5分以内の場合はグループ化
            const isGrouped =
              index > 0 &&
              messages[index - 1].author.id === message.author.id &&
              message.timestamp.getTime() - messages[index - 1].timestamp.getTime() < 300000;

            return (
              <div key={message.id} className={`${isGrouped ? 'mt-0.5 pt-0' : 'mt-4 pt-2'}`}>
                {!isGrouped && (
                  <div className="flex items-start mb-1">
                    {/* アバター */}
                    <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-lg mr-3 flex-shrink-0">
                      {message.author.avatar || message.author.username.charAt(0).toUpperCase()}
                    </div>
                    
                    {/* ユーザー名と時間 */}
                    <div className="flex items-baseline">
                      <span className="font-medium text-white">{message.author.username}</span>
                      <span className="text-xs text-gray-400 ml-2">{formatTimestamp(message.timestamp)}</span>
                    </div>
                  </div>
                )}
                
                {/* メッセージ本文 */}
                <div className={`${isGrouped ? 'pl-13' : 'pl-13'}`}>
                  <div className="text-gray-100">
                    {formatMessageContent(message.content)}
                  </div>
                  
                  {/* 添付ファイル */}
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {message.attachments.map(attachment => (
                        <div key={attachment.id} className="max-w-sm">
                          {attachment.type.startsWith('image/') ? (
                            <img 
                              src={attachment.url} 
                              alt={attachment.name} 
                              className="rounded-md max-h-60 object-cover"
                            />
                          ) : (
                            <div className="bg-gray-800 rounded-md p-3 flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-400 mr-2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                              </svg>
                              <span className="text-sm text-gray-300 truncate">{attachment.name}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* リアクション */}
                  {message.reactions && message.reactions.length > 0 && (
                    <div className="flex mt-1 space-x-2">
                      {message.reactions.map(reaction => (
                        <button 
                          key={reaction.emoji} 
                          className={`flex items-center space-x-1 px-2 py-0.5 rounded-full text-sm ${
                            reaction.reacted 
                              ? 'bg-indigo-500 bg-opacity-30 border border-indigo-500' 
                              : 'bg-gray-800 hover:bg-gray-700 border border-gray-700'
                          }`}
                        >
                          <span>{reaction.emoji}</span>
                          <span className="text-xs text-gray-300">{reaction.count}</span>
                        </button>
                      ))}
                      <button className="text-gray-500 hover:text-gray-400 text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DiscordLayout>
  );
} 