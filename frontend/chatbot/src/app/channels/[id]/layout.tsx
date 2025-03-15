'use client';

import React from 'react';
import DiscordSidebar from '@/components/layout/DiscordSidebar';
import DiscordChannelHeader from '@/components/layout/DiscordChannelHeader';
import { useParams, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

// APIのベースURLを定義
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface Channel {
  id: string;
  name: string;
  topic?: string;
  isPrivate: boolean;
}

export default function ChannelDetailLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const pathname = usePathname() || '';
  const id = params?.id as string;
  const { token } = useAuth();
  const [channel, setChannel] = useState<Channel | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showHeader, setShowHeader] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // コンポーネントがマウントされたことを確認
  useEffect(() => {
    try {
      setIsMounted(true);
      
      // パスに基づいてサイドバーとヘッダーの表示を制御
      const isChannelDetailPath = pathname.startsWith('/channels/') && pathname !== '/channels/';
      console.log(`チャンネルレイアウト: パス=${pathname}, 詳細パス=${isChannelDetailPath}, ID=${id}`);
      
      // /channels/:id の場合のみ表示
      setShowSidebar(isChannelDetailPath);
      setShowHeader(isChannelDetailPath);
    } catch (err) {
      console.error('レイアウト初期化エラー:', err);
      setError('レイアウトの初期化中にエラーが発生しました');
    }
    
    return () => {
      setIsMounted(false);
    };
  }, [pathname, id]);

  // チャンネル情報を取得
  useEffect(() => {
    if (!isMounted || !id || !token) return;
    
    fetchChannelInfo();
  }, [id, token, isMounted]);

  // チャンネル情報を取得する関数
  const fetchChannelInfo = async () => {
    try {
      console.log(`チャンネル情報を取得します: ID=${id}`);
      
      const response = await fetch(`${API_URL}/api/channels/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const channelData = await response.json();
        console.log('チャンネル情報を取得しました:', channelData);
        setChannel(channelData);
      } else {
        console.error(`チャンネル情報の取得に失敗しました (${response.status})`);
        // 開発環境ではモックデータを使用
        if (process.env.NODE_ENV === 'development') {
          console.log('開発環境のため、モックデータを使用します');
          setChannel({
            id,
            name: 'チャンネル',
            topic: '開発環境のモックチャンネルです',
            isPrivate: false
          });
        }
      }
    } catch (err) {
      console.error('チャンネル情報取得エラー:', err);
      setError('チャンネル情報の取得中にエラーが発生しました');
      
      // 開発環境ではモックデータを使用
      if (process.env.NODE_ENV === 'development') {
        console.log('エラーが発生しましたが、開発環境のためモックデータを使用します');
        setChannel({
          id,
          name: 'チャンネル',
          topic: '開発環境のモックチャンネルです',
          isPrivate: false
        });
        setError(null);
      }
    }
  };

  // サーバーサイドレンダリング中は何も表示しない
  if (!isMounted) {
    return null;
  }

  // エラーが発生した場合
  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-800 text-gray-200">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4">エラーが発生しました</h1>
          <p className="mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            再読み込み
          </button>
        </div>
      </div>
    );
  }

  // サイドバーとヘッダーを表示するかどうかに基づいてレイアウトを変更
  if (!showSidebar && !showHeader) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-gray-800 text-gray-200">
      {/* サイドバー */}
      {showSidebar && (
        <div className="w-60 bg-gray-900 flex-shrink-0">
          <DiscordSidebar />
        </div>
      )}
      
      {/* メインコンテンツ */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* チャンネルヘッダー */}
        {showHeader && channel && (
          <div className="h-12 border-b border-gray-700 flex items-center px-4 shadow-sm">
            <DiscordChannelHeader channel={channel} />
          </div>
        )}
        
        {/* チャンネルコンテンツ */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {children}
        </div>
      </div>
    </div>
  );
} 