// Função para analisar times do usuário (CORRIGIDA)
function analyzeUserTeams() {
  console.log("=== INÍCIO analyzeUserTeams ===");

  const teams = Object.values(userData.teams);
  console.log("Teams encontrados:", teams.length);
  console.log("Teams data:", teams);

  if (teams.length === 0) {
    console.log("Nenhum time encontrado, retornando array vazio");
    return [];
  }

  return teams
    .map((team) => {
      console.log(`--- Analisando team: ${team.name} ---`);
      console.log("Team ID:", team.id);
      console.log("Team characteristics:", team.characteristics);
      console.log("Type of characteristics:", typeof team.characteristics);
      console.log("Is Array:", Array.isArray(team.characteristics));

      // Calcular estatísticas dos jogos
      const teamMatches = userData.matches.filter(
        (m) => m.homeTeam === team.id || m.awayTeam === team.id
      );

      console.log(`Matches encontrados para ${team.name}:`, teamMatches.length);
      console.log("Matches:", teamMatches);

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

      console.log(`Stats para ${team.name}: ${wins}W - ${losses}L - ${draws}E`);

      const winRate =
        teamMatches.length > 0
          ? Math.round((wins / teamMatches.length) * 100)
          : 0;

      console.log(`Win rate para ${team.name}: ${winRate}%`);

      // CORREÇÃO AQUI - garantir que characteristics seja array
      let characteristics = team.characteristics;
      if (!Array.isArray(characteristics)) {
        console.log("ERRO: characteristics não é array, convertendo...");
        console.log("Valor original:", characteristics);
        characteristics = [];
      }

      const result = {
        id: team.id,
        name: team.name,
        wins: wins,
        losses: losses,
        draws: draws,
        winRate: winRate,
        league: team.league || "Não definida",
        characteristics: characteristics,
        totalMatches: teamMatches.length,
        notes: team.notes || "",
      };

      console.log(`Resultado final para ${team.name}:`, result);

      return result;
    })
    .sort((a, b) => {
      console.log(
        `Ordenando: ${a.name} (${a.winRate}%) vs ${b.name} (${b.winRate}%)`
      );
      return b.winRate - a.winRate;
    });
}

function showTeamDetailsModal(teamId) {
  const team = userData.teams[teamId];
  if (!team) return;

  const teamMatches = userData.matches.filter(
    (m) => m.homeTeam === teamId || m.awayTeam === teamId
  );

  const characteristicLabels = {
    gols: "⚽ Bom para Gols",
    vitoria: "🏆 Bom para Vitória",
    derrota: "📉 Bom para Derrota",
    over: "📈 Bom para Over",
    under: "📉 Bom para Under",
    ambas_marcam: "🎯 Ambas Marcam",
    casa_forte: "🏠 Forte em Casa",
    visitante_forte: "✈️ Bom Visitante",
    imprevisivel: "❓ Imprevisível",
  };

  const modalContent = `
    <h3 style="margin: 0 0 20px 0; color: #2d3748; display: flex; align-items: center; gap: 12px;">
      <span>${team.name}</span>
      <span style="background: #e2e8f0; color: #4a5568; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: normal;">
        ${team.league}
      </span>
    </h3>
    
    ${
      team.characteristics && team.characteristics.length > 0
        ? `
      <div style="margin-bottom: 24px;">
        <h4 style="margin: 0 0 12px 0; color: #4a5568; font-size: 14px;">Características</h4>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          ${team.characteristics
            .map(
              (char) => `
            <span style="background: #667eea; color: white; padding: 6px 12px; border-radius: 16px; font-size: 12px; font-weight: 500;">
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
      teamMatches.length > 0
        ? `
      <div style="margin-bottom: 24px;">
        <h4 style="margin: 0 0 12px 0; color: #4a5568; font-size: 14px;">Estatísticas (${
          teamMatches.length
        } jogos)</h4>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(80px, 1fr)); gap: 12px;">
          <div style="background: #f0fff4; padding: 12px; border-radius: 6px; text-align: center; border: 1px solid #c6f6d5;">
            <div style="font-size: 18px; font-weight: 600; color: #22543d;">${
              teamMatches.filter(
                (m) =>
                  (m.homeTeam === teamId && m.homeScore > m.awayScore) ||
                  (m.awayTeam === teamId && m.awayScore > m.homeScore)
              ).length
            }</div>
            <div style="font-size: 11px; color: #22543d;">Vitórias</div>
          </div>
          <div style="background: #fff5f5; padding: 12px; border-radius: 6px; text-align: center; border: 1px solid #fed7d7;">
            <div style="font-size: 18px; font-weight: 600; color: #c53030;">${
              teamMatches.filter(
                (m) =>
                  (m.homeTeam === teamId && m.homeScore < m.awayScore) ||
                  (m.awayTeam === teamId && m.awayScore < m.homeScore)
              ).length
            }</div>
            <div style="font-size: 11px; color: #c53030;">Derrotas</div>
          </div>
          <div style="background: #fffbeb; padding: 12px; border-radius: 6px; text-align: center; border: 1px solid #fed7aa;">
            <div style="font-size: 18px; font-weight: 600; color: #d97706;">${
              teamMatches.filter((m) => m.homeScore === m.awayScore).length
            }</div>
            <div style="font-size: 11px; color: #d97706;">Empates</div>
          </div>
        </div>
      </div>
    `
        : ""
    }

    ${
      team.notes
        ? `
      <div style="margin-bottom: 24px;">
        <h4 style="margin: 0 0 8px 0; color: #4a5568; font-size: 14px;">Notas</h4>
        <div style="background: #f8fafc; padding: 16px; border-radius: 6px; border-left: 4px solid #667eea; font-size: 14px; line-height: 1.6; color: #4a5568;">
          ${team.notes
            .split("\n")
            .map((line) => `<p style="margin: 0 0 8px 0;">${line}</p>`)
            .join("")}
        </div>
      </div>
    `
        : ""
    }

    ${
      teamMatches.length > 0
        ? `
      <div style="margin-bottom: 20px;">
        <h4 style="margin: 0 0 12px 0; color: #4a5568; font-size: 14px;">Últimos Jogos</h4>
        <div style="max-height: 200px; overflow-y: auto; border: 1px solid #e2e8f0; border-radius: 6px;">
          ${teamMatches
            .slice(-8)
            .reverse()
            .map((match) => {
              const isHome = match.homeTeam === teamId;
              const opponentId = isHome ? match.awayTeam : match.homeTeam;
              const opponent = userData.teams[opponentId]?.name || opponentId;
              const result =
                match.homeScore > match.awayScore
                  ? "win"
                  : match.homeScore < match.awayScore
                  ? "loss"
                  : "draw";
              const teamResult =
                (isHome && result === "win") || (!isHome && result === "loss")
                  ? "win"
                  : (isHome && result === "loss") ||
                    (!isHome && result === "win")
                  ? "loss"
                  : "draw";

              const resultColors = {
                win: { bg: "#f0fff4", border: "#38a169", text: "#22543d" },
                loss: { bg: "#fff5f5", border: "#e53e3e", text: "#c53030" },
                draw: { bg: "#fffbeb", border: "#d69e2e", text: "#d97706" },
              };

              return `
              <div style="padding: 12px 16px; border-bottom: 1px solid #f1f5f9; background: ${
                resultColors[teamResult].bg
              }; border-left: 4px solid ${resultColors[teamResult].border};">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <div style="font-weight: 600; color: ${
                      resultColors[teamResult].text
                    };">
                      ${isHome ? team.name : opponent} ${match.homeScore} x ${
                match.awayScore
              } ${isHome ? opponent : team.name}
                    </div>
                    <div style="font-size: 12px; color: #718096; margin-top: 2px;">
                      ${new Date(match.date).toLocaleDateString("pt-BR")} 
                      ${match.market ? `• ${match.market}` : ""}
                      ${match.result ? `• ${match.result}` : ""}
                    </div>
                  </div>
                  ${
                    match.profit
                      ? `
                    <div style="font-size: 12px; font-weight: 600; color: ${
                      match.profit > 0
                        ? "#38a169"
                        : match.profit < 0
                        ? "#e53e3e"
                        : "#718096"
                    };">
                      R$ ${match.profit.toFixed(2)}
                    </div>
                  `
                      : ""
                  }
                </div>
              </div>
            `;
            })
            .join("")}
        </div>
      </div>
    `
        : ""
    }

    <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
      <button onclick="showEditTeamModal('${teamId}')" 
              style="padding: 10px 16px; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500;">
        Editar
      </button>
      <button onclick="confirmDeleteTeam('${teamId}')" 
              style="padding: 10px 16px; background: #e53e3e; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500;">
        Excluir
      </button>
      <button onclick="closeModal()" 
              style="padding: 10px 16px; background: #f7fafc; color: #4a5568; border: 1px solid #e2e8f0; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500;">
        Fechar
      </button>
    </div>
  `;

  showModal("", modalContent);
}

