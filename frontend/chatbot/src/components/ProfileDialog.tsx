'use client';

import { useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

type ProfileDialogProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function ProfileDialog({ isOpen, onClose }: ProfileDialogProps) {
  const { user } = useAuth();
  const dialogRef = useRef<HTMLDivElement>(null);

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

  // ESCキーでダイアログを閉じる
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // プロフィールリンクをコピーする
  const handleCopyLink = () => {
    const profileLink = `https://www.chatwork.com/${user?.chatworkId || ''}`;
    navigator.clipboard.writeText(profileLink)
      .then(() => {
        alert('リンクをコピーしました');
      })
      .catch((err) => {
        console.error('コピーに失敗しました:', err);
      });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-20 z-50 overflow-y-auto">
      <div 
        ref={dialogRef}
        className="bg-gray-100 rounded-md shadow-lg w-full max-w-2xl mx-4 overflow-hidden"
      >
        {/* ヘッダー */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">プロフィール</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* カラフルなバナー */}
        <div className="h-8 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

        {/* プロフィール情報 */}
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold">{user?.username || '名前未設定'}</h3>
            <div className="flex space-x-2">
              <button className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm">
                プロフィールを編集
              </button>
              <button className="px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-sm">
                マイチャット
              </button>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex items-center mb-2">
              <span className="text-gray-700 font-medium">Chatwork ID:</span>
              <span className="ml-2 text-gray-800">{user?.chatworkId || '未設定'}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-gray-700 font-medium">プロフィールリンク</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 ml-1 text-gray-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
                </svg>
              </div>
              <div className="flex items-center">
                <span className="text-blue-500 mr-2">
                  https://www.chatwork.com/{user?.chatworkId || ''}
                </span>
                <button 
                  onClick={handleCopyLink}
                  className="px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-sm"
                >
                  リンクをコピー
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="flex">
                <span className="text-gray-700 font-medium w-32">Skype:</span>
                <span className="text-gray-800">{user?.skype || '未設定'}</span>
              </div>

              <div className="flex">
                <span className="text-gray-700 font-medium w-32">組織名:</span>
                <span className="text-gray-800">{user?.organization || '未設定'}</span>
              </div>

              <div className="flex">
                <span className="text-gray-700 font-medium w-32">所属:</span>
                <span className="text-gray-800">{user?.department || '未設定'}</span>
              </div>

              <div className="flex">
                <span className="text-gray-700 font-medium w-32">役職:</span>
                <span className="text-gray-800">{user?.position || '未設定'}</span>
              </div>

              <div className="flex">
                <span className="text-gray-700 font-medium w-32">所在地:</span>
                <span className="text-gray-800">{user?.location || '未設定'}</span>
              </div>

              <div className="flex">
                <span className="text-gray-700 font-medium w-32">URL:</span>
                <span className="text-gray-800">
                  {user?.url ? (
                    <a href={user.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                      {user.url}
                    </a>
                  ) : '未設定'}
                </span>
              </div>

              <div className="flex">
                <span className="text-gray-700 font-medium w-32">メールアドレス:</span>
                <span className="text-gray-800">{user?.email || '未設定'}</span>
              </div>

              <div className="flex">
                <span className="text-gray-700 font-medium w-32">電話番号（勤務先）:</span>
                <span className="text-gray-800">{user?.phoneWork || '未設定'}</span>
              </div>

              <div className="flex">
                <span className="text-gray-700 font-medium w-32">電話番号（内線）:</span>
                <span className="text-gray-800">{user?.phoneInternal || '未設定'}</span>
              </div>

              <div className="flex">
                <span className="text-gray-700 font-medium w-32">電話番号（携帯）:</span>
                <span className="text-gray-800">{user?.phoneMobile || '未設定'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 