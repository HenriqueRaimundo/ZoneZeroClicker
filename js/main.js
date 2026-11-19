// loop principal e arranque (este ficheiro tem de ser o ultimo a ser carregado)

let ultimoInstante = performance.now();
let tempoDesdeFlutuante = 0; // segundos desde o ultimo numero a subir da fairy
let tempoDesdeSave = 0; // segundos desde o ultimo autosave

function loop(instanteAtual) {
  // tempo (em segundos) que passou desde o frame anterior
  // em vez de utilizar valores fixos, para assim jogo andar igual em qualquer computador
  const deltaTempo = (instanteAtual - ultimoInstante) / 1000;
  ultimoInstante = instanteAtual;

  // rendimento passivo
  state.dinheiro += idlePorSegundo() * deltaTempo;
  if (state.dpsMascotes > 0) aplicarDano(state.dpsMascotes * deltaTempo);

  // timer do boss: vai descendo e, se chegar a 0, falha o boss
  if (inimigo.timer !== null) {
    inimigo.timer -= deltaTempo;
    if (inimigo.timer <= 0) falhouBoss();
    else porId("timerBoss").textContent = "tempo: " + Math.ceil(inimigo.timer) + "s";
  }

  // numero a subir da fairy, 1x por segundo
  tempoDesdeFlutuante += deltaTempo;
  if (tempoDesdeFlutuante >= 1 && state.idleDesbloqueado) {
    tempoDesdeFlutuante = 0;
    const retangulo = porId("fairy").getBoundingClientRect();
    const posicaoX = retangulo.left + retangulo.width / 2 - 15 + Math.random() * 30;
    flutuante("+" + formatarNumero(idlePorSegundo()) + "/s", posicaoX, retangulo.top, "#06c");
  }

  // autosave de 10 em 10 segundos
  tempoDesdeSave += deltaTempo;
  if (tempoDesdeSave >= 10) { 
    tempoDesdeSave = 0; 
    guardar(); 
  }

  // atualiza os textos e botoes do ecra
  porId("dinheiro").textContent = formatarNumero(state.dinheiro);
  porId("premium").textContent = formatarNumero(state.premium);
  atualizarBotaoBoss();
  atualizarZonas();
  atualizarLoja();

  requestAnimationFrame(loop);
}

// ================= arranque =================

carregar(); // le o save (se existir)
novoInimigo();
desenharZonas();
desenharLoja();
desenharAbas();
atualizarIdle();
idleDamageEnemies(); // sem isto o ataque automatico so comecava depois de escolheres um personagem


// ================= botao de reset (so para testes) =================
// a flag impede que o save ao fechar a pagina volte a gravar o progresso que acabaste de apagar
let aReiniciar = false;

window.addEventListener("beforeunload", () => { 
  if (!aReiniciar) guardar(); 
});

porId("btnReset").addEventListener("click", () => {
  if (!confirm("apagar todo o progresso e recomecar?")) return;

  aReiniciar = true;
  localStorage.removeItem("clickerSave2");
  location.reload();
});

requestAnimationFrame(loop);