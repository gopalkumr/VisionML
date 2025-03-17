
import React from 'react';
import { Clock, Users, AlertCircle, Video, Map, UserCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { generateAreaStats } from '@/utils/mockData';

interface InfoPanelProps {
  className?: string;
}

const InfoPanel: React.FC<InfoPanelProps> = ({ className }) => {
  const areas = generateAreaStats();
  const totalPeople = areas.reduce((sum, area) => sum + area.currentCount, 0);
  const activeIncidents = areas.reduce((sum, area) => sum + area.incidents, 0);
  
  const infoCards = [
    {
      title: 'Live count',
      value: totalPeople.toLocaleString(),
      icon: <Users className="h-4 w-4" />,
      description: 'People tracked',
      color: 'bg-blue-500/10 text-blue-500'
    },
    {
      title: 'Monitoring time',
      value: '8:43:17',
      icon: <Clock className="h-4 w-4" />,
      description: 'Continuous',
      color: 'bg-indigo-500/10 text-indigo-500'
    },
    {
      title: 'Active incidents',
      value: activeIncidents.toString(),
      icon: <AlertCircle className="h-4 w-4" />,
      description: activeIncidents === 0 ? 'All clear' : 'Requiring attention',
      color: 'bg-red-500/10 text-red-500'
    },
    {
      title: 'Active cameras',
      value: '16',
      icon: <Video className="h-4 w-4" />,
      description: '4 drones, 12 fixed',
      color: 'bg-green-500/10 text-green-500'
    },
    {
      title: 'Coverage area',
      value: '1.8 km²',
      icon: <Map className="h-4 w-4" />,
      description: '98% monitored',
      color: 'bg-purple-500/10 text-purple-500'
    },
    {
      title: 'System status',
      value: 'Optimal',
      icon: <UserCheck className="h-4 w-4" />,
      description: 'All systems operational',
      color: 'bg-cyan-500/10 text-cyan-500'
    }
  ];

  return (
    <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 ${className}`}>
      {infoCards.map((card, index) => (
        <Card key={index} className="card-hover">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">{card.title}</p>
                <p className="text-2xl font-semibold">{card.value}</p>
                <p className="text-xs text-muted-foreground mt-1 truncate">{card.description}</p>
              </div>
              <div className={`p-2 rounded-md ${card.color}`}>
                {card.icon}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default InfoPanel;