function loadMarketChart() {
  const markets = analyzeUserMarkets();
  const container = document.getElementById("marketChart");

  // Filtrar apenas pelos mercados dos times cadastrados
  const userTeamMatches = userData.matches.filter(
    (match) => userData.teams[match.homeTeam] || userData.teams[match.awayTeam]
  );

  if (userTeamMatches.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 30px; color: #718096;">
        <div style="font-size: 36px; margin-bottom: 12px;">📊</div>
        <p>Adicione jogos dos seus times para ver análise de mercados</p>
      </div>
    `;
    return;
  }

  // Resto da função permanece igual...
}

function loadTeamPerformance() {
  const teams = analyzeUserTeams();
  const container = document.getElementById("teamPerformance");

  if (teams.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px 20px;">
        <div style="font-size: 48px; margin-bottom: 16px;">📝</div>
        <h3 style="margin: 0 0 8px 0; color: #2d3748;">Nenhum time cadastrado</h3>
        <p style="margin: 0 0 20px 0; color: #718096;">Clique no botão abaixo para adicionar seus primeiros times</p>
        <button onclick="showAddTeamModal()" style="padding: 12px 24px; background: #667eea; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
          + Adicionar Time
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = teams
    .slice(0, 6)
    .map((team) => {
      const mainCharacteristic =
        team.characteristics && team.characteristics.length > 0
          ? team.characteristics[0]
          : null;

      const characteristicLabels = {
        gols: "⚽ Gols",
        vitoria: "🏆 Vitória",
        derrota: "📉 Derrota",
        over: "📈 Over",
        under: "📉 Under",
        ambas_marcam: "🎯 Ambas",
        casa_forte: "🏠 Casa",
        visitante_forte: "✈️ Fora",
        imprevisivel: "❓ Variável",
      };

      return `
      <div class="team-item" onclick="showTeamDetailsModal('${
        team.id
      }')" style="position: relative;">
        <div class="team-info">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="team-name">${team.name}</span>
            ${
              team.characteristics.length > 0
                ? `
              <div style="display: flex; gap: 4px;">
                ${team.characteristics
                  .slice(0, 2)
                  .map(
                    (char) => `
                  <span style="background: #e2e8f0; color: #4a5568; padding: 2px 6px; border-radius: 8px; font-size: 10px; font-weight: 500;">
                    ${characteristicLabels[char]?.split(" ")[0] || char}
                  </span>
                `
                  )
                  .join("")}
                ${
                  team.characteristics.length > 2
                    ? `
                  <span style="background: #d69e2e; color: white; padding: 2px 6px; border-radius: 8px; font-size: 10px; font-weight: 500;">
                    +${team.characteristics.length - 2}
                  </span>
                `
                    : ""
                }
              </div>
            `
                : ""
            }
          </div>
          <span class="team-record">${team.wins}W - ${team.losses}L${
        team.totalMatches !== team.wins + team.losses
          ? ` - ${team.totalMatches - team.wins - team.losses}E`
          : ""
      }</span>
        </div>
        <div class="win-rate">${team.winRate}%</div>
      </div>
    `;
    })
    .join("");
}

function loadAISuggestions() {
  const container = document.getElementById("aiSuggestions");
  const teams = Object.values(userData.teams);
  const matches = userData.matches;

  const suggestions = [];

  if (teams.length === 0) {
    suggestions.push({
      icon: "📝",
      title: "Comece cadastrando seus times",
      description:
        "Adicione times com características específicas para análises personalizadas",
    });
  } else if (matches.length === 0) {
    suggestions.push({
      icon: "⚽",
      title: "Registre seus primeiros jogos",
      description:
        "Adicione histórico de partidas para gerar insights baseados nos seus dados",
    });
  } else {
    // Análise baseada nas características dos times
    const teamsByCharacteristic = {};
    teams.forEach((team) => {
      // CORREÇÃO: Verificar se características é array
      const teamCharacteristics = Array.isArray(team.characteristics)
        ? team.characteristics
        : [];
      teamCharacteristics.forEach((char) => {
        if (!teamsByCharacteristic[char]) {
          teamsByCharacteristic[char] = [];
        }
        teamsByCharacteristic[char].push(team);
      });
    });

    // Sugestões baseadas nas características mais comuns
    const mostCommonChar = Object.entries(teamsByCharacteristic).sort(
      ([, a], [, b]) => b.length - a.length
    )[0];

    if (mostCommonChar) {
      const [characteristic, charTeams] = mostCommonChar;
      const charLabels = {
        over: "apostas em Over",
        under: "apostas em Under",
        gols: "mercados de gols",
        vitoria: "apostas em vitória",
        ambas_marcam: "Ambas Marcam",
        casa_forte: "mandantes",
        visitante_forte: "visitantes",
      };

      suggestions.push({
        icon: "📊",
        title: `Você tem ${charTeams.length} times bons para ${
          charLabels[characteristic] || characteristic
        }`,
        description: `Times: ${charTeams
          .slice(0, 2)
          .map((t) => t.name)
          .join(", ")}${
          charTeams.length > 2 ? ` e mais ${charTeams.length - 2}` : ""
        }`,
      });
    }

    const patterns = analyzeUserPatterns();
    if (patterns && patterns.currentStreak >= 3) {
      suggestions.push({
        icon: "🔥",
        title: `Sequência de ${patterns.currentStreak} greens!`,
        description: "Você está em boa fase, mantenha a disciplina na gestão",
      });
    }

    if (patterns && patterns.bestDay !== "Sem dados") {
      suggestions.push({
        icon: "📅",
        title: `${patterns.bestDay} é seu melhor dia`,
        description: "Concentre suas apostas principais neste dia da semana",
      });
    }
  }

  // Preencher com sugestões padrão se necessário
  while (suggestions.length < 3) {
    suggestions.push({
      icon: "💡",
      title: "Use as características dos times",
      description:
        "Filtre times por características para encontrar padrões específicos",
    });
  }

  container.innerHTML = suggestions
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

function addCharacteristicFilter() {
  const container = document.getElementById("teamPerformance");
  const parent = container.parentElement;

  // Verificar se já existe
  if (parent.querySelector(".characteristic-filter")) return;

  const teams = Object.values(userData.teams);
  if (teams.length === 0) return;

  // Coletar todas as características
  const allCharacteristics = new Set();
  teams.forEach((team) => {
    if (team.characteristics) {
      team.characteristics.forEach((char) => allCharacteristics.add(char));
    }
  });

  if (allCharacteristics.size === 0) return;

  const characteristicLabels = {
    gols: "⚽ Gols",
    vitoria: "🏆 Vitória",
    derrota: "📉 Derrota",
    over: "📈 Over",
    under: "📉 Under",
    ambas_marcam: "🎯 Ambas Marcam",
    casa_forte: "🏠 Forte em Casa",
    visitante_forte: "✈️ Bom Visitante",
    imprevisivel: "❓ Imprevisível",
  };

  const filterDiv = document.createElement("div");
  filterDiv.className = "characteristic-filter";

  const buttonsHTML = Array.from(allCharacteristics)
    .map(
      (char) => `
        <button onclick="filterTeamsByCharacteristic('${char}')" style="padding: 4px 8px; background: #e2e8f0; color: #4a5568; border: none; border-radius: 4px; cursor: pointer; font-size: 11px; transition: background 0.2s;" onmouseover="this.style.background='#d1d5db'" onmouseout="this.style.background='#e2e8f0'">
          ${characteristicLabels[char] || char}
        </button>
      `
    )
    .join("");

  filterDiv.innerHTML = `
    <div style="margin: 12px 0; padding: 12px; background: #f8fafc; border-radius: 6px; border: 1px solid #e2e8f0;">
      <div style="font-size: 12px; color: #4a5568; margin-bottom: 8px; font-weight: 500;">Filtrar por característica:</div>
      <div style="display: flex; gap: 6px; flex-wrap: wrap;">
        <button onclick="loadTeamPerformance()" style="padding: 4px 8px; background: #667eea; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 11px;">
          Todos
        </button>
        ${buttonsHTML}
      </div>
    </div>
  `;

  container.insertAdjacentElement("beforebegin", filterDiv);
}

// 4. Função filterTeamsByCharacteristic que estava faltando
function filterTeamsByCharacteristic(characteristic) {
  const teams = analyzeUserTeams();
  const filteredTeams = teams.filter(
    (team) =>
      team.characteristics && team.characteristics.includes(characteristic)
  );

  if (filteredTeams.length === 0) {
    showNotification(
      `Nenhum time encontrado com a característica "${characteristic}"`,
      "info"
    );
    return;
  }

  const modalContent = `
    <h3>Times com característica: ${characteristic}</h3>
    <div style="display: grid; gap: 12px;">
      ${filteredTeams
        .map(
          (team) => `
        <div style="background: #f8fafc; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0; cursor: pointer;" onclick="closeModal(); showTeamDetailsModal('${team.id}')">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-weight: 600; color: #2d3748;">${team.name}</div>
              <div style="font-size: 12px; color: #718096; margin-top: 2px;">
                ${team.league} • ${team.wins}W-${team.losses}L • ${team.winRate}%
              </div>
            </div>
            <div style="color: #667eea; font-size: 14px;">→</div>
          </div>
        </div>
      `
        )
        .join("")}
    </div>
  `;

  showModal(`Filtro: ${characteristic}`, modalContent);
}

// 5. Corrigir a inicialização - REMOVER as funções que causam erro
document.addEventListener("DOMContentLoaded", function () {
  try {
    updateQuickStats();
    loadTeamPerformance();
    loadMarketChart();
    loadAISuggestions();

    setTimeout(() => {
      addAdvancedControls();
    }, 1000);
  } catch (error) {
    console.error("Erro na inicialização:", error);
    showNotification("Erro ao carregar sistema", "error");
  }
});

// 6. Atualizar o loadTeamPerformance para incluir o filtro
const originalLoadTeamPerformance = loadTeamPerformance;
loadTeamPerformance = function () {
  const teams = analyzeUserTeams();
  const container = document.getElementById("teamPerformance");

  if (teams.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px 20px;">
        <div style="font-size: 48px; margin-bottom: 16px;">📝</div>
        <h3 style="margin: 0 0 8px 0; color: #2d3748;">Nenhum time cadastrado</h3>
        <p style="margin: 0 0 20px 0; color: #718096;">Clique no botão abaixo para adicionar seus primeiros times</p>
        <button onclick="showAddTeamModal()" style="padding: 12px 24px; background: #667eea; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
          + Adicionar Time
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = teams
    .slice(0, 6)
    .map((team) => {
      const characteristicLabels = {
        gols: "⚽ Gols",
        vitoria: "🏆 Vitória",
        derrota: "📉 Derrota",
        over: "📈 Over",
        under: "📉 Under",
        ambas_marcam: "🎯 Ambas",
        casa_forte: "🏠 Casa",
        visitante_forte: "✈️ Fora",
        imprevisivel: "❓ Variável",
      };

      return `
      <div class="team-item" onclick="showTeamDetailsModal('${
        team.id
      }')" style="position: relative;">
        <div class="team-info">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="team-name">${team.name}</span>
            ${
              team.characteristics.length > 0
                ? `
              <div style="display: flex; gap: 4px;">
                ${team.characteristics
                  .slice(0, 2)
                  .map(
                    (char) => `
                  <span style="background: #e2e8f0; color: #4a5568; padding: 2px 6px; border-radius: 8px; font-size: 10px; font-weight: 500;">
                    ${characteristicLabels[char]?.split(" ")[0] || char}
                  </span>
                `
                  )
                  .join("")}
                ${
                  team.characteristics.length > 2
                    ? `
                  <span style="background: #d69e2e; color: white; padding: 2px 6px; border-radius: 8px; font-size: 10px; font-weight: 500;">
                    +${team.characteristics.length - 2}
                  </span>
                `
                    : ""
                }
              </div>
            `
                : ""
            }
          </div>
          <span class="team-record">${team.wins}W - ${team.losses}L${
        team.totalMatches !== team.wins + team.losses
          ? ` - ${team.totalMatches - team.wins - team.losses}E`
          : ""
      }</span>
        </div>
        <div class="win-rate">${team.winRate}%</div>
      </div>
    `;
    })
    .join("");

  // Adicionar filtro após renderizar
  setTimeout(() => addCharacteristicFilter(), 100);
};

// Função para filtrar times por característica
function filterTeamsByCharacteristic(characteristic) {
  const teams = analyzeUserTeams();
  const filteredTeams = teams.filter(
    (team) =>
      team.characteristics && team.characteristics.includes(characteristic)
  );

  if (filteredTeams.length === 0) {
    showNotification(
      `Nenhum time encontrado com a característica "${characteristic}"`,
      "info"
    );
    return;
  }

  const modalContent = `
    <h3>Times com característica: ${characteristic}</h3>
    <div style="display: grid; gap: 12px;">
      ${filteredTeams
        .map(
          (team) => `
        <div style="background: #f8fafc; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0; cursor: pointer;" onclick="closeModal(); showTeamDetailsModal('${team.id}')">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-weight: 600; color: #2d3748;">${team.name}</div>
              <div style="font-size: 12px; color: #718096; margin-top: 2px;">
                ${team.league} • ${team.wins}W-${team.losses}L • ${team.winRate}%
              </div>
            </div>
            <div style="color: #667eea; font-size: 14px;">→</div>
          </div>
        </div>
      `
        )
        .join("")}
    </div>
  `;

  showModal(`Filtro: ${characteristic}`, modalContent);
}

// Adicionar botão de filtro por características
function addCharacteristicFilter() {
  console.log("[addCharacteristicFilter] Iniciando...");

  const container = document.getElementById("teamPerformance");
  if (!container) {
    console.warn(
      "[addCharacteristicFilter] Elemento #teamPerformance não encontrado."
    );
    return;
  }

  const parent = container.parentElement;

  // Verificar se já existe
  if (parent.querySelector(".characteristic-filter")) {
    console.log("[addCharacteristicFilter] Filtro já existe. Saindo...");
    return;
  }

  const teams = Object.values(userData.teams);
  console.log(`[addCharacteristicFilter] ${teams.length} times encontrados.`);

  if (teams.length === 0) {
    console.log("[addCharacteristicFilter] Nenhum time disponível. Saindo...");
    return;
  }

  // Coletar todas as características
  const allCharacteristics = new Set();
  teams.forEach((team, index) => {
    console.log(
      `[addCharacteristicFilter] Processando time ${index + 1}:`,
      team
    );
    if (team.characteristics) {
      team.characteristics.forEach((char) => {
        allCharacteristics.add(char);
        console.log(
          `[addCharacteristicFilter] Característica adicionada: ${char}`
        );
      });
    }
  });

  if (allCharacteristics.size === 0) {
    console.log(
      "[addCharacteristicFilter] Nenhuma característica encontrada. Saindo..."
    );
    return;
  }

  console.log(
    "[addCharacteristicFilter] Características únicas coletadas:",
    Array.from(allCharacteristics)
  );

  const characteristicLabels = {
    gols: "⚽ Gols",
    vitoria: "🏆 Vitória",
    derrota: "📉 Derrota",
    over: "📈 Over",
    under: "📉 Under",
    ambas_marcam: "🎯 Ambas Marcam",
    casa_forte: "🏠 Forte em Casa",
    visitante_forte: "✈️ Bom Visitante",
    imprevisivel: "❓ Imprevisível",
  };

  const filterDiv = document.createElement("div");
  filterDiv.className = "characteristic-filter";

  const buttonsHTML = Array.from(allCharacteristics)
    .map(
      (char) => `
      <button onclick="filterTeamsByCharacteristic('${char}')" style="padding: 4px 8px; background: #e2e8f0; color: #4a5568; border: none; border-radius: 4px; cursor: pointer; font-size: 11px; transition: background 0.2s;" onmouseover="this.style.background='#d1d5db'" onmouseout="this.style.background='#e2e8f0'">
        ${characteristicLabels[char] || char}
      </button>
    `
    )
    .join("");

  filterDiv.innerHTML = `
    <div style="margin: 12px 0; padding: 12px; background: #f8fafc; border-radius: 6px; border: 1px solid #e2e8f0;">
      <div style="font-size: 12px; color: #4a5568; margin-bottom: 8px; font-weight: 500;">Filtrar por característica:</div>
      <div style="display: flex; gap: 6px; flex-wrap: wrap;">
        <button onclick="loadTeamPerformance()" style="padding: 4px 8px; background: #667eea; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 11px;">
          Todos
        </button>
        ${buttonsHTML}
      </div>
    </div>
  `;

  container.insertAdjacentElement("beforebegin", filterDiv);
  console.log("[addCharacteristicFilter] Filtro adicionado com sucesso!");
}

// Atualizar o loadTeamPerformance para incluir o filtro
const API_KEY = "e6151727b9b3162bb023a5d9283dc608";
const API_BASE_URL = "https://api.the-odds-api.com/v4";

// Sistema de dados locais
let userData = {
  teams: JSON.parse(localStorage.getItem("userTeams")) || {},
  matches: JSON.parse(localStorage.getItem("userMatches")) || [],
  settings: JSON.parse(localStorage.getItem("userSettings")) || {},
};

// Cache da API
let apiCache = {
  sports: null,
  odds: {},
  lastUpdate: null,
};

// ==================== TEAM MANAGEMENT SYSTEM ====================

function saveUserData() {
  localStorage.setItem("userTeams", JSON.stringify(userData.teams));
  localStorage.setItem("userMatches", JSON.stringify(userData.matches));
  localStorage.setItem("userSettings", JSON.stringify(userData.settings));
}

function addTeam(teamData) {
  const teamId =
    teamData.name.toLowerCase().replace(/\s+/g, "_") + "_" + Date.now();

  // Coletar características selecionadas
  const characteristics = [];
  if (teamData.getAll) {
    const selectedCharacteristics = teamData.getAll("characteristics");
    characteristics.push(...selectedCharacteristics);
  }

  userData.teams[teamId] = {
    id: teamId,
    name: teamData.name,
    league: teamData.league || "Não definida",
    characteristics: characteristics, // Array com as características selecionadas
    notes: teamData.notes || "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  saveUserData();
  return userData.teams[teamId];
}

function updateTeam(teamId, newData) {
  if (userData.teams[teamId]) {
    userData.teams[teamId] = { ...userData.teams[teamId], ...newData };
    userData.teams[teamId].updatedAt = new Date().toISOString();
    saveUserData();
    return userData.teams[teamId];
  }
  return null;
}

function deleteTeam(teamId) {
  if (userData.teams[teamId]) {
    delete userData.teams[teamId];
    // Remover jogos relacionados
    userData.matches = userData.matches.filter(
      (match) => match.homeTeam !== teamId && match.awayTeam !== teamId
    );
    saveUserData();
    return true;
  }
  return false;
}

function addMatch(matchData) {
  const match = {
    id: Date.now().toString(),
    homeTeam: matchData.homeTeam,
    awayTeam: matchData.awayTeam,
    homeScore: parseInt(matchData.homeScore),
    awayScore: parseInt(matchData.awayScore),
    date: matchData.date,
    league: matchData.league || "",
    market: matchData.market || "",
    prediction: matchData.prediction || "",
    result: matchData.result || "", // Green/Red/Push
    odds: parseFloat(matchData.odds) || 0,
    stake: parseFloat(matchData.stake) || 0,
    profit: parseFloat(matchData.profit) || 0,
    notes: matchData.notes || "",
    createdAt: new Date().toISOString(),
  };

  userData.matches.push(match);
  saveUserData();
  return match;
}

// ==================== USER DATA ANALYSIS ====================

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
        wins: wins,
        losses: losses,
        draws: draws,
        winRate: winRate,
        league: team.league,
        characteristics: team.characteristics || [],
        totalMatches: teamMatches.length,
        notes: team.notes || "",
      };
    })
    .sort((a, b) => b.winRate - a.winRate);
}

// Função para carregar performance dos times
function loadTeamPerformance() {
  const teams = analyzeUserTeams();
  const container = document.getElementById("teamPerformance");

  if (teams.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px 20px;">
        <div style="font-size: 48px; margin-bottom: 16px;">📝</div>
        <h3 style="margin: 0 0 8px 0; color: #2d3748;">Nenhum time cadastrado</h3>
        <p style="margin: 0 0 20px 0; color: #718096;">Clique no botão abaixo para adicionar seus primeiros times</p>
        <button onclick="showAddTeamModal()" style="padding: 12px 24px; background: #667eea; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
          + Adicionar Time
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = teams
    .slice(0, 6)
    .map((team) => {
      const characteristicLabels = {
        gols: "⚽ Gols",
        vitoria: "🏆 Vitória",
        derrota: "📉 Derrota",
        over: "📈 Over",
        under: "📉 Under",
        ambas_marcam: "🎯 Ambas",
        casa_forte: "🏠 Casa",
        visitante_forte: "✈️ Fora",
        imprevisivel: "❓ Variável",
      };

      return `
      <div class="team-item" onclick="showTeamDetailsModal('${
        team.id
      }')" style="position: relative;">
        <div class="team-info">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="team-name">${team.name}</span>
            ${
              team.characteristics.length > 0
                ? `
              <div style="display: flex; gap: 4px;">
                ${team.characteristics
                  .slice(0, 2)
                  .map(
                    (char) => `
                  <span style="background: #e2e8f0; color: #4a5568; padding: 2px 6px; border-radius: 8px; font-size: 10px; font-weight: 500;">
                    ${characteristicLabels[char]?.split(" ")[0] || char}
                  </span>
                `
                  )
                  .join("")}
                ${
                  team.characteristics.length > 2
                    ? `
                  <span style="background: #d69e2e; color: white; padding: 2px 6px; border-radius: 8px; font-size: 10px; font-weight: 500;">
                    +${team.characteristics.length - 2}
                  </span>
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
    `;
    })
    .join("");
}

function analyzeUserMarkets() {
  if (userData.matches.length === 0) {
    return {};
  }

  // Filtrar apenas jogos dos times cadastrados
  const userTeamMatches = userData.matches.filter(
    (match) => userData.teams[match.homeTeam] || userData.teams[match.awayTeam]
  );

  if (userTeamMatches.length === 0) {
    return {};
  }

  const marketStats = {};
  userTeamMatches.forEach((match) => {
    if (match.market && match.result) {
      if (!marketStats[match.market]) {
        marketStats[match.market] = { wins: 0, total: 0 };
      }
      marketStats[match.market].total++;
      if (match.result === "Green") {
        marketStats[match.market].wins++;
      }
    }
  });

  const result = {};
  Object.keys(marketStats).forEach((market) => {
    result[market] =
      marketStats[market].total > 0
        ? Math.round(
            (marketStats[market].wins / marketStats[market].total) * 100
          )
        : 0;
  });

  return result;
}

function analyzeUserPatterns() {
  if (userData.matches.length === 0) return null;

  const matches = userData.matches;

  // Calcular sequência atual
  let currentStreak = 0;
  for (let i = matches.length - 1; i >= 0; i--) {
    if (matches[i].result === "Green") {
      currentStreak++;
    } else if (matches[i].result === "Red") {
      break;
    }
  }

  // Melhor sequência
  let bestStreak = 0;
  let tempStreak = 0;
  matches.forEach((match) => {
    if (match.result === "Green") {
      tempStreak++;
      bestStreak = Math.max(bestStreak, tempStreak);
    } else {
      tempStreak = 0;
    }
  });

  // Análise por dia da semana
  const dayStats = {};
  matches.forEach((match) => {
    const day = new Date(match.date).toLocaleDateString("pt-BR", {
      weekday: "long",
    });
    if (!dayStats[day]) {
      dayStats[day] = { wins: 0, total: 0 };
    }
    dayStats[day].total++;
    if (match.result === "Green") {
      dayStats[day].wins++;
    }
  });

  const bestDay = Object.entries(dayStats)
    .map(([day, stats]) => ({
      day,
      winRate: stats.total > 0 ? stats.wins / stats.total : 0,
    }))
    .sort((a, b) => b.winRate - a.winRate)[0];

  // Faixa de odd ideal
  const greenMatches = matches.filter(
    (m) => m.result === "Green" && m.odds > 0
  );
  const avgGreenOdd =
    greenMatches.length > 0
      ? greenMatches.reduce((sum, m) => sum + m.odds, 0) / greenMatches.length
      : 2.0;

  return {
    currentStreak,
    bestStreak,
    bestDay: bestDay ? bestDay.day : "Sem dados",
    idealOddRange: `${(avgGreenOdd * 0.9).toFixed(2)} - ${(
      avgGreenOdd * 1.1
    ).toFixed(2)}`,
    totalMatches: matches.length,
    greenRate:
      matches.length > 0
        ? Math.round(
            (matches.filter((m) => m.result === "Green").length /
              matches.length) *
              100
          )
        : 0,
  };
}

// ==================== API FUNCTIONS (MANTIDAS) ====================

async function fetchAvailableSports() {
  try {
    if (apiCache.sports && isDataFresh()) {
      return apiCache.sports;
    }

    const response = await fetch(`${API_BASE_URL}/sports/?apiKey=${API_KEY}`);

    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status}`);
    }

    const sports = await response.json();
    apiCache.sports = sports;
    apiCache.lastUpdate = Date.now();

    return sports;
  } catch (error) {
    console.error("Erro ao buscar esportes:", error);
    return [];
  }
}

