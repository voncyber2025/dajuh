// Cardápio Digital – Da Juh Bolos e Doces
// Itens e preços do cardápio (PDF). Usado pela página do cliente, pelo sistema e pelo servidor.
// Para mudar um preço ou sabor, altere aqui (o servidor recalcula tudo com estes valores).

export const WHATSAPP_JULIANA = "5521983965412"; // 55 + DDD + número, só dígitos

export const CARDAPIO = {
  bolo: {
    tamanhos: [
      { id: "8", nome: "8 fatias", tradicional: 50 },
      { id: "15", nome: "15/18 fatias", tradicional: 120 },
      { id: "22", nome: "22/25 fatias", tradicional: 170 },
      { id: "28", nome: "28 fatias", tradicional: 190 },
      { id: "35", nome: "35 fatias", tradicional: 230 },
      { id: "40", nome: "40 fatias", tradicional: 265 },
      { id: "50", nome: "50 fatias", tradicional: 330 },
      { id: "60", nome: "60 fatias", tradicional: 398 },
      { id: "100", nome: "100 fatias", tradicional: 600 },
    ],
    recheiosTradicionais: ["Brigadeiro", "Ninho", "Beijinho de côco", "Doce de leite", "Amendoim", "Prestígio", "Doce de leite com côco", "Brigadeiro de morango", "Mousse de chocolate"],
    recheiosEspeciais: ["Ninho com nutella", "Ninho com geleia de morango", "Ninho com morango (fruta)", "Doce de leite com ameixa", "Brigadeiro com crocante", "Oreo", "Doce de leite com gotas de chocolate", "Côco queimado", "Brigadeiro com morango", "Brigadeiro de maracujá", "Torta de limão", "Creme belga com abacaxi"],
    massas: ["Branca", "Chocolate"],
  },
  doces: {
    tradicional: {
      nome: "Doces tradicionais",
      sabores: ["Brigadeiro", "Beijinho", "Ninho", "Casadinho", "Cajuzinho", "Queijo", "Amendoim", "Moranguinho", "2 amores (ninho/morango)"],
      pacotes: [{ qtd: 25, sabores: 1, preco: 35 }, { qtd: 50, sabores: 2, preco: 70 }, { qtd: 100, sabores: 4, preco: 140 }],
    },
    gourmet: {
      nome: "Doces gourmet",
      sabores: ["Brigadeiro ao leite", "Meio amargo", "Morango com nutella", "Ninho com nutella", "Ninho com morango", "Oreo", "Ferrero", "Churros com doce de leite", "Romeu e Julieta", "Côco queimado", "Côco especial", "Kit kat"],
      pacotes: [{ qtd: 25, sabores: 1, preco: 45 }, { qtd: 50, sabores: 2, preco: 90 }, { qtd: 100, sabores: 4, preco: 180 }],
    },
  },
  // Itens vendidos por unidade
  unidades: [
    { id: "brownie-dl", cat: "Brownie", nome: "Brownie de doce de leite", preco: 4.5 },
    { id: "brownie-brig", cat: "Brownie", nome: "Brownie de brigadeiro", preco: 4.5 },
    { id: "brownie-ninho", cat: "Brownie", nome: "Brownie de ninho", preco: 4.5 },
    { id: "brownie-nn", cat: "Brownie", nome: "Brownie de ninho com Nutella", preco: 5.5 },
    { id: "cup-p-brig", cat: "Cupcake", nome: "Cupcake pequeno – brigadeiro", preco: 3.5 },
    { id: "cup-p-dl", cat: "Cupcake", nome: "Cupcake pequeno – doce de leite", preco: 3.5 },
    { id: "cup-p-mor", cat: "Cupcake", nome: "Cupcake pequeno – morango", preco: 3.5 },
    { id: "cup-p-coco", cat: "Cupcake", nome: "Cupcake pequeno – côco", preco: 3.5 },
    { id: "cup-g-brig", cat: "Cupcake", nome: "Cupcake grande – brigadeiro", preco: 5 },
    { id: "cup-g-dl", cat: "Cupcake", nome: "Cupcake grande – doce de leite", preco: 5 },
    { id: "cup-g-mor", cat: "Cupcake", nome: "Cupcake grande – morango", preco: 5 },
    { id: "cup-g-coco", cat: "Cupcake", nome: "Cupcake grande – côco", preco: 5 },
    { id: "bc-dl", cat: "Bem casado", nome: "Bem casado de doce de leite (6x6cm)", preco: 5.5 },
    { id: "bc-churros", cat: "Bem casado", nome: "Bem casado de churros (6x6cm)", preco: 5.5 },
  ],
  kit: { nome: "Kit Festa", preco: 220, inclui: ["Bolo para 15 pessoas", "25 docinhos", "100 salgadinhos", "Vela de brinde"] },
  pagamentos: ["Pix", "Dinheiro", "Cartão de débito", "Cartão de crédito"],
  regras: ["Sinal de 50% do valor para confirmar a encomenda", "Cancelamento com 3 dias de antecedência"],
  retirada: "Rua Almirante Luiz Maria Piquet, 4 – Cordovil",
  obsRetirada: "Em caso de Uber/moto, o cliente deverá solicitar e compartilhar o código de segurança e a placa do veículo.",
};

