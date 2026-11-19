// coluna da esquerda (fairy e rendimento)
function atualizarIdle() {
  // tira ou poe o bloqueio por cima da coluna, conforme o idle esteja comprado ou nao
  porId("bloqueio").classList.toggle("livre", state.idleDesbloqueado);

  porId("listaIdle").innerHTML =
    "<li><span>fairy</span><span>" + formatarNumero(idlePorSegundo()) + "/s</span></li>" +
    "<li><span>bangboos (dano)</span><span>" + formatarNumero(state.dpsMascotes) + "/s</span></li>";
}
