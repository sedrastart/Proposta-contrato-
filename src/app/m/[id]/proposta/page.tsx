import Link from "next/link";
import { notFound } from "next/navigation";
import {
  buscarClienteParaProposta,
  buscarModeloProposta,
  montarDadosProposta,
} from "@/lib/contrato-dados";
import { renderPropostaDraft } from "@/lib/templates";
import { TituloEtapa } from "../../mobile-ui";
import { PropostaMobileStep } from "./proposta-mobile-step";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export default async function PropostaMobilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cliente = await buscarClienteParaProposta(id);
  if (!cliente) notFound();

  if (!cliente.regimeTributario || cliente.servicos.length === 0) {
    return (
      <div>
        <Link href="/m" className="text-sm text-ink-muted hover:underline">
          ← Início
        </Link>
        <div className="mt-6 rounded-lg border border-dashed border-line p-6 text-sm text-ink-muted">
          Defina regime, serviços e plano antes de gerar a proposta.
          <br />
          <Link href={`/m/${cliente.id}/comercial`} className="text-accent hover:underline">
            Ir para regime e serviços →
          </Link>
        </div>
      </div>
    );
  }

  const dados = montarDadosProposta(cliente);
  const modelo = await buscarModeloProposta(cliente.regimeTributario.slug);
  const textoInicial = modelo ? renderPropostaDraft(modelo.corpo, dados) : "";

  return (
    <div>
      <Link href="/m" className="text-sm text-ink-muted hover:underline">
        ← {cliente.razaoSocial}
      </Link>
      <TituloEtapa
        passo={3}
        total={4}
        titulo="Proposta comercial"
        descricao="Rascunho pronto — edite se quiser e gere o PDF."
      />
      <PropostaMobileStep clienteId={cliente.id} textoInicial={textoInicial} />
    </div>
  );
}
