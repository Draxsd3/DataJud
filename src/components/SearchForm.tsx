import React, { useState } from 'react';
import { Search, Building2, User, AlertCircle, Loader2 } from 'lucide-react';
import { validateCNPJ, validateCPF, formatCNPJ, formatCPF, detectDocumentType } from '../utils/validation';
import { TRIBUNAIS } from '../utils/tribunais';

interface SearchFormProps {
  onSearch: (searchTerm: string, selectedTribunais: string[]) => void;
  loading: boolean;
}

export const SearchForm: React.FC<SearchFormProps> = ({ onSearch, loading }) => {
  const [document, setDocument] = useState('');
  const [selectedTribunais, setSelectedTribunais] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [showTribunais, setShowTribunais] = useState(false);

  const handleDocumentChange = (value: string) => {
    // Permitir apenas números
    const cleanValue = value.replace(/[^\d]/g, '');
    
    // Limitar tamanho baseado no tipo de documento
    if (cleanValue.length <= 14) {
      setDocument(cleanValue);
      setError('');
    }
  };

  const getFormattedDocument = () => {
    const type = detectDocumentType(document);
    if (type === 'CPF') return formatCPF(document);
    if (type === 'CNPJ') return formatCNPJ(document);
    return document;
  };

  const getDocumentIcon = () => {
    const type = detectDocumentType(document);
    if (type === 'CPF') return <User className="w-5 h-5 text-blue-500" />;
    if (type === 'CNPJ') return <Building2 className="w-5 h-5 text-blue-500" />;
    return <Search className="w-5 h-5 text-gray-400" />;
  };

  const validateForm = (): boolean => {
    if (!document.trim()) {
      setError('Por favor, insira um CPF ou CNPJ');
      return false;
    }

    const type = detectDocumentType(document);
    if (type === 'INVALID') {
      setError('CPF ou CNPJ inválido');
      return false;
    }

    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    // Buscar pelo nome da empresa/pessoa associada ao documento
    // Em um caso real, você faria uma consulta à Receita Federal ou base interna
    const searchTerm = document; // Placeholder - em produção usar o nome real
    onSearch(searchTerm, selectedTribunais);
  };

  const toggleTribunal = (alias: string) => {
    setSelectedTribunais(prev => 
      prev.includes(alias) 
        ? prev.filter(t => t !== alias)
        : [...prev, alias]
    );
  };

  const selectAllTribunais = () => {
    setSelectedTribunais(TRIBUNAIS.map(t => t.alias));
  };

  const clearTribunais = () => {
    setSelectedTribunais([]);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="document" className="block text-sm font-medium text-gray-700 mb-2">
            CPF ou CNPJ
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {getDocumentIcon()}
            </div>
            <input
              id="document"
              type="text"
              value={getFormattedDocument()}
              onChange={(e) => handleDocumentChange(e.target.value)}
              placeholder="Digite o CPF ou CNPJ"
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                error ? 'border-red-300' : 'border-gray-300'
              }`}
            />
          </div>
          {error && (
            <div className="mt-2 flex items-center text-sm text-red-600">
              <AlertCircle className="w-4 h-4 mr-1" />
              {error}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Tribunais (opcional)
            </label>
            <button
              type="button"
              onClick={() => setShowTribunais(!showTribunais)}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              {showTribunais ? 'Ocultar' : 'Selecionar tribunais específicos'}
            </button>
          </div>
          
          {showTribunais && (
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex space-x-2 mb-3">
                <button
                  type="button"
                  onClick={selectAllTribunais}
                  className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded hover:bg-blue-100"
                >
                  Selecionar todos
                </button>
                <button
                  type="button"
                  onClick={clearTribunais}
                  className="text-sm bg-gray-50 text-gray-700 px-3 py-1 rounded hover:bg-gray-100"
                >
                  Limpar seleção
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {TRIBUNAIS.map((tribunal) => (
                  <label key={tribunal.alias} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedTribunais.includes(tribunal.alias)}
                      onChange={() => toggleTribunal(tribunal.alias)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{tribunal.nome}</span>
                  </label>
                ))}
              </div>
              <div className="text-xs text-gray-500">
                {selectedTribunais.length === 0 
                  ? 'Nenhum tribunal selecionado - buscará em todos'
                  : `${selectedTribunais.length} tribunal(is) selecionado(s)`
                }
              </div>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Buscando processos...
            </>
          ) : (
            <>
              <Search className="w-5 h-5 mr-2" />
              Buscar Processos
            </>
          )}
        </button>
      </form>
    </div>
  );
};