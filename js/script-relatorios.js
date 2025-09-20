// Dados simulados - em produção, viria do localStorage
let allBetsData = {};
let filteredData = [];
let charts = {};

// Carregar dados do localStorage
function loadBetsData() {
  const savedBets = localStorage.getItem("betsData");
  const savedMultiplas = localStorage.getItem("multiplaData");

  if (savedBets) {
    allBetsData = JSON.parse(savedBets);
  } else {
    // Dados de exemplo para demonstração
    allBetsData = {
      setembro: [
        {
          data: "2024-09-01",
          esporte: "futebol",
          evento: "Flamengo x Palmeiras",
          metodo: "Over 2.5",
          confianca: "80%",
          odd: "1.75",
          unidade: "2",
          resultado: "green",
          casaApostas: "bet365",
        },
        {
          data: "2024-09-05",
          esporte: "basquete",
          evento: "Lakers x Warriors",
          metodo: "Handicap +5.5",
          confianca: "60%",
          odd: "1.90",
          unidade: "1.5",
          resultado: "red",
          casaApostas: "betano",
        },
        {
          data: "2024-09-10",
          esporte: "tenis",
          evento: "Djokovic x Nadal",
          metodo: "Vencedor",
          confianca: "100%",
          odd: "2.20",
          unidade: "3",
          resultado: "green",
          casaApostas: "superbet",
        },
      ],
      outubro: [
        {
          data: "2024-10-02",
          esporte: "futebol",
          evento: "Barcelona x Real Madrid",
          metodo: "BTTS",
          confianca: "40%",
          odd: "1.65",
          unidade: "1",
          resultado: "red",
          casaApostas: "bet365",
        },
      ],
    };
  }
}

// Aplicar filtros
function applyFilters() {
  showLoading();

  setTimeout(() => {
    const period = document.getElementById("periodFilter").value;
    const sport = document.getElementById("sportFilter").value;
    const result = document.getElementById("resultFilter").value;
    const confidence = document.getElementById("confidenceFilter").value;

    filteredData = [];

    const monthsToInclude =
      period === "todos"
        ? [
            "janeiro",
            "fevereiro",
            "marco",
            "abril",
            "maio",
            "junho",
            "julho",
            "agosto",
            "setembro",
            "outubro",
            "novembro",
            "dezembro",
          ]
        : [period];

    monthsToInclude.forEach((month) => {
      if (allBetsData[month]) {
        allBetsData[month].forEach((bet) => {
          let include = true;

          if (sport !== "todos" && bet.esporte !== sport) include = false;
          if (result !== "todos" && bet.resultado !== result) include = false;
          if (
            confidence !== "todos" &&
            parseInt(bet.confianca) !== parseInt(confidence)
          )
            include = false;

          if (include) {
            filteredData.push({ ...bet, month });
          }
        });
      }
    });

    hideLoading();
    updateDashboard();
    generateDailyResultsGrid();
  }, 1000);
}

// Mostrar/ocultar loading
function showLoading() {
  document.getElementById("loadingSpinner").style.display = "block";
  document.getElementById("statsOverview").style.opacity = "0.5";
}

function hideLoading() {
  document.getElementById("loadingSpinner").style.display = "none";
  document.getElementById("statsOverview").style.opacity = "1";
}

// Atualizar dashboard
function updateDashboard() {
  updateStatsOverview();
  updateCharts();
  updateInsights();
  updateDetailedTable();
}

// Atualizar estatísticas gerais
// Funções de formatação brasileira
function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatPercentage(value) {
  const formatted = Math.abs(value).toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
  return `${value >= 0 ? "+" : ""}${formatted}%`;
}

