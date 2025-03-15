'use client';

import { ReactNode, useState, useEffect } from 'react';
import DiscordSidebar from './DiscordSidebar';
import DiscordChannelHeader from './DiscordChannelHeader';
import DiscordMessageInput from './DiscordMessageInput';

type DiscordLayoutProps = {
  children: ReactNode;
};

export default function DiscordLayout({ children }: DiscordLayoutProps) {
  const [isMounted, setIsMounted] = useState(false);
  
  // クライアントサイドでのみレンダリングを行うためのフラグ
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // サンプルのチャンネル情報
  const currentChannel = {
    id: '1',
    name: '一般',
    topic: 'このチャンネルは一般的な会話のためのチャンネルです。',
    isPrivate: false,
  };

  if (!isMounted) {
    return null; // クライアントサイドでのみレンダリング
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-700 text-white">
      {/* 左サイドバー */}
      <div className="flex-shrink-0 h-full">
        <DiscordSidebar />
      </div>
      
      {/* メインコンテンツ */}
      <div className="flex flex-col flex-1 h-full overflow-hidden bg-gray-600">
        {/* チャンネルヘッダー - 固定 */}
        <div className="flex-shrink-0 sticky top-0 z-10">
          <DiscordChannelHeader channel={currentChannel} />
        </div>
        
        {/* メッセージエリア - スクロール可能 */}
        <div className="flex-1 overflow-y-auto min-h-0 discord-message-area px-4 py-2">
          {children}
        </div>
        
        {/* メッセージ入力エリア（フッター） - 固定 */}
        <div className="flex-shrink-0 p-2 bg-gray-600 border-t border-gray-700 z-20 sticky bottom-0">
          <DiscordMessageInput channelId={currentChannel.id} />
        </div>
      </div>
    </div>
  );
} 