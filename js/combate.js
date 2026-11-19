// inimigos, cliques e boss

// ================= criar e desenhar inimigos =================

// vida do boss: igual a de um inimigo normal mas x5
const vidaBoss = () => Math.ceil(VIDA_BASE * (state.mortes + 1) * zonas[state.zonaAtual].multVida * 5);

function novoInimigo(ehBoss = false) {
  const zona = zonas[state.zonaAtual];
  const ehElite = !ehBoss && Math.random() < 0.1; // 10% de chance de ser elite
  const tipo = ehBoss ? "boss" : ehElite ? "elite" : "normal";

  // a vida sobe sempre: 10, 20, 30... (usa o numero de mortes), o elite tem o dobro
  const vida = ehBoss
    ? vidaBoss()
    : Math.ceil(VIDA_BASE * (state.mortes + 1) * zona.multVida * (ehElite ? 2 : 1));

  // so o boss tem timer (segundos para o matar), o bangboo pode dar tempo extra
  const tempoExtraBangboo = getBangboo()?.tempoBoss || 0;
  const timer = ehBoss ? state.tempoBoss + tempoExtraBangboo : null;

  inimigo = { tipo, vidaMax: vida, vida, timer };
  porId("inimigo").className = tipo;
  desenharInimigo();
}

function desenharInimigo() {
  porId("vida").style.width = (inimigo.vida / inimigo.vidaMax * 100) + "%";
  porId("textoVida").textContent = formatarNumero(inimigo.vida) + "/" + formatarNumero(inimigo.vidaMax);
  porId("infoInimigo").textContent = inimigo.tipo;
  if (inimigo.timer === null) porId("timerBoss").textContent = "";
}

// ================= dano, dinheiro e critico =================

// tira vida ao inimigo e devolve o dano que foi realmente causado
function aplicarDano(danoBase) {
  const danoTotal = danoBase * state.multClique * (1 + (getBangboo()?.dano || 0));
  inimigo.vida = Math.max(0, inimigo.vida - danoTotal);

  if (inimigo.vida <= 0) {
    matar();
  } else {
    desenharInimigo();
  }

  return danoTotal;
}

// cada ataque da dinheiro, e o dinheiro depende da zona onde estas
function darDinheiroPorAtaque(danoBase) {
  const zona = zonas[state.zonaAtual];
  state.dinheiro += danoBase * state.multClique * zona.multDinheiro;;
}

// devolve o multiplicador de dano: 2 se foi critico, 1 se nao foi
// (para saber SE foi critico usa multiplicador > 1, porque 1 tambem conta como "verdadeiro")
function processarCritico() {
  const critico = Math.random() < (state.crit + (getBangboo()?.crit || 0)) ? 2 : 1;
  return critico;
}

// ================= matar inimigos =================

function matar() {
  const zona = zonas[state.zonaAtual];
  const retangulo = porId("inimigo").getBoundingClientRect();
  const centroX = retangulo.left + retangulo.width / 2;

  // dinheiro extra ao matar (o boss da o dobro dos outros)
  const recompensa = Math.floor(inimigo.vidaMax * (inimigo.tipo === "boss" ? 1 : 0.5) * zona.multDinheiro);
  state.dinheiro += recompensa;
  flutuante("+" + formatarNumero(recompensa), centroX, retangulo.top, "#a60");

  // drop de premium: o boss da sempre, o elite tem 5x mais chance
  const dropPremium = state.dropPremium + (getBangboo()?.dropPremium || 0);
  const chanceDrop = inimigo.tipo === "boss" ? 1 : inimigo.tipo === "elite" ? dropPremium * 5 : dropPremium;

  if (Math.random() < chanceDrop) {
    const premiosGanhos = inimigo.tipo === "boss" ? 3 : 1;
    state.premium += premiosGanhos;
    flutuante("+" + premiosGanhos + " premium", centroX, retangulo.top - 20, "#06c");
    if (inimigo.tipo === "normal") {
      state.stats.premiumNormal = true;
    }
  }

  // matar o boss desbloqueia a proxima zona (falta pagar)
  if (inimigo.tipo === "boss" && !state.bossesDerrotados.includes(state.zonaAtual)) {
    state.bossesDerrotados.push(state.zonaAtual);
  }
  state.mortes++;

  // contadores para as conquistas (tem de ser antes do novoInimigo, que substitui o inimigo)
  const estatisticas = state.stats;
  estatisticas.inimigos++;
  if (inimigo.tipo === "elite") {
    estatisticas.elites++;
  }
  estatisticas.maiorVida = Math.max(estatisticas.maiorVida, inimigo.vidaMax);

  if (inimigo.tipo === "boss") {
    estatisticas.seqBoss++;
    estatisticas.melhorSeqBoss = Math.max(estatisticas.melhorSeqBoss, estatisticas.seqBoss);
    if (inimigo.timer < 5) {
      estatisticas.bossApertado = true;
    }
  }

  novoInimigo();
  desenharZonas();
}

