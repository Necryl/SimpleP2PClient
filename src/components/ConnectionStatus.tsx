import React from 'react';
import { Wifi, WifiOff, Copy, Check } from 'lucide-react';

interface ConnectionStatusProps {
  isConnected: boolean;
  peerId?: string;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ isConnected, peerId }) => {
  const [copied, setCopied] = React.useState(false);

  const copyId = async () => {
    if (peerId) {
      await navigator.clipboard.writeText(peerId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-2">
        {isConnected ? (
          <>
            <Wifi className="w-4 h-4 text-green-500" />
            <span className="text-green-600">Connected</span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4 text-red-500" />
            <span className="text-red-600">Disconnected</span>
          </>
        )}
      </div>
      
      {peerId && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 font-mono">ID: {peerId}</span>
          <button
            onClick={copyId}
            className="p-2 text-gray-500 hover:text-blue-500 rounded-full hover:bg-blue-50 transition-colors"
            title="Copy ID"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>
      )}
    </div>
  );
};