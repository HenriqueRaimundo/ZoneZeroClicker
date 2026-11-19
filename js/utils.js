// funcoes pequenas que sao usadas em todo o lado

// atalho para nao escrever document.getElementById sempre
const porId = id => document.getElementById(id);

const sufixosNumeros = ["", "K", "M", "B", "T", "Qa", "Qi"];

// formata numeros grandes: 1500 -> 1.50K, 2000000 -> 2.00M
function formatarNumero(numero) {
  if (numero < 1000) {
    return numero < 10 && numero % 1 ? numero.toFixed(1) : Math.floor(numero).toString();
  }

  // cada sufixo representa 3 zeros (K = 10^3, M = 10^6, B = 10^9...)
  const posicaoSufixo = Math.min(Math.floor(Math.log10(numero) / 3), sufixosNumeros.length - 1);
  return (numero / Math.pow(1000, posicaoSufixo)).toFixed(2) + sufixosNumeros[posicaoSufixo];
}

// texto que sobe e desaparece ao fim de 1 segundo (dano, dinheiro, avisos)
// a animacao em si esta no CSS, na classe "flutuante"
function flutuante(texto, posicaoX, posicaoY, cor = "#000") {
  const elemento = document.createElement("div");
  elemento.className = "flutuante";
  elemento.textContent = texto;
  elemento.style.color = cor;
  elemento.style.left = posicaoX + "px";
  elemento.style.top = posicaoY + "px";
  document.body.appendChild(elemento);
  
  setTimeout(() => elemento.remove(), 1000);
}
