// loop principal e arranque (este ficheiro tem de ser o ultimo)

let ultimo = performance.now();
let acumFlut = 0, acumSave = 0;

function loop(agora) {
  const dt = (agora - ultimo) / 1000;
  ultimo = agora;

  state.dinheiro += idlePorSegundo() * dt;
  if (state.dpsMascotes > 0) dano(state.dpsMascotes * dt);

  // timer do boss
  if (inimigo.timer !== null) {
    inimigo.timer -= dt;
    if (inimigo.timer <= 0) falhouBoss();
    else $("timerBoss").textContent = "tempo: " + Math.ceil(inimigo.timer) + "s";
  }

  // numero a subir da fairy, 1x por segundo
  acumFlut += dt;
  if (acumFlut >= 1 && state.idleDesbloqueado) {
    acumFlut = 0;
    const r = $("fairy").getBoundingClientRect();
    flutuante("+" + fmt(idlePorSegundo()) + "/s", r.left + r.width / 2 - 15 + Math.random() * 30, r.top, "#06c");
  }

  // autosave de 10 em 10 segundos
  acumSave += dt;
  if (acumSave >= 10) { acumSave = 0; guardar(); }

  $("dinheiro").textContent = fmt(state.dinheiro);
  $("premium").textContent = fmt(state.premium);
  atualizarBotaoBoss();
  atualizarZonas();
  atualizarLoja();
  requestAnimationFrame(loop);
}

// arranque
carregar();
novoInimigo();
desenharZonas();
desenharLoja();
desenharAbas();
atualizarIdle();
idleDamageEnemies();


// botao de reset (so para testes). a flag impede o save de fechar a pagina de voltar a gravar
let reiniciando = false;
window.addEventListener("beforeunload", () => { if (!reiniciando) guardar(); });
$("btnReset").addEventListener("click", () => {
  if (!confirm("apagar todo o progresso e recomecar?")) return;
  reiniciando = true;
  localStorage.removeItem("clickerSave2");
  location.reload();
});

requestAnimationFrame(loop);
