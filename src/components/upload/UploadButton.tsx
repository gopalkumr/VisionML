
import React from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UploadButtonProps {
  onClick: () => void;
  disabled: boolean;
  status: 'idle' | 'uploading' | 'success' | 'error';
}

const UploadButton: React.FC<UploadButtonProps> = ({ onClick, disabled, status }) => {
  if (status !== 'idle') return null;
  
  return (
    <Button 
      className="w-full" 
      onClick={onClick}
      disabled={disabled}
    >
      <Upload className="mr-2 h-4 w-4" />
      Upload and Analyze
    </Button>
  );
};

export default UploadButton;
