
import { Json } from '@/integrations/supabase/types';

export type CrowdDensityData = {
  overall: number;
  totalPeopleCount: number;
  confidence: number;
  regions: {
    x: number;
    y: number;
    width: number;
    height: number;
    density: number;
  }[];
};

export type IncidentData = {
  id: string;
  type: string; // Changed from the enum-like literal type to string
  severity: "low" | "medium" | "high";
  status: "active" | "resolved";
  location: string;
  description: string;
  timestamp: string;
};

export type VideoAnalysisData = {
  id: string;
  video_id: string;
  created_at: string;
  crowd_density: CrowdDensityData;
  incidents: IncidentData[];
};

export const isCrowdDensityData = (data: Json): data is CrowdDensityData => {
  return typeof data === 'object' && 
         data !== null &&
         'totalPeopleCount' in data &&
         'overall' in data;
};

export const isIncidentArray = (data: Json): data is IncidentData[] => {
  return Array.isArray(data) && 
         data.length > 0 && 
         typeof data[0] === 'object' &&
         data[0] !== null &&
         'id' in data[0] &&
         'type' in data[0];
};
