"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { criarPropostaAction } from "../actions";

export function NovaPropostaEditor({
  clienteId,
  textoInicial,
}: {
  clienteId: string;
  textoInicial: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [erro, setErro] = useState<string | null>(null);
  const [propostaTexto, setPropostaTexto] = useState(textoInicial);

  function recarregarRascunho() {
    setPropostaTexto(textoInicial);
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
    <div className="mt-6 rounded-lg border border-line bg-white p-6">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs uppercase tracking-wide text-ink-muted">Rascunho</p>
        <button
          type="button"
          onClick={recarregarRascunho}
          className="text-xs text-ink-muted hover:underline"
          title="Descarta as edições e volta ao modelo padrão do regime"
        >
          Recarregar rascunho
        </button>
      </div>
      <textarea
        value={propostaTexto}
        onChange={(e) => setPropostaTexto(e.target.value)}
        rows={22}
        className="w-full rounded-md border border-line bg-white px-3 py-2 font-mono text-xs leading-relaxed text-ink outline-none focus:border-accent focus:ring-1 focus:ring-accent"
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
        className="mt-3 w-full rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:brightness-110 disabled:opacity-50"
        title="Salva a proposta, gera o PDF e abre a página de detalhe dela"
      >
        {isPending ? "Criando proposta..." : "Criar proposta →"}
      </button>
    </div>
  );
}
