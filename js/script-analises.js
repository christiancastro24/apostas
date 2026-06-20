// ==================== SISTEMA DE DADOS DINÂMICOS ====================
let allBetsData = {};
let metodosData = {};
let dynamicStats = {
  teams: {},
  methods: {},
  leagues: {}, // Simplificado por esporte/categoria caso não haja liga explícita
};

// Carregar e processar dados do LocalStorage
function loadAndProcessData() {
  const savedBets = localStorage.getItem("betsData");
  const savedMetodos = localStorage.getItem("metodos");

  if (savedBets) {
    allBetsData = JSON.parse(savedBets);
  }

  if (savedMetodos) {
    metodosData = JSON.parse(savedMetodos);
  }

  processBettingHistory();
  updateUI();
}

// O coração da inteligência: Processar todas as apostas
function processBettingHistory() {
  dynamicStats = { teams: {}, methods: {}, totalProcessed: 0 };

  // Achatar (flatten) todos os meses em um único array de apostas
  let allBets = [];
  Object.values(allBetsData).forEach((month) => {
    if (Array.isArray(month)) allBets.push(...month);
  });

  allBets.forEach((bet) => {
    if (bet.resultado === "pending" || bet.resultado === "cash") return;

    dynamicStats.totalProcessed++;

    const isGreen = bet.resultado === "green";
    const isRed = bet.resultado === "red";
    const stake = parseFloat(bet.unidade) || 1;
    const odd = parseFloat(bet.odd) || 1;

    // Lucro calculado em unidades
    const profit = isGreen ? stake * odd - stake : isRed ? -stake : 0;

    // 1. PROCESSAR MÉTODOS
    const methodName = getMethodName(bet.metodo);
    if (!dynamicStats.methods[methodName]) {
      dynamicStats.methods[methodName] = {
        name: methodName,
        greens: 0,
        reds: 0,
        profit: 0,
        total: 0,
      };
    }
    dynamicStats.methods[methodName].total++;
    if (isGreen) dynamicStats.methods[methodName].greens++;
    if (isRed) dynamicStats.methods[methodName].reds++;
    dynamicStats.methods[methodName].profit += profit;

    // 2. PROCESSAR TIMES (Extração inteligente do nome do evento)
    const teams = extractTeamsFromEvent(bet.evento);
    teams.forEach((team) => {
      if (!dynamicStats.teams[team]) {
        dynamicStats.teams[team] = {
          name: team,
          greens: 0,
          reds: 0,
          profit: 0,
          total: 0,
          methodsUsed: {},
          esporte: bet.esporte,
        };
      }

      const t = dynamicStats.teams[team];
      t.total++;
      if (isGreen) t.greens++;
      if (isRed) t.reds++;
      t.profit += profit;

      // Registrar qual método foi usado neste time
      t.methodsUsed[methodName] = (t.methodsUsed[methodName] || 0) + 1;
    });
  });
}

// Extrair nomes dos times separando por " x ", " X " ou " - "
function extractTeamsFromEvent(evento) {
  if (
    !evento ||
    evento.toLowerCase().includes("múltipla") ||
    evento.toLowerCase().includes("todos")
  )
    return [];

  // Exemplo: "Turquia x Paraguai" -> ["Turquia", "Paraguai"]
  const parts = evento.split(/\s+[xX]\s+|\s+-\s+/);
  if (parts.length === 2) {
    return parts.map((t) => t.trim().replace(/^[0-9.]+\s*/, "")); // Limpa números caso tenha
  }
  return [];
}