function formatWinRate(value) {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

// Sua função atualizada
function updateStatsOverview() {
  const stats = calculateStats(filteredData);
  const container = document.getElementById("statsOverview");

  container.innerHTML = `
          <div class="stat-item">
            <div class="stat-value" style="color: #38a169;">
              ${stats.totalBets}
            </div>
            <div class="stat-label">Total de Apostas</div>
          </div>
          <div class="stat-item">
            <div class="stat-value" style="color: #3182ce;">
              ${formatWinRate(stats.winRate)}%
            </div>
            <div class="stat-label">Taxa de Acerto</div>
          </div>
          <div class="stat-item">
            <div class="stat-value" style="color: ${
              stats.totalProfit >= 0 ? "#38a169" : "#e53e3e"
            };">
              ${formatCurrency(stats.totalProfit)}
            </div>
            <div class="stat-label">Lucro Total</div>
          </div>
          <div class="stat-item">
            <div class="stat-value" style="color: ${
              stats.roi >= 0 ? "#38a169" : "#e53e3e"
            };">
              ${formatPercentage(stats.roi)}
            </div>
            <div class="stat-label">ROI Médio</div>
          </div>
          <div class="stat-item">
            <div class="stat-value" style="color: #d69e2e;">
              ${stats.bestSport}
            </div>
            <div class="stat-label">Melhor Esporte</div>
          </div>
        `;
}
// Calcular estatísticas
function calculateStats(data) {
  if (!data.length)
    return {
      totalBets: 0,
      winRate: 0,
      totalProfit: 0,
      roi: 0,
      avgOdd: 0,
      bestSport: "N/A",
      highestWonOdd: 0,
      avgWonOdd: 0,
    };

  const totalBets = data.length;
  const wins = data.filter((bet) => bet.resultado === "green").length;
  const winRate = ((wins / totalBets) * 100).toFixed(1);

  let totalProfit = 0;
  let totalStaked = 0;
  let totalOdd = 0;
  const sportStats = {};

  data.forEach((bet) => {
    const odd = parseFloat(bet.odd) || 1;
    const stake = (parseFloat(bet.unidade) || 1) * 50;

    totalOdd += odd;
    totalStaked += stake;

    if (bet.resultado === "green") {
      totalProfit += odd * stake - stake;
    } else if (bet.resultado === "red") {
      totalProfit -= stake;
    }

    // Stats por esporte
    if (!sportStats[bet.esporte]) {
      sportStats[bet.esporte] = { wins: 0, total: 0 };
    }
    sportStats[bet.esporte].total++;
    if (bet.resultado === "green") {
      sportStats[bet.esporte].wins++;
    }
  });

  const roi =
    totalStaked > 0 ? ((totalProfit / totalStaked) * 100).toFixed(1) : 0;
  const avgOdd = (totalOdd / totalBets).toFixed(2);

  // Cálculos para odds acertadas
  const wonBets = data.filter((bet) => bet.resultado === "green");
  const highestWonOdd =
    wonBets.length > 0
      ? Math.max(...wonBets.map((bet) => parseFloat(bet.odd) || 1))
      : 0;
  const avgWonOdd =
    wonBets.length > 0
      ? (
          wonBets.reduce((sum, bet) => sum + (parseFloat(bet.odd) || 1), 0) /
          wonBets.length
        ).toFixed(2)
      : 0;

  // Melhor esporte
  let bestSport = "Futebol";
  let bestWinRate = 0;
  Object.entries(sportStats).forEach(([sport, stats]) => {
    const winRate = stats.total > 0 ? (stats.wins / stats.total) * 100 : 0;
    if (winRate > bestWinRate && stats.total >= 3) {
      bestWinRate = winRate;
      bestSport = sport;
    }
  });

  return {
    totalBets,
    winRate,
    totalProfit,
    roi,
    avgOdd,
    bestSport,
    highestWonOdd: highestWonOdd.toFixed(2),
    avgWonOdd: avgWonOdd,
  };
}

// Atualizar gráficos
function updateCharts() {
  updateMonthlyChart();
  updateSportChart();
  updateResultsChart();
  updateConfidenceChart();
}

// Gráfico mensal
function updateMonthlyChart() {
  const ctx = document.getElementById("monthlyChart").getContext("2d");

  if (charts.monthly) {
    charts.monthly.destroy();
  }

  const monthlyData = {};
  ["setembro", "outubro", "novembro", "dezembro"].forEach((month) => {
    monthlyData[month] = { profit: 0, bets: 0 };
  });

  filteredData.forEach((bet) => {
    const month = bet.month;
    const stake = (parseFloat(bet.unidade) || 1) * 50;
    const odd = parseFloat(bet.odd) || 1;

    monthlyData[month].bets++;

    if (bet.resultado === "green") {
      monthlyData[month].profit += odd * stake - stake;
    } else if (bet.resultado === "red") {
      monthlyData[month].profit -= stake;
    }
  });

  const labels = Object.keys(monthlyData).map(
    (month) => month.charAt(0).toUpperCase() + month.slice(1)
  );
  const profits = Object.values(monthlyData).map((data) => data.profit);

  charts.monthly = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Lucro Mensal (R$)",
          data: profits,
          borderColor: "#667eea",
          backgroundColor: "rgba(102, 126, 234, 0.1)",
          borderWidth: 3,
          fill: true,
          tension: 0.4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: "top",
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: "rgba(0,0,0,0.1)",
          },
        },
      },
    },
  });
}

// Gráfico por esporte
function updateSportChart() {
  const ctx = document.getElementById("sportChart").getContext("2d");

  if (charts.sport) {
    charts.sport.destroy();
  }

  const sportStats = {};
  filteredData.forEach((bet) => {
    if (!sportStats[bet.esporte]) {
      sportStats[bet.esporte] = { wins: 0, total: 0 };
    }
    sportStats[bet.esporte].total++;
    if (bet.resultado === "green") {
      sportStats[bet.esporte].wins++;
    }
  });

  const sports = Object.keys(sportStats);
  const winRates = sports.map((sport) =>
    sportStats[sport].total > 0
      ? ((sportStats[sport].wins / sportStats[sport].total) * 100).toFixed(1)
      : 0
  );

  charts.sport = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: sports.map((sport) => {
        const icons = {
          futebol: "⚽",
          basquete: "🏀",
          tenis: "🎾",
          volei: "🏐",
          ufc: "🥊",
          esports: "🎮",
        };
        return `${icons[sport] || "🏆"} ${
          sport.charAt(0).toUpperCase() + sport.slice(1)
        }`;
      }),
      datasets: [
        {
          data: winRates,
          backgroundColor: [
            "#667eea",
            "#f093fb",
            "#4facfe",
            "#43e97b",
            "#fa709a",
            "#ffecd2",
            "#a8edea",
            "#fed6e3",
          ],
          borderWidth: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              return context.label + ": " + context.parsed + "% de acerto";
            },
          },
        },
      },
    },
  });
}

// Gráfico de resultados
function updateResultsChart() {
  const ctx = document.getElementById("resultsChart").getContext("2d");

  if (charts.results) {
    charts.results.destroy();
  }

  const resultCount = { green: 0, red: 0, cash: 0, pending: 0 };
  filteredData.forEach((bet) => {
    resultCount[bet.resultado] = (resultCount[bet.resultado] || 0) + 1;
  });

  charts.results = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["🟢 Green", "🔴 Red", "💰 Cash Out", "⏳ Pendente"],
      datasets: [
        {
          label: "Quantidade",
          data: [
            resultCount.green,
            resultCount.red,
            resultCount.cash,
            resultCount.pending,
          ],
          backgroundColor: ["#38a169", "#e53e3e", "#d69e2e", "#718096"],
          borderRadius: 8,
          borderSkipped: false,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: "rgba(0,0,0,0.1)",
          },
        },
      },
    },
  });
}

