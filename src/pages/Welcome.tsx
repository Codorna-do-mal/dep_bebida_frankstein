import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import Button from '../components/ui/Button';

const Welcome: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);
  
  return (
    <div className="min-h-screen bg-dark flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <img 
            src="https://raw.githubusercontent.com/stackblitz/stackblitz-images/main/franks-tem-bebidas-logo.png" 
            alt="Frank's Tem Bebidas Logo" 
            className="w-32 h-32 rounded-full"
          />
        </div>
        
        <h1 className="text-2xl font-bold text-white mb-2">Depósito Frankstein</h1>
        <h2 className="text-xl text-neon mb-8">Sistema de Ponto de Venda</h2>
        
        <p className="text-gray-400 mb-8">
          Sistema completo para gerenciamento de vendas, estoque, produtos, 
          caixa, funcionários e relatórios para o seu depósito de bebidas.
        </p>
        
        <div className="space-y-4">
          <Button
            onClick={() => navigate('/login')}
            size="lg"
            fullWidth
          >
            Acessar o Sistema
          </Button>
          
          <p className="text-sm text-gray-500 px-4">
            © 2025 Depósito Frankstein. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Welcome;