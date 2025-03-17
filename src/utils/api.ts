
import { supabase } from '@/integrations/supabase/client';
import { VideoAnalysisData } from '@/types/videoAnalysis';

export const fetchUserVideos = async () => {
  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return data;
};

export const fetchVideoAnalysis = async (videoId: string): Promise<VideoAnalysisData> => {
  const { data, error } = await supabase
    .from('video_analysis')
    .select('*')
    .eq('video_id', videoId)
    .single();
    
  if (error) throw error;
  return data as VideoAnalysisData;
};

export const triggerVideoAnalysis = async (videoId: string) => {
  const { data, error } = await supabase.functions.invoke('analyze-video', {
    body: { videoId },
  });
  
  if (error) throw error;
  return data;
};

export const fetchUserVideosWithAnalysis = async () => {
  // First get all user videos
  const videos = await fetchUserVideos();
  
  // For each video, try to fetch its analysis
  const videosWithAnalysis = await Promise.all(
    videos.map(async (video) => {
      try {
        const analysis = await fetchVideoAnalysis(video.id);
        return {
          ...video,
          analysis
        };
      } catch (error) {
        // If there's no analysis yet, just return the video
        return {
          ...video,
          analysis: null
        };
      }
    })
  );
  
  return videosWithAnalysis;
};
