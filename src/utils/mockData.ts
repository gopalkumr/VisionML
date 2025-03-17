
import { IncidentData } from '@/types/videoAnalysis';
import { v4 as uuidv4 } from 'uuid';

// Define types needed for mock data
export interface AreaStatistics {
  id: string;
  name: string;
  currentCount: number;
  capacity: number;
  density: number;
  incidents: number;
}

export interface CrowdDensityData {
  timestamp: string;
  density: number;
  total: number;
}

// Re-export the IncidentData type from videoAnalysis.ts
export type { IncidentData };

// Export the generateAreaStats function
export const generateAreaStats = (): AreaStatistics[] => {
  const areas: AreaStatistics[] = [
    {
      id: '1',
      name: 'Main Entrance',
      currentCount: Math.floor(Math.random() * 50) + 100,
      capacity: 200,
      density: 0,
      incidents: Math.random() > 0.7 ? 1 : 0
    },
    {
      id: '2',
      name: 'West Wing',
      currentCount: Math.floor(Math.random() * 40) + 60,
      capacity: 150,
      density: 0,
      incidents: Math.random() > 0.8 ? 1 : 0
    },
    {
      id: '3',
      name: 'East Wing',
      currentCount: Math.floor(Math.random() * 30) + 40,
      capacity: 100,
      density: 0,
      incidents: 0
    },
    {
      id: '4',
      name: 'North Plaza',
      currentCount: Math.floor(Math.random() * 60) + 120,
      capacity: 250,
      density: 0,
      incidents: Math.random() > 0.75 ? 1 : 0
    },
    {
      id: '5',
      name: 'Food Court',
      currentCount: Math.floor(Math.random() * 80) + 150,
      capacity: 300,
      density: 0,
      incidents: Math.random() > 0.85 ? 1 : 0
    }
  ];
  
  // Calculate density for each area
  areas.forEach(area => {
    area.density = Math.round((area.currentCount / area.capacity) * 100);
  });
  
  return areas;
};

// Add the generateHourlyDensityData function
export const generateHourlyDensityData = (hours: number): CrowdDensityData[] => {
  const data: CrowdDensityData[] = [];
  const now = new Date();
  
  for (let i = hours; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - (i * 60 * 60 * 1000)).toISOString();
    const baseValue = 400; // Base crowd size
    const timeOfDay = (24 - i) % 24; // 0-23 representing hour of day
    
    // Simulate daily patterns with higher crowds during mid-day
    let multiplier = 1;
    if (timeOfDay >= 10 && timeOfDay <= 18) {
      multiplier = 1.5; // Busier during the day
    } else if (timeOfDay >= 19 && timeOfDay <= 22) {
      multiplier = 1.2; // Slightly busy in evening
    } else {
      multiplier = 0.7; // Less busy at night/early morning
    }
    
    // Add some randomness
    const randomFactor = 0.8 + (Math.random() * 0.4); // 0.8 to 1.2
    
    const total = Math.round(baseValue * multiplier * randomFactor);
    const density = Math.round(40 * multiplier * randomFactor); // Density percentage
    
    data.push({
      timestamp,
      density,
      total
    });
  }
  
  return data;
};

// Export the generateRecentIncidents function
export const generateRecentIncidents = (count: number): IncidentData[] => {
  const incidents: IncidentData[] = [];
  const types = ['overcrowding', 'suspicious activity', 'unusual behavior', 'restricted area'];
  const locations = ['north entrance', 'main hall', 'west corridor', 'parking area', 'south exit'];
  const severityLevels: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high'];
  
  for (let i = 0; i < count; i++) {
    incidents.push({
      id: uuidv4(),
      type: types[Math.floor(Math.random() * types.length)],
      severity: severityLevels[Math.floor(Math.random() * severityLevels.length)],
      status: Math.random() > 0.5 ? 'active' : 'resolved',
      location: locations[Math.floor(Math.random() * locations.length)],
      description: `Potential incident detected in the ${locations[Math.floor(Math.random() * locations.length)]}`,
      timestamp: new Date(Date.now() - Math.floor(Math.random() * 3600000)).toISOString(),
    });
  }
  
  return incidents;
};
