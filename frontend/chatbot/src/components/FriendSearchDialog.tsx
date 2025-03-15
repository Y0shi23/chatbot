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
};

// プロップス型定義
type FriendSearchDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelectUser: (user: User) => void;
  title?: string;
};

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

// フレンド検索ダイアログコンポーネント
export default function FriendSearchDialog({ isOpen, onClose, onSelectUser, title = 'フレンドを検索' }: FriendSearchDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();
  const dialogRef = useRef<HTMLDivElement>(null);

  // 検索クエリが変更されたときに検索を実行
  useEffect(() => {
    const searchUsers = async () => {
      if (!searchQuery.trim() || !token) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        console.log('検索クエリ:', searchQuery);
        console.log('トークン:', token);
        console.log('リクエストURL:', `${API_URL}/api/users?q=${encodeURIComponent(searchQuery)}`);
        
        const response = await fetch(`${API_URL}/api/users?q=${encodeURIComponent(searchQuery)}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });
        
        console.log('レスポンスステータス:', response.status);
        console.log('レスポンスヘッダー:', Object.fromEntries([...response.headers.entries()]));
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('エラーレスポンス:', errorText);
          throw new Error('ユーザー検索に失敗しました');
        }
        
        const responseText = await response.text();
        console.log('レスポンステキスト:', responseText);
        
        let data;
        try {
          data = responseText ? JSON.parse(responseText) : [];
          console.log('パース後の検索結果:', data);
        } catch (parseError) {
          console.error('JSONパースエラー:', parseError);
          setError('レスポンスの解析に失敗しました');
          setSearchResults([]);
          return;
        }
        
        // データが配列であることを確認
        if (Array.isArray(data)) {
          setSearchResults(data);
        } else if (data === null) {
          console.log('レスポンスがnullです。空の配列として処理します。');
          setSearchResults([]);
        } else {
          console.error('予期しないレスポンス形式:', data);
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
      searchUsers();
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [searchQuery, token]);

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
      const input = document.getElementById('friend-search-input');
      if (input) {
        input.focus();
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div 
        ref={dialogRef}
        className="bg-gray-800 rounded-lg shadow-lg w-full max-w-md mx-4"
      >
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
        </div>
        
        <div className="p-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <SearchIcon />
            </div>
            <input
              id="friend-search-input"
              type="text"
              className="bg-gray-700 text-white w-full pl-10 pr-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="ユーザー名またはメールアドレスで検索"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {error && (
            <div className="mt-2 text-red-400 text-sm">
              {error}
            </div>
          )}
          
          <div className="mt-4 max-h-60 overflow-y-auto">
            {isLoading ? (
              <div className="text-center py-4 text-gray-400">
                検索中...
              </div>
            ) : (searchResults && searchResults.length > 0) ? (
              <ul className="space-y-1">
                {searchResults.map((user) => (
                  <li 
                    key={user.id}
                    className="p-2 hover:bg-gray-700 rounded-md cursor-pointer flex items-center"
                    onClick={() => onSelectUser(user)}
                  >
                    <div className="bg-gray-600 rounded-full p-2 mr-3">
                      <UserIcon />
                    </div>
                    <div>
                      <div className="font-medium text-white">{user.username}</div>
                      <div className="text-sm text-gray-400">{user.email}</div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : searchQuery ? (
              <div className="text-center py-4 text-gray-400">
                ユーザーが見つかりませんでした
              </div>
            ) : (
              <div className="text-center py-4 text-gray-400">
                ユーザー名またはメールアドレスで検索してください
              </div>
            )}
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-700 flex justify-end">
          <button
            className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
            onClick={onClose}
          >
            キャンセル
          </button>
        </div>
      </div>
    </div>
  );
} 