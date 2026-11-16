const VIDA_BASE = 10;    // vida do 1o inimigo, depois vai 2x, 3x, 4x...
const CUSTO_BOSS = 0.5;  // boss custa isto vezes o custo da proxima zona
const PERDA_BOSS = 0.15; // % do dinheiro que se perde se falhar o boss
const CUSTO_IDLE = 150;  // preco para desbloquear o idle

const zonas = [
  { nome: "Zona 1", multDinheiro: 1,  multVida: 1,    custo: 0 },
  { nome: "Zona 2", multDinheiro: 2,  multVida: 3,    custo: 800 },
  { nome: "Zona 3", multDinheiro: 4,  multVida: 10,   custo: 8000 },
  { nome: "Zona 4", multDinheiro: 8,  multVida: 50,   custo: 80000 },
  { nome: "Zona 5", multDinheiro: 16, multVida: 200,  custo: 800000 },
  { nome: "Zona 6", multDinheiro: 32, multVida: 1000, custo: 8000000 },
];

// os que tem idle igual a true so aparecem depois de comprar o idle
const upgrades = [
  { id: "dano",     nome: "dano do clique",      desc: "+1 de dano e dinheiro por clique", base: 20,  cresc: 1.25, efeito: s => s.danoClique += 1 },
  { id: "multC",    nome: "dano e dinheiro por clique", desc: "+25% de dano e dinheiro por clique",      base: 120, cresc: 1.4,  efeito: s => s.multClique += 0.25 },
  { id: "crit",     nome: "chance de critico",   desc: "+2% de chance (dano x2)",          base: 200, cresc: 1.5,  max: 20, efeito: s => s.crit += 0.02 },
  { id: "tempo",    nome: "tempo do boss",       desc: "+3 segundos",                      base: 250, cresc: 1.6,  max: 10, efeito: s => s.tempoBoss += 3 },
  { id: "drop",     nome: "drop de premium",     desc: "+0.5% de chance nos normais",      base: 600, cresc: 1.8,  max: 10, efeito: s => s.dropPremium += 0.005 },
  { id: "idle1",    nome: "idle da fairy",       desc: "+1 por segundo",                   base: 40,  cresc: 1.2,  idle: true, efeito: s => s.idleBase += 1 },
  { id: "idleMult", nome: "multiplicador idle",  desc: "+20% de idle",                     base: 300, cresc: 1.5,  idle: true, efeito: s => s.multIdle += 0.2 },
];

