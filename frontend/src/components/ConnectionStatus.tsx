import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle,
  Server
} from "lucide-react";
import { apiClient } from "@/services/api";

interface ConnectionStatusProps {
  onRetry?: () => void;
}

const ConnectionStatus = ({ onRetry }: ConnectionStatusProps) => {
  const [status, setStatus] = useState<'checking' | 'connected' | 'disconnected' | 'error'>('checking');
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  const checkConnection = async () => {
    setIsRetrying(true);
    setStatus('checking');
    
    try {
      const response = await apiClient.healthCheck();
      if (response.status === 'OK' || response.status === 'MOCK') {
        setStatus('connected');
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('disconnected');
    } finally {
      setLastCheck(new Date());
      setIsRetrying(false);
    }
  };

  useEffect(() => {
    checkConnection();
    // Check connection every 30 seconds
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = () => {
    switch (status) {
      case 'checking':
        return <RefreshCw className="h-4 w-4 animate-spin" />;
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'disconnected':
        return <WifiOff className="h-4 w-4 text-red-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Server className="h-4 w-4" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'checking':
        return 'Checking...';
      case 'connected':
        return 'Connected';
      case 'disconnected':
        return 'Disconnected';
      case 'error':
        return 'Error';
      default:
        return 'Unknown';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return 'bg-green-500/10 text-green-700 border-green-500/20';
      case 'disconnected':
        return 'bg-red-500/10 text-red-700 border-red-500/20';
      case 'error':
        return 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20';
      default:
        return 'bg-gray-500/10 text-gray-700 border-gray-500/20';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="flex items-center space-x-2">
        <Badge 
          variant="outline" 
          className={`flex items-center space-x-2 ${getStatusColor()}`}
        >
          {getStatusIcon()}
          <span className="text-sm font-medium">{getStatusText()}</span>
        </Badge>
        
        {(status === 'disconnected' || status === 'error') && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              checkConnection();
              onRetry?.();
            }}
            disabled={isRetrying}
            className="text-xs"
          >
            {isRetrying ? (
              <RefreshCw className="h-3 w-3 animate-spin" />
            ) : (
              <RefreshCw className="h-3 w-3" />
            )}
          </Button>
        )}
      </div>
      
      {lastCheck && (
        <div className="text-xs text-muted-foreground mt-1 text-right">
          Last check: {lastCheck.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
};

export default ConnectionStatus;
