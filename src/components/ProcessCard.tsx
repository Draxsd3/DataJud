import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Calendar, Building, FileText, AlertTriangle, CheckCircle, Clock, ExternalLink } from 'lucide-react';
import { ProcessoJudicial } from '../types';
import { formatDate, formatDateTime, formatProcessNumber, truncateText } from '../utils/formatters';

interface ProcessCardProps {
  processo: ProcessoJudicial;
  onViewDetails: (processo: ProcessoJudicial) => void;
}

export const ProcessCard: React.FC<ProcessCardProps> = ({ processo, onViewDetails }) => {
  const [expanded, setExpanded] = useState(false);

  const getStatusColor = (grau: string) => {
    switch (grau.toLowerCase()) {
      case 'je': return 'bg-blue-100 text-blue-800';
      case 'g1': return 'bg-yellow-100 text-yellow-800';
      case 'g2': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (grau: string) => {
    switch (grau.toLowerCase()) {
      case 'je': return <FileText className="w-4 h-4" />;
      case 'g1': return <Clock className="w-4 h-4" />;
      case 'g2': return <AlertTriangle className="w-4 h-4" />;
      default: return <CheckCircle className="w-4 h-4" />;
    }
  };

  const lastMovimento = processo.movimentos && processo.movimentos.length > 0 
    ? processo.movimentos[processo.movimentos.length - 1]
    : null;

  return (
    <div className="bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {formatProcessNumber(processo.numeroProcesso)}
              </h3>
              <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(processo.grau)}`}>
                {getStatusIcon(processo.grau)}
                <span>{processo.grau}</span>
              </span>
            </div>
            
            <div className="flex items-center text-sm text-gray-600 mb-2">
              <Building className="w-4 h-4 mr-1" />
              <span className="font-medium">{processo.tribunal.toUpperCase()}</span>
              {processo.orgaoJulgador?.nome && (
                <span className="ml-2">• {truncateText(processo.orgaoJulgador.nome, 50)}</span>
              )}
            </div>
            
            {processo.classe && (
              <div className="text-sm text-gray-700 mb-2">
                <span className="font-medium">Classe:</span> {processo.classe.nome}
              </div>
            )}
            
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="w-4 h-4 mr-1" />
              <span>Ajuizado em {formatDate(processo.dataAjuizamento)}</span>
              {processo.dataHoraUltimaAtualizacao && (
                <span className="ml-4">
                  Atualizado em {formatDateTime(processo.dataHoraUltimaAtualizacao)}
                </span>
              )}
            </div>
          </div>
          
          <button
            onClick={() => onViewDetails(processo)}
            className="ml-4 text-blue-600 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50 transition-colors"
            title="Ver detalhes completos"
          >
            <ExternalLink className="w-5 h-5" />
          </button>
        </div>

        {lastMovimento && (
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-1">Último Movimento</h4>
            <p className="text-sm text-gray-600">
              <span className="font-medium">{formatDate(lastMovimento.data)}:</span> {lastMovimento.nome}
            </p>
            {lastMovimento.complementos && lastMovimento.complementos.length > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                {truncateText(lastMovimento.complementos.join(', '), 100)}
              </p>
            )}
          </div>
        )}

        {processo.assuntos && processo.assuntos.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Assuntos</h4>
            <div className="flex flex-wrap gap-1">
              {processo.assuntos.slice(0, expanded ? undefined : 3).map((assunto, index) => (
                <span
                  key={`${assunto.codigo}-${index}`}
                  className="inline-block bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded"
                >
                  {assunto.nome}
                </span>
              ))}
              {processo.assuntos.length > 3 && !expanded && (
                <span className="text-xs text-gray-500 px-2 py-1">
                  +{processo.assuntos.length - 3} mais
                </span>
              )}
            </div>
          </div>
        )}

        {processo.movimentos && processo.movimentos.length > 1 && (
          <div>
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              {expanded ? (
                <>
                  <ChevronUp className="w-4 h-4 mr-1" />
                  Ocultar movimentos
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 mr-1" />
                  Ver todos os movimentos ({processo.movimentos.length})
                </>
              )}
            </button>

            {expanded && (
              <div className="mt-4 space-y-3 max-h-64 overflow-y-auto">
                {processo.movimentos.slice().reverse().map((movimento, index) => (
                  <div key={`${movimento.codigo}-${index}`} className="border-l-2 border-gray-200 pl-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {movimento.nome}
                        </p>
                        <p className="text-xs text-gray-600">
                          {formatDateTime(movimento.data)}
                        </p>
                        {movimento.complementos && movimento.complementos.length > 0 && (
                          <div className="mt-1 text-xs text-gray-500">
                            {movimento.complementos.map((complemento, idx) => (
                              <p key={idx}>{complemento}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};