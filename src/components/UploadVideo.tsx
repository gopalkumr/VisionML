import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { v4 as uuidv4 } from 'uuid';
import DropZone from './upload/DropZone';
import ProgressBar from './upload/ProgressBar';
import UploadStatus from './upload/UploadStatus';
import UploadButton from './upload/UploadButton';

interface UploadVideoProps {
  onVideoUploaded: (videoUrl: string) => void;
  className?: string;
}

const UploadVideo: React.FC<UploadVideoProps> = ({ onVideoUploaded, className }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const supportedFormats = ['video/mp4', 'video/mov', 'video/avi'];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Check if the file is a video and in a supported format
      if (!supportedFormats.includes(selectedFile.type)) {
        toast({
          title: "Unsupported file format",
          description: "Please upload a video in MP4, MOV, or AVI format.",
          variant: "destructive"
        });
        return;
      }
      
      // Check if the file size is less than 100MB
      if (selectedFile.size > 100 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload a video smaller than 100MB.",
          variant: "destructive"
        });
        return;
      }
      
      setFile(selectedFile);
      setUploadStatus('idle');
      setUploadProgress(0);
    }
  };

  const handleUpload = async () => {
    if (!file || !user) return;
    
    setUploading(true);
    setUploadStatus('uploading');
    
    try {
      // Create a unique file path
      const fileExt = file.name.split('.').pop();
      const videoId = uuidv4();
      const filePath = `${user.id}/${videoId}.${fileExt}`;
      
      // Create an XMLHttpRequest to track upload progress
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percent);
        }
      });
      
      // Upload to Supabase Storage
      const { error: uploadError, data } = await supabase.storage
        .from('videos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });
        
      if (uploadError) throw uploadError;
      
      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('videos')
        .getPublicUrl(filePath);
      
      // Store video metadata in the database
      const { error: dbError } = await supabase
        .from('videos')
        .insert({
          user_id: user.id,
          title: file.name,
          file_path: filePath,
          status: 'processing',
          metadata: {
            size: file.size,
            type: file.type,
            originalName: file.name
          }
        });
        
      if (dbError) throw dbError;
      
      setUploadStatus('success');
      toast({
        title: "Upload successful",
        description: "Your video has been uploaded and is being analyzed.",
      });
      
      // Call the ML model for processing (simplified for now)
      // In a real implementation, this would trigger a background job
      // that processes the video and updates the analysis table
      
      // Pass the video URL to the parent component
      onVideoUploaded(publicUrl);
    } catch (error: any) {
      console.error("Upload error:", error);
      setUploadStatus('error');
      toast({
        title: "Upload failed",
        description: error.message || "There was a problem uploading your video. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  if (!user) {
    navigate('/sign-in');
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Upload Crowd Footage</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <DropZone file={file} onFileChange={handleFileChange} />
          
          {file && (
            <>
              <ProgressBar progress={uploadProgress} status={uploadStatus} />
              <UploadStatus status={uploadStatus} />
              <UploadButton 
                onClick={handleUpload} 
                disabled={uploading} 
                status={uploadStatus}
              />
            </>
          )}
          
          <div className="text-xs text-muted-foreground">
            <p>Upload your own crowd footage for analysis. The system will process the video and provide insights on crowd density, movement patterns, and potential incidents.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UploadVideo;
