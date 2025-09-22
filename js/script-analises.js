// Sistema de dados locais
let userData = {
  teams: JSON.parse(localStorage.getItem("userTeams")) || {},
  matches: JSON.parse(localStorage.getItem("userMatches")) || [],
  settings: JSON.parse(localStorage.getItem("userSettings")) || {},
};

// ==================== UTILS ====================
function saveUserData() {
  localStorage.setItem("userTeams", JSON.stringify(userData.teams));
  localStorage.setItem("userMatches", JSON.stringify(userData.matches));
  localStorage.setItem("userSettings", JSON.stringify(userData.settings));
}

function showNotification(message, type = "success") {
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.innerHTML = `<span>${message}</span><button onclick="this.parentElement.remove()">×</button>`;

  const bgColor =
    type === "success"
      ? "#38a169"
      : type === "warning"
      ? "#d69e2e"
      : type === "info"
      ? "#3182ce"
      : "#e53e3e";

  notification.style.cssText = `
    position: fixed; top: 20px; right: 20px; background: ${bgColor}; color: white;
    padding: 16px 20px; border-radius: 12px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    z-index: 1000; display: flex; align-items: center; gap: 12px; animation: slideIn 0.3s ease;
  `;

  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 5000);
}

// ==================== MODAL FUNCTIONS ====================
function showModal(title, content) {
  document.getElementById("modalTitle").textContent = title;
  document.getElementById("modalBody").innerHTML = content;
  document.getElementById("detailModal").style.display = "block";
}

function closeModal() {
  document.getElementById("detailModal").style.display = "none";
}

// ==================== QUICK STATS ====================
function updateQuickStats() {
  const teams = Object.values(userData.teams);
  const totalTeams = teams.length;

  // Contar características
  const allCharacteristics = [];
  teams.forEach((team) => {
    if (Array.isArray(team.characteristics)) {
      allCharacteristics.push(...team.characteristics);
    }
  });

  // Característica mais comum
  const charCount = {};
  allCharacteristics.forEach((char) => {
    charCount[char] = (charCount[char] || 0) + 1;
  });

  const mostCommon = Object.entries(charCount).sort(([, a], [, b]) => b - a)[0];
  const mostCommonKey = mostCommon ? mostCommon[0] : null;

  // Traduzir para nome amigável
  let mostCommonLabel = "-";
  switch (mostCommonKey) {
    case "over":
      mostCommonLabel = "📈 Bom para Over";
      break;
    case "under":
      mostCommonLabel = "📉 Bom para Under";
      break;
    case "ambas_marcam":
      mostCommonLabel = "🎯 Ambas Marcam";
      break;
    case "casa_forte":
      mostCommonLabel = "🏠 Forte em Casa";
      break;
    case "visitante_forte":
      mostCommonLabel = "✈️ Bom Visitante";
      break;
    case "imprevisivel":
      mostCommonLabel = "❓ Imprevisível";
      break;
    default:
      mostCommonLabel = "-";
  }

  // Atualizar elementos na UI
  document.getElementById("totalTeams").textContent = totalTeams;
  document.getElementById("totalCharacteristics").textContent = new Set(
    allCharacteristics
  ).size;
  document.getElementById("mostCommon").textContent = mostCommonLabel;
}

