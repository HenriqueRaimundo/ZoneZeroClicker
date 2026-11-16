// coluna da esquerda (fairy e rendimento)

function atualizarIdle() {
  // tira ou poe o bloqueio
  $("bloqueio").classList.toggle("livre", state.idleDesbloqueado);
  $("listaIdle").innerHTML =
    "<li><span>fairy</span><span>" + fmt(idlePorSegundo()) + "/s</span></li>" +
    "<li><span>bangboos (dano)</span><span>" + fmt(state.dpsMascotes) + "/s</span></li>";
}
