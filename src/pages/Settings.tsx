import React, { useState } from 'react';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Save } from 'lucide-react';

const Settings: React.FC = () => {
  const [settings, setSettings] = useState({
    companyName: 'Depósito Frankstein',
    cnpj: '12.345.678/0001-90',
    phone: '(11) 98765-4321',
    email: 'contato@depositofrankstein.com.br',
    address: 'Rua das Bebidas, 123',
    city: 'São Paulo',
    state: 'SP',
    zip: '01234-567',
    logoUrl: '',
    receiptFooter: 'Obrigado pela preferência!',
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const handleChange = (field: string, value: string) => {
    setSettings({
      ...settings,
      [field]: value,
    });
  };
  
  const handleSave = () => {
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      setShowSuccess(true);
      
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    }, 1000);
  };
  
  return (
    <Layout title="Configurações">
      {showSuccess && (
        <div className="bg-green-900/20 border border-green-900/30 rounded-lg p-3 mb-4 flex items-center">
          <div className="text-green-500 mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="text-green-500">Configurações salvas com sucesso!</span>
        </div>
      )}
      
      <Card>
        <h2 className="text-lg font-bold mb-4">Dados do Estabelecimento</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Input
            label="Nome do Estabelecimento"
            value={settings.companyName}
            onChange={(e) => handleChange('companyName', e.target.value)}
            fullWidth
          />
          
          <Input
            label="CNPJ"
            value={settings.cnpj}
            onChange={(e) => handleChange('cnpj', e.target.value)}
            fullWidth
          />
          
          <Input
            label="Telefone"
            value={settings.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            fullWidth
          />
          
          <Input
            label="E-mail"
            type="email"
            value={settings.email}
            onChange={(e) => handleChange('email', e.target.value)}
            fullWidth
          />
          
          <Input
            label="Endereço"
            value={settings.address}
            onChange={(e) => handleChange('address', e.target.value)}
            fullWidth
          />
          
          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Cidade"
              value={settings.city}
              onChange={(e) => handleChange('city', e.target.value)}
              fullWidth
            />
            
            <Input
              label="Estado"
              value={settings.state}
              onChange={(e) => handleChange('state', e.target.value)}
              fullWidth
            />
            
            <Input
              label="CEP"
              value={settings.zip}
              onChange={(e) => handleChange('zip', e.target.value)}
              fullWidth
            />
          </div>
        </div>
        
        <h3 className="text-md font-bold mb-3">Aparência</h3>
        
        <div className="mb-6">
          <Input
            label="URL do Logo"
            value={settings.logoUrl}
            onChange={(e) => handleChange('logoUrl', e.target.value)}
            placeholder="https://exemplo.com/logo.png"
            fullWidth
          />
        </div>
        
        <h3 className="text-md font-bold mb-3">Impressão</h3>
        
        <div className="mb-6">
          <Input
            label="Rodapé do Cupom"
            value={settings.receiptFooter}
            onChange={(e) => handleChange('receiptFooter', e.target.value)}
            fullWidth
          />
        </div>
        
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            loading={isSaving}
            icon={<Save size={18} />}
          >
            Salvar Configurações
          </Button>
        </div>
      </Card>
    </Layout>
  );
};

export default Settings;