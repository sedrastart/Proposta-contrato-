import { onlyDigits } from "@/lib/validation";

export type EnderecoPorCep = {
  logradouro: string;
  bairro: string;
  cidade: string;
  uf: string;
};

/** Looks up an address by CEP via ViaCEP. Returns null if the CEP doesn't exist. */
export async function buscarEnderecoPorCep(
  cep: string
): Promise<EnderecoPorCep | null> {
  const digits = onlyDigits(cep);
  if (digits.length !== 8) return null;

  const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`, {
    cache: "no-store",
  });
  if (!res.ok) return null;

  const data = await res.json();
  if (data.erro) return null;

  return {
    logradouro: data.logradouro ?? "",
    bairro: data.bairro ?? "",
    cidade: data.localidade ?? "",
    uf: data.uf ?? "",
  };
}