// Traduzir ID do método para nome amigável
function getMethodName(metodoId) {
  if (!metodoId || metodoId === "-") return "Simples/Múltipla";
  if (metodosData[metodoId]) return metodosData[metodoId].name;

  // Fallback: Limpa a string (ex: "over_gols_12345" -> "Over Gols")
  return metodoId
    .split("_")
    .filter((word) => isNaN(word))
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// ==================== ATUALIZAÇÃO DA INTERFACE (UI) ====================

function updateUI() {
  updateQuickStats();
  loadTeamPerformance();
  loadMethodAnalysis();
  loadGeneralStats();
  loadAISuggestions();

  // Ocultar botão manual de adicionar time já que agora é dinâmico
  const addBtn = document.getElementById("toggleMain");
  if (addBtn && addBtn.innerText.includes("Adicionar Time")) {
    addBtn.style.display = "none";
  }
}

// Atualizar estatísticas rápidas do topo
function updateQuickStats() {
  const teamsArray = Object.values(dynamicStats.teams);
  const methodsArray = Object.values(dynamicStats.methods);

  // Time mais lucrativo
  const bestTeam = teamsArray.sort((a, b) => b.profit - a.profit)[0];

  // Método mais utilizado
  const mostUsedMethod = methodsArray.sort((a, b) => b.total - a.total)[0];

  document.getElementById("totalTeams").textContent = teamsArray.length;
  document.getElementById("totalCharacteristics").textContent =
    methodsArray.length;

  const mostCommonEl = document.getElementById("mostCommon");
  if (bestTeam && bestTeam.profit > 0) {
    mostCommonEl.textContent = `🔥 ${bestTeam.name}`;
    mostCommonEl.nextElementSibling.textContent = "Time Mais Lucrativo";
  } else {
    mostCommonEl.textContent = "-";
  }
}

// Renderizar a lista de times classificados por lucro
function loadTeamPerformance() {
  const container = document.getElementById("teamPerformance");
  const teams = Object.values(dynamicStats.teams)
    .filter((t) => t.total >= 2) // Mostrar apenas times com 2 ou mais apostas para ter relevância
    .sort((a, b) => b.profit - a.profit);

  if (teams.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px 20px;">
        <div style="font-size: 48px; margin-bottom: 16px;">🔍</div>
        <h3 style="margin: 0 0 8px 0; color: #f8fafc;">Sem dados suficientes</h3>
        <p style="margin: 0 0 20px 0; color: #94a3b8;">Continue apostando para que a IA identifique seus melhores times.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = teams
    .slice(0, 10)
    .map((team) => {
      const winRate = Math.round((team.greens / team.total) * 100);
      const profitColor = team.profit >= 0 ? "#4ade80" : "#f87171";
      const profitSign = team.profit > 0 ? "+" : "";

      return `
      <div class="team-item" onclick="showTeamDetailsModal('${team.name}')">
        <div class="team-info">
          <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
            <span class="team-name">${team.name}</span>
            <span style="color: ${profitColor}; font-weight: 700;">${profitSign}${team.profit.toFixed(2)} U</span>
          </div>
          <span class="team-record">${team.greens}G - ${team.reds}R (${winRate}% Acerto) | ${team.total} Jogos</span>
          
          <div class="team-characteristics">
            ${Object.entries(team.methodsUsed)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 2)
              .map(
                ([method]) =>
                  `<span class="characteristic-badge" style="background: rgba(96, 165, 250, 0.1); color: #60a5fa;">${method}</span>`,
              )
              .join("")}
          </div>
        </div>
      </div>
    `;
    })
    .join("");
}

// Substituir o "Filtro por Características" por "Análise de Métodos"
function loadMethodAnalysis() {
  const container = document.getElementById("filteredTeams");
  const filterSelect = document.getElementById("characteristicFilter");

  // Atualizar título do card
  container.parentElement.previousElementSibling.querySelector("h3").innerHTML =
    "📈 Top Métodos Lucrativos";
  if (filterSelect) filterSelect.style.display = "none"; // Esconde o dropdown antigo

  const methods = Object.values(dynamicStats.methods).sort(
    (a, b) => b.profit - a.profit,
  );

  if (methods.length === 0) return;

  container.innerHTML = methods
    .map((method) => {
      const winRate = Math.round((method.greens / method.total) * 100);
      const isProfit = method.profit >= 0;

      return `
      <div class="team-item" style="cursor: default;">
        <div class="team-info" style="width: 100%;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span class="team-name">${method.name}</span>
            <span style="color: ${isProfit ? "#4ade80" : "#f87171"}; font-weight: bold;">
              ${isProfit ? "+" : ""}${method.profit.toFixed(2)} U
            </span>
          </div>
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="flex: 1; height: 6px; background: #334155; border-radius: 3px; overflow: hidden;">
              <div style="height: 100%; width: ${winRate}%; background: ${isProfit ? "#4ade80" : "#f87171"};"></div>
            </div>
            <span style="font-size: 12px; color: #94a3b8; width: 40px; text-align: right;">${winRate}%</span>
          </div>
          <span class="team-record" style="margin-top: 6px;">Total de Entradas: ${method.total}</span>
        </div>
      </div>
    `;
    })
    .join("");
}

// Atualizar estatísticas gerais (Pattern Grid)
function loadGeneralStats() {
  const teams = Object.values(dynamicStats.teams);
  const methods = Object.values(dynamicStats.methods);

  const totalGreens = teams.reduce((acc, t) => acc + t.greens, 0);
  const totalReds = teams.reduce((acc, t) => acc + t.reds, 0);
  const generalWinRate =
    totalGreens + totalReds > 0
      ? Math.round((totalGreens / (totalGreens + totalReds)) * 100)
      : 0;

  const bestMethod = methods.sort((a, b) => b.profit - a.profit)[0];
  const worstMethod = methods.sort((a, b) => a.profit - b.profit)[0];

  document.getElementById("statsTeamsCount").textContent = teams.length;

  // Reaproveitando os IDs do HTML para injetar novos dados dinâmicos
  document.getElementById("statsMostLeague").textContent = `${generalWinRate}%`;
  document.getElementById(
    "statsMostLeague",
  ).previousElementSibling.textContent = "Assertividade (Mapeada)";

  document.getElementById("statsCharCount").textContent = bestMethod
    ? bestMethod.name
    : "-";
  document.getElementById("statsCharCount").previousElementSibling.textContent =
    "Melhor Método";

  document.getElementById("statsMostChar").textContent = worstMethod
    ? worstMethod.name
    : "-";
  document.getElementById("statsMostChar").previousElementSibling.textContent =
    "Pior Método";
}

// ==================== IA DE SUGESTÕES (BASEADA EM DADOS REAIS) ====================
function loadAISuggestions() {
  const container = document.getElementById("aiSuggestions");
  const teams = Object.values(dynamicStats.teams).filter((t) => t.total >= 3); // Times com histórico confiável
  const methods = Object.values(dynamicStats.methods).filter(
    (m) => m.total >= 5,
  );

  const suggestions = [];

  // Analisar Times
  if (teams.length > 0) {
    const bestTeam = teams.sort((a, b) => b.profit - a.profit)[0];
    const worstTeam = teams.sort((a, b) => a.profit - b.profit)[0];

    if (
      bestTeam &&
      bestTeam.profit > 0 &&
      bestTeam.greens / bestTeam.total >= 0.6
    ) {
      suggestions.push({
        icon: "🔥",
        title: `Mina de Ouro: ${bestTeam.name}`,
        description: `Você tem ${Math.round((bestTeam.greens / bestTeam.total) * 100)}% de acerto apostando neles. O lucro acumulado é de +${bestTeam.profit.toFixed(2)} unidades.`,
      });
    }

    if (worstTeam && worstTeam.profit < -1) {
      suggestions.push({
        icon: "⚠️",
        title: `Alerta Vermelho: ${worstTeam.name}`,
        description: `Este time está drenando sua banca (Prejuízo de ${worstTeam.profit.toFixed(2)} U em ${worstTeam.total} jogos). Evite apostar neles no momento.`,
      });
    }
  }

  // Analisar Métodos
  if (methods.length > 0) {
    const bestMethod = methods.sort((a, b) => b.profit - a.profit)[0];
    if (bestMethod && bestMethod.profit > 0) {
      suggestions.push({
        icon: "💎",
        title: `Especialidade: ${bestMethod.name}`,
        description: `Seu método mais consistente. Foque suas análises neste mercado para maximizar ganhos a longo prazo.`,
      });
    }
  }

  if (suggestions.length === 0) {
    suggestions.push({
      icon: "📊",
      title: "Coletando Dados",
      description:
        "A IA precisa de mais resultados finalizados para gerar padrões precisos. Continue registrando.",
    });
  }

  container.innerHTML = suggestions
    .map(
      (suggestion) => `
    <div class="suggestion-item">
      <div class="suggestion-icon">${suggestion.icon}</div>
      <div class="suggestion-text">
        <strong style="color: #60a5fa; font-size: 14px;">${suggestion.title}</strong><br>
        <span style="color: #94a3b8; font-size: 13px;">${suggestion.description}</span>
      </div>
    </div>
  `,
    )
    .join("");
}

// ==================== MODAL DE DETALHES DO TIME ====================
function showTeamDetailsModal(teamName) {
  const team = dynamicStats.teams[teamName];
  if (!team) return;

  const winRate = Math.round((team.greens / team.total) * 100);
  const isProfit = team.profit >= 0;

  const modalContent = `
    <div style="text-align: center; margin-bottom: 24px;">
      <h2 style="font-size: 28px; color: #f8fafc; margin-bottom: 8px;">${team.name}</h2>
      <div style="display: inline-block; background: ${isProfit ? "rgba(74, 222, 128, 0.1)" : "rgba(248, 113, 113, 0.1)"}; color: ${isProfit ? "#4ade80" : "#f87171"}; padding: 8px 16px; border-radius: 20px; font-weight: bold; font-size: 18px;">
        Saldo: ${isProfit ? "+" : ""}${team.profit.toFixed(2)} Unidades
      </div>
    </div>
    
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 32px;">
      <div style="background: #0f172a; padding: 16px; border-radius: 12px; border: 1px solid #334155; text-align: center;">
        <div style="font-size: 24px; color: #4ade80; font-weight: bold;">${team.greens}</div>
        <div style="color: #94a3b8; font-size: 12px; text-transform: uppercase;">Greens</div>
      </div>
      <div style="background: #0f172a; padding: 16px; border-radius: 12px; border: 1px solid #334155; text-align: center;">
        <div style="font-size: 24px; color: #f87171; font-weight: bold;">${team.reds}</div>
        <div style="color: #94a3b8; font-size: 12px; text-transform: uppercase;">Reds</div>
      </div>
      <div style="background: #0f172a; padding: 16px; border-radius: 12px; border: 1px solid #334155; text-align: center;">
        <div style="font-size: 24px; color: #60a5fa; font-weight: bold;">${winRate}%</div>
        <div style="color: #94a3b8; font-size: 12px; text-transform: uppercase;">Taxa de Acerto</div>
      </div>
    </div>

    <h4 style="color: #e2e8f0; margin-bottom: 12px; font-size: 16px;">🎯 Métodos Utilizados neste Time</h4>
    <div style="background: #0f172a; border-radius: 12px; border: 1px solid #334155; overflow: hidden;">
      ${Object.entries(team.methodsUsed)
        .sort(([, a], [, b]) => b - a)
        .map(
          ([method, count]) => `
        <div style="display: flex; justify-content: space-between; padding: 12px 16px; border-bottom: 1px solid #1e293b;">
          <span style="color: #cbd5e1;">${method}</span>
          <span style="background: #1e293b; color: #94a3b8; padding: 2px 8px; border-radius: 12px; font-size: 12px;">${count} vezes</span>
        </div>
      `,
        )
        .join("")}
    </div>

    <div style="text-align: center; margin-top: 24px;">
      <button onclick="closeModal()" style="padding: 12px 32px; background: #334155; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; transition: background 0.2s;">
        Fechar Detalhes
      </button>
    </div>
  `;

  document.getElementById("modalTitle").textContent = "Análise da IA";
  document.getElementById("modalBody").innerHTML = modalContent;
  document.getElementById("detailModal").style.display = "block";
}

function closeModal() {
  document.getElementById("detailModal").style.display = "none";
}

// ==================== INICIALIZAÇÃO ====================
document.addEventListener("DOMContentLoaded", function () {
  loadAndProcessData();
});

// Fechar modal ao clicar fora
window.onclick = function (event) {
  const modal = document.getElementById("detailModal");
  if (event.target === modal) {
    closeModal();
  }
};
