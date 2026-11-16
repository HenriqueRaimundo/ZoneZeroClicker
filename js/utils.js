// funcoes pequenas que sao usadas em todo o lado

const sufixos = ["", "K", "M", "B", "T", "Qa", "Qi"];

// 1500 -> 1.50K, 2000000 -> 2.00M
function fmt(n) {
  if (n < 1000) return n < 10 && n % 1 ? n.toFixed(1) : Math.floor(n).toString();
  const i = Math.min(Math.floor(Math.log10(n) / 3), sufixos.length - 1);
  return (n / Math.pow(1000, i)).toFixed(2) + sufixos[i];
}

// atalho para nao escrever document.getElementById sempre
const $ = id => document.getElementById(id);

// numero que sobe e desaparece
function flutuante(texto, x, y, cor = "#000") {
  const el = document.createElement("div");
  el.className = "flutuante";
  el.textContent = texto;
  el.style.color = cor;
  el.style.left = x + "px";
  el.style.top = y + "px";
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1000);
}
