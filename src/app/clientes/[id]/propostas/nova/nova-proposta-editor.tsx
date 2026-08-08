"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { renderPropostaDraft, type DadosContrato } from "@/lib/templates";
import { criarPropostaAction } from "../actions";

export function NovaPropostaEditor({
  clienteId,
  regimeSlug,
  dadosIniciais,
}: {
  clienteId: string;
  regimeSlug: string;
  dadosIniciais: DadosContrato;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [erro, setErro] = useState<string | null>(null);
  const [propostaTexto, setPropostaTexto] = useState(() =>
    renderPropostaDraft(regimeSlug, dadosIniciais)
  );

  function recarregarRascunho() {
    setPropostaTexto(renderPropostaDraft(regimeSlug, dadosIniciais));
  }

  function criar() {
    setErro(null);
    startTransition(async () => {
      const resultado = await criarPropostaAction(clienteId, propostaTexto);
      if (resultado.sucesso) {
        router.push(`/clientes/${clienteId}/propostas/${resultado.propostaId}`);
      } else {
        setErro(resultado.erro);
      }
    });
  }

  return (
    <div className="mt-6 rounded-lg border border-neutral-200 bg-white p-6">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs uppercase tracking-wide text-neutral-500">Rascunho</p>
        <button
          type="button"
          onClick={recarregarRascunho}
          className="text-xs text-neutral-500 hover:underline"
          title="Descarta as edições e volta ao texto pré-preenchido com os dados atuais do cliente"
        >
          Recarregar rascunho
        </button>
      </div>
      <textarea
        value={propostaTexto}
        onChange={(e) => setPropostaTexto(e.target.value)}
        rows={22}
        className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 font-mono text-xs leading-relaxed text-neutral-800 outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
        title="Texto completo da proposta, editável livremente antes de gerar o PDF"
      />

      {erro && (
        <div className="mt-3 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {erro}
        </div>
      )}

      <button
        type="button"
        onClick={criar}
        disabled={isPending}
        className="mt-3 w-full rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
        title="Salva a proposta, gera o PDF e abre a página de detalhe dela"
      >
        {isPending ? "Criando proposta..." : "Criar proposta →"}
      </button>
    </div>
  );
}