async function fetchOddsForSport(
  sportKey,
  regions = "us,uk,eu",
  markets = "h2h,spreads,totals"
) {
  try {
    const cacheKey = `${sportKey}_${regions}_${markets}`;

    if (apiCache.odds[cacheKey] && isDataFresh()) {
      return apiCache.odds[cacheKey];
    }

    const response = await fetch(
      `${API_BASE_URL}/sports/${sportKey}/odds/?apiKey=${API_KEY}&regions=${regions}&markets=${markets}&oddsFormat=decimal`
    );

    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status}`);
    }

    const odds = await response.json();
    apiCache.odds[cacheKey] = odds;

    return odds;
  } catch (error) {
    console.error(`Erro ao buscar odds para ${sportKey}:`, error);
    return [];
  }
}

function isDataFresh() {
  return (
    apiCache.lastUpdate && Date.now() - apiCache.lastUpdate < 30 * 60 * 1000
  );
}

// ==================== VALUE BETS & TRENDS (API) ====================

async function findValueBets() {
  try {
    showLoadingState("Analisando apostas de valor...");

    const odds = await fetchOddsForSport("soccer_epl");
    if (!odds || odds.length < 3) {
      hideLoadingState();
      return;
    }

    const valueBets = [];

    odds.slice(0, 8).forEach((game) => {
      if (game.bookmakers && game.bookmakers.length >= 2) {
        const h2hMarkets = game.bookmakers
          .map((bm) => ({
            title: bm.title,
            market: bm.markets.find((m) => m.key === "h2h"),
          }))
          .filter((bm) => bm.market);

        if (h2hMarkets.length >= 2) {
          h2hMarkets[0].market.outcomes.forEach((outcome1) => {
            h2hMarkets.slice(1).forEach((bookmaker2) => {
              const outcome2 = bookmaker2.market.outcomes.find(
                (o) => o.name === outcome1.name
              );
              if (outcome2) {
                const diff = Math.abs(outcome1.price - outcome2.price);
                if (diff > 0.25) {
                  valueBets.push({
                    game: `${game.home_team} vs ${game.away_team}`,
                    outcome: outcome1.name,
                    bookmaker1: h2hMarkets[0].title,
                    odd1: outcome1.price.toFixed(2),
                    bookmaker2: bookmaker2.title,
                    odd2: outcome2.price.toFixed(2),
                    difference: diff.toFixed(2),
                    bestOdd: Math.max(outcome1.price, outcome2.price).toFixed(
                      2
                    ),
                  });
                }
              }
            });
          });
        }
      }
    });

    hideLoadingState();

    if (valueBets.length > 0) {
      showValueBetsModal(valueBets.slice(0, 5));
    } else {
      showNotification(
        "Nenhuma aposta de valor encontrada no momento.",
        "info"
      );
    }

    return valueBets;
  } catch (error) {
    console.error("Erro ao buscar apostas de valor:", error);
    hideLoadingState();
  }
}

async function analyzeLiveTrends() {
  try {
    showLoadingState("Analisando tendências ao vivo...");

    const sports = await fetchAvailableSports();
    const popularSports = sports
      .filter((s) =>
        [
          "soccer_epl",
          "soccer_spain_la_liga",
          "soccer_germany_bundesliga",
        ].includes(s.key)
      )
      .slice(0, 3);

    const trends = {
      totalGames: 0,
      avgHomeOdd: [],
      avgAwayOdd: [],
      favorites: [],
    };

    for (const sport of popularSports) {
      const odds = await fetchOddsForSport(sport.key);

      odds.slice(0, 6).forEach((game) => {
        if (game.bookmakers && game.bookmakers[0]) {
          const h2hMarket = game.bookmakers[0].markets.find(
            (m) => m.key === "h2h"
          );

          if (h2hMarket) {
            const homeOdd = h2hMarket.outcomes.find(
              (o) => o.name === game.home_team
            )?.price;
            const awayOdd = h2hMarket.outcomes.find(
              (o) => o.name === game.away_team
            )?.price;

            if (homeOdd && awayOdd) {
              trends.avgHomeOdd.push(homeOdd);
              trends.avgAwayOdd.push(awayOdd);

              if (homeOdd < awayOdd) {
                trends.favorites.push({
                  team: game.home_team,
                  odd: homeOdd,
                  type: "home",
                });
              } else {
                trends.favorites.push({
                  team: game.away_team,
                  odd: awayOdd,
                  type: "away",
                });
              }
            }
          }

          trends.totalGames++;
        }
      });

      await sleep(700);
    }

    const analysis = {
      totalGames: trends.totalGames,
      avgHomeOdd:
        trends.avgHomeOdd.length > 0
          ? (
              trends.avgHomeOdd.reduce((a, b) => a + b, 0) /
              trends.avgHomeOdd.length
            ).toFixed(2)
          : "N/A",
      avgAwayOdd:
        trends.avgAwayOdd.length > 0
          ? (
              trends.avgAwayOdd.reduce((a, b) => a + b, 0) /
              trends.avgAwayOdd.length
            ).toFixed(2)
          : "N/A",
      homeFavorites: trends.favorites.filter((f) => f.type === "home").length,
      awayFavorites: trends.favorites.filter((f) => f.type === "away").length,
      strongFavorites: trends.favorites.filter((f) => f.odd < 1.8).length,
    };

    hideLoadingState();
    showTrendsModal(analysis);
  } catch (error) {
    console.error("Erro ao analisar tendências:", error);
    hideLoadingState();
  }
}

// ==================== UI FUNCTIONS ====================

function updateQuickStats() {
  const patterns = analyzeUserPatterns();
  const teams = analyzeUserTeams();
  const markets = analyzeUserMarkets();

  // Sequência atual
  if (patterns) {
    document.getElementById("hotStreak").textContent = patterns.currentStreak;
  } else {
    document.getElementById("hotStreak").textContent = "0";
  }

  // Melhor mercado
  const bestMarket = Object.entries(markets).sort(([, a], [, b]) => b - a)[0];
  if (bestMarket && bestMarket[1] > 0) {
    document.getElementById(
      "bestMarket"
    ).textContent = `${bestMarket[0]} (${bestMarket[1]}%)`;
  } else {
    document.getElementById("bestMarket").textContent = "Sem dados";
  }

  // Melhor time
  if (teams.length > 0 && teams[0].winRate > 0) {
    document.getElementById(
      "bestTeam"
    ).textContent = `${teams[0].name} (${teams[0].winRate}%)`;
  } else {
    document.getElementById("bestTeam").textContent = "Adicione times";
  }
}

// Função para analisar padrões do usuário
function analyzeUserPatterns() {
  if (userData.matches.length === 0) return null;

  const matches = userData.matches;

  // Calcular sequência atual
  let currentStreak = 0;
  for (let i = matches.length - 1; i >= 0; i--) {
    if (matches[i].result === "Green") {
      currentStreak++;
    } else if (matches[i].result === "Red") {
      break;
    }
  }

  // Melhor sequência
  let bestStreak = 0;
  let tempStreak = 0;
  matches.forEach((match) => {
    if (match.result === "Green") {
      tempStreak++;
      bestStreak = Math.max(bestStreak, tempStreak);
    } else {
      tempStreak = 0;
    }
  });

  // Análise por dia da semana
  const dayStats = {};
  matches.forEach((match) => {
    const day = new Date(match.date).toLocaleDateString("pt-BR", {
      weekday: "long",
    });
    if (!dayStats[day]) {
      dayStats[day] = { wins: 0, total: 0 };
    }
    dayStats[day].total++;
    if (match.result === "Green") {
      dayStats[day].wins++;
    }
  });

  const bestDay = Object.entries(dayStats)
    .map(([day, stats]) => ({
      day,
      winRate: stats.total > 0 ? stats.wins / stats.total : 0,
    }))
    .sort((a, b) => b.winRate - a.winRate)[0];

  // Faixa de odd ideal
  const greenMatches = matches.filter(
    (m) => m.result === "Green" && m.odds > 0
  );
  const avgGreenOdd =
    greenMatches.length > 0
      ? greenMatches.reduce((sum, m) => sum + m.odds, 0) / greenMatches.length
      : 2.0;

  return {
    currentStreak,
    bestStreak,
    bestDay: bestDay ? bestDay.day : "Sem dados",
    idealOddRange: `${(avgGreenOdd * 0.9).toFixed(2)} - ${(
      avgGreenOdd * 1.1
    ).toFixed(2)}`,
    totalMatches: matches.length,
    greenRate:
      matches.length > 0
        ? Math.round(
            (matches.filter((m) => m.result === "Green").length /
              matches.length) *
              100
          )
        : 0,
  };
}

function loadTeamPerformance() {
  const teams = analyzeUserTeams();
  const container = document.getElementById("teamPerformance");

  if (teams.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px 20px;">
        <div style="font-size: 48px; margin-bottom: 16px;">📝</div>
        <h3 style="margin: 0 0 8px 0; color: #2d3748;">Nenhum time cadastrado</h3>
        <p style="margin: 0 0 20px 0; color: #718096;">Clique no botão abaixo para adicionar seus primeiros times</p>
        <button onclick="showAddTeamModal()" style="padding: 12px 24px; background: #667eea; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
          + Adicionar Time
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = teams
    .slice(0, 6)
    .map(
      (team) => `
    <div class="team-item" onclick="showTeamDetailsModal('${team.id}')">
      <div class="team-info">
        <span class="team-name">${team.name}</span>
        <span class="team-record">${team.wins}W - ${team.losses}L</span>
      </div>
      <div class="win-rate">${team.winRate}%</div>
    </div>
  `
    )
    .join("");
}

function loadMarketChart() {
  const markets = analyzeUserMarkets();
  const container = document.getElementById("marketChart");

  const hasData = Object.values(markets).some((rate) => rate > 0);

  if (!hasData) {
    container.innerHTML = `
      <div style="text-align: center; padding: 30px; color: #718096;">
        <div style="font-size: 36px; margin-bottom: 12px;">📊</div>
        <p>Adicione jogos dos seus times para ver análise de mercados</p>
        <button onclick="showAddMatchModal()" style="padding: 10px 16px; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer; margin-top: 12px;">
          + Adicionar Jogo
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = Object.entries(markets)
    .slice(0, 5) // Limitar a 5 mercados
    .map(
      ([market, rate]) => `
    <div class="market-bar">
      <div class="market-name">${market}</div>
      <div class="bar-container">
        <div class="bar" style="width: ${rate}%"></div>
        <span class="percentage">${rate}%</span>
      </div>
    </div>
  `
    )
    .join("");
}

