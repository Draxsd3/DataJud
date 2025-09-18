import React, { useState } from 'react';
import { Scale, Database, AlertCircle, Settings } from 'lucide-react';
import { SearchForm } from './components/SearchForm';
import { ProcessCard } from './components/ProcessCard';
import { ProcessModal } from './components/ProcessModal';
import { LoadingSkeleton, SearchingSkeleton } from './components/LoadingSkeleton';
import { ErrorMessage, ErrorList } from './components/ErrorMessage';
import { ResultsSummary } from './components/ResultsSummary';
import { ApiStatus } from './components/ApiStatus';
import { ProcessoJudicial } from './types';
import { datajudService } from './services/datajud';
import { getTribunalByAlias } from './utils/tribunais';
import { DATAJUD_CONFIG } from './config/datajud';

function App() {
  const [processos, setProcessos] = useState<ProcessoJudicial[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [selectedProcess, setSelectedProcess] = useState<ProcessoJudicial | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showApiStatus, setShowApiStatus] = useState(false);
  const [searchStats, setSearchStats] = useState<{
    totalProcessos: number;
    tribunaisConsultados: number;
    tribunaisComResultados: number;
    tribunaisResultados: Array<{ nome: string; total: number }>;
  } | null>(null);

  const handleSearch = async (term: string, selectedTribunais: string[]) => {
    setLoading(true);
    setProcessos([]);
    setErrors([]);
    setSearchStats(null);
    setSearchTerm(term);

    try {
      const { results, errors: searchErrors } = await datajudService.searchProcessos(term, selectedTribunais);
      
      // Consolidar todos os processos
      const allProcessos = results.flatMap(result => result.processos);
      setProcessos(allProcessos);
      
      // Estatísticas
      const tribunaisComResultados = results.filter(r => r.processos.length > 0);
      const tribunaisResultados = tribunaisComResultados.map(result => ({
        nome: result.tribunal,
        total: result.processos.length
      }));

      setSearchStats({
        totalProcessos: allProcessos.length,
        tribunaisConsultados: results.length,
        tribunaisComResultados: tribunaisComResultados.length,
        tribunaisResultados
      });

      if (searchErrors.length > 0) {
        setErrors(searchErrors);
      }

      if (allProcessos.length === 0 && searchErrors.length === 0) {
        setErrors(['Nenhum processo encontrado para os critérios informados']);
      }

    } catch (error) {
      console.error('Erro na busca:', error);
      setErrors([error instanceof Error ? error.message : 'Erro desconhecido durante a busca']);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (processo: ProcessoJudicial) => {
    setSelectedProcess(processo);
    setShowModal(true);
  };

  const handleRetry = () => {
    if (searchTerm) {
      handleSearch(searchTerm, []);
    }
  };

  const clearCache = () => {
    datajudService.clearCache();
    setProcessos([]);
    setErrors([]);
    setSearchStats(null);
    setSearchTerm('');
  };

  const cacheStats = datajudService.getCacheStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Scale className="w-12 h-12 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">DataJud Securitizadora</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-4">
            Plataforma de consulta de processos judiciais para análise de risco. 
            Integrada com a API Pública do DataJud/CNJ para busca em todos os tribunais brasileiros.
          </p>
          
          {/* API Status Toggle */}
          <button
            onClick={() => setShowApiStatus(!showApiStatus)}
            className="text-sm text-blue-600 hover:text-blue-700 flex items-center mx-auto"
          >
            <Settings className="w-4 h-4 mr-1" />
            {showApiStatus ? 'Ocultar' : 'Mostrar'} status da API
          </button>
        </div>

        {/* API Status */}
        {showApiStatus && (
          <div className="mb-6">
            <ApiStatus />
          </div>
        )}

        {/* Search Form */}
        <SearchForm onSearch={handleSearch} loading={loading} />

        {/* Cache Management */}
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              <span>Cache: {cacheStats.size} entradas</span>
              <span>API Key: ****{DATAJUD_CONFIG.API_KEY.slice(-8)}</span>
            </div>
          </div>
          <button
            onClick={clearCache}
            className="text-sm text-gray-600 hover:text-gray-800 flex items-center"
          >
            <Database className="w-4 h-4 mr-1" />
            Limpar cache
          </button>
        </div>

        {/* Loading State */}
        {loading && <SearchingSkeleton tribunais={[]} />}

        {/* Errors */}
        <ErrorList errors={errors} />

        {/* Results Summary */}
        {searchStats && (
          <ResultsSummary
            totalProcessos={searchStats.totalProcessos}
            tribunaisConsultados={searchStats.tribunaisConsultados}
            tribunaisComResultados={searchStats.tribunaisComResultados}
            tribunaisResultados={searchStats.tribunaisResultados}
          />
        )}

        {/* Results */}
        {!loading && processos.length > 0 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">
                Processos Encontrados ({processos.length})
              </h2>
              <div className="text-sm text-gray-600">
                Ordenados por data de ajuizamento (mais recente primeiro)
              </div>
            </div>
            
            <div className="space-y-4">
              {processos.map((processo, index) => (
                <ProcessCard
                  key={`${processo.numeroProcesso}-${processo.tribunal}-${index}`}
                  processo={processo}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && processos.length === 0 && !errors.length && searchStats && (
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Nenhum processo encontrado
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Não foram encontrados processos para os critérios informados. 
              Verifique se o CPF/CNPJ está correto ou tente com outros parâmetros.
            </p>
          </div>
        )}

        {/* Process Modal */}
        <ProcessModal
          processo={selectedProcess}
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedProcess(null);
          }}
        />

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
          <div className="space-y-2">
            <p>
              Plataforma DataJud Securitizadora - Integração com API Pública CNJ/DPJ
            </p>
            <p>
              API Key vigente: ****{DATAJUD_CONFIG.API_KEY.slice(-8)} | 
              Última atualização: Consulte a Wiki do CNJ
            </p>
            <p className="text-xs">
              ⚠️ A chave da API pode ser alterada pelo CNJ a qualquer momento. 
              Para atualizações, consulte: <a href="https://wiki-publica.cnj.jus.br/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Wiki Pública CNJ</a>
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;