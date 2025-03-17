
import React from 'react';

interface ProgressBarProps {
  progress: number;
  status: 'idle' | 'uploading' | 'success' | 'error';
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, status }) => {
  if (status !== 'uploading') return null;
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs">
        <span>Uploading...</span>
        <span>{progress}%</span>
      </div>
      <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary rounded-full transition-all duration-300" 
          style={{width: `${progress}%`}}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;