function loadPatterns() {
  const patterns = analyzeUserPatterns();

  if (!patterns) {
    const patternValues = document.querySelectorAll(".pattern-value");
    if (patternValues.length >= 4) {
      patternValues[0].textContent = "Sem dados";
      patternValues[1].textContent = "Sem dados";
      patternValues[2].textContent = "Sem dados";
      patternValues[3].textContent = "Sem dados";
    }
    return;
  }

  const patternValues = document.querySelectorAll(".pattern-value");
  if (patternValues.length >= 4) {
    patternValues[0].textContent = `${patterns.bestStreak} Greens`;
    patternValues[1].textContent = patterns.bestDay;
    patternValues[2].textContent = patterns.idealOddRange;
    patternValues[3].textContent = `${patterns.greenRate}%`;
  }
}

function loadAISuggestions() {
  const container = document.getElementById("aiSuggestions");
  const teams = Object.values(userData.teams);
  const matches = userData.matches;

  const suggestions = [];

  if (teams.length === 0) {
    suggestions.push({
      icon: "📝",
      title: "Comece cadastrando seus times",
      description:
        "Adicione informações dos times que você acompanha para análises personalizadas",
    });
  } else if (matches.length === 0) {
    suggestions.push({
      icon: "⚽",
      title: "Registre seus primeiros jogos",
      description:
        "Adicione histórico de partidas para gerar insights baseados nos seus dados",
    });
  } else {
    const patterns = analyzeUserPatterns();

    if (patterns.currentStreak >= 3) {
      suggestions.push({
        icon: "🔥",
        title: `Sequência de ${patterns.currentStreak} greens!`,
        description: "Você está em boa fase, mantenha a disciplina na gestão",
      });
    }

    const bestTeams = analyzeUserTeams().slice(0, 3);
    if (bestTeams.length > 0 && bestTeams[0].winRate > 60) {
      suggestions.push({
        icon: "⭐",
        title: `${bestTeams[0].name} é seu time mais rentável`,
        description: `${bestTeams[0].winRate}% de aproveitamento - considere apostar mais neste time`,
      });
    }

    if (patterns.bestDay !== "Sem dados") {
      suggestions.push({
        icon: "📅",
        title: `${patterns.bestDay} é seu melhor dia`,
        description: "Concentre suas apostas principais neste dia da semana",
      });
    }
  }

  // Preencher com sugestões padrão se necessário
  while (suggestions.length < 3) {
    suggestions.push({
      icon: "💡",
      title: "Mantenha registros detalhados",
      description: "Quanto mais dados você tiver, melhores serão as análises",
    });
  }

  container.innerHTML = suggestions
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

// ==================== MODALS ====================

// Função para exibir modal de adicionar time (atualizada)
function showAddTeamModal() {
  const modalContent = `
    <h3 style="margin: 0 0 24px 0; color: #2d3748; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px;">Adicionar Novo Time</h3>
    <form onsubmit="handleAddTeam(event)" style="display: grid; gap: 20px;">
      
      <div style="background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0;">
        <h4 style="margin: 0 0 16px 0; color: #4a5568;">Informações Básicas</h4>
        
        <div style="display: grid; gap: 16px;">
          <div>
            <label style="display: block; margin-bottom: 6px; font-weight: 600; color: #2d3748;">Nome do Time *</label>
            <input type="text" name="name" required placeholder="Ex: Manchester City" 
                   style="width: 100%; padding: 12px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 14px; background: white;">
          </div>
          
          <div>
            <label style="display: block; margin-bottom: 6px; font-weight: 600; color: #2d3748;">Liga/Campeonato</label>
            <input type="text" name="league" placeholder="Ex: Premier League, Serie A, Brasileirão" 
                   style="width: 100%; padding: 12px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 14px; background: white;">
          </div>
        </div>
      </div>

      <div style="background: #fff5f5; padding: 20px; border-radius: 8px; border: 1px solid #fed7d7;">
        <h4 style="margin: 0 0 16px 0; color: #4a5568;">Características do Time</h4>
        <p style="margin: 0 0 16px 0; font-size: 13px; color: #718096;">Selecione uma ou mais características que definem este time (pode marcar várias opções)</p>
        
        <div style="display: grid; gap: 12px;">
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 4px; transition: background 0.2s;" onmouseover="this.style.background='#f7fafc'" onmouseout="this.style.background='transparent'">
            <input type="checkbox" name="characteristics" value="over" style="cursor: pointer;">
            <span style="font-weight: 500;">📈 Time bom para Over</span>
            <span style="font-size: 12px; color: #718096;">- Jogos com muitos gols</span>
          </label>
          
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 4px; transition: background 0.2s;" onmouseover="this.style.background='#f7fafc'" onmouseout="this.style.background='transparent'">
            <input type="checkbox" name="characteristics" value="under" style="cursor: pointer;">
            <span style="font-weight: 500;">📉 Time bom para Under</span>
            <span style="font-size: 12px; color: #718096;">- Jogos com poucos gols</span>
          </label>
          
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 4px; transition: background 0.2s;" onmouseover="this.style.background='#f7fafc'" onmouseout="this.style.background='transparent'">
            <input type="checkbox" name="characteristics" value="ambas_marcam" style="cursor: pointer;">
            <span style="font-weight: 500;">🎯 Time bom para Ambas Marcam</span>
            <span style="font-size: 12px; color: #718096;">- Ataca e sofre gols</span>
          </label>
          
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 4px; transition: background 0.2s;" onmouseover="this.style.background='#f7fafc'" onmouseout="this.style.background='transparent'">
            <input type="checkbox" name="characteristics" value="casa_forte" style="cursor: pointer;">
            <span style="font-weight: 500;">🏠 Muito forte em Casa</span>
            <span style="font-size: 12px; color: #718096;">- Grande vantagem mandante</span>
          </label>
          
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 4px; transition: background 0.2s;" onmouseover="this.style.background='#f7fafc'" onmouseout="this.style.background='transparent'">
            <input type="checkbox" name="characteristics" value="visitante_forte" style="cursor: pointer;">
            <span style="font-weight: 500;">✈️ Bom Visitante</span>
            <span style="font-size: 12px; color: #718096;">- Joga bem fora de casa</span>
          </label>
          
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 4px; transition: background 0.2s;" onmouseover="this.style.background='#f7fafc'" onmouseout="this.style.background='transparent'">
            <input type="checkbox" name="characteristics" value="imprevisivel" style="cursor: pointer;">
            <span style="font-weight: 500;">❓ Time Imprevisível</span>
            <span style="font-size: 12px; color: #718096;">- Resultados inconsistentes</span>
          </label>
        </div>
      </div>

      <div style="background: #f0fff4; padding: 20px; border-radius: 8px; border: 1px solid #c6f6d5;">
        <h4 style="margin: 0 0 8px 0; color: #4a5568;">Notas Personalizadas</h4>
        <p style="margin: 0 0 12px 0; font-size: 13px; color: #718096;">Adicione qualquer informação importante sobre este time</p>
        
        <textarea name="notes" 
                  placeholder="Ex: Joga melhor no primeiro tempo, tem problemas defensivos, jogador X é fundamental, evitar quando joga contra times grandes..." 
                  style="width: 100%; padding: 12px; border: 1px solid #e2e8f0; border-radius: 6px; resize: vertical; min-height: 80px; font-family: inherit; background: white;" 
                  rows="4"></textarea>
      </div>

      <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
        <button type="button" onclick="closeModal()" 
                style="padding: 12px 24px; background: #f7fafc; color: #4a5568; border: 1px solid #e2e8f0; border-radius: 6px; cursor: pointer; font-weight: 500; transition: all 0.2s;">
          Cancelar
        </button>
        <button type="submit" 
                style="padding: 12px 24px; background: #38a169; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; transition: all 0.2s; box-shadow: 0 2px 4px rgba(56, 161, 105, 0.2);">
          💾 Salvar Time
        </button>
      </div>
    </form>
  `;

  showModal("", modalContent);
}

function handleAddTeam(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const teamData = Object.fromEntries(formData.entries());

  try {
    addTeam(teamData);
    closeModal();
    showNotification(
      `Time ${teamData.name} adicionado com sucesso!`,
      "success"
    );
    loadTeamPerformance();
    loadAISuggestions();
  } catch (error) {
    console.error("Erro ao adicionar time:", error);
    showNotification("Erro ao adicionar time", "error");
  }
}

// Função para mostrar detalhes do time (corrigida)
function showTeamDetailsModal(teamId) {
  const team = userData.teams[teamId];
  if (!team) {
    showNotification("Time não encontrado!", "error");
    return;
  }

  const teamMatches = userData.matches.filter(
    (m) => m.homeTeam === teamId || m.awayTeam === teamId
  );

  const characteristicLabels = {
    gols: "⚽ Bom para Gols",
    vitoria: "🏆 Bom para Vitória",
    derrota: "📉 Bom para Derrota",
    over: "📈 Bom para Over",
    under: "📉 Bom para Under",
    ambas_marcam: "🎯 Ambas Marcam",
    casa_forte: "🏠 Forte em Casa",
    visitante_forte: "✈️ Bom Visitante",
    imprevisivel: "❓ Imprevisível",
  };

  // CORREÇÃO: Garantir que characteristics seja array
  const teamCharacteristics = Array.isArray(team.characteristics)
    ? team.characteristics
    : [];

  const modalContent = `
    <h3 style="margin: 0 0 20px 0; color: #2d3748; display: flex; align-items: center; gap: 12px;">
      <span>${team.name}</span>
      <span style="background: #e2e8f0; color: #4a5568; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: normal;">
        ${team.league || "Liga não definida"}
      </span>
    </h3>
    
    ${
      teamCharacteristics.length > 0
        ? `
      <div style="margin-bottom: 24px;">
        <h4 style="margin: 0 0 12px 0; color: #4a5568; font-size: 14px;">Características</h4>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          ${teamCharacteristics
            .map(
              (char) => `
            <span style="background: #667eea; color: white; padding: 6px 12px; border-radius: 16px; font-size: 12px; font-weight: 500;">
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
      teamMatches.length > 0
        ? `
      <div style="margin-bottom: 24px;">
        <h4 style="margin: 0 0 12px 0; color: #4a5568; font-size: 14px;">Estatísticas (${
          teamMatches.length
        } jogos)</h4>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(80px, 1fr)); gap: 12px;">
          <div style="background: #f0fff4; padding: 12px; border-radius: 6px; text-align: center; border: 1px solid #c6f6d5;">
            <div style="font-size: 18px; font-weight: 600; color: #22543d;">${
              teamMatches.filter(
                (m) =>
                  (m.homeTeam === teamId && m.homeScore > m.awayScore) ||
                  (m.awayTeam === teamId && m.awayScore > m.homeScore)
              ).length
            }</div>
            <div style="font-size: 11px; color: #22543d;">Vitórias</div>
          </div>
          <div style="background: #fff5f5; padding: 12px; border-radius: 6px; text-align: center; border: 1px solid #fed7d7;">
            <div style="font-size: 18px; font-weight: 600; color: #c53030;">${
              teamMatches.filter(
                (m) =>
                  (m.homeTeam === teamId && m.homeScore < m.awayScore) ||
                  (m.awayTeam === teamId && m.awayScore < m.homeScore)
              ).length
            }</div>
            <div style="font-size: 11px; color: #c53030;">Derrotas</div>
          </div>
          <div style="background: #fffbeb; padding: 12px; border-radius: 6px; text-align: center; border: 1px solid #fed7aa;">
            <div style="font-size: 18px; font-weight: 600; color: #d97706;">${
              teamMatches.filter((m) => m.homeScore === m.awayScore).length
            }</div>
            <div style="font-size: 11px; color: #d97706;">Empates</div>
          </div>
        </div>
      </div>
    `
        : `
      <div style="margin-bottom: 24px;">
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; color: #718096; text-align: center;">
          <div style="font-size: 32px; margin-bottom: 8px;">⚽</div>
          <div>Nenhum jogo cadastrado para este time</div>
        </div>
      </div>
    `
    }

    ${
      team.notes && team.notes.trim()
        ? `
      <div style="margin-bottom: 24px;">
        <h4 style="margin: 0 0 8px 0; color: #4a5568; font-size: 14px;">Notas</h4>
        <div style="background: #f8fafc; padding: 16px; border-radius: 6px; border-left: 4px solid #667eea; font-size: 14px; line-height: 1.6; color: #4a5568;">
          ${team.notes
            .split("\n")
            .map((line) => `<p style="margin: 0 0 8px 0;">${line}</p>`)
            .join("")}
        </div>
      </div>
    `
        : ""
    }

    <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
      <button onclick="closeModal()" 
              style="padding: 10px 16px; background: #f7fafc; color: #4a5568; border: 1px solid #e2e8f0; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500;">
        Fechar
      </button>
    </div>
  `;

  showModal("", modalContent);
}

// Função para adicionar time (corrigida)
function handleAddTeam(event) {
  event.preventDefault();
  const formData = new FormData(event.target);

  // Coletar características selecionadas
  const characteristics = formData.getAll("characteristics");

  try {
    // Gerar ID único para o time
    const teamId =
      formData.get("name").toLowerCase().replace(/\s+/g, "_") +
      "_" +
      Date.now();

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
    loadTeamPerformance();
    loadAISuggestions();
    updateQuickStats();
  } catch (error) {
    console.error("Erro ao adicionar time:", error);
    showNotification("Erro ao adicionar time", "error");
  }
}

function showEditTeamModal(teamId) {
  const team = userData.teams[teamId];
  if (!team) return;

  // CORREÇÃO: Garantir que characteristics seja array
  const teamCharacteristics = Array.isArray(team.characteristics)
    ? team.characteristics
    : [];

  const modalContent = `
    <h3>Editar ${team.name}</h3>
    <form onsubmit="handleEditTeam(event, '${teamId}')" style="display: grid; gap: 16px;">
      <div>
        <label style="display: block; margin-bottom: 4px; font-weight: 600;">Nome do Time *</label>
        <input type="text" name="name" value="${team.name}" required 
               style="width: 100%; padding: 8px; border: 1px solid #e2e8f0; border-radius: 4px;">
      </div>
      
      <div>
        <label style="display: block; margin-bottom: 4px; font-weight: 600;">Liga</label>
        <input type="text" name="league" value="${team.league || ""}" 
               style="width: 100%; padding: 8px; border: 1px solid #e2e8f0; border-radius: 4px;">
      </div>

      <div>
        <label style="display: block; margin-bottom: 8px; font-weight: 600;">Características</label>
        <div style="display: grid; gap: 8px;">
          <label style="display: flex; align-items: center; gap: 8px;">
            <input type="checkbox" name="characteristics" value="gols" ${
              teamCharacteristics.includes("gols") ? "checked" : ""
            }>
            <span>⚽ Bom para Gols</span>
          </label>
          <label style="display: flex; align-items: center; gap: 8px;">
            <input type="checkbox" name="characteristics" value="vitoria" ${
              teamCharacteristics.includes("vitoria") ? "checked" : ""
            }>
            <span>🏆 Bom para Vitória</span>
          </label>
          <label style="display: flex; align-items: center; gap: 8px;">
            <input type="checkbox" name="characteristics" value="over" ${
              teamCharacteristics.includes("over") ? "checked" : ""
            }>
            <span>📈 Bom para Over</span>
          </label>
          <label style="display: flex; align-items: center; gap: 8px;">
            <input type="checkbox" name="characteristics" value="under" ${
              teamCharacteristics.includes("under") ? "checked" : ""
            }>
            <span>📉 Bom para Under</span>
          </label>
          <label style="display: flex; align-items: center; gap: 8px;">
            <input type="checkbox" name="characteristics" value="ambas_marcam" ${
              teamCharacteristics.includes("ambas_marcam") ? "checked" : ""
            }>
            <span>🎯 Ambas Marcam</span>
          </label>
          <label style="display: flex; align-items: center; gap: 8px;">
            <input type="checkbox" name="characteristics" value="casa_forte" ${
              teamCharacteristics.includes("casa_forte") ? "checked" : ""
            }>
            <span>🏠 Forte em Casa</span>
          </label>
        </div>
      </div>

      <div>
        <label style="display: block; margin-bottom: 4px; font-weight: 600;">Notas</label>
        <textarea name="notes" style="width: 100%; padding: 8px; border: 1px solid #e2e8f0; border-radius: 4px; resize: vertical;" rows="3">${
          team.notes || ""
        }</textarea>
      </div>

      <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 20px;">
        <button type="button" onclick="closeModal()" 
                style="padding: 10px 20px; background: #e2e8f0; border: none; border-radius: 6px; cursor: pointer;">
          Cancelar
        </button>
        <button type="submit" 
                style="padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
          Atualizar
        </button>
      </div>
    </form>
  `;

  showModal("Editar Time", modalContent);
}

function showTeamDetailsModal(teamId) {
  const team = userData.teams[teamId];
  if (!team) return;

  const teamMatches = userData.matches.filter(
    (m) => m.homeTeam === teamId || m.awayTeam === teamId
  );

  const characteristicLabels = {
    gols: "⚽ Bom para Gols",
    vitoria: "🏆 Bom para Vitória",
    derrota: "📉 Bom para Derrota",
    over: "📈 Bom para Over",
    under: "📉 Bom para Under",
    ambas_marcam: "🎯 Ambas Marcam",
    casa_forte: "🏠 Forte em Casa",
    visitante_forte: "✈️ Bom Visitante",
    imprevisivel: "❓ Imprevisível",
  };

  const modalContent = `
    <h3 style="margin: 0 0 20px 0; color: #2d3748; display: flex; align-items: center; gap: 12px;">
      <span>${team.name}</span>
      <span style="background: #e2e8f0; color: #4a5568; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: normal;">
        ${team.league}
      </span>
    </h3>
    
    ${
      team.characteristics && team.characteristics.length > 0
        ? `
      <div style="margin-bottom: 24px;">
        <h4 style="margin: 0 0 12px 0; color: #4a5568; font-size: 14px;">Características</h4>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          ${team.characteristics
            .map(
              (char) => `
            <span style="background: #667eea; color: white; padding: 6px 12px; border-radius: 16px; font-size: 12px; font-weight: 500;">
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
      teamMatches.length > 0
        ? `
      <div style="margin-bottom: 24px;">
        <h4 style="margin: 0 0 12px 0; color: #4a5568; font-size: 14px;">Estatísticas (${
          teamMatches.length
        } jogos)</h4>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(80px, 1fr)); gap: 12px;">
          <div style="background: #f0fff4; padding: 12px; border-radius: 6px; text-align: center; border: 1px solid #c6f6d5;">
            <div style="font-size: 18px; font-weight: 600; color: #22543d;">${
              teamMatches.filter(
                (m) =>
                  (m.homeTeam === teamId && m.homeScore > m.awayScore) ||
                  (m.awayTeam === teamId && m.awayScore > m.homeScore)
              ).length
            }</div>
            <div style="font-size: 11px; color: #22543d;">Vitórias</div>
          </div>
          <div style="background: #fff5f5; padding: 12px; border-radius: 6px; text-align: center; border: 1px solid #fed7d7;">
            <div style="font-size: 18px; font-weight: 600; color: #c53030;">${
              teamMatches.filter(
                (m) =>
                  (m.homeTeam === teamId && m.homeScore < m.awayScore) ||
                  (m.awayTeam === teamId && m.awayScore < m.homeScore)
              ).length
            }</div>
            <div style="font-size: 11px; color: #c53030;">Derrotas</div>
          </div>
          <div style="background: #fffbeb; padding: 12px; border-radius: 6px; text-align: center; border: 1px solid #fed7aa;">
            <div style="font-size: 18px; font-weight: 600; color: #d97706;">${
              teamMatches.filter((m) => m.homeScore === m.awayScore).length
            }</div>
            <div style="font-size: 11px; color: #d97706;">Empates</div>
          </div>
        </div>
      </div>
    `
        : ""
    }

    ${
      team.notes
        ? `
      <div style="margin-bottom: 24px;">
        <h4 style="margin: 0 0 8px 0; color: #4a5568; font-size: 14px;">Notas</h4>
        <div style="background: #f8fafc; padding: 16px; border-radius: 6px; border-left: 4px solid #667eea; font-size: 14px; line-height: 1.6; color: #4a5568;">
          ${team.notes
            .split("\n")
            .map((line) => `<p style="margin: 0 0 8px 0;">${line}</p>`)
            .join("")}
        </div>
      </div>
    `
        : ""
    }

    <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
      <button onclick="showEditTeamModal('${teamId}')" 
              style="padding: 10px 16px; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500;">
        Editar
      </button>
      <button onclick="confirmDeleteTeam('${teamId}')" 
              style="padding: 10px 16px; background: #e53e3e; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500;">
        Excluir
      </button>
      <button onclick="closeModal()" 
              style="padding: 10px 16px; background: #f7fafc; color: #4a5568; border: 1px solid #e2e8f0; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500;">
        Fechar
      </button>
    </div>
  `;

  showModal("", modalContent);
}

function handleEditTeam(event, teamId) {
  event.preventDefault();
  const formData = new FormData(event.target);

  // Coletar características selecionadas
  const characteristics = formData.getAll("characteristics");

  try {
    userData.teams[teamId] = {
      ...userData.teams[teamId],
      name: formData.get("name"),
      league: formData.get("league"),
      characteristics: characteristics,
      notes: formData.get("notes"),
      updatedAt: new Date().toISOString(),
    };

    saveUserData();
    closeModal();
    showNotification("Time atualizado com sucesso!", "success");

    // Recarregar interfaces
    loadTeamPerformance();
    loadAISuggestions();
    updateQuickStats();
  } catch (error) {
    console.error("Erro ao editar time:", error);
    showNotification("Erro ao atualizar time", "error");
  }
}

// Função para confirmar exclusão de time (NOVA)
function confirmDeleteTeam(teamId) {
  const team = userData.teams[teamId];
  if (!team) return;

  if (
    confirm(
      `Tem certeza que deseja excluir ${team.name}? Esta ação não pode ser desfeita.`
    )
  ) {
    delete userData.teams[teamId];

    // Remover jogos relacionados
    userData.matches = userData.matches.filter(
      (match) => match.homeTeam !== teamId && match.awayTeam !== teamId
    );

    saveUserData();
    closeModal();
    showNotification(`Time ${team.name} excluído com sucesso!`, "success");

    // Recarregar interfaces
    loadTeamPerformance();
    loadAISuggestions();
    updateQuickStats();
    loadMarketChart();
  }
}

function confirmDeleteTeam(teamId) {
  const team = userData.teams[teamId];
  if (!team) return;

  if (
    confirm(
      `Tem certeza que deseja excluir ${team.name}? Esta ação não pode ser desfeita.`
    )
  ) {
    deleteTeam(teamId);
    closeModal();
    showNotification(`Time ${team.name} excluído com sucesso!`, "success");
    loadTeamPerformance();
    loadPatterns();
    loadAISuggestions();
  }
}

function showAddMatchModal() {
  const teams = Object.values(userData.teams);
  if (teams.length < 2) {
    showNotification(
      "Você precisa de pelo menos 2 times cadastrados para adicionar um jogo.",
      "warning"
    );
    return;
  }

  const teamOptions = teams
    .map((team) => `<option value="${team.id}">${team.name}</option>`)
    .join("");

  const modalContent = `
    <h3>Adicionar Jogo</h3>
    <form onsubmit="handleAddMatch(event)" style="display: grid; gap: 16px;">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
        <div>
          <label style="display: block; margin-bottom: 4px; font-weight: 600;">Time da Casa *</label>
          <select name="homeTeam" required style="width: 100%; padding: 8px; border: 1px solid #e2e8f0; border-radius: 4px;">
            <option value="">Selecione...</option>
            ${teamOptions}
          </select>
        </div>
        <div>
          <label style="display: block; margin-bottom: 4px; font-weight: 600;">Time Visitante *</label>
          <select name="awayTeam" required style="width: 100%; padding: 8px; border: 1px solid #e2e8f0; border-radius: 4px;">
            <option value="">Selecione...</option>
            ${teamOptions}
          </select>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px;">
        <div>
          <label style="display: block; margin-bottom: 4px; font-weight: 600;">Gols Casa</label>
          <input type="number" name="homeScore" min="0" value="0" style="width: 100%; padding: 8px; border: 1px solid #e2e8f0; border-radius: 4px;">
        </div>
        <div>
          <label style="display: block; margin-bottom: 4px; font-weight: 600;">Gols Visitante</label>
          <input type="number" name="awayScore" min="0" value="0" style="width: 100%; padding: 8px; border: 1px solid #e2e8f0; border-radius: 4px;">
        </div>
        <div>
          <label style="display: block; margin-bottom: 4px; font-weight: 600;">Data *</label>
          <input type="date" name="date" required style="width: 100%; padding: 8px; border: 1px solid #e2e8f0; border-radius: 4px;">
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
        <div>
          <label style="display: block; margin-bottom: 4px; font-weight: 600;">Mercado</label>
          <select name="market" style="width: 100%; padding: 8px; border: 1px solid #e2e8f0; border-radius: 4px;">
            <option value="">Selecione...</option>
            <option value="Resultado Final">Resultado Final</option>
            <option value="Over/Under Gols">Over/Under Gols</option>
            <option value="Ambas Marcam">Ambas Marcam</option>
            <option value="Dupla Chance">Dupla Chance</option>
            <option value="Handicap">Handicap</option>
          </select>
        </div>
        <div>
          <label style="display: block; margin-bottom: 4px; font-weight: 600;">Resultado</label>
          <select name="result" style="width: 100%; padding: 8px; border: 1px solid #e2e8f0; border-radius: 4px;">
            <option value="">Selecione...</option>
            <option value="Green">Green ✅</option>
            <option value="Red">Red ❌</option>
            <option value="Push">Push ➖</option>
          </select>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px;">
        <div>
          <label style="display: block; margin-bottom: 4px; font-weight: 600;">Odd</label>
          <input type="number" name="odds" step="0.01" min="1" placeholder="2.00" style="width: 100%; padding: 8px; border: 1px solid #e2e8f0; border-radius: 4px;">
        </div>
        <div>
          <label style="display: block; margin-bottom: 4px; font-weight: 600;">Stake (R$)</label>
          <input type="number" name="stake" step="0.01" min="0" placeholder="100.00" style="width: 100%; padding: 8px; border: 1px solid #e2e8f0; border-radius: 4px;">
        </div>
        <div>
          <label style="display: block; margin-bottom: 4px; font-weight: 600;">Lucro/Prejuízo (R$)</label>
          <input type="number" name="profit" step="0.01" placeholder="100.00" style="width: 100%; padding: 8px; border: 1px solid #e2e8f0; border-radius: 4px;">
        </div>
      </div>

      <div>
        <label style="display: block; margin-bottom: 4px; font-weight: 600;">Notas</label>
        <textarea name="notes" placeholder="Observações sobre o jogo..." style="width: 100%; padding: 8px; border: 1px solid #e2e8f0; border-radius: 4px; resize: vertical;" rows="3"></textarea>
      </div>

      <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 20px;">
        <button type="button" onclick="closeModal()" style="padding: 10px 20px; background: #e2e8f0; border: none; border-radius: 6px; cursor: pointer;">Cancelar</button>
        <button type="submit" style="padding: 10px 20px; background: #38a169; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">Salvar Jogo</button>
      </div>
    </form>
  `;

  showModal("Adicionar Jogo", modalContent);
}

function handleAddMatch(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const matchData = Object.fromEntries(formData.entries());

  if (matchData.homeTeam === matchData.awayTeam) {
    showNotification("Um time não pode jogar contra si mesmo!", "error");
    return;
  }

  try {
    const match = {
      id: Date.now().toString(),
      homeTeam: matchData.homeTeam,
      awayTeam: matchData.awayTeam,
      homeScore: parseInt(matchData.homeScore) || 0,
      awayScore: parseInt(matchData.awayScore) || 0,
      date: matchData.date,
      league: matchData.league || "",
      market: matchData.market || "",
      result: matchData.result || "",
      odds: parseFloat(matchData.odds) || 0,
      stake: parseFloat(matchData.stake) || 0,
      profit: parseFloat(matchData.profit) || 0,
      notes: matchData.notes || "",
      createdAt: new Date().toISOString(),
    };

    userData.matches.push(match);
    saveUserData();

    closeModal();
    showNotification("Jogo adicionado com sucesso!", "success");

    // Recarregar interfaces
    loadMarketChart();
    loadAISuggestions();
    updateQuickStats();
    loadTeamPerformance(); // Atualizar estatísticas dos times
  } catch (error) {
    console.error("Erro ao adicionar jogo:", error);
    showNotification("Erro ao adicionar jogo", "error");
  }
}

// Função showStatsModal (estava faltando)
function showStatsModal() {
  const teams = Object.values(userData.teams);
  const matches = userData.matches;

  if (matches.length === 0) {
    showNotification(
      "Adicione alguns jogos primeiro para ver estatísticas detalhadas.",
      "info"
    );
    return;
  }

  const greenMatches = matches.filter((m) => m.result === "Green");
  const redMatches = matches.filter((m) => m.result === "Red");
  const totalProfit = matches.reduce((sum, m) => sum + (m.profit || 0), 0);

  const modalContent = `
    <h3>📊 Estatísticas Detalhadas</h3>
    
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 16px; margin-bottom: 24px;">
      <div style="background: #f0fff4; padding: 16px; border-radius: 8px; text-align: center; border-left: 4px solid #38a169;">
        <div style="font-size: 24px; font-weight: 600; color: #22543d;">${
          greenMatches.length
        }</div>
        <div style="font-size: 12px; color: #22543d;">Greens</div>
      </div>
      <div style="background: #fff5f5; padding: 16px; border-radius: 8px; text-align: center; border-left: 4px solid #e53e3e;">
        <div style="font-size: 24px; font-weight: 600; color: #c53030;">${
          redMatches.length
        }</div>
        <div style="font-size: 12px; color: #c53030;">Reds</div>
      </div>
      <div style="background: #f7fafc; padding: 16px; border-radius: 8px; text-align: center; border-left: 4px solid #667eea;">
        <div style="font-size: 24px; font-weight: 600; color: #4c51bf;">${(
          (greenMatches.length / matches.length) *
          100
        ).toFixed(1)}%</div>
        <div style="font-size: 12px; color: #4c51bf;">Taxa de Acerto</div>
      </div>
      <div style="background: ${
        totalProfit >= 0 ? "#f0fff4" : "#fff5f5"
      }; padding: 16px; border-radius: 8px; text-align: center; border-left: 4px solid ${
    totalProfit >= 0 ? "#38a169" : "#e53e3e"
  };">
        <div style="font-size: 24px; font-weight: 600; color: ${
          totalProfit >= 0 ? "#22543d" : "#c53030"
        };">R$ ${totalProfit.toFixed(2)}</div>
        <div style="font-size: 12px; color: ${
          totalProfit >= 0 ? "#22543d" : "#c53030"
        };">Lucro Total</div>
      </div>
    </div>

    <div style="background: #edf2f7; padding: 16px; border-radius: 8px;">
      <h4 style="margin: 0 0 8px 0;">Resumo Geral</h4>
      <div style="font-size: 14px; color: #4a5568;">
        <div>Total de jogos: <strong>${matches.length}</strong></div>
        <div>Times cadastrados: <strong>${teams.length}</strong></div>
        <div>Melhor sequência: <strong>${
          analyzeUserPatterns()?.bestStreak || 0
        } greens</strong></div>
      </div>
    </div>
  `;

  showModal("Estatísticas Completas", modalContent);
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

function showValueBetsModal(valueBets) {
  const modalContent = `
    <h3>💰 Apostas de Valor Detectadas</h3>
    <p style="margin-bottom: 20px; color: #4a5568;">
      Encontramos diferenças significativas entre casas de apostas baseadas em dados reais:
    </p>
    ${valueBets
      .map(
        (bet) => `
      <div style="background: #f7fafc; border: 1px solid #e2e8f0; padding: 16px; border-radius: 8px; margin-bottom: 12px;">
        <div style="font-weight: 600; color: #2d3748; margin-bottom: 8px;">
          ${bet.game} - ${bet.outcome}
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div style="font-size: 14px; color: #4a5568;">
            <div>${bet.bookmaker1}: <strong style="color: #3182ce;">${bet.odd1}</strong></div>
            <div>${bet.bookmaker2}: <strong style="color: #3182ce;">${bet.odd2}</strong></div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 12px; color: #718096;">Diferença</div>
            <div style="font-weight: 600; color: #38a169;">${bet.difference}</div>
          </div>
        </div>
        <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #38a169;">
          ⭐ Melhor odd: ${bet.bestOdd}
        </div>
      </div>
    `
      )
      .join("")}
    <div style="background: #fff5f5; border: 1px solid #fed7d7; padding: 12px; border-radius: 6px; margin-top: 16px;">
      <p style="font-size: 12px; color: #c53030; margin: 0;">
        ⚠️ Sempre verifique as odds atuais antes de apostar, pois elas mudam constantemente.
      </p>
    </div>
  `;

  showModal("Apostas de Valor - API Real", modalContent);
}

function showTrendsModal(analysis) {
  const modalContent = `
    <h3>📈 Tendências do Mercado - Tempo Real</h3>
    <p style="color: #4a5568; margin-bottom: 20px;">
      Análise baseada em ${analysis.totalGames} jogos reais da API:
    </p>
    
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px;">
      <div style="background: #f7fafc; padding: 16px; border-radius: 8px;">
        <div style="font-size: 14px; color: #718096;">Odd Média Casa</div>
        <div style="font-size: 24px; font-weight: 600; color: #2d3748;">${
          analysis.avgHomeOdd
        }</div>
      </div>
      <div style="background: #f7fafc; padding: 16px; border-radius: 8px;">
        <div style="font-size: 14px; color: #718096;">Odd Média Fora</div>
        <div style="font-size: 24px; font-weight: 600; color: #2d3748;">${
          analysis.avgAwayOdd
        }</div>
      </div>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px;">
      <div style="background: #f0fff4; padding: 16px; border-radius: 8px; border-left: 4px solid #38a169;">
        <div style="font-size: 14px; color: #22543d;">Favoritos Casa</div>
        <div style="font-size: 20px; font-weight: 600; color: #22543d;">${
          analysis.homeFavorites
        }</div>
      </div>
      <div style="background: #fffaf0; padding: 16px; border-radius: 8px; border-left: 4px solid #d69e2e;">
        <div style="font-size: 14px; color: #744210;">Favoritos Fora</div>
        <div style="font-size: 20px; font-weight: 600; color: #744210;">${
          analysis.awayFavorites
        }</div>
      </div>
    </div>

    <div style="background: #edf2f7; padding: 16px; border-radius: 8px;">
      <div style="font-size: 14px; color: #4a5568; margin-bottom: 8px;">Insights do Mercado:</div>
      <ul style="font-size: 13px; color: #2d3748; margin: 0; padding-left: 20px;">
        <li>Favoritos fortes (< 1.8): <strong>${
          analysis.strongFavorites
        }</strong></li>
        <li>Vantagem casa: <strong>${
          analysis.homeFavorites > analysis.awayFavorites
            ? "SIM"
            : "EQUILIBRADO"
        }</strong></li>
      </ul>
    </div>
  `;

  showModal("Tendências de Mercado", modalContent);
}

// ==================== EVENT HANDLERS ====================

async function refreshTeamAnalysis() {
  const button = document.querySelector(".refresh-btn");
  button.innerHTML = '<div class="loading"></div>';

  try {
    loadTeamPerformance();
    updateQuickStats();
    showNotification("Dados dos times atualizados!", "success");
  } catch (error) {
    console.error("Erro ao atualizar teams:", error);
    showNotification("Erro ao atualizar dados", "error");
  }

  button.innerHTML = "🔄";
}

function filterMarkets(filter) {
  // Filtrar com base nos dados do usuário
  loadMarketChart();
  showNotification(`Filtro aplicado: ${filter}`, "info");
}

function toggleLeagueView(view) {
  document.querySelectorAll(".toggle-btn").forEach((btn) => {
    btn.classList.remove("active");
  });
  event.target.classList.add("active");

  // Para dados do usuário, não há necessidade de filtrar por view
  // Mantém compatibilidade com a interface
}

function showTimeInfo() {
  showModal(
    "Análise de Horários",
    `
    <p>Esta seção mostrará análises baseadas nos seus dados quando você tiver jogos cadastrados.</p>
    <p>Para começar a usar esta funcionalidade:</p>
    <ul style="padding-left: 20px;">
      <li>Cadastre seus times</li>
      <li>Adicione histórico de jogos</li>
      <li>As análises serão baseadas nos seus dados reais</li>
    </ul>
  `
  );
}

// ==================== UTILITY FUNCTIONS ====================

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function animateElements() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("fade-in");
      }
    });
  });

  document.querySelectorAll(".analysis-card").forEach((card) => {
    observer.observe(card);
  });
}