//speed de personagens e feita em milissegundos
const personagens = [
  // ---- Tier 4 -> comum ----
  { id: "billy", nome: "Billy", dano: 1, speed: 500, img: "", raridade: "comum" },

  // ---- Tier 3 -> raro ----
  { id: "ben",   nome: "Ben",   dano: 3, speed: 1500, img: "", raridade: "raro" },
  { id: "corin", nome: "Corin", dano: 3, speed: 1000, img: "", raridade: "raro" },
  { id: "anton", nome: "Anton", dano: 5, speed: 1500, img: "", raridade: "raro" },

  // ---- Tier 2 -> epico ----
  { id: "zhuyuan",  nome: "Zhu Yuan",  dano: 8, speed: 700,  img: "", raridade: "epico" },
  { id: "caesar",   nome: "Caesar",    dano: 8, speed: 1000, img: "", raridade: "epico" },
  { id: "lucy",     nome: "Lucy",      dano: 8, speed: 1500, img: "", raridade: "epico" },
  { id: "soldier11",nome: "Soldier 11",dano: 8, speed: 700,  img: "", raridade: "epico" },
  { id: "grace",    nome: "Grace",     dano: 8, speed: 700,  img: "", raridade: "epico" },
  { id: "piper",    nome: "Piper",     dano: 8, speed: 700,  img: "", raridade: "epico" },
  { id: "seth",     nome: "Seth",      dano: 8, speed: 1500, img: "", raridade: "epico" },
  { id: "anby",     nome: "Anby",      dano: 8, speed: 1000, img: "", raridade: "epico" },

  // ---- Tier 1 -> lendario ----
  { id: "yanagi",   nome: "Yanagi",   dano: 15, speed: 700,  img: "", raridade: "lendario" },
  { id: "burnice",  nome: "Burnice",  dano: 15, speed: 700,  img: "", raridade: "lendario" },
  { id: "ellen",    nome: "Ellen",    dano: 15, speed: 700,  img: "", raridade: "lendario" },
  { id: "qingyi",   nome: "Qingyi",   dano: 15, speed: 1000, img: "", raridade: "lendario" },
  { id: "manato",   nome: "Manato",   dano: 15, speed: 700,  img: "", raridade: "lendario" },
  { id: "koleda",   nome: "Koleda",   dano: 15, speed: 1000, img: "", raridade: "lendario" },
  { id: "rina",     nome: "Rina",     dano: 15, speed: 1500, img: "", raridade: "lendario" },
  { id: "nicole",   nome: "Nicole",   dano: 15, speed: 1500, img: "", raridade: "lendario" },
  { id: "harumasa", nome: "Harumasa", dano: 15, speed: 700,  img: "", raridade: "lendario" },
  { id: "lycaon",   nome: "Lycaon",   dano: 15, speed: 1000, img: "", raridade: "lendario" },
  { id: "nekomata", nome: "Nekomata", dano: 15, speed: 700,  img: "", raridade: "lendario" },
  { id: "pulchra",  nome: "Pulchra",  dano: 15, speed: 1000, img: "", raridade: "lendario" },
  { id: "soukaku",  nome: "Soukaku",  dano: 15, speed: 1500, img: "", raridade: "lendario" },
  { id: "panyinhu", nome: "Pan Yinhu",dano: 15, speed: 1500, img: "", raridade: "lendario" },

  // ---- Tier 1+ -> mitico ----
  { id: "promeia",        nome: "Promeia",         dano: 30, speed: 700,  img: "", raridade: "mitico" },
  { id: "severian",       nome: "Severian",        dano: 30, speed: 700,  img: "", raridade: "mitico" },
  { id: "zhao",           nome: "Zhao",            dano: 30, speed: 1500, img: "", raridade: "mitico" },
  { id: "roxy",           nome: "Roxy",            dano: 30, speed: 1000, img: "", raridade: "mitico" },
  { id: "evelyn",         nome: "Evelyn",          dano: 30, speed: 700,  img: "", raridade: "mitico" },
  { id: "vivian",         nome: "Vivian",          dano: 30, speed: 700,  img: "", raridade: "mitico" },
  { id: "sigrid",         nome: "Sigrid",          dano: 30, speed: 700,  img: "", raridade: "mitico" },
  { id: "seed",           nome: "Seed",            dano: 30, speed: 700,  img: "", raridade: "mitico" },
  { id: "aria",           nome: "Aria",            dano: 30, speed: 700,  img: "", raridade: "mitico" },
  { id: "alice",          nome: "Alice",           dano: 30, speed: 700,  img: "", raridade: "mitico" },
  { id: "yidhari",        nome: "Yidhari",         dano: 30, speed: 700,  img: "", raridade: "mitico" },
  { id: "soldier0anby",   nome: "Soldier 0 Anby",  dano: 30, speed: 700,  img: "", raridade: "mitico" },
  { id: "starlightbilly", nome: "Starlight Billy", dano: 30, speed: 700,  img: "", raridade: "mitico" },
  { id: "jane",           nome: "Jane",            dano: 30, speed: 700,  img: "", raridade: "mitico" },
  { id: "banyue",         nome: "Banyue",          dano: 30, speed: 700,  img: "", raridade: "mitico" },
  { id: "pyrois",         nome: "Pyrois",          dano: 30, speed: 700,  img: "", raridade: "mitico" },
  { id: "cissia",         nome: "Cissia",          dano: 30, speed: 700,  img: "", raridade: "mitico" },
  { id: "orphiemagus",    nome: "Orphie e Magus",  dano: 30, speed: 700,  img: "", raridade: "mitico" },
  { id: "jufufu",         nome: "Ju Fufu",         dano: 30, speed: 1000, img: "", raridade: "mitico" },
  { id: "lighter",        nome: "Lighter",         dano: 30, speed: 1000, img: "", raridade: "mitico" },
  { id: "hugo",           nome: "Hugo",            dano: 30, speed: 700,  img: "", raridade: "mitico" },

  // ---- Tier 0 -> secreto ----
  { id: "remielle",  nome: "Remielle",     dano: 60, speed: 700,  img: "", raridade: "secreto" },
  { id: "yeshunguang",nome: "Ye Shunguang",dano: 60, speed: 700,  img: "", raridade: "secreto" },
  { id: "yixuan",    nome: "Yixuan",       dano: 60, speed: 700,  img: "", raridade: "secreto" },
  { id: "miyabi",    nome: "Miyabi",       dano: 60, speed: 700,  img: "", raridade: "secreto" },
  { id: "phoenix",   nome: "Phoenix",      dano: 60, speed: 700,  img: "", raridade: "secreto" },
  { id: "yuzuha",    nome: "Yuzuha",       dano: 60, speed: 1500, img: "", raridade: "secreto" },
  { id: "sunna",     nome: "Sunna",        dano: 60, speed: 1500, img: "", raridade: "secreto" },
  { id: "lucia",     nome: "Lucia",        dano: 60, speed: 1500, img: "", raridade: "secreto" },
  { id: "astra",     nome: "Astra",        dano: 60, speed: 1500, img: "", raridade: "secreto" },
  { id: "dialyn",    nome: "Dialyn",       dano: 60, speed: 1000, img: "", raridade: "secreto" },
  { id: "norma",     nome: "Norma",        dano: 60, speed: 1000, img: "", raridade: "secreto" },
  { id: "nangongyu", nome: "Nangong Yu",   dano: 60, speed: 1000, img: "", raridade: "secreto" },
  { id: "velina",    nome: "Velina",       dano: 60, speed: 700,  img: "", raridade: "secreto" },
  { id: "claret",    nome: "Claret",       dano: 60, speed: 700,  img: "", raridade: "secreto" },
  { id: "trigger",   nome: "Trigger",      dano: 60, speed: 1000, img: "", raridade: "secreto" },
];

