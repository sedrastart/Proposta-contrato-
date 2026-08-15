"use client";

import { useTransition } from "react";
import { definirPlanoAction } from "../actions";

type Faixa = { percentualAte: number; valorAdicional: number };
type Limite = { unidade: string; quantidade: number; tipoCobranca: string; valorPorUnidade: number | null; faixas: Faixa[] };
type Plano = {
  id: string;
  nome: string;
  valor: number;
  vigenciaMeses: number;
  multaDescricao: string | null;
  limites: Limite[];
};

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function descreverFaixa(faixa: Faixa, anterior: number) {
  const ate = faixa.percentualAte >= 999 ? "acima disso" : `até ${faixa.percentualAte}%`;
  const de = anterior > 0 && faixa.percentualAte < 999 ? `${anterior}% a ` : anterior > 0 ? "" : "";
  return `${de}${ate} de excedente: ${currency.format(faixa.valorAdicional)}`;
}

export function PlanoSelector({
  clienteId,
  servicoId,
  servicoNome,
  planos,
  planoAtualId,
}: {
  clienteId: string;
  servicoId: string;
  servicoNome: string;
  planos: Plano[];
  planoAtualId: string | null;
}) {
  const [isPending, startTransition] = useTransition();

  function selecionar(planoId: string) {
    startTransition(() => {
      definirPlanoAction(clienteId, servicoId, planoId);
    });
  }

  if (planos.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-line p-4 text-sm text-ink-muted">
        <span className="font-medium text-ink">{servicoNome}:</span>{" "}
        nenhum plano cadastrado ainda para este serviço/regime.
      </div>
    );
  }

  return (
    <div className="rounded-md border border-line p-4">
      <p className="text-sm font-medium text-ink">{servicoNome}</p>
      <div className="mt-2 space-y-2">
        {planos.map((plano) => {
          const selecionado = plano.id === planoAtualId;
          return (
            <label
              key={plano.id}
              className={`block cursor-pointer rounded-md border p-3 text-sm transition ${
                selecionado
                  ? "border-accent bg-neutral-50"
                  : "border-line hover:border-line"
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="radio"
                  name={`plano-${servicoId}`}
                  checked={selecionado}
                  onChange={() => selecionar(plano.id)}
                  disabled={isPending}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-medium text-ink">
                      {plano.nome}
                    </span>
                    <span className="tabular-nums text-sm text-ink">
                      {currency.format(plano.valor)}/mês
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-ink-muted">
                    Vigência: {plano.vigenciaMeses}{" "}
                    {plano.vigenciaMeses === 1 ? "mês" : "meses"} · Multa:{" "}
                    {plano.multaDescricao ?? "não possui"}
                  </p>
                  {plano.limites.map((limite) => (
                    <div
                      key={limite.unidade}
                      className="mt-1.5 rounded bg-neutral-100 px-2 py-1 text-xs text-ink-muted"
                    >
                      <span className="font-medium">
                        Até {limite.quantidade} {limite.unidade}/mês incluídos.
                      </span>{" "}
                      {limite.tipoCobranca === "por_unidade"
                        ? `Excedente: ${currency.format(limite.valorPorUnidade ?? 0)} por unidade adicional.`
                        : limite.faixas
                            .reduce<string[]>((acc, faixa, i) => {
                              const anterior = i === 0 ? 0 : limite.faixas[i - 1].percentualAte;
                              acc.push(descreverFaixa(faixa, anterior));
                              return acc;
                            }, [])
                            .join(" · ")}
                    </div>
                  ))}
                </div>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}
