'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSidebar } from '@/context/SidebarContext';

// SVGアイコンコンポーネント
const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

const HashtagIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5-3.9 19.5m-2.1-19.5-3.9 19.5" />
  </svg>
);

const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
  </svg>
);

const UserPlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
  </svg>
);

interface Server {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  createdAt: string;
  memberCount: number;
}

interface Channel {
  id: string;
  serverId: string;
  name: string;
  description: string;
  isPrivate: boolean;
  createdAt: string;
}

export default function ServerSidebar() {
  const [servers, setServers] = useState<Server[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedServer, setSelectedServer] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewServerModal, setShowNewServerModal] = useState(false);
  const [showNewChannelModal, setShowNewChannelModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { isSidebarOpen, closeSidebar } = useSidebar();

  // Extract current channel ID from path if available
  const pathParts = pathname.split('/');
  const currentChannelId = pathParts[pathParts.length - 1];

  useEffect(() => {
    // トークンの存在を確認
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('認証トークンがありません。ログインページにリダイレクトします。');
      router.push('/login');
      return;
    }
    
    fetchServers();
  }, []);

  useEffect(() => {
    if (selectedServer) {
      fetchChannels(selectedServer);
    }
  }, [selectedServer]);

  const fetchServers = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      // トークンが存在しない場合の処理を追加
      if (!token) {
        console.error('認証トークンがありません。ログインしてください。');
        setIsLoading(false);
        setServers([]); // 空の配列を設定
        // エラー状態を設定するか、ログインページにリダイレクトするなどの処理を追加
        return;
      }
      
      const response = await fetch('http://localhost:3000/api/servers', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        // レスポンスの詳細情報を取得
        const errorText = await response.text();
        console.error('サーバーからのエラーレスポンス:', response.status, errorText);
        throw new Error('サーバーの取得に失敗しました');
      }

      const data = await response.json();
      setServers(data.servers || []); // データがない場合は空の配列を設定
      
      // Select the first server by default if none is selected
      if (data.servers && data.servers.length > 0 && !selectedServer) {
        setSelectedServer(data.servers[0].id);
      }
    } catch (error) {
      console.error('Error fetching servers:', error);
      setServers([]); // エラー時は空の配列を設定
    } finally {
      setIsLoading(false);
    }
  };

  const fetchChannels = async (serverId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('認証トークンがありません。ログインしてください。');
        return;
      }
      
      const response = await fetch(`http://localhost:3000/api/servers/${serverId}/channels`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        // レスポンスの詳細情報を取得
        const errorText = await response.text();
        console.error('サーバーからのエラーレスポンス:', response.status, errorText);
        throw new Error('チャンネルの取得に失敗しました');
      }

      const data = await response.json();
      setChannels(data.channels);
      
      // チャンネルが取得できた場合の処理
      if (data.channels && data.channels.length > 0) {
        // 現在のパスがチャンネルを指していない場合は、最初のチャンネルに移動
        const currentPath = pathname;
        const isInChannel = currentPath.includes('/channels/') && 
                           data.channels.some((channel: Channel) => currentPath.includes(channel.id));
        
        if (!isInChannel && pathname === '/channels') {
          router.push(`/channels/${data.channels[0].id}`);
        }
      }
    } catch (error) {
      console.error('Error fetching channels:', error);
    }
  };

  const createServer = async (name: string, description: string) => {
    try {
      const token = localStorage.getItem('token');
      
      // トークンが存在しない場合の処理を追加
      if (!token) {
        console.error('認証トークンがありません。ログインしてください。');
        // エラー状態を設定するか、ログインページにリダイレクトするなどの処理を追加
        return;
      }
      
      console.log('リクエスト送信前のトークン:', token); // デバッグ用
      
      const requestOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name, description }),
      };
      
      console.log('リクエスト詳細:', {
        url: 'http://localhost:3000/api/servers',
        method: requestOptions.method,
        headers: requestOptions.headers,
        body: requestOptions.body
      });
      
      const response = await fetch('http://localhost:3000/api/servers', requestOptions);

      console.log('レスポンスステータス:', response.status);
      console.log('レスポンスヘッダー:', Object.fromEntries([...response.headers.entries()]));

      if (!response.ok) {
        // レスポンスの詳細情報を取得
        const errorText = await response.text();
        console.error('サーバーからのエラーレスポンス:', response.status, errorText);
        throw new Error('サーバーの作成に失敗しました');
      }

      const data = await response.json();
      setShowNewServerModal(false);
      fetchServers();
      setSelectedServer(data.server.id);
    } catch (error) {
      console.error('Error creating server:', error);
    }
  };

  const createChannel = async (name: string, description: string, isPrivate: boolean) => {
    if (!selectedServer) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/servers/${selectedServer}/channels`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name, description, isPrivate }),
      });

      if (!response.ok) {
        throw new Error('チャンネルの作成に失敗しました');
      }

      setShowNewChannelModal(false);
      fetchChannels(selectedServer);
    } catch (error) {
      console.error('Error creating channel:', error);
    }
  };

  const addChannelMember = async (channelId: string, email: string) => {
    try {
      // First, get user ID from email
      const token = localStorage.getItem('token');
      const userResponse = await fetch(`http://localhost:3000/api/users/by-email?email=${email}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!userResponse.ok) {
        throw new Error('ユーザーの取得に失敗しました');
      }

      const userData = await userResponse.json();
      
      // Then add user to channel
      const response = await fetch(`http://localhost:3000/api/channels/${channelId}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: userData.user.id }),
      });

      if (!response.ok) {
        throw new Error('メンバーの追加に失敗しました');
      }

      setShowAddMemberModal(false);
    } catch (error) {
      console.error('Error adding channel member:', error);
    }
  };

  // モバイル表示時にリンククリック後にサイドバーを閉じる
  const handleLinkClick = () => {
    if (window.innerWidth <= 768) {
      closeSidebar();
    }
  };

  // サーバー選択時の処理
  const handleServerSelect = (serverId: string) => {
    setSelectedServer(serverId);
    
    // サーバーが選択されたら、そのサーバーの最初のチャンネルに移動
    if (channels.length > 0) {
      router.push(`/channels/${channels[0].id}`);
    }
  };

  return (
    <>
      <div 
        className={`
          bg-gray-800 text-white h-[calc(100vh-4rem)] fixed left-0 top-16 overflow-y-auto
          transition-all duration-300 z-40
          ${isSidebarOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full md:translate-x-0'}
          md:w-64
        `}
      >
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">サーバー</h2>
            <button 
              id="new-server-button"
              onClick={() => setShowNewServerModal(true)}
              className="p-1 rounded-full hover:bg-gray-700"
              title="新しいサーバーを作成"
            >
              <PlusIcon />
            </button>
          </div>

          {isLoading ? (
            <div className="text-center p-4">読み込み中...</div>
          ) : (
            <div className="space-y-1">
              {!servers || servers.length === 0 ? (
                <div className="text-center p-4 text-gray-400">
                  参加しているサーバが見つかりません
                </div>
              ) : (
                servers.map((server) => (
                  <button
                    key={server.id}
                    onClick={() => handleServerSelect(server.id)}
                    className={`w-full text-left px-3 py-2 rounded ${
                      server.id === selectedServer ? 'bg-gray-700' : 'hover:bg-gray-700'
                    }`}
                  >
                    <div className="font-medium">{server.name}</div>
                    <div className="text-xs text-gray-400">{server.memberCount} メンバー</div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {selectedServer && (
          <div className="mt-4 border-t border-gray-700 pt-4 px-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">チャンネル</h3>
              <button 
                onClick={() => setShowNewChannelModal(true)}
                className="p-1 rounded-full hover:bg-gray-700"
                title="新しいチャンネルを作成"
              >
                <PlusIcon />
              </button>
            </div>
            <div className="space-y-1">
              {channels.map((channel) => (
                <Link
                  key={channel.id}
                  href={`/channels/${channel.id}`}
                  className={`flex items-center px-3 py-1 rounded ${
                    channel.id === currentChannelId ? 'bg-gray-700' : 'hover:bg-gray-700'
                  }`}
                  onClick={handleLinkClick}
                >
                  {channel.isPrivate ? (
                    <LockIcon />
                  ) : (
                    <HashtagIcon />
                  )}
                  <span className="ml-2 truncate">{channel.name}</span>
                  
                  {channel.isPrivate && (
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowAddMemberModal(true);
                      }}
                      className="ml-auto p-1 rounded-full hover:bg-gray-600"
                      title="メンバーを追加"
                    >
                      <UserPlusIcon />
                    </button>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* モバイル表示時のオーバーレイ */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* New Server Modal */}
      {showNewServerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-white">新しいサーバーを作成</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const name = (form.elements.namedItem('name') as HTMLInputElement).value;
              const description = (form.elements.namedItem('description') as HTMLTextAreaElement).value;
              createServer(name, description);
            }}>
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">サーバー名</label>
                <input 
                  type="text" 
                  name="name" 
                  className="w-full p-2 bg-gray-700 rounded text-white" 
                  required 
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">説明</label>
                <textarea 
                  name="description" 
                  className="w-full p-2 bg-gray-700 rounded text-white" 
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button 
                  type="button" 
                  className="px-4 py-2 bg-gray-700 text-white rounded"
                  onClick={() => setShowNewServerModal(false)}
                >
                  キャンセル
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  作成
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Channel Modal */}
      {showNewChannelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-white">新しいチャンネルを作成</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const name = (form.elements.namedItem('name') as HTMLInputElement).value;
              const description = (form.elements.namedItem('description') as HTMLTextAreaElement).value;
              const isPrivate = (form.elements.namedItem('isPrivate') as HTMLInputElement).checked;
              createChannel(name, description, isPrivate);
            }}>
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">チャンネル名</label>
                <input 
                  type="text" 
                  name="name" 
                  className="w-full p-2 bg-gray-700 rounded text-white" 
                  required 
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">説明</label>
                <textarea 
                  name="description" 
                  className="w-full p-2 bg-gray-700 rounded text-white" 
                  rows={3}
                />
              </div>
              <div className="mb-4">
                <label className="flex items-center text-gray-300">
                  <input 
                    type="checkbox" 
                    name="isPrivate" 
                    className="mr-2" 
                  />
                  プライベートチャンネル（招待されたメンバーのみアクセス可能）
                </label>
              </div>
              <div className="flex justify-end space-x-2">
                <button 
                  type="button" 
                  className="px-4 py-2 bg-gray-700 text-white rounded"
                  onClick={() => setShowNewChannelModal(false)}
                >
                  キャンセル
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  作成
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMemberModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-white">メンバーを追加</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const email = (form.elements.namedItem('email') as HTMLInputElement).value;
              const channelId = currentChannelId;
              addChannelMember(channelId, email);
            }}>
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">ユーザーのメールアドレス</label>
                <input 
                  type="email" 
                  name="email" 
                  className="w-full p-2 bg-gray-700 rounded text-white" 
                  required 
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button 
                  type="button" 
                  className="px-4 py-2 bg-gray-700 text-white rounded"
                  onClick={() => setShowAddMemberModal(false)}
                >
                  キャンセル
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  追加
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
} 