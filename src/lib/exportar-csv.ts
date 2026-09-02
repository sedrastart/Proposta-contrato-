/** Gera um CSV a partir de linhas (array de arrays) e dispara o download
 * no navegador. Escapa campos que tenham vírgula, aspas ou quebra de linha. */
export function exportarCsv(nomeArquivo: string, cabecalho: string[], linhas: (string | number)[][]) {
  function escapar(valor: string | number): string {
    const texto = String(valor);
    if (/[",\n]/.test(texto)) {
      return `"${texto.replace(/"/g, '""')}"`;
    }
    return texto;
  }

  const conteudo = [cabecalho, ...linhas]
    .map((linha) => linha.map(escapar).join(","))
    .join("\r\n");

  // BOM no início para o Excel reconhecer acentuação em UTF-8 corretamente.
  const blob = new Blob(["﻿" + conteudo], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = nomeArquivo;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
