"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { gerarContratoAction } from "@/app/clientes/[id]/previa/actions";
import type { DadosContrato } from "@/lib/templates";
import { campoClass, rotuloClass, BarraAcaoFixa, BotaoPrimario } from "../../mobile-ui";

type PropostaResumo = { id: string; numeroSequencial: number; status: string; valorFinal: string };

export function ContratoMobileStep({
  clienteId,
  dadosIniciais,
  propostaOrigem,
}: {
  clienteId: string;
  dadosIniciais: DadosContrato;
  propostaOrigem: PropostaResumo | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [erro, setErro] = useState<string | null>(null);
  const [contratoId, setContratoId] = useState<string | null>(null);
  const [overrides, setOverrides] = useState({
    contratanteNome: dadosIniciais.contratanteNome,
    contratanteCpfCnpj: dadosIniciais.contratanteCpfCnpj,
    contratanteEndereco: dadosIniciais.contratanteEndereco,
    valor: propostaOrigem?.valorFinal ?? dadosIniciais.valor,
    vigenciaMeses: dadosIniciais.vigenciaMeses,
    multaDescricao: dadosIniciais.multaDescricao,
    condicaoPagamento: dadosIniciais.condicaoPagamento,
  });

  function set<K extends keyof typeof overrides>(campo: K, valor: (typeof overrides)[K]) {
    setOverrides((prev) => ({ ...prev, [campo]: valor }));
  }

  function gerar() {
    setErro(null);
    startTransition(async () => {
      const resultado = await gerarContratoAction(clienteId, overrides, propostaOrigem?.id);
      if (resultado.sucesso) setContratoId(resultado.contratoId);
      else setErro(resultado.erro);
    });
  }

  if (contratoId) {
    return (
      <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-5 text-center">
        <p className="text-base font-semibold text-emerald-800">Contrato gerado! ✓</p>
        <div className="mt-4 flex flex-col gap-2">
          <a
            href={`/api/contratos/${contratoId}/pdf`}
            className="rounded-lg bg-accent px-4 py-3 text-sm font-semibold text-white hover:brightness-110"
          >
            Baixar PDF
          </a>
          <a
            href={`/api/contratos/${contratoId}/docx`}
            className="rounded-lg border border-line bg-white px-4 py-3 text-sm font-medium text-ink hover:bg-neutral-50"
          >
            Baixar DOCX
          </a>
          <Link href="/m" className="mt-3 text-sm text-ink-muted hover:underline">
            Cadastrar outro cliente →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {propostaOrigem && (
        <div className="rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          Baseado na proposta nº {String(propostaOrigem.numeroSequencial).padStart(6, "0")}
        </div>
      )}

      <div className="space-y-3 rounded-lg border border-line bg-white p-4">
        <p className="text-xs uppercase tracking-wide text-ink-muted">
          Apenas estes campos são editáveis
        </p>
        <div>
          <label className={rotuloClass}>Razão Social / Nome</label>
          <input
            className={campoClass}
            value={overrides.contratanteNome}
            onChange={(e) => set("contratanteNome", e.target.value)}
          />
        </div>
        <div>
          <label className={rotuloClass}>CPF/CNPJ</label>
          <input
            className={campoClass}
            value={overrides.contratanteCpfCnpj}
            onChange={(e) => set("contratanteCpfCnpj", e.target.value)}
          />
        </div>
        <div>
          <label className={rotuloClass}>Endereço</label>
          <textarea
            className={campoClass}
            rows={2}
            value={overrides.contratanteEndereco}
            onChange={(e) => set("contratanteEndereco", e.target.value)}
          />
        </div>
        <div>
          <label className={rotuloClass}>Valor</label>
          <input
            className={campoClass}
            value={overrides.valor}
            onChange={(e) => set("valor", e.target.value)}
          />
        </div>
        <div>
          <label className={rotuloClass}>Vigência (meses)</label>
          <input
            type="number"
            min={1}
            className={campoClass}
            value={overrides.vigenciaMeses}
            onChange={(e) => set("vigenciaMeses", Number(e.target.value))}
          />
        </div>
        <div>
          <label className={rotuloClass}>Multa por quebra de contrato</label>
          <input
            className={campoClass}
            value={overrides.multaDescricao}
            onChange={(e) => set("multaDescricao", e.target.value)}
          />
        </div>
        <div>
          <label className={rotuloClass}>Condição de pagamento</label>
          <input
            className={campoClass}
            value={overrides.condicaoPagamento}
            onChange={(e) => set("condicaoPagamento", e.target.value)}
            placeholder='ex.: "à vista" ou "parcelado em 3x"'
          />
        </div>
      </div>

      {erro && (
        <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {erro}
        </div>
      )}

      <BarraAcaoFixa>
        <BotaoPrimario type="button" onClick={gerar} disabled={isPending}>
          {isPending ? "Gerando documentos..." : "Gerar contrato →"}
        </BotaoPrimario>
      </BarraAcaoFixa>
    </div>
  );
}
