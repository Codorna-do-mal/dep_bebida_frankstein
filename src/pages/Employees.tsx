import React, { useState } from 'react';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { Search, Plus, Edit, Trash2, UserPlus, Save, X } from 'lucide-react';
import { employees as mockEmployees } from '../data/mockData';
import { Employee } from '../types';
import { format } from 'date-fns';

const Employees: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [search, setSearch] = useState('');
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [isAddingEmployee, setIsAddingEmployee] = useState(false);
  
  const initialNewEmployee: Employee = {
    id: '',
    name: '',
    email: '',
    phone: '',
    role: 'funcionario',
    hireDate: format(new Date(), 'yyyy-MM-dd')
  };
  
  const [newEmployee, setNewEmployee] = useState<Employee>(initialNewEmployee);
  
  // Filter employees based on search
  const filteredEmployees = employees.filter((employee) =>
    employee.name.toLowerCase().includes(search.toLowerCase()) ||
    employee.email.toLowerCase().includes(search.toLowerCase())
  );
  
  const handleSaveEmployee = () => {
    if (editingEmployee) {
      setEmployees(employees.map(e => e.id === editingEmployee.id ? editingEmployee : e));
      setEditingEmployee(null);
    } else if (isAddingEmployee) {
      const id = Date.now().toString();
      setEmployees([{ ...newEmployee, id }, ...employees]);
      setNewEmployee(initialNewEmployee);
      setIsAddingEmployee(false);
    }
  };
  
  const handleDeleteEmployee = (id: string) => {
    setEmployees(employees.filter(e => e.id !== id));
  };
  
  const renderEmployeeForm = (employee: Employee, isNew = false) => {
    const updateEmployee = (field: keyof Employee, value: any) => {
      if (isNew) {
        setNewEmployee({ ...newEmployee, [field]: value });
      } else {
        setEditingEmployee({ ...editingEmployee!, [field]: value });
      }
    };
    
    return (
      <Card className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">
            {isNew ? 'Adicionar Funcionário' : 'Editar Funcionário'}
          </h3>
          <Button
            variant="ghost"
            onClick={() => {
              if (isNew) {
                setIsAddingEmployee(false);
                setNewEmployee(initialNewEmployee);
              } else {
                setEditingEmployee(null);
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
            value={employee.name}
            onChange={(e) => updateEmployee('name', e.target.value)}
            fullWidth
            required
          />
          
          <Input
            label="Email"
            type="email"
            value={employee.email}
            onChange={(e) => updateEmployee('email', e.target.value)}
            fullWidth
            required
          />
          
          <Input
            label="Telefone"
            value={employee.phone}
            onChange={(e) => updateEmployee('phone', e.target.value)}
            fullWidth
            required
          />
          
          <Select
            label="Cargo"
            options={[
              { value: 'gestor', label: 'Gestor' },
              { value: 'funcionario', label: 'Funcionário' }
            ]}
            value={employee.role}
            onChange={(value) => updateEmployee('role', value as 'gestor' | 'funcionario')}
            fullWidth
            required
          />
          
          <Input
            label="Data de Admissão"
            type="date"
            value={employee.hireDate}
            onChange={(e) => updateEmployee('hireDate', e.target.value)}
            fullWidth
            required
          />
        </div>
        
        <div className="flex justify-end">
          <Button 
            onClick={handleSaveEmployee} 
            icon={<Save size={18} />}
            disabled={!employee.name || !employee.email || !employee.phone}
          >
            Salvar
          </Button>
        </div>
      </Card>
    );
  };
  
  return (
    <Layout title="Funcionários">
      {isAddingEmployee && renderEmployeeForm(newEmployee, true)}
      {editingEmployee && renderEmployeeForm(editingEmployee)}
      
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
              setIsAddingEmployee(true);
              setEditingEmployee(null);
            }}
            icon={<UserPlus size={18} />}
            disabled={isAddingEmployee || !!editingEmployee}
          >
            Novo Funcionário
          </Button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-lighter">
                <th className="px-4 py-2 text-left font-medium text-gray-400">Nome</th>
                <th className="px-4 py-2 text-left font-medium text-gray-400">Contato</th>
                <th className="px-4 py-2 text-left font-medium text-gray-400">Cargo</th>
                <th className="px-4 py-2 text-left font-medium text-gray-400">Data de Admissão</th>
                <th className="px-4 py-2 text-left font-medium text-gray-400">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((employee) => (
                <tr key={employee.id} className="border-b border-dark-lighter hover:bg-dark-lighter">
                  <td className="px-4 py-3 font-medium">{employee.name}</td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm">{employee.email}</p>
                      <p className="text-xs text-gray-400">{employee.phone}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      employee.role === 'gestor' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {employee.role === 'gestor' ? 'Gestor' : 'Funcionário'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {new Date(employee.hireDate).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <button
                        className="p-1.5 bg-dark-lighter text-gray-400 hover:text-white rounded"
                        onClick={() => {
                          setEditingEmployee(employee);
                          setIsAddingEmployee(false);
                        }}
                        title="Editar"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className="p-1.5 bg-dark-lighter text-gray-400 hover:text-red-500 rounded"
                        onClick={() => handleDeleteEmployee(employee.id)}
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
          
          {filteredEmployees.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <p className="mb-2">Nenhum funcionário encontrado</p>
              <p className="text-sm">Tente ajustar o filtro de busca ou adicione um novo funcionário</p>
            </div>
          )}
        </div>
      </Card>
    </Layout>
  );
};

export default Employees;