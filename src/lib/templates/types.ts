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

export type DadosContrato = {
  contratanteNome: string;
  contratanteCpfCnpj: string;
  contratanteEndereco: string;
  contratanteCidadeUf: string;
  contratanteCep: string;
  responsavelNome?: string;
  responsavelCpf?: string;
  valor: string;
  vigenciaMeses: number;
  multaDescricao: string;
  dataEmissaoExtenso: string;
  cidadeEmissao: string;
  servicosSelecionados: string[];
  limitesUso: LimiteUsoTexto[];
};
