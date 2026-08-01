export type ClausulaRenderavel = {
  tipo: string;
  titulo: string;
  corpo: string;
};

// Substitui {{chave}} pelo valor correspondente no contexto; placeholders
// desconhecidos são deixados como estão (fail-safe: nunca quebra o render
// por causa de um texto digitado errado no admin).
export function substituirPlaceholders(
  texto: string,
  contexto: Record<string, string>
): string {
  return texto.replace(/\{\{(\w+)\}\}/g, (match, chave) =>
    chave in contexto ? contexto[chave] : match
  );
}

// Junta título + corpo de uma lista de cláusulas (já filtrada por tipo),
// substituindo os placeholders de cada uma. Usado para o corpo principal do
// contrato (cláusulas numeradas); os anexos têm montagem própria em cada
// modelo, pois carregam o bloco de assinatura fixo entre um anexo e outro.
export function renderClausulas(
  clausulas: ClausulaRenderavel[],
  contexto: Record<string, string>
): string {
  return clausulas
    .map((c) => `${c.titulo}\n${substituirPlaceholders(c.corpo, contexto)}`)
    .join("\n\n");
}
