import React from 'react';
import { FileText, Building, Calendar, TrendingUp } from 'lucide-react';

interface ResultsSummaryProps {
  totalProcessos: number;
  tribunaisConsultados: number;
  tribunaisComResultados: number;
  tribunaisResultados: Array<{ nome: string; total: number }>;
}

export const ResultsSummary: React.FC<ResultsSummaryProps> = ({
  totalProcessos,
  tribunaisConsultados,
  tribunaisComResultados,
  tribunaisResultados
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
        Resumo dos Resultados
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <FileText className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-blue-900">{totalProcessos}</div>
          <div className="text-sm text-blue-700">Processos Encontrados</div>
        </div>
        
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <Building className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-green-900">{tribunaisConsultados}</div>
          <div className="text-sm text-green-700">Tribunais Consultados</div>
        </div>
        
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <Calendar className="w-8 h-8 text-purple-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-purple-900">{tribunaisComResultados}</div>
          <div className="text-sm text-purple-700">Com Resultados</div>
        </div>
      </div>

      {tribunaisResultados.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-700 mb-3">Distribuição por Tribunal:</h4>
          <div className="space-y-2">
            {tribunaisResultados.map((tribunal, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="text-gray-900">{tribunal.nome}</span>
                <span className="font-semibold text-gray-700 bg-white px-2 py-1 rounded text-sm">
                  {tribunal.total} processo{tribunal.total !== 1 ? 's' : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};