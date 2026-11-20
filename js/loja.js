// separadores e upgrades da loja

// ================= ajudas =================

const nivel = upgrade => state.comprados[upgrade.id] || 0;
const custo = upgrade => Math.floor(upgrade.base * Math.pow(upgrade.cresc, nivel(upgrade)));

// ================= separadores =================

function desenharAbas() {
  porId("abas").innerHTML = "";
  
  abas.forEach((nomeAba, indiceAba) => {
    const botao = document.createElement("button");
    botao.textContent = nomeAba;
    botao.className = indiceAba === abaAtual ? "ativo" : "";
    
    botao.onclick = () => { 
      abaAtual = indiceAba; 
      desenharAbas(); // redesenha para mudar qual botao esta "ativo"

      // a ordem dos ifs tem de bater certo com a lista "abas" em dados.js
      if (indiceAba === 0) desenharLoja();
      else if (indiceAba === 1) desenharPers();
      else if (indiceAba === 2) desenharBangboos();
      else if (indiceAba === 3) desenharConquistas(porId("loja"));
      else porId("loja").textContent = abas[abaAtual] + ": ainda por fazer";
    };

    porId("abas").appendChild(botao);
  });
}

// ================= upgrades =================

// cria uma linha da loja: texto a esquerda e botao de comprar a direita
function linhaLoja(idBotao, titulo, descricao, textoCusto, aoComprar) {
  const linha = document.createElement("div");
  linha.className = "item";
  linha.innerHTML = "<span>" + titulo + "<small>" + descricao + "</small></span>";
  
  const botao = document.createElement("button");
  botao.id = idBotao;
  botao.textContent = textoCusto;
  botao.onclick = aoComprar;
  linha.appendChild(botao);
  porId("loja").appendChild(linha);
}

function desenharLoja() {
  porId("loja").innerHTML = "";

  // enquanto o idle nao for comprado, so aparece esta opcao
  if (!state.idleDesbloqueado) {
    linhaLoja("up-desbloqueio", "comprar idle", "desbloqueia a parte da esquerda", formatarNumero(CUSTO_IDLE), () => {
      if (state.dinheiro < CUSTO_IDLE) return;

      state.dinheiro -= CUSTO_IDLE;
      state.idleDesbloqueado = true;
      state.idleBase = 1;
      atualizarIdle();
      desenharLoja();
    });
  }

  upgrades.forEach(upgrade => {
    // os upgrades de idle so aparecem depois de comprar o idle
    if (upgrade.idle && !state.idleDesbloqueado) return;

    const noMaximo = upgrade.max && nivel(upgrade) >= upgrade.max;
    const titulo = upgrade.nome + " (" + nivel(upgrade) + (upgrade.max ? "/" + upgrade.max : "") + ")";
    
    linhaLoja("up-" + upgrade.id, titulo, upgrade.desc, noMaximo ? "max" : formatarNumero(custo(upgrade)), () => {
      if (noMaximo || state.dinheiro < custo(upgrade)) return;

      state.dinheiro -= custo(upgrade);
      state.comprados[upgrade.id] = nivel(upgrade) + 1;
      upgrade.efeito(state); // aplica o efeito do upgrade ao estado
      atualizarIdle();
      desenharLoja();
    });
  });

  atualizarLoja();
}

// ativa/desativa os botoes conforme o dinheiro (chamado em cada frame pelo loop)
// so mexe no "disabled", nao redesenha, senao os cliques nos botoes falhavam
function atualizarLoja() {
  if (abaAtual !== 0) return;

  const botaoIdle = porId("up-desbloqueio");
  if (botaoIdle) botaoIdle.disabled = state.dinheiro < CUSTO_IDLE;

  upgrades.forEach(upgrade => {
    const botao = porId("up-" + upgrade.id);
    if (botao) botao.disabled = (upgrade.max && nivel(upgrade) >= upgrade.max) || state.dinheiro < custo(upgrade);
  });
}

// ================= personagens =================

// uma linha por personagem desbloqueado, clicar nela equipa-o
function linhaPers(personagem) {
  const linha = document.createElement("div");
  linha.className = "item";

  const imagem = document.createElement("img");
  imagem.src = personagem.img;

  const botao = document.createElement("button");
  botao.onclick = () => {
    setPersonagemAtual(personagem.id);
    idleDamageEnemies();
  }

  linha.appendChild(imagem);
  linha.appendChild(botao);
  porId("loja").appendChild(linha);
}

