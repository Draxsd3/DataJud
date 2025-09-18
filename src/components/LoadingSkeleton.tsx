import React from 'react';

export const LoadingSkeleton: React.FC = () => {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, index) => (
        <div key={index} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <div className="h-6 bg-gray-200 rounded w-64"></div>
                <div className="h-5 bg-gray-200 rounded-full w-12"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-48 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-56"></div>
            </div>
            <div className="h-9 w-9 bg-gray-200 rounded-lg"></div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <div className="h-6 bg-gray-200 rounded w-20"></div>
            <div className="h-6 bg-gray-200 rounded w-24"></div>
            <div className="h-6 bg-gray-200 rounded w-16"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const SearchingSkeleton: React.FC<{ tribunais: string[] }> = ({ tribunais }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Buscando processos...</h3>
        <p className="text-gray-600 mb-4">
          Consultando {tribunais.length === 0 ? 'todos os tribunais' : `${tribunais.length} tribunal(is)`}
        </p>
        <div className="space-y-2">
          {(tribunais.length === 0 ? ['TRF1', 'TRF2', 'TRF3', 'STJ', 'STF'] : tribunais).map((tribunal, index) => (
            <div key={tribunal} className="flex items-center justify-center space-x-2 text-sm">
              <div className={`w-2 h-2 rounded-full ${index === 0 ? 'bg-blue-500 animate-pulse' : 'bg-gray-300'}`}></div>
              <span className={index === 0 ? 'text-blue-600' : 'text-gray-500'}>
                {tribunal.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};