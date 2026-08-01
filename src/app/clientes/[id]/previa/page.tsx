import Link from "next/link";
import { notFound } from "next/navigation";
import {
  buscarClienteParaContrato,
  buscarClausulasModelo,
  montarDadosContrato,
} from "@/lib/contrato-dados";
import { PreviaEditor } from "./previa-editor";

export default async function PreviaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const cliente = await buscarClienteParaContrato(id);
  if (!cliente) notFound();

  if (!cliente.regimeTributario) {
    return (
      <AvisoIncompleto clienteId={cliente.id} texto="Selecione o regime tributário antes de gerar a prévia." />
    );
  }
  if (cliente.servicos.length === 0) {
    return (
      <AvisoIncompleto
        clienteId={cliente.id}
        texto="Selecione ao menos um serviço com plano definido antes de gerar a prévia."
      />
    );
  }

  const dados = montarDadosContrato(cliente);
  const clausulas = await buscarClausulasModelo(cliente.regimeTributario.slug);

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10">
      <Link
        href={`/clientes/${cliente.id}`}
        className="text-sm text-neutral-500 hover:underline"
      >
        ← {cliente.razaoSocial}
      </Link>
      <p className="mt-2 text-xs uppercase tracking-wide text-neutral-500">
        Etapa 5 de 5 — Prévia
      </p>
      <h1 className="mt-1 text-2xl font-semibold text-neutral-900">
        Prévia do contrato
      </h1>
      <p className="mt-1 text-sm text-neutral-500">
        Apenas os 6 campos abaixo são editáveis — o restante vem do regime,
        dos serviços e do plano escolhidos.
      </p>

      <PreviaEditor
        clienteId={cliente.id}
        regimeSlug={cliente.regimeTributario.slug}
        dadosIniciais={dados}
        clausulas={clausulas}
      />
    </main>
  );
}

function AvisoIncompleto({ clienteId, texto }: { clienteId: string; texto: string }) {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-10">
      <Link href={`/clientes/${clienteId}`} className="text-sm text-neutral-500 hover:underline">
        ← Voltar
      </Link>
      <div className="mt-6 rounded-lg border border-dashed border-neutral-300 p-6 text-sm text-neutral-600">
        {texto}
      </div>
    </main>
  );
}
