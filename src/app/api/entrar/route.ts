import { NextResponse } from "next/server";

const COOKIE_JA_VISITOU = "sedra_ja_visitou";

/** Marca que o usuário já passou pela tela de início nesta sessão do
 * navegador, para que outras visitas a "/" caiam direto no painel — sem
 * maxAge, é um cookie de sessão: some quando o navegador é fechado, e a
 * tela de início volta a aparecer na próxima vez. */
export async function GET(request: Request) {
  const url = new URL("/painel", request.url);
  const resposta = NextResponse.redirect(url);
  resposta.cookies.set(COOKIE_JA_VISITOU, "1", { path: "/" });
  return resposta;
}
