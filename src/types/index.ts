export interface ProcessoJudicial {
  numeroProcesso: string;
  classe?: {
    codigo: number;
    nome: string;
  };
  sistema?: {
    codigo: number;
    nome: string;
  };
  formato?: {
    codigo: number;
    nome: string;
  };
  tribunal: string;
  dataHoraUltimaAtualizacao: string;
  grau: string;
  dataAjuizamento: string;
  movimentos: Movimento[];
  orgaoJulgador?: {
    codigo: number;
    nome: string;
    codigoMunicipioIBGE: string;
  };
  assuntos: Assunto[];
  partes?: Parte[];
}

export interface Movimento {
  codigo: number;
  nome: string;
  data: string;
  complementos?: string[];
}

export interface Assunto {
  codigo: number;
  nome: string;
}

export interface Parte {
  nome: string;
  tipo: string;
  documento?: string;
}

export interface SearchQuery {
  query: any;
  size?: number;
  search_after?: any[];
  sort?: any[];
}

export interface SearchResponse {
  hits: {
    total: {
      value: number;
      relation: string;
    };
    hits: Array<{
      _source: ProcessoJudicial;
      sort?: any[];
    }>;
  };
}

export interface TribunalInfo {
  alias: string;
  nome: string;
  url: string;
}