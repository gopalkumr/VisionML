import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Maximize, AlertTriangle, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { generateRecentIncidents } from '@/utils/mockData';
import { useQuery } from '@tanstack/react-query';
import { fetchVideoAnalysis } from '@/utils/api';
import { supabase } from '@/integrations/supabase/client';
import { isCrowdDensityData, isIncidentArray, IncidentData } from '@/types/videoAnalysis';
import { useToast } from '@/hooks/use-toast';

interface VideoFeedProps {
  className?: string;
  uploadedVideoUrl?: string;
}

const VideoFeed: React.FC<VideoFeedProps> = ({ className, uploadedVideoUrl }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [incidents, setIncidents] = useState<IncidentData[]>([]);
  const [activeTab, setActiveTab] = useState('live');
  const [peopleDetected, setPeopleDetected] = useState(0);
  const [highlightedPeople, setHighlightedPeople] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [videoSignedUrl, setVideoSignedUrl] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const videoId = uploadedVideoUrl?.includes('storage/v1/object')
    ? uploadedVideoUrl.split('/').pop()?.split('?')[0]
    : null;
  
  const { data: videoAnalysis } = useQuery({
    queryKey: ['videoAnalysis', videoId],
    queryFn: () => videoId ? fetchVideoAnalysis(videoId) : null,
    enabled: !!videoId,
  });
  
  useEffect(() => {
    setIncidents(generateRecentIncidents(3));
    
    const intervalId = !videoAnalysis && setInterval(() => {
      setPeopleDetected(Math.floor(Math.random() * 50) + 150);
    }, 3000);
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [videoAnalysis]);
  
  useEffect(() => {
    if (videoAnalysis) {
      if (videoAnalysis.crowd_density && isCrowdDensityData(videoAnalysis.crowd_density)) {
        setPeopleDetected(videoAnalysis.crowd_density.totalPeopleCount || 0);
      }
      
      if (videoAnalysis.incidents && isIncidentArray(videoAnalysis.incidents)) {
        setIncidents(videoAnalysis.incidents as IncidentData[]);
      }
    }
  }, [videoAnalysis]);
  
  const fetchSignedUrl = async () => {
    try {
      const filePath = uploadedVideoUrl.split('/').pop()?.split('?')[0] || '';
      
      // Reset video states when fetching a new URL
      setVideoLoaded(false);
      setVideoError(false);
      
      const { data, error } = await supabase.storage.from('videos').createSignedUrl(
        filePath, 
        3600
      );
      
      if (error) throw error;
      if (data?.signedUrl) {
        console.log('Fetched signed URL:', data.signedUrl); // Add logging
        setVideoSignedUrl(data.signedUrl);
      }
    } catch (error) {
      console.error('Error getting signed URL:', error);
      setVideoError(true);
      toast({
        title: "Video loading error",
        description: "There was a problem loading the video. Please try again.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (uploadedVideoUrl && uploadedVideoUrl.includes('storage/v1/object')) {
      fetchSignedUrl();
    } else if (uploadedVideoUrl) {
      setVideoSignedUrl(uploadedVideoUrl);
    }
  }, [uploadedVideoUrl, toast]);
  
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);
  
  const togglePlayback = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };
  
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.log(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };
  
  const handleVideoLoaded = () => {
    setVideoLoaded(true);
    if (videoRef.current && isPlaying) {
      videoRef.current.play().catch(err => {
        console.error("Error playing video:", err);
      });
    }
  };
  
  const handleVideoError = () => {
    setVideoError(true);
    setVideoLoaded(false);
    toast({
      title: "Video error",
      description: "There was a problem with the video. Please try another file.",
      variant: "destructive"
    });
  };

  const videoFeed = (isUploaded = false) => (
    <div className="relative h-full w-full overflow-hidden rounded-md bg-black">
      <div className="absolute inset-0 flex items-center justify-center">
        {isUploaded && videoSignedUrl ? (
          <>
            {!videoLoaded && !videoError && (
              <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
                <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
                <p className="text-white ml-3">Loading video...</p>
              </div>
            )}
            
            {videoError && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-10">
                <div className="text-center p-4">
                  <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-2" />
                  <p className="text-white font-medium">Video could not be loaded</p>
                  <p className="text-gray-400 text-sm mt-1">Please check the file format or try another video</p>
                </div>
              </div>
            )}
            
            <video
              ref={videoRef}
              className="h-full w-full object-cover"
              src={videoSignedUrl}
              muted={isMuted}
              loop
              playsInline
              autoPlay={isPlaying}
              onLoadedData={handleVideoLoaded}
              onError={handleVideoError}
              style={{ visibility: videoLoaded ? 'visible' : 'hidden' }}
            />
          </>
        ) : (
          <video
            ref={videoRef}
            className="h-full w-full object-cover"
            poster="https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&q=80"
            muted={isMuted}
            loop
            playsInline
            autoPlay={isPlaying}
          />
        )}
      </div>
      
      <div className="absolute inset-0 pointer-events-none">
        {highlightedPeople && (
          <>
            <div className="absolute top-[20%] left-[25%] w-10 h-20 border-2 border-green-400 rounded-md"></div>
            <div className="absolute top-[30%] left-[40%] w-10 h-20 border-2 border-green-400 rounded-md"></div>
            <div className="absolute top-[40%] left-[60%] w-10 h-20 border-2 border-green-400 rounded-md"></div>
            <div className="absolute top-[50%] left-[30%] w-10 h-20 border-2 border-yellow-400 rounded-md"></div>
            <div className="absolute top-[60%] left-[50%] w-10 h-20 border-2 border-green-400 rounded-md"></div>
            <div className="absolute top-[45%] left-[70%] w-10 h-20 border-2 border-red-400 rounded-md"></div>
          </>
        )}
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-white pointer-events-auto"
              onClick={togglePlayback}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-white pointer-events-auto"
              onClick={toggleMute}
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
            
            <Badge variant="outline" className="bg-black/40 text-white border-0">
              {isUploaded ? 'Uploaded' : 'Live'}
            </Badge>
          </div>
          
          <div className="flex items-center space-x-3">
            <Badge variant="outline" className="bg-white/10 text-white border-0 animate-pulse">
              {peopleDetected} people detected
            </Badge>
            
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-white pointer-events-auto"
              onClick={() => setHighlightedPeople(!highlightedPeople)}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </Button>
            
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-white pointer-events-auto"
              onClick={toggleFullscreen}
            >
              <Maximize className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {incidents.filter(i => i.status === 'active').length > 0 && (
        <div className="absolute top-4 right-4 bg-destructive/90 text-destructive-foreground px-4 py-2 rounded-full animate-pulse flex items-center">
          <AlertTriangle className="h-4 w-4 mr-2" />
          <span className="text-sm font-medium">
            {incidents.filter(i => i.status === 'active').length} active incident{incidents.filter(i => i.status === 'active').length > 1 ? 's' : ''}
          </span>
        </div>
      )}
    </div>
  );
  
  const incidentsView = () => (
    <div className="h-full overflow-y-auto p-2">
      {incidents.map((incident) => (
        <Card key={incident.id} className="mb-3 overflow-hidden">
          <CardContent className="p-0">
            <div className="flex items-stretch">
              <div 
                className={`w-1 ${
                  incident.severity === 'high' 
                    ? 'bg-destructive' 
                    : incident.severity === 'medium' 
                      ? 'bg-orange-500' 
                      : 'bg-yellow-500'
                }`}
              />
              <div className="px-4 py-3 flex-1">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center">
                    <Badge 
                      variant={
                        incident.status === 'active' ? 'destructive' : 'outline'
                      }
                      className="mr-2"
                    >
                      {incident.status === 'active' ? (
                        <span className="flex items-center">
                          <span className="h-1.5 w-1.5 rounded-full bg-current mr-1 animate-pulse"></span>
                          Active
                        </span>
                      ) : (
                        'Resolved'
                      )}
                    </Badge>
                    <Badge variant="secondary">
                      {incident.type.charAt(0).toUpperCase() + incident.type.slice(1)}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(incident.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm mb-1 font-medium">
                  {incident.description}
                </p>
                <p className="text-xs text-muted-foreground">
                  Location: {incident.location}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <Badge variant="outline" className="text-xs">
                    ID: {incident.id}
                  </Badge>
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                    {incident.status === 'active' ? 'Respond' : 'View Details'}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <Card className={`overflow-hidden ${className}`}>
      <Tabs defaultValue="live" onValueChange={setActiveTab}>
        <div className="flex items-center justify-between px-4 pt-4">
          <h3 className="font-medium">Camera Feed</h3>
          <TabsList>
            <TabsTrigger value="live" className="text-xs">Live Feed</TabsTrigger>
            <TabsTrigger value="incidents" className="text-xs">
              Incidents
              {incidents.filter(i => i.status === 'active').length > 0 && (
                <span className="ml-1.5 h-1.5 w-1.5 rounded-full bg-destructive inline-block"></span>
              )}
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="live" className="m-0 p-0 h-[400px]">
          {videoFeed(!!uploadedVideoUrl)}
        </TabsContent>
        
        <TabsContent value="incidents" className="m-0 h-[400px]">
          {incidentsView()}
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default VideoFeed;
