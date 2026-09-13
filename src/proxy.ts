import { NextRequest, NextResponse } from "next/server";

// "Mobi" aparece na UA de Android e iPhone (inclusive dentro de strings tipo
// "Mobile Safari") — não pega iPad em modo desktop (UA padrão do iPadOS
// moderno se passa por Mac), mas cobre o caso de uso real aqui: celular no
// bolso, não tablet.
const UA_CELULAR = /Mobi/i;
const COOKIE_FORCAR_DESKTOP = "sedra_forcar_desktop";

// Só os pontos de entrada "de sempre" (login e painel) redirecionam sozinhos
// pro fluxo simplificado — links diretos pra páginas específicas do painel
// administrativo (ex.: um cliente compartilhado) continuam abrindo normal,
// mesmo no celular, pra não quebrar um link que alguém mandou.
export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Clique em "Versão completa" dentro do /m: passa a ignorar o redirect
  // automático por um tempo, em vez de ficar preso num loop de volta pro /m.
  if (searchParams.get("full") === "1") {
    const destino = new URL(pathname, request.url);
    const resposta = NextResponse.redirect(destino);
    resposta.cookies.set(COOKIE_FORCAR_DESKTOP, "1", {
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
    return resposta;
  }

  if (request.cookies.get(COOKIE_FORCAR_DESKTOP)) {
    return NextResponse.next();
  }

  const userAgent = request.headers.get("user-agent") ?? "";
  if (!UA_CELULAR.test(userAgent)) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL("/m", request.url));
}

export const config = {
  matcher: ["/", "/painel"],
};
