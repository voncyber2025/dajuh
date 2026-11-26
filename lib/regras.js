// Regras do sistema – usadas pela API (servidor) e pelo modo demonstração (index.html).
// Se alterar aqui, copie a mesma alteração para o bloco "REGRAS" dentro do index.html.

export const PAGAMENTOS = { dinheiro: "Dinheiro", pix: "Pix", debito: "Débito", credito: "Crédito", outro: "Outro" };
export const MOTIVOS = { venda: "Venda", perda: "Perda", consumo: "Consumo", outro: "Outro" };

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const num = (v) => (v === "" || v === null || v === undefined || isNaN(Number(v)) ? null : Number(v));
const r2 = (v) => Math.round(v * 100) / 100;

export function estadoInicial(produtos) {
  return { produtos: JSON.parse(JSON.stringify(produtos)), movs: [], vendas: [], caixas: [], folgas: [] };
}

export function normalizar(e) {
  e.produtos = e.produtos || [];
  e.movs = e.movs || [];
  e.vendas = e.vendas || [];
  e.caixas = e.caixas || [];
  e.folgas = e.folgas || [];
  return e;
}

export function caixaAberto(e) {
  return (e.caixas || []).find((c) => !c.fechado) || null;
}

export function aplicar(e, op) {
  normalizar(e);
  const agora = new Date().toISOString();
  const prod = (id) => e.produtos.find((p) => p.id === id);

  switch (op.tipo) {
    case "mov": {
      const p = prod(op.prodId);
      if (!p) throw new Error("Produto não encontrado");
      if (!["entrada", "saida", "ajuste"].includes(op.movimento)) throw new Error("Movimento inválido");
      const q = num(op.qtd);
      if (q === null || q < 0 || (op.movimento !== "ajuste" && q === 0)) throw new Error("Quantidade inválida");
      const m = { id: uid(), prodId: p.id, movimento: op.movimento, qtd: q, obs: String(op.obs || "").slice(0, 200), data: op.data || agora };
      if (op.movimento === "saida") {
        m.motivo = MOTIVOS[op.motivo] ? op.motivo : "venda";
        m.preco = p.preco; // guarda o preço do dia
      }
      e.movs.push(m);
      break;
    }
    case "apagarMov":
      e.movs = e.movs.filter((m) => m.id !== op.id);
      break;

    case "salvarProduto": {
      const p = op.produto || {};
      const nome = String(p.nome || "").trim();
      const cat = String(p.cat || "").trim();
      if (!nome || !cat) throw new Error("Informe categoria e produto");
      const dados = { cat, nome, preco: num(p.preco), inicial: num(p.inicial) ?? 0, min: num(p.min) };
      const i = e.produtos.findIndex((x) => x.id === p.id);
      if (i >= 0) e.produtos[i] = { ...e.produtos[i], ...dados };
      else e.produtos.push({ id: uid(), ...dados });
      break;
    }
    case "apagarProduto":
      e.produtos = e.produtos.filter((p) => p.id !== op.id);
      e.movs = e.movs.filter((m) => m.prodId !== op.id);
      break;

    case "abrirCaixa": {
      if (caixaAberto(e)) throw new Error("Já existe um caixa aberto");
      e.caixas.push({ id: uid(), aberto: agora, abertura: r2(num(op.valor) || 0), obsAbertura: String(op.obs || "").slice(0, 200), fechado: null, esperado: null, contado: null, obsFechamento: "" });
      break;
    }
    case "fecharCaixa": {
      const c = caixaAberto(e);
      if (!c) throw new Error("Nenhum caixa aberto");
      const dinheiro = e.vendas.filter((v) => v.caixaId === c.id && !v.cancelada && v.pagamento === "dinheiro").reduce((s, v) => s + v.total, 0);
      c.fechado = agora;
      c.esperado = r2(c.abertura + dinheiro);
      c.contado = num(op.contado) === null ? null : r2(num(op.contado));
      c.obsFechamento = String(op.obs || "").slice(0, 200);
      break;
    }

    case "venda": {
      const c = caixaAberto(e);
      if (!c) throw new Error("Abra o caixa antes de vender");
      if (!PAGAMENTOS[op.pagamento]) throw new Error("Escolha a forma de pagamento");
      const itens = (op.itens || []).map((it) => {
        const p = prod(it.prodId);
        if (!p) throw new Error("Produto não encontrado");
        const qtd = num(it.qtd);
        if (!qtd || qtd <= 0) throw new Error("Quantidade inválida");
        const preco = num(it.preco) ?? p.preco;
        if (preco === null || preco < 0) throw new Error(`Informe o preço de ${p.nome}`);
        return { prodId: p.id, nome: p.nome, cat: p.cat, qtd, preco: r2(preco) };
      });
      if (!itens.length) throw new Error("Adicione pelo menos um produto");
      const subtotal = r2(itens.reduce((s, i) => s + i.qtd * i.preco, 0));
      const desconto = r2(Math.min(Math.max(num(op.desconto) || 0, 0), subtotal));
      const total = r2(subtotal - desconto);
      let recebido = null, troco = null;
      if (op.pagamento === "dinheiro") {
        recebido = num(op.recebido) === null ? total : r2(num(op.recebido));
        if (recebido < total) throw new Error("Valor recebido menor que o total");
        troco = r2(recebido - total);
      }
      e.vendas.push({ id: uid(), data: agora, caixaId: c.id, itens, subtotal, desconto, total, pagamento: op.pagamento, recebido, troco, obs: String(op.obs || "").slice(0, 200), cancelada: false });
      break;
    }
    case "cancelarVenda": {
      const v = e.vendas.find((x) => x.id === op.id);
      if (!v) throw new Error("Venda não encontrada");
      const c = e.caixas.find((x) => x.id === v.caixaId);
      if (c && c.fechado) throw new Error("Essa venda é de um caixa já fechado");
      v.cancelada = true;
      v.canceladaEm = agora;
      break;
    }
    case "restaurar": {
      const n = op.estado || {};
      if (!Array.isArray(n.produtos) || !Array.isArray(n.vendas) || !Array.isArray(n.movs) || !Array.isArray(n.caixas)) throw new Error("Arquivo de cópia inválido");
      e.produtos = n.produtos; e.movs = n.movs; e.vendas = n.vendas; e.caixas = n.caixas; e.folgas = Array.isArray(n.folgas) ? n.folgas : [];
      break;
    }
    case "marcarFolga": {
      const dia = String(op.data || "");
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dia)) throw new Error("Data inválida");
      if (!e.folgas.some((f) => f.data === dia)) e.folgas.push({ data: dia, obs: String(op.obs || "").slice(0, 200) });
      break;
    }
    case "desmarcarFolga":
      e.folgas = e.folgas.filter((f) => f.data !== op.data);
      break;

    default:
      throw new Error("Operação desconhecida");
  }
  return e;
}