// ==================== TEAM ANALYSIS ====================
function analyzeUserTeams() {
  const teams = Object.values(userData.teams);
  if (teams.length === 0) return [];

  return teams
    .map((team) => {
      // Calcular estatísticas dos jogos
      const teamMatches = userData.matches.filter(
        (m) => m.homeTeam === team.id || m.awayTeam === team.id
      );

      const wins = teamMatches.filter(
        (m) =>
          (m.homeTeam === team.id && m.homeScore > m.awayScore) ||
          (m.awayTeam === team.id && m.awayScore > m.homeScore)
      ).length;

      const losses = teamMatches.filter(
        (m) =>
          (m.homeTeam === team.id && m.homeScore < m.awayScore) ||
          (m.awayTeam === team.id && m.awayScore < m.homeScore)
      ).length;

      const draws = teamMatches.filter(
        (m) => m.homeScore === m.awayScore
      ).length;
      const winRate =
        teamMatches.length > 0
          ? Math.round((wins / teamMatches.length) * 100)
          : 0;

      return {
        id: team.id,
        name: team.name,
        wins,
        losses,
        draws,
        winRate,
        league: team.league || "Não definida",
        characteristics: Array.isArray(team.characteristics)
          ? team.characteristics
          : [],
        totalMatches: teamMatches.length,
        notes: team.notes || "",
      };
    })
    .sort((a, b) => b.winRate - a.winRate);
}

// ==================== LOAD FUNCTIONS ====================
function loadTeamPerformance() {
  const teams = analyzeUserTeams();
  const container = document.getElementById("teamPerformance");

  if (teams.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px 20px;">
        <div style="font-size: 48px; margin-bottom: 16px;">📝</div>
        <h3 style="margin: 0 0 8px 0; color: #2d3748;">Nenhum time cadastrado</h3>
        <p style="margin: 0 0 20px 0; color: #718096;">Cadastre seus times para análises personalizadas</p>
        <button onclick="showAddTeamModal()" style="padding: 12px 24px; background: #667eea; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
          + Adicionar Time
        </button>
      </div>
    `;
    return;
  }

  const characteristicLabels = {
    over: "📈",
    under: "📉",
    ambas_marcam: "🎯",
    casa_forte: "🏠",
    visitante_forte: "✈️",
    imprevisivel: "❓",
  };

  container.innerHTML = teams
    .slice(0, 8)
    .map(
      (team) => `
    <div class="team-item" onclick="showTeamDetailsModal('${team.id}')">
      <div class="team-info">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span class="team-name">${team.name}</span>
          ${
            team.characteristics.length > 0
              ? `
            <div style="display: flex; gap: 4px;">
              ${team.characteristics
                .slice(0, 3)
                .map(
                  (char) => `
                <span class="characteristic-badge ${char}">
                  ${characteristicLabels[char] || char}
                </span>
              `
                )
                .join("")}
              ${
                team.characteristics.length > 3
                  ? `
                <span class="characteristic-badge">+${
                  team.characteristics.length - 3
                }</span>
              `
                  : ""
              }
            </div>
          `
              : ""
          }
        </div>
        <span class="team-record">${team.wins}W - ${team.losses}L${
        team.draws > 0 ? ` - ${team.draws}E` : ""
      }</span>
      </div>
      <div class="win-rate">${team.winRate}%</div>
    </div>
  `
    )
    .join("");
}

function loadLeagueInsights() {
  const teams = Object.values(userData.teams);
  const container = document.getElementById("leagueInsights");

  if (teams.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 30px; color: #718096;">
        <div style="font-size: 36px; margin-bottom: 12px;">🌍</div>
        <p>Cadastre times para ver insights por liga</p>
      </div>
    `;
    return;
  }

  // Agrupar por liga
  const leagues = {};
  teams.forEach((team) => {
    const league = team.league || "Não definida";
    if (!leagues[league]) leagues[league] = [];
    leagues[league].push(team);
  });

  container.innerHTML = Object.entries(leagues)
    .map(
      ([league, leagueTeams]) => `
    <div class="league-insight" onclick="showLeagueDetails('${league}')">
      <div class="league-header">
        <span class="league-flag">🏆</span>
        <span class="league-name">${league}</span>
        <span class="league-count">${leagueTeams.length}</span>
      </div>
      <div class="league-teams">
        ${leagueTeams
          .slice(0, 3)
          .map((t) => t.name)
          .join(", ")}
        ${leagueTeams.length > 3 ? ` e mais ${leagueTeams.length - 3}...` : ""}
      </div>
    </div>
  `
    )
    .join("");
}

