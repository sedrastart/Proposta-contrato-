"use client";

import { useState, useTransition } from "react";
import {
  atualizarClausulaAction,
  alternarAtivoClausulaAction,
  excluirClausulaAction,
  moverClausulaAction,
} from "./actions";

type Clausula = {
  id: string;
  tipo: string;
  titulo: string;
  corpo: string;
  ativo: boolean;
};

export function ClausulaEditor({ clausula }: { clausula: Clausula }) {
  const [titulo, setTitulo] = useState(clausula.titulo);
  const [corpo, setCorpo] = useState(clausula.corpo);
  const [isPending, startTransition] = useTransition();

  function salvar() {
    startTransition(() => {
      atualizarClausulaAction(clausula.id, { titulo, corpo });
    });
  }

  function alternarAtivo() {
    startTransition(() => {
      alternarAtivoClausulaAction(clausula.id, !clausula.ativo);
    });
  }

  function excluir() {
    if (!confirm(`Excluir "${clausula.titulo}"? Esta ação não pode ser desfeita.`)) return;
    startTransition(() => {
      excluirClausulaAction(clausula.id);
    });
  }

  function mover(direcao: "cima" | "baixo") {
    startTransition(() => {
      moverClausulaAction(clausula.id, direcao);
    });
  }

  return (
    <div
      className={`rounded-lg border p-4 ${
        clausula.ativo ? "border-line bg-white" : "border-line bg-neutral-50 opacity-60"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <input
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          onBlur={salvar}
          className="flex-1 rounded border border-line px-2 py-1 text-sm font-medium"
          title="Título da cláusula/anexo, como aparece no documento (ex.: 'CLÁUSULA 1 – DO OBJETO')"
        />
        <div className="flex items-center gap-2 text-xs">
          <span
            className={`rounded-full px-2 py-0.5 font-medium ${
              clausula.tipo === "anexo"
                ? "bg-sky-50 text-sky-700"
                : "bg-neutral-100 text-ink-muted"
            }`}
            title="Cláusulas entram no corpo do contrato; anexos entram como seções separadas ao final do documento"
          >
            {clausula.tipo === "anexo" ? "anexo" : "cláusula"}
          </span>
          <button
            type="button"
            onClick={() => mover("cima")}
            disabled={isPending}
            title="Mover para cima na ordem do documento"
            className="text-ink-muted hover:text-ink disabled:opacity-50"
          >
            ↑
          </button>
          <button
            type="button"
            onClick={() => mover("baixo")}
            disabled={isPending}
            title="Mover para baixo na ordem do documento"
            className="text-ink-muted hover:text-ink disabled:opacity-50"
          >
            ↓
          </button>
          <button
            type="button"
            onClick={alternarAtivo}
            disabled={isPending}
            className="text-ink-muted hover:underline disabled:opacity-50"
            title={
              clausula.ativo
                ? "Some do documento gerado, mas o texto fica salvo e pode ser reativado depois"
                : "Volta a aparecer no documento gerado"
            }
          >
            {clausula.ativo ? "desativar" : "ativar"}
          </button>
          <button
            type="button"
            onClick={excluir}
            disabled={isPending}
            className="text-red-600 hover:underline disabled:opacity-50"
            title="Apaga esta cláusula/anexo definitivamente — não afeta contratos já emitidos"
          >
            excluir
          </button>
        </div>
      </div>
      <textarea
        value={corpo}
        onChange={(e) => setCorpo(e.target.value)}
        onBlur={salvar}
        rows={Math.min(20, Math.max(4, corpo.split("\n").length + 1))}
        className="mt-2 w-full rounded border border-line px-2 py-2 font-mono text-xs leading-relaxed"
        title="Texto da cláusula/anexo — pode usar variáveis {{como_essa}} que são substituídas pelos dados reais do cliente ao gerar o contrato"
      />
    </div>
  );
}
