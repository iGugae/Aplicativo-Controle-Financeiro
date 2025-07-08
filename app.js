let usuarioLogado = null;
let transacoes = [];
let mesAtual = new Date().getMonth();
let anoAtual = new Date().getFullYear();

if (window.matchMedia) {
  // Chrome Android
  document.querySelector('meta[name="theme-color"]').setAttribute('content', '#3f2e56');
  // Para Android 5.0+ com meta tag especial:
  if (navigator.userAgent.toLowerCase().indexOf('android') > -1) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      document.querySelector('meta[name="theme-color"]').setAttribute('content', '#3f2e56');
    });
  }
}

// ⬇️ Inicialização
window.onload = () => {
  const salvo = localStorage.getItem('usuarioAtual');

  if (salvo) {
    usuarioLogado = salvo;
    document.getElementById('loginContainer').style.display = 'none';
    document.getElementById('appContainer').style.display = 'block';
    document.getElementById('usuarioAtual').textContent = `Usuário: ${capitalizeLetra(usuarioLogado)}`;

    carregarTransacoes();
    mostrarMesAtual();
    renderizarLista();
  } else {
    document.getElementById('loginContainer').style.display = 'block';
    document.getElementById('appContainer').style.display = 'none';
  }
};

// 🟢 LOGIN
function fazerLogin() {
  const nome = document.getElementById('usuarioLogin').value.trim();
  if (!nome) return alert("Digite um nome de usuário.");

  usuarioLogado = nome.toLowerCase();
  document.getElementById('loginContainer').style.display = 'none';
  document.getElementById('appContainer').style.display = 'block';
  document.getElementById('usuarioAtual').textContent = `Usuário: ${capitalizeLetra(usuarioLogado)}`;
  localStorage.setItem('usuarioAtual', usuarioLogado);

  carregarTransacoes();
  mostrarMesAtual();
  renderizarLista();
}

// 🔴 LOGOUT
function fazerLogout() {
  usuarioLogado = null;
  transacoes = [];

  document.getElementById('loginContainer').style.display = 'block';
  document.getElementById('appContainer').style.display = 'none';
  document.getElementById('usuarioLogin').value = '';
  localStorage.removeItem('usuarioAtual');
}

// 🧠 Salva transações no localStorage do usuário
function salvarTransacoes() {
  if (!usuarioLogado) return;
  localStorage.setItem(`transacoes_${usuarioLogado}`, JSON.stringify(transacoes));
}

// 🧠 Carrega transações do localStorage do usuário
function carregarTransacoes() {
  if (!usuarioLogado) return;
  const dados = localStorage.getItem(`transacoes_${usuarioLogado}`);
  transacoes = dados ? JSON.parse(dados) : [];
}

// ➕ Adiciona uma transação
function adicionarTransacao(tipo) {
  const descricao = document.getElementById('descricao').value.trim();
  const valor = parseFloat(document.getElementById('valor').value);
  if (!descricao || isNaN(valor)) return;

  transacoes.push({ descricao, valor, tipo, data: new Date().toISOString() });
  salvarTransacoes();
  renderizarLista();

  document.getElementById('valor').value = '';
  document.getElementById('descricao').value = '';
}

// 🔠 Capitaliza a primeira letra
function capitalizeLetra(palavra) {
  return palavra.charAt(0).toUpperCase() + palavra.slice(1);
}

// 📃 Renderiza a lista de transações do mês
function renderizarLista() {
  const lista = document.getElementById('lista');
  lista.innerHTML = '';

  const transacoesFiltradas = filtrarTransacoesDoMes(transacoes);

  transacoesFiltradas.forEach(({ descricao, valor, tipo = 'gasto', data }, indexGlobal) => {
    const li = document.createElement('li');
    li.className = tipo === 'gasto' ? 'gasto' : 'ganho';

    const dataObj = new Date(data);
    const mesmoMes = dataObj.getMonth() === mesAtual && dataObj.getFullYear() === anoAtual;

    // Criar a <span> com texto que poderá rolar
    const texto = document.createElement('span');
    texto.textContent = `${capitalizeLetra(descricao)}: R$ ${valor.toFixed(2)} - ${dataObj.toLocaleDateString()}`;
    texto.className = 'descricao-transacao'; // estilo aplicado no CSS

    li.appendChild(texto);

    if (mesmoMes) {
      const btn = document.createElement('button');
      btn.textContent = '🗑️';
      btn.className = 'delete';
      btn.onclick = () => removerTransacao(indexGlobal);
      li.appendChild(btn);
    }

    lista.appendChild(li);
  });

  const { totalGanho, totalGasto, saldo } = calcularResumoDoMes();
  document.getElementById('ganhoMes').textContent = totalGanho.toFixed(2);
  document.getElementById('gastoMes').textContent = totalGasto.toFixed(2);
  document.getElementById('saldoMes').textContent = saldo.toFixed(2);
  atualizarGraficoPizza();
}

