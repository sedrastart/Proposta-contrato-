import { prisma } from "@/lib/prisma";

/** Incrementa e retorna o próximo número sequencial para a chave dada (ex.: "contrato"). */
export async function proximoNumeroSequencial(chave: string): Promise<number> {
  const contador = await prisma.contador.upsert({
    where: { chave },
    update: { valor: { increment: 1 } },
    create: { chave, valor: 1 },
  });
  return contador.valor;
}
