# Estoque e Vendas – Da Juh Confeitaria

Sistema de estoque, vendas e caixa que funciona no celular e no computador. Os dados ficam salvos num banco de dados da Vercel, então o que você lança num aparelho aparece em todos.

## Arquivos

- `index.html` – a tela do sistema
- `api/estoque.js` – o "servidor" que lê e grava os dados
- `lib/regras.js` – as regras do sistema (vendas, caixa, folgas…)
- `lib/seed.js` – os 56 produtos do cardápio, carregados no primeiro acesso
- `package.json` – configuração do projeto

## Como publicar na Vercel (uma vez só)

1. **Suba os arquivos para o GitHub.** Crie um repositório novo e envie esta pasta inteira (pode arrastar os arquivos em "Add file → Upload files").
2. **Crie o projeto na Vercel.** Em vercel.com, clique em *Add New → Project*, escolha o repositório e clique em *Deploy*. Não precisa mudar nenhuma configuração.
3. **Ligue o banco de dados.** No projeto, abra a aba *Storage*, clique em *Create Database*, escolha **Upstash → Redis** (tem plano gratuito), crie e conecte ao projeto. A Vercel adiciona sozinha as chaves de acesso.
4. **Crie a senha.** Em *Settings → Environment Variables*, adicione:
   - Nome: `SENHA`
   - Valor: a senha que você quer usar para entrar no sistema
5. **Publique de novo.** Na aba *Deployments*, clique nos três pontinhos do último deploy → *Redeploy*. Pronto!

Abra o endereço do site (algo como `seu-projeto.vercel.app`), digite a senha e comece a usar.

**Dica:** no celular, abra o site e use "Adicionar à tela de início" para ele virar um ícone igual a um aplicativo.

## Como usar

- **Vendas:** abra o caixa informando o troco inicial. Toque nos produtos para montar a venda, escolha a forma de pagamento (Dinheiro, Pix, Débito, Crédito ou Outro) e confirme. No dinheiro, o sistema calcula o troco. Cada venda já dá baixa no estoque. No fim do dia, toque em **Fechar caixa** e informe quanto dinheiro tem na gaveta: o sistema mostra se sobrou ou faltou.
- **Folga:** com o caixa fechado, toque em "Hoje não vou abrir · marcar folga". Também dá para marcar qualquer dia pela aba Fechamento (visão Dia ou pelo calendário do mês).
- **Estoque:** veja tudo por categoria. **+** dá entrada de 1 unidade; **−** abre a saída com motivo.
- **Movimentar:** entradas (produção/compra), saídas com motivo (**Venda, Perda, Consumo, Outro**) e **Contagem**, mais o histórico.
- **Fechamento:** relatório do **dia, semana (segunda a domingo) ou mês**: vendas efetivadas e canceladas (com a lista de cada uma), faturamento e comparação com o período anterior, vendas por forma de pagamento e por categoria, mais vendidos, perdas, caixas do período e estoque por produto. No mês aparece um calendário com o faturamento de cada dia e as folgas. Dá para imprimir/salvar em PDF ou baixar para o Excel.
- **Produtos:** cadastre, edite ou exclua produtos, com preço, estoque inicial e estoque mínimo.

## Modo demonstração

Na tela de entrada, o botão **Ver demonstração** abre o sistema sem servidor, com os dados guardados só no aparelho. Serve para testar ou ajustar o visual antes de publicar.

## Para mudar o visual

No começo do `index.html` ficam as cores (`--vermelho`, `--rosa`, etc.). Os textos das telas ficam no meio do arquivo, cada aba marcada com um comentário `ABA VENDAS`, `ABA ESTOQUE`, etc. Se mudar alguma regra (bloco REGRAS dentro do `index.html`), faça a mesma mudança em `lib/regras.js`, que é o que o servidor usa.

## Observações

- Quem não tiver a senha não consegue ver nem alterar nada.
- O sistema se atualiza sozinho a cada 30 segundos e sempre que você volta para a tela, para mostrar o que foi lançado em outro aparelho.
- O preço do **Caseirinho** está vazio. Preencha em *Produtos*.
