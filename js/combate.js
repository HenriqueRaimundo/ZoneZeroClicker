// inimigos, cliques e boss
function novoInimigo(boss = false) {
  const z = zonas[state.zonaAtual];
  const elite = !boss && Math.random() < 0.1;
  const tipo = boss ? "boss" : elite ? "elite" : "normal";
  // a vida sobe sempre: 10, 20, 30...
  const vida = boss ? vidaBoss() : Math.ceil(VIDA_BASE * (state.mortes + 1) * z.multVida * (elite ? 2 : 1));
  inimigo = { tipo, vidaMax: vida, vida, timer: boss ? (state.tempoBoss + getBangboo()?.tempoBoss || 0) : null };
  $("inimigo").className = tipo;
  desenharInimigo();
}

function desenharInimigo() {
  $("vida").style.width = (inimigo.vida / inimigo.vidaMax * 100) + "%";
  $("textoVida").textContent = fmt(inimigo.vida) + "/" + fmt(inimigo.vidaMax);
  $("infoInimigo").textContent = inimigo.tipo;
  if (inimigo.timer === null) $("timerBoss").textContent = "";
}

function matar() {
  const z = zonas[state.zonaAtual];
  const r = $("inimigo").getBoundingClientRect();
  const cx = r.left + r.width / 2;

  // dinheiro extra (boss da o dobro)
  const bonus = Math.floor(inimigo.vidaMax * (inimigo.tipo === "boss" ? 1 : 0.5) * z.multDinheiro);
  state.dinheiro += bonus;
  flutuante("+" + fmt(bonus), cx, r.top, "#a60");

  // drop de premium
  const dropPremium = state.dropPremium + (getBangboo()?.dropPremium || 0);
  const chance = inimigo.tipo === "boss" ? 1 : inimigo.tipo === "elite" ? dropPremium * 5 : dropPremium;
  if (Math.random() < chance) {
    const p = inimigo.tipo === "boss" ? 3 : 1;
    state.premium += p;
    flutuante("+" + p + " premium", cx, r.top - 20, "#06c");
  }

  // matar o boss desbloqueia a proxima zona (falta pagar)
  if (inimigo.tipo === "boss" && !state.bossesDerrotados.includes(state.zonaAtual)) {
    state.bossesDerrotados.push(state.zonaAtual);
  }
  state.mortes++;
  novoInimigo();
  desenharZonas();
}

const vidaBoss = () => Math.ceil(VIDA_BASE * (state.mortes + 1) * zonas[state.zonaAtual].multVida * 5);

function custoBoss() {
  const proxima = zonas[state.zonaAtual + 1];
  // na ultima zona nao ha proxima, usa o custo dela x10
  const ref = proxima ? proxima.custo : zonas[state.zonaAtual].custo * 10;
  return Math.floor(ref * CUSTO_BOSS);
}

function lutarBoss() {
  if (inimigo.tipo === "boss" || state.dinheiro < custoBoss()) return;
  state.dinheiro -= custoBoss();
  novoInimigo(true);
  desenharZonas();
}

$("btnBoss").addEventListener("click", lutarBoss);

function falhouBoss() {
  const perda = Math.floor(state.dinheiro * PERDA_BOSS);
  state.dinheiro -= perda;
  const r = $("inimigo").getBoundingClientRect();
  flutuante("-" + fmt(perda), r.left + r.width / 2, r.top, "#c00");
  novoInimigo();
  desenharZonas();
}

// texto e estado do botao do boss
function atualizarBotaoBoss() {
  const emBoss = inimigo.tipo === "boss";
  $("btnBoss").textContent = emBoss ? "a lutar com o boss..." : "lutar com o boss (" + fmt(custoBoss()) + ")";
  $("btnBoss").disabled = emBoss || state.dinheiro < custoBoss();
}

function dano(valor) {
  const danoTotal = valor * state.multClique * (1 + (getBangboo()?.dano || 0));
  inimigo.vida = Math.max(0, inimigo.vida - danoTotal);
  if (inimigo.vida <= 0) matar(); else desenharInimigo();
  return danoTotal;
}

function processarDinheiro(danoBase) {
  const zonaAtual = zonas[state.zonaAtual];
  const ganho = danoBase * state.multClique * zonaAtual.multDinheiro;
  state.dinheiro += ganho;
}

function processarCritico() {
  const critico = Math.random() < (state.crit + (getBangboo()?.crit || 0));
  return critico ? 2 : 1;
}

// clicar no inimigo: da dinheiro e dano
$("inimigo").addEventListener("click", e => {
  const critico = processarCritico();
  const danoBase = state.danoClique * critico;
  processarDinheiro(danoBase)

  flutuante((critico ? "crit " : "") + "-" + fmt(dano(danoBase)),
  e.clientX + Math.random() * 40 - 20, 
  e.clientY - 10, 
  critico ? "#c00" : "#000");

  dano(danoBase);
});

let timerId = null;
function idleDamageEnemies() {
  const personagem = getPersonagem();

  if (!personagem || personagem.id === "default" || personagem.speed <= 0) return;

  if (timerId) {
    clearInterval(timerId);
  }

  const elementoInimigo = document.getElementById("inimigo");
  const rect = elementoInimigo.getBoundingClientRect();

  timerId = setInterval(() => {
      const critico = processarCritico();
      const danoBase = personagem.dano * critico;
      processarDinheiro(danoBase);

      flutuante((critico ? "crit " : "") + "-" + fmt(dano(danoBase)),
      rect.left + (rect.width / 2),
      rect.top,
      critico ? "#c00" : "#000");

      dano(danoBase);
    }, personagem.speed / (1 + (getBangboo()?.speed || 0))
  );
}