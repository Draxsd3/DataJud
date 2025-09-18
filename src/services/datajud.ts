import { SearchQuery, SearchResponse, ProcessoJudicial } from '../types';
import { TRIBUNAIS } from '../utils/tribunais';
import { DATAJUD_CONFIG, getDataJudHeaders } from '../config/datajud';

interface SearchResults {
  processos: ProcessoJudicial[];
  totalProcessos: number;
  tribunal: string;
  hasMore: boolean;
  nextSearchAfter?: any[];
}

class DataJudService {
  private cache = new Map<string, { data: SearchResults; timestamp: number }>();
  private readonly CACHE_TTL = DATAJUD_CONFIG.CACHE_TTL;

  private getCacheKey(searchTerm: string, tribunal: string, page: number): string {
    return `${searchTerm}_${tribunal}_${page}`;
  }

  private isValidCache(timestamp: number): boolean {
    return Date.now() - timestamp < this.CACHE_TTL;
  }

  private async makeRequest(tribunal: string, query: SearchQuery): Promise<SearchResponse> {
    const url = `${DATAJUD_CONFIG.BASE_URL}/${tribunal}/_search`;
    
    const response = await fetch('/api/datajud-proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        headers: getDataJudHeaders(),
        body: query,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`DataJud API Error for ${tribunal}:`, {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        url,
        timestamp: new Date().toISOString(),
      });
      
      throw new Error(`Erro na consulta ao tribunal ${tribunal}: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    // Log de sucesso para monitoramento
    console.info(`DataJud API Success for ${tribunal}:`, {
      totalHits: data.hits?.total?.value || 0,
      returnedHits: data.hits?.hits?.length || 0,
      timestamp: new Date().toISOString(),
    });

    return data;
  }

  private buildSearchQuery(searchTerm: string, searchAfter?: any[]): SearchQuery {
    // Estratégia de busca otimizada para CNPJ/CPF
    // Busca nos campos mais relevantes para identificar partes do processo
    return {
      size: DATAJUD_CONFIG.DEFAULT_PAGE_SIZE,
      query: {
        bool: {
          should: [
            // Busca prioritária em nomes de partes
            {
              query_string: {
                query: `*${searchTerm}*`,
                fields: [
                  "partes.nome^3",           // Nome das partes (peso 3)
                  "partes.pessoa.nome^3",   // Nome de pessoa física (peso 3)
                  "partes.documento^2",     // Documento da parte (peso 2)
                  "movimentos.complementos", // Complementos de movimentos
                  "numeroProcesso",         // Número do processo
                  "classe.nome",            // Nome da classe processual
                  "assuntos.nome"           // Nome dos assuntos
                ],
                default_operator: "AND",
                boost: 2
              }
            },
            // Busca exata em nome de partes
            {
              match: {
                "partes.nome": {
                  query: searchTerm,
                  operator: "and",
                  boost: 4
                }
              }
            },
            // Busca exata em nome de pessoa
            {
              match: {
                "partes.pessoa.nome": {
                  query: searchTerm,
                  operator: "and",
                  boost: 4
                }
              }
            },
            // Busca por documento (CNPJ/CPF)
            {
              match: {
                "partes.documento": {
                  query: searchTerm,
                  boost: 5
                }
              }
            }
          ],
          minimum_should_match: 1
        }
      },
      sort: [
        { "dataAjuizamento": { "order": "desc" } },
        { "_score": { "order": "desc" } },
        { "_id": { "order": "asc" } }
      ],
      ...(searchAfter && { search_after: searchAfter }),
      // Incluir campos de highlight para melhor visualização
      highlight: {
        fields: {
          "partes.nome": {},
          "partes.pessoa.nome": {},
          "partes.documento": {}
        },
        pre_tags: ["<mark>"],
        post_tags: ["</mark>"]
      }
    };
  }

  async searchProcessos(
    searchTerm: string, 
    selectedTribunais: string[] = [],
    searchAfter?: any[]
  ): Promise<{ results: SearchResults[]; errors: string[] }> {
    const tribunaisToSearch = selectedTribunais.length > 0 
      ? TRIBUNAIS.filter(t => selectedTribunais.includes(t.alias))
      : TRIBUNAIS;

    console.info('Iniciando busca DataJud:', {
      searchTerm: searchTerm.substring(0, 5) + '***', // Log parcial por segurança
      tribunais: tribunaisToSearch.map(t => t.alias),
      timestamp: new Date().toISOString(),
    });

    const results: SearchResults[] = [];
    const errors: string[] = [];

    const searchPromises = tribunaisToSearch.map(async (tribunal) => {
      try {
        const cacheKey = this.getCacheKey(searchTerm, tribunal.alias, searchAfter ? 1 : 0);
        const cached = this.cache.get(cacheKey);
        
        if (cached && this.isValidCache(cached.timestamp)) {
          console.info(`Cache hit for ${tribunal.alias}`);
          return { success: true, data: cached.data };
        }

        const query = this.buildSearchQuery(searchTerm, searchAfter);
        const response = await this.makeRequest(tribunal.url, query);
        
        const processos = response.hits.hits.map(hit => ({
          ...hit._source,
          tribunal: tribunal.alias,
          // Incluir informações de highlight se disponíveis
          ...(hit.highlight && { highlight: hit.highlight }),
        }));

        const result: SearchResults = {
          processos,
          totalProcessos: response.hits.total.value,
          tribunal: tribunal.nome,
          hasMore: response.hits.hits.length === DATAJUD_CONFIG.DEFAULT_PAGE_SIZE,
          nextSearchAfter: response.hits.hits.length > 0 
            ? response.hits.hits[response.hits.hits.length - 1].sort
            : undefined
        };

        // Cache only successful results
        this.cache.set(cacheKey, { data: result, timestamp: Date.now() });
        
        return { success: true, data: result };
      } catch (error) {
        const errorMessage = `${tribunal.nome}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`;
        console.error(`Erro na busca ${tribunal.alias}:`, error);
        return { success: false, error: errorMessage };
      }
    });

    const responses = await Promise.allSettled(searchPromises);
    
    responses.forEach((response) => {
      if (response.status === 'fulfilled') {
        if (response.value.success) {
          results.push(response.value.data);
        } else {
          errors.push(response.value.error);
        }
      } else {
        errors.push(`Erro de rede: ${response.reason}`);
      }
    });

    console.info('Busca DataJud finalizada:', {
      totalResults: results.reduce((acc, r) => acc + r.processos.length, 0),
      tribunaisComSucesso: results.length,
      erros: errors.length,
      timestamp: new Date().toISOString(),
    });

    return { results, errors };
  }

  async getProcessoDetalhes(numeroProcesso: string, tribunal: string): Promise<ProcessoJudicial | null> {
    try {
      const tribunalInfo = TRIBUNAIS.find(t => t.alias === tribunal);
      if (!tribunalInfo) {
        throw new Error('Tribunal não encontrado');
      }

      const query: SearchQuery = {
        query: {
          match: {
            numeroProcesso: numeroProcesso
          }
        }
      };

      const response = await this.makeRequest(tribunalInfo.url, query);
      
      if (response.hits.hits.length > 0) {
        return {
          ...response.hits.hits[0]._source,
          tribunal: tribunal,
        };
      }
      
      return null;
    } catch (error) {
      console.error('Erro ao buscar detalhes do processo:', error);
      throw error;
    }
  }

  // Método para testar conectividade com a API
  async testApiConnection(): Promise<{ success: boolean; message: string }> {
    try {
      // Testar com uma busca simples no TRF1
      const testQuery: SearchQuery = {
        size: 1,
        query: {
          match_all: {}
        }
      };

      await this.makeRequest('trf1', testQuery);
      
      return {
        success: true,
        message: 'Conexão com a API DataJud estabelecida com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        message: `Falha na conexão com a API DataJud: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      };
    }
  }

  clearCache(): void {
    this.cache.clear();
    console.info('Cache do DataJud limpo');
  }

  getCacheStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys()),
    };
  }
}

export const datajudService = new DataJudService();