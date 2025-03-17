
import React from 'react';
import { Check, AlertCircle } from 'lucide-react';

interface UploadStatusProps {
  status: 'idle' | 'uploading' | 'success' | 'error';
}

const UploadStatus: React.FC<UploadStatusProps> = ({ status }) => {
  if (status === 'success') {
    return (
      <div className="flex items-center justify-center p-2 bg-green-500/10 text-green-500 rounded-md">
        <Check className="h-4 w-4 mr-2" />
        <span className="text-sm">Upload complete. Processing video...</span>
      </div>
    );
  }
  
  if (status === 'error') {
    return (
      <div className="flex items-center justify-center p-2 bg-destructive/10 text-destructive rounded-md">
        <AlertCircle className="h-4 w-4 mr-2" />
        <span className="text-sm">Upload failed. Please try again.</span>
      </div>
    );
  }
  
  return null;
};

export default UploadStatus;
