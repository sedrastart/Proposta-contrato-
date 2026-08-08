"use client";

import { useState, useTransition } from "react";
import { ClausulaEditor } from "./clausula-editor";
import { criarClausulaAction } from "./actions";

type Clausula = {
  id: string;
  tipo: string;
  titulo: string;
  corpo: string;
  ativo: boolean;
};

export function ClausulasLista({
  modeloContratoId,
  clausulas,
}: {
  modeloContratoId: string;
  clausulas: Clausula[];
}) {
  const [busca, setBusca] = useState("");
  const [novoTipo, setNovoTipo] = useState<"clausula" | "anexo">("clausula");
  const [novoTitulo, setNovoTitulo] = useState("");
  const [isPending, startTransition] = useTransition();

  const buscaLower = busca.trim().toLowerCase();
  const filtradas = buscaLower
    ? clausulas.filter(
        (c) =>
          c.titulo.toLowerCase().includes(buscaLower) ||
          c.corpo.toLowerCase().includes(buscaLower)
      )
    : clausulas;

  function criar() {
    if (!novoTitulo.trim()) return;
    startTransition(() => {
      criarClausulaAction(modeloContratoId, {
        tipo: novoTipo,
        titulo: novoTitulo,
        corpo: "",
      });
      setNovoTitulo("");
    });
  }

  return (
    <div>
      <input
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        placeholder="Buscar por título ou texto da cláusula..."
        className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
      />

      <div className="mt-4 space-y-4">
        {filtradas.length === 0 ? (
          <p className="rounded-lg border border-dashed border-neutral-300 py-8 text-center text-sm text-neutral-500">
            Nenhuma cláusula encontrada para &quot;{busca}&quot;.
          </p>
        ) : (
          filtradas.map((clausula) => <ClausulaEditor key={clausula.id} clausula={clausula} />)
        )}
      </div>

      <div className="mt-4 flex items-end gap-2 rounded-lg border border-dashed border-neutral-300 p-4">
        <div>
          <label className="mb-1 block text-xs text-neutral-500">Tipo</label>
          <select
            value={novoTipo}
            onChange={(e) => setNovoTipo(e.target.value as "clausula" | "anexo")}
            className="rounded-md border border-neutral-300 px-2 py-2 text-sm"
          >
            <option value="clausula">Cláusula</option>
            <option value="anexo">Anexo</option>
          </select>
        </div>
        <div className="flex-1">
          <label className="mb-1 block text-xs text-neutral-500">Título da nova cláusula/anexo</label>
          <input
            value={novoTitulo}
            onChange={(e) => setNovoTitulo(e.target.value)}
            placeholder='ex.: "CLÁUSULA 29 – ..."'
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
        <button
          type="button"
          onClick={criar}
          disabled={isPending || !novoTitulo.trim()}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
        >
          + Adicionar
        </button>
      </div>
    </div>
  );
}
