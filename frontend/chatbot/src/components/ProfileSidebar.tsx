'use client';

import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';

type ProfileSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function ProfileSidebar({ isOpen, onClose }: ProfileSidebarProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'settings'>('profile');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-white dark:bg-gray-800 shadow-lg z-40 transform transition-transform duration-300 ease-in-out"
         style={{ transform: isOpen ? 'translateX(0)' : 'translateX(100%)' }}>
      {/* ヘッダー */}
      <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">プロフィール</h2>
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* タブ */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          className={`flex-1 py-3 text-sm font-medium ${
            activeTab === 'profile' 
              ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400' 
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
          onClick={() => setActiveTab('profile')}
        >
          プロフィール
        </button>
        <button
          className={`flex-1 py-3 text-sm font-medium ${
            activeTab === 'settings' 
              ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400' 
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
          onClick={() => setActiveTab('settings')}
        >
          設定
        </button>
      </div>

      {/* コンテンツ */}
      <div className="overflow-y-auto h-[calc(100vh-120px)] p-4">
        {activeTab === 'profile' ? (
          <div className="space-y-6">
            {/* プロフィール画像とユーザー名 */}
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center mb-3">
                {user?.username ? (
                  <span className="text-3xl font-bold text-gray-600 dark:text-gray-300">
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-gray-500 dark:text-gray-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                  </svg>
                )}
              </div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">{user?.username || '名前未設定'}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email || ''}</p>
            </div>

            {/* プロフィール情報 */}
            <div className="space-y-4">
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">基本情報</h4>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Chatwork ID</p>
                    <p className="text-sm text-gray-800 dark:text-white">{user?.chatworkId || '未設定'}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Skype</p>
                    <p className="text-sm text-gray-800 dark:text-white">{user?.skype || '未設定'}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">組織名</p>
                    <p className="text-sm text-gray-800 dark:text-white">{user?.organization || '未設定'}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">所属</p>
                    <p className="text-sm text-gray-800 dark:text-white">{user?.department || '未設定'}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">役職</p>
                    <p className="text-sm text-gray-800 dark:text-white">{user?.position || '未設定'}</p>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">連絡先</h4>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">所在地</p>
                    <p className="text-sm text-gray-800 dark:text-white">{user?.location || '未設定'}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">URL</p>
                    {user?.url ? (
                      <a href={user.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline">
                        {user.url}
                      </a>
                    ) : (
                      <p className="text-sm text-gray-800 dark:text-white">未設定</p>
                    )}
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">メールアドレス</p>
                    <p className="text-sm text-gray-800 dark:text-white">{user?.email || '未設定'}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">電話番号（勤務先）</p>
                    <p className="text-sm text-gray-800 dark:text-white">{user?.phoneWork || '未設定'}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">電話番号（内線）</p>
                    <p className="text-sm text-gray-800 dark:text-white">{user?.phoneInternal || '未設定'}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">電話番号（携帯）</p>
                    <p className="text-sm text-gray-800 dark:text-white">{user?.phoneMobile || '未設定'}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* アクションボタン */}
            <div className="flex space-x-2 pt-4">
              <button className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm font-medium transition-colors">
                プロフィールを編集
              </button>
              <button className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600 text-sm font-medium transition-colors">
                マイチャット
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white">アカウント設定</h3>
            
            {/* 設定項目 */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-white">ダークモード</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">画面の表示モードを切り替えます</p>
                </div>
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                  <input type="checkbox" id="toggle" className="sr-only" />
                  <label htmlFor="toggle" className="block h-6 rounded-full bg-gray-300 dark:bg-gray-600 cursor-pointer"></label>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-white">通知</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">メッセージの通知を受け取ります</p>
                </div>
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                  <input type="checkbox" id="notifications" className="sr-only" defaultChecked />
                  <label htmlFor="notifications" className="block h-6 rounded-full bg-blue-500 cursor-pointer"></label>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-white">サウンド</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">通知音を鳴らします</p>
                </div>
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                  <input type="checkbox" id="sound" className="sr-only" defaultChecked />
                  <label htmlFor="sound" className="block h-6 rounded-full bg-blue-500 cursor-pointer"></label>
                </div>
              </div>
              
              <div className="pt-4">
                <button className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm font-medium transition-colors">
                  設定を保存
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 