function showLoadingState(message) {
  const existingLoader = document.querySelector(".api-loader");
  if (!existingLoader) {
    const loader = document.createElement("div");
    loader.className = "api-loader";
    loader.innerHTML = `
      <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                  background: white; padding: 24px; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.2);
                  display: flex; align-items: center; gap: 16px; z-index: 9999;">
        <div class="loading"></div>
        <span>${message}</span>
      </div>
    `;
    document.body.appendChild(loader);
  }
}

function hideLoadingState() {
  const loader = document.querySelector(".api-loader");
  if (loader) {
    loader.remove();
  }
}

function showNotification(message, type = "success") {
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <span>${message}</span>
    <button onclick="this.parentElement.remove()">×</button>
  `;

  const bgColor =
    type === "success"
      ? "#38a169"
      : type === "warning"
      ? "#d69e2e"
      : type === "info"
      ? "#3182ce"
      : "#e53e3e";

  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${bgColor};
    color: white;
    padding: 16px 20px;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    z-index: 1000;
    display: flex;
    align-items: center;
    gap: 12px;
    animation: slideIn 0.3s ease;
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove();
    }
  }, 5000);
}

// Inicialização
document.addEventListener("DOMContentLoaded", function () {
  try {
    updateQuickStats();
    loadTeamPerformance();
    loadMarketChart();
    loadAISuggestions();

    setTimeout(() => {
      addAdvancedControls();
    }, 1000);

    showNotification(
      "Sistema personalizado carregado! Adicione seus times e jogos.",
      "success"
    );
  } catch (error) {
    console.error("Erro na inicialização:", error);
    showNotification("Erro ao carregar sistema", "error");
  }
});

// ==================== ADVANCED CONTROLS ====================

function addAdvancedControls() {
  const header = document.querySelector(".page-header");
  if (header && !document.querySelector(".advanced-controls")) {
    const controls = document.createElement("div");
    controls.className = "advanced-controls";
    controls.innerHTML = `
      <div style="display: flex; gap: 12px; margin-top: 16px; flex-wrap: wrap;">
        <button onclick="showAddTeamModal()" style="padding: 10px 16px; background: #38a169; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500;">
          📝 Adicionar Time
        </button>
        <button onclick="showAddMatchModal()" style="padding: 10px 16px; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500;">
          ⚽ Adicionar Jogo
        </button>
        <button onclick="showStatsModal()" style="padding: 10px 16px; background: #805ad5; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500;">
          📊 Estatísticas
        </button>
      </div>
    `;
    header.appendChild(controls);
  }
}

// ==================== INITIALIZATION ====================

document.addEventListener("DOMContentLoaded", function () {
  try {
    updateQuickStats();
    loadTeamPerformance();
    loadMarketChart();
    loadPatterns();
    loadAISuggestions();
    animateElements();

    setTimeout(() => {
      addAdvancedControls();
    }, 1000);

    showNotification(
      "Sistema personalizado carregado! Adicione seus times e jogos.",
      "success"
    );
  } catch (error) {
    console.error("Erro na inicialização:", error);
    showNotification("Erro ao carregar sistema", "error");
  }
});

// ==================== DATA EXPORT/IMPORT ====================

function exportUserData() {
  const dataToExport = {
    teams: userData.teams,
    matches: userData.matches,
    exportDate: new Date().toISOString(),
    version: "1.0",
  };

  const dataStr = JSON.stringify(dataToExport, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(dataBlob);
  link.download = `bet-tracker-backup-${
    new Date().toISOString().split("T")[0]
  }.json`;
  link.click();

  showNotification("Dados exportados com sucesso!", "success");
}

function importUserData() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";

  input.onchange = function (event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const importedData = JSON.parse(e.target.result);

        if (importedData.teams && importedData.matches) {
          // Backup dados atuais
          const backup = {
            teams: userData.teams,
            matches: userData.matches,
          };
          localStorage.setItem("userDataBackup", JSON.stringify(backup));

          // Importar novos dados
          userData.teams = importedData.teams;
          userData.matches = importedData.matches;
          saveUserData();

          // Recarregar interface
          updateQuickStats();
          loadTeamPerformance();
          loadMarketChart();
          loadPatterns();
          loadAISuggestions();

          showNotification(
            `Dados importados! ${
              Object.keys(importedData.teams).length
            } times e ${importedData.matches.length} jogos.`,
            "success"
          );
        } else {
          throw new Error("Formato de arquivo inválido");
        }
      } catch (error) {
        console.error("Erro ao importar:", error);
        showNotification(
          "Erro ao importar dados. Verifique o formato do arquivo.",
          "error"
        );
      }
    };
    reader.readAsText(file);
  };

  input.click();
}

// ==================== STATISTICS DASHBOARD ====================

function showStatsModal() {
  const teams = Object.values(userData.teams);
  const matches = userData.matches;

  if (matches.length === 0) {
    showNotification(
      "Adicione alguns jogos primeiro para ver estatísticas detalhadas.",
      "info"
    );
    return;
  }

  // Calcular estatísticas
  const greenMatches = matches.filter((m) => m.result === "Green");
  const redMatches = matches.filter((m) => m.result === "Red");
  const totalProfit = matches.reduce((sum, m) => sum + (m.profit || 0), 0);
  const avgOdd =
    matches.filter((m) => m.odds > 0).reduce((sum, m) => sum + m.odds, 0) /
      matches.filter((m) => m.odds > 0).length || 0;

  // Análise por mercado
  const marketStats = {};
  matches.forEach((match) => {
    if (match.market) {
      if (!marketStats[match.market]) {
        marketStats[match.market] = { total: 0, greens: 0, profit: 0 };
      }
      marketStats[match.market].total++;
      if (match.result === "Green") marketStats[match.market].greens++;
      marketStats[match.market].profit += match.profit || 0;
    }
  });

  // Análise por mês
  const monthlyStats = {};
  matches.forEach((match) => {
    const month = new Date(match.date).toLocaleDateString("pt-BR", {
      year: "numeric",
      month: "long",
    });
    if (!monthlyStats[month]) {
      monthlyStats[month] = { total: 0, greens: 0, profit: 0 };
    }
    monthlyStats[month].total++;
    if (match.result === "Green") monthlyStats[month].greens++;
    monthlyStats[month].profit += match.profit || 0;
  });

  const modalContent = `
    <h3>📊 Estatísticas Detalhadas</h3>
    
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 16px; margin-bottom: 24px;">
      <div style="background: #f0fff4; padding: 16px; border-radius: 8px; text-align: center; border-left: 4px solid #38a169;">
        <div style="font-size: 24px; font-weight: 600; color: #22543d;">${
          greenMatches.length
        }</div>
        <div style="font-size: 12px; color: #22543d;">Greens</div>
      </div>
      <div style="background: #fff5f5; padding: 16px; border-radius: 8px; text-align: center; border-left: 4px solid #e53e3e;">
        <div style="font-size: 24px; font-weight: 600; color: #c53030;">${
          redMatches.length
        }</div>
        <div style="font-size: 12px; color: #c53030;">Reds</div>
      </div>
      <div style="background: #f7fafc; padding: 16px; border-radius: 8px; text-align: center; border-left: 4px solid #667eea;">
        <div style="font-size: 24px; font-weight: 600; color: #4c51bf;">${(
          (greenMatches.length / matches.length) *
          100
        ).toFixed(1)}%</div>
        <div style="font-size: 12px; color: #4c51bf;">Taxa de Acerto</div>
      </div>
      <div style="background: ${
        totalProfit >= 0 ? "#f0fff4" : "#fff5f5"
      }; padding: 16px; border-radius: 8px; text-align: center; border-left: 4px solid ${
    totalProfit >= 0 ? "#38a169" : "#e53e3e"
  };">
        <div style="font-size: 24px; font-weight: 600; color: ${
          totalProfit >= 0 ? "#22543d" : "#c53030"
        };">R$ ${totalProfit.toFixed(2)}</div>
        <div style="font-size: 12px; color: ${
          totalProfit >= 0 ? "#22543d" : "#c53030"
        };">Lucro Total</div>
      </div>
    </div>

    ${
      Object.keys(marketStats).length > 0
        ? `
      <div style="margin-bottom: 24px;">
        <h4 style="margin: 0 0 12px 0;">Performance por Mercado</h4>
        ${Object.entries(marketStats)
          .map(
            ([market, stats]) => `
          <div style="background: #f8fafc; padding: 12px; margin-bottom: 8px; border-radius: 6px; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-weight: 600;">${market}</div>
              <div style="font-size: 12px; color: #718096;">${stats.greens}/${
              stats.total
            } (${((stats.greens / stats.total) * 100).toFixed(1)}%)</div>
            </div>
            <div style="text-align: right;">
              <div style="font-weight: 600; color: ${
                stats.profit >= 0 ? "#38a169" : "#e53e3e"
              };">R$ ${stats.profit.toFixed(2)}</div>
            </div>
          </div>
        `
          )
          .join("")}
      </div>
    `
        : ""
    }

    ${
      Object.keys(monthlyStats).length > 0
        ? `
      <div style="margin-bottom: 24px;">
        <h4 style="margin: 0 0 12px 0;">Performance Mensal</h4>
        <div style="max-height: 200px; overflow-y: auto;">
          ${Object.entries(monthlyStats)
            .reverse()
            .map(
              ([month, stats]) => `
            <div style="background: #f8fafc; padding: 12px; margin-bottom: 8px; border-radius: 6px; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <div style="font-weight: 600;">${month}</div>
                <div style="font-size: 12px; color: #718096;">${stats.greens}/${
                stats.total
              } (${((stats.greens / stats.total) * 100).toFixed(1)}%)</div>
              </div>
              <div style="text-align: right;">
                <div style="font-weight: 600; color: ${
                  stats.profit >= 0 ? "#38a169" : "#e53e3e"
                };">R$ ${stats.profit.toFixed(2)}</div>
              </div>
            </div>
          `
            )
            .join("")}
        </div>
      </div>
    `
        : ""
    }

    <div style="background: #edf2f7; padding: 16px; border-radius: 8px;">
      <h4 style="margin: 0 0 8px 0;">Resumo Geral</h4>
      <div style="font-size: 14px; color: #4a5568;">
        <div>Total de jogos: <strong>${matches.length}</strong></div>
        <div>Odd média: <strong>${avgOdd.toFixed(2)}</strong></div>
        <div>Times cadastrados: <strong>${teams.length}</strong></div>
        <div>ROI: <strong>${
          totalProfit > 0
            ? (
                (totalProfit /
                  matches.reduce((sum, m) => sum + (m.stake || 0), 0)) *
                100
              ).toFixed(2) + "%"
            : "N/A"
        }</strong></div>
      </div>
    </div>
  `;

  showModal("Estatísticas Completas", modalContent);
}

// ==================== ENHANCED CONTROLS ====================

function updateAdvancedControls() {
  const existingControls = document.querySelector(".advanced-controls");
  if (existingControls) {
    existingControls.innerHTML = `
      <div style="display: flex; gap: 8px; margin-top: 16px; flex-wrap: wrap; align-items: center;">
        <button onclick="showAddTeamModal()" style="padding: 8px 12px; background: #38a169; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 500;">
          + Time
        </button>
        <button onclick="showStatsModal()" style="padding: 8px 12px; background: #805ad5; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 500;">
          Estatísticas
        </button>
        <div style="border-left: 1px solid #e2e8f0; height: 24px; margin: 0 4px;"></div>
        <button onclick="findValueBets()" style="padding: 8px 12px; background: #d69e2e; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 500;">
          Value Bets
        </button>
        <button onclick="analyzeLiveTrends()" style="padding: 8px 12px; background: #ed8936; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 500;">
          Tendências
        </button>
      </div>
    `;
  }
}

// Atualizar controles depois de carregar
setTimeout(() => {
  updateAdvancedControls();
}, 2000);

// ==================== ADDITIONAL STYLES ====================

if (!document.getElementById("notification-styles")) {
  const style = document.createElement("style");
  style.id = "notification-styles";
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    
    .notification button {
      background: transparent;
      border: none;
      color: white;
      font-size: 18px;
      cursor: pointer;
      padding: 0;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .notification button:hover {
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
    }

    .loading {
      width: 20px;
      height: 20px;
      border: 2px solid #f3f3f3;
      border-top: 2px solid #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .team-item {
      cursor: pointer;
      transition: background-color 0.2s ease;
    }

    .team-item:hover {
      background-color: #f8fafc;
    }

    .modal {
      backdrop-filter: blur(4px);
    }

    .modal-content {
      max-height: 90vh;
      overflow-y: auto;
    }

    input[type="range"] {
      -webkit-appearance: none;
      appearance: none;
      background: transparent;
      cursor: pointer;
    }

    input[type="range"]::-webkit-slider-track {
      background: #e2e8f0;
      height: 6px;
      border-radius: 3px;
    }

    input[type="range"]::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      background: #667eea;
      height: 20px;
      width: 20px;
      border-radius: 50%;
      cursor: pointer;
    }

    input[type="range"]::-moz-range-track {
      background: #e2e8f0;
      height: 6px;
      border-radius: 3px;
      border: none;
    }

    input[type="range"]::-moz-range-thumb {
      background: #667eea;
      height: 20px;
      width: 20px;
      border-radius: 50%;
      border: none;
      cursor: pointer;
    }
  `;
  document.head.appendChild(style);
}

