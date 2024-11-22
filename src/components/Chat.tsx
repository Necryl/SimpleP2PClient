import React, { useState, useRef, useEffect } from 'react';
import { Send, Download, File as FileIcon } from 'lucide-react';
import type { Message } from '../types';
import { formatFileSize } from '../utils';

interface ChatProps {
  onSendMessage: (message: string) => void;
  messages: Message[];
  isConnected: boolean;
  onFileRedownload?: (message: Message) => void;
}

export const Chat: React.FC<ChatProps> = ({ onSendMessage, messages, isConnected, onFileRedownload }) => {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && isConnected) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const renderMessage = (msg: Message) => {
    if (msg.type === 'text') {
      return <p className="break-words">{msg.content}</p>;
    }

    return (
      <div className="flex items-center gap-3">
        <FileIcon className="w-5 h-5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="truncate font-medium">{msg.fileData?.name}</p>
          <p className="text-sm opacity-75">{formatFileSize(msg.fileData?.size || 0)}</p>
        </div>
        {isConnected && msg.sender === 'peer' && onFileRedownload && (
          <button
            onClick={() => onFileRedownload(msg)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Download file"
          >
            <Download className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-[400px] bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-lg px-4 py-2 ${
                msg.sender === 'me'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
              }`}
            >
              {renderMessage(msg)}
              <span className="text-xs opacity-75 mt-1 block">
                {msg.timestamp.toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="p-4 border-t dark:border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={isConnected ? "Type a message..." : "Connect to start chatting..."}
            disabled={!isConnected}
            className="flex-1 px-4 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-700 
              dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 
              disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={!isConnected || !message.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};