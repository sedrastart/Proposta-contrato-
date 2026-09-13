import Link from "next/link";
import { TituloEtapa } from "../mobile-ui";
import { NovoClienteFormMobile } from "./novo-cliente-form-mobile";

export default function NovoClienteMobilePage() {
  return (
    <div>
      <Link href="/m" className="text-sm text-ink-muted hover:underline">
        ← Início
      </Link>
      <TituloEtapa
        passo={1}
        total={4}
        titulo="Novo cliente"
        descricao="Preencha o CPF/CNPJ primeiro — boa parte do resto é preenchida sozinha."
      />
      <NovoClienteFormMobile />
    </div>
  );
}
