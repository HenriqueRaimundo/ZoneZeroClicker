// botoes das zonas

// durante o boss nao da para trocar de zona
function zonaBloqueada(i) {
  if (inimigo.tipo === "boss") return true;
  if (state.zonasDesbloqueadas.includes(i)) return false;
  return !(i === 0 || state.bossesDerrotados.includes(i - 1)) || state.dinheiro < zonas[i].custo;
}

function desenharZonas() {
  const c = porId("zonas");
  c.innerHTML = "";
  zonas.forEach((z, i) => {
    const b = document.createElement("button");
    const desbloq = state.zonasDesbloqueadas.includes(i);
    const bossAnterior = i === 0 || state.bossesDerrotados.includes(i - 1);

    if (desbloq) b.textContent = z.nome + " x" + z.multDinheiro;
    else b.innerHTML = z.nome + "<br><small>" + (bossAnterior ? "" : "boss + ") + formatarNumero(z.custo) + "</small>";

    b.className = i === state.zonaAtual ? "ativo" : "";
    b.disabled = zonaBloqueada(i);
    b.title = !desbloq && !bossAnterior ? "precisas de matar o boss da zona anterior e pagar o custo" : "";
    b.onclick = () => {
      if (!desbloq) { state.dinheiro -= z.custo; state.zonasDesbloqueadas.push(i); }
      state.zonaAtual = i;
      novoInimigo();
      desenharZonas();
    };
    c.appendChild(b);
  });
}

// so atualiza o disabled, nao redesenha (senao os cliques falhavam)
function atualizarZonas() {
  Array.from(porId("zonas").children).forEach((b, i) => b.disabled = zonaBloqueada(i));
}