function loadGeneralStats() {
  const teams = Object.values(userData.teams);
  const matches = userData.matches;

  // Liga mais comum
  const leagues = {};
  teams.forEach((team) => {
    const league = team.league || "Não definida";
    leagues[league] = (leagues[league] || 0) + 1;
  });
  const mostCommonLeague = Object.entries(leagues).sort(
    ([, a], [, b]) => b - a
  )[0];

  // Característica mais comum
  const allChars = [];
  teams.forEach((team) => {
    if (Array.isArray(team.characteristics)) {
      allChars.push(...team.characteristics);
    }
  });
  const charCount = {};
  allChars.forEach((char) => (charCount[char] = (charCount[char] || 0) + 1));
  const mostCommonChar = Object.entries(charCount).sort(
    ([, a], [, b]) => b - a
  )[0];

  // Atualizar elementos
  document.getElementById("statsTeamsCount").textContent = teams.length;
  document.getElementById("statsMostLeague").textContent = mostCommonLeague
    ? mostCommonLeague[0]
    : "-";
  document.getElementById("statsCharCount").textContent = new Set(
    allChars
  ).size;
  document.getElementById("statsMostChar").textContent = mostCommonChar
    ? mostCommonChar[0]
    : "-";
}

function loadCharacteristicAnalysis() {
  const teams = Object.values(userData.teams);
  const container = document.getElementById("characteristicAnalysis");

  if (teams.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 30px; color: #718096;">
        <div style="font-size: 36px; margin-bottom: 12px;">📈</div>
        <p>Cadastre times para análise de características</p>
      </div>
    `;
    return;
  }

  // Contar características
  const charCount = {};
  teams.forEach((team) => {
    if (Array.isArray(team.characteristics)) {
      team.characteristics.forEach((char) => {
        charCount[char] = (charCount[char] || 0) + 1;
      });
    }
  });

  const maxCount = Math.max(...Object.values(charCount));
  const characteristicLabels = {
    over: "Over",
    under: "Under",
    ambas_marcam: "Ambas Marcam",
    casa_forte: "Casa Forte",
    visitante_forte: "Bom Visitante",
    imprevisivel: "Imprevisível",
  };

  container.innerHTML = `
    <div class="characteristic-chart">
      ${Object.entries(charCount)
        .map(
          ([char, count]) => `
        <div class="characteristic-bar">
          <div class="char-label">${characteristicLabels[char] || char}</div>
          <div class="char-bar-container">
            <div class="char-bar" style="width: ${(count / maxCount) * 100}%">
              <span class="char-count">${count}</span>
            </div>
          </div>
        </div>
      `
        )
        .join("")}
    </div>
  `;
}

function loadAISuggestions() {
  const container = document.getElementById("aiSuggestions");
  const teams = Object.values(userData.teams);
  const matches = userData.matches;
  const suggestions = [];

  if (teams.length === 0) {
    suggestions.push(
      {
        icon: "📝",
        title: "Cadastre seus primeiros times",
        description:
          "Adicione times que você conhece bem para começar suas análises personalizadas",
      },
      {
        icon: "🎯",
        title: "Defina características específicas",
        description:
          "Marque se o time é bom para Over, Under, Ambas Marcam, etc.",
      },
      {
        icon: "💡",
        title: "Comece com 3-5 times",
        description:
          "Um número pequeno de times é suficiente para começar a identificar padrões",
      }
    );
  } else {
    // Análise dos times cadastrados
    const teamsByCharacteristic = {};
    const leagues = {};
    const teamsWithoutChar = [];

    teams.forEach((team) => {
      const teamCharacteristics = Array.isArray(team.characteristics)
        ? team.characteristics
        : [];

      // Contar por característica
      teamCharacteristics.forEach((char) => {
        if (!teamsByCharacteristic[char]) teamsByCharacteristic[char] = [];
        teamsByCharacteristic[char].push(team);
      });

      // Contar por liga
      const league = team.league || "Não definida";
      leagues[league] = (leagues[league] || 0) + 1;

      // Times sem características
      if (teamCharacteristics.length === 0) {
        teamsWithoutChar.push(team);
      }
    });

    // Sugestão 1: Característica mais comum
    const mostCommonChar = Object.entries(teamsByCharacteristic).sort(
      ([, a], [, b]) => b.length - a.length
    )[0];
    if (mostCommonChar) {
      const [characteristic, charTeams] = mostCommonChar;
      const charLabels = {
        over: "apostas Over",
        under: "apostas Under",
        ambas_marcam: "Ambas Marcam",
        casa_forte: "jogos em casa",
        visitante_forte: "jogos fora de casa",
        imprevisivel: "análises cautelosas",
      };

      suggestions.push({
        icon: "🎯",
        title: `Foco em ${charLabels[characteristic] || characteristic}`,
        description: `${charTeams.length} times: ${charTeams
          .slice(0, 2)
          .map((t) => t.name)
          .join(", ")}${
          charTeams.length > 2 ? ` e +${charTeams.length - 2}` : ""
        }`,
      });
    }

    // Sugestão 2: Times sem características ou liga mais comum
    if (teamsWithoutChar.length > 0) {
      suggestions.push({
        icon: "⚠️",
        title: `${teamsWithoutChar.length} times sem características`,
        description: `Complete o perfil: ${teamsWithoutChar
          .slice(0, 2)
          .map((t) => t.name)
          .join(", ")} para melhores análises`,
      });
    } else {
      const mostCommonLeague = Object.entries(leagues).sort(
        ([, a], [, b]) => b - a
      )[0];
      if (mostCommonLeague) {
        suggestions.push({
          icon: "🏆",
          title: `Especialista em ${mostCommonLeague[0]}`,
          description: `${mostCommonLeague[1]} times desta liga - considere focar neste campeonato`,
        });
      }
    }

    // Sugestão 3: Baseada em jogos ou diversificação
    if (matches.length === 0) {
      suggestions.push({
        icon: "⚽",
        title: "Registre resultados dos seus times",
        description:
          "Adicione jogos para ver estatísticas e identificar padrões de desempenho",
      });
    } else {
      // Analisar desempenho dos times
      const teamPerformance = analyzeUserTeams();
      const bestTeam = teamPerformance[0];
      const worstTeam = teamPerformance[teamPerformance.length - 1];

      if (bestTeam && bestTeam.winRate > 60) {
        suggestions.push({
          icon: "⭐",
          title: `${bestTeam.name} está em alta`,
          description: `${bestTeam.winRate}% de aproveitamento em ${bestTeam.totalMatches} jogos - time confiável`,
        });
      } else if (
        worstTeam &&
        worstTeam.winRate < 40 &&
        worstTeam.totalMatches > 2
      ) {
        suggestions.push({
          icon: "⚠️",
          title: `Cuidado com ${worstTeam.name}`,
          description: `Apenas ${worstTeam.winRate}% de aproveitamento - revisar estratégia ou características`,
        });
      } else {
        // Sugestão de diversificação
        const characteristics = Object.keys(teamsByCharacteristic);
        const missingChars = [
          "over",
          "under",
          "ambas_marcam",
          "casa_forte",
        ].filter((char) => !characteristics.includes(char));
        if (missingChars.length > 0) {
          suggestions.push({
            icon: "🔄",
            title: "Diversifique suas opções",
            description: `Considere adicionar times bons para: ${missingChars
              .slice(0, 2)
              .join(", ")}`,
          });
        } else {
          suggestions.push({
            icon: "📈",
            title: "Portfolio balanceado",
            description:
              "Você tem boa diversidade de características entre seus times",
          });
        }
      }
    }
  }

  // Garantir que sempre temos 3 sugestões
  while (suggestions.length < 3) {
    suggestions.push({
      icon: "💡",
      title: "Use filtros por características",
      description:
        "Explore a seção de filtros para encontrar padrões específicos nos seus times",
    });
  }

  container.innerHTML = suggestions
    .slice(0, 3)
    .map(
      (suggestion) => `
    <div class="suggestion-item">
      <div class="suggestion-icon">${suggestion.icon}</div>
      <div class="suggestion-text">
        <strong>${suggestion.title}</strong><br>
        ${suggestion.description}
      </div>
    </div>
  `
    )
    .join("");
}

// ==================== FILTER FUNCTIONS ====================
function filterTeamsByCharacteristic(characteristic) {
  const teams = analyzeUserTeams();
  const container = document.getElementById("filteredTeams");

  if (!characteristic) {
    container.innerHTML = `
      <div style="text-align: center; padding: 30px; color: #718096">
        <div style="font-size: 36px; margin-bottom: 12px">🏷️</div>
        <p>Selecione uma característica para filtrar seus times</p>
      </div>
    `;
    return;
  }

  const filteredTeams = teams.filter(
    (team) =>
      team.characteristics && team.characteristics.includes(characteristic)
  );

  const characteristicLabels = {
    over: "📈 Bom para Over",
    under: "📉 Bom para Under",
    ambas_marcam: "🎯 Ambas Marcam",
    casa_forte: "🏠 Forte em Casa",
    visitante_forte: "✈️ Bom Visitante",
    imprevisivel: "❓ Imprevisível",
  };

  if (filteredTeams.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 30px; color: #718096">
        <div style="font-size: 36px; margin-bottom: 12px">🔍</div>
        <p>Nenhum time encontrado com esta característica</p>
        <small style="color: #a0aec0;">${
          characteristicLabels[characteristic] || characteristic
        }</small>
      </div>
    `;
    return;
  }

  container.innerHTML = filteredTeams
    .map(
      (team) => `
    <div class="team-item" onclick="showTeamDetailsModal('${team.id}')">
      <div class="team-info">
        <span class="team-name">${team.name}</span>
        <span class="team-record">${team.wins}W - ${team.losses}L - ${team.winRate}%</span>
      </div>
      <div style="color: #667eea;">→</div>
    </div>
  `
    )
    .join("");
}

