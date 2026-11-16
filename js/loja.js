// separadores e upgrades da loja
const nivel = u => state.comprados[u.id] || 0;
const custo = u => Math.floor(u.base * Math.pow(u.cresc, nivel(u)));

function desenharAbas() {
  $("abas").innerHTML = "";
  abas.forEach((nome, i) => {
    const b = document.createElement("button");
    b.textContent = nome;
    b.className = i === abaAtual ? "ativo" : "";
    b.onclick = () => { 
      abaAtual = i; 
      desenharAbas(); 
      if (i === 0) desenharLoja();
      else if (i === 1) desenharBangboos();
      else if (i === 2) desenharPers();
      else $("loja").textContent = abas[abaAtual] + ": ainda por fazer";
    };
    $("abas").appendChild(b);
  });
}

function linhaLoja(id, titulo, desc, custoTexto, aoComprar) {
  const d = document.createElement("div");
  d.className = "item";
  d.innerHTML = "<span>" + titulo + "<small>" + desc + "</small></span>";
  
  const b = document.createElement("button");
  b.id = id;
  b.textContent = custoTexto;
  b.onclick = aoComprar;
  d.appendChild(b);
  $("loja").appendChild(d);
}

function desenharLoja() {
  $("loja").innerHTML = "";

  // enquanto o idle nao for comprado, so aparece esta opcao
  if (!state.idleDesbloqueado) {
    linhaLoja("up-desbloqueio", "comprar idle", "desbloqueia a parte da esquerda", fmt(CUSTO_IDLE), () => {
      if (state.dinheiro < CUSTO_IDLE) return;
      state.dinheiro -= CUSTO_IDLE;
      state.idleDesbloqueado = true;
      state.idleBase = 1;
      atualizarIdle();
      desenharLoja();
    });
  }

  upgrades.forEach(u => {
    if (u.idle && !state.idleDesbloqueado) return;

    const maxed = u.max && nivel(u) >= u.max;
    const titulo = u.nome + " (" + nivel(u) + (u.max ? "/" + u.max : "") + ")";
    
    linhaLoja("up-" + u.id, titulo, u.desc, maxed ? "max" : fmt(custo(u)), () => {
      if (maxed || state.dinheiro < custo(u)) return;
      state.dinheiro -= custo(u);
      state.comprados[u.id] = nivel(u) + 1;
      u.efeito(state);
      atualizarIdle();
      desenharLoja();
    });
  });

  atualizarLoja();
}

function linhaPers(personagem) {
  const div = document.createElement("div");
  div.className = "item";

  const img = document.createElement("img");
  img.src = personagem.img;

  const btn = document.createElement("button");
  btn.onclick = () => {
    setPersonagemAtual(personagem.id);
    idleDamageEnemies();
  }

  div.appendChild(img);
  div.appendChild(btn);
  $("loja").appendChild(div);
}

function desenharPers() {
  $("loja").innerHTML = "";

  const div = document.createElement("div");
  div.className = "item";
  div.innerHTML = "<span>" + "Banner" + "<small>" + "Try your luck :)" + "</small></span>";
  const button = document.createElement("button");
  button.className = "personagemGablingButton";

  button.onclick = () => {
    if (state.premium >= 10) {
      state.premium -= 10;
      rollPers();
      desenharPers();
    }
  }

  div.appendChild(button);
  $("loja").appendChild(div);

  state.personagensDesbloqueados.forEach(id => {
    const personagem = personagens.find(p => p.id === id);
    if (personagem) {
      linhaPers(personagem);
    }
  });
}

function linhaBangboo(bangboo) { 
  const div = document.createElement("div");
  div.className = "item";

  const img = document.createElement("img");
  img.src = bangboo.img;

  const btn = document.createElement("button");
  btn.onclick = () => {
    setBangbooAtual(bangboo.id);
    idleDamageEnemies();
  }

  div.appendChild(img);
  div.appendChild(btn);
  $("loja").appendChild(div);
}

function desenharBangboos() {
  $("loja").innerHTML = "";

  const div = document.createElement("div");
  div.className = "item";
  div.innerHTML = "<span>" + "Banner" + "<small>" + "Try your luck :)" + "</small></span>";
  const button = document.createElement("button");
  button.className = "bangbooGablingButton";

  button.onclick = () => {
    if (state.premium >= 10) {
      state.premium -= 10;
      rollBangboo();
      desenharBangboos();
    }
  }

  div.appendChild(button);
  $("loja").appendChild(div);

  state.bangboosDesbloqueados.forEach(id => {
    const bangboo = bangboos.find(b => b.id === id);
    if (bangboo) {
      linhaBangboo(bangboo);
    }
  });
}

// ativa/desativa os botoes conforme o dinheiro
function atualizarLoja() {
  if (abaAtual !== 0) return;

  const bd = $("up-desbloqueio");
  if (bd) bd.disabled = state.dinheiro < CUSTO_IDLE;

  upgrades.forEach(u => {
    const b = $("up-" + u.id);
    if (b) b.disabled = (u.max && nivel(u) >= u.max) || state.dinheiro < custo(u);
  });
}