function setPersonagemAtual(id) {
  if (!estaDesbloqueadoPers(id)) return;
  state.personagemAtual = id;
}

function getPersonagem() {
  return personagens.find(p => p.id === state.personagemAtual);
}

const bangboos = [
  // ---- Tier 3 -> comum ----
  { id: "devilboo",    nome: "Devilboo",    img: "", raridade: "comum", buffs: { dano: 0.05, crit: 0.01 } },
  { id: "boollseye",   nome: "Boollseye",   img: "", raridade: "comum", buffs: { dano: 0.05 } },
  { id: "cryboo",      nome: "Cryboo",      img: "", raridade: "comum", buffs: { dano: 0.05, crit: 0.01 } },
  { id: "sumoboo",     nome: "Sumoboo",     img: "", raridade: "comum", buffs: { dano: 0.04, velocidade: 0.03 } },
  { id: "bagboo",      nome: "Bagboo",      img: "", raridade: "comum", buffs: { dano: 0.05 } },
  { id: "luckyboo",    nome: "Luckyboo",    img: "", raridade: "comum", buffs: { dano: 0.03, dropPremium: 0.01 } },
  { id: "overtimeboo", nome: "Overtimeboo", img: "", raridade: "comum", buffs: { dano: 0.05, dinheiro: 0.03 } },

  // ---- Tier 2 -> raro ----
  { id: "knightboo",  nome: "Knightboo",  img: "", raridade: "raro", buffs: { dano: 0.10 } },
  { id: "booressure", nome: "Booressure", img: "", raridade: "raro", buffs: { velocidade: 0.10 } },
  { id: "electroboo", nome: "Electroboo", img: "", raridade: "raro", buffs: { dano: 0.08, crit: 0.02 } },
  { id: "avocaboo",   nome: "Avocaboo",   img: "", raridade: "raro", buffs: { tempoBoss: 3 } },
  { id: "paperboo",   nome: "Paperboo",   img: "", raridade: "raro", buffs: { tempoBoss: 2, dano: 0.04 } },
  { id: "exploreboo", nome: "Exploreboo", img: "", raridade: "raro", buffs: { dinheiro: 0.10 } },
  { id: "penguinboo", nome: "Penguinboo", img: "", raridade: "raro", buffs: { dano: 0.08, crit: 0.02 } },
  { id: "magnetiboo", nome: "Magnetiboo", img: "", raridade: "raro", buffs: { velocidade: 0.08, dano: 0.04 } },
  { id: "excaliboo",  nome: "Excaliboo",  img: "", raridade: "raro", buffs: { dano: 0.10 } },

  // ---- Tier 1 -> epico ----
  { id: "rocketboo",    nome: "Rocketboo",       img: "", raridade: "epico", buffs: { dano: 0.15, crit: 0.03 } },
  { id: "bangvolver",   nome: "Bangvolver",      img: "", raridade: "epico", buffs: { dano: 0.15, crit: 0.03 } },
  { id: "baddieboo",    nome: "Baddieboo",       img: "", raridade: "epico", buffs: { dano: 0.15, crit: 0.02 } },
  { id: "brawlerboo",   nome: "Brawlerboo",      img: "", raridade: "epico", buffs: { dano: 0.20 } },
  { id: "bildnboolok",  nome: "Bild N. Boolok",  img: "", raridade: "epico", buffs: { dano: 0.20 } },
  { id: "sprout",       nome: "Sprout",          img: "", raridade: "epico", buffs: { dano: 0.20, crit: 0.02 } },
  { id: "booltergeist", nome: "Booltergeist",    img: "", raridade: "epico", buffs: { dano: 0.15, crit: 0.03 } },

  // ---- Tier 0 -> lendario ----
  { id: "amillion",     nome: "Amillion",       img: "", raridade: "lendario", buffs: { dano: 0.40 } },
  { id: "butler",       nome: "Butler",         img: "", raridade: "lendario", buffs: { velocidade: 0.25, dano: 0.10 } },
  { id: "safety",       nome: "Safety",         img: "", raridade: "lendario", buffs: { dano: 0.35, crit: 0.03 } },
  { id: "sharkboo",     nome: "Sharkboo",       img: "", raridade: "lendario", buffs: { dano: 0.25, crit: 0.05 } },
  { id: "plugboo",      nome: "Plugboo",        img: "", raridade: "lendario", buffs: { dano: 0.25, crit: 0.05 } },
  { id: "resonaboo",    nome: "Resonaboo",      img: "", raridade: "lendario", buffs: { dano: 0.25, crit: 0.05 } },
  { id: "officercui",   nome: "Officer Cui",    img: "", raridade: "lendario", buffs: { dano: 0.30, crit: 0.05 } },
  { id: "redmoccus",    nome: "Red Moccus",     img: "", raridade: "lendario", buffs: { dano: 0.35 } },
  { id: "agentgulliver",nome: "Agent Gulliver", img: "", raridade: "lendario", buffs: { dano: 0.30, crit: 0.05 } },
  { id: "snap",         nome: "Snap",           img: "", raridade: "lendario", buffs: { dano: 0.25, velocidade: 0.10 } },
  { id: "robin",        nome: "Robin",          img: "", raridade: "lendario", buffs: { dano: 0.30, crit: 0.05 } },
  { id: "belion",       nome: "Belion",         img: "", raridade: "lendario", buffs: { dano: 0.35, velocidade: 0.05 } },
  { id: "missesme",     nome: "Miss Esme",      img: "", raridade: "lendario", buffs: { velocidade: 0.20, tempoBoss: 3 } },
  { id: "mercury",      nome: "Mercury",        img: "", raridade: "lendario", buffs: { dano: 0.40 } },
  { id: "birkblick",    nome: "Birkblick",      img: "", raridade: "lendario", buffs: { dano: 0.30, velocidade: 0.05 } },
  { id: "biggestfan",   nome: "Biggest Fan",    img: "", raridade: "lendario", buffs: { dano: 0.20, tempoBoss: 3, crit: 0.03 } },
  { id: "ultrajake",    nome: "Ultra Jake",     img: "", raridade: "lendario", buffs: { dano: 0.30, velocidade: 0.10 } },
  { id: "ariel",        nome: "Ariel",          img: "", raridade: "lendario", buffs: { dano: 0.25, crit: 0.03, velocidade: 0.05 } },
];

const buff = nome => getBangboo()?.buffs[nome] || 0;

function setBangbooAtual(id) {
  if (!estaDesbloqueadoBangboo(id)) return;
  state.bangbooAtual = id;
}

function getBangboo() {
  return bangboos.find(b => b.id === state.bangbooAtual);
}

const abas = ["upgrades garantidos", "bangboos gamble", "gamble personagem", "achievements"];