"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { renderContrato, type DadosContrato, type ClausulaRenderavel } from "@/lib/templates";
import { gerarContratoAction } from "./actions";
import { STATUS_PROPOSTA_LABEL, type StatusProposta } from "@/lib/proposta-status";

const inputClass =
  "w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900";
const labelClass = "mb-1 block text-xs font-medium uppercase tracking-wide text-neutral-500";

type PropostaResumo = { id: string; numeroSequencial: number; status: string };

export function PreviaEditor({
  clienteId,
  regimeSlug,
  dadosIniciais,
  clausulas,
  propostaOrigem,
  propostas,
}: {
  clienteId: string;
  regimeSlug: string;
  dadosIniciais: DadosContrato;
  clausulas: ClausulaRenderavel[];
  propostaOrigem: PropostaResumo | null;
  propostas: PropostaResumo[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [erro, setErro] = useState<string | null>(null);
  const [overrides, setOverrides] = useState({
    contratanteNome: dadosIniciais.contratanteNome,
    contratanteCpfCnpj: dadosIniciais.contratanteCpfCnpj,
    contratanteEndereco: dadosIniciais.contratanteEndereco,
    valor: dadosIniciais.valor,
    vigenciaMeses: dadosIniciais.vigenciaMeses,
    multaDescricao: dadosIniciais.multaDescricao,
    condicaoPagamento: dadosIniciais.condicaoPagamento,
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
      const resultado = await gerarContratoAction(clienteId, overrides, propostaOrigem?.id);
      if (resultado.sucesso) {
        router.push(`/clientes/${clienteId}/contratos/${resultado.contratoId}`);
      } else {
        setErro(resultado.erro);
      }
    });
  }

  return (
    <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        <div className="rounded-lg border border-neutral-200 bg-white p-6">
          <p className="mb-3 text-xs uppercase tracking-wide text-neutral-500">
            Documento renderizado (somente leitura)
          </p>
          <pre className="max-h-[70vh] overflow-y-auto whitespace-pre-wrap font-mono text-xs leading-relaxed text-neutral-800">
            {texto}
          </pre>
        </div>

        <div className="rounded-lg border border-neutral-200 bg-white p-6">
          <p className="mb-3 text-xs uppercase tracking-wide text-neutral-500">
            Propostas deste cliente
          </p>
          {propostaOrigem ? (
            <div className="rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              Baseado na proposta nº {String(propostaOrigem.numeroSequencial).padStart(6, "0")}{" "}
              — {STATUS_PROPOSTA_LABEL[propostaOrigem.status as StatusProposta] ?? propostaOrigem.status}
            </div>
          ) : propostas.length > 0 ? (
            <ul className="space-y-1 text-sm">
              {propostas.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/clientes/${clienteId}/propostas/${p.id}`}
                    className="text-neutral-700 hover:underline"
                  >
                    nº {String(p.numeroSequencial).padStart(6, "0")} —{" "}
                    {STATUS_PROPOSTA_LABEL[p.status as StatusProposta] ?? p.status}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-neutral-500">Nenhuma proposta ainda para este cliente.</p>
          )}
          <Link
            href={`/clientes/${clienteId}/propostas/nova`}
            className="mt-3 inline-block text-sm text-neutral-600 hover:underline"
          >
            + Nova proposta
          </Link>
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-lg border border-neutral-200 bg-white p-5">
          <p className="mb-3 text-xs uppercase tracking-wide text-neutral-500">
            Campos editáveis
          </p>
          <div className="space-y-3">
            <div>
              <label className={labelClass}>Razão Social / Nome</label>
              <input
                className={inputClass}
                value={overrides.contratanteNome}
                onChange={(e) => set("contratanteNome", e.target.value)}
                title="Nome que aparece no contrato como contratante — vem do cadastro, mas pode ajustar aqui só para este contrato"
              />
            </div>
            <div>
              <label className={labelClass}>CPF/CNPJ</label>
              <input
                className={inputClass}
                value={overrides.contratanteCpfCnpj}
                onChange={(e) => set("contratanteCpfCnpj", e.target.value)}
                title="CPF ou CNPJ do contratante como aparece no contrato"
              />
            </div>
            <div>
              <label className={labelClass}>Endereço</label>
              <textarea
                className={inputClass}
                rows={2}
                value={overrides.contratanteEndereco}
                onChange={(e) => set("contratanteEndereco", e.target.value)}
                title="Endereço completo do contratante como aparece no contrato"
              />
            </div>
            <div>
              <label className={labelClass}>Valor</label>
              <input
                className={inputClass}
                value={overrides.valor}
                onChange={(e) => set("valor", e.target.value)}
                title="Valor cobrado, como texto pronto para o contrato (ex.: 'R$ 350,00')"
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
                title="Duração do contrato em meses, só para este contrato"
              />
            </div>
            <div>
              <label className={labelClass}>Multa por quebra de contrato</label>
              <input
                className={inputClass}
                value={overrides.multaDescricao}
                onChange={(e) => set("multaDescricao", e.target.value)}
                title="Texto da multa que aparece no contrato, só para este contrato"
              />
            </div>
            <div>
              <label className={labelClass}>Condição de pagamento</label>
              <input
                className={inputClass}
                value={overrides.condicaoPagamento}
                onChange={(e) => set("condicaoPagamento", e.target.value)}
                placeholder='ex.: "à vista" ou "parcelado em 3x"'
                title="Vem do plano por padrão, mas pode sobrescrever só para este contrato/cliente"
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
