import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { 
  Home, ShoppingCart, Package, BarChart3, Users, CreditCard, 
  Settings, LogOut, ChevronRight, Menu, X, Beer
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <Home size={20} /> },
    { path: '/sales', label: 'Vendas', icon: <ShoppingCart size={20} /> },
    { path: '/products', label: 'Produtos', icon: <Beer size={20} /> },
    { path: '/inventory', label: 'Estoque', icon: <Package size={20} /> },
    { path: '/cashier', label: 'Caixa', icon: <CreditCard size={20} /> },
    { path: '/reports', label: 'Relatórios', icon: <BarChart3 size={20} /> },
  ];

  // Additional menu items only for managers
  const managerMenuItems = [
    { path: '/employees', label: 'Funcionários', icon: <Users size={20} /> },
    { path: '/settings', label: 'Configurações', icon: <Settings size={20} /> },
  ];
  
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen bg-dark overflow-hidden">
      {/* Mobile sidebar backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-30 w-64 transform transition-transform duration-300 bg-dark border-r border-dark-lighter lg:relative lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 border-b border-dark-lighter p-2">
            <img 
              src="https://raw.githubusercontent.com/stackblitz/stackblitz-images/main/franks-tem-bebidas-logo.png" 
              alt="Frank's Tem Bebidas Logo" 
              className="h-12 w-12 rounded-full mr-2"
            />
            <h1 className="text-xl font-bold text-neon">
              Depósito Frankstein
            </h1>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => (
              <a
                key={item.path}
                href={item.path}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(item.path);
                  setIsSidebarOpen(false);
                }}
                className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
              >
                {item.icon}
                <span>{item.label}</span>
                {isActive(item.path) && <ChevronRight className="ml-auto" size={16} />}
              </a>
            ))}
            
            {user?.role === 'gestor' && (
              <>
                <div className="border-t border-dark-lighter my-2 pt-2">
                  <p className="text-xs text-gray-500 uppercase font-medium px-3 py-1">
                    Administração
                  </p>
                </div>
                
                {managerMenuItems.map((item) => (
                  <a
                    key={item.path}
                    href={item.path}
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(item.path);
                      setIsSidebarOpen(false);
                    }}
                    className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                    {isActive(item.path) && <ChevronRight className="ml-auto" size={16} />}
                  </a>
                ))}
              </>
            )}
          </nav>
          
          {/* User info & logout */}
          <div className="p-4 border-t border-dark-lighter">
            <div className="flex items-center">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-1 rounded-full hover:bg-dark-lighter text-gray-400 hover:text-white"
                title="Sair"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </aside>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center justify-between px-4 border-b border-dark-lighter bg-dark-light">
          <div className="flex items-center">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-md lg:hidden text-gray-400 hover:text-white hover:bg-dark-lighter"
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h2 className="ml-2 lg:ml-0 text-xl font-semibold">{title}</h2>
          </div>
          
          <div className="flex items-center">
            <span className="text-sm text-gray-400">
              {new Date().toLocaleDateString('pt-BR')} 
              {' • '}
              {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </header>
        
        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;