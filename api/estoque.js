// API do controle de estoque – Da Juh Confeitaria
// Guarda tudo num banco Redis (Upstash) ligado ao projeto na Vercel.
import { PRODUTOS_INICIAIS } from "../lib/seed.js";
import { aplicar, estadoInicial, normalizar } from "../lib/regras.js";

const KEY = "dajuh:estoque";
const KEY_VER = "dajuh:estoque:versao";

const REDIS_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const SENHA = process.env.SENHA;

async function redis(cmd) {
  const r = await fetch(REDIS_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${REDIS_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(cmd),
  });
  const j = await r.json();
  if (j.error) throw new Error(j.error);
  return j.result;
}

async function carregar() {
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

async function gravar(estado, versaoAnterior) {
  const nova = String(Number(versaoAnterior) + 1);
  const ok = await redis(["EVAL", LUA, "2", KEY, KEY_VER, versaoAnterior, JSON.stringify(estado), nova]);
  return ok === 1 ? nova : null;
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (!REDIS_URL || !REDIS_TOKEN) return res.status(500).json({ erro: "Banco de dados não configurado na Vercel (Upstash Redis)." });
  if (!SENHA) return res.status(500).json({ erro: "Configure a variável SENHA na Vercel." });
  if (req.headers["x-senha"] !== SENHA) return res.status(401).json({ erro: "Senha incorreta" });

  try {
    if (req.method === "GET") {
      const { estado, versao } = await carregar();
      return res.status(200).json({ estado, versao });
    }
    if (req.method === "POST") {
      const op = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      for (let tentativa = 0; tentativa < 5; tentativa++) {
        const { estado, versao } = await carregar();
        const novo = aplicar(estado, op);
        const v = await gravar(novo, versao);
        if (v) return res.status(200).json({ estado: novo, versao: v });
      }
      return res.status(409).json({ erro: "Muitas alterações ao mesmo tempo. Tente de novo." });
    }
    return res.status(405).json({ erro: "Método não permitido" });
  } catch (err) {
    return res.status(400).json({ erro: err.message });
  }
}
