import Link from "next/link";
import { notFound } from "next/navigation";
import {
  buscarClienteParaProposta,
  buscarModeloProposta,
  montarDadosProposta,
} from "@/lib/contrato-dados";
import { renderPropostaDraft } from "@/lib/templates";
import { NovaPropostaEditor } from "./nova-proposta-editor";

export const dynamic = "force-dynamic";

export default async function NovaPropostaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const cliente = await buscarClienteParaProposta(id);
  if (!cliente) notFound();

  if (!cliente.regimeTributario) {
    return (
      <AvisoIncompleto
        clienteId={cliente.id}
        texto="Selecione o regime tributário antes de criar uma proposta."
      />
    );
  }
  if (cliente.servicos.length === 0) {
    return (
      <AvisoIncompleto
        clienteId={cliente.id}
        texto="Selecione ao menos um serviço antes de criar uma proposta."
      />
    );
  }

  const dados = montarDadosProposta(cliente);
  const modelo = await buscarModeloProposta(cliente.regimeTributario.slug);
  const textoInicial = modelo ? renderPropostaDraft(modelo.corpo, dados) : "";

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-10">
      <Link
        href={`/clientes/${cliente.id}`}
        className="text-sm text-ink-muted hover:underline"
      >
        ← {cliente.razaoSocial}
      </Link>
      <p className="mt-2 text-xs uppercase tracking-wide text-ink-muted">
        Nova proposta
      </p>
      <h1 className="mt-1 text-2xl font-semibold text-ink">
        Proposta comercial
      </h1>
      <p className="mt-1 text-sm text-ink-muted">
        Rascunho pré-preenchido com os dados do cliente — edite livremente
        antes de gerar o PDF. Planos ainda não definidos aparecem como
        &quot;a definir&quot; e podem ser ajustados manualmente no texto.
      </p>
      {!modelo && (
        <div className="mt-4 rounded-md border border-dashed border-line p-4 text-sm text-ink-muted">
          Nenhum modelo de proposta cadastrado para o regime{" "}
          <strong>{cliente.regimeTributario.nome}</strong> — edite livremente
          abaixo, ou cadastre um modelo padrão em Área administrativa →
          Propostas.
        </div>
      )}

      <NovaPropostaEditor clienteId={cliente.id} textoInicial={textoInicial} />
    </main>
  );
}

function AvisoIncompleto({ clienteId, texto }: { clienteId: string; texto: string }) {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-10">
      <Link href={`/clientes/${clienteId}`} className="text-sm text-ink-muted hover:underline">
        ← Voltar
      </Link>
      <div className="mt-6 rounded-lg border border-dashed border-line p-6 text-sm text-ink-muted">
        {texto}
      </div>
    </main>
  );
}
