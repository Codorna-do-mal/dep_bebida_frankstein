import React, { useEffect, useState } from 'react';
import { AlertTriangle, Wifi, WifiOff } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import Button from './Button';

const ConnectionStatus: React.FC = () => {
  const { connectionError, checkConnection, clearConnectionError } = useAuthStore();
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    const connected = await checkConnection();
    if (connected) {
      clearConnectionError();
    }
    setIsRetrying(false);
  };

  if (!connectionError) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 bg-red-900/90 border border-red-500/50 rounded-lg p-4 max-w-sm">
      <div className="flex items-start">
        <WifiOff className="text-red-400 mr-3 mt-0.5 flex-shrink-0" size={20} />
        <div className="flex-1">
          <h4 className="text-red-100 font-medium mb-1">Conexão perdida</h4>
          <p className="text-red-200 text-sm mb-3">
            Não foi possível conectar ao banco de dados. Verifique sua conexão com a internet.
          </p>
          <Button
            size="sm"
            variant="secondary"
            onClick={handleRetry}
            loading={isRetrying}
            className="bg-red-700 hover:bg-red-600 text-white"
          >
            Tentar novamente
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConnectionStatus;