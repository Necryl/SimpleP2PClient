import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File } from 'lucide-react';

interface FileTransferProps {
  onFileSelect: (file: File) => void;
  isConnected: boolean;
}

export const FileTransfer: React.FC<FileTransferProps> = ({ onFileSelect, isConnected }) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0 && isConnected) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect, isConnected]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled: !isConnected,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
      'text/*': ['.txt', '.md'],
      'application/zip': ['.zip'],
      'application/json': ['.json']
    },
    maxSize: 100 * 1024 * 1024 // 100MB max
  });

  return (
    <div
      {...getRootProps()}
      className={`h-[400px] flex items-center justify-center border-2 border-dashed rounded-lg 
        transition-all duration-200 ease-in-out
        ${isDragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600'}
        ${isConnected ? 'hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800' : 'opacity-50 cursor-not-allowed'}
        ${isDragActive ? 'scale-102 transform' : 'scale-100'}
        dark:bg-gray-800`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-4 p-6 text-center">
        {isDragActive ? (
          <>
            <Upload className="w-12 h-12 text-blue-500" />
            <p className="text-blue-600 dark:text-blue-400 font-medium">Drop your file here</p>
          </>
        ) : (
          <>
            <File className="w-12 h-12 text-gray-400 dark:text-gray-500" />
            <div className="space-y-2">
              <p className="text-gray-600 dark:text-gray-300 font-medium">
                {isConnected ? (
                  "Drag & drop files here"
                ) : (
                  "Connect to a peer first"
                )}
              </p>
              {isConnected && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Supports PDF, images, text files, and ZIP (up to 100MB)
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};