// ==================== INICIALIZAÇÃO FINAL ====================

// Inicialização automática com migração
document.addEventListener("DOMContentLoaded", function () {
  try {
    console.log("Iniciando sistema...");

    // 1. Executar migração automática dos dados existentes
    const hasOldData = Object.keys(userData.teams).length > 0;
    if (hasOldData) {
      console.log("Dados existentes detectados, executando migração...");
    }

    // 2. Carregar todas as interfaces
    updateQuickStats();
    loadTeamPerformance();
    loadMarketChart();
    loadAISuggestions();

    // 3. Adicionar controles avançados após um pequeno delay
    setTimeout(() => {
      addAdvancedControls();
    }, 1000);

    // 4. Mostrar mensagem de boas-vindas
  } catch (error) {
    console.error("Erro na inicialização:", error);
    showNotification("Erro ao carregar sistema", "error");
  }
});

// Função para verificar integridade dos dados
function checkDataIntegrity() {
  const issues = [];

  // Verificar times
  Object.keys(userData.teams).forEach((teamId) => {
    const team = userData.teams[teamId];

    if (!team.name) {
      issues.push(`Time ${teamId} sem nome`);
    }

    if (!Array.isArray(team.characteristics)) {
      issues.push(`Time ${team.name || teamId} com características inválidas`);
    }

    if (typeof team.notes !== "string") {
      issues.push(`Time ${team.name || teamId} com notas inválidas`);
    }
  });

  // Verificar jogos
  userData.matches.forEach((match, index) => {
    if (!match.homeTeam || !match.awayTeam) {
      issues.push(`Jogo ${index} com times inválidos`);
    }

    if (
      typeof match.homeScore !== "number" ||
      typeof match.awayScore !== "number"
    ) {
      issues.push(`Jogo ${index} com placar inválido`);
    }

    if (!match.date) {
      issues.push(`Jogo ${index} sem data`);
    }
  });

  if (issues.length > 0) {
    console.warn("Problemas encontrados nos dados:", issues);
    return false;
  }

  console.log("Integridade dos dados OK");
  return true;
}