// ================= boss =================

// o boss custa uma parte do custo da proxima zona
function custoBoss() {
  const proximaZona = zonas[state.zonaAtual + 1];
  // na ultima zona nao ha proxima, usa o custo dela x10
  const custoReferencia = proximaZona ? proximaZona.custo : zonas[state.zonaAtual].custo * 10;
  return Math.floor(custoReferencia * CUSTO_BOSS);
}

function lutarBoss() {
  if (inimigo.tipo === "boss" || state.dinheiro < custoBoss()) return;

  state.dinheiro -= custoBoss();
  novoInimigo(true);
  desenharZonas();
}

porId("btnBoss").addEventListener("click", lutarBoss);

function falhouBoss() {
  const perda = Math.floor(state.dinheiro * PERDA_BOSS);
  state.dinheiro -= perda;
  
  const retangulo = porId("inimigo").getBoundingClientRect();
  flutuante("-" + formatarNumero(perda), retangulo.left + retangulo.width / 2, retangulo.top, "#c00");

  state.stats.bossesFalhados++;
  state.stats.seqBoss = 0; // falhar acaba a sequencia de bosses

  novoInimigo();
  desenharZonas();
}

// texto e estado do botao do boss
function atualizarBotaoBoss() {
  const aLutarComBoss = inimigo.tipo === "boss";
  porId("btnBoss").textContent = aLutarComBoss ? "a lutar com o boss..." : "lutar com o boss (" + formatarNumero(custoBoss()) + ")";
  porId("btnBoss").disabled = aLutarComBoss || state.dinheiro < custoBoss();
}

// ================= ataques do jogador =================

// clicar no inimigo: da dinheiro e dano
porId("inimigo").addEventListener("click", evento => {
  const multiplicadorCritico = processarCritico();
  const foiCritico = multiplicadorCritico > 1;
  const danoBase = state.danoClique * multiplicadorCritico;

  darDinheiroPorAtaque(danoBase);
  const danoCausado = aplicarDano(danoBase); // so uma vez, senao o dano era aplicado a dobrar
  
  flutuante(
  (foiCritico ? "crit " : "") + "-" + formatarNumero(danoCausado),
  evento.clientX + Math.random() * 40 - 20, 
  evento.clientY - 10, 
  foiCritico ? "#c00" : "#000"
  );

  // contadores para as conquistas
  const estatisticas = state.stats;
  estatisticas.cliques++;
  if (foiCritico) {
    estatisticas.criticos++;
    estatisticas.seqCrit++;
    estatisticas.melhorSeqCrit = Math.max(estatisticas.melhorSeqCrit, estatisticas.seqCrit);
  } else {
    estatisticas.seqCrit = 0;
  }
});

// o personagem atual ataca sozinho de X em X milissegundos (a speed dele, reduzida pelo bangboo)
let idIntervaloAtaque = null; // guarda o setInterval para o conseguirmos reiniciar

function idleDamageEnemies() {
  const personagem = getPersonagem();

  if (!personagem || personagem.id === "default" || personagem.speed <= 0) return;

  // se ja havia um ataque automatico a correr (ex: trocar de personagem), para-o primeiro
  if (idIntervaloAtaque) {
    clearInterval(idIntervaloAtaque);
  }

  const retangulo = document.getElementById("inimigo").getBoundingClientRect();
  const intervaloMs = personagem.speed / (1 + (getBangboo()?.velocidade || 0));

  idIntervaloAtaque = setInterval(() => {
      const multiplicadorCritico = processarCritico();
      const foiCritico = multiplicadorCritico > 1;
      const danoBase = personagem.dano * multiplicadorCritico;

      darDinheiroPorAtaque(danoBase);
      const danoCausado = aplicarDano(danoBase);
      
      flutuante(
        (foiCritico ? "crit " : "") + "-" + formatarNumero(danoCausado),
        retangulo.left + (retangulo.width / 2),
        retangulo.top,
        foiCritico ? "#c00" : "#000"
      );
    }, intervaloMs
  );
}