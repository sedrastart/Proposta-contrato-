"use client";

import { useState, useTransition } from "react";
import { atualizarClausulaAction, alternarAtivoClausulaAction } from "./actions";

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

  return (
    <div
      className={`rounded-lg border p-4 ${
        clausula.ativo ? "border-neutral-200 bg-white" : "border-neutral-200 bg-neutral-50 opacity-60"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <input
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          onBlur={salvar}
          className="flex-1 rounded border border-neutral-200 px-2 py-1 text-sm font-medium"
        />
        <div className="flex items-center gap-2 text-xs">
          <span
            className={`rounded-full px-2 py-0.5 font-medium ${
              clausula.tipo === "anexo"
                ? "bg-sky-50 text-sky-700"
                : "bg-neutral-100 text-neutral-600"
            }`}
          >
            {clausula.tipo === "anexo" ? "anexo" : "cláusula"}
          </span>
          <button
            type="button"
            onClick={alternarAtivo}
            disabled={isPending}
            className="text-neutral-600 hover:underline disabled:opacity-50"
          >
            {clausula.ativo ? "desativar" : "ativar"}
          </button>
        </div>
      </div>
      <textarea
        value={corpo}
        onChange={(e) => setCorpo(e.target.value)}
        onBlur={salvar}
        rows={Math.min(20, Math.max(4, corpo.split("\n").length + 1))}
        className="mt-2 w-full rounded border border-neutral-200 px-2 py-2 font-mono text-xs leading-relaxed"
      />
    </div>
  );
}
