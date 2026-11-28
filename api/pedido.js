// API pública do Cardápio Digital: o cliente envia o pedido (sem senha).
// Só aceita CRIAR encomendas novas; não lê nem altera mais nada do sistema.
import { aplicarEncomenda } from "../lib/cardapio.js";
import { alterar, erroConfig } from "../lib/db.js";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ erro: "Método não permitido" });
  const erro = erroConfig();
  if (erro) return res.status(500).json({ erro: "Cardápio indisponível no momento. Chame a Juliana no WhatsApp." });
  try {
    const corpo = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    if (JSON.stringify(corpo).length > 20000) return res.status(413).json({ erro: "Pedido grande demais" });
    if (corpo.site) return res.status(200).json({ ok: true }); // campo invisível: robôs de spam preenchem
    const { resultado } = await alterar((e) => {
      // limite simples contra abuso: no máximo 30 pedidos de clientes por hora
      const umaHora = Date.now() - 3600e3;
      const recentes = (e.encomendas || []).filter((k) => k.origem === "cliente" && Date.parse(k.criadoEm) > umaHora).length;
      if (recentes >= 30) { const x = new Error("Muitos pedidos agora. Tente daqui a pouco ou chame no WhatsApp."); x.status = 429; throw x; }
      return aplicarEncomenda(e, { tipo: "novaEncomenda", origem: "cliente", pedido: corpo.pedido });
    });
    const k = resultado;
    return res.status(200).json({ ok: true, numero: k.numero, encomenda: { numero: k.numero, festa: k.festa, horario: k.horario, tema: k.tema, nome: k.nome, telefone: k.telefone, bairro: k.bairro, pagamento: k.pagamento, obs: k.obs, itens: k.itens, total: k.total, consultar: k.consultar } });
  } catch (err) {
    return res.status(err.status || 400).json({ erro: err.message });
  }
}
