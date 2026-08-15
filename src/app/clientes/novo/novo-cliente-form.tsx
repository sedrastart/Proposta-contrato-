"use client";

import { useActionState, useState, useTransition } from "react";
import {
  criarClienteAction,
  buscarCepAction,
  buscarCnpjAction,
  type CriarClienteState,
} from "../actions";
import { UF_LIST, onlyDigits } from "@/lib/validation";

const initialState: CriarClienteState = { errors: {}, values: {} };

const inputClass =
  "w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-accent focus:ring-1 focus:ring-accent";
const labelClass = "mb-1 block text-sm font-medium text-ink";
const errorClass = "mt-1 text-xs text-red-600";

function Field({
  name,
  label,
  defaultValue,
  error,
  required,
  type = "text",
  ...rest
}: {
  name: string;
  label: string;
  defaultValue?: string;
  error?: string;
  required?: boolean;
  type?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className={labelClass} htmlFor={name}>
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        className={inputClass}
        {...rest}
      />
      {error && <p className={errorClass}>{error}</p>}
    </div>
  );
}

export function NovoClienteForm() {
  const [state, formAction, pending] = useActionState(
    criarClienteAction,
    initialState
  );
  const [tipoPessoa, setTipoPessoa] = useState(
    state.values.tipoPessoa || "PJ"
  );
  const [endereco, setEndereco] = useState({
    logradouro: state.values.enderecoLogradouro || "",
    numero: state.values.enderecoNumero || "",
    complemento: state.values.enderecoComplemento || "",
    bairro: state.values.enderecoBairro || "",
    cidade: state.values.enderecoCidade || "",
    uf: state.values.enderecoUf || "",
    cep: state.values.enderecoCep || "",
  });
  const [identificacao, setIdentificacao] = useState({
    razaoSocial: state.values.razaoSocial || "",
    nomeFantasia: state.values.nomeFantasia || "",
    telefone: state.values.telefone || "",
    email: state.values.email || "",
  });
  const [cepStatus, setCepStatus] = useState<
    "idle" | "loading" | "found" | "not-found"
  >("idle");
  const [isCepPending, startCepTransition] = useTransition();
  const [cnpjStatus, setCnpjStatus] = useState<
    "idle" | "loading" | "found" | "not-found"
  >("idle");
  const [situacaoCadastral, setSituacaoCadastral] = useState<string | null>(null);
  const [isCnpjPending, startCnpjTransition] = useTransition();

  function handleCepBlur(e: React.FocusEvent<HTMLInputElement>) {
    const cep = e.target.value;
    if (cep.replace(/\D/g, "").length !== 8) return;
    setCepStatus("loading");
    startCepTransition(async () => {
      const result = await buscarCepAction(cep);
      if (!result) {
        setCepStatus("not-found");
        return;
      }
      setCepStatus("found");
      setEndereco((prev) => ({
        ...prev,
        logradouro: result.logradouro,
        bairro: result.bairro,
        cidade: result.cidade,
        uf: result.uf,
      }));
    });
  }

  function handleCnpjBlur(e: React.FocusEvent<HTMLInputElement>) {
    if (tipoPessoa !== "PJ") return;
    const cnpj = e.target.value;
    if (onlyDigits(cnpj).length !== 14) return;
    setCnpjStatus("loading");
    setSituacaoCadastral(null);
    startCnpjTransition(async () => {
      const result = await buscarCnpjAction(cnpj);
      if (!result) {
        setCnpjStatus("not-found");
        return;
      }
      setCnpjStatus("found");
      setSituacaoCadastral(result.situacaoCadastral ?? null);
      setIdentificacao((prev) => ({
        razaoSocial: result.razaoSocial || prev.razaoSocial,
        nomeFantasia: result.nomeFantasia || prev.nomeFantasia,
        telefone: result.telefone || prev.telefone,
        email: result.email || prev.email,
      }));
      setEndereco({
        logradouro: result.logradouro,
        numero: result.numero,
        complemento: result.complemento,
        bairro: result.bairro,
        cidade: result.cidade,
        uf: result.uf,
        cep: result.cep,
      });
    });
  }

  return (
    <form action={formAction} className="space-y-8">
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-ink">
          Identificação
        </h2>
        <div>
          <label className={labelClass}>Tipo</label>
          <div className="flex gap-2">
            {(["PJ", "PF"] as const).map((tipo) => (
              <label
                key={tipo}
                className={`cursor-pointer rounded-md border px-3 py-1.5 text-sm ${
                  tipoPessoa === tipo
                    ? "border-accent bg-accent text-white"
                    : "border-line text-ink"
                }`}
              >
                <input
                  type="radio"
                  name="tipoPessoa"
                  value={tipo}
                  checked={tipoPessoa === tipo}
                  onChange={() => setTipoPessoa(tipo)}
                  className="hidden"
                />
                {tipo === "PJ" ? "Pessoa Jurídica" : "Pessoa Física"}
              </label>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field
            name="razaoSocial"
            label={tipoPessoa === "PJ" ? "Razão Social" : "Nome completo"}
            defaultValue={identificacao.razaoSocial}
            error={state.errors.razaoSocial}
            key={"razaoSocial-" + identificacao.razaoSocial}
            required
          />
          <Field
            name="nomeFantasia"
            label="Nome Fantasia"
            defaultValue={identificacao.nomeFantasia}
            error={state.errors.nomeFantasia}
            key={"nomeFantasia-" + identificacao.nomeFantasia}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Field
              name="cpfCnpj"
              label={tipoPessoa === "PJ" ? "CNPJ" : "CPF"}
              defaultValue={state.values.cpfCnpj}
              error={state.errors.cpfCnpj}
              placeholder={tipoPessoa === "PJ" ? "00.000.000/0000-00" : "000.000.000-00"}
              onBlur={handleCnpjBlur}
              required
            />
            {tipoPessoa === "PJ" && isCnpjPending && (
              <p className="mt-1 text-xs text-ink-muted">Consultando CNPJ...</p>
            )}
            {tipoPessoa === "PJ" && cnpjStatus === "not-found" && !isCnpjPending && (
              <p className="mt-1 text-xs text-amber-600">
                CNPJ não encontrado na Receita Federal — confira o número ou
                preencha manualmente.
              </p>
            )}
            {tipoPessoa === "PJ" && cnpjStatus === "found" && !isCnpjPending && (
              <p className="mt-1 text-xs text-emerald-600">
                Dados encontrados e preenchidos automaticamente.
                {situacaoCadastral && situacaoCadastral !== "ATIVA" && (
                  <span className="ml-1 text-amber-600">
                    Situação cadastral: {situacaoCadastral}.
                  </span>
                )}
              </p>
            )}
          </div>
          <Field
            name="inscricaoEstadual"
            label="Inscrição Estadual"
            defaultValue={state.values.inscricaoEstadual}
            error={state.errors.inscricaoEstadual}
          />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-ink">Endereço</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="relative">
            <Field
              name="enderecoCep"
              label="CEP"
              defaultValue={endereco.cep || state.values.enderecoCep}
              error={state.errors.enderecoCep}
              placeholder="00000-000"
              onBlur={handleCepBlur}
              key={"cep-" + endereco.cep}
              required
            />
            {isCepPending && (
              <p className="mt-1 text-xs text-ink-muted">Buscando endereço...</p>
            )}
            {cepStatus === "not-found" && !isCepPending && (
              <p className="mt-1 text-xs text-amber-600">
                CEP não encontrado — confira o número ou preencha manualmente.
              </p>
            )}
          </div>
          <div className="col-span-2">
            <Field
              name="enderecoLogradouro"
              label="Logradouro"
              defaultValue={endereco.logradouro || state.values.enderecoLogradouro}
              error={state.errors.enderecoLogradouro}
              key={endereco.logradouro}
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4">
          <Field
            name="enderecoNumero"
            label="Número"
            defaultValue={endereco.numero || state.values.enderecoNumero}
            error={state.errors.enderecoNumero}
            key={"numero-" + endereco.numero}
            required
          />
          <Field
            name="enderecoComplemento"
            label="Complemento"
            defaultValue={endereco.complemento || state.values.enderecoComplemento}
            error={state.errors.enderecoComplemento}
            key={"complemento-" + endereco.complemento}
          />
          <Field
            name="enderecoBairro"
            label="Bairro"
            defaultValue={endereco.bairro || state.values.enderecoBairro}
            error={state.errors.enderecoBairro}
            key={"bairro-" + endereco.bairro}
            required
          />
          <div>
            <label className={labelClass} htmlFor="enderecoUf">
              Estado <span className="text-red-500">*</span>
            </label>
            <select
              id="enderecoUf"
              name="enderecoUf"
              defaultValue={endereco.uf || state.values.enderecoUf || ""}
              key={"uf-" + endereco.uf}
              className={inputClass}
            >
              <option value="" disabled>
                UF
              </option>
              {UF_LIST.map((uf) => (
                <option key={uf} value={uf}>
                  {uf}
                </option>
              ))}
            </select>
            {state.errors.enderecoUf && (
              <p className={errorClass}>{state.errors.enderecoUf}</p>
            )}
          </div>
        </div>
        <Field
          name="enderecoCidade"
          label="Cidade"
          defaultValue={endereco.cidade || state.values.enderecoCidade}
          error={state.errors.enderecoCidade}
          key={"cidade-" + endereco.cidade}
          required
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-ink">Contato</h2>
        <div className="grid grid-cols-2 gap-4">
          <Field
            name="telefone"
            label="Telefone"
            defaultValue={identificacao.telefone || state.values.telefone}
            error={state.errors.telefone}
            placeholder="(11) 90000-0000"
            key={"telefone-" + identificacao.telefone}
            required
          />
          <Field
            name="email"
            label="E-mail"
            type="email"
            defaultValue={identificacao.email || state.values.email}
            error={state.errors.email}
            key={"email-" + identificacao.email}
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field
            name="responsavelNome"
            label="Responsável"
            defaultValue={state.values.responsavelNome}
            error={state.errors.responsavelNome}
          />
          <Field
            name="responsavelCpf"
            label="CPF do responsável"
            defaultValue={state.values.responsavelCpf}
            error={state.errors.responsavelCpf}
            placeholder="000.000.000-00"
          />
        </div>
      </section>

      <div className="flex justify-end gap-3 border-t border-line pt-6">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:brightness-110 disabled:opacity-50"
        >
          {pending ? "Salvando..." : "Salvar e continuar →"}
        </button>
      </div>
    </form>
  );
}
