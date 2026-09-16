export type FaixaExcedenteTexto = {
  percentualAte: number;
  valorAdicional: string;
};

export type LimiteUsoTexto = {
  unidade: string;
  quantidade: number;
  tipoCobranca: string;
  valorPorUnidade?: string;
  faixas: FaixaExcedenteTexto[];
};

export type EscopoServicoTexto = {
  nome: string;
  descricao: string | null;
};

export type DadosContrato = {
  contratanteNome: string;
  contratanteTipoPessoa: string; // "PF" | "PJ" — define a concordância de gênero no cabeçalho
  contratanteCpfCnpj: string;
  contratanteEndereco: string;
  contratanteCidadeUf: string;
  contratanteCep: string;
  responsavelNome?: string;
  responsavelCpf?: string;
  valor: string;
  vigenciaMeses: number;
  multaDescricao: string;
  condicaoPagamento: string;
  dataEmissaoExtenso: string;
  cidadeEmissao: string;
  servicosSelecionados: string[];
  limitesUso: LimiteUsoTexto[];
  escopoServicos: EscopoServicoTexto[];
};
