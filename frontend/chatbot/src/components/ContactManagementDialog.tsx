'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';

// APIのベースURLを定義
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// ユーザー型定義
type User = {
  id: string;
  username: string;
  email: string;
  createdAt: string;
  chatworkId?: string;
  bio?: string;
  organization?: string;
  position?: string;
  location?: string;
  url?: string;
  phoneWork?: string;
  phoneInternal?: string;
  phoneMobile?: string;
};

// プロップス型定義
type ContactManagementDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelectUser?: (user: User) => void;
  onStartChat?: (user: User) => void;
};

// タブの種類
type TabType = 'invite' | 'search' | 'contacts' | 'pending';

// 検索アイコン
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
  </svg>
);

// ユーザーアイコン
const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
  </svg>
);

// 閉じるアイコン
const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// コンタクト管理ダイアログコンポーネント
export default function ContactManagementDialog({ isOpen, onClose, onSelectUser, onStartChat }: ContactManagementDialogProps) {
  const [activeTab, setActiveTab] = useState<TabType>('contacts');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [contacts, setContacts] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { token } = useAuth();
  const dialogRef = useRef<HTMLDivElement>(null);

  // コンタクト一覧を取得
  useEffect(() => {
    const fetchContacts = async () => {
      if (!token) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`${API_URL}/api/contacts`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });
        
        if (!response.ok) {
          throw new Error('コンタクト一覧の取得に失敗しました');
        }
        
        const data = await response.json();
        
        if (Array.isArray(data)) {
          setContacts(data);
        } else {
          setContacts([]);
          setError('予期しないレスポンス形式を受信しました');
        }
      } catch (err) {
        console.error('コンタクト取得エラー:', err);
        setError(err instanceof Error ? err.message : 'コンタクト取得中にエラーが発生しました');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (isOpen && activeTab === 'contacts') {
      fetchContacts();
    }
  }, [isOpen, activeTab, token]);

  // 検索クエリが変更されたときに検索を実行
  useEffect(() => {
    const searchUsers = async () => {
      if (!searchQuery.trim() || !token) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`${API_URL}/api/users?q=${encodeURIComponent(searchQuery)}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('エラーレスポンス:', errorText);
          throw new Error('ユーザー検索に失敗しました');
        }
        
        const responseText = await response.text();
        
        let data;
        try {
          data = responseText ? JSON.parse(responseText) : [];
        } catch (parseError) {
          console.error('JSONパースエラー:', parseError);
          setError('レスポンスの解析に失敗しました');
          setSearchResults([]);
          return;
        }
        
        // データが配列であることを確認
        if (Array.isArray(data)) {
          setSearchResults(data);
          // ダミーデータを追加（実際の実装では削除してください）
          if (data.length === 0) {
            setSearchResults([
              {
                id: '1',
                username: 'g.sota',
                email: 'g.sota@example.com',
                createdAt: new Date().toISOString(),
                chatworkId: 'ststs412'
              },
              {
                id: '2',
                username: 'n777cc',
                email: 'n777cc@example.com',
                createdAt: new Date().toISOString(),
                chatworkId: 'n777cc'
              },
              {
                id: '3',
                username: '源口 聡則',
                email: 'minaguchi@example.com',
                createdAt: new Date().toISOString()
              },
              {
                id: '4',
                username: '比嘉浩司',
                email: 'higa@example.com',
                createdAt: new Date().toISOString(),
                chatworkId: 'yokosuka205k9'
              }
            ]);
          }
          setTotalPages(Math.ceil(data.length / 10) || 1);
        } else if (data === null) {
          setSearchResults([]);
        } else {
          setSearchResults([]);
          setError('予期しないレスポンス形式を受信しました');
        }
      } catch (err) {
        console.error('検索エラー:', err);
        setError(err instanceof Error ? err.message : '検索中にエラーが発生しました');
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    // デバウンス処理
    const timeoutId = setTimeout(() => {
      if (activeTab === 'search') {
        searchUsers();
      }
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [searchQuery, token, activeTab]);

  // ダイアログの外側をクリックしたときに閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // ダイアログが開いたときにフォーカスを設定
  useEffect(() => {
    if (isOpen) {
      const input = document.getElementById('contact-search-input');
      if (input) {
        input.focus();
      }
    }
  }, [isOpen]);

  // ユーザー選択処理
  const handleSelectUser = (user: User) => {
    console.log('Selected user:', user);
    setSelectedUser(user);
    // onSelectUserコールバックは呼び出さない
    // if (onSelectUser) {
    //   onSelectUser(user);
    // }
  };

  // ダイレクトチャットを開始
  const handleStartChat = (user: User) => {
    if (onStartChat) {
      onStartChat(user);
    }
    onClose();
  };

  // 表示するユーザーリスト
  const displayUsers = activeTab === 'search' ? searchResults : contacts;

  // ページネーション処理
  const paginatedUsers = displayUsers.slice((currentPage - 1) * 10, currentPage * 10);

  // 前のページへ
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // 次のページへ
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // 最初のページへ
  const goToFirstPage = () => {
    setCurrentPage(1);
  };

  // 最後のページへ
  const goToLastPage = () => {
    setCurrentPage(totalPages);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div 
        ref={dialogRef}
        className="bg-white rounded-lg shadow-lg w-full max-w-4xl mx-4 flex flex-col"
        style={{ height: '80vh', maxHeight: '700px' }}
      >
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">コンタクト管理</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <CloseIcon />
          </button>
        </div>
        
        {/* タブナビゲーション */}
        <div className="flex border-b border-gray-200">
          <button
            className={`px-4 py-2 ${activeTab === 'invite' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
            onClick={() => setActiveTab('invite')}
          >
            招待してつながる
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'search' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
            onClick={() => setActiveTab('search')}
          >
            利用中の知り合いを探す
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'contacts' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
            onClick={() => setActiveTab('contacts')}
          >
            コンタクト一覧(4)
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'pending' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
            onClick={() => setActiveTab('pending')}
          >
            未追加(5)
          </button>
        </div>
        
        <div className="flex flex-1 overflow-hidden">
          {/* 左側：ユーザーリスト */}
          <div className="w-1/2 border-r border-gray-200 flex flex-col">
            {/* 検索フォーム */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <SearchIcon />
                </div>
                <input
                  id="contact-search-input"
                  type="text"
                  className="border border-gray-300 w-full pl-10 pr-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="コンタクト名を検索"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button 
                  className="absolute inset-y-0 right-0 px-3 bg-blue-500 text-white rounded-r-md"
                  onClick={() => {/* 検索実行 */}}
                >
                  検索
                </button>
              </div>
              
              {error && (
                <div className="mt-2 text-red-500 text-sm">
                  {error}
                </div>
              )}
            </div>
            
            {/* ユーザーリスト */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="text-center py-4 text-gray-500">
                  読み込み中...
                </div>
              ) : paginatedUsers.length > 0 ? (
                <ul>
                  {paginatedUsers.map((user) => (
                    <li 
                      key={user.id}
                      className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 flex items-center ${selectedUser?.id === user.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
                      onClick={() => handleSelectUser(user)}
                    >
                      <div className="w-10 h-10 bg-gray-300 rounded-full mr-3 flex-shrink-0 overflow-hidden">
                        {/* ユーザーアバター */}
                        <div className="w-full h-full flex items-center justify-center text-gray-600">
                          <UserIcon />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-800">{user.username}</div>
                        {user.chatworkId && (
                          <div className="text-sm text-gray-500">Chatwork ID: {user.chatworkId}</div>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onSelectUser) {
                              onSelectUser(user);
                            }
                          }}
                        >
                          招待
                        </button>
                        <button
                          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartChat(user);
                          }}
                        >
                          ダイレクトチャット
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  {activeTab === 'search' && searchQuery 
                    ? 'ユーザーが見つかりませんでした' 
                    : activeTab === 'contacts' 
                      ? 'コンタクトがありません' 
                      : 'ユーザーが見つかりませんでした'}
                </div>
              )}
            </div>
            
            {/* ページネーション */}
            <div className="p-3 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                {displayUsers.length > 0 ? `${currentPage} / ${totalPages}` : ''}
              </div>
              <div className="flex space-x-1">
                <button
                  className="px-2 py-1 border border-gray-300 rounded text-gray-600 disabled:opacity-50"
                  onClick={goToFirstPage}
                  disabled={currentPage === 1}
                >
                  &lt;&lt;
                </button>
                <button
                  className="px-2 py-1 border border-gray-300 rounded text-gray-600 disabled:opacity-50"
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                >
                  &lt;
                </button>
                <button
                  className="px-2 py-1 border border-gray-300 rounded text-gray-600 disabled:opacity-50"
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                >
                  &gt;
                </button>
                <button
                  className="px-2 py-1 border border-gray-300 rounded text-gray-600 disabled:opacity-50"
                  onClick={goToLastPage}
                  disabled={currentPage === totalPages}
                >
                  &gt;&gt;
                </button>
              </div>
            </div>
          </div>
          
          {/* 右側：ユーザー詳細 */}
          <div className="w-1/2 p-4 overflow-y-auto">
            {selectedUser ? (
              <div>
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">{selectedUser.username}</h3>
                  <button
                    className="text-gray-500 hover:text-gray-700"
                    onClick={() => setSelectedUser(null)}
                  >
                    <CloseIcon />
                  </button>
                </div>
                
                {/* プロフィール画像 */}
                <div className="mb-6">
                  <div className="w-full h-40 bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center">
                    {/* ここにプロフィール画像を表示 */}
                    <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center text-gray-600">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                {/* プロフィール情報 */}
                <div className="space-y-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-500 mb-1">自己紹介:</h4>
                    <p className="text-gray-700">{selectedUser.bio || '未設定'}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-500 mb-1">組織名:</h4>
                      <p className="text-gray-700">{selectedUser.organization || '未設定'}</p>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-500 mb-1">所属:</h4>
                      <p className="text-gray-700">{selectedUser.position || '未設定'}</p>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-500 mb-1">役職:</h4>
                      <p className="text-gray-700">{selectedUser.position || '未設定'}</p>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-500 mb-1">所在地:</h4>
                      <p className="text-gray-700">{selectedUser.location || '未設定'}</p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-500 mb-1">URL:</h4>
                    <p className="text-gray-700">
                      {selectedUser.url ? (
                        <a href={selectedUser.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                          {selectedUser.url}
                        </a>
                      ) : '未設定'}
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-500 mb-1">メールアドレス:</h4>
                    <p className="text-gray-700">{selectedUser.email || '未設定'}</p>
                  </div>
                  
                  <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-500">
                    <h4 className="text-sm font-medium text-blue-700 mb-1">連絡先情報</h4>
                    <div className="grid grid-cols-1 gap-2 mt-2">
                      <div>
                        <span className="text-sm text-gray-500">電話番号（勤務先）:</span>
                        <p className="text-gray-700">{selectedUser.phoneWork || '未設定'}</p>
                      </div>
                      
                      <div>
                        <span className="text-sm text-gray-500">電話番号（内線）:</span>
                        <p className="text-gray-700">{selectedUser.phoneInternal || '未設定'}</p>
                      </div>
                      
                      <div>
                        <span className="text-sm text-gray-500">電話番号（携帯）:</span>
                        <p className="text-gray-700">{selectedUser.phoneMobile || '未設定'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-center space-x-4">
                    <button
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center"
                      onClick={() => {
                        if (onStartChat) {
                          onStartChat(selectedUser);
                        }
                        onClose();
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
                      </svg>
                      ダイレクトチャットを開始
                    </button>
                    <button
                      className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center"
                      onClick={() => {
                        if (onSelectUser && selectedUser) {
                          onSelectUser(selectedUser);
                        }
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
                      </svg>
                      チャンネルに招待
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 p-6">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center text-gray-400 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                  </svg>
                </div>
                <p className="text-lg font-medium mb-2">ユーザーを選択してください</p>
                <p className="text-center text-sm max-w-xs">
                  左側のリストからユーザーを選択すると、詳細情報がここに表示されます。
                </p>
                {activeTab === 'search' && searchQuery === '' && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100 max-w-xs">
                    <p className="text-blue-700 text-sm">
                      検索ボックスにユーザー名やメールアドレスを入力して、ユーザーを検索できます。
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 