function toggleLeagueView(view) {
  document
    .querySelectorAll(".toggle-btn")
    .forEach((btn) => btn.classList.remove("active"));
  document
    .getElementById(`toggle${view.charAt(0).toUpperCase() + view.slice(1)}`)
    .classList.add("active");
  loadLeagueInsights(); // Recarregar com o filtro aplicado
}

function showAddTeamModal() {
  const modalContent = `
    <div style="padding: 10px 0 0">
      <h2 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 24px; color: #1a202c;">
        🏆 Adicionar Novo Time
      </h2>
      <form onsubmit="handleAddTeam(event)" style="display: grid; gap: 24px; font-family: 'Segoe UI', sans-serif;">
        
        <div>
          <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #2d3748;">Nome do Time *</label>
          <input type="text" name="name" required placeholder="Ex: Manchester City" 
                 style="width: 100%; padding: 12px 14px; border: 1px solid #cbd5e0; border-radius: 8px; font-size: 15px;">
        </div>
        
        <div>
          <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #2d3748;">Liga/Campeonato</label>
          <input type="text" name="league" placeholder="Ex: Premier League, Serie A" 
                 style="width: 100%; padding: 12px 14px; border: 1px solid #cbd5e0; border-radius: 8px; font-size: 15px;">
        </div>

        <div>
          <label style="display: block; margin-bottom: 12px; font-weight: 600; color: #2d3748;">Características</label>
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 10px;">
            ${[
              { emoji: "📈", text: "Bom para Over", value: "over" },
              { emoji: "📉", text: "Bom para Under", value: "under" },
              { emoji: "🎯", text: "Ambas Marcam", value: "ambas_marcam" },
              { emoji: "🏠", text: "Forte em Casa", value: "casa_forte" },
              { emoji: "✈️", text: "Bom Visitante", value: "visitante_forte" },
              { emoji: "❓", text: "Imprevisível", value: "imprevisivel" },
            ]
              .map(
                (item) => `
              <label style="display: flex; align-items: center; gap: 8px; background: #f7fafc; padding: 10px 12px; border-radius: 6px; cursor: pointer; border: 1px solid #e2e8f0;">
                <input type="checkbox" name="characteristics" value="${item.value}">
                <span>${item.emoji} ${item.text}</span>
              </label>`
              )
              .join("")}
          </div>
        </div>

        <div>
          <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #2d3748;">Notas</label>
          <textarea name="notes" rows="4"
                    style="width: 100%; padding: 12px 14px; border: 1px solid #cbd5e0; border-radius: 8px; resize: vertical; font-size: 15px;"
                    placeholder="Observações sobre este time..."></textarea>
        </div>

        <div style="display: flex; gap: 12px; justify-content: flex-end; padding-top: 12px;">
          <button type="button" onclick="closeModal()" 
                  style="padding: 12px 20px; background: #edf2f7; color: #2d3748; border: none; border-radius: 6px; cursor: pointer; font-weight: 500; transition: background 0.2s;"
                  onmouseover="this.style.background='#e2e8f0'" onmouseout="this.style.background='#edf2f7'">
            Cancelar
          </button>
          <button type="submit" 
                  style="padding: 12px 24px; background: #38a169; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; transition: background 0.2s;"
                  onmouseover="this.style.background='#2f855a'" onmouseout="this.style.background='#38a169'">
            💾 Salvar Time
          </button>
        </div>
      </form>
    </div>
  `;

  showModal("", modalContent);
}

