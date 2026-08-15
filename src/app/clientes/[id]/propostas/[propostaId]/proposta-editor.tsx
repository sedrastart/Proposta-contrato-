"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  atualizarStatusPropostaAction,
  atualizarTextoPropostaAction,
  excluirPropostaAction,
} from "../actions";
import { STATUS_PROPOSTA, STATUS_PROPOSTA_LABEL, type StatusProposta } from "@/lib/proposta-status";

type Proposta = {
  id: string;
  clienteId: string;
  numeroSequencial: number;
  status: string;
  valorFinal: string;
  vigenciaMeses: number;
  servicosSnapshot: string;
  textoCompleto: string;
  dataEmissao: string;
  contratoGerado: { id: string; numeroSequencial: number } | null;
};

const badgeClass: Record<string, string> = {
  rascunho: "bg-neutral-100 text-ink-muted",
  enviada: "bg-sky-50 text-sky-700",
  aceita: "bg-emerald-50 text-emerald-700",
  recusada: "bg-red-50 text-red-700",
};

export function PropostaEditor({ proposta }: { proposta: Proposta }) {
  const router = useRouter();
  const numero = String(proposta.numeroSequencial).padStart(6, "0");
  const [status, setStatus] = useState(proposta.status);
  const [textoCompleto, setTextoCompleto] = useState(proposta.textoCompleto);
  const [isPendingStatus, startTransitionStatus] = useTransition();
  const [isPendingTexto, startTransitionTexto] = useTransition();
  const [isPendingExcluir, startTransitionExcluir] = useTransition();
  const [erroTexto, setErroTexto] = useState<string | null>(null);
  const [salvo, setSalvo] = useState(false);

  function excluir() {
    if (
      !confirm(`Excluir a proposta nº ${numero}? Esta ação não pode ser desfeita.`)
    ) {
      return;
    }
    startTransitionExcluir(async () => {
      await excluirPropostaAction(proposta.id);
      router.push(`/clientes/${proposta.clienteId}`);
      router.refresh();
    });
  }

  function mudarStatus(novoStatus: string) {
    setStatus(novoStatus);
    setSalvo(false);
    startTransitionStatus(() => {
      atualizarStatusPropostaAction(proposta.id, novoStatus);
    });
  }

  function salvarTexto() {
    setErroTexto(null);
    setSalvo(false);
    startTransitionTexto(async () => {
      const resultado = await atualizarTextoPropostaAction(proposta.id, textoCompleto);
      if (resultado.sucesso) {
        setSalvo(true);
      } else {
        setErroTexto(resultado.erro);
      }
    });
  }

  return (
    <>
      <div className="mt-6 rounded-lg border border-line p-5">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <div>
            <dt className="text-xs uppercase tracking-wide text-ink-muted">Número</dt>
            <dd className="mt-0.5 tabular-nums text-ink">{numero}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-ink-muted">Status</dt>
            <dd className="mt-0.5">
              <select
                value={status}
                onChange={(e) => mudarStatus(e.target.value)}
                disabled={isPendingStatus}
                className={`rounded-full border-0 px-2 py-0.5 text-xs font-medium ${badgeClass[status] ?? badgeClass.rascunho}`}
                title="Acompanha se a proposta foi enviada e a resposta do cliente — não afeta o texto/PDF já gerado"
              >
                {STATUS_PROPOSTA.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_PROPOSTA_LABEL[s as StatusProposta]}
                  </option>
                ))}
              </select>
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-ink-muted">Emitida em</dt>
            <dd className="mt-0.5 text-ink">
              {new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(
                new Date(proposta.dataEmissao)
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-ink-muted">Valor</dt>
            <dd className="mt-0.5 text-ink">{proposta.valorFinal}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-ink-muted">Vigência</dt>
            <dd className="mt-0.5 text-ink">
              {proposta.vigenciaMeses > 0 ? `${proposta.vigenciaMeses} meses` : "a definir"}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-ink-muted">Serviços</dt>
            <dd className="mt-0.5 text-ink">{proposta.servicosSnapshot}</dd>
          </div>
        </dl>
        <button
          type="button"
          onClick={excluir}
          disabled={isPendingExcluir}
          className="mt-4 text-sm text-red-600 hover:underline disabled:opacity-50"
        >
          {isPendingExcluir ? "Excluindo..." : "Excluir proposta"}
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <a
          href={`/api/propostas/${proposta.id}`}
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:brightness-110"
          title="Baixa o PDF gerado a partir do texto salvo mais recentemente"
        >
          Baixar PDF
        </a>
        {proposta.contratoGerado ? (
          <Link
            href={`/clientes/${proposta.clienteId}/contratos/${proposta.contratoGerado.id}`}
            className="rounded-md border border-line px-4 py-2 text-sm font-medium text-ink hover:bg-neutral-50"
          >
            Contrato gerado: nº {String(proposta.contratoGerado.numeroSequencial).padStart(6, "0")} →
          </Link>
        ) : status === "aceita" ? (
          <Link
            href={`/clientes/${proposta.clienteId}/previa?propostaId=${proposta.id}`}
            className="rounded-md border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100"
            title="Leva para a tela de prévia do contrato, já referenciando esta proposta"
          >
            Gerar contrato a partir desta proposta →
          </Link>
        ) : null}
      </div>

      <div className="mt-8 rounded-lg border border-line bg-white p-6">
        <p className="mb-3 text-xs uppercase tracking-wide text-ink-muted">
          Texto da proposta (editável)
        </p>
        <textarea
          value={textoCompleto}
          onChange={(e) => setTextoCompleto(e.target.value)}
          rows={22}
          className="w-full rounded-md border border-line bg-white px-3 py-2 font-mono text-xs leading-relaxed text-ink outline-none focus:border-accent focus:ring-1 focus:ring-accent"
          title="Editar aqui não afeta o PDF já baixado — clique em 'Salvar e reemitir PDF' para atualizar"
        />

        {erroTexto && (
          <div className="mt-3 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
            {erroTexto}
          </div>
        )}
        {salvo && !isPendingTexto && (
          <div className="mt-3 rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            Texto salvo e PDF reemitido.
          </div>
        )}

        <button
          type="button"
          onClick={salvarTexto}
          disabled={isPendingTexto}
          className="mt-3 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:brightness-110 disabled:opacity-50"
          title="Regrava o texto e gera um novo PDF com o conteúdo atual"
        >
          {isPendingTexto ? "Salvando..." : "Salvar e reemitir PDF"}
        </button>
      </div>
    </>
  );
}
