"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { renderContrato, type DadosContrato, type ClausulaRenderavel } from "@/lib/templates";
import { gerarContratoAction, gerarPropostaAction } from "./actions";

const inputClass =
  "w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900";
const labelClass = "mb-1 block text-xs font-medium uppercase tracking-wide text-neutral-500";

export function PreviaEditor({
  clienteId,
  regimeSlug,
  dadosIniciais,
  clausulas,
}: {
  clienteId: string;
  regimeSlug: string;
  dadosIniciais: DadosContrato;
  clausulas: ClausulaRenderavel[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isPendingProposta, startTransitionProposta] = useTransition();
  const [erro, setErro] = useState<string | null>(null);
  const [propostaGerada, setPropostaGerada] = useState<string | null>(null);
  const [overrides, setOverrides] = useState({
    contratanteNome: dadosIniciais.contratanteNome,
    contratanteCpfCnpj: dadosIniciais.contratanteCpfCnpj,
    contratanteEndereco: dadosIniciais.contratanteEndereco,
    valor: dadosIniciais.valor,
    vigenciaMeses: dadosIniciais.vigenciaMeses,
    multaDescricao: dadosIniciais.multaDescricao,
  });

  const dados: DadosContrato = useMemo(
    () => ({ ...dadosIniciais, ...overrides }),
    [dadosIniciais, overrides]
  );

  const texto = useMemo(
    () => renderContrato(regimeSlug, dados, clausulas),
    [regimeSlug, dados, clausulas]
  );

  function set<K extends keyof typeof overrides>(campo: K, valor: (typeof overrides)[K]) {
    setOverrides((prev) => ({ ...prev, [campo]: valor }));
  }

  function gerar() {
    setErro(null);
    startTransition(async () => {
      const resultado = await gerarContratoAction(clienteId, overrides);
      if (resultado.sucesso) {
        router.push(`/clientes/${clienteId}/contratos/${resultado.contratoId}`);
      } else {
        setErro(resultado.erro);
      }
    });
  }

  function baixarProposta() {
    setErro(null);
    setPropostaGerada(null);
    startTransitionProposta(async () => {
      const resultado = await gerarPropostaAction(clienteId, overrides);
      if (!resultado.sucesso) {
        setErro(resultado.erro);
        return;
      }
      setPropostaGerada(resultado.propostaId);
      router.refresh();
    });
  }

  return (
    <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
      <div className="rounded-lg border border-neutral-200 bg-white p-6">
        <p className="mb-3 text-xs uppercase tracking-wide text-neutral-500">
          Documento renderizado (somente leitura)
        </p>
        <pre className="max-h-[70vh] overflow-y-auto whitespace-pre-wrap font-mono text-xs leading-relaxed text-neutral-800">
          {texto}
        </pre>
      </div>

      <div className="space-y-4">
        <div className="rounded-lg border border-neutral-200 bg-white p-5">
          <p className="mb-3 text-xs uppercase tracking-wide text-neutral-500">
            Campos editáveis (únicos 6)
          </p>
          <div className="space-y-3">
            <div>
              <label className={labelClass}>Razão Social / Nome</label>
              <input
                className={inputClass}
                value={overrides.contratanteNome}
                onChange={(e) => set("contratanteNome", e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>CPF/CNPJ</label>
              <input
                className={inputClass}
                value={overrides.contratanteCpfCnpj}
                onChange={(e) => set("contratanteCpfCnpj", e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Endereço</label>
              <textarea
                className={inputClass}
                rows={2}
                value={overrides.contratanteEndereco}
                onChange={(e) => set("contratanteEndereco", e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Valor</label>
              <input
                className={inputClass}
                value={overrides.valor}
                onChange={(e) => set("valor", e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Vigência (meses)</label>
              <input
                type="number"
                min={1}
                className={inputClass}
                value={overrides.vigenciaMeses}
                onChange={(e) => set("vigenciaMeses", Number(e.target.value))}
              />
            </div>
            <div>
              <label className={labelClass}>Multa por quebra de contrato</label>
              <input
                className={inputClass}
                value={overrides.multaDescricao}
                onChange={(e) => set("multaDescricao", e.target.value)}
              />
            </div>
          </div>
        </div>

        {erro && (
          <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
            {erro}
          </div>
        )}

        <button
          type="button"
          onClick={baixarProposta}
          disabled={isPendingProposta}
          className="w-full rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
        >
          {isPendingProposta ? "Gerando proposta..." : "Gerar proposta comercial (PDF)"}
        </button>
        {propostaGerada && (
          <a
            href={`/api/propostas/${propostaGerada}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-md bg-emerald-50 px-3 py-2 text-center text-sm font-medium text-emerald-700 hover:underline"
          >
            Proposta gerada — clique para baixar o PDF →
          </a>
        )}
        <p className="text-xs text-neutral-500">
          Resumo comercial simples (sem cláusulas) para enviar ao cliente
          antes de fechar o contrato. Fica salva no histórico do cliente.
        </p>

        <button
          type="button"
          onClick={gerar}
          disabled={isPending}
          className="w-full rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
        >
          {isPending ? "Gerando documentos..." : "Gerar Contrato (PDF/DOCX) →"}
        </button>
      </div>
    </div>
  );
}
