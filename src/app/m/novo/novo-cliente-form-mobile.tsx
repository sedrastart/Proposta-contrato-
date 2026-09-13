"use client";

import { useActionState, useState, useTransition } from "react";
import {
  criarClienteMobileAction,
  buscarCepAction,
  buscarCnpjAction,
  type CriarClienteState,
} from "../../clientes/actions";
import { UF_LIST, onlyDigits } from "@/lib/validation";
import { campoClass, rotuloClass, erroClass, BarraAcaoFixa, BotaoPrimario } from "../mobile-ui";

const initialState: CriarClienteState = { errors: {}, values: {} };

function Campo({
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
      <label className={rotuloClass} htmlFor={name}>
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        className={campoClass}
        {...rest}
      />
      {error && <p className={erroClass}>{error}</p>}
    </div>
  );
}

export function NovoClienteFormMobile() {
  const [state, formAction, pending] = useActionState(
    criarClienteMobileAction,
    initialState
  );
  const [tipoPessoa, setTipoPessoa] = useState(state.values.tipoPessoa || "PJ");
  const [mostrarExtras, setMostrarExtras] = useState(false);
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
  const [cepStatus, setCepStatus] = useState<"idle" | "loading" | "found" | "not-found">(
    "idle"
  );
  const [isCepPending, startCepTransition] = useTransition();
  const [cnpjStatus, setCnpjStatus] = useState<"idle" | "loading" | "found" | "not-found">(
    "idle"
  );
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
    <form action={formAction} className="space-y-6">
      <div>
        <label className={rotuloClass}>Tipo</label>
        <div className="grid grid-cols-2 gap-2">
          {(["PJ", "PF"] as const).map((tipo) => (
            <label
              key={tipo}
              className={`cursor-pointer rounded-lg border px-3 py-3 text-center text-sm font-medium ${
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
              {tipo === "PJ" ? "Empresa" : "Pessoa física"}
            </label>
          ))}
        </div>
      </div>

      <div>
        <Campo
          name="cpfCnpj"
          label={tipoPessoa === "PJ" ? "CNPJ" : "CPF"}
          defaultValue={state.values.cpfCnpj}
          error={state.errors.cpfCnpj}
          placeholder={tipoPessoa === "PJ" ? "00.000.000/0000-00" : "000.000.000-00"}
          inputMode="numeric"
          onBlur={handleCnpjBlur}
          required
        />
        {tipoPessoa === "PJ" && isCnpjPending && (
          <p className="mt-1 text-xs text-ink-muted">Consultando CNPJ...</p>
        )}
        {tipoPessoa === "PJ" && cnpjStatus === "not-found" && !isCnpjPending && (
          <p className="mt-1 text-xs text-amber-600">
            CNPJ não encontrado — confira o número ou preencha manualmente abaixo.
          </p>
        )}
        {tipoPessoa === "PJ" && cnpjStatus === "found" && !isCnpjPending && (
          <p className="mt-1 text-xs text-emerald-600">
            Dados preenchidos automaticamente.
            {situacaoCadastral && situacaoCadastral !== "ATIVA" && (
              <span className="ml-1 text-amber-600">
                Situação cadastral: {situacaoCadastral}.
              </span>
            )}
          </p>
        )}
      </div>

      <Campo
        name="razaoSocial"
        label={tipoPessoa === "PJ" ? "Razão Social" : "Nome completo"}
        defaultValue={identificacao.razaoSocial}
        error={state.errors.razaoSocial}
        key={"razaoSocial-" + identificacao.razaoSocial}
        required
      />

      <div className="space-y-4 rounded-lg border border-line bg-white p-4">
        <p className="text-xs uppercase tracking-wide text-ink-muted">Endereço</p>
        <div>
          <Campo
            name="enderecoCep"
            label="CEP"
            defaultValue={endereco.cep || state.values.enderecoCep}
            error={state.errors.enderecoCep}
            placeholder="00000-000"
            inputMode="numeric"
            onBlur={handleCepBlur}
            key={"cep-" + endereco.cep}
            required
          />
          {isCepPending && <p className="mt-1 text-xs text-ink-muted">Buscando endereço...</p>}
          {cepStatus === "not-found" && !isCepPending && (
            <p className="mt-1 text-xs text-amber-600">
              CEP não encontrado — preencha o endereço manualmente.
            </p>
          )}
        </div>
        <Campo
          name="enderecoLogradouro"
          label="Logradouro"
          defaultValue={endereco.logradouro || state.values.enderecoLogradouro}
          error={state.errors.enderecoLogradouro}
          key={"logradouro-" + endereco.logradouro}
          required
        />
        <div className="grid grid-cols-2 gap-3">
          <Campo
            name="enderecoNumero"
            label="Número"
            defaultValue={endereco.numero || state.values.enderecoNumero}
            error={state.errors.enderecoNumero}
            key={"numero-" + endereco.numero}
            required
          />
          <Campo
            name="enderecoComplemento"
            label="Complemento"
            defaultValue={endereco.complemento || state.values.enderecoComplemento}
            error={state.errors.enderecoComplemento}
            key={"complemento-" + endereco.complemento}
          />
        </div>
        <Campo
          name="enderecoBairro"
          label="Bairro"
          defaultValue={endereco.bairro || state.values.enderecoBairro}
          error={state.errors.enderecoBairro}
          key={"bairro-" + endereco.bairro}
          required
        />
        <div className="grid grid-cols-2 gap-3">
          <Campo
            name="enderecoCidade"
            label="Cidade"
            defaultValue={endereco.cidade || state.values.enderecoCidade}
            error={state.errors.enderecoCidade}
            key={"cidade-" + endereco.cidade}
            required
          />
          <div>
            <label className={rotuloClass} htmlFor="enderecoUf">
              Estado <span className="text-red-500">*</span>
            </label>
            <select
              id="enderecoUf"
              name="enderecoUf"
              defaultValue={endereco.uf || state.values.enderecoUf || ""}
              key={"uf-" + endereco.uf}
              className={campoClass}
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
            {state.errors.enderecoUf && <p className={erroClass}>{state.errors.enderecoUf}</p>}
          </div>
        </div>
      </div>

      <Campo
        name="telefone"
        label="Telefone"
        defaultValue={identificacao.telefone || state.values.telefone}
        error={state.errors.telefone}
        placeholder="(11) 90000-0000"
        inputMode="tel"
        key={"telefone-" + identificacao.telefone}
        required
      />
      <Campo
        name="email"
        label="E-mail"
        type="email"
        defaultValue={identificacao.email || state.values.email}
        error={state.errors.email}
        inputMode="email"
        key={"email-" + identificacao.email}
        required
      />

      <div>
        <button
          type="button"
          onClick={() => setMostrarExtras((v) => !v)}
          className="text-sm text-ink-muted hover:underline"
        >
          {mostrarExtras ? "− Ocultar campos opcionais" : "+ Mais campos (opcional)"}
        </button>
        {mostrarExtras && (
          <div className="mt-3 space-y-4">
            <Campo
              name="nomeFantasia"
              label="Nome Fantasia"
              defaultValue={identificacao.nomeFantasia}
              error={state.errors.nomeFantasia}
              key={"nomeFantasia-" + identificacao.nomeFantasia}
            />
            <Campo
              name="inscricaoEstadual"
              label="Inscrição Estadual"
              defaultValue={state.values.inscricaoEstadual}
              error={state.errors.inscricaoEstadual}
            />
            <Campo
              name="responsavelNome"
              label="Responsável"
              defaultValue={state.values.responsavelNome}
              error={state.errors.responsavelNome}
            />
            <Campo
              name="responsavelCpf"
              label="CPF do responsável"
              defaultValue={state.values.responsavelCpf}
              error={state.errors.responsavelCpf}
              placeholder="000.000.000-00"
              inputMode="numeric"
            />
          </div>
        )}
      </div>

      <BarraAcaoFixa>
        <BotaoPrimario disabled={pending}>
          {pending ? "Salvando..." : "Salvar e continuar →"}
        </BotaoPrimario>
      </BarraAcaoFixa>
    </form>
  );
}