// 🗑️ Remove transação
function removerTransacao(index) {
  transacoes.splice(index, 1);
  salvarTransacoes();
  renderizarLista();
}

// 📅 Filtra transações do mês/ano atual
function filtrarTransacoesDoMes(transacoes) {
  return transacoes.filter(transacao => {
    const data = new Date(transacao.data);
    return data.getMonth() === mesAtual && data.getFullYear() === anoAtual;
  });
}

// 📊 Calcula total do mês
function calcularResumoDoMes() {
  const transacoesMes = filtrarTransacoesDoMes(transacoes);
  let totalGanho = 0;
  let totalGasto = 0;

  transacoesMes.forEach(t => {
    if (t.tipo === 'ganho') totalGanho += t.valor;
    else totalGasto += t.valor;
  });

  return { totalGanho, totalGasto, saldo: totalGanho - totalGasto };
}

// 🗓️ Atualiza nome do mês
function mostrarMesAtual() {
  const meses = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  document.getElementById("mes").textContent = `${meses[mesAtual]} de ${anoAtual}`;
}

// ⬅️➡️ Navegação entre meses
function voltarMes() {
  mesAtual--;
  if (mesAtual < 0) {
    mesAtual = 11;
    anoAtual--;
  }
  mostrarMesAtual();
  renderizarLista();
}

function avancarMes() {
  mesAtual++;
  if (mesAtual > 11) {
    mesAtual = 0;
    anoAtual++;
  }
  mostrarMesAtual();
  renderizarLista();
}

let graficoPizza;

function atualizarGraficoPizza() {
  const ctx = document.getElementById('graficoPizza').getContext('2d');

  const transacoesMes = filtrarTransacoesDoMes(transacoes);
  const agrupado = {};

  transacoesMes.forEach(({ descricao, valor, tipo }) => {
    const desc = capitalizeLetra(descricao.trim());
    if (!agrupado[desc]) agrupado[desc] = { ganho: 0, gasto: 0 };
    agrupado[desc][tipo] += valor;
  });

  const labels = [];
  const data = [];
  const backgroundColors = [];

  Object.entries(agrupado).forEach(([desc, valores]) => {
    if (valores.ganho > 0) {
      labels.push(desc);
      data.push(valores.ganho);
      backgroundColors.push(corVibranteDistintaHSL());
    }
    if (valores.gasto > 0) {
      labels.push(desc);
      data.push(valores.gasto);
      backgroundColors.push(corVibranteDistintaHSL());
    }
  });


  const dados = {
    labels: labels,
    datasets: [{
      label: 'Valores R$',
      data: data,
      backgroundColor: backgroundColors,
      borderColor: 'black',
      borderWidth: 1
    }]
  };

  const config = {
    type: 'pie',
    data: dados,
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            color: '#d9c9b6', // cor do texto
            font: {
              size: 14,
              weight: 'bold'
            }
          }
        },
        tooltip: {
          callbacks: {
            label: context => {
              const label = context.label || '';
              const value = context.parsed || 0;
              return `${label}: R$ ${value.toFixed(2)}`;
            }
          }
        }
      }
    }
  }


  if (graficoPizza) {
    graficoPizza.data = dados;
    graficoPizza.update();
  } else {
    graficoPizza = new Chart(ctx, config);
  }
}

let ultimaCorHue = 0;

function corVibranteDistintaHSL() {
  // Incrementa a matiz para garantir cores mais distintas
  ultimaCorHue = (ultimaCorHue + 67) % 360; // 67 dá bom espaçamento
  const saturation = 80 + Math.floor(Math.random() * 20); // 80% a 100%
  const lightness = 45 + Math.floor(Math.random() * 10); // 45% a 55%
  return `hsl(${ultimaCorHue}, ${saturation}%, ${lightness}%)`;
}
