// estado do jogo + guardar/carregar
const estadoInicial = () => ({
  //moedas
  dinheiro: 0, premium: 0,

  //atributos
  danoClique: 1, multClique: 1, crit: 0, tempoBoss: 30, dropPremium: 0.01,

  //idle
  idleDesbloqueado: false, idleBase: 0, multIdle: 1,
  dpsMascotes: 0, // ainda nao ha mascotes, fica a 0

  //zonas e bosses
  zonaAtual: 0, zonasDesbloqueadas: [0], bossesDerrotados: [],

  //progresso geral
  mortes: 0, comprados: {}, ultimoSave: Date.now(),

  //Personagens
  personagemAtual: "",
  personagensDesbloqueados: [""],

  //Bangboos
  bangbooAtual: "",
  bangboosDesbloqueados: [""],

  //conquistas
  conquistas: [],
  stats: {
    cliques: 0, criticos: 0, seqCrit: 0, melhorSeqCrit: 0,
    inimigos: 0, elites: 0, maiorVida: 0,
    seqBoss: 0, melhorSeqBoss: 0, bossesFalhados: 0, bossApertado: false,
    premiumNormal: false, maxOffline: 0   // maxOffline em segundos
  },
});

let state = estadoInicial();
let inimigo = null; // inimigo atual (criado em combate.js)
let abaAtual = 0;   // separador da loja que esta aberto

function guardar() {
  state.ultimoSave = Date.now();
  localStorage.setItem("clickerSave2", JSON.stringify(state));
}

function carregar() {
  const raw = localStorage.getItem("clickerSave2");
  if (!raw) return;
  state = { ...estadoInicial(), ...JSON.parse(raw) };
  state.stats = { ...estadoInicial().stats, ...state.stats };


  // progresso offline: 50% do idle, maximo 8h
  const segundos = Math.min((Date.now() - state.ultimoSave) / 1000, 8 * 3600);
  const ganho = segundos * idlePorSegundo() * 0.5;
  if (ganho >= 1) {
    state.dinheiro += ganho;
    state.stats.maxOffline = Math.max(state.stats.maxOffline, segundos);
    setTimeout(() => alert("enquanto estiveste fora ganhaste " + formatarNumero(ganho)), 200);
  }
}

// ---------- ajudas relacionadas com o estado ----------
const idlePorSegundo = () => state.idleBase * state.multIdle;

const estaDesbloqueadoPers = id => state.personagensDesbloqueados.includes(id);
const estaDesbloqueadoBangboo = id => state.bangboosDesbloqueados.includes(id);

// so adicionam se ainda nao tiver (assim um duplicado no gamble nao cria entradas repetidas)
function desbloquearPersonagem(id) {
  if (!estaDesbloqueadoPers(id)) state.personagensDesbloqueados.push(id);
}

function desbloquearBangboo(id) {
  if (!estaDesbloqueadoBangboo(id)) state.bangboosDesbloqueados.push(id);
}