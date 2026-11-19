// cada conquista tem: id, grupo, nome, premio (em premium) e um "check"
// o "check" e uma funcao que devolve true quando a conquista ja foi cumprida
// atencao: os ids ficam guardados no save, nao os mudes depois de haver jogadores com progresso

const inicioSessao = Date.now(); // fora do state, so conta a sessao atual

// cria uma conquista por cada valor da lista. exemplo:
//   criarEscaloes("cliques", "cliques", [100, 1000], "Clicar {n} vezes", () => state.stats.cliques)
// gera duas conquistas: "Clicar 100 vezes" e "Clicar 1.00K vezes"
const criarEscaloes = (grupo, idBase, valores, textoModelo, medirProgresso, premio = 1) =>
  valores.map(valorAlvo => ({
    id: idBase + "_" + valorAlvo, 
    grupo, 
    premio,
    nome: textoModelo.replace("{n}", formatarNumero(valorAlvo)),
    check: () => medirProgresso() >= valorAlvo
  })
);

// os "check" usam sempre () => state... (e nao uma copia do valor) porque
// carregar() substitui o objeto state, e uma copia fica desatualizada
const conquistas = [
  // ---- cliques ----
  ...criarEscaloes("cliques", "cliques", [100, 1000, 10000, 100000], "Clicar {n} vezes", () => state.stats.cliques),
  { id: "crit1",     grupo: "cliques", nome: "Dar um crítico pela primeira vez", premio: 1, check: () => state.stats.criticos >= 1 },
  { id: "crit10seq", grupo: "cliques", nome: "Dar 10 críticos seguidos",         premio: 5, check: () => state.stats.melhorSeqCrit >= 10 },
  { id: "critMax",   grupo: "cliques", nome: "Chance de crítico no máximo",      premio: 5,
    check: () => (state.comprados.crit || 0) >= upgrades.find(upgrade => upgrade.id === "crit").max },

  // ---- inimigos ----
  ...criarEscaloes("inimigos", "mortes", [10, 100, 1000, 10000], "Matar {n} inimigos", () => state.stats.inimigos),
  ...criarEscaloes("inimigos", "elites", [1, 10, 100], "Matar {n} elites", () => state.stats.elites),
  ...criarEscaloes("inimigos", "vida", [1e3, 1e6, 1e9], "Matar um inimigo com {n}+ de vida", () => state.stats.maiorVida),

  // ---- boss ----
  { id: "boss1", grupo: "boss", nome: "Derrotar o primeiro boss", premio: 2, check: () => state.bossesDerrotados.length >= 1 },
  // uma conquista por zona
  ...zonas.map((zona, indiceZona) => ({
    id: "bossZona" + indiceZona, grupo: "boss", premio: 2,
    nome: "Derrotar o boss da " + zona.nome,
    check: () => state.bossesDerrotados.includes(indiceZona)
  })),
  { id: "bossApertado", grupo: "boss", nome: "Derrotar um boss com menos de 5s no timer", premio: 3, check: () => state.stats.bossApertado },
  { id: "bossFalha",    grupo: "boss", nome: "Falhar um boss pela primeira vez",           premio: 1, check: () => state.stats.bossesFalhados >= 1 },
  { id: "boss10seq",    grupo: "boss", nome: "Derrotar 10 bosses seguidos sem falhar",     premio: 5, check: () => state.stats.melhorSeqBoss >= 10 },

  // ---- dinheiro ----
  ...criarEscaloes("dinheiro", "dinheiro", [1e3, 1e6, 1e9, 1e12], "Ter {n} de dinheiro", () => state.dinheiro),

  // ---- zonas ----
  // a zona 1 ja vem desbloqueada, por isso comecamos na segunda (slice(1))
  ...zonas.slice(1).map((zona, indice) => ({
    id: "zona" + (indice + 1), grupo: "zonas", premio: 2,
    nome: "Desbloquear a " + zona.nome,
    check: () => state.zonasDesbloqueadas.includes(indice + 1)
  })),
  { id: "zonaFinal", grupo: "zonas", nome: "Entrar na última zona", premio: 3, check: () => state.zonaAtual === zonas.length - 1 },

  // ---- idle ----
  { id: "idleComprar", grupo: "idle", nome: "Comprar o idle", premio: 1, check: () => state.idleDesbloqueado },
  ...criarEscaloes("idle", "idleDps", [100, 1000, 10000], "Chegar a {n}/s de idle", () => idlePorSegundo()),
  ...criarEscaloes("idle", "offline", [1, 4, 8], "Voltar depois de {n}h fora", () => state.stats.maxOffline / 3600),
  ...criarEscaloes("idle", "sessao", [1, 2, 4], "Ter o jogo aberto {n}h seguidas", () => (Date.now() - inicioSessao) / 3600000),

  // ---- upgrades ----
  { id: "upg1", grupo: "upgrades", nome: "Comprar o primeiro upgrade", premio: 1,
    check: () => Object.values(state.comprados).some(nivel => nivel > 0) },
  ...criarEscaloes("upgrades", "upgMesmo", [10, 20, 30, 50], "Comprar {n} do mesmo upgrade",
    () => Math.max(0, ...Object.values(state.comprados))),
  // so conta os upgrades que tem limite (os infinitos nunca chegam ao maximo)
  { id: "upgTodos", grupo: "upgrades", nome: "Ter todos os upgrades com limite no máximo", premio: 10,
    check: () => upgrades.filter(upgrade => upgrade.max).every(upgrade => (state.comprados[upgrade.id] || 0) >= upgrade.max) },

  // ---- premium ----
  { id: "prem1",      grupo: "premium", nome: "Ganhar a primeira moeda premium",           premio: 1, check: () => state.premium >= 1 },
  ...criarEscaloes("premium", "premTer", [100, 1000], "Ter {n} premium", () => state.premium),
  { id: "premNormal", grupo: "premium", nome: "Ter um drop de premium num inimigo normal", premio: 1, check: () => state.stats.premiumNormal },
];

// percorre todas as conquistas e desbloqueia as que ja foram cumpridas
function verificarConquistas() {
  let desbloqueouAlguma = false;

  for (const conquista of conquistas) {
    const jaTinha = state.conquistas.includes(conquista.id);
    if (jaTinha || !conquista.check()) continue;

    state.conquistas.push(conquista.id);
    state.premium += conquista.premio || 0;
    flutuante("Conquista: " + conquista.nome, innerWidth / 2, 100, "#c90");
    desbloqueouAlguma = true;
  }

  // se o separador das conquistas estiver aberto, atualiza a lista
  if (desbloqueouAlguma && abaAtual === 3) desenharConquistas(porId("loja"));
}

// 1 vez por segundo chega, assim nao e preciso chamar a todo o momento (e evita problemas de performance se houver muitas conquistas)
setInterval(verificarConquistas, 1000);