// Auto-backup dos dados (executar periodicamente)
function autoBackup() {
  try {
    const backupData = {
      teams: userData.teams,
      matches: userData.matches,
      settings: userData.settings,
      backupDate: new Date().toISOString(),
      version: "2.0",
    };

    localStorage.setItem("userDataBackup", JSON.stringify(backupData));
    console.log("Backup automático realizado");
  } catch (error) {
    console.error("Erro no backup automático:", error);
  }
}

// Executar backup a cada 5 minutos
setInterval(autoBackup, 5 * 60 * 1000);

// Função para restaurar backup
function restoreFromBackup() {
  try {
    const backup = localStorage.getItem("userDataBackup");
    if (!backup) {
      showNotification("Nenhum backup encontrado", "warning");
      return;
    }

    const backupData = JSON.parse(backup);

    if (
      confirm(
        `Restaurar backup de ${new Date(backupData.backupDate).toLocaleString(
          "pt-BR"
        )}?`
      )
    ) {
      userData.teams = backupData.teams || {};
      userData.matches = backupData.matches || [];
      userData.settings = backupData.settings || {};

      saveUserData();

      // Recarregar todas as interfaces
      updateQuickStats();
      loadTeamPerformance();
      loadMarketChart();
      loadAISuggestions();

      showNotification("Backup restaurado com sucesso!", "success");
    }
  } catch (error) {
    console.error("Erro ao restaurar backup:", error);
    showNotification("Erro ao restaurar backup", "error");
  }
}

