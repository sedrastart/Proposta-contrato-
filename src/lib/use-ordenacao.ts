"use client";

import { useState } from "react";

export type Direcao = "asc" | "desc";

/** Ordenação de tabela client-side — clicar na mesma coluna inverte a
 * direção, clicar numa coluna diferente ordena crescente. */
export function useOrdenacao<T>(itens: T[], colunaPadrao: keyof T | null = null) {
  const [coluna, setColuna] = useState<keyof T | null>(colunaPadrao);
  const [direcao, setDirecao] = useState<Direcao>("asc");

  function ordenarPor(campo: keyof T) {
    if (campo === coluna) {
      setDirecao((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setColuna(campo);
      setDirecao("asc");
    }
  }

  const ordenados = coluna
    ? [...itens].sort((a, b) => {
        const va = a[coluna];
        const vb = b[coluna];
        const cmp =
          typeof va === "number" && typeof vb === "number"
            ? va - vb
            : String(va).localeCompare(String(vb), "pt-BR");
        return direcao === "asc" ? cmp : -cmp;
      })
    : itens;

  return { ordenados, coluna, direcao, ordenarPor };
}
