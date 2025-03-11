'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import ServerSidebar from './ServerSidebar';
import { useSidebar } from '@/context/SidebarContext';
import { parseMessageContent } from '@/utils/messageParser';

// APIのベースURLを定義
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// パラメータの型定義
type ChannelParams = {
  id?: string;
};

// SVGアイコンコンポーネント
const PaperClipIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
  </svg>
);

const PencilIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
  </svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
  </svg>
);

const XMarkIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

interface Attachment {
  id: string;
  fileName: string;
  fileType: string;
  filePath: string;
  fileSize: number;
  uploadedAt: string;
}

interface Message {
  id: string;
  content: string;
  role: string;
  timestamp: string;
  channelId: string;
  userId: string;
  attachments: string[];
  isEdited: boolean;
  isDeleted: boolean;
  editedAt?: string;
}

export default function ChannelRoom() {
  const params = useParams() as ChannelParams;
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editingAttachments, setEditingAttachments] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isSidebarOpen } = useSidebar();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  // ポーリング用のインターバルIDを保持するref
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  // 最後に取得したメッセージのIDを保持するref
  const lastMessageIdRef = useRef<string | null>(null);

  // コンポーネントの初期化時にデバッグ情報を出力
  console.log('ChannelRoomコンポーネントが初期化されました');
  console.log('パラメータ:', params);
  console.log('環境変数:', {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
    NEXT_PUBLIC_FRONTEND_URL: process.env.NEXT_PUBLIC_FRONTEND_URL,
  });

  useEffect(() => {
    if (params.id) {
      fetchMessages();
      
      // ポーリングを開始（5秒ごとにメッセージを取得）
      startPolling();
    }
    
    // クリーンアップ関数
    return () => {
      stopPolling();
    };
  }, [params.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Clean up preview URLs when component unmounts
  useEffect(() => {
    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async (isPolling = false) => {
    try {
      if (!params.id) {
        console.error('チャンネルIDが指定されていません');
        return;
      }
      
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('認証トークンがありません');
        setError('認証トークンがありません。再度ログインしてください。');
        return;
      }
      
      console.log(`チャンネルID ${params.id} のメッセージを取得中...`);
      
      // ポーリング時は最後のメッセージID以降のメッセージのみを取得
      let url = `${API_URL}/api/channels/${params.id}/messages`;
      if (isPolling && lastMessageIdRef.current) {
        url += `?after=${lastMessageIdRef.current}`;
        console.log(`最後のメッセージID ${lastMessageIdRef.current} 以降のメッセージを取得します`);
      }
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('レスポンスステータス:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`メッセージ取得エラー: ${response.status} ${response.statusText}`, errorText);
        throw new Error(`メッセージの取得に失敗しました: ${response.status} ${response.statusText}`);
      }

      // レスポンスの生データを確認
      const responseText = await response.text();
      
      // 空のレスポンスの場合は早期リターン
      if (!responseText || responseText.trim() === '') {
        console.warn('レスポンスが空です');
        if (!isPolling) {
          setMessages([]);
        }
        return;
      }
      
      // JSONとしてパース
      let data: any = null;
      try {
        data = JSON.parse(responseText);
        
        // データが配列の場合（直接メッセージの配列が返される場合）
        if (Array.isArray(data)) {
          if (data.length > 0) {
            // 最後のメッセージIDを更新
            const lastMessage = data[data.length - 1];
            if (lastMessage && lastMessage.id) {
              lastMessageIdRef.current = lastMessage.id;
              console.log('最後のメッセージIDを更新:', lastMessageIdRef.current);
            }
            
            if (isPolling) {
              // ポーリングの場合は既存のメッセージに新しいメッセージを追加（重複を防ぐ）
              setMessages(prevMessages => {
                // 既存のメッセージIDを取得
                const existingIds = new Set(prevMessages.map(msg => msg.id));
                // 重複しないメッセージのみをフィルタリング
                const newMessages = data.filter((msg: Message) => !existingIds.has(msg.id));
                console.log('新しいメッセージを追加:', newMessages.length);
                
                if (newMessages.length === 0) {
                  return prevMessages; // 新しいメッセージがなければ状態を更新しない
                }
                
                return [...prevMessages, ...newMessages];
              });
            } else {
              // 初回読み込みの場合はすべてのメッセージを設定
              setMessages(data);
              console.log('すべてのメッセージを設定:', data.length);
            }
          } else if (!isPolling) {
            // データが空で初回読み込みの場合は空の配列を設定
            setMessages([]);
          }
          return;
        }
        
        // データがオブジェクトで、messagesプロパティがある場合
        if (data && typeof data === 'object' && 'messages' in data) {
          // messagesがnullでないことを確認
          if (data.messages === null) {
            console.warn('messagesプロパティがnullです');
            if (!isPolling) {
              setMessages([]);
            }
            return;
          }
          
          // messagesが配列であることを確認
          if (!Array.isArray(data.messages)) {
            console.warn('messagesプロパティが配列ではありません:', typeof data.messages);
            if (!isPolling) {
              setMessages([]);
            }
            return;
          }
          
          if (data.messages.length > 0) {
            // 最後のメッセージIDを更新
            const lastMessage = data.messages[data.messages.length - 1];
            if (lastMessage && lastMessage.id) {
              lastMessageIdRef.current = lastMessage.id;
              console.log('最後のメッセージIDを更新:', lastMessageIdRef.current);
            }
            
            if (isPolling) {
              // ポーリングの場合は既存のメッセージに新しいメッセージを追加（重複を防ぐ）
              setMessages(prevMessages => {
                // 既存のメッセージIDを取得
                const existingIds = new Set(prevMessages.map(msg => msg.id));
                // 重複しないメッセージのみをフィルタリング
                const newMessages = data.messages.filter((msg: Message) => !existingIds.has(msg.id));
                console.log('新しいメッセージを追加:', newMessages.length);
                
                if (newMessages.length === 0) {
                  return prevMessages; // 新しいメッセージがなければ状態を更新しない
                }
                
                return [...prevMessages, ...newMessages];
              });
            } else {
              // 初回読み込みの場合はすべてのメッセージを設定
              setMessages(data.messages);
              console.log('すべてのメッセージを設定:', data.messages.length);
            }
          } else if (!isPolling) {
            // データが空で初回読み込みの場合は空の配列を設定
            setMessages([]);
          }
          return;
        }
        
        // その他の場合
        console.warn('予期しないデータ形式です:', data);
        if (!isPolling) {
          setMessages([]);
        }
      } catch (err) {
        console.error('JSONパースエラー:', err);
        setError(err instanceof Error ? err.message : '予期せぬエラーが発生しました');
        if (!isPolling) {
          setMessages([]);
        }
      }
    } catch (err) {
      console.error('メッセージ取得エラー:', err);
      setError(err instanceof Error ? err.message : '予期せぬエラーが発生しました');
      if (!isPolling) {
        setMessages([]);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newMessage.trim() === '' && selectedFiles.length === 0) {
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      
      // ファイルがある場合はファイルアップロードとメッセージを一緒に送信
      if (selectedFiles.length > 0) {
        const formData = new FormData();
        
        // ファイルを追加
        const file = selectedFiles[0]; // 最初のファイルのみ処理
        formData.append('file', file);
        
        // テキストメッセージを常に追加（空でも）
        formData.append('content', newMessage);
        
        console.log('Uploading file:', file.name, 'size:', file.size, 'type:', file.type);
        console.log('With message content:', newMessage);
        
        try {
          // Content-Typeヘッダーを設定しない（ブラウザが自動的に設定する）
          const uploadResponse = await fetch(`${API_URL}/api/channels/${params.id}/upload`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
            body: formData,
          });
          
          console.log('Upload response status:', uploadResponse.status);
          
          if (!uploadResponse.ok) {
            const errorText = await uploadResponse.text();
            console.error('Upload error:', errorText);
            try {
              const errorData = JSON.parse(errorText);
              throw new Error(errorData.error || 'ファイルのアップロードに失敗しました');
            } catch (e) {
              throw new Error('ファイルのアップロードに失敗しました: ' + errorText);
            }
          }
          
          const responseData = await uploadResponse.json();
          console.log('Upload success:', responseData);
        } catch (error) {
          console.error('Upload error:', error);
          setError(error instanceof Error ? error.message : '予期せぬエラーが発生しました');
        }
      } 
      // ファイルがなく、テキストメッセージのみの場合
      else if (newMessage.trim() !== '') {
        const messageResponse = await fetch(`${API_URL}/api/channels/${params.id}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            content: newMessage,
          }),
        });
        
        if (!messageResponse.ok) {
          const errorData = await messageResponse.json().catch(() => ({ error: 'メッセージの送信に失敗しました' }));
          throw new Error(errorData.error || 'メッセージの送信に失敗しました');
        }
      }

      setNewMessage('');
      setSelectedFiles([]);
      setPreviewUrls([]);
      fetchMessages(); // 全メッセージを再取得
      
      // 送信後にポーリングを再開して最新状態を維持
      startPolling();
    } catch (err) {
      console.error('Error in handleSubmit:', err);
      setError(err instanceof Error ? err.message : '予期せぬエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...filesArray]);
      
      // Create preview URLs
      const newPreviewUrls = filesArray.map(file => URL.createObjectURL(file));
      setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    URL.revokeObjectURL(previewUrls[index]);
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const startEditing = (message: Message) => {
    setEditingMessageId(message.id);
    setEditContent(message.content);
    setEditingAttachments(message.attachments || []);
  };

  const cancelEditing = () => {
    setEditingMessageId(null);
    setEditContent('');
    setEditingAttachments([]);
  };

  const saveEdit = async () => {
    if (!editingMessageId || !editContent.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/messages/${editingMessageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ content: editContent }),
      });

      if (!response.ok) {
        throw new Error('メッセージの編集に失敗しました');
      }

      fetchMessages();
      cancelEditing();
      
      // 編集後にポーリングを再開
      startPolling();
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期せぬエラーが発生しました');
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!confirm('このメッセージを削除しますか？')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/messages/${messageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('メッセージの削除に失敗しました');
      }

      fetchMessages();
      
      // 削除後にポーリングを再開
      startPolling();
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期せぬエラーが発生しました');
    }
  };

  const renderAttachment = (path: string) => {
    // パスからファイル名を抽出
    const fileName = path.split('/').pop() || '';
    const fileExt = fileName.split('.').pop()?.toLowerCase() || '';
    
    // ファイルのURLを構築（パスの重複を防ぐ）
    let normalizedPath = '';
    
    // ファイル名だけの場合（例: 316dc40d-692a-48ea-8ee9-9607d1096589.png）
    if (!path.includes('/')) {
      normalizedPath = `/uploads/${path}`;
    } 
    // すでにuploadsが含まれている場合（例: uploads/316dc40d-692a-48ea-8ee9-9607d1096589.png）
    else if (path.includes('uploads/')) {
      // uploadsの前にスラッシュがない場合は追加
      if (path.startsWith('uploads/')) {
        normalizedPath = `/${path}`;
      } 
      // すでに/uploads/の形式になっている場合はそのまま使用
      else if (path.startsWith('/uploads/')) {
        normalizedPath = path;
      }
      // ./uploads/の形式の場合は/uploads/に変換
      else if (path.startsWith('./uploads/')) {
        normalizedPath = path.replace('./uploads/', '/uploads/');
      }
    }
    // その他の場合は単純に/uploadsを前に追加
    else {
      normalizedPath = `/uploads/${path}`;
    }
    
    const fileUrl = `${API_URL}${normalizedPath}`;
    console.log('Attachment URL:', fileUrl, 'Original path:', path);
    
    // Check if it's an image
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExt)) {
      return (
        <div className="mt-2">
          <img 
            src={fileUrl} 
            alt={fileName}
            className="max-w-full max-h-64 rounded"
          />
        </div>
      );
    }
    
    // Check if it's a video
    if (['mp4', 'webm', 'mov'].includes(fileExt)) {
      return (
        <div className="mt-2">
          <video 
            controls 
            className="max-w-full max-h-64 rounded"
          >
            <source src={fileUrl} type={`video/${fileExt}`} />
            Your browser does not support the video tag.
          </video>
        </div>
      );
    }
    
    // For other file types, show a download link
    return (
      <div className="mt-2">
        <a 
          href={fileUrl}
          download={fileName}
          className="flex items-center p-2 bg-gray-100 rounded hover:bg-gray-200"
        >
          <span className="mr-2">📎</span>
          <span className="text-blue-500 underline">{fileName}</span>
        </a>
      </div>
    );
  };

  // ポーリングを開始する関数
  const startPolling = () => {
    // 既存のポーリングがあれば停止
    stopPolling();
    
    // 5秒ごとにメッセージを取得
    pollingIntervalRef.current = setInterval(() => {
      console.log('ポーリングによるメッセージ取得');
      fetchMessages(true); // ポーリングフラグをtrueに設定
    }, 5000);
    
    console.log('メッセージポーリングを開始しました');
  };
  
  // ポーリングを停止する関数
  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
      console.log('メッセージポーリングを停止しました');
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* サイドバー */}
      <ServerSidebar />
      
      {/* メインコンテンツ */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'md:ml-64' : ''}`}>
        {/* ヘッダー */}
        <header className="bg-white border-b border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-800">チャンネル</h1>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                {isLoading ? '接続中...' : '接続済み'}
              </span>
              <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-yellow-400' : 'bg-green-500'}`}></div>
            </div>
          </div>
        </header>
        
        {/* メッセージエリア */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* エラーメッセージ */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 m-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* メッセージリスト */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6" ref={messagesContainerRef}>
            {messages && messages.length > 0 ? (
              messages.map((message) => (
                <div key={message.id} className="animate-fadeIn">
                  <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {/* アバターとメッセージのコンテナ */}
                    <div className={`flex ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'} max-w-[80%]`}>
                      {/* アバター */}
                      <div className={`flex-shrink-0 ${message.role === 'user' ? 'ml-3' : 'mr-3'}`}>
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white
                          ${message.role === 'user' ? 'bg-blue-600' : 'bg-gray-600'}`}>
                          {message.role === 'user' ? 'U' : 'B'}
                        </div>
                      </div>
                      
                      {/* メッセージ本体 */}
                      <div>
                        {/* 編集モード */}
                        {editingMessageId === message.id ? (
                          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                            <textarea
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              rows={3}
                            />
                            
                            {/* 編集中の添付ファイル */}
                            {editingAttachments.length > 0 && (
                              <div className="mt-3">
                                <p className="text-xs text-gray-500 mb-2">添付ファイル:</p>
                                <div className="flex flex-wrap gap-2">
                                  {editingAttachments.map((path, index) => (
                                    <div key={index} className="relative">
                                      <div className="h-16 w-16 border border-gray-200 rounded overflow-hidden">
                                        {/\.(jpg|jpeg|png|gif|webp)$/i.test(path) ? (
                                          <img src={path} alt="添付ファイル" className="h-full w-full object-cover" />
                                        ) : (
                                          <div className="h-full w-full flex items-center justify-center bg-gray-100">
                                            <span className="text-2xl">📄</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {/* 編集ボタン */}
                            <div className="flex justify-end space-x-2 mt-3">
                              <button
                                onClick={cancelEditing}
                                className="px-3 py-1.5 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition"
                              >
                                キャンセル
                              </button>
                              <button
                                onClick={saveEdit}
                                className="px-3 py-1.5 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md transition"
                              >
                                保存
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            {/* 通常表示モード */}
                            <div className={`rounded-lg px-4 py-3 shadow-sm
                              ${message.role === 'user' 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-white border border-gray-200 text-gray-800'
                              }
                              ${message.isDeleted ? 'opacity-60' : ''}
                            `}>
                              {/* メッセージ内容 */}
                              {message.isDeleted ? (
                                <p className="italic text-sm opacity-75">このメッセージは削除されました</p>
                              ) : (
                                <div className="whitespace-pre-wrap break-words">
                                  {parseMessageContent(message.content)}
                                </div>
                              )}
                              
                              {/* 添付ファイル */}
                              {!message.isDeleted && message.attachments && message.attachments.length > 0 && (
                                <div className="mt-3 space-y-2">
                                  {message.attachments.map((path, index) => (
                                    <div key={index}>
                                      {renderAttachment(path)}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                            
                            {/* メッセージのメタ情報 */}
                            <div className={`flex items-center mt-1 text-xs
                              ${message.role === 'user' ? 'justify-end' : 'justify-start'}
                            `}>
                              <span className="text-gray-500">
                                {new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </span>
                              
                              {message.isEdited && (
                                <span className="ml-2 text-gray-500">(編集済み)</span>
                              )}
                              
                              {/* 編集・削除ボタン */}
                              {message.role === 'user' && !message.isDeleted && (
                                <div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={() => startEditing(message)}
                                    className="text-gray-400 hover:text-blue-600 p-1"
                                    title="編集"
                                  >
                                    <PencilIcon />
                                  </button>
                                  <button
                                    onClick={() => deleteMessage(message.id)}
                                    className="text-gray-400 hover:text-red-600 p-1"
                                    title="削除"
                                  >
                                    <TrashIcon />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center p-6 max-w-sm mx-auto">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">メッセージはありません</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    このチャンネルでの会話を始めましょう。
                  </p>
                </div>
              </div>
            )}
            
            {/* ローディングインジケーター */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 max-w-[80%]">
                  <div className="flex items-center space-x-2">
                    <div className="animate-pulse flex space-x-2">
                      <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                      <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                      <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                    </div>
                    <p className="text-sm text-gray-500">応答を生成中...</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* 自動スクロール用の参照ポイント */}
            <div ref={messagesEndRef} />
          </div>
          
          {/* 入力エリア */}
          <div className="border-t border-gray-200 bg-white p-4">
            {/* 選択したファイルのプレビュー */}
            {selectedFiles.length > 0 && (
              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="relative group">
                      <div className="h-16 w-16 border border-gray-200 rounded-md overflow-hidden bg-gray-50">
                        {file.type.startsWith('image/') ? (
                          <img 
                            src={URL.createObjectURL(file)} 
                            alt={file.name} 
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex flex-col items-center justify-center p-1">
                            <span className="text-xl">📄</span>
                            <span className="text-xs truncate w-full text-center">{file.name.split('.').pop()}</span>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => removeFile(index)}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <XMarkIcon />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* メッセージフォーム */}
            <form onSubmit={handleSubmit} className="relative">
              <div className="overflow-hidden rounded-lg border border-gray-300 shadow-sm focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="メッセージを入力..."
                  className="block w-full resize-none border-0 py-3 px-4 focus:outline-none focus:ring-0 sm:text-sm"
                  rows={3}
                  disabled={isLoading}
                />
                
                {/* ツールバー */}
                <div className="flex items-center justify-between border-t border-gray-200 p-2 bg-gray-50">
                  <div className="flex space-x-1">
                    <button
                      type="button"
                      onClick={() => document.getElementById('file-upload')?.click()}
                      className="p-2 rounded-full text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition"
                      disabled={isLoading}
                    >
                      <PaperClipIcon />
                    </button>
                    <input
                      id="file-upload"
                      type="file"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                      accept="image/*,.pdf,.doc,.docx,.txt"
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isLoading || (!newMessage.trim() && selectedFiles.length === 0)}
                    className={`inline-flex items-center rounded-md px-4 py-2 text-sm font-medium text-white shadow-sm
                      ${isLoading || (!newMessage.trim() && selectedFiles.length === 0)
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                      }
                    `}
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        送信中...
                      </>
                    ) : '送信'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 