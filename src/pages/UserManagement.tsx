import React, { useState } from 'react';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { Search, UserPlus, Edit, Trash2, Lock, Save, X } from 'lucide-react';
import { employees } from '../data/mockData';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'gestor' | 'funcionario';
  isActive: boolean;
  lastLogin?: string;
}

const UserManagement: React.FC = () => {
  // Generate mock users from employees
  const initialUsers: User[] = employees.map(emp => ({
    id: emp.id,
    name: emp.name,
    email: emp.email,
    role: emp.role,
    isActive: true,
    lastLogin: new Date(Date.now() - Math.random() * 10000000000).toISOString()
  }));
  
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [search, setSearch] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  
  const initialNewUser: User = {
    id: '',
    name: '',
    email: '',
    role: 'funcionario',
    isActive: true
  };
  
  const [newUser, setNewUser] = useState<User>(initialNewUser);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Filter users based on search
  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  );
  
  const handleSaveUser = () => {
    if (editingUser) {
      setUsers(users.map(u => u.id === editingUser.id ? editingUser : u));
      setEditingUser(null);
    } else if (isAddingUser) {
      const id = Date.now().toString();
      setUsers([{ ...newUser, id }, ...users]);
      setNewUser(initialNewUser);
      setIsAddingUser(false);
    }
  };
  
  const handleDeleteUser = (id: string) => {
    setUsers(users.filter(u => u.id !== id));
  };
  
  const handleResetPassword = () => {
    // Simulate password reset
    setTimeout(() => {
      setIsResettingPassword(false);
      setNewPassword('');
      setConfirmPassword('');
    }, 1000);
  };
  
  const renderUserForm = (user: User, isNew = false) => {
    const updateUser = (field: keyof User, value: any) => {
      if (isNew) {
        setNewUser({ ...newUser, [field]: value });
      } else {
        setEditingUser({ ...editingUser!, [field]: value });
      }
    };
    
    return (
      <Card className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">
            {isNew ? 'Adicionar Usuário' : 'Editar Usuário'}
          </h3>
          <Button
            variant="ghost"
            onClick={() => {
              if (isNew) {
                setIsAddingUser(false);
                setNewUser(initialNewUser);
              } else {
                setEditingUser(null);
              }
            }}
            icon={<X size={18} />}
            size="sm"
          >
            Cancelar
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <Input
            label="Nome"
            value={user.name}
            onChange={(e) => updateUser('name', e.target.value)}
            fullWidth
            required
          />
          
          <Input
            label="Email"
            type="email"
            value={user.email}
            onChange={(e) => updateUser('email', e.target.value)}
            fullWidth
            required
          />
          
          <Select
            label="Cargo"
            options={[
              { value: 'gestor', label: 'Gestor' },
              { value: 'funcionario', label: 'Funcionário' }
            ]}
            value={user.role}
            onChange={(value) => updateUser('role', value as 'gestor' | 'funcionario')}
            fullWidth
            required
          />
          
          <Select
            label="Status"
            options={[
              { value: 'true', label: 'Ativo' },
              { value: 'false', label: 'Inativo' }
            ]}
            value={user.isActive.toString()}
            onChange={(value) => updateUser('isActive', value === 'true')}
            fullWidth
            required
          />
        </div>
        
        {isNew && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Input
              label="Senha"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              fullWidth
              required
            />
            
            <Input
              label="Confirmar Senha"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              fullWidth
              required
              error={newPassword !== confirmPassword && confirmPassword !== '' ? 'As senhas não coincidem' : undefined}
            />
          </div>
        )}
        
        <div className="flex justify-end">
          <Button 
            onClick={handleSaveUser} 
            icon={<Save size={18} />}
            disabled={
              !user.name || 
              !user.email || 
              (isNew && (!newPassword || newPassword !== confirmPassword))
            }
          >
            Salvar
          </Button>
        </div>
      </Card>
    );
  };
  
  return (
    <Layout title="Gerenciar Usuários">
      {isAddingUser && renderUserForm(newUser, true)}
      {editingUser && renderUserForm(editingUser)}
      
      {isResettingPassword && (
        <Card className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Redefinir Senha</h3>
            <Button
              variant="ghost"
              onClick={() => {
                setIsResettingPassword(false);
                setNewPassword('');
                setConfirmPassword('');
              }}
              icon={<X size={18} />}
              size="sm"
            >
              Cancelar
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Input
              label="Nova Senha"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              fullWidth
              required
            />
            
            <Input
              label="Confirmar Senha"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              fullWidth
              required
              error={newPassword !== confirmPassword && confirmPassword !== '' ? 'As senhas não coincidem' : undefined}
            />
          </div>
          
          <div className="flex justify-end">
            <Button 
              onClick={handleResetPassword} 
              icon={<Save size={18} />}
              disabled={!newPassword || newPassword !== confirmPassword}
            >
              Salvar Nova Senha
            </Button>
          </div>
        </Card>
      )}
      
      <Card>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <Input
            placeholder="Buscar por nome ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search size={18} />}
            className="flex-1"
          />
          
          <Button
            onClick={() => {
              setIsAddingUser(true);
              setEditingUser(null);
              setIsResettingPassword(false);
            }}
            icon={<UserPlus size={18} />}
            disabled={isAddingUser || !!editingUser || isResettingPassword}
          >
            Novo Usuário
          </Button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-lighter">
                <th className="px-4 py-2 text-left font-medium text-gray-400">Nome</th>
                <th className="px-4 py-2 text-left font-medium text-gray-400">Email</th>
                <th className="px-4 py-2 text-left font-medium text-gray-400">Cargo</th>
                <th className="px-4 py-2 text-left font-medium text-gray-400">Status</th>
                <th className="px-4 py-2 text-left font-medium text-gray-400">Último Acesso</th>
                <th className="px-4 py-2 text-left font-medium text-gray-400">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-dark-lighter hover:bg-dark-lighter">
                  <td className="px-4 py-3 font-medium">{user.name}</td>
                  <td className="px-4 py-3 text-sm">{user.email}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.role === 'gestor' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role === 'gestor' ? 'Gestor' : 'Funcionário'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.isActive
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleString('pt-BR') : 'Nunca'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <button
                        className="p-1.5 bg-dark-lighter text-gray-400 hover:text-white rounded"
                        onClick={() => {
                          setEditingUser(user);
                          setIsAddingUser(false);
                          setIsResettingPassword(false);
                        }}
                        title="Editar"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className="p-1.5 bg-dark-lighter text-gray-400 hover:text-yellow-500 rounded"
                        onClick={() => {
                          setIsResettingPassword(true);
                          setIsAddingUser(false);
                          setEditingUser(null);
                        }}
                        title="Redefinir Senha"
                      >
                        <Lock size={16} />
                      </button>
                      <button
                        className="p-1.5 bg-dark-lighter text-gray-400 hover:text-red-500 rounded"
                        onClick={() => handleDeleteUser(user.id)}
                        title="Excluir"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <p className="mb-2">Nenhum usuário encontrado</p>
              <p className="text-sm">Tente ajustar o filtro de busca ou adicione um novo usuário</p>
            </div>
          )}
        </div>
      </Card>
    </Layout>
  );
};

export default UserManagement;