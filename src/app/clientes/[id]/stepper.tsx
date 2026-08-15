export type PassoStepper = {
  titulo: string;
  subtitulo: string;
  estado: "concluida" | "atual" | "pendente";
};

export function Stepper({ passos }: { passos: PassoStepper[] }) {
  return (
    <div className="mt-6 rounded-lg border border-line bg-white px-5 py-4">
      <div className="flex items-stretch">
        {passos.map((passo, i) => (
          <div key={passo.titulo} className="relative flex-1 pl-4 first:pl-0">
            {i > 0 && (
              <span
                className={`absolute left-0 top-[11px] h-px w-full -translate-x-1/2 ${
                  passo.estado !== "pendente" ? "bg-emerald-300" : "bg-neutral-200"
                }`}
              />
            )}
            <div
              className={`relative z-10 flex h-[22px] w-[22px] items-center justify-center rounded-full font-serif text-[11px] font-bold ${
                passo.estado === "concluida"
                  ? "bg-emerald-50 text-emerald-700"
                  : passo.estado === "atual"
                    ? "bg-accent text-white"
                    : "bg-neutral-100 text-neutral-400"
              }`}
            >
              {passo.estado === "concluida" ? "✓" : i + 1}
            </div>
            <p className="mt-2 text-[12.5px] font-semibold text-ink">{passo.titulo}</p>
            <p className="text-[11px] text-ink-muted">{passo.subtitulo}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
