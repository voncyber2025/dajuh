// API do sistema (estoque, vendas, caixa, encomendas) – Da Juh Confeitaria
// Protegida pela senha (variável SENHA na Vercel).
import { aplicar } from "../lib/regras.js";
import { aplicarEncomenda } from "../lib/cardapio.js";
import { carregar, alterar, erroConfig } from "../lib/db.js";

const SENHA = process.env.SENHA;

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  const erro = erroConfig();
  if (erro) return res.status(500).json({ erro });
  if (!SENHA) return res.status(500).json({ erro: "Configure a variável SENHA na Vercel." });
  if (req.headers["x-senha"] !== SENHA) return res.status(401).json({ erro: "Senha incorreta" });

  try {
    if (req.method === "GET") {
      const { estado, versao } = await carregar();
      return res.status(200).json({ estado, versao });
    }
    if (req.method === "POST") {
      const op = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      const { estado, versao } = await alterar((e) => {
        if (aplicarEncomenda(e, { ...op, origem: "sistema" }) === undefined) aplicar(e, op);
      });
      return res.status(200).json({ estado, versao });
    }
    return res.status(405).json({ erro: "Método não permitido" });
  } catch (err) {
    return res.status(err.status || 400).json({ erro: err.message });
  }
}
