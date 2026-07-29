import { z } from "zod";

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

export function isValidCPF(value: string): boolean {
  const cpf = onlyDigits(value);
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += Number(cpf[i]) * (10 - i);
  let checkDigit1 = 11 - (sum % 11);
  if (checkDigit1 >= 10) checkDigit1 = 0;
  if (checkDigit1 !== Number(cpf[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += Number(cpf[i]) * (11 - i);
  let checkDigit2 = 11 - (sum % 11);
  if (checkDigit2 >= 10) checkDigit2 = 0;
  if (checkDigit2 !== Number(cpf[10])) return false;

  return true;
}

export function isValidCNPJ(value: string): boolean {
  const cnpj = onlyDigits(value);
  if (cnpj.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(cnpj)) return false;

  const calcCheckDigit = (base: string) => {
    let pos = base.length - 7;
    let sum = 0;
    for (let i = base.length; i >= 1; i--) {
      sum += Number(base[base.length - i]) * pos--;
      if (pos < 2) pos = 9;
    }
    const result = sum % 11;
    return result < 2 ? 0 : 11 - result;
  };

  const digit1 = calcCheckDigit(cnpj.substring(0, 12));
  if (digit1 !== Number(cnpj[12])) return false;

  const digit2 = calcCheckDigit(cnpj.substring(0, 13));
  if (digit2 !== Number(cnpj[13])) return false;

  return true;
}

export function isValidCpfCnpj(value: string): boolean {
  const digits = onlyDigits(value);
  if (digits.length === 11) return isValidCPF(digits);
  if (digits.length === 14) return isValidCNPJ(digits);
  return false;
}

export const UF_LIST = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO",
  "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI",
  "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
] as const;

export const clienteSchema = z.object({
  tipoPessoa: z.enum(["PF", "PJ"]),
  razaoSocial: z.string().trim().min(3, "Informe pelo menos 3 caracteres"),
  nomeFantasia: z.string().trim().optional().or(z.literal("")),
  cpfCnpj: z
    .string()
    .trim()
    .refine(isValidCpfCnpj, "CPF/CNPJ inválido"),
  inscricaoEstadual: z.string().trim().optional().or(z.literal("")),
  enderecoLogradouro: z.string().trim().min(2, "Informe o logradouro"),
  enderecoNumero: z.string().trim().min(1, "Informe o número"),
  enderecoComplemento: z.string().trim().optional().or(z.literal("")),
  enderecoBairro: z.string().trim().min(1, "Informe o bairro"),
  enderecoCidade: z.string().trim().min(1, "Informe a cidade"),
  enderecoUf: z.enum(UF_LIST),
  enderecoCep: z
    .string()
    .trim()
    .refine((v) => onlyDigits(v).length === 8, "CEP deve ter 8 dígitos"),
  telefone: z.string().trim().min(8, "Informe um telefone válido"),
  email: z.string().trim().email("E-mail inválido"),
  responsavelNome: z.string().trim().optional().or(z.literal("")),
  responsavelCpf: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine((v) => !v || isValidCPF(v), "CPF do responsável inválido"),
});

export type ClienteInput = z.infer<typeof clienteSchema>;
