import { NovoClienteForm } from "./novo-cliente-form";

export default function NovoClientePage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-10">
      <div className="mb-8">
        <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
          Etapa 1 de 5 — Cadastro
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-neutral-900">
          Novo cliente
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Esses dados alimentam automaticamente a proposta e o contrato — não
          serão digitados de novo.
        </p>
      </div>
      <NovoClienteForm />
    </main>
  );
}
