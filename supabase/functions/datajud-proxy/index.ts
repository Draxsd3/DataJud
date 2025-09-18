// DataJud Proxy Edge Function
// Proxy para comunicação segura com a API Pública do DataJud/CNJ
// Versão: 2.0

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
};

// Interfaces para tipagem TypeScript
interface ProxyRequest {
  url: string;
  headers?: Record<string, string>;
  body: SearchQuery;
  method?: string;
}

interface SearchQuery {
  query: any;
  size?: number;
  search_after?: any[];
  sort?: any[];
  highlight?: any;
}

interface ErrorResponse {
  error: string;
  message: string;
  status?: number;
  timestamp: string;
  details?: string;
}

// Configuração da API DataJud
const DATAJUD_CONFIG = {
  API_KEY: 'cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw==',
  BASE_URL: 'https://api-publica.datajud.cnj.jus.br',
  TIMEOUT: 30000, // 30 segundos
  USER_AGENT: 'DataJud-Securitizadora-Proxy/2.0',
} as const;

// Função para validar a estrutura da requisição
function validateProxyRequest(data: any): data is ProxyRequest {
  if (!data || typeof data !== 'object') {
    return false;
  }

  // Verificar se a URL está presente e é válida
  if (!data.url || typeof data.url !== 'string') {
    return false;
  }

  // Verificar se a URL é do domínio DataJud
  try {
    const url = new URL(data.url);
    if (url.hostname !== 'api-publica.datajud.cnj.jus.br') {
      return false;
    }
  } catch {
    return false;
  }

  // Verificar se o body está presente
  if (!data.body || typeof data.body !== 'object') {
    return false;
  }

  return true;
}

