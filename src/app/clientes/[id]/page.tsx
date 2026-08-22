import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatCpfCnpj } from "@/lib/format";
import { BotaoExcluirCliente } from "../botao-excluir-cliente";
import { RegimeSelector } from "./regime-selector";
import { ServicoSelector } from "./servico-selector";
import { PlanoSelector } from "./plano-selector";
import { Stepper, type PassoStepper } from "./stepper";

function Row({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="py-2">
      <dt className="text-xs uppercase tracking-wide text-ink-muted">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm text-ink">{value}</dd>
    </div>
  );
}

export default async function ClienteDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [cliente, regimes] = await Promise.all([
    prisma.cliente.findUnique({
      where: { id },
      include: { servicos: { include: { servico: true } } },
    }),
    prisma.regimeTributario.findMany({
      where: { ativo: true },
      orderBy: { ordem: "asc" },
    }),
  ]);
  if (!cliente) notFound();

  const passosBrutos = [
    { titulo: "Cadastro", subtitulo: "Dados completos", feito: true },
    {
      titulo: "Regime e serviços",
      subtitulo: cliente.regimeTributarioId
        ? `${cliente.servicos.length} serviço${cliente.servicos.length === 1 ? "" : "s"}`
        : "Não definido",
      feito: Boolean(cliente.regimeTributarioId) && cliente.servicos.length > 0,
    },
    {
      titulo: "Plano",
      subtitulo: cliente.servicos.some((cs) => cs.planoId) ? "Definido" : "Não definido",
      feito: cliente.servicos.some((cs) => cs.planoId),
    },
  ];
  const primeiroPendente = passosBrutos.findIndex((p) => !p.feito);
  const passos: PassoStepper[] = passosBrutos.map((p, i) => ({
    titulo: p.titulo,
    subtitulo: p.subtitulo,
    estado: p.feito ? "concluida" : i === primeiroPendente ? "atual" : "pendente",
  }));

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
      <Link href="/clientes" className="text-sm text-ink-muted hover:underline">
        ← Cadastro de Clientes
      </Link>

      <div className="mt-2 mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">
            {cliente.razaoSocial}
          </h1>
          {cliente.nomeFantasia && (
            <p className="mt-1 text-sm text-ink-muted">
              {cliente.nomeFantasia}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="rounded-full border border-line px-3 py-1 text-xs font-medium text-ink-muted">
            {cliente.tipoPessoa === "PJ" ? "Pessoa Jurídica" : "Pessoa Física"}
          </span>
          <BotaoExcluirCliente clienteId={cliente.id} nomeCliente={cliente.razaoSocial} />
        </div>
      </div>

      <Stepper passos={passos} />

      <div className="mt-6 grid grid-cols-2 gap-x-6 divide-y divide-line rounded-lg border border-line p-5">
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

      <div className="mt-8 rounded-lg border border-line p-5">
        <RegimeSelector
          clienteId={cliente.id}
          regimes={regimes}
          regimeAtualId={cliente.regimeTributarioId}
        />
      </div>

      {cliente.regimeTributarioId && (
        <div className="mt-4 rounded-lg border border-line p-5">
          <ServicoSelector
            clienteId={cliente.id}
            servicosDisponiveis={servicosDisponiveis}
            servicosSelecionadosIds={servicoIdsSelecionados}
          />
        </div>
      )}

      {cliente.servicos.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-xs uppercase tracking-wide text-ink-muted">
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
    </main>
  );
}
