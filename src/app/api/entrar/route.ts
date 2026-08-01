import { NextResponse } from "next/server";

const COOKIE_JA_VISITOU = "sedra_ja_visitou";
const UM_ANO_EM_SEGUNDOS = 60 * 60 * 24 * 365;

/** Marca que o usuário já passou pela tela de início, para que futuras
 * visitas a "/" caiam direto no painel. */
export async function GET(request: Request) {
  const url = new URL("/painel", request.url);
  const resposta = NextResponse.redirect(url);
  resposta.cookies.set(COOKIE_JA_VISITOU, "1", {
    maxAge: UM_ANO_EM_SEGUNDOS,
    path: "/",
  });
  return resposta;
}
