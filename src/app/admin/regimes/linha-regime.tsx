"use client";

import { useState, useTransition } from "react";
import { atualizarRegimeAction, alternarAtivoRegimeAction, excluirRegimeAction } from "./actions";

type Regime = {
  id: string;
  nome: string;
  slug: string;
  ordem: number;
  ativo: boolean;
};

export function LinhaRegime({ regime }: { regime: Regime }) {
  const [nome, setNome] = useState(regime.nome);
  const [ordem, setOrdem] = useState(regime.ordem);
  const [isPending, startTransition] = useTransition();
  const [erro, setErro] = useState<string | null>(null);

  function salvar() {
    startTransition(() => {
      atualizarRegimeAction(regime.id, { nome, ordem });
    });
  }

  function alternarAtivo() {
    startTransition(() => {
      alternarAtivoRegimeAction(regime.id, !regime.ativo);
    });
  }

  function excluir() {
    if (!confirm(`Excluir o regime "${regime.nome}"? Isso também apaga o modelo de contrato e de proposta dele. Esta ação não pode ser desfeita.`)) {
      return;
    }
    setErro(null);
    startTransition(async () => {
      const resultado = await excluirRegimeAction(regime.id);
      if (!resultado.sucesso) setErro(resultado.erro);
    });
  }

  return (
    <tr>
      <td className="px-4 py-2">
        <input
          type="number"
          value={ordem}
          onChange={(e) => setOrdem(Number(e.target.value))}
          onBlur={salvar}
          className="w-16 rounded border border-line px-2 py-1 text-sm"
          title="Posição de exibição desse regime nas listas (menor número aparece primeiro)"
        />
      </td>
      <td className="px-4 py-2">
        <input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          onBlur={salvar}
          className="w-full rounded border border-line px-2 py-1 text-sm"
          title="Nome do regime, como aparece para escolha no assistente de cliente"
        />
      </td>
      <td
        className="px-4 py-2 font-mono text-xs text-ink-muted"
        title="Identificador técnico usado internamente para ligar este regime ao seu modelo de contrato — não é editável"
      >
        {regime.slug}
      </td>
      <td className="px-4 py-2">
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            regime.ativo ? "bg-emerald-50 text-emerald-700" : "bg-neutral-100 text-ink-muted"
          }`}
          title={
            regime.ativo
              ? "Aparece como opção no assistente de cadastro de cliente"
              : "Não aparece mais como opção no assistente — clientes já cadastrados não são afetados"
          }
        >
          {regime.ativo ? "ativo" : "inativo"}
        </span>
      </td>
      <td className="px-4 py-2 text-right">
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={alternarAtivo}
            disabled={isPending}
            className="text-sm text-ink-muted hover:underline disabled:opacity-50"
            title={
              regime.ativo
                ? "Esconde este regime do assistente sem apagar nada"
                : "Volta a mostrar este regime no assistente"
            }
          >
            {regime.ativo ? "desativar" : "ativar"}
          </button>
          <button
            type="button"
            onClick={excluir}
            disabled={isPending}
            className="text-sm text-red-600 hover:underline disabled:opacity-50"
            title="Apaga este regime, seu modelo de contrato e de proposta definitivamente"
          >
            excluir
          </button>
        </div>
        {erro && <p className="mt-1 text-xs text-red-600">{erro}</p>}
      </td>
    </tr>
  );
}
