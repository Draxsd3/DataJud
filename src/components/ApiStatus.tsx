import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { datajudService } from '../services/datajud';

export const ApiStatus: React.FC = () => {
  const [status, setStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [message, setMessage] = useState('Verificando conexão...');
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const checkConnection = async () => {
    setStatus('checking');
    setMessage('Testando conexão com a API DataJud...');
    
    try {
      const result = await datajudService.testApiConnection();
      setStatus(result.success ? 'connected' : 'error');
      setMessage(result.message);
      setLastCheck(new Date());
    } catch (error) {
      setStatus('error');
      setMessage('Falha ao verificar conexão com a API');
      setLastCheck(new Date());
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  const getStatusIcon = () => {
    switch (status) {
      case 'checking':
        return <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />;
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'checking':
        return 'border-blue-200 bg-blue-50';
      case 'connected':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
    }
  };

  return (
    <div className={`rounded-lg border p-3 ${getStatusColor()}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <div>
            <div className="text-sm font-medium">Status da API DataJud</div>
            <div className="text-xs text-gray-600">{message}</div>
          </div>
        </div>
        
        <button
          onClick={checkConnection}
          className="text-xs px-2 py-1 rounded bg-white border hover:bg-gray-50 transition-colors"
          disabled={status === 'checking'}
        >
          Testar
        </button>
      </div>
      
      {lastCheck && (
        <div className="text-xs text-gray-500 mt-2">
          Última verificação: {lastCheck.toLocaleTimeString()}
        </div>
      )}
      
      {status === 'error' && (
        <div className="mt-2 p-2 bg-red-100 rounded text-xs text-red-700">
          <div className="font-medium">Possíveis soluções:</div>
          <ul className="mt-1 space-y-1">
            <li>• Verifique se a API Key está atualizada</li>
            <li>• Consulte a Wiki do CNJ para a chave vigente</li>
            <li>• Verifique sua conexão com a internet</li>
          </ul>
        </div>
      )}
    </div>
  );
};