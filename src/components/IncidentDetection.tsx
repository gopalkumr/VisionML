import React, { useState, useEffect } from 'react';
import { Clock, MapPin, AlertTriangle, AlertCircle, ShieldAlert } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { generateRecentIncidents, IncidentData } from '@/utils/mockData';

interface IncidentDetectionProps {
  className?: string;
}

const IncidentDetection: React.FC<IncidentDetectionProps> = ({ className }) => {
  const [incidents, setIncidents] = useState<IncidentData[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'resolved'>('all');
  
  useEffect(() => {
    // Initialize with some incidents
    setIncidents(generateRecentIncidents(7));
    
    // Simulate new incidents appearing
    const intervalId = setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance to add a new incident
        setIncidents(prevIncidents => {
          const newIncidents = [...prevIncidents];
          const newIncident = generateRecentIncidents(1)[0];
          newIncidents.unshift(newIncident);
          
          // Keep only most recent 10 incidents
          if (newIncidents.length > 10) {
            return newIncidents.slice(0, 10);
          }
          
          return newIncidents;
        });
      }
    }, 60000); // Check every minute
    
    return () => clearInterval(intervalId);
  }, []); // Empty dependency array to run only once
  
  const filteredIncidents = incidents.filter(incident => {
    if (filter === 'all') return true;
    return incident.status === filter;
  });
  
  const getIncidentIcon = (type: string) => {
    switch(type) {
      case 'stampede':
        return <ShieldAlert className="h-4 w-4" />;
      case 'aggressive':
        return <AlertCircle className="h-4 w-4" />;
      case 'unusual':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };
  
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">Incident Detection</CardTitle>
          <div className="flex space-x-1">
            <Button 
              variant={filter === 'all' ? 'default' : 'outline'} 
              size="sm" 
              className="h-7 text-xs"
              onClick={() => setFilter('all')}
            >
              All
            </Button>
            <Button 
              variant={filter === 'active' ? 'default' : 'outline'} 
              size="sm" 
              className="h-7 text-xs"
              onClick={() => setFilter('active')}
            >
              Active
            </Button>
            <Button 
              variant={filter === 'resolved' ? 'default' : 'outline'} 
              size="sm" 
              className="h-7 text-xs"
              onClick={() => setFilter('resolved')}
            >
              Resolved
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
          {filteredIncidents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                <AlertTriangle className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-sm font-medium mb-1">No incidents found</h3>
              <p className="text-xs text-muted-foreground">
                {filter === 'all' 
                  ? 'There are no incidents to display.' 
                  : `There are no ${filter} incidents to display.`}
              </p>
            </div>
          ) : (
            filteredIncidents.map((incident) => (
              <div 
                key={incident.id}
                className={`p-3 rounded-lg border ${
                  incident.status === 'active' 
                    ? 'bg-destructive/5 border-destructive/20' 
                    : 'bg-background border-border'
                } transition-colors duration-200 group hover:shadow-subtle`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Badge 
                      variant={incident.status === 'active' ? 'destructive' : 'outline'}
                      className="mr-2"
                    >
                      {incident.status === 'active' ? (
                        <span className="flex items-center">
                          <span className="h-1.5 w-1.5 rounded-full bg-current mr-1 animate-pulse"></span>
                          Active
                        </span>
                      ) : 'Resolved'}
                    </Badge>
                    
                    <Badge 
                      variant="secondary" 
                      className={`${
                        incident.severity === 'high' 
                          ? 'bg-destructive/10 text-destructive hover:bg-destructive/20' 
                          : incident.severity === 'medium'
                            ? 'bg-orange-500/10 text-orange-600 hover:bg-orange-500/20' 
                            : 'bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20'
                      }`}
                    >
                      {incident.severity.charAt(0).toUpperCase() + incident.severity.slice(1)}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatTimestamp(incident.timestamp)}
                  </div>
                </div>
                
                <div className="flex mb-2">
                  <div className="mr-3 mt-0.5">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                      incident.status === 'active' 
                        ? 'bg-destructive/10 text-destructive' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {getIncidentIcon(incident.type)}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium">{incident.type.charAt(0).toUpperCase() + incident.type.slice(1)} Detected</h4>
                    <p className="text-xs text-muted-foreground mb-1">{incident.description}</p>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3 mr-1" />
                      {incident.location}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
                  <Badge variant="outline" className="text-xs">
                    {incident.id}
                  </Badge>
                  
                  <Button 
                    variant={incident.status === 'active' ? 'default' : 'outline'} 
                    size="sm" 
                    className="h-7 text-xs"
                  >
                    {incident.status === 'active' ? 'Respond' : 'View Details'}
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default IncidentDetection;