// Gráfico ROI por confiança
function updateConfidenceChart() {
  const ctx = document.getElementById("confidenceChart").getContext("2d");

  if (charts.confidence) {
    charts.confidence.destroy();
  }

  const confidenceStats = {};
  filteredData.forEach((bet) => {
    const conf = parseInt(bet.confianca);
    if (!confidenceStats[conf]) {
      confidenceStats[conf] = { profit: 0, staked: 0 };
    }

    const stake = (parseFloat(bet.unidade) || 1) * 50;
    const odd = parseFloat(bet.odd) || 1;

    confidenceStats[conf].staked += stake;

    if (bet.resultado === "green") {
      confidenceStats[conf].profit += odd * stake - stake;
    } else if (bet.resultado === "red") {
      confidenceStats[conf].profit -= stake;
    }
  });

  const confidenceLevels = Object.keys(confidenceStats).sort((a, b) => a - b);
  const rois = confidenceLevels.map((conf) => {
    const stats = confidenceStats[conf];
    return stats.staked > 0
      ? ((stats.profit / stats.staked) * 100).toFixed(1)
      : 0;
  });

  charts.confidence = new Chart(ctx, {
    type: "radar",
    data: {
      labels: confidenceLevels.map((conf) => `${conf}% Confiança`),
      datasets: [
        {
          label: "ROI (%)",
          data: rois,
          borderColor: "#764ba2",
          backgroundColor: "rgba(118, 75, 162, 0.2)",
          borderWidth: 3,
          pointBackgroundColor: "#667eea",
          pointBorderColor: "#fff",
          pointBorderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
        },
      },
      scales: {
        r: {
          beginAtZero: true,
          grid: {
            color: "rgba(0,0,0,0.1)",
          },
        },
      },
    },
  });
}

// Atualizar insights
function updateInsights() {
  const stats = calculateStats(filteredData);
  const container = document.getElementById("insightsContainer");

  const insights = [];

  // Insight sobre taxa de acerto
  if (stats.winRate >= 70) {
    insights.push({
      text: `🎯 Excelente! Sua taxa de acerto está em ${stats.winRate}%, muito acima da média do mercado (55%).`,
      trend: "up",
    });
  } else if (stats.winRate >= 50) {
    insights.push({
      text: `📊 Sua taxa de acerto (${stats.winRate}%) está na média. Foque em melhorar a seleção de apostas.`,
      trend: "stable",
    });
  } else {
    insights.push({
      text: `⚠️ Taxa de acerto baixa (${stats.winRate}%). Revise sua estratégia e seja mais seletivo.`,
      trend: "down",
    });
  }

  // Insight sobre ROI
  if (stats.roi > 10) {
    insights.push({
      text: `💰 ROI fantástico de ${stats.roi}%! Você está superando o mercado significativamente.`,
      trend: "up",
    });
  } else if (stats.roi > 0) {
    insights.push({
      text: `📈 ROI positivo de ${stats.roi}%. Continue assim, qualquer lucro no longo prazo é sucesso.`,
      trend: "up",
    });
  } else {
    insights.push({
      text: `📉 ROI negativo (${stats.roi}%). Analise suas perdas e ajuste o bankroll management.`,
      trend: "down",
    });
  }

  // Insight sobre melhor esporte
  if (stats.bestSport !== "N/A") {
    const sportIcons = {
      futebol: "⚽",
      basquete: "🏀",
      tenis: "🎾",
      volei: "🏐",
      ufc: "🥊",
      esports: "🎮",
    };
    insights.push({
      text: `${
        sportIcons[stats.bestSport.toLowerCase()] || "🏆"
      } Seu melhor esporte é ${
        stats.bestSport
      }. Continue focando nesta modalidade!`,
      trend: "up",
    });
  }

  // Insight sobre volume de apostas
  if (filteredData.length < 10) {
    insights.push({
      text: `📊 Volume baixo de apostas (${filteredData.length}). Aumente gradualmente para ter dados mais consistentes.`,
      trend: "stable",
    });
  } else if (filteredData.length > 50) {
    insights.push({
      text: `🚀 Ótimo volume de apostas (${filteredData.length})! Dados suficientes para análises confiáveis.`,
      trend: "up",
    });
  }

  // Insight sobre maior odd acertada
  if (stats.highestWonOdd > 0) {
    if (stats.highestWonOdd >= 5.0) {
      insights.push({
        text: `🎯 Impressionante! Sua maior odd acertada foi ${stats.highestWonOdd}. Você tem coragem para apostas arriscadas!`,
        trend: "up",
      });
    } else if (stats.highestWonOdd >= 3.0) {
      insights.push({
        text: `🏆 Boa! Maior odd acertada: ${stats.highestWonOdd}. Equilíbrio entre risco e segurança.`,
        trend: "up",
      });
    } else {
      insights.push({
        text: `🛡️ Maior odd acertada: ${stats.highestWonOdd}. Perfil conservador, focando em apostas mais seguras.`,
        trend: "stable",
      });
    }
  }

  // Insight sobre média de odds acertadas
  if (stats.avgWonOdd > 0) {
    if (stats.avgWonOdd >= 3.0) {
      insights.push({
        text: `📊 Média das odds acertadas: ${stats.avgWonOdd}. Você acerta apostas de valor médio-alto!`,
        trend: "up",
      });
    } else if (stats.avgWonOdd >= 2.0) {
      insights.push({
        text: `⚖️ Média das odds acertadas: ${stats.avgWonOdd}. Bom equilíbrio entre risco e acertos.`,
        trend: "stable",
      });
    } else {
      insights.push({
        text: `🎯 Média das odds acertadas: ${stats.avgWonOdd}. Foca em apostas seguras e certeiras.`,
        trend: "stable",
      });
    }
  }

  container.innerHTML = insights
    .map(
      (insight) => `
          <div class="insight-item">
            <div class="insight-text">
              ${insight.text}
              <span class="trend-indicator trend-${insight.trend}">
                ${
                  insight.trend === "up"
                    ? "↗️ Positivo"
                    : insight.trend === "down"
                    ? "↘️ Atenção"
                    : "➡️ Neutro"
                }
              </span>
            </div>
          </div>
        `
    )
    .join("");
}

