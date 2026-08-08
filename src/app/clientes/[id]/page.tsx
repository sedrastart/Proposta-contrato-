import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatCpfCnpj } from "@/lib/format";
import { BotaoExcluirCliente } from "../botao-excluir-cliente";
import { RegimeSelector } from "./regime-selector";
import { ServicoSelector } from "./servico-selector";
import { PlanoSelector } from "./plano-selector";
import { STATUS_PROPOSTA_LABEL, type StatusProposta } from "@/lib/proposta-status";
import { STATUS_CONTRATO_LABEL, type StatusContrato } from "@/lib/contrato-status";

function Row({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="py-2">
      <dt className="text-xs uppercase tracking-wide text-neutral-500">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm text-neutral-900">{value}</dd>
    </div>
  );
}

export default async function ClienteDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [cliente, regimes, contratos, propostas] = await Promise.all([
    prisma.cliente.findUnique({
      where: { id },
      include: { servicos: { include: { servico: true } } },
    }),
    prisma.regimeTributario.findMany({
      where: { ativo: true },
      orderBy: { ordem: "asc" },
    }),
    prisma.contrato.findMany({
      where: { clienteId: id },
      orderBy: { numeroSequencial: "desc" },
    }),
    prisma.proposta.findMany({
      where: { clienteId: id },
      orderBy: { numeroSequencial: "desc" },
    }),
  ]);
  if (!cliente) notFound();

  const servicosDisponiveis = cliente.regimeTributarioId
    ? await prisma.servico.findMany({
        where: {
          ativo: true,
          regimes: { some: { regimeTributarioId: cliente.regimeTributarioId } },
        },
        orderBy: { ordem: "asc" },
      })
    : [];

  const servicoIdsSelecionados = cliente.servicos.map((s) => s.servicoId);
  const planosPorServico = servicoIdsSelecionados.length
    ? await prisma.plano.findMany({
        where: {
          ativo: true,
          servicoId: { in: servicoIdsSelecionados },
          OR: [
            { regimeTributarioId: null },
            { regimeTributarioId: cliente.regimeTributarioId },
          ],
        },
        orderBy: { ordem: "asc" },
        include: { limites: { include: { faixas: { orderBy: { ordem: "asc" } } } } },
      })
    : [];

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-10">
      <Link href="/clientes" className="text-sm text-neutral-500 hover:underline">
        ← Clientes
      </Link>

      <div className="mt-2 mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">
            {cliente.razaoSocial}
          </h1>
          {cliente.nomeFantasia && (
            <p className="mt-1 text-sm text-neutral-500">
              {cliente.nomeFantasia}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="rounded-full border border-neutral-300 px-3 py-1 text-xs font-medium text-neutral-600">
            {cliente.tipoPessoa === "PJ" ? "Pessoa Jurídica" : "Pessoa Física"}
          </span>
          <BotaoExcluirCliente clienteId={cliente.id} nomeCliente={cliente.razaoSocial} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-6 divide-y divide-neutral-100 rounded-lg border border-neutral-200 p-5">
        <Row
          label={cliente.tipoPessoa === "PJ" ? "CNPJ" : "CPF"}
          value={formatCpfCnpj(cliente.cpfCnpj)}
        />
        <Row label="Inscrição Estadual" value={cliente.inscricaoEstadual} />
        <Row
          label="Endereço"
          value={`${cliente.enderecoLogradouro}, ${cliente.enderecoNumero}${
            cliente.enderecoComplemento ? " - " + cliente.enderecoComplemento : ""
          }`}
        />
        <Row
          label="Bairro / Cidade"
          value={`${cliente.enderecoBairro} — ${cliente.enderecoCidade}/${cliente.enderecoUf}`}
        />
        <Row label="CEP" value={cliente.enderecoCep} />
        <Row label="Telefone" value={cliente.telefone} />
        <Row label="E-mail" value={cliente.email} />
        <Row label="Responsável" value={cliente.responsavelNome} />
        <Row
          label="CPF do responsável"
          value={cliente.responsavelCpf ? formatCpfCnpj(cliente.responsavelCpf) : null}
        />
      </div>

      <div className="mt-8 rounded-lg border border-neutral-200 p-5">
        <RegimeSelector
          clienteId={cliente.id}
          regimes={regimes}
          regimeAtualId={cliente.regimeTributarioId}
        />
      </div>

      {cliente.regimeTributarioId && (
        <div className="mt-4 rounded-lg border border-neutral-200 p-5">
          <ServicoSelector
            clienteId={cliente.id}
            servicosDisponiveis={servicosDisponiveis}
            servicosSelecionadosIds={servicoIdsSelecionados}
          />
        </div>
      )}

      {cliente.servicos.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-xs uppercase tracking-wide text-neutral-500">
            Etapa 4 — Planos
          </p>
          <div className="space-y-3">
            {cliente.servicos.map((cs) => (
              <PlanoSelector
                key={cs.servicoId}
                clienteId={cliente.id}
                servicoId={cs.servicoId}
                servicoNome={cs.servico.nome}
                planos={planosPorServico.filter((p) => p.servicoId === cs.servicoId)}
                planoAtualId={cs.planoId}
              />
            ))}
          </div>
        </div>
      )}

      {(cliente.regimeTributarioId && cliente.servicos.length > 0) || cliente.servicos.some((cs) => cs.planoId) ? (
        <div className="mt-6 flex justify-end gap-3">
          {cliente.regimeTributarioId && cliente.servicos.length > 0 && (
            <Link
              href={`/clientes/${cliente.id}/propostas/nova`}
              className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
              title="Cria uma proposta comercial — não exige plano definido, pode ser enviada antes de fechar os valores"
            >
              + Nova proposta
            </Link>
          )}
          {cliente.servicos.some((cs) => cs.planoId) && (
            <Link
              href={`/clientes/${cliente.id}/previa`}
              className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
            >
              Ver prévia do contrato →
            </Link>
          )}
        </div>
      ) : null}

      {propostas.length > 0 && (
        <div className="mt-10">
          <p className="mb-2 text-xs uppercase tracking-wide text-neutral-500">
            Histórico de propostas comerciais
          </p>
          <div className="overflow-hidden rounded-lg border border-neutral-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500">
                <tr>
                  <th className="px-4 py-2 font-medium">Número</th>
                  <th className="px-4 py-2 font-medium">Emitida em</th>
                  <th className="px-4 py-2 font-medium">Valor</th>
                  <th className="px-4 py-2 font-medium">Status</th>
                  <th className="px-4 py-2 font-medium">Download</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {propostas.map((p) => (
                  <tr key={p.id}>
                    <td className="px-4 py-2 font-mono text-neutral-900">
                      <Link
                        href={`/clientes/${cliente.id}/propostas/${p.id}`}
                        className="hover:underline"
                      >
                        {String(p.numeroSequencial).padStart(6, "0")}
                      </Link>
                    </td>
                    <td className="px-4 py-2 text-neutral-600">
                      {new Intl.DateTimeFormat("pt-BR").format(p.dataEmissao)}
                    </td>
                    <td className="px-4 py-2 text-neutral-600">{p.valorFinal}</td>
                    <td className="px-4 py-2 text-neutral-600">
                      {STATUS_PROPOSTA_LABEL[p.status as StatusProposta] ?? p.status}
                    </td>
                    <td className="px-4 py-2">
                      <a
                        href={`/api/propostas/${p.id}`}
                        className="text-neutral-700 hover:underline"
                      >
                        PDF
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {contratos.length > 0 && (
        <div className="mt-10">
          <p className="mb-2 text-xs uppercase tracking-wide text-neutral-500">
            Histórico de documentos emitidos
          </p>
          <div className="overflow-hidden rounded-lg border border-neutral-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500">
                <tr>
                  <th className="px-4 py-2 font-medium">Número</th>
                  <th className="px-4 py-2 font-medium">Emitido em</th>
                  <th className="px-4 py-2 font-medium">Valor</th>
                  <th className="px-4 py-2 font-medium">Status</th>
                  <th className="px-4 py-2 font-medium">Downloads</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {contratos.map((c) => (
                  <tr key={c.id}>
                    <td className="px-4 py-2 font-mono text-neutral-900">
                      <Link
                        href={`/clientes/${cliente.id}/contratos/${c.id}`}
                        className="hover:underline"
                      >
                        {String(c.numeroSequencial).padStart(6, "0")}
                      </Link>
                    </td>
                    <td className="px-4 py-2 text-neutral-600">
                      {new Intl.DateTimeFormat("pt-BR").format(c.dataEmissao)}
                    </td>
                    <td className="px-4 py-2 text-neutral-600">{c.valorFinal}</td>
                    <td className="px-4 py-2 text-neutral-600">
                      {STATUS_CONTRATO_LABEL[c.status as StatusContrato] ?? c.status}
                    </td>
                    <td className="px-4 py-2">
                      <a
                        href={`/api/contratos/${c.id}/pdf`}
                        className="text-neutral-700 hover:underline"
                      >
                        PDF
                      </a>
                      <span className="mx-1.5 text-neutral-300">·</span>
                      <a
                        href={`/api/contratos/${c.id}/docx`}
                        className="text-neutral-700 hover:underline"
                      >
                        DOCX
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  );
}
