import Link from "next/link";
import { LOGO_SEDRA_PNG_BASE64 } from "@/lib/documentos/marca-assets";

export default function TelaInicio() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-20">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`data:image/png;base64,${LOGO_SEDRA_PNG_BASE64}`}
        alt="Sedra Consultoria"
        className="w-48 sm:w-56"
      />
      <Link
        href="/painel"
        className="mt-10 rounded-md bg-neutral-900 px-8 py-3 text-sm font-semibold text-white hover:bg-neutral-800"
      >
        Iniciar
      </Link>
    </main>
  );
}