export const STATUS_ENCOMENDA = {
  novo: "Novo",
  confirmado: "Confirmado",
  sinal: "Sinal pago",
  entregue: "Entregue",
  cancelado: "Cancelado",
};

const cTxt = (v, max = 120) => String(v ?? "").replace(/\s+/g, " ").trim().slice(0, max);
const arred = (v) => Math.round(v * 100) / 100;

// Recebe os itens escolhidos e devolve os itens com nome, detalhe, categoria e preço.
// Itens "a consultar" ficam com preco = null e consultar = true.
export function calcularPedido(brutos) {
  const C = CARDAPIO, itens = [];
  if (!Array.isArray(brutos) || !brutos.length) throw new Error("Escolha pelo menos um item do cardápio");
  if (brutos.length > 40) throw new Error("Pedido grande demais");
  for (const b of brutos) {
    if (b.tipo === "bolo" || b.tipo === "kit") {
      const rec = (b.recheios || []).map((r) => cTxt(r)).filter(Boolean);
      const validos = b.tipo === "kit" ? C.bolo.recheiosTradicionais : [...C.bolo.recheiosTradicionais, ...C.bolo.recheiosEspeciais];
      if (rec.length !== 2 || !rec.every((r) => validos.includes(r))) throw new Error(b.tipo === "kit" ? "Escolha 2 recheios tradicionais para o bolo do kit" : "Escolha 2 recheios para o bolo");
      if (!C.bolo.massas.includes(b.massa)) throw new Error("Escolha a massa do bolo");
      if (b.tipo === "kit") {
        if (!C.doces.tradicional.sabores.includes(b.docinho)) throw new Error("Escolha o sabor dos docinhos do kit");
        itens.push({ cat: "Kit Festa", nome: "Kit Festa", detalhe: `Bolo 15 pessoas (massa ${b.massa.toLowerCase()}; ${rec.join(" + ")}) · 25 docinhos de ${b.docinho.toLowerCase()} · 100 salgadinhos · vela de brinde`, qtd: 1, preco: C.kit.preco, consultar: false });
        continue;
      }
      const t = C.bolo.tamanhos.find((x) => x.id === String(b.tamanho));
      if (!t) throw new Error("Escolha o tamanho do bolo");
      const especial = rec.some((r) => C.bolo.recheiosEspeciais.includes(r));
      itens.push({ cat: "Bolo", nome: `Bolo ${t.nome}${especial ? " (sabor especial)" : ""}`, detalhe: `Massa ${b.massa.toLowerCase()} · ${rec.join(" + ")} · 3 camadas`, qtd: 1, preco: especial ? null : t.tradicional, consultar: especial });
    } else if (b.tipo === "doces") {
      const linha = C.doces[b.linha];
      if (!linha) throw new Error("Linha de doces inválida");
      const pac = linha.pacotes.find((p) => p.qtd === Number(b.pacote));
      if (!pac) throw new Error("Escolha a quantidade de doces");
      const sab = (b.sabores || []).map((s) => cTxt(s)).filter(Boolean);
      if (sab.length !== pac.sabores || !sab.every((s) => linha.sabores.includes(s)) || new Set(sab).size !== sab.length) throw new Error(`Escolha ${pac.sabores} sabor(es) diferentes para ${pac.qtd} ${linha.nome.toLowerCase()}`);
      itens.push({ cat: linha.nome, nome: `${pac.qtd} ${linha.nome.toLowerCase()}`, detalhe: sab.join(", "), qtd: 1, preco: pac.preco, consultar: false });
    } else if (b.tipo === "unid") {
      const u = C.unidades.find((x) => x.id === b.id);
      const q = Math.floor(Number(b.qtd));
      if (!u || !(q > 0) || q > 2000) throw new Error("Quantidade inválida");
      itens.push({ cat: u.cat, nome: u.nome, detalhe: "", qtd: q, preco: arred(u.preco * q), consultar: false });
    } else throw new Error("Item inválido");
  }
  const total = arred(itens.reduce((s, i) => s + (i.preco || 0), 0));
  return { itens, total, consultar: itens.some((i) => i.consultar) };
}