// Atualizar tabela detalhada
function updateDetailedTable() {
  const tbody = document.querySelector("#detailedTable tbody");

  tbody.innerHTML = filteredData
    .map((bet) => {
      const stake = (parseFloat(bet.unidade) || 1) * 50;
      const odd = parseFloat(bet.odd) || 1;
      let profit = 0;
      let roi = 0;
      let labelLucroOuPrejuizo = "";

      if (bet.resultado === "green") {
        profit = odd * stake - stake;
        roi = ((profit / stake) * 100).toFixed(1);
        labelLucroOuPrejuizo = "Lucro";
      } else if (bet.resultado === "red") {
        profit = -stake;
        roi = -100;
        labelLucroOuPrejuizo = "Prejuízo";
      }

      const sportIcons = {
        futebol: "⚽",
        basquete: "🏀",
        tenis: "🎾",
        volei: "🏐",
        ufc: "🥊",
        esports: "🎮",
      };

      let eventoDescricao = bet.evento || "";
      if (!eventoDescricao.trim()) {
        if (bet.tipo === "multipla") {
          eventoDescricao = "Aposta Múltipla";
        } else if (bet.metodo && bet.metodo.trim()) {
          eventoDescricao = bet.metodo;
        } else {
          eventoDescricao = `${
            bet.esporte.charAt(0).toUpperCase() + bet.esporte.slice(1)
          } - ${bet.casaApostas}`;
        }
      }

      // CORREÇÃO SIMPLES: Substituir apenas esta linha
      const dataFormatada = bet.data
        .split("T")[0]
        .split("-")
        .reverse()
        .join("/");

      return `
            <tr>
              <td>${dataFormatada}</td>
              <td>
                <span class="sport-icon">${
                  sportIcons[bet.esporte] || "🏆"
                }</span>
                ${bet.esporte.charAt(0).toUpperCase() + bet.esporte.slice(1)}
              </td>
              <td>${eventoDescricao}</td>
              <td>${parseFloat(bet.odd).toFixed(2)}</td>
              <td>R$ ${stake.toFixed(2)}</td>
              <td>
                <span class="result-badge badge-${bet.resultado}">
                  ${bet.resultado.toUpperCase()}
                </span>
              </td>
              <td style="color: ${
                profit >= 0 ? "#38a169" : "#e53e3e"
              }; font-weight: 600;">
                <span style="font-size: 11px; opacity: 0.7;">${labelLucroOuPrejuizo}:</span><br>
                R$ ${Math.abs(profit).toFixed(2)}
              </td>
            </tr>
          `;
    })
    .join("");
}
// Inicialização
document.addEventListener("DOMContentLoaded", function () {
  loadBetsData();
  applyFilters(); // Aplicar filtros iniciais
});

