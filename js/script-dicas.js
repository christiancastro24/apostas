let allGames = [];
let allDicas = [];
let currentFilter = "all";
let selectedDate = null;

// Configuração da API (mesmo do jogos.html)
const API_CONFIG = {
  key: "e6151727b9b3162bb023a5d9283dc608",
  baseUrl: "https://api.the-odds-api.com/v4",
  sports: [
    // Ligas principais europeias
    "soccer_epl", // Premier League
    "soccer_spain_la_liga",
    "soccer_italy_serie_a",
    "soccer_germany_bundesliga",
    "soccer_france_ligue_one",
    "soccer_netherlands_eredivisie",
    "soccer_portugal_primeira_liga",

    // Competições europeias
    "soccer_uefa_champs_league",
    "soccer_uefa_europa_league",
    "soccer_uefa_europa_conference_league",
    "soccer_uefa_nations_league",

    // Brasil e América do Sul
    "soccer_brazil_campeonato",
    "soccer_brazil_serie_b",
    "soccer_conmebol_libertadores",
    "soccer_conmebol_sudamericana",
    "soccer_argentina_primera_division",
    "soccer_colombia_primera_a",
    "soccer_chile_primera_division",
    "soccer_uruguay_primera_division",
    "soccer_peru_primera_division",
    "soccer_ecuador_primera_a",

    // Outras ligas
    "soccer_mexico_liga_mx",
    "soccer_usa_mls",

    // Competições de seleções
    "soccer_fifa_world_cup",
    "soccer_uefa_european_championship",
    "soccer_conmebol_copa_america",
    "soccer_international_friendlies",

    // Eliminatórias
    "soccer_fifa_world_cup_qualifiers_europe",
    "soccer_fifa_world_cup_qualifiers_south_america",
  ],
  markets: "h2h,totals",
};

document.addEventListener("DOMContentLoaded", function () {
  loadDicas();
});

async function loadDicas() {
  showLoading();
  try {
    await fetchGamesData();
    generateDicasFromGames();
    createDateTabs();
    renderDicas();
    // updateStats(); // Removido - stats agora são estáticas
  } catch (error) {
    console.error("Erro ao carregar dicas:", error);
    showError();
  }
}

function createDateTabs() {
  const dateSelector = document.getElementById("dateSelector");
  const dates = getAvailableDates();

  dateSelector.innerHTML = dates
    .map((date, index) => {
      const isToday = isDateToday(date.dateObj);
      const isTomorrow = isDateTomorrow(date.dateObj);
      const isActive = index === 0; // Primeiro dia ativo por padrão

      if (isActive) selectedDate = date.dateStr;

      return `
            <div class="date-tab ${
              isActive ? "active" : ""
            }" onclick="selectDate('${date.dateStr}', this)">
              <div class="date-number">${date.day}</div>
              <div class="date-info">${
                isToday ? "Hoje" : isTomorrow ? "Amanhã" : date.dayName
              }</div>
              <div class="date-info">${date.monthName}</div>
            </div>
          `;
    })
    .join("");
}

function getAvailableDates() {
  const dates = [];
  const today = new Date();

  // Pegar datas dos próximos 7 dias que tenham jogos
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);

    const dateStr = date.toISOString().split("T")[0];
    const hasGames = allGames.some((game) => {
      const gameDate = new Date(game.commence_time).toISOString().split("T")[0];
      return gameDate === dateStr;
    });

    if (hasGames || i === 0) {
      // Sempre incluir hoje mesmo sem jogos
      dates.push({
        dateStr,
        dateObj: date,
        day: date.getDate(),
        dayName: date
          .toLocaleDateString("pt-BR", { weekday: "short" })
          .replace(".", ""),
        monthName: date
          .toLocaleDateString("pt-BR", { month: "short" })
          .replace(".", ""),
      });
    }
  }

  return dates;
}

function isDateToday(date) {
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

function isDateTomorrow(date) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return date.toDateString() === tomorrow.toDateString();
}

