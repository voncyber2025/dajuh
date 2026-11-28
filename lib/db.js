// Acesso ao banco Redis (Upstash) – usado pelas APIs do sistema e do cardápio digital
import { PRODUTOS_INICIAIS } from "./seed.js";
import { estadoInicial, normalizar } from "./regras.js";

const KEY = "dajuh:estoque";
const KEY_VER = "dajuh:estoque:versao";

// Procura as chaves do banco com qualquer prefixo (KV_, STORAGE_, UPSTASH_REDIS_...)
function acharVar(...finais) {
  for (const fim of finais) {
    const nome = Object.keys(process.env).find((k) => k.endsWith(fim) && process.env[k]);
    if (nome) return process.env[nome];
  }
  return undefined;
}
export const REDIS_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || acharVar("_REST_API_URL", "_REDIS_REST_URL", "_REST_URL");
export const REDIS_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || acharVar("_REST_API_TOKEN", "_REDIS_REST_TOKEN", "_REST_TOKEN");

export async function redis(cmd) {
  const r = await fetch(REDIS_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${REDIS_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(cmd),
  });
  const j = await r.json();
  if (j.error) throw new Error(j.error);
  return j.result;
}

export async function carregar() {
  const [raw, ver] = await Promise.all([redis(["GET", KEY]), redis(["GET", KEY_VER])]);
  return { estado: raw ? normalizar(JSON.parse(raw)) : estadoInicial(PRODUTOS_INICIAIS), versao: ver || "0" };
}

// Grava só se ninguém gravou no meio do caminho (evita perder dados com 2 aparelhos ao mesmo tempo)
const LUA = `
local atual = redis.call('GET', KEYS[2]) or '0'
if atual == ARGV[1] then
  redis.call('SET', KEYS[1], ARGV[2])
  redis.call('SET', KEYS[2], ARGV[3])
  return 1
end
return 0`;

export async function gravar(estado, versaoAnterior) {
  const nova = String(Number(versaoAnterior) + 1);
  const ok = await redis(["EVAL", LUA, "2", KEY, KEY_VER, versaoAnterior, JSON.stringify(estado), nova]);
  return ok === 1 ? nova : null;
}

// Faltando configuração do banco: devolve a mensagem de erro (só os NOMES das variáveis, nunca os valores)
export function erroConfig() {
  if (REDIS_URL && REDIS_TOKEN) return null;
  const nomes = Object.keys(process.env).filter((k) => /KV|REDIS|UPSTASH|STORAGE|SENHA/i.test(k)).sort();
  return "Banco de dados não configurado na Vercel (Upstash Redis). Variáveis encontradas: " + (nomes.join(", ") || "nenhuma") + ". Se você acabou de conectar o banco, faça o Redeploy.";
}

// Aplica uma alteração e grava, repetindo se outro aparelho gravou ao mesmo tempo
export async function alterar(fn) {
  for (let tentativa = 0; tentativa < 5; tentativa++) {
    const { estado, versao } = await carregar();
    const resultado = fn(estado);
    const v = await gravar(estado, versao);
    if (v) return { estado, versao: v, resultado };
  }
  const e = new Error("Muitas alterações ao mesmo tempo. Tente de novo."); e.status = 409; throw e;
}
