export interface FileMetadata {
  id: string;
  name: string;
  size: number;
  type: string;
  data?: ArrayBuffer;
}

export interface Message {
  id: string;
  type: 'text' | 'file';
  content: string;
  sender: 'me' | 'peer';
  timestamp: Date;
  fileData?: FileMetadata;
}

export interface Theme {
  isDark: boolean;
  toggle: () => void;
}

export interface FileTransferMessage {
  id: string;
  type: 'metadata' | 'data';
  metadata?: FileMetadata;
  data?: ArrayBuffer;
}</content>