// Função para limpar dados corrompidos
function cleanCorruptedData() {
  try {
    let cleaned = 0;

    // Limpar times com dados inválidos
    Object.keys(userData.teams).forEach((teamId) => {
      const team = userData.teams[teamId];
      let modified = false;

      // Corrigir características
      if (!Array.isArray(team.characteristics)) {
        team.characteristics = [];
        modified = true;
      }

      // Corrigir notas
      if (typeof team.notes !== "string") {
        team.notes = "";
        modified = true;
      }

      // Corrigir liga
      if (!team.league || typeof team.league !== "string") {
        team.league = "Não definida";
        modified = true;
      }

      if (modified) {
        cleaned++;
      }
    });

    // Limpar jogos inválidos
    const validMatches = userData.matches.filter((match) => {
      return (
        match.homeTeam &&
        match.awayTeam &&
        typeof match.homeScore === "number" &&
        typeof match.awayScore === "number" &&
        match.date
      );
    });

    if (validMatches.length !== userData.matches.length) {
      cleaned += userData.matches.length - validMatches.length;
      userData.matches = validMatches;
    }

    if (cleaned > 0) {
      saveUserData();
      showNotification(`${cleaned} dados corrompidos foram limpos`, "info");
    } else {
      showNotification("Nenhum dado corrompido encontrado", "success");
    }
  } catch (error) {
    console.error("Erro ao limpar dados:", error);
    showNotification("Erro ao limpar dados", "error");
  }
}

// Adicionar função de limpeza aos controles de debug
function addAdvancedDebugControls() {
  const debugControls = document.querySelector(".debug-controls");
  if (debugControls) {
    const advancedDiv = document.createElement("div");
    advancedDiv.innerHTML = `
      <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #fed7d7;">
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <button onclick="checkDataIntegrity()" 
                  style="padding: 6px 12px; background: #805ad5; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">
            Verificar Integridade
          </button>
          <button onclick="cleanCorruptedData()" 
                  style="padding: 6px 12px; background: #d69e2e; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">
            Limpar Corrompidos
          </button>
          <button onclick="restoreFromBackup()" 
                  style="padding: 6px 12px; background: #38a169; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">
            Restaurar Backup
          </button>
        </div>
      </div>
    `;
    debugControls.appendChild(advancedDiv);
  }
}

// Adicionar controles avançados após 2 segundos
setTimeout(() => {
  addAdvancedDebugControls();
}, 2000);