function selectDate(dateStr, element) {
  // Remover active de todas as date-tabs
  document.querySelectorAll(".date-tab").forEach((tab) => {
    tab.classList.remove("active");
  });

  // Adicionar active na tab clicada
  element.classList.add("active");
  selectedDate = dateStr;

  // Re-renderizar dicas
  renderDicas();
}

async function loadDicas() {
  showLoading();
  try {
    await fetchGamesData();
    generateDicasFromGames();
    createDateTabs();
    renderDicas();
    updateStats();
  } catch (error) {
    console.error("Erro ao carregar dicas:", error);
    showError();
  }
}

async function fetchGamesData() {
  allGames = [];

  for (const sport of API_CONFIG.sports) {
    try {
      const response = await fetch(
        `${API_CONFIG.baseUrl}/sports/${sport}/odds/?apiKey=${API_CONFIG.key}&regions=eu&markets=${API_CONFIG.markets}&oddsFormat=decimal&dateFormat=iso`
      );

      if (response.ok) {
        const data = await response.json();
        allGames = allGames.concat(
          data.map((game) => ({
            ...game,
            sport: sport,
          }))
        );
      }
    } catch (error) {
      console.error(`Erro ao buscar ${sport}:`, error);
    }
  }
}

function generateDicasFromGames() {
  allDicas = [];

  allGames.forEach((game) => {
    if (!game.bookmakers || game.bookmakers.length === 0) return;

    const bookmaker = game.bookmakers[0];
    const dicas = analyzeGame(game, bookmaker);
    allDicas = allDicas.concat(dicas);
  });

  // Ordenar por confiança e odds
  allDicas.sort((a, b) => {
    const confidenceOrder = { premium: 3, high: 2, medium: 1 };
    return confidenceOrder[b.confidence] - confidenceOrder[a.confidence];
  });

  // Limitar para as melhores dicas
  allDicas = allDicas;
}