// Função para sanitizar URL para logs (mascarar tribunal específico)
function sanitizeUrl(url: string): string {
  return url.replace(/\/([a-z]+\d*)\//, '/****/');
}

// Função para criar resposta de erro padronizada
function createErrorResponse(
  error: string, 
  message: string, 
  status = 500, 
  details?: string
): Response {
  const errorResponse: ErrorResponse = {
    error,
    message,
    status,
    timestamp: new Date().toISOString(),
    ...(details && { details }),
  };

  console.error('DataJud Proxy Error:', errorResponse);

  return new Response(JSON.stringify(errorResponse), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

// Função principal da Edge Function
Deno.serve(async (req: Request) => {
  // Tratar requisições OPTIONS (CORS preflight)
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  // Verificar método HTTP
  if (req.method !== "POST") {
    return createErrorResponse(
      'Método não permitido',
      'Esta Edge Function aceita apenas requisições POST',
      405
    );
  }

  try {
    // Parse da requisição JSON
    let requestData: any;
    try {
      requestData = await req.json();
    } catch (parseError) {
      return createErrorResponse(
        'JSON inválido',
        'O corpo da requisição deve ser um JSON válido',
        400,
        parseError instanceof Error ? parseError.message : 'Erro de parsing'
      );
    }

    // Validar estrutura da requisição
    if (!validateProxyRequest(requestData)) {
      return createErrorResponse(
        'Requisição inválida',
        'A requisição deve conter: url (string válida do DataJud) e body (objeto de consulta)',
        400
      );
    }

    const { url, body, method = 'POST' }: ProxyRequest = requestData;

    // Log da requisição (com URL sanitizada)
    console.info('DataJud Proxy Request:', {
      url: sanitizeUrl(url),
      method,
      bodySize: JSON.stringify(body).length,
      hasQuery: !!body.query,
      querySize: body.size || 'default',
      timestamp: new Date().toISOString(),
    });

    // Construir headers da requisição para a API DataJud
    // IMPORTANTE: A API Key é definida aqui, não vem do cliente
    const requestHeaders: Record<string, string> = {
      'Authorization': `APIKey ${DATAJUD_CONFIG.API_KEY}`,
      'Content-Type': 'application/json',
      'User-Agent': DATAJUD_CONFIG.USER_AGENT,
      'Accept': 'application/json',
      'Accept-Encoding': 'gzip, deflate',
      'Cache-Control': 'no-cache',
    };

    // Fazer a requisição para a API DataJud
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), DATAJUD_CONFIG.TIMEOUT);

    let response: Response;
    try {
      response = await fetch(url, {
        method,
        headers: requestHeaders,
        body: JSON.stringify(body),
        signal: controller.signal,
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        return createErrorResponse(
          'Timeout na requisição',
          `A API DataJud não respondeu dentro de ${DATAJUD_CONFIG.TIMEOUT / 1000} segundos`,
          504
        );
      }
      
      return createErrorResponse(
        'Erro de conexão',
        'Falha na comunicação com a API DataJud',
        502,
        fetchError instanceof Error ? fetchError.message : 'Erro de rede'
      );
    }

    clearTimeout(timeoutId);

    // Ler resposta da API
    const responseText = await response.text();
    
    // Log da resposta
    console.info('DataJud API Response:', {
      status: response.status,
      statusText: response.statusText,
      responseSize: responseText.length,
      contentType: response.headers.get('content-type'),
      timestamp: new Date().toISOString(),
    });

    // Verificar se houve erro HTTP
    if (!response.ok) {
      // Log detalhado para erros
      console.error('DataJud API Error Details:', {
        status: response.status,
        statusText: response.statusText,
        url: sanitizeUrl(url),
        responseBody: responseText.substring(0, 500), // Primeiros 500 chars
        timestamp: new Date().toISOString(),
      });

      // Tratar erros específicos
      if (response.status === 401) {
        return createErrorResponse(
          'Erro de autenticação',
          'A API Key do DataJud pode estar inválida ou expirada. Verifique a chave na Wiki do CNJ.',
          401,
          'Consulte: https://wiki-publica.cnj.jus.br/'
        );
      }

      if (response.status === 403) {
        return createErrorResponse(
          'Acesso negado',
          'Sem permissão para acessar este recurso da API DataJud',
          403
        );
      }

      if (response.status === 404) {
        return createErrorResponse(
          'Recurso não encontrado',
          'O endpoint da API DataJud não foi encontrado. Verifique a URL do tribunal.',
          404
        );
      }

      if (response.status >= 500) {
        return createErrorResponse(
          'Erro interno da API DataJud',
          'A API DataJud está temporariamente indisponível',
          502,
          `Status: ${response.status} - ${response.statusText}`
        );
      }

      // Outros erros
      return createErrorResponse(
        'Erro na API DataJud',
        `A API DataJud retornou erro ${response.status}`,
        response.status,
        responseText.substring(0, 200)
      );
    }

    // Validar se a resposta é JSON válido
    let responseData: any;
    try {
      responseData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Erro ao fazer parse da resposta JSON da API DataJud:', parseError);
      return createErrorResponse(
        'Resposta inválida da API DataJud',
        'A API retornou uma resposta que não é um JSON válido',
        502,
        `Resposta recebida: ${responseText.substring(0, 100)}...`
      );
    }

    // Verificar estrutura básica da resposta do ElasticSearch
    if (!responseData.hits) {
      console.warn('Resposta da API DataJud não contém estrutura de hits do ElasticSearch');
    }

    // Log de sucesso
    console.info('DataJud Proxy Success:', {
      url: sanitizeUrl(url),
      totalHits: responseData.hits?.total?.value || 0,
      returnedHits: responseData.hits?.hits?.length || 0,
      took: responseData.took,
      timestamp: new Date().toISOString(),
    });

    // Retornar resposta bem-sucedida
    return new Response(responseText, {
      status: response.status,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Cache-Control': 'private, max-age=300', // Cache por 5 minutos
      },
    });

  } catch (error) {
    // Capturar qualquer erro não tratado
    console.error('Erro crítico na Edge Function:', error);
    
    return createErrorResponse(
      'Erro interno do proxy',
      'Ocorreu um erro interno na Edge Function',
      500,
      error instanceof Error ? error.message : 'Erro desconhecido'
    );
  }
});