// Adicionar funcionalidade de exportar relatório
function exportReport() {
  const stats = calculateStats(filteredData);
  const reportData = {
    periodo: document.getElementById("periodFilter").value,
    data_geracao: new Date().toISOString(),
    estatisticas: stats,
    apostas: filteredData,
  };

  const blob = new Blob([JSON.stringify(reportData, null, 2)], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `relatorio_apostas_${
    new Date().toISOString().split("T")[0]
  }.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Adicionar botão de exportar
document.querySelector(".filters-section").insertAdjacentHTML(
  "beforeend",
  `
        <div style="text-align: center; margin-top: 20px;">
          <button onclick="exportReport()" style="background: linear-gradient(135deg, #48bb78 0%, #38a169 100%); color: white; padding: 12px 24px; border: none; border-radius: 12px; font-weight: 600; cursor: pointer; margin-right: 10px;">
            📊 Exportar Relatório
          </button>
          <button onclick="window.print()" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 24px; border: none; border-radius: 12px; font-weight: 600; cursor: pointer;">
            🖨️ Imprimir
          </button>
        </div>
      `
);

// ==================== 1. CONFETTI QUANDO BATE 1000 REAIS ====================
function checkLucroMilestone() {
  const lucroAtual = calculateTotalProfit();
  const lucroAnterior = localStorage.getItem("ultimoLucroMilestone") || 0;

  const milestoneAtual = Math.floor(lucroAtual / 1000);
  const milestoneAnterior = Math.floor(lucroAnterior / 1000);

  if (milestoneAtual > milestoneAnterior && lucroAtual > 0) {
    triggerConfetti();
    showMilestoneMessage(milestoneAtual * 1000);
  }

  localStorage.setItem("ultimoLucroMilestone", lucroAtual);
}

function triggerConfetti() {
  // Criar confetti usando CSS/JS puro
  for (let i = 0; i < 50; i++) {
    createConfettiPiece();
  }
}

function createConfettiPiece() {
  const confetti = document.createElement("div");
  confetti.style.cssText = `
    position: fixed;
    width: 10px;
    height: 10px;
    background: ${
      ["#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4", "#feca57"][
        Math.floor(Math.random() * 5)
      ]
    };
    left: ${Math.random() * 100}vw;
    top: -10px;
    z-index: 10000;
    pointer-events: none;
    border-radius: 50%;
    animation: confetti-fall ${2 + Math.random() * 3}s ease-out forwards;
  `;

  document.body.appendChild(confetti);

  setTimeout(() => confetti.remove(), 5000);
}

// CSS para animação do confetti (adicionar ao <style>)
const confettiCSS = `
@keyframes confetti-fall {
  0% {
    transform: translateY(-10px) rotateZ(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotateZ(720deg);
    opacity: 0;
  }
}
`;

function showMilestoneMessage(valor) {
  const toast = document.createElement("div");
  toast.innerHTML = `
    <div style="
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      border-radius: 15px;
      z-index: 10001;
      box-shadow: 0 10px 25px rgba(0,0,0,0.2);
      animation: slideIn 0.5s ease-out;
    ">
      <div style="font-size: 20px; margin-bottom: 5px;">🎉 Parabéns!</div>
      <div>Você atingiu R$ ${valor.toFixed(2)} de lucro!</div>
    </div>
  `;

  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

// ==================== 2. ÍCONES E SETAS NOS CARDS ====================
function updateStatsCards() {
  const stats = calculateStats();
  const trends = calculateTrends(); // Nova função para calcular tendências

  document.getElementById("totalBets").innerHTML = `
    <div class="stat-icon">🎯</div>
    <div class="stat-number">${stats.totalBets}</div>
    <div class="stat-label">TOTAL DE APOSTAS</div>
    <div class="stat-trend ${trends.totalBets > 0 ? "trend-up" : "trend-down"}">
      ${trends.totalBets > 0 ? "↗️" : "↘️"} ${Math.abs(trends.totalBets)}%
    </div>
  `;

  document.getElementById("winRate").innerHTML = `
    <div class="stat-icon">📊</div>
    <div class="stat-number">${stats.winRate}%</div>
    <div class="stat-label">TAXA DE ACERTO</div>
    <div class="stat-trend ${trends.winRate > 0 ? "trend-up" : "trend-down"}">
      ${trends.winRate > 0 ? "↗️" : "↘️"} ${Math.abs(trends.winRate).toFixed(
    1
  )}%
    </div>
  `;

  document.getElementById("totalProfit").innerHTML = `
    <div class="stat-icon">💰</div>
    <div class="stat-number">R$ ${stats.totalProfit.toFixed(2)}</div>
    <div class="stat-label">LUCRO TOTAL</div>
    <div class="stat-trend ${
      trends.totalProfit > 0 ? "trend-up" : "trend-down"
    }">
      ${trends.totalProfit > 0 ? "↗️" : "↘️"} R$ ${Math.abs(
    trends.totalProfit
  ).toFixed(2)}
    </div>
  `;

  document.getElementById("avgROI").innerHTML = `
    <div class="stat-icon">📈</div>
    <div class="stat-number">+${stats.avgROI}%</div>
    <div class="stat-label">ROI MÉDIO</div>
    <div class="stat-trend ${trends.avgROI > 0 ? "trend-up" : "trend-down"}">
      ${trends.avgROI > 0 ? "↗️" : "↘️"} ${Math.abs(trends.avgROI).toFixed(1)}%
    </div>
  `;
}

// Função para calcular tendências (compara últimos 30 dias com 30 dias anteriores)
function calculateTrends() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  const recent = betsData.filter((bet) => new Date(bet.data) >= thirtyDaysAgo);
  const previous = betsData.filter((bet) => {
    const betDate = new Date(bet.data);
    return betDate >= sixtyDaysAgo && betDate < thirtyDaysAgo;
  });

  const recentStats = calculateStatsForPeriod(recent);
  const previousStats = calculateStatsForPeriod(previous);

  return {
    totalBets:
      ((recentStats.totalBets - previousStats.totalBets) /
        (previousStats.totalBets || 1)) *
      100,
    winRate: recentStats.winRate - previousStats.winRate,
    totalProfit: recentStats.totalProfit - previousStats.totalProfit,
    avgROI: recentStats.avgROI - previousStats.avgROI,
  };
}

// ==================== 3. INSIGHTS INTELIGENTES - MELHOR DIA DA SEMANA ====================
function generateSmartInsights() {
  const insights = [];

  // Análise por dia da semana
  const dayPerformance = analyzeDayOfWeek();
  if (dayPerformance.bestDay) {
    insights.push({
      icon: "📅",
      text: `Você tem melhor performance às ${dayPerformance.bestDay.name}s (${dayPerformance.bestDay.winRate}% de acerto)`,
      type: "positive",
    });
  }

  // Análise de streaks
  const currentStreak = calculateCurrentStreak();
  if (currentStreak.type === "win" && currentStreak.count >= 3) {
    insights.push({
      icon: "🔥",
      text: `Você está em uma sequência de ${currentStreak.count} acertos consecutivos! Continue assim!`,
      type: "positive",
    });
  }

  // Análise de apostas múltiplas vs simples
  const multipleVsSingle = analyzeMultipleVsSingle();
  if (multipleVsSingle.multiplesBetter) {
    insights.push({
      icon: "🎯",
      text: `Suas apostas múltiplas têm ${multipleVsSingle.multiplesWinRate}% de acerto - continue focando nelas!`,
      type: "positive",
    });
  }

  return insights;
}

function analyzeDayOfWeek() {
  const dayStats = {};
  const dayNames = [
    "Domingo",
    "Segunda",
    "Terça",
    "Quarta",
    "Quinta",
    "Sexta",
    "Sábado",
  ];

  betsData.forEach((bet) => {
    const dayOfWeek = new Date(bet.data).getDay();
    const dayName = dayNames[dayOfWeek];

    if (!dayStats[dayName]) {
      dayStats[dayName] = { total: 0, wins: 0 };
    }

    dayStats[dayName].total++;
    if (bet.resultado === "green") {
      dayStats[dayName].wins++;
    }
  });

  let bestDay = null;
  let bestWinRate = 0;

  Object.entries(dayStats).forEach(([day, stats]) => {
    if (stats.total >= 3) {
      // Só considera dias com pelo menos 3 apostas
      const winRate = (stats.wins / stats.total) * 100;
      if (winRate > bestWinRate) {
        bestWinRate = winRate;
        bestDay = { name: day, winRate: winRate.toFixed(1) };
      }
    }
  });

  return { bestDay };
}

// ==================== 4. CSS PARA ÍCONES E TENDÊNCIAS ====================
const newCSS = `
.stat-card {
  position: relative;
  overflow: visible;
}

.stat-icon {
  font-size: 24px;
  margin-bottom: 10px;
}

.stat-trend {
  font-size: 12px;
  margin-top: 8px;
  font-weight: 500;
}

.trend-up {
  color: #38a169;
}

.trend-down {
  color: #e53e3e;
}

.insight-item {
  display: flex;
  align-items: center;
  padding: 15px;
  margin: 10px 0;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border-left: 4px solid;
}

.insight-item.positive {
  border-left-color: #38a169;
}

.insight-item.neutral {
  border-left-color: #3182ce;
}

.insight-item.warning {
  border-left-color: #d69e2e;
}

.insight-icon {
  font-size: 20px;
  margin-right: 12px;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
`;

// ==================== 5. CHAMAR FUNÇÕES NO CARREGAMENTO ====================
function initDashboardImprovements() {
  // Adicionar CSS
  const style = document.createElement("style");
  style.textContent = confettiCSS + newCSS;
  document.head.appendChild(style);

  // Verificar milestone de lucro
  checkLucroMilestone();

  // Atualizar cards com ícones e tendências
  updateStatsCards();

  // Gerar e exibir insights inteligentes
  const insights = generateSmartInsights();
  displayInsights(insights);
}

function displayInsights(insights) {
  const insightsContainer = document.getElementById("smartInsights"); // Assumindo que existe

  if (insightsContainer && insights.length > 0) {
    insightsContainer.innerHTML = insights
      .map(
        (insight) => `
      <div class="insight-item ${insight.type}">
        <div class="insight-icon">${insight.icon}</div>
        <div>${insight.text}</div>
      </div>
    `
      )
      .join("");
  }
}

// Chamar quando a página carregar
document.addEventListener("DOMContentLoaded", initDashboardImprovements);

// ==================== SISTEMA DE EXPORTAÇÃO PDF ====================

// Adicionar biblioteca jsPDF (coloque no HTML antes do seu script)
// <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
// <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.25/jspdf.plugin.autotable.min.js"></script>

function exportToPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Configurações do documento
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;

  // Header do PDF
  addPDFHeader(doc, pageWidth);

  // Estatísticas resumidas
  addPDFStats(doc, pageWidth);

  // Tabela de apostas filtradas
  addPDFTable(doc);

  // Footer
  addPDFFooter(doc, pageWidth, pageHeight);

  // Salvar o arquivo
  const fileName = `BetTracker_Relatorio_${
    new Date().toISOString().split("T")[0]
  }.pdf`;
  doc.save(fileName);

  // Mostrar toast de sucesso
  showExportToast();
}

function addPDFHeader(doc, pageWidth) {
  // Gradient background simulation with rectangles
  doc.setFillColor(102, 126, 234); // #667eea
  doc.rect(0, 0, pageWidth, 40, "F");

  // Logo/Icon (usando texto por simplicidade)
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont(undefined, "bold");
  doc.text("🎯 Bet Tracker Pro", 20, 25);

  // Data do relatório
  doc.setFontSize(12);
  doc.setFont(undefined, "normal");
  const currentDate = new Date().toLocaleDateString("pt-BR");
  doc.text(`Relatório gerado em: ${currentDate}`, pageWidth - 20, 25, {
    align: "right",
  });

  // Título principal
  doc.setTextColor(51, 51, 51);
  doc.setFontSize(18);
  doc.setFont(undefined, "bold");
  doc.text("📊 Relatórios Avançados", 20, 60);
}

function addPDFStats(doc, pageWidth) {
  const stats = calculateStats();
  const startY = 80;

  // Background para estatísticas
  doc.setFillColor(248, 250, 252);
  doc.rect(15, startY - 5, pageWidth - 30, 35, "F");
  doc.setDrawColor(226, 232, 240);
  doc.rect(15, startY - 5, pageWidth - 30, 35, "S");

  // Estatísticas em 4 colunas
  doc.setTextColor(51, 51, 51);
  doc.setFontSize(10);
  doc.setFont(undefined, "bold");

  const colWidth = (pageWidth - 40) / 4;

  // Total de Apostas
  doc.text("🎯 TOTAL DE APOSTAS", 20, startY + 5);
  doc.setFontSize(14);
  doc.setTextColor(102, 126, 234);
  doc.text(stats.totalBets.toString(), 20, startY + 15);

  // Taxa de Acerto
  doc.setFontSize(10);
  doc.setTextColor(51, 51, 51);
  doc.text("📊 TAXA DE ACERTO", 20 + colWidth, startY + 5);
  doc.setFontSize(14);
  doc.setTextColor(56, 161, 105); // Verde
  doc.text(`${stats.winRate}%`, 20 + colWidth, startY + 15);

  // Lucro Total
  doc.setFontSize(10);
  doc.setTextColor(51, 51, 51);
  doc.text("💰 LUCRO TOTAL", 20 + colWidth * 2, startY + 5);
  doc.setFontSize(14);
  doc.setTextColor(
    stats.totalProfit >= 0 ? 56 : 229,
    stats.totalProfit >= 0 ? 161 : 62,
    stats.totalProfit >= 0 ? 105 : 62
  );
  doc.text(
    `R$ ${stats.totalProfit.toFixed(2)}`,
    20 + colWidth * 2,
    startY + 15
  );

  // ROI Médio
  doc.setFontSize(10);
  doc.setTextColor(51, 51, 51);
  doc.text("📈 ROI MÉDIO", 20 + colWidth * 3, startY + 5);
  doc.setFontSize(14);
  doc.setTextColor(102, 126, 234);
  doc.text(`+${stats.avgROI}%`, 20 + colWidth * 3, startY + 15);
}

function addPDFTable(doc) {
  // Preparar dados da tabela (usando dados filtrados)
  const tableData = filteredData.map((bet) => {
    const stake = (parseFloat(bet.unidade) || 1) * 50;
    const odd = parseFloat(bet.odd) || 1;
    let profit = 0;

    if (bet.resultado === "green") {
      profit = odd * stake - stake;
    } else if (bet.resultado === "red") {
      profit = -stake;
    }

    return [
      new Date(bet.data).toLocaleDateString("pt-BR"),
      bet.esporte.charAt(0).toUpperCase() + bet.esporte.slice(1),
      bet.evento || bet.metodo || "N/A",
      parseFloat(bet.odd).toFixed(2),
      `R$ ${stake.toFixed(2)}`,
      bet.resultado.toUpperCase(),
      `R$ ${Math.abs(profit).toFixed(2)}`,
    ];
  });

  // Configurar tabela com autoTable
  doc.autoTable({
    head: [
      [
        "Data",
        "Esporte",
        "Evento",
        "Odd",
        "Valor",
        "Resultado",
        "Lucro/Prejuízo",
      ],
    ],
    body: tableData,
    startY: 130,
    theme: "grid",
    headStyles: {
      fillColor: [102, 126, 234],
      textColor: 255,
      fontSize: 10,
      fontStyle: "bold",
    },
    bodyStyles: {
      fontSize: 9,
      cellPadding: 3,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    styles: {
      lineColor: [226, 232, 240],
      lineWidth: 0.1,
    },
    columnStyles: {
      0: { cellWidth: 25 }, // Data
      1: { cellWidth: 25 }, // Esporte
      2: { cellWidth: 45 }, // Evento
      3: { cellWidth: 20 }, // Odd
      4: { cellWidth: 25 }, // Valor
      5: { cellWidth: 25 }, // Resultado
      6: { cellWidth: 30 }, // Lucro/Prejuízo
    },
    didParseCell: function (data) {
      // Colorir resultados
      if (data.column.index === 5) {
        // Coluna Resultado
        if (data.cell.text[0] === "GREEN") {
          data.cell.styles.textColor = [56, 161, 105];
          data.cell.styles.fontStyle = "bold";
        } else if (data.cell.text[0] === "RED") {
          data.cell.styles.textColor = [229, 62, 62];
          data.cell.styles.fontStyle = "bold";
        }
      }

      // Colorir lucro/prejuízo
      if (data.column.index === 6) {
        const isProfit = !data.cell.text[0].includes("-");
        data.cell.styles.textColor = isProfit ? [56, 161, 105] : [229, 62, 62];
        data.cell.styles.fontStyle = "bold";
      }
    },
  });
}

function addPDFFooter(doc, pageWidth, pageHeight) {
  const footerY = pageHeight - 20;

  // Linha separadora
  doc.setDrawColor(226, 232, 240);
  doc.line(20, footerY - 5, pageWidth - 20, footerY - 5);

  // Texto do footer
  doc.setFontSize(8);
  doc.setTextColor(107, 114, 126);
  doc.text(
    "Relatório gerado automaticamente pelo Bet Tracker Pro",
    20,
    footerY
  );
  doc.text(
    `Página 1 de 1 • ${filteredData.length} apostas analisadas`,
    pageWidth - 20,
    footerY,
    { align: "right" }
  );
}

// ==================== SUBSTITUIR BOTÃO IMPRIMIR ====================
function replacePrintButton() {
  // Remover botão imprimir se existir
  const printButton = document.querySelector(
    'button[onclick*="print"], #printButton, .print-btn'
  );
  if (printButton) {
    printButton.remove();
  }

  // Adicionar botão de exportar PDF
  const exportButton = document.createElement("button");
  exportButton.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14,2 14,8 20,8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <polyline points="10,9 9,9 8,9"/>
    </svg>
    Exportar PDF
  `;
  exportButton.className = "btn-exportar-pdf";
  exportButton.onclick = exportToPDF;

  // Adicionar ao container dos filtros (ao lado do "Aplicar Filtros")
  const filtersContainer = document.querySelector(
    ".filters-container, .btn-aplicar-filtros"
  ).parentElement;
  if (filtersContainer) {
    filtersContainer.appendChild(exportButton);
  }
}

function showExportToast() {
  const toast = document.createElement("div");
  toast.innerHTML = `
    <div style="
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: linear-gradient(135deg, #38a169, #48bb78);
      color: white;
      padding: 15px 20px;
      border-radius: 10px;
      z-index: 10001;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      animation: slideUp 0.3s ease-out;
      display: flex;
      align-items: center;
      gap: 10px;
    ">
      <span style="font-size: 18px;">📄</span>
      <div>
        <div style="font-weight: bold;">PDF Exportado!</div>
        <div style="font-size: 12px; opacity: 0.9;">Download iniciado automaticamente</div>
      </div>
    </div>
  `;

  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// ==================== CSS PARA BOTÃO PDF ====================
const pdfButtonCSS = `
.btn-exportar-pdf {
  background: linear-gradient(135deg, #e53e3e, #c53030);
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  margin-left: 10px;
}

.btn-exportar-pdf:hover {
  background: linear-gradient(135deg, #c53030, #9c2626);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(229, 62, 62, 0.3);
}

@keyframes slideUp {
  from {
    transform: translateY(100px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
`;

function generateDailyResultsGrid() {
  const container = document.getElementById("dailyResultsGrid");
  const monthYearDisplay = document.getElementById("monthYearDisplay");

  if (!container) return;

  const periodFilter = document.getElementById("periodFilter");

  const selectedMonth =
    periodFilter && periodFilter.value !== "todos"
      ? getMonthNumberFromName(periodFilter.value)
      : new Date().getMonth() + 1;
  const selectedYear = new Date().getFullYear();

  const monthNames = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];
  if (monthYearDisplay) {
    monthYearDisplay.textContent = `${
      monthNames[selectedMonth - 1]
    } ${selectedYear}`;
  }

  const dailyResults = calculateDailyResults(selectedMonth, selectedYear);
  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
  const firstDay = new Date(selectedYear, selectedMonth - 1, 1).getDay();

  let gridHTML = "";

  // Dias vazios do início
  for (let i = 0; i < firstDay; i++) {
    gridHTML += '<div class="day-block no-data"></div>';
  }

  // Dias do mês
  for (let day = 1; day <= daysInMonth; day++) {
    const result = dailyResults[day];
    let cssClass = "no-data";
    let profitText = "";

    if (result) {
      cssClass =
        result.profit > 0 ? "green" : result.profit < 0 ? "red" : "neutral";
      profitText = `<div class="day-profit">${formatCurrency(
        result.profit
      )}</div>`;
    }

    gridHTML += `
      <div class="day-block ${cssClass}" 
           onclick="showDayBets(${day}, ${selectedMonth}, ${selectedYear})"
           style="cursor: pointer;"
           title="Dia ${day}: ${
      result
        ? formatCurrency(result.profit) + " (" + result.bets + " apostas)"
        : "Sem apostas"
    }">
        <div class="day-number">${day}</div>
        ${profitText}
      </div>`;
  }

  container.innerHTML = gridHTML;
}

// Funções de navegação entre meses
function previousMonth() {
  // Implementar lógica para mês anterior
  console.log("Mês anterior");
}

function nextMonth() {
  // Implementar lógica para próximo mês
  console.log("Próximo mês");
}

// Função auxiliar para converter nome do mês em número
function getMonthNumberFromName(monthName) {
  const monthMap = {
    janeiro: 1,
    fevereiro: 2,
    marco: 3,
    abril: 4,
    maio: 5,
    junho: 6,
    julho: 7,
    agosto: 8,
    setembro: 9,
    outubro: 10,
    novembro: 11,
    dezembro: 12,
  };
  return monthMap[monthName.toLowerCase()] || new Date().getMonth() + 1;
}

function calculateDailyResults(month, year) {
  console.log("=== calculateDailyResults ===");
  console.log("Month:", month, "Year:", year);

  const dailyResults = {};
  const dataToProcess =
    filteredData.length > 0 ? filteredData : allBetsData.setembro || [];

  dataToProcess.forEach((bet, index) => {
    // CORREÇÃO: Processar data como string para evitar problemas de fuso horário
    const dateParts = bet.data.split("-"); // [2025, 09, 18]
    const betYear = parseInt(dateParts[0]);
    const betMonth = parseInt(dateParts[1]);
    const betDay = parseInt(dateParts[2]);

    console.log(
      `Bet ${index}: ${bet.data} -> Year: ${betYear}, Month: ${betMonth}, Day: ${betDay}`
    );

    if (betMonth === month && betYear === year) {
      console.log("Match found! Day:", betDay);

      if (!dailyResults[betDay]) {
        dailyResults[betDay] = { profit: 0, bets: 0 };
      }

      const stake = (parseFloat(bet.unidade) || 1) * 50;
      const odd = parseFloat(bet.odd) || 1;

      if (bet.resultado === "green") {
        dailyResults[betDay].profit += odd * stake - stake;
      } else if (bet.resultado === "red") {
        dailyResults[betDay].profit -= stake;
      }

      dailyResults[betDay].bets++;
      console.log(`Day ${betDay} updated:`, dailyResults[betDay]);
    }
  });

  console.log("Final dailyResults:", dailyResults);
  return dailyResults;
}

// Função para mostrar apostas do dia
function showDayBets(day, month, year) {
  const dayBets = getDayBets(day, month, year);

  if (dayBets.length === 0) {
    alert("Nenhuma aposta encontrada para este dia");
    return;
  }

  const modal = document.getElementById("betsModal");
  const modalTitle = document.getElementById("modalTitle");
  const modalContent = document.getElementById("modalBetsContent");

  modalTitle.textContent = `Apostas do dia ${day}/${month
    .toString()
    .padStart(2, "0")}/${year}`;

  // Contar greens e reds
  const greens = dayBets.filter((bet) => bet.resultado === "green").length;
  const reds = dayBets.filter((bet) => bet.resultado === "red").length;
  const total = dayBets.length;

  let betsHTML = `
        <div style="display: flex; gap: 15px; margin-bottom: 20px; justify-content: center;">
            <div style="background: #d4edda; color: #155724; padding: 10px 15px; border-radius: 20px; font-weight: bold; display: flex; align-items: center; gap: 5px;">
                <span style="background: #28a745; color: white; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px;">✓</span>
                ${greens} Green${greens !== 1 ? "s" : ""}
            </div>
            <div style="background: #f8d7da; color: #721c24; padding: 10px 15px; border-radius: 20px; font-weight: bold; display: flex; align-items: center; gap: 5px;">
                <span style="background: #dc3545; color: white; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px;">✗</span>
                ${reds} Red${reds !== 1 ? "s" : ""}
            </div>
            <div style="background: #e9ecef; color: #495057; padding: 10px 15px; border-radius: 20px; font-weight: bold;">
                Total: ${total}
            </div>
        </div>
    `;

  dayBets.forEach((bet) => {
    const unidade = parseFloat(bet.unidade) || 1;
    const stake = unidade * 50;
    const odd = parseFloat(bet.odd) || 1;
    let profit = 0;

    if (bet.resultado === "green") {
      profit = odd * stake - stake;
    } else if (bet.resultado === "red") {
      profit = stake;
    }

    const unidadeText = unidade === 1 ? "Unidade" : "Unidades";

    betsHTML += `
            <div class="bet-item ${bet.resultado}">
                <div class="bet-details">
                    <div class="bet-detail">
                        <label>Unidade</label>
                        <span>${bet.unidade} ${unidadeText} (${formatCurrency(
      stake
    )})</span>
                    </div>
                    <div class="bet-detail">
                        <label>Odd</label>
                        <span>${bet.odd}</span>
                    </div>
                    <div class="bet-detail">
                        <label>Resultado</label>
                        <span class="profit-badge ${
                          bet.resultado === "green" ? "positive" : "negative"
                        }">
                            ${bet.resultado.toUpperCase()} ${
      bet.resultado === "red" ? "-" : ""
    }${formatCurrency(profit)}
                        </span>
                    </div>
                </div>
            </div>
        `;
  });

  modalContent.innerHTML = betsHTML;
  modal.style.display = "block";
}
// Função para buscar apostas de um dia específico
function getDayBets(day, month, year) {
  const dataToProcess =
    filteredData.length > 0 ? filteredData : allBetsData.setembro || [];

  return dataToProcess.filter((bet) => {
    const dateParts = bet.data.split("-");
    const betYear = parseInt(dateParts[0]);
    const betMonth = parseInt(dateParts[1]);
    const betDay = parseInt(dateParts[2]);

    return betDay === day && betMonth === month && betYear === year;
  });
}

// Event listeners para fechar o modal
document.addEventListener("DOMContentLoaded", function () {
  const modal = document.getElementById("betsModal");
  const closeBtn = document.querySelector(".close");

  // Fechar modal ao clicar no X
  closeBtn.onclick = function () {
    modal.style.display = "none";
  };

  // Fechar modal ao clicar fora dele
  window.onclick = function (event) {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  };
});

// ==================== INICIALIZAÇÃO ====================
function initPDFExport() {
  // Adicionar CSS
  const style = document.createElement("style");
  style.textContent = pdfButtonCSS;
  document.head.appendChild(style);

  // Substituir botão imprimir
  replacePrintButton();
}

// Chamar quando a página carregar
document.addEventListener("DOMContentLoaded", initPDFExport);
