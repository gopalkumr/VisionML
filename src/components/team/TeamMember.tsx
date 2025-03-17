import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Briefcase, GraduationCap, Mail } from 'lucide-react';

interface TeamMemberProps {
  name: string;
  role: string;
  designation: string;
  photo: string;
  education?: string;
  email?: string;
}

const TeamMember: React.FC<TeamMemberProps> = ({ 
  name, 
  role, 
  designation, 
  photo, 
  education,
  email
}) => {
  const initials = name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase();

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow duration-300">
      <div className="aspect-square w-full overflow-hidden">
        <img
          src={photo}
          alt={`${name}, ${role}`}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12 border-2 border-primary -mt-8 bg-background">
            <AvatarImage src={photo} alt={name} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-medium text-lg">{name}</h3>
            <p className="text-muted-foreground text-sm">{role}</p>
          </div>
        </div>
        
        <div className="mt-3 space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Briefcase className="h-4 w-4 text-primary" />
            <span>{designation}</span>
          </div>
          
          {education && (
            <div className="flex items-center gap-2 text-sm">
              <GraduationCap className="h-4 w-4 text-primary" />
              <span>{education}</span>
            </div>
          )}
        </div>

        {email && (
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-primary" />
            <a href={`mailto:${email}`} className="text-primary hover:underline">
              {email}
            </a>
          </div>
        )}
        
      </CardContent>
    </Card>
  );
};

export default TeamMember;
