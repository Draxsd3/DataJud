import React from 'react';
import { X, Calendar, Building, FileText, Users, Scale } from 'lucide-react';
import { ProcessoJudicial } from '../types';
import { formatDate, formatDateTime, formatProcessNumber } from '../utils/formatters';

interface ProcessModalProps {
  processo: ProcessoJudicial | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ProcessModal: React.FC<ProcessModalProps> = ({ processo, isOpen, onClose }) => {
  if (!isOpen || !processo) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
        
        <div className="relative bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              Detalhes do Processo
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Informações Básicas */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">Informações Básicas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-blue-700">Número do Processo</label>
                  <p className="text-lg font-mono font-bold text-blue-900">
                    {formatProcessNumber(processo.numeroProcesso)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-blue-700">Tribunal</label>
                  <p className="text-blue-900">{processo.tribunal.toUpperCase()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-blue-700">Grau</label>
                  <p className="text-blue-900">{processo.grau}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-blue-700">Data de Ajuizamento</label>
                  <p className="text-blue-900">{formatDate(processo.dataAjuizamento)}</p>
                </div>
              </div>
            </div>

            {/* Classe e Sistema */}
            {(processo.classe || processo.sistema || processo.formato) && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Classificação
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {processo.classe && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Classe</label>
                      <p className="text-gray-900">{processo.classe.nome}</p>
                      <p className="text-xs text-gray-500">Código: {processo.classe.codigo}</p>
                    </div>
                  )}
                  {processo.sistema && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Sistema</label>
                      <p className="text-gray-900">{processo.sistema.nome}</p>
                      <p className="text-xs text-gray-500">Código: {processo.sistema.codigo}</p>
                    </div>
                  )}
                  {processo.formato && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Formato</label>
                      <p className="text-gray-900">{processo.formato.nome}</p>
                      <p className="text-xs text-gray-500">Código: {processo.formato.codigo}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Órgão Julgador */}
            {processo.orgaoJulgador && (
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-900 mb-3 flex items-center">
                  <Building className="w-5 h-5 mr-2" />
                  Órgão Julgador
                </h3>
                <div className="space-y-2">
                  <p className="text-green-900">{processo.orgaoJulgador.nome}</p>
                  <div className="text-sm text-green-700">
                    <p>Código: {processo.orgaoJulgador.codigo}</p>
                    <p>Município IBGE: {processo.orgaoJulgador.codigoMunicipioIBGE}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Assuntos */}
            {processo.assuntos && processo.assuntos.length > 0 && (
              <div className="bg-purple-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-purple-900 mb-3 flex items-center">
                  <Scale className="w-5 h-5 mr-2" />
                  Assuntos ({processo.assuntos.length})
                </h3>
                <div className="space-y-2">
                  {processo.assuntos.map((assunto, index) => (
                    <div key={`${assunto.codigo}-${index}`} className="flex justify-between items-center p-2 bg-white rounded border">
                      <span className="text-purple-900">{assunto.nome}</span>
                      <span className="text-sm text-purple-600">#{assunto.codigo}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Partes */}
            {processo.partes && processo.partes.length > 0 && (
              <div className="bg-orange-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-orange-900 mb-3 flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Partes ({processo.partes.length})
                </h3>
                <div className="space-y-2">
                  {processo.partes.map((parte, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-white rounded border">
                      <div>
                        <p className="text-orange-900 font-medium">{parte.nome}</p>
                        <p className="text-sm text-orange-700">{parte.tipo}</p>
                      </div>
                      {parte.documento && (
                        <span className="text-sm text-orange-600 font-mono">{parte.documento}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Movimentos */}
            {processo.movimentos && processo.movimentos.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Histórico de Movimentos ({processo.movimentos.length})
                </h3>
                <div className="max-h-96 overflow-y-auto space-y-3">
                  {processo.movimentos.slice().reverse().map((movimento, index) => (
                    <div key={`${movimento.codigo}-${index}`} className="bg-white p-4 rounded border-l-4 border-blue-400">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900">{movimento.nome}</h4>
                        <span className="text-sm text-gray-500">#{movimento.codigo}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {formatDateTime(movimento.data)}
                      </p>
                      {movimento.complementos && movimento.complementos.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {movimento.complementos.map((complemento, idx) => (
                            <p key={idx} className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                              {complemento}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Metadados */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Metadados</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="font-medium text-gray-700">Última Atualização</label>
                  <p className="text-gray-600">{formatDateTime(processo.dataHoraUltimaAtualizacao)}</p>
                </div>
                <div>
                  <label className="font-medium text-gray-700">Tribunal</label>
                  <p className="text-gray-600">{processo.tribunal}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};