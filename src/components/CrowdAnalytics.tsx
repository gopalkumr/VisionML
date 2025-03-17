
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { generateHourlyDensityData, generateAreaStats, CrowdDensityData, AreaStatistics } from '@/utils/mockData';

interface CrowdAnalyticsProps {
  className?: string;
}

const CrowdAnalytics: React.FC<CrowdAnalyticsProps> = ({ className }) => {
  const [timeframe, setTimeframe] = useState('24h');
  const [densityData, setDensityData] = useState<CrowdDensityData[]>([]);
  const [areaStats, setAreaStats] = useState<AreaStatistics[]>([]);
  const [liveCount, setLiveCount] = useState(0);
  
  useEffect(() => {
    // Initialize with data
    const hourlyData = generateHourlyDensityData(24);
    setDensityData(hourlyData);
    setLiveCount(hourlyData[hourlyData.length - 1].total);
    
    // Initialize area stats
    setAreaStats(generateAreaStats());
    
    // Update data periodically
    const intervalId = setInterval(() => {
      const newCount = liveCount + Math.floor(Math.random() * 20) - 10; // Random fluctuation
      setLiveCount(Math.max(0, newCount));
    }, 5000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  const getTimeframeData = () => {
    const hours = timeframe === '24h' ? 24 : timeframe === '12h' ? 12 : 6;
    return densityData.slice(-hours - 1);
  };
  
  // Format the timestamp for display
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Colors for the pie chart
  const COLORS = ['#4f46e5', '#0ea5e9', '#14b8a6', '#f59e0b', '#ef4444'];

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">Crowd Analytics</CardTitle>
          <Tabs 
            value={timeframe} 
            onValueChange={setTimeframe}
            className="h-7"
          >
            <TabsList className="h-7 p-0.5">
              <TabsTrigger value="6h" className="text-xs h-6 px-2">6H</TabsTrigger>
              <TabsTrigger value="12h" className="text-xs h-6 px-2">12H</TabsTrigger>
              <TabsTrigger value="24h" className="text-xs h-6 px-2">24H</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium">Live Count</h3>
                <Badge variant="outline" className="font-normal">
                  {liveCount > densityData[densityData.length - 1]?.total ? 'Increasing' : 'Decreasing'}
                </Badge>
              </div>
              
              <div className="flex items-baseline">
                <span className="text-4xl font-bold mr-2">{liveCount}</span>
                <span className="text-sm text-muted-foreground">people detected</span>
              </div>
              
              <div className="h-1.5 w-full bg-secondary rounded-full mt-3 overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-500" 
                  style={{width: `${Math.min(100, (liveCount / 1000) * 100)}%`}}
                ></div>
              </div>
              <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                <span>0</span>
                <span>250</span>
                <span>500</span>
                <span>750</span>
                <span>1000+</span>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-3">Crowd Density by Time</h3>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={getTimeframeData()}
                    margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis 
                      dataKey="timestamp" 
                      tickFormatter={formatTime}
                      tick={{ fontSize: 10 }}
                      tickMargin={5}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      tick={{ fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                      tickMargin={5}
                      domain={[0, 'dataMax + 10']}
                    />
                    <Tooltip
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        border: 'none',
                        borderRadius: '8px',
                        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                        fontSize: '12px'
                      }}
                      labelFormatter={(value) => {
                        const date = new Date(value);
                        return date.toLocaleString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          month: 'short',
                          day: 'numeric'
                        });
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="density" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          
          <div>
            <div>
              <h3 className="text-sm font-medium mb-3">Area Distribution</h3>
              <div className="h-[170px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={areaStats}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="currentCount"
                      animationDuration={500}
                    >
                      {areaStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name, props) => {
                        const area = areaStats.find(a => a.currentCount === value);
                        return [`${value} people (${area?.density}% capacity)`, area?.name];
                      }}
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        border: 'none',
                        borderRadius: '8px',
                        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                        fontSize: '12px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="grid grid-cols-3 gap-2 mt-2">
                {areaStats.map((area, i) => (
                  <div key={area.id} className="flex items-center text-xs">
                    <div 
                      className="w-2 h-2 rounded-full mr-1.5" 
                      style={{ backgroundColor: COLORS[i % COLORS.length] }}
                    ></div>
                    <span className="truncate">{area.name}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="text-sm font-medium mb-3">Hourly Fluctuation</h3>
              <div className="h-[170px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={getTimeframeData().filter((_, i) => i % 2 === 0)} // Show fewer bars for clarity
                    margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis 
                      dataKey="timestamp" 
                      tickFormatter={formatTime}
                      tick={{ fontSize: 10 }}
                      tickMargin={5}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      tick={{ fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                      tickMargin={5}
                    />
                    <Tooltip
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        border: 'none',
                        borderRadius: '8px',
                        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                        fontSize: '12px'
                      }}
                      labelFormatter={(value) => {
                        const date = new Date(value);
                        return date.toLocaleString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          month: 'short',
                          day: 'numeric'
                        });
                      }}
                    />
                    <Bar 
                      dataKey="total" 
                      fill="rgba(79, 70, 229, 0.1)" 
                      stroke="hsl(var(--primary))"
                      strokeWidth={1}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CrowdAnalytics;
