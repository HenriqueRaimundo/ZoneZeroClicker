// estado do jogo + guardar/carregar
const estadoInicial = () => ({
  dinheiro: 0, premium: 0,
  danoClique: 1, multClique: 1, crit: 0, tempoBoss: 30, dropPremium: 0.01,
  idleDesbloqueado: false, idleBase: 0, multIdle: 1,
  dpsMascotes: 0, // ainda nao ha mascotes, fica a 0
  zonaAtual: 0, zonasDesbloqueadas: [0], bossesDerrotados: [],
  mortes: 0, comprados: {}, ultimoSave: Date.now(),
  personagemAtual: "",
  personagensDesbloqueados: [""],
  bangbooAtual: "",
  bangboosDesbloqueados: [""],
});

let state = estadoInicial();
let inimigo = null; // inimigo atual (criado em combate.js)
let abaAtual = 0;   // separador da loja que esta aberto

const estaDesbloqueadoPers = id => state.personagensDesbloqueados.includes(id);
const estaDesbloqueadoBangboo = id => state.bangboosDesbloqueados.includes(id);

function desbloquearPersonagem(id) {
  if (!estaDesbloqueadoPers(id)) state.personagensDesbloqueados.push(id);
}

function desbloquearBangboo(id) {
  if (!estaDesbloqueadoBangboo(id)) state.bangboosDesbloqueados.push(id);
}

const idlePorSegundo = () => state.idleBase * state.multIdle;

function carregar() {
  const raw = localStorage.getItem("clickerSave2");
  if (!raw) return;
  state = { ...estadoInicial(), ...JSON.parse(raw) };


  // progresso offline: 50% do idle, maximo 8h
  const segundos = Math.min((Date.now() - state.ultimoSave) / 1000, 8 * 3600);
  const ganho = segundos * idlePorSegundo() * 0.5;
  if (ganho >= 1) {
    state.dinheiro += ganho;
    setTimeout(() => alert("enquanto estiveste fora ganhaste " + fmt(ganho)), 200);
  }
}

function guardar() {
  state.ultimoSave = Date.now();
  localStorage.setItem("clickerSave2", JSON.stringify(state));
}