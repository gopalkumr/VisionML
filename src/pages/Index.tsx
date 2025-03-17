import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/Header';
import VideoFeed from '@/components/VideoFeed';
import CrowdAnalytics from '@/components/CrowdAnalytics';
import IncidentDetection from '@/components/IncidentDetection';
import InfoPanel from '@/components/InfoPanel';
import UploadVideo from '@/components/UploadVideo';
import TeamSection from '@/components/team/TeamSection';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { fetchUserVideosWithAnalysis } from '@/utils/api';
import { useToast } from '@/hooks/use-toast';
import { isCrowdDensityData, isIncidentArray } from '@/types/videoAnalysis';

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string | null>(null);
  const [videoMode, setVideoMode] = useState<'live' | 'uploaded'>('live');
  const { toast } = useToast();
  
  const { data: userVideos, isLoading: videosLoading, error: videosError } = useQuery({
    queryKey: ['userVideos'],
    queryFn: fetchUserVideosWithAnalysis,
    retry: 1,
  });
  
  useEffect(() => {
    if (userVideos && userVideos.length > 0) {
      const mostRecentVideo = userVideos[0];
      setUploadedVideoUrl(mostRecentVideo.file_path);
      setVideoMode('uploaded');
      
      if (mostRecentVideo.status === 'completed') {
        toast({
          title: "Your video analysis is ready",
          description: "View the results in the dashboard",
        });
      }
    }
  }, [userVideos, toast]);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleVideoUploaded = (videoUrl: string) => {
    setUploadedVideoUrl(videoUrl);
    setVideoMode('uploaded');
  };
  
  if (isLoading || videosLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
        <p className="mt-4 text-muted-foreground animate-pulse">Loading surveillance system...</p>
      </div>
    );
  }
  
  if (videosError) {
    console.error("Error fetching videos:", videosError);
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 px-4 md:px-6 py-6 overflow-auto">
        <div className="max-w-[1800px] mx-auto">
          <div className="animate-fade-in">
            <h1 className="text-3xl font-semibold tracking-tight mb-1">
              Mass Crowd Surveillance
            </h1>
            <p className="text-muted-foreground mb-6">
              Intelligent monitoring system for public safety by visionML
            </p>
          </div>
          
          <InfoPanel className="mb-6 animate-slide-up" />
          
          <Separator className="my-6" />
          
          <Tabs defaultValue="default" className="mb-6 animate-slide-up animate-delay-100">
            <TabsList>
              <TabsTrigger value="default">Default Analysis</TabsTrigger>
              <TabsTrigger value="upload">Upload Your Footage</TabsTrigger>
              {userVideos && userVideos.length > 0 && (
                <TabsTrigger value="my-videos">My Videos</TabsTrigger>
              )}
            </TabsList>
            <TabsContent value="default" className="mt-4">
              <div className="grid grid-cols-1 lg:grid-cols-6 xl:grid-cols-8 gap-6">
                <VideoFeed className="lg:col-span-3 xl:col-span-4" />
                <CrowdAnalytics className="lg:col-span-3 xl:col-span-4" />
              </div>
            </TabsContent>
            <TabsContent value="upload" className="mt-4">
              <div className="grid grid-cols-1 lg:grid-cols-6 xl:grid-cols-8 gap-6">
                <UploadVideo onVideoUploaded={handleVideoUploaded} className="lg:col-span-3 xl:col-span-4" />
                {uploadedVideoUrl ? (
                  <CrowdAnalytics className="lg:col-span-3 xl:col-span-4" />
                ) : (
                  <div className="lg:col-span-3 xl:col-span-4 flex items-center justify-center border border-dashed border-border rounded-lg p-8">
                    <div className="text-center">
                      <h3 className="text-lg font-medium mb-2">Upload a video to see analysis</h3>
                      <p className="text-sm text-muted-foreground">
                        Upload your crowd footage to get detailed insights and analytics
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
            {userVideos && userVideos.length > 0 && (
              <TabsContent value="my-videos" className="mt-4">
                <div className="grid grid-cols-1 lg:grid-cols-6 xl:grid-cols-8 gap-6">
                  <div className="lg:col-span-3 xl:col-span-4">
                    <h3 className="text-lg font-medium mb-4">Your Uploaded Videos</h3>
                    <div className="space-y-4">
                      {userVideos.map((video) => (
                        <div 
                          key={video.id} 
                          className="border rounded-lg p-4 cursor-pointer hover:bg-accent/50 transition-colors"
                          onClick={() => {
                            setUploadedVideoUrl(video.file_path);
                            setVideoMode('uploaded');
                          }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{video.title || `Video ${video.id.substring(0, 8)}`}</h4>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              video.status === 'completed' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400' 
                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-400'
                            }`}>
                              {video.status === 'completed' ? 'Analysis Complete' : 'Processing'}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Uploaded on {new Date(video.created_at).toLocaleDateString()}
                          </p>
                          {video.analysis && (
                            <div className="mt-2">
                              <p className="text-sm">
                                <span className="font-medium">People detected:</span> {
                                  video.analysis.crowd_density && isCrowdDensityData(video.analysis.crowd_density) 
                                    ? video.analysis.crowd_density.totalPeopleCount 
                                    : 'N/A'
                                }
                              </p>
                              <p className="text-sm">
                                <span className="font-medium">Incidents:</span> {
                                  video.analysis.incidents && isIncidentArray(video.analysis.incidents) 
                                    ? video.analysis.incidents.length 
                                    : 0
                                }
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  <VideoFeed 
                    className="lg:col-span-3 xl:col-span-4" 
                    uploadedVideoUrl={uploadedVideoUrl || undefined} 
                  />
                </div>
              </TabsContent>
            )}
          </Tabs>
          
          <div className="mt-6 animate-slide-up animate-delay-200">
            <IncidentDetection />
          </div>
          
          <Separator className="my-10" />
          
          <div className="animate-slide-up animate-delay-300">
            <TeamSection />
          </div>
          
          <div className="mt-10 glass-panel p-4 animate-slide-up animate-delay-300">
            <h3 className="text-sm font-medium mb-2">System Information</h3>
            <p className="text-xs text-muted-foreground">
              This intelligent surveillance system utilizes machine learning for crowd analysis, segmenting individuals, estimating density, and identifying potential incidents in real-time. The system processes video feeds from drones and CCTV cameras to enhance public safety through early detection of unusual patterns or emergencies.
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              All data is processed in accordance with privacy regulations. No personal identification information is stored.
            </p>
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs font-medium text-center">Funded and supported by IHFC IIT Delhi</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
