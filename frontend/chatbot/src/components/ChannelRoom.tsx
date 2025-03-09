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
    }
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

  const fetchMessages = async () => {
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
      console.log('認証トークン:', token.substring(0, 10) + '...');
      
      const response = await fetch(`${API_URL}/api/channels/${params.id}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('レスポンスステータス:', response.status);
      console.log('レスポンスヘッダー:', Object.fromEntries([...response.headers.entries()]));

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`メッセージ取得エラー: ${response.status} ${response.statusText}`, errorText);
        throw new Error(`メッセージの取得に失敗しました: ${response.status} ${response.statusText}`);
      }

      // レスポンスの生データを確認
      const responseText = await response.text();
      console.log('チャンネルメッセージ取得レスポンス（生テキスト）:', responseText);
      
      // 空のレスポンスの場合は早期リターン
      if (!responseText || responseText.trim() === '') {
        console.warn('レスポンスが空です');
        setMessages([]);
        return;
      }
      
      // JSONとしてパース
      let data = null;
      try {
        data = JSON.parse(responseText);
        console.log('チャンネルメッセージ取得レスポンス（パース後）:', data);
        
        // データの構造を詳細に確認
        console.log('データ型:', typeof data);
        if (data === null) {
          console.error('データがnullです');
          setMessages([]);
          return;
        }
        
        console.log('データの構造:', Array.isArray(data) ? 'Array' : 'Object');
        
        // データが配列の場合（直接メッセージの配列が返される場合）
        if (Array.isArray(data)) {
          console.log('メッセージ配列を直接受信:', data.length);
          setMessages(data);
          return;
        }
        
        // データがオブジェクトで、messagesプロパティがある場合
        if (data && typeof data === 'object' && 'messages' in data) {
          // messagesがnullでないことを確認
          if (data.messages === null) {
            console.warn('messagesプロパティがnullです');
            setMessages([]);
            return;
          }
          
          // messagesが配列であることを確認
          if (!Array.isArray(data.messages)) {
            console.warn('messagesプロパティが配列ではありません:', typeof data.messages);
            setMessages([]);
            return;
          }
          
          console.log('messagesプロパティからメッセージを取得:', data.messages.length);
          setMessages(data.messages);
          return;
        }
        
        // その他の場合
        console.warn('予期しないデータ形式です:', data);
        setMessages([]);
      } catch (err) {
        console.error('JSONパースエラー:', err);
        setError(err instanceof Error ? err.message : '予期せぬエラーが発生しました');
        setMessages([]);
      }
    } catch (err) {
      console.error('メッセージ取得エラー:', err);
      setError(err instanceof Error ? err.message : '予期せぬエラーが発生しました');
      setMessages([]);
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
      fetchMessages();
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

  return (
    <>
      <ServerSidebar />
      <div 
        className={`
          flex-1 transition-all duration-300
          ${isSidebarOpen ? 'ml-0 md:ml-64' : 'ml-0'}
        `}
      >
        <div className="h-[calc(100vh-4rem)] bg-gray-100 flex flex-col overflow-hidden">
          <div className="flex-1 p-4 overflow-hidden">
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-4 h-full flex flex-col overflow-hidden">
              <div className="flex-1 space-y-4 overflow-y-auto mb-4 pt-2">
                {messages && messages.length > 0 ? (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`p-4 rounded-lg ${
                        message.role === 'user' 
                          ? 'bg-blue-100 ml-auto max-w-[80%]' 
                          : 'bg-gray-100 mr-auto max-w-[80%]'
                      }`}
                    >
                      {editingMessageId === message.id ? (
                        <div>
                          <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows={3}
                          />
                          
                          {/* 編集中のメッセージの添付ファイルを表示 */}
                          {editingAttachments.length > 0 && (
                            <div className="mt-3 p-2 border border-gray-200 rounded-lg bg-gray-50">
                              <div className="text-sm text-gray-500 mb-2">添付ファイル:</div>
                              <div className="space-y-2">
                                {editingAttachments.map((path, index) => (
                                  <div key={index} className="relative group">
                                    {renderAttachment(path)}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          <div className="flex justify-end space-x-2 mt-2">
                            <button
                              onClick={cancelEditing}
                              className="px-3 py-1 bg-gray-300 text-gray-700 rounded"
                            >
                              キャンセル
                            </button>
                            <button
                              onClick={saveEdit}
                              className="px-3 py-1 bg-blue-500 text-white rounded"
                            >
                              保存
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="text-gray-800">
                            {message.isDeleted ? (
                              <em className="text-gray-500">このメッセージは削除されました</em>
                            ) : (
                              parseMessageContent(message.content)
                            )}
                          </div>
                          
                          {message.attachments && message.attachments.length > 0 && (
                            <div className="mt-2 space-y-2">
                              {message.attachments.map((path, index) => (
                                <div key={index}>
                                  {renderAttachment(path)}
                                </div>
                              ))}
                            </div>
                          )}
                          
                          <div className="flex justify-between items-center mt-1">
                            <p className="text-xs text-gray-500">
                              {new Date(message.timestamp).toLocaleString()}
                              {message.isEdited && ' (編集済み)'}
                            </p>
                            
                            {message.role === 'user' && !message.isDeleted && (
                              <div className="flex space-x-1">
                                <button
                                  onClick={() => startEditing(message)}
                                  className="p-1 text-gray-500 hover:text-blue-500"
                                  title="編集"
                                >
                                  <PencilIcon />
                                </button>
                                <button
                                  onClick={() => deleteMessage(message.id)}
                                  className="p-1 text-gray-500 hover:text-red-500"
                                  title="削除"
                                >
                                  <TrashIcon />
                                </button>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500">
                    メッセージはありません。最初のメッセージを送信してください。
                  </div>
                )}
                {isLoading && (
                  <div className="bg-gray-100 mr-auto max-w-[80%] p-4 rounded-lg">
                    <p className="text-gray-500">応答を生成中...</p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}

              {selectedFiles.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="relative">
                      {selectedFiles[index].type.startsWith('image/') ? (
                        <img 
                          src={url} 
                          alt="Preview" 
                          className="h-20 w-20 object-cover rounded border border-gray-300" 
                        />
                      ) : (
                        <div className="h-20 w-20 flex items-center justify-center bg-gray-200 rounded border border-gray-300">
                          <span className="text-xs text-center p-1 truncate">
                            {selectedFiles[index].name}
                          </span>
                        </div>
                      )}
                      <button
                        onClick={() => removeFile(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                      >
                        <XMarkIcon />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                <div className="rounded-lg overflow-hidden">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="メッセージを入力してください..."
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    disabled={isLoading}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center text-gray-600 hover:text-blue-500"
                    disabled={isLoading}
                  >
                    <PaperClipIcon />
                    <span className="ml-1">添付ファイル</span>
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    className="hidden"
                    multiple
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    className={`bg-blue-500 text-white py-2 px-4 rounded-lg
                      ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'}
                    `}
                    disabled={isLoading}
                  >
                    {isLoading ? '送信中...' : '送信'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 