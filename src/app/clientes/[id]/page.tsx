import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatCpfCnpj } from "@/lib/format";
import { BotaoExcluirCliente } from "../botao-excluir-cliente";

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
  const cliente = await prisma.cliente.findUnique({
    where: { id },
    include: { servicos: { select: { planoId: true } } },
  });
  if (!cliente) notFound();

  const regimeDefinido = Boolean(cliente.regimeTributarioId) && cliente.servicos.length > 0;
  const planoDefinido = cliente.servicos.some((cs) => cs.planoId);
  const statusComercial = planoDefinido
    ? "Regime, serviços e plano definidos"
    : regimeDefinido
    ? "Falta definir o plano"
    : "Regime e serviços ainda não definidos";

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

      <div className="grid grid-cols-2 gap-x-6 divide-y divide-line rounded-lg border border-line p-5">
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

      <Link
        href={`/clientes/${cliente.id}/comercial`}
        className="mt-4 flex items-center justify-between rounded-lg border border-line p-5 hover:bg-accent-soft"
      >
        <div>
          <p className="text-sm font-medium text-ink">Configuração comercial</p>
          <p className="mt-0.5 text-xs text-ink-muted">{statusComercial}</p>
        </div>
        <span className="text-sm text-accent">
          {planoDefinido ? "Editar" : "Configurar"} →
        </span>
      </Link>
    </main>
  );
}