function hojeISO() {
  const d = new Date(Date.now() - 3 * 3600e3); // horário de Brasília
  return d.toISOString().slice(0, 10);
}

// Valida os dados do cliente + itens e devolve a encomenda pronta para guardar
export function montarEncomenda(p, origem) {
  const festa = String(p.festa || "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(festa)) throw new Error("Informe a data da festa");
  if (origem === "cliente" && festa < hojeISO()) throw new Error("A data da festa já passou");
  const nome = cTxt(p.nome, 80), telefone = cTxt(p.telefone, 30).replace(/[^\d()+\s-]/g, "");
  if (!nome) throw new Error("Informe o nome");
  if (telefone.replace(/\D/g, "").length < 10) throw new Error("Informe o telefone com DDD");
  const calc = calcularPedido(p.itens);
  return {
    festa, horario: cTxt(p.horario, 10), tema: cTxt(p.tema, 80), nome, telefone, bairro: cTxt(p.bairro, 60),
    pagamento: CARDAPIO.pagamentos.includes(p.pagamento) ? p.pagamento : "",
    obs: cTxt(p.obs, 500), itens: calc.itens, total: calc.total, consultar: calc.consultar,
  };
}

// Operações das encomendas (chamadas pelo servidor)
export function aplicarEncomenda(e, op) {
  e.encomendas = e.encomendas || [];
  const agora = new Date().toISOString();
  const achar = (id) => { const x = e.encomendas.find((k) => k.id === id); if (!x) throw new Error("Encomenda não encontrada"); return x; };
  switch (op.tipo) {
    case "novaEncomenda": {
      const origem = op.origem === "cliente" ? "cliente" : "sistema";
      const dados = montarEncomenda(op.pedido || {}, origem);
      const numero = (e.encomendas.reduce((m, k) => Math.max(m, k.numero || 0), 0) || 0) + 1;
      const nova = { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7), numero, criadoEm: agora, origem, ...dados, status: "novo", valorCombinado: null, sinalPago: null, nota: "", historico: [{ em: agora, txt: origem === "cliente" ? "Pedido feito pelo cliente no cardápio digital" : "Pedido lançado no sistema" }] };
      e.encomendas.push(nova);
      return nova;
    }
    case "statusEncomenda": {
      const k = achar(op.id);
      if (!STATUS_ENCOMENDA[op.status]) throw new Error("Situação inválida");
      k.status = op.status;
      if (op.status === "sinal" && op.sinal != null && !isNaN(Number(op.sinal))) k.sinalPago = arred(Number(op.sinal));
      k.historico.push({ em: agora, txt: "Situação: " + STATUS_ENCOMENDA[op.status] });
      break;
    }
    case "editarEncomenda": {
      const k = achar(op.id);
      if (op.valorCombinado !== undefined) {
        const v = op.valorCombinado === null || op.valorCombinado === "" ? null : Number(op.valorCombinado);
        if (v !== null && (isNaN(v) || v < 0)) throw new Error("Valor inválido");
        k.valorCombinado = v === null ? null : arred(v);
      }
      if (op.sinalPago !== undefined) {
        const v = op.sinalPago === null || op.sinalPago === "" ? null : Number(op.sinalPago);
        if (v !== null && (isNaN(v) || v < 0)) throw new Error("Valor do sinal inválido");
        k.sinalPago = v === null ? null : arred(v);
      }
      if (op.nota !== undefined) k.nota = cTxt(op.nota, 500);
      // Entrada (sinal): marcar como paga muda a etapa para "Sinal pago"; desmarcar volta para "Confirmado"
      if (op.entradaPaga === true) {
        if (!(k.sinalPago > 0)) throw new Error("Digite o valor da entrada");
        if (k.status === "novo" || k.status === "confirmado") k.status = "sinal";
      } else if (op.entradaPaga === false) {
        k.sinalPago = null;
        if (k.status === "sinal") k.status = op.status === "novo" ? "novo" : "confirmado";
      }
      if (op.festa !== undefined) { if (!/^\d{4}-\d{2}-\d{2}$/.test(op.festa)) throw new Error("Data inválida"); k.festa = op.festa; }
      if (op.horario !== undefined) k.horario = cTxt(op.horario, 10);
      k.historico.push({ em: agora, txt: "Encomenda atualizada" });
      break;
    }
    case "apagarEncomenda":
      e.encomendas = e.encomendas.filter((k) => k.id !== op.id);
      break;
    default:
      return undefined;
  }
  return true;
}
