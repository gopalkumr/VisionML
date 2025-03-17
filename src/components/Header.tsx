
import React from 'react';
import { Bell, Settings, Menu, Upload, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  onToggleSidebar?: () => void;
  isAnalyzingUpload?: boolean;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar, isAnalyzingUpload }) => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out",
        description: "You have been signed out successfully",
      });
      navigate('/sign-in');
    } catch (error) {
      toast({
        title: "Error signing out",
        description: "An error occurred while signing out",
        variant: "destructive"
      });
    }
  };

  const handleNotificationClick = () => {
    toast({
      title: "Notifications",
      description: "You have no new notifications",
    });
  };

  const userInitials = user?.email ? user.email.substring(0, 2).toUpperCase() : 'US';
  const userName = user?.user_metadata?.full_name || 'User';

  return (
    <header className="w-full px-6 py-4 flex items-center justify-between bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-50 animate-fade-in">
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          className="mr-2 md:hidden" 
          onClick={onToggleSidebar}
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center mr-3">
            <span className="text-primary-foreground font-medium text-sm">CS</span>
          </div>
          <div>
            <h1 className="text-lg font-medium tracking-tight">Crowd Surveillance</h1>
            <p className="text-xs text-muted-foreground">Intelligent Monitoring System</p>
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        {isAnalyzingUpload && (
          <div className="hidden md:flex items-center mr-3 bg-primary/10 p-1.5 px-3 rounded-full">
            <Upload className="h-4 w-4 text-primary mr-2" />
            <span className="text-xs font-medium">Analyzing your upload</span>
          </div>
        )}
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative focus-ring"
          onClick={handleNotificationClick}
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
        </Button>
        
        <Separator orientation="vertical" className="h-6" />
        
        <Button variant="ghost" size="icon" className="focus-ring">
          <Settings className="h-5 w-5" />
        </Button>
        
        <div className="hidden md:flex items-center ml-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-medium text-sm">{userInitials}</span>
          </div>
          <div className="ml-2">
            <p className="text-sm font-medium leading-none">{userName}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </div>
        
        <Button variant="ghost" size="icon" onClick={handleSignOut} className="ml-2">
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
};

export default Header;
