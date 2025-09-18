// Configuração centralizada da API DataJud
export const DATAJUD_CONFIG = {
  // Chave API atual fornecida pelo DPJ/CNJ
  // IMPORTANTE: Esta chave pode ser alterada pelo CNJ a qualquer momento
  // Para atualizações, consulte: https://wiki-publica.cnj.jus.br/
  API_KEY: 'cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw==',
  
  BASE_URL: 'https://api-publica.datajud.cnj.jus.br',
  
  // Headers padrão para todas as requisições
  DEFAULT_HEADERS: {
    'Authorization': 'APIKey cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw==',
    'Content-Type': 'application/json',
    'User-Agent': 'DataJud-Securitizadora/1.0',
  },
  
  // Configurações de timeout e retry
  TIMEOUT: 30000, // 30 segundos
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 segundo
  
  // Configurações de paginação
  DEFAULT_PAGE_SIZE: 50,
  MAX_PAGE_SIZE: 100,
  
  // Configurações de cache
  CACHE_TTL: 5 * 60 * 1000, // 5 minutos
} as const;

// Função para validar se a API Key está no formato correto
export const validateApiKey = (apiKey: string): boolean => {
  // A chave deve ser uma string base64 válida
  try {
    return btoa(atob(apiKey)) === apiKey && apiKey.length > 20;
  } catch {
    return false;
  }
};

// Função para obter headers com a API Key atual
export const getDataJudHeaders = (customHeaders?: Record<string, string>) => {
  return {
    ...DATAJUD_CONFIG.DEFAULT_HEADERS,
    ...customHeaders,
  };
};

// Logs de configuração para debugging
console.info('DataJud API Configuration loaded:', {
  baseUrl: DATAJUD_CONFIG.BASE_URL,
  apiKeyValid: validateApiKey(DATAJUD_CONFIG.API_KEY),
  timeout: DATAJUD_CONFIG.TIMEOUT,
});