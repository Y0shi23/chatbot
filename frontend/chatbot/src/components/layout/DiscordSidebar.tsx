'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function DiscordSidebar() {
  const { user } = useAuth();
  const [activeServer, setActiveServer] = useState('1');
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['1', '2']);

  // サンプルのサーバーリスト
  const servers = [
    { id: '1', name: 'メインサーバー', icon: '🏠' },
    { id: '2', name: '開発チーム', icon: '💻' },
    { id: '3', name: 'マーケティング', icon: '📊' },
    { id: '4', name: 'デザイン', icon: '🎨' },
  ];

  // サンプルのカテゴリーとチャンネルリスト
  const categories = [
    {
      id: '1',
      name: '情報',
      channels: [
        { id: '1', name: 'お知らせ', type: 'text', unread: true, mentions: 2 },
        { id: '2', name: 'ルール', type: 'text', unread: false, mentions: 0 },
      ]
    },
    {
      id: '2',
      name: 'テキストチャンネル',
      channels: [
        { id: '3', name: '一般', type: 'text', unread: true, mentions: 0 },
        { id: '4', name: '雑談', type: 'text', unread: false, mentions: 0 },
        { id: '5', name: '質問', type: 'text', unread: false, mentions: 0 },
      ]
    },
    {
      id: '3',
      name: 'ボイスチャンネル',
      channels: [
        { id: '6', name: '通話室1', type: 'voice', unread: false, mentions: 0, users: 2 },
        { id: '7', name: '通話室2', type: 'voice', unread: false, mentions: 0, users: 0 },
      ]
    }
  ];

  // カテゴリーの展開/折りたたみを切り替える
  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  return (
    <div className="flex h-full">
      {/* サーバーリスト（左側のアイコン列） */}
      <div className="w-16 bg-gray-900 flex flex-col items-center pt-4 pb-4 space-y-2">
        {/* ホームボタン */}
        <button className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white hover:bg-indigo-700 mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
          </svg>
        </button>

        {/* サーバー区切り線 */}
        <div className="w-8 h-0.5 bg-gray-700 rounded-full my-1"></div>

        {/* サーバーアイコン */}
        <div className="flex-1 flex flex-col items-center space-y-2 overflow-y-auto">
          {servers.map(server => (
            <button
              key={server.id}
              onClick={() => setActiveServer(server.id)}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all ${
                activeServer === server.id 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {server.icon}
            </button>
          ))}
        </div>

        {/* 追加ボタン */}
        <button className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-green-400 hover:bg-gray-600 mt-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </button>
      </div>

      {/* チャンネルリスト */}
      <div className="w-60 bg-gray-800 flex flex-col">
        {/* サーバー名ヘッダー */}
        <div className="h-12 border-b border-gray-900 flex items-center px-4 shadow-sm">
          <h2 className="text-white font-medium truncate">
            {servers.find(s => s.id === activeServer)?.name || 'サーバー'}
          </h2>
          <button className="ml-auto text-gray-400 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
        </div>

        {/* チャンネルリスト - スクロール可能 */}
        <div className="flex-1 overflow-y-auto py-2 space-y-1">
          {categories.map(category => (
            <div key={category.id} className="px-2">
              {/* カテゴリーヘッダー */}
              <button
                onClick={() => toggleCategory(category.id)}
                className="flex items-center w-full text-xs font-semibold text-gray-400 hover:text-gray-300 py-1 px-1"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  strokeWidth={1.5} 
                  stroke="currentColor" 
                  className={`w-3 h-3 mr-1 transition-transform ${
                    expandedCategories.includes(category.id) ? 'rotate-0' : '-rotate-90'
                  }`}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
                {category.name.toUpperCase()}
              </button>

              {/* チャンネルリスト */}
              {expandedCategories.includes(category.id) && (
                <div className="mt-1 space-y-0.5">
                  {category.channels.map(channel => (
                    <Link
                      key={channel.id}
                      href={`/channels/${activeServer}/${channel.id}`}
                      className={`flex items-center px-2 py-1 rounded group ${
                        channel.id === '3' // アクティブなチャンネルを仮定
                          ? 'bg-gray-700 text-white'
                          : 'text-gray-400 hover:bg-gray-700 hover:text-gray-300'
                      }`}
                    >
                      {/* チャンネルアイコン */}
                      {channel.type === 'text' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1 flex-shrink-0">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1 flex-shrink-0">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                        </svg>
                      )}

                      {/* チャンネル名 */}
                      <span className="truncate">{channel.name}</span>

                      {/* ボイスチャンネルのユーザー数 */}
                      {channel.type === 'voice' && 'users' in channel && channel.users > 0 && (
                        <span className="ml-auto text-xs text-gray-400">{channel.users}</span>
                      )}

                      {/* 未読バッジ */}
                      {channel.unread && (
                        <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full"></div>
                      )}

                      {/* メンション数 */}
                      {channel.mentions > 0 && (
                        <div className="ml-auto bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[1.25rem] text-center">
                          {channel.mentions}
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ユーザーステータス - 固定 */}
        <div className="flex-shrink-0 h-12 bg-gray-900 flex items-center px-2 py-1">
          <div className="flex items-center space-x-2">
            {/* ユーザーアバター */}
            <div className="relative">
              <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center">
                {user?.username ? (
                  <span className="text-xs font-medium">{user.username.charAt(0).toUpperCase()}</span>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-white">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                  </svg>
                )}
              </div>
              {/* オンラインステータス */}
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-gray-900"></div>
            </div>

            {/* ユーザー情報 */}
            <div className="text-sm">
              <div className="font-medium text-white truncate max-w-[120px]">
                {user?.username || 'ユーザー'}
              </div>
              <div className="text-xs text-gray-400">オンライン</div>
            </div>
          </div>

          {/* 設定ボタン */}
          <div className="ml-auto flex space-x-1">
            <button className="text-gray-400 hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
              </svg>
            </button>
            <button className="text-gray-400 hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 