import React, { useEffect, useState, useCallback } from 'react';
import Peer from 'peerjs';
import { Share2, Link2 } from 'lucide-react';
import { ConnectionStatus } from './components/ConnectionStatus';
import { Chat } from './components/Chat';
import { FileTransfer } from './components/FileTransfer';
import { ThemeToggle } from './components/ThemeToggle';
import { useTheme } from './hooks/useTheme';
import type { Message, FileTransferMessage, FileMetadata } from './types';

function App() {
  const theme = useTheme();
  const [peer, setPeer] = useState<Peer>();
  const [connection, setConnection] = useState<Peer.DataConnection>();
  const [peerId, setPeerId] = useState<string>();
  const [targetPeerId, setTargetPeerId] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<Map<string, FileMetadata>>(new Map());

  useEffect(() => {
    const randomId = Math.random().toString(36).substring(2, 8);
    const newPeer = new Peer(randomId, {
      debug: 2,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:global.stun.twilio.com:3478' }
        ]
      }
    });
    
    newPeer.on('open', (id) => {
      setPeerId(id);
      setPeer(newPeer);
    });

    newPeer.on('connection', (conn) => {
      setConnection(conn);
      setupConnection(conn);
    });

    newPeer.on('error', (err) => {
      console.error('Peer error:', err);
      setIsConnected(false);
    });

    return () => {
      newPeer.destroy();
    };
  }, []);

  const setupConnection = (conn: Peer.DataConnection) => {
    conn.on('open', () => {
      setIsConnected(true);
    });

    conn.on('data', (data: string | FileTransferMessage) => {
      if (typeof data === 'string') {
        const messageId = Math.random().toString(36).substring(2);
        setMessages(prev => [...prev, {
          id: messageId,
          type: 'text',
          content: data,
          sender: 'peer',
          timestamp: new Date()
        }]);
      } else {
        // Handle file transfer messages
        const transferMessage = data as FileTransferMessage;
        
        if (transferMessage.type === 'metadata') {
          // Store metadata for the incoming file
          setPendingFiles(prev => {
            const newMap = new Map(prev);
            newMap.set(transferMessage.id, transferMessage.metadata!);
            return newMap;
          });
        } else if (transferMessage.type === 'data') {
          // Get the metadata and create the complete message
          setPendingFiles(prev => {
            const newMap = new Map(prev);
            const metadata = newMap.get(transferMessage.id);
            
            if (metadata) {
              setMessages(messages => [...messages, {
                id: transferMessage.id,
                type: 'file',
                content: `File: ${metadata.name}`,
                sender: 'peer',
                timestamp: new Date(),
                fileData: {
                  ...metadata,
                  data: transferMessage.data
                }
              }]);
              newMap.delete(transferMessage.id);
            }
            
            return newMap;
          });
        }
      }
    });

    conn.on('close', () => {
      setIsConnected(false);
      setConnection(undefined);
      setPendingFiles(new Map());
    });

    conn.on('error', (err) => {
      console.error('Connection error:', err);
      setIsConnected(false);
      setConnection(undefined);
      setPendingFiles(new Map());
    });
  };

  const connectToPeer = (e: React.FormEvent) => {
    e.preventDefault();
    if (peer && targetPeerId) {
      const conn = peer.connect(targetPeerId);
      setConnection(conn);
      setupConnection(conn);
    }
  };

  const sendMessage = useCallback((message: string) => {
    if (connection && connection.open) {
      connection.send(message);
      const messageId = Math.random().toString(36).substring(2);
      setMessages(prev => [...prev, {
        id: messageId,
        type: 'text',
        content: message,
        sender: 'me',
        timestamp: new Date()
      }]);
    }
  }, [connection]);

  const handleFileSelect = useCallback((file: File) => {
    if (connection && connection.open) {
      const reader = new FileReader();
      const transferId = Math.random().toString(36).substring(2);
      
      // First, send metadata
      const metadata: FileMetadata = {
        id: transferId,
        name: file.name,
        size: file.size,
        type: file.type
      };

      const metadataMessage: FileTransferMessage = {
        id: transferId,
        type: 'metadata',
        metadata
      };

      connection.send(metadataMessage);

      // Add a pending message to show upload progress
      setMessages(prev => [...prev, {
        id: transferId,
        type: 'file',
        content: `File: ${file.name}`,
        sender: 'me',
        timestamp: new Date(),
        fileData: metadata
      }]);

      // Then read and send the file data
      reader.onload = () => {
        if (reader.result instanceof ArrayBuffer) {
          const dataMessage: FileTransferMessage = {
            id: transferId,
            type: 'data',
            data: reader.result
          };
          connection.send(dataMessage);
        }
      };
      reader.readAsArrayBuffer(file);
    }
  }, [connection]);

  const handleFileRedownload = useCallback((message: Message) => {
    if (message.type === 'file' && message.fileData?.data) {
      const blob = new Blob([message.fileData.data]);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = message.fileData.name;
      a.click();
      URL.revokeObjectURL(url);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 
      dark:from-gray-900 dark:to-gray-800 p-8 transition-colors">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
            <Share2 className="w-10 h-10 text-blue-500" />
            P2P Share
          </h1>
          <ThemeToggle isDark={theme.isDark} toggle={theme.toggle} />
        </div>
        <p className="text-gray-600 dark:text-gray-300 text-center">
          Secure, peer-to-peer file and text sharing
        </p>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 space-y-6">
          <ConnectionStatus isConnected={isConnected} peerId={peerId} />

          {!isConnected && (
            <form onSubmit={connectToPeer} className="flex gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={targetPeerId}
                  onChange={(e) => setTargetPeerId(e.target.value)}
                  placeholder="Enter peer ID to connect"
                  className="w-full px-4 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-700 
                    dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 
                  flex items-center gap-2"
              >
                <Link2 className="w-4 h-4" />
                Connect
              </button>
            </form>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Chat</h2>
              <Chat
                messages={messages}
                onSendMessage={sendMessage}
                isConnected={isConnected}
                onFileRedownload={handleFileRedownload}
              />
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">File Transfer</h2>
              <FileTransfer
                onFileSelect={handleFileSelect}
                isConnected={isConnected}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;