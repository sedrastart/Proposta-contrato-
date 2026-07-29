import { onlyDigits } from "@/lib/validation";

export type DadosCnpj = {
  razaoSocial: string;
  nomeFantasia: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
  telefone?: string;
  email?: string;
  situacaoCadastral?: string;
};

/** Consulta dados públicos de uma empresa por CNPJ via BrasilAPI (fonte: Receita Federal). */
export async function buscarDadosPorCnpj(cnpj: string): Promise<DadosCnpj | null> {
  const digits = onlyDigits(cnpj);
  if (digits.length !== 14) return null;

  const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${digits}`, {
    cache: "no-store",
    headers: {
      // Sem um User-Agent de navegador, o CDN da BrasilAPI responde 403.
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
      Accept: "application/json",
    },
  });
  if (!res.ok) return null;

  const data = await res.json();

  return {
    razaoSocial: data.razao_social ?? "",
    nomeFantasia: data.nome_fantasia ?? "",
    logradouro: data.logradouro ?? "",
    numero: data.numero ?? "",
    complemento: data.complemento ?? "",
    bairro: data.bairro ?? "",
    cidade: data.municipio ?? "",
    uf: data.uf ?? "",
    cep: data.cep ?? "",
    telefone: data.ddd_telefone_1 || undefined,
    email: data.email || undefined,
    situacaoCadastral: data.descricao_situacao_cadastral || undefined,
  };
}