function desenharPers() {
  porId("loja").innerHTML = "";

  // banner do gamble
  const banner = document.createElement("div");
  banner.className = "item";
  banner.innerHTML = "<span>" + "Banner" + "<small>" + "Try your luck :)" + "</small></span>";

  const botaoGamble = document.createElement("button");
  botaoGamble.className = "personagemGablingButton";
  botaoGamble.onclick = () => {
    if (state.premium < CUSTO_GAMBLE) return;

    state.premium -= CUSTO_GAMBLE;
    rollPers();
    desenharPers();
  };

  banner.appendChild(botaoGamble);
  porId("loja").appendChild(banner);

  // lista dos personagens que ja tens
  state.personagensDesbloqueados.forEach(id => {
    const personagem = personagens.find(item => item.id === id);
    if (personagem) linhaPers(personagem);
  });
}

// ================= bangboos =================

// uma linha por bangboo desbloqueado, clicar nela equipa-o
function linhaBangboo(bangboo) { 
  const linha = document.createElement("div");
  linha.className = "item";

  const imagem = document.createElement("img");
  imagem.src = bangboo.img;

  const botao = document.createElement("button");
  botao.onclick = () => {
    setBangbooAtual(bangboo.id);
    idleDamageEnemies(); // reinicia o ataque porque o bangboo pode mudar a velocidade
  };

  linha.appendChild(imagem);
  linha.appendChild(botao);
  porId("loja").appendChild(linha);
}

function desenharBangboos() {
  porId("loja").innerHTML = "";

  // banner do gamble
  const banner = document.createElement("div");
  banner.className = "item";
  banner.innerHTML = "<span>" + "Banner" + "<small>" + "Try your luck :)" + "</small></span>";

  const botaoGamble = document.createElement("button");
  botaoGamble.className = "bangbooGablingButton";

  botaoGamble.onclick = () => {
    if (state.premium < CUSTO_GAMBLE) return;

    state.premium -= CUSTO_GAMBLE;
    rollBangboo();
    desenharBangboos();
  }

  banner.appendChild(botaoGamble);
  porId("loja").appendChild(banner);

  // lista dos bangboos que ja tens
  state.bangboosDesbloqueados.forEach(id => {
    const bangboo = bangboos.find(item => item.id === id);
    if (bangboo) linhaBangboo(bangboo);
  });
}

// ================= conquistas =================

function desenharConquistas(container) {
  const totalConquistas = conquistas.length;
  const totalFeitas = conquistas.filter(conquista => state.conquistas.includes(conquista.id)).length;
  const grupos = [...new Set(conquistas.map(conquista => conquista.grupo))];

  // barra de progresso geral no topo
  const topo = `
    <div class="conq-topo">
      <div class="conq-topo-texto"><strong>Conquistas</strong><span>${totalFeitas}/${totalConquistas}</span></div>
      <div class="conq-barra"><div style="width:${totalFeitas / totalConquistas * 100}%"></div></div>
    </div>`;

  // um bloco por grupo, com uma caixa a frente de cada conquista (preenchida se ja foi obtida)
  const corpo = grupos.map(grupo => {
    const conquistasDoGrupo = conquistas.filter(conquista => conquista.grupo === grupo);
    const feitasNoGrupo = conquistasDoGrupo.filter(conquista => state.conquistas.includes(conquista.id)).length;

    const linhas = conquistasDoGrupo.map(conquista => {
      const foiObtida = state.conquistas.includes(conquista.id);
      return `
        <div class="conq ${foiObtida ? "feita" : ""}">
          <span class="conq-caixa"></span>
          <span class="conq-nome">${conquista.nome}</span>
          <span class="conq-premio">+${conquista.premio} premium</span>
        </div>`;
    }).join("");
    
    return `
      <section class="conq-grupo">
        <h3><span>${grupo}</span><small>${feitasNoGrupo}/${conquistasDoGrupo.length}</small></h3>
        ${linhas}
      </section>`;
  }).join("");

  container.innerHTML = topo + corpo;
}