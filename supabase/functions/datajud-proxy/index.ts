const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface ProxyRequest {
  url: string;
  headers: Record<string, string>;
  body: any;
}

// Configuração da API Key do DataJud
const DATAJUD_API_KEY = 'cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw==';

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { url, headers, body }: ProxyRequest = await req.json();

    // Log da requisição para monitoramento
    console.log('DataJud Proxy Request:', {
      url: url.replace(/api_publica_\w+/, 'api_publica_***'), // Mascarar tribunal por segurança
      timestamp: new Date().toISOString(),
      bodySize: JSON.stringify(body).length,
    });

    // Garantir que a API Key está sendo usada corretamente
    const requestHeaders = {
      ...headers,
      'Authorization': `APIKey ${DATAJUD_API_KEY}`,
      'Content-Type': 'application/json',
      'User-Agent': 'DataJud-Securitizadora-Proxy/1.0',
      // Remover headers que podem causar problemas
      'Accept-Encoding': 'gzip, deflate',
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: requestHeaders,
      body: JSON.stringify(body),
    });

    const responseText = await response.text();
    
    // Log da resposta
    console.log('DataJud Proxy Response:', {
      status: response.status,
      statusText: response.statusText,
      responseSize: responseText.length,
      timestamp: new Date().toISOString(),
    });

    // Validar se a resposta é um JSON válido
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Erro ao fazer parse da resposta JSON:', parseError);
      return new Response(
        JSON.stringify({ 
          error: 'Resposta inválida da API DataJud', 
          message: 'A API retornou uma resposta que não é um JSON válido',
          status: response.status 
        }),
        {
          status: 502,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Verificar se há erro de autenticação
    if (response.status === 401) {
      console.error('Erro de autenticação na API DataJud - API Key pode estar inválida');
      return new Response(
        JSON.stringify({ 
          error: 'Erro de autenticação', 
          message: 'A API Key do DataJud pode estar inválida ou expirada. Verifique a chave na Wiki do CNJ.',
          status: 401 
        }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    return new Response(responseText, {
      status: response.status,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Erro no proxy DataJud:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Erro interno do proxy', 
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        details: 'Falha na comunicação com a API do DataJud',
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});