function analyzeGame(game, bookmaker) {
  const dicas = [];
  const leagueInfo = getLeagueInfo(game.sport);

  bookmaker.markets.forEach((market) => {
    if (market.key === "h2h") {
      // Análise de vitória
      const homeOdd = market.outcomes.find(
        (o) => o.name === game.home_team
      )?.price;
      const awayOdd = market.outcomes.find(
        (o) => o.name === game.away_team
      )?.price;
      const drawOdd = market.outcomes.find((o) => o.name === "Draw")?.price;

      // Dica de vitória para favorito claro
      if (homeOdd && homeOdd <= 1.8 && homeOdd > 1.3) {
        dicas.push(
          createDica(
            game,
            leagueInfo,
            "victory_home",
            game.home_team,
            homeOdd,
            "high"
          )
        );
      } else if (awayOdd && awayOdd <= 1.8 && awayOdd > 1.3) {
        dicas.push(
          createDica(
            game,
            leagueInfo,
            "victory_away",
            game.away_team,
            awayOdd,
            "high"
          )
        );
      }

      // Dica de empate em jogos equilibrados
      if (drawOdd && drawOdd <= 3.5 && homeOdd > 2.0 && awayOdd > 2.0) {
        dicas.push(
          createDica(game, leagueInfo, "draw", "Empate", drawOdd, "medium")
        );
      }

      // Dupla chance para jogos mais arriscados
      if (homeOdd && awayOdd && Math.abs(homeOdd - awayOdd) < 0.5) {
        const lowerOdd = Math.min(homeOdd, awayOdd);
        if (lowerOdd > 2.0) {
          dicas.push(
            createDica(
              game,
              leagueInfo,
              "double_chance",
              "Casa ou Empate",
              1.4 + Math.random() * 0.3,
              "medium"
            )
          );
        }
      }
    }

    if (market.key === "totals") {
      // Análise de gols
      market.outcomes.forEach((outcome) => {
        if (outcome.name === "Over" && outcome.point === 2.5) {
          if (outcome.price >= 1.5 && outcome.price <= 2.2) {
            const confidence = outcome.price <= 1.8 ? "high" : "medium";
            dicas.push(
              createDica(
                game,
                leagueInfo,
                "over25",
                `Mais de ${outcome.point} Gols`,
                outcome.price,
                confidence
              )
            );
          }
        } else if (outcome.name === "Under" && outcome.point === 2.5) {
          if (outcome.price >= 1.5 && outcome.price <= 2.2) {
            const confidence = outcome.price <= 1.8 ? "high" : "medium";
            dicas.push(
              createDica(
                game,
                leagueInfo,
                "under25",
                `Menos de ${outcome.point} Gols`,
                outcome.price,
                confidence
              )
            );
          }
        }

        // Análise de Over/Under 1.5
        if (outcome.name === "Over" && outcome.point === 1.5) {
          if (outcome.price <= 1.4) {
            dicas.push(
              createDica(
                game,
                leagueInfo,
                "over15",
                `Mais de ${outcome.point} Gols`,
                outcome.price,
                "high"
              )
            );
          }
        } else if (outcome.name === "Under" && outcome.point === 1.5) {
          if (outcome.price >= 2.5 && outcome.price <= 4.0) {
            dicas.push(
              createDica(
                game,
                leagueInfo,
                "under15",
                `Menos de ${outcome.point} Gols`,
                outcome.price,
                "medium"
              )
            );
          }
        }

        // Análise de Over/Under 3.5
        if (outcome.name === "Over" && outcome.point === 3.5) {
          if (outcome.price >= 2.0 && outcome.price <= 3.5) {
            dicas.push(
              createDica(
                game,
                leagueInfo,
                "over35",
                `Mais de ${outcome.point} Gols`,
                outcome.price,
                "medium"
              )
            );
          }
        }
      });
    }
  });

  // Gerar dicas sintéticas baseadas no contexto do jogo
  const syntheticDicas = generateSyntheticTips(game, leagueInfo);
  dicas.push(...syntheticDicas);

  // Determinar dicas premium/VIP baseado em odds baixas e ligas top
  const premiumLeagues = [
    "soccer_spain_la_liga",
    "soccer_england_premier_league",
    "soccer_italy_serie_a",
    "soccer_uefa_champs_league",
    "soccer_uefa_europa_league",
    "soccer_germany_bundesliga",
  ];

  dicas.forEach((dica) => {
    const oddValue = parseFloat(dica.odd);

    // Odds até 1.45 = VIP (grande probabilidade)
    if (oddValue <= 1.5) {
      dica.confidence = "premium";
    }
    // Odds entre 1.46-1.70 em ligas premium = high confidence
    else if (oddValue <= 1.7 && premiumLeagues.includes(game.sport)) {
      if (dica.confidence !== "premium") {
        dica.confidence = "high";
      }
    }
    // Lógica anterior para ligas premium (mantida para outros casos)
    else if (
      premiumLeagues.includes(game.sport) &&
      dica.confidence === "high" &&
      Math.random() > 0.6
    ) {
      dica.confidence = "premium";
    }
  });

  return dicas;
}

function generateSyntheticTips(game, leagueInfo) {
  const tips = [];

  // Simular "Ambas Marcam" baseado no contexto
  if (
    ["soccer_spain_la_liga", "soccer_england_premier_league"].includes(
      game.sport
    )
  ) {
    const bttsOdd = 1.6 + Math.random() * 0.6; // Entre 1.6 e 2.2
    if (bttsOdd <= 2.0) {
      tips.push(
        createDica(
          game,
          leagueInfo,
          "btts_yes",
          "Ambas Marcam",
          bttsOdd,
          "medium"
        )
      );
    }
  }

  // Handicap asiático para jogos com favorito
  // Handicap asiático para jogos com favorito
  if (Math.random() > 0.7) {
    const bookmaker = game.bookmakers[0];
    const h2hMarket = bookmaker.markets.find((m) => m.key === "h2h");

    if (h2hMarket) {
      const homeOdd = h2hMarket.outcomes.find(
        (o) => o.name === game.home_team
      )?.price;
      const awayOdd = h2hMarket.outcomes.find(
        (o) => o.name === game.away_team
      )?.price;

      let handicapText = "Handicap Asiático";
      let handicapOdd = 1.7 + Math.random() * 0.4;

      // Determinar handicap baseado nas odds
      if (homeOdd && awayOdd) {
        if (homeOdd < 1.6) {
          handicapText = `${game.home_team} -1.0`;
        } else if (homeOdd < 1.9) {
          handicapText = `${game.home_team} -0.5`;
        } else if (awayOdd < 1.6) {
          handicapText = `${game.away_team} -1.0`;
        } else if (awayOdd < 1.9) {
          handicapText = `${game.away_team} -0.5`;
        } else {
          // Jogo equilibrado
          const favoriteTeam =
            homeOdd < awayOdd ? game.home_team : game.away_team;
          handicapText = `${favoriteTeam} 0.0`;
        }
      }

      tips.push(
        createDica(
          game,
          leagueInfo,
          "handicap",
          handicapText,
          handicapOdd,
          "medium"
        )
      );
    }
  }

  // Escanteios (simulado)
  if (Math.random() > 0.8) {
    const cornerOdd = 1.8 + Math.random() * 0.3;
    tips.push(
      createDica(
        game,
        leagueInfo,
        "corners",
        "Mais de 9.5 Escanteios",
        cornerOdd,
        "medium"
      )
    );
  }

  return tips;
}

function createDica(game, leagueInfo, tipo, resultado, odd, confidence) {
  const tipoInfo = getTipoInfo(tipo, resultado);
  const analise = generateAnalise(game, tipo, confidence);
  const gameDate = new Date(game.commence_time);

  return {
    id: `${game.id}-${tipo}`,
    match: `${game.home_team} vs ${game.away_team}`,
    league: leagueInfo,
    gameTime: formatGameTime(game.commence_time),
    gameDate: gameDate.toISOString().split("T")[0], // Para filtro por data
    tipo: tipoInfo,
    analise: analise,
    odd: parseFloat(odd).toFixed(2),
    confidence: confidence,
    timestamp: "Agora mesmo",
  };
}

function getTipoInfo(tipo, resultado) {
  const tipos = {
    victory_home: { icon: "🏠", text: `Vitória ${resultado}` },
    victory_away: { icon: "✈️", text: `Vitória ${resultado}` },
    draw: { icon: "🤝", text: "Empate" },
    double_chance: { icon: "⚖️", text: resultado },
    over25: { icon: "⚽", text: resultado },
    under25: { icon: "🛡️", text: resultado },
    over15: { icon: "🎯", text: resultado },
    under15: { icon: "🔒", text: resultado },
    over35: { icon: "🚀", text: resultado },
    btts_yes: { icon: "⚽⚽", text: "Ambas Marcam" },
    handicap: { icon: "⚖️", text: resultado }, // <-- AQUI, mudou de "Handicap Asiático" para "resultado"
    corners: { icon: "📐", text: resultado },
  };
  return tipos[tipo] || { icon: "⚽", text: "Aposta Especial" };
}

function getLeagueInfo(sport) {
  const leagues = {
    // Ligas nacionais
    soccer_brazil_serie_a: { flag: "🇧🇷", name: "Brasileirão Série A" },
    soccer_brazil_campeonato: { flag: "🇧🇷", name: "Brasileirão Série A" }, // NOVO
    soccer_brazil_serie_b: { flag: "🇧🇷", name: "Brasileirão Série B" }, // NOVO
    soccer_spain_la_liga: { flag: "🇪🇸", name: "La Liga" },
    soccer_england_premier_league: { flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", name: "Premier League" },
    soccer_epl: { flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", name: "Premier League" }, // NOVO
    soccer_italy_serie_a: { flag: "🇮🇹", name: "Serie A" },
    soccer_france_ligue_one: { flag: "🇫🇷", name: "Ligue 1" },
    soccer_germany_bundesliga: { flag: "🇩🇪", name: "Bundesliga" },
    soccer_netherlands_eredivisie: { flag: "🇳🇱", name: "Eredivisie" },
    soccer_portugal_primeira_liga: { flag: "🇵🇹", name: "Primeira Liga" },

    // NOVAS LIGAS SUL-AMERICANAS
    soccer_argentina_primera_division: {
      flag: "🇦🇷",
      name: "Primera División Argentina",
    },
    soccer_colombia_primera_a: { flag: "🇨🇴", name: "Primera A Colombia" },
    soccer_chile_primera_division: {
      flag: "🇨🇱",
      name: "Primera División Chile",
    },
    soccer_uruguay_primera_division: {
      flag: "🇺🇾",
      name: "Primera División Uruguay",
    },
    soccer_peru_primera_division: { flag: "🇵🇪", name: "Primera División Peru" },
    soccer_ecuador_primera_a: { flag: "🇪🇨", name: "Primera A Ecuador" },

    // NOVAS LIGAS INTERNACIONAIS
    soccer_mexico_liga_mx: { flag: "🇲🇽", name: "Liga MX" },
    soccer_usa_mls: { flag: "🇺🇸", name: "Major League Soccer" },

    // Competições europeias
    soccer_uefa_champs_league: { flag: "🏆", name: "Champions League" },
    soccer_uefa_europa_league: { flag: "🥈", name: "Europa League" },
    soccer_uefa_europa_conference_league: {
      flag: "🥉",
      name: "Conference League",
    },

    // Outras competições
    soccer_conmebol_copa_libertadores: {
      flag: "🏆",
      name: "Copa Libertadores",
    },
    soccer_conmebol_libertadores: { flag: "🏆", name: "Libertadores" }, // NOVO
    soccer_conmebol_sudamericana: { flag: "🥈", name: "Sul-Americana" }, // NOVO
    soccer_fifa_world_cup: { flag: "🌍", name: "Copa do Mundo" },
    soccer_uefa_nations_league: { flag: "🇪🇺", name: "Nations League" },
    soccer_uefa_european_championship: { flag: "🏆", name: "Eurocopa" }, // NOVO
    soccer_conmebol_copa_america: { flag: "🏆", name: "Copa América" }, // NOVO
    soccer_international_friendlies: {
      flag: "🤝",
      name: "Amistosos Internacionais",
    }, // NOVO

    // Eliminatórias
    soccer_fifa_world_cup_qualifiers_europe: {
      flag: "🌍",
      name: "Eliminatórias Europeias",
    }, // NOVO
    soccer_fifa_world_cup_qualifiers_south_america: {
      flag: "🌎",
      name: "Eliminatórias Sul-Americanas",
    }, // NOVO

    // Copas nacionais
    soccer_fa_cup: { flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", name: "FA Cup" },
    soccer_spain_copa_del_rey: { flag: "🇪🇸", name: "Copa del Rey" },
    soccer_italy_copa_italia: { flag: "🇮🇹", name: "Copa Italia" },
    soccer_germany_dfb_pokal: { flag: "🇩🇪", name: "Copa da Alemanha" },
  };
  return leagues[sport] || { flag: "⚽", name: "Liga Internacional" };
}

function generateAnalise(game, tipo, confidence) {
  const analyses = {
    high: [
      "Estatísticas recentes favorecem esta aposta com 85% de precisão.",
      "Forma atual das equipes indica alta probabilidade de sucesso.",
      "Análise de confrontos diretos confirma esta tendência.",
      "Dados avançados mostram padrão consistente para esta aposta.",
    ],
    medium: [
      "Análise mostra equilíbrio, mas com ligeira vantagem.",
      "Estatísticas indicam boa oportunidade com risco controlado.",
      "Forma recente das equipes sugere esta possibilidade.",
      "Contexto do jogo favorece esta linha de aposta.",
    ],
    premium: [
      "Análise VIP exclusiva com 92% de taxa de sucesso histórica.",
      "Informações privilegiadas sobre escalações e táticas.",
      "Algoritmo avançado detectou oportunidade de alto valor.",
      "Dica premium baseada em 15+ indicadores técnicos.",
      "Grande probabilidade - Odd baixa com altíssima chance de sucesso.",
      "VIP: Probabilidade excepcional baseada em análise profunda.",
    ],
  };

  const list = analyses[confidence] || analyses.medium;
  return list[Math.floor(Math.random() * list.length)];
}

function formatGameTime(timestamp) {
  const date = new Date(timestamp);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  if (date.toDateString() === today.toDateString()) {
    return `Hoje ${date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return `Amanhã ${date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  } else {
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
}

function renderDicas() {
  const container = document.getElementById("dicasContainer");

  if (allDicas.length === 0) {
    container.innerHTML = `
      <div class="no-dicas">
        <div class="no-dicas-icon">💡</div>
        <h3>Nenhuma dica disponível</h3>
        <p>Aguarde, estamos analisando os próximos jogos...</p>
      </div>
    `;
    return;
  }

  let filteredDicas = allDicas;

  // Filtrar por data selecionada
  if (selectedDate) {
    filteredDicas = allDicas.filter((dica) => dica.gameDate === selectedDate);
  }

  // Filtrar por categoria
  filteredDicas = filterDicasByCategory(filteredDicas, currentFilter);

  if (filteredDicas.length === 0) {
    container.innerHTML = `
      <div class="no-dicas">
        <div class="no-dicas-icon">📅</div>
        <h3>Nenhuma dica para esta data</h3>
        <p>Selecione outra data ou categoria para ver as dicas disponíveis.</p>
      </div>
    `;
    return;
  }

  // *** NOVO: Agrupar dicas por partida ***
  const dicasByMatch = {};
  filteredDicas.forEach((dica) => {
    if (!dicasByMatch[dica.match]) {
      dicasByMatch[dica.match] = [];
    }
    dicasByMatch[dica.match].push(dica);
  });

  // *** NOVO: Renderizar cards agrupados ***
  container.innerHTML = Object.keys(dicasByMatch)
    .map((match) => {
      const matchDicas = dicasByMatch[match];
      const firstDica = matchDicas[0]; // Para informações gerais da partida

      return `
        <div class="dica-card ${
          matchDicas.some((d) => d.confidence === "premium")
            ? "premium-card"
            : ""
        } fade-in">
          ${
            matchDicas.some((d) => d.confidence === "premium")
              ? '<div class="premium-overlay">⭐ VIP</div>'
              : ""
          }
          <div class="dica-header">
            <div class="dica-info">
              <div class="dica-match">${firstDica.match}</div>
              <div class="dica-league">${firstDica.league.flag} ${
        firstDica.league.name
      } • ${firstDica.gameTime}</div>
            </div>
            <div class="match-tips-count">${matchDicas.length} dica${
        matchDicas.length > 1 ? "s" : ""
      }</div>
          </div>
          
          <div class="multiple-tips">
            ${matchDicas
              .map(
                (dica) => `
              <div class="tip-item">
                <div class="tip-header">
                  <div class="dica-tipo">${dica.tipo.icon} ${
                  dica.tipo.text
                }</div>
                  <div class="confidence-badge confidence-${dica.confidence}">
                    ${
                      dica.confidence === "premium"
                        ? "VIP"
                        : dica.confidence === "high"
                        ? "Alta"
                        : "Média"
                    }
                  </div>
                  <div class="dica-odds">
                    <span class="odd-value">${dica.odd}</span>
                  </div>
                </div>
                <div class="dica-descricao">
                  ${getDicaDescription(dica.tipo.text, dica.match)}
                </div>
              </div>
            `
              )
              .join("")}
          </div>
          
          <div class="dica-footer">
            <div class="dica-time">${firstDica.timestamp}</div>
          </div>
        </div>
      `;
    })
    .join("");

  // Aplicar animações
  setTimeout(() => {
    document.querySelectorAll(".dica-card").forEach((card, index) => {
      setTimeout(() => {
        card.style.opacity = "1";
        card.style.transform = "translateY(0)";
      }, index * 100);
    });
  }, 50);

  updateStats();
}

function getDicaDescription(tipo, match) {
  const descriptions = {
    Vitória: `Favorito com boa forma recente e estatísticas superiores.`,
    Empate: `Confronto equilibrado entre equipes de forças similares.`,
    "Casa ou Empate": `Dupla chance para reduzir risco em jogo incerto.`,
    "Mais de": `Jogo promete ser movimentado com muitas oportunidades de gol.`,
    "Menos de": `Confronto tático com defesas organizadas de ambos os lados.`,
    "Ambas Marcam": `Duas equipes ofensivas que costumam balançar as redes.`,
    Handicap: `Aposta com margem para equilibrar as odds do confronto.`,
    Escanteios: `Jogo com muita pressão ofensiva gerando escanteios.`,
  };

  for (let key in descriptions) {
    if (tipo.includes(key)) {
      return descriptions[key];
    }
  }
  return "Análise detalhada indica excelente oportunidade de aposta baseada em dados históricos.";
}

function filterDicasByCategory(dicas, categoria) {
  switch (categoria) {
    case "premium":
      return dicas.filter((dica) => dica.confidence === "premium");
    case "high":
      return dicas.filter((dica) => dica.confidence === "high");
    case "all":
    default:
      return dicas;
  }
}

function filterDicas(categoria) {
  document.querySelectorAll(".filter-tab").forEach((tab) => {
    tab.classList.remove("active");
  });

  event.target.classList.add("active");
  currentFilter = categoria;

  const container = document.getElementById("dicasContainer");
  container.style.opacity = "0.5";

  setTimeout(() => {
    renderDicas();
    container.style.opacity = "1";
  }, 300);
}

function updateStats() {
  // Calcular estatísticas baseadas nas dicas filtradas
  let filteredDicas = allDicas;
  if (selectedDate) {
    filteredDicas = allDicas.filter((dica) => dica.gameDate === selectedDate);
  }

  const totalDicas = filteredDicas.length;
  const premiumDicas = filteredDicas.filter(
    (d) => d.confidence === "premium"
  ).length;
  const highConfidence = filteredDicas.filter(
    (d) => d.confidence === "high"
  ).length;

  // Taxa de sucesso baseada na confiança das dicas
  const successRate = Math.round(75 + (premiumDicas / totalDicas) * 20);

  // ROI baseado na qualidade das dicas
  const avgOdd =
    filteredDicas.reduce((sum, d) => sum + parseFloat(d.odd), 0) / totalDicas ||
    0;
  const roi = Math.round(10 + (highConfidence + premiumDicas) * 2);

  // Status "Em Alta" baseado na quantidade de dicas premium
  const emAlta = premiumDicas > 3 ? "🔥" : premiumDicas > 1 ? "📈" : "⚡";

  // Atualizar elementos
  document.querySelector(".success-rate").textContent = `${successRate}%`;
  document.querySelector(".roi-positive").textContent = `+${roi}%`;
  document.querySelector(".total-tips").textContent = totalDicas;
  document.querySelector(".hit-rate").textContent = emAlta;
}

function showLoading() {
  document.getElementById("dicasContainer").innerHTML = `
          <div class="loading-spinner">
            <div class="spinner"></div>
            Analisando jogos e gerando dicas...
          </div>
        `;
}

function showError() {
  document.getElementById("dicasContainer").innerHTML = `
          <div class="no-dicas">
            <div class="no-dicas-icon">⚠️</div>
            <h3>Erro ao carregar dicas</h3>
            <p>Tente novamente em alguns instantes.</p>
          </div>
        `;
}

// Atualizar dicas a cada 5 minutos
setInterval(loadDicas, 5 * 60 * 1000);
