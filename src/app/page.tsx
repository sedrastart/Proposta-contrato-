import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { LOGO_SEDRA_COMPLETO_PNG_BASE64 } from "@/lib/documentos/marca-assets";

const COOKIE_JA_VISITOU = "sedra_ja_visitou";

export default async function TelaInicio() {
  const cookieStore = await cookies();
  if (cookieStore.get(COOKIE_JA_VISITOU)) {
    redirect("/painel");
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-20">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`data:image/png;base64,${LOGO_SEDRA_COMPLETO_PNG_BASE64}`}
        alt="Sedra Consultoria"
        className="w-48 sm:w-56"
      />
      <a
        href="/api/entrar"
        className="mt-10 rounded-md bg-accent px-8 py-3 text-sm font-semibold text-white hover:brightness-110"
      >
        Iniciar
      </a>
    </main>
  );
}
