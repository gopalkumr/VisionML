
import React from 'react';
import { Upload, Video } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface DropZoneProps {
  file: File | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const DropZone: React.FC<DropZoneProps> = ({ file, onFileChange }) => {
  return (
    <div 
      className="border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-accent/50 transition-colors"
      onClick={() => document.getElementById('video-upload')?.click()}
    >
      {file ? (
        <div className="flex flex-col items-center">
          <Video className="h-10 w-10 text-primary mb-2" />
          <p className="text-sm font-medium mb-1">{file.name}</p>
          <p className="text-xs text-muted-foreground">
            {(file.size / (1024 * 1024)).toFixed(2)} MB
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <Upload className="h-10 w-10 text-muted-foreground mb-2" />
          <p className="text-sm font-medium mb-1">Drag and drop or click to upload</p>
          <p className="text-xs text-muted-foreground">
            Supports MP4, MOV, AVI up to 100MB
          </p>
        </div>
      )}
      <Input
        id="video-upload"
        type="file"
        accept="video/*"
        className="hidden"
        onChange={onFileChange}
      />
    </div>
  );
};

export default DropZone;
