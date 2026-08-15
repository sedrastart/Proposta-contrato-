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
        className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-accent"
        title="Filtra a lista abaixo por qualquer palavra do título ou do texto da cláusula"
      />

      <div className="mt-4 space-y-4">
        {filtradas.length === 0 ? (
          <p className="rounded-lg border border-dashed border-line py-8 text-center text-sm text-ink-muted">
            Nenhuma cláusula encontrada para &quot;{busca}&quot;.
          </p>
        ) : (
          filtradas.map((clausula) => <ClausulaEditor key={clausula.id} clausula={clausula} />)
        )}
      </div>

      <div className="mt-4 flex items-end gap-2 rounded-lg border border-dashed border-line p-4">
        <div>
          <label className="mb-1 block text-xs text-ink-muted">Tipo</label>
          <select
            value={novoTipo}
            onChange={(e) => setNovoTipo(e.target.value as "clausula" | "anexo")}
            className="rounded-md border border-line px-2 py-2 text-sm"
            title="Cláusulas entram no corpo do contrato; anexos entram como seções separadas ao final do documento"
          >
            <option value="clausula">Cláusula</option>
            <option value="anexo">Anexo</option>
          </select>
        </div>
        <div className="flex-1">
          <label className="mb-1 block text-xs text-ink-muted">Título da nova cláusula/anexo</label>
          <input
            value={novoTitulo}
            onChange={(e) => setNovoTitulo(e.target.value)}
            placeholder='ex.: "CLÁUSULA 29 – ..."'
            className="w-full rounded-md border border-line px-3 py-2 text-sm"
            title="Título como vai aparecer no documento — o texto/corpo é preenchido depois de criar"
          />
        </div>
        <button
          type="button"
          onClick={criar}
          disabled={isPending || !novoTitulo.trim()}
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:brightness-110 disabled:opacity-50"
          title="Cria a cláusula/anexo no final da lista deste modelo de contrato"
        >
          + Adicionar
        </button>
      </div>
    </div>
  );
}