function handleAddTeam(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const characteristics = formData.getAll("characteristics");

  const teamId =
    formData.get("name").toLowerCase().replace(/\s+/g, "_") + "_" + Date.now();

  userData.teams[teamId] = {
    id: teamId,
    name: formData.get("name"),
    league: formData.get("league") || "Não definida",
    characteristics: characteristics || [],
    notes: formData.get("notes") || "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  saveUserData();
  closeModal();
  showNotification(
    `Time ${formData.get("name")} adicionado com sucesso!`,
    "success"
  );

  // Recarregar interfaces
  updateQuickStats();
  loadTeamPerformance();
  loadLeagueInsights();
  loadGeneralStats();
  loadCharacteristicAnalysis();
  loadAISuggestions();
}

function showTeamDetailsModal(teamId) {
  const team = userData.teams[teamId];
  if (!team) return;

  const characteristicLabels = {
    over: "📈 Bom para Over",
    under: "📉 Bom para Under",
    ambas_marcam: "🎯 Ambas Marcam",
    casa_forte: "🏠 Forte em Casa",
    visitante_forte: "✈️ Bom Visitante",
    imprevisivel: "❓ Imprevisível",
  };

  const teamCharacteristics = Array.isArray(team.characteristics)
    ? team.characteristics
    : [];

  const modalContent = `
    <h3 style="display: flex; align-items: center; gap: 12px;">
      <span>${team.name}</span>
      <span style="background: #e2e8f0; color: #4a5568; padding: 4px 8px; border-radius: 12px; font-size: 12px;">
        ${team.league}
      </span>
    </h3>
    
    ${
      teamCharacteristics.length > 0
        ? `
      <div style="margin: 20px 0;">
        <h4 style="margin: 0 0 12px 0; color: #4a5568;">Características</h4>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          ${teamCharacteristics
            .map(
              (char) => `
            <span style="background: #667eea; color: white; padding: 6px 12px; border-radius: 16px; font-size: 12px;">
              ${characteristicLabels[char] || char}
            </span>
          `
            )
            .join("")}
        </div>
      </div>
    `
        : ""
    }

    ${
      team.notes
        ? `
      <div style="margin: 20px 0;">
        <h4 style="margin: 0 0 8px 0; color: #4a5568;">Notas</h4>
        <div style="background: #f8fafc; padding: 16px; border-radius: 6px; border-left: 4px solid #667eea;">
          ${team.notes
            .split("\n")
            .map((line) => `<p style="margin: 0 0 8px 0;">${line}</p>`)
            .join("")}
        </div>
      </div>
    `
        : ""
    }

    <div style="display: flex; gap: 12px; justify-content: space-between; align-items: center; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
      <button onclick="handleDeleteTeam('${teamId}')" 
              style="padding: 10px 16px; background: #fed7d7; color: #c53030; border: 1px solid #feb2b2; border-radius: 6px; cursor: pointer; font-weight: 500;">
        🗑️ Excluir Time
      </button>

      <button onclick="closeModal()" 
              style="padding: 10px 16px; background: #f7fafc; color: #4a5568; border: 1px solid #e2e8f0; border-radius: 6px; cursor: pointer;">
        Fechar
      </button>
    </div>
  `;

  showModal("", modalContent);
}

function handleDeleteTeam(teamId) {
  const confirmDelete = confirm("Tem certeza que deseja excluir este time?");
  if (!confirmDelete) return;

  // Remove o time do objeto (ajuste conforme sua estrutura)
  delete userData.teams[teamId];

  // Salvar os dados se necessário
  saveUserData(); // você deve ter essa função

  closeModal();
  window.location.reload();
}

function showCharacteristicInfo() {
  const modalContent = `
    <h3>Análise de Características</h3>
    <p>Esta seção mostra a distribuição das características dos seus times cadastrados.</p>
    
    <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin: 16px 0;">
      <h4 style="margin: 0 0 12px 0;">Significado das Características:</h4>
      <ul style="margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.6;">
        <li><strong>Over:</strong> Times que tendem a ter jogos com muitos gols</li>
        <li><strong>Under:</strong> Times que jogam de forma mais cautelosa</li>
        <li><strong>Ambas Marcam:</strong> Times que atacam bem mas também sofrem gols</li>
        <li><strong>Casa Forte:</strong> Times com grande vantagem quando jogam em casa</li>
        <li><strong>Bom Visitante:</strong> Times que jogam bem fora de casa</li>
        <li><strong>Imprevisível:</strong> Times com resultados inconsistentes</li>
      </ul>
    </div>
    
    <p style="font-size: 14px; color: #718096;">
      Use essas informações para identificar padrões e oportunidades de apostas baseadas no perfil dos times.
    </p>
  `;

  showModal("Informações sobre Características", modalContent);
}

// ==================== INITIALIZATION ====================
document.addEventListener("DOMContentLoaded", function () {
  try {
    updateQuickStats();
    loadTeamPerformance();
    loadLeagueInsights();
    loadGeneralStats();
    loadCharacteristicAnalysis();
    loadAISuggestions();
  } catch (error) {
    showNotification("Erro ao carregar sistema", "error");
  }
});

// ==================== EVENT HANDLERS ====================
window.onclick = function (event) {
  const modal = document.getElementById("detailModal");
  if (event.target === modal) {
    closeModal();
  }
};

// CSS para notificações
const style = document.createElement("style");
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  .notification button {
    background: transparent; border: none; color: white; font-size: 18px; 
    cursor: pointer; padding: 0; width: 20px; height: 20px; 
    display: flex; align-items: center; justify-content: center;
  }
  .notification button:hover {
    background: rgba(255, 255, 255, 0.2); border-radius: 50%;
  }
`;
document.head.appendChild(style);
