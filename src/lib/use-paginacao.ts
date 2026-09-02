"use client";

import { useEffect, useState } from "react";

/** Paginação client-side sobre uma lista já filtrada/ordenada. Volta pra
 * página 1 sempre que o tamanho da lista muda (nova busca, por exemplo). */
export function usePaginacao<T>(itens: T[], porPagina = 20) {
  const [pagina, setPagina] = useState(1);

  useEffect(() => {
    setPagina(1);
  }, [itens.length]);

  const totalPaginas = Math.max(1, Math.ceil(itens.length / porPagina));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const inicio = (paginaAtual - 1) * porPagina;
  const pageItens = itens.slice(inicio, inicio + porPagina);

  return { pageItens, pagina: paginaAtual, totalPaginas, setPagina };
}
