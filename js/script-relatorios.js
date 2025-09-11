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
        ? ["setembro", "outubro", "novembro", "dezembro"]
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
function updateStatsOverview() {
  const stats = calculateStats(filteredData);
  const container = document.getElementById("statsOverview");

  container.innerHTML = `
          <div class="stat-item">
            <div class="stat-value" style="color: #38a169;">${
              stats.totalBets
            }</div>
            <div class="stat-label">Total de Apostas</div>
          </div>
          <div class="stat-item">
            <div class="stat-value" style="color: #3182ce;">${
              stats.winRate
            }%</div>
            <div class="stat-label">Taxa de Acerto</div>
          </div>
          <div class="stat-item">
            <div class="stat-value" style="color: ${
              stats.totalProfit >= 0 ? "#38a169" : "#e53e3e"
            };">
              R$ ${stats.totalProfit.toFixed(2)}
            </div>
            <div class="stat-label">Lucro Total</div>
          </div>
          <div class="stat-item">
            <div class="stat-value" style="color: ${
              stats.roi >= 0 ? "#38a169" : "#e53e3e"
            };">
              ${stats.roi >= 0 ? "+" : ""}${stats.roi}%
            </div>
            <div class="stat-label">ROI Médio</div>
          </div>
          <div class="stat-item">
            <div class="stat-value" style="color: #805ad5;">R$ ${
              stats.avgOdd
            }</div>
            <div class="stat-label">Odd Média</div>
          </div>
          <div class="stat-item">
            <div class="stat-value" style="color: #d69e2e;">${
              stats.bestSport
            }</div>
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

  // Melhor esporte
  let bestSport = "N/A";
  let bestWinRate = 0;
  Object.entries(sportStats).forEach(([sport, stats]) => {
    const winRate = stats.total > 0 ? (stats.wins / stats.total) * 100 : 0;
    if (winRate > bestWinRate && stats.total >= 3) {
      bestWinRate = winRate;
      bestSport = sport;
    }
  });

  return { totalBets, winRate, totalProfit, roi, avgOdd, bestSport };
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
      text: `${sportIcons[stats.bestSport] || "🏆"} Seu melhor esporte é ${
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

  // Insight sobre odd média
  if (stats.avgOdd > 2.5) {
    insights.push({
      text: `🎲 Odd média alta (${stats.avgOdd}). Apostas de maior risco podem trazer mais retorno, mas cuidado com o bankroll.`,
      trend: "stable",
    });
  } else if (stats.avgOdd < 1.8) {
    insights.push({
      text: `🛡️ Odd média conservadora (${stats.avgOdd}). Boa para preservar capital, mas pode limitar lucros.`,
      trend: "stable",
    });
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

      if (bet.resultado === "green") {
        profit = odd * stake - stake;
        roi = ((profit / stake) * 100).toFixed(1);
      } else if (bet.resultado === "red") {
        profit = -stake;
        roi = -100;
      }

      const sportIcons = {
        futebol: "⚽",
        basquete: "🏀",
        tenis: "🎾",
        volei: "🏐",
        ufc: "🥊",
        esports: "🎮",
      };

      return `
            <tr>
              <td>${new Date(bet.data).toLocaleDateString("pt-BR")}</td>
              <td>
                <span class="sport-icon">${
                  sportIcons[bet.esporte] || "🏆"
                }</span>
                ${bet.esporte.charAt(0).toUpperCase() + bet.esporte.slice(1)}
              </td>
              <td>${bet.evento || "N/A"}</td>
              <td>${bet.metodo || "N/A"}</td>
              <td>${bet.confianca}</td>
              <td>${parseFloat(bet.odd).toFixed(2)}</td>
              <td>R$ ${stake.toFixed(2)}</td>
              <td>
                <span class="result-badge badge-${bet.resultado}">
                  ${bet.resultado.toUpperCase()}
                </span>
              </td>
              <td style="color: ${
                roi >= 0 ? "#38a169" : "#e53e3e"
              }; font-weight: 600;">
                ${roi >= 0 ? "+" : ""}${roi}%
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
