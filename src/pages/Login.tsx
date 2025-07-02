import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Beer, User, Lock } from 'lucide-react';
import { useAuthStore, verifyCredentials } from '../stores/authStore';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // Simple validation
    if (!email || !password) {
      setError('Preencha todos os campos');
      setLoading(false);
      return;
    }
    
    // Simulate API call
    setTimeout(() => {
      const user = verifyCredentials(email, password);
      
      if (user) {
        login(user);
        navigate('/dashboard');
      } else {
        setError('E-mail ou senha incorretos');
      }
      
      setLoading(false);
    }, 1000);
  };
  
  return (
    <div className="min-h-screen bg-dark flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="bg-neon/20 p-4 rounded-full">
              <Beer size={48} className="text-neon" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-white">Depósito Frankstein</h1>
          <p className="text-gray-400 mt-2">Acesse sua conta para continuar</p>
        </div>
        
        <div className="bg-dark-light rounded-xl p-6 shadow-lg">
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <Input
                type="email"
                label="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="exemplo@email.com"
                icon={<User size={18} />}
                fullWidth
                required
              />
              
              <Input
                type="password"
                label="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                icon={<Lock size={18} />}
                fullWidth
                required
              />
              
              <Button
                type="submit"
                loading={loading}
                fullWidth
                size="lg"
              >
                Entrar
              </Button>
            </div>
          </form>
          
          <div className="mt-6">
            <p className="text-sm text-gray-500 text-center">
              Credenciais demo: <br />
              <span className="text-gray-400">admin@deposito.com / admin123</span>
              <br />
              <span className="text-gray-400">funcionario@deposito.com / func123</span>
            </p>
          </div>
        </div>
        
        <p className="text-center text-xs text-gray-500 mt-8">
          © 2025 Depósito Frankstein. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
};

export default Login;