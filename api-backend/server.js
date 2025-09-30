const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3001;

// Configuração da API Football-data.org
const FOOTBALL_API_KEY = "4acf7c9cdcea47df8d841279263b4a07";
const FOOTBALL_API_BASE = "https://api.football-data.org/v4";

// Times da La Liga e Bundesliga com IDs corretos
// Substituir o TEAMS_DATABASE por este (IDs corretos verificados):
const TEAMS_DATABASE = {
  // LA LIGA (Espanha) - IDs verificados
  "Real Madrid": { id: 86, league: "La Liga", country: "Spain" },
  Barcelona: { id: 81, league: "La Liga", country: "Spain" },
  "Atletico Madrid": { id: 78, league: "La Liga", country: "Spain" },
  Sevilla: { id: 559, league: "La Liga", country: "Spain" },
  "Real Betis": { id: 90, league: "La Liga", country: "Spain" },
  "Real Sociedad": { id: 92, league: "La Liga", country: "Spain" },
  Villarreal: { id: 94, league: "La Liga", country: "Spain" },
  "Athletic Bilbao": { id: 77, league: "La Liga", country: "Spain" },
  Valencia: { id: 95, league: "La Liga", country: "Spain" },

  // PREMIER LEAGUE (Inglaterra) - Melhor suporte na API
  "Manchester City": { id: 65, league: "Premier League", country: "England" },
  Arsenal: { id: 57, league: "Premier League", country: "England" },
  Liverpool: { id: 64, league: "Premier League", country: "England" },
  Chelsea: { id: 61, league: "Premier League", country: "England" },
  "Manchester United": { id: 66, league: "Premier League", country: "England" },
  Tottenham: { id: 73, league: "Premier League", country: "England" },
  "Newcastle United": { id: 67, league: "Premier League", country: "England" },
  Brighton: { id: 397, league: "Premier League", country: "England" },
  "Aston Villa": { id: 58, league: "Premier League", country: "England" },

  // SERIE A (Itália) - Também tem bom suporte
  Juventus: { id: 109, league: "Serie A", country: "Italy" },
  "AC Milan": { id: 98, league: "Serie A", country: "Italy" },
  Inter: { id: 108, league: "Serie A", country: "Italy" },
  Napoli: { id: 113, league: "Serie A", country: "Italy" },
  Roma: { id: 100, league: "Serie A", country: "Italy" },
  Lazio: { id: 110, league: "Serie A", country: "Italy" },
};

// Formações táticas possíveis
const FORMATIONS = [
  "4-3-3",
  "4-4-2",
  "4-2-3-1",
  "3-5-2",
  "4-5-1",
  "3-4-3",
  "5-3-2",
];

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:5500",
      "http://127.0.0.1:5500",
      "http://localhost:3000",
      "https://christiancastro24.github.io",
    ],
    credentials: true,
  })
);
app.use(express.json());

const getApiHeaders = () => ({
  "X-Auth-Token": FOOTBALL_API_KEY,
  "Content-Type": "application/json",
});

app.get("/", (req, res) => {
  res.send(
    "API Backend está funcionando! Acesse /api/test para mais detalhes."
  );
});

// Rota principal para escalações
app.post("/api/teams/lineups", async (req, res) => {
  const { teamNames } = req.body;

  if (!Array.isArray(teamNames) || teamNames.length === 0) {
    return res.status(400).json({
      error: "teamNames deve ser um array não vazio",
    });
  }

  try {
    console.log(`\n🔍 BUSCANDO ESCALAÇÕES PARA: ${teamNames.join(", ")}`);
    console.log(
      `🔑 API Key: ${FOOTBALL_API_KEY ? "CONFIGURADA" : "NÃO CONFIGURADA"}`
    );

    const results = await Promise.all(
      teamNames.map((teamName) => getTeamLineup(teamName))
    );

    res.json({
      teams: results,
      source: "Football-data.org Multi-League",
    });
  } catch (error) {
    console.error("❌ Erro ao buscar escalações:", error);
    res.status(500).json({
      error: "Erro interno do servidor",
      message: error.message,
    });
  }
});

// Buscar dados do time com debug detalhado
async function getTeamLineup(teamName) {
  console.log(`\n🏈 Processando time: ${teamName}`);

  // Buscar ID do time (com várias tentativas)
  let teamInfo = TEAMS_DATABASE[teamName];

  // Tentar variações do nome se não encontrar
  if (!teamInfo) {
    const variations = [
      teamName,
      teamName.replace("CF", "").trim(),
      teamName.replace("FC", "").trim(),
      teamName.replace("UD", "").trim(),
      teamName.replace("1. ", "").trim(),
      teamName.replace("Athletic Club", "Athletic Bilbao"),
      teamName.replace("Athletic Bilbao", "Athletic Club"),
      teamName.replace("Bayern Munich", "FC Bayern München"),
      teamName.replace("Borussia Dortmund", "BVB"),
    ];

    for (const variation of variations) {
      if (TEAMS_DATABASE[variation]) {
        teamInfo = TEAMS_DATABASE[variation];
        console.log(
          `✅ ID encontrado com variação "${variation}": ${teamInfo.id}`
        );
        break;
      }
    }
  } else {
    console.log(
      `✅ ID encontrado diretamente: ${teamInfo.id} (${teamInfo.league})`
    );
  }

  if (!teamInfo) {
    console.log(`❌ Time ${teamName} NÃO encontrado no mapeamento`);
    console.log(`📝 Times disponíveis:`, Object.keys(TEAMS_DATABASE));
    return generateRealisticLineup(
      teamName,
      "Time não encontrado no mapeamento"
    );
  }

  try {
    console.log(
      `🌐 Fazendo requisição para API: ${FOOTBALL_API_BASE}/teams/${teamInfo.id}`
    );

    // Teste de conectividade primeiro
    const testResponse = await fetch(`${FOOTBALL_API_BASE}/competitions`, {
      headers: getApiHeaders(),
    });

    console.log(`🔗 Status da conexão inicial: ${testResponse.status}`);

    if (!testResponse.ok) {
      console.log(
        `❌ Erro na conexão inicial: ${testResponse.status} - ${testResponse.statusText}`
      );

      if (testResponse.status === 429) {
        console.log(`⏰ LIMITE DE REQUISIÇÕES EXCEDIDO! Aguarde 1 minuto.`);
        return generateRealisticLineup(
          teamName,
          "Limite de requisições excedido (10/min)",
          teamInfo
        );
      }
      if (testResponse.status === 403) {
        console.log(`🔑 CHAVE DA API INVÁLIDA OU EXPIRADA!`);
        return generateRealisticLineup(
          teamName,
          "Chave da API inválida",
          teamInfo
        );
      }
      if (testResponse.status === 404) {
        console.log(`🚫 RECURSO NÃO ENCONTRADO!`);
        return generateRealisticLineup(
          teamName,
          "Recurso não encontrado",
          teamInfo
        );
      }
    }

    // Buscar informações do time
    const teamResponse = await fetch(
      `${FOOTBALL_API_BASE}/teams/${teamInfo.id}`,
      {
        headers: getApiHeaders(),
      }
    );

    console.log(`📊 Status da requisição do time: ${teamResponse.status}`);

    if (!teamResponse.ok) {
      const errorText = await teamResponse.text();
      console.log(`❌ Erro na requisição do time:`, errorText);

      if (teamResponse.status === 429) {
        throw new Error("Limite de requisições excedido (10/min)");
      }
      if (teamResponse.status === 403) {
        throw new Error("Chave da API inválida");
      }
      if (teamResponse.status === 404) {
        throw new Error(`Time com ID ${teamInfo.id} não encontrado na API`);
      }
      throw new Error(`HTTP ${teamResponse.status}: ${errorText}`);
    }

    const teamData = await teamResponse.json();
    console.log(`✅ Dados do time recebidos:`, {
      name: teamData.name,
      squadSize: teamData.squad?.length || 0,
      founded: teamData.founded,
      league: teamInfo.league,
    });

    // Buscar últimas partidas (opcional, pode falhar)
    let matchesData = { matches: [] };
    try {
      const matchesResponse = await fetch(
        `${FOOTBALL_API_BASE}/teams/${teamInfo.id}/matches?status=FINISHED&limit=5`,
        { headers: getApiHeaders() }
      );

      if (matchesResponse.ok) {
        matchesData = await matchesResponse.json();
        console.log(
          `⚽ Partidas recentes encontradas: ${
            matchesData.matches?.length || 0
          }`
        );
      }
    } catch (matchError) {
      console.log(
        `⚠️ Erro ao buscar partidas (não crítico):`,
        matchError.message
      );
    }

    // Se tiver elenco da API, criar escalação realista
    if (teamData.squad && teamData.squad.length > 0) {
      const realisticLineup = createRealisticLineupFromSquad(
        teamData.squad,
        teamData,
        teamInfo
      );

      return {
        id: teamInfo.id,
        name: teamData.name || teamName,
        squad: realisticLineup.squad,
        startingXI: realisticLineup.startingXI,
        substitutes: realisticLineup.substitutes,
        formation: realisticLineup.formation,
        recentMatches: matchesData.matches || [],
        venue: teamData.venue || {},
        founded: teamData.founded,
        colors: teamData.clubColors,
        crest: teamData.crest,
        league: teamInfo.league,
        country: teamInfo.country,
        source: "Football-data.org",
        coach: {
          name: getRandomCoach(teamInfo.country),
          nationality: teamInfo.country,
        },
      };
    } else {
      // Se não tiver elenco, gerar mock
      return generateRealisticLineup(
        teamName,
        "Elenco não disponível na API",
        teamInfo
      );
    }
  } catch (error) {
    console.log(`❌ ERRO NA API para ${teamName}:`, error.message);
    console.log(`🔄 Usando dados simulados como fallback`);
    return generateRealisticLineup(
      teamName,
      `Erro na API: ${error.message}`,
      teamInfo
    );
  }
}

// Criar escalação realista a partir do elenco da API
function createRealisticLineupFromSquad(squad, teamData, teamInfo) {
  // Organizar jogadores por posição
  const organized = organizePlayersByPosition(squad);

  // Selecionar formação aleatória
  const formation = FORMATIONS[Math.floor(Math.random() * FORMATIONS.length)];

  // Montar time titular baseado na formação
  const startingXI = [];
  const substitutes = [];

  // Goleiro titular (melhor avaliado ou primeiro)
  if (organized.goalkeepers.length > 0) {
    startingXI.push({ ...organized.goalkeepers[0], position: "Goalkeeper" });
    substitutes.push(...organized.goalkeepers.slice(1, 3));
  }

  // Defensores (4 titulares normalmente)
  const defenseCount = formation.startsWith("3")
    ? 3
    : formation.startsWith("5")
    ? 5
    : 4;
  startingXI.push(...organized.defenders.slice(0, defenseCount));
  substitutes.push(
    ...organized.defenders.slice(defenseCount, defenseCount + 3)
  );

  // Meio-campistas
  const midfieldCount = formation.includes("5")
    ? 5
    : formation.includes("4")
    ? 4
    : 3;
  startingXI.push(...organized.midfielders.slice(0, midfieldCount));
  substitutes.push(
    ...organized.midfielders.slice(midfieldCount, midfieldCount + 3)
  );

  // Atacantes
  const forwardCount = formation.endsWith("3")
    ? 3
    : formation.endsWith("2")
    ? 2
    : 1;
  startingXI.push(...organized.forwards.slice(0, forwardCount));
  substitutes.push(...organized.forwards.slice(forwardCount, forwardCount + 2));

  return {
    squad: squad, // Elenco completo original
    startingXI: startingXI.slice(0, 11), // Garantir apenas 11
    substitutes: substitutes.slice(0, 9), // Máximo 9 reservas
    formation: formation,
  };
}

// Organizar jogadores por posição
function organizePlayersByPosition(squad) {
  const organized = {
    goalkeepers: [],
    defenders: [],
    midfielders: [],
    forwards: [],
  };

  squad.forEach((player) => {
    const pos = player.position?.toLowerCase() || "";

    if (pos.includes("goalkeeper") || pos.includes("keeper")) {
      organized.goalkeepers.push(player);
    } else if (
      pos.includes("defence") ||
      pos.includes("defender") ||
      pos.includes("back")
    ) {
      organized.defenders.push(player);
    } else if (pos.includes("midfield") || pos.includes("midfielder")) {
      organized.midfielders.push(player);
    } else if (
      pos.includes("forward") ||
      pos.includes("attacker") ||
      pos.includes("striker")
    ) {
      organized.forwards.push(player);
    } else {
      // Posição desconhecida, colocar como meio-campo
      organized.midfielders.push(player);
    }
  });

  return organized;
}

// Gerar escalação realista quando não há dados da API
function generateRealisticLineup(
  teamName,
  reason = "Dados simulados",
  teamInfo = null
) {
  console.log(
    `🎭 Gerando escalação realista para ${teamName}. Motivo: ${reason}`
  );

  const formation = FORMATIONS[Math.floor(Math.random() * FORMATIONS.length)];
  const country = teamInfo?.country || "Spain";
  const league = teamInfo?.league || "La Liga";

  // Nomes baseados no país
  const playerNames = getPlayerNamesByCountry(country);
  const usedNames = new Set();
  const usedNumbers = new Set();

  // Gerar time titular (11 jogadores)
  const startingXI = generatePlayersForFormation(
    formation,
    playerNames,
    usedNames,
    usedNumbers,
    country
  );

  // Gerar reservas (9 jogadores)
  const substitutes = generateSubstitutes(
    playerNames,
    usedNames,
    usedNumbers,
    country
  );

  // Elenco completo (titular + reservas)
  const squad = [...startingXI, ...substitutes];

  return {
    id: `mock_${teamName.replace(/\s/g, "_")}`,
    name: teamName,
    squad: squad,
    startingXI: startingXI,
    substitutes: substitutes,
    formation: formation,
    recentMatches: [],
    venue: {
      name: `${getStadiumPrefix(country)} ${teamName}`,
      capacity: 30000 + Math.floor(Math.random() * 50000),
    },
    founded: 1900 + Math.floor(Math.random() * 80),
    colors: getTeamColors(country),
    league: league,
    country: country,
    crest: `https://ui-avatars.com/api/?name=${encodeURIComponent(
      teamName.substring(0, 2)
    )}&background=1e40af&color=ffffff&size=64&format=png&rounded=true&bold=true`,
    source: `Dados simulados - ${reason}`,
    coach: {
      name: getRandomCoach(country),
      nationality: country,
    },
  };
}

// Gerar jogadores para uma formação específica
function generatePlayersForFormation(
  formation,
  playerNames,
  usedNames,
  usedNumbers,
  country
) {
  const players = [];
  let playerId = 1;

  // Goleiro
  players.push(
    generatePlayer(
      playerId++,
      "Goalkeeper",
      playerNames,
      usedNames,
      usedNumbers,
      country,
      1
    )
  );

  // Defensores
  const defenseCount = formation.startsWith("3")
    ? 3
    : formation.startsWith("5")
    ? 5
    : 4;
  const defensePositions = [
    "Centre-Back",
    "Left-Back",
    "Right-Back",
    "Centre-Back",
  ];
  for (let i = 0; i < defenseCount; i++) {
    const position = defensePositions[i % defensePositions.length];
    players.push(
      generatePlayer(
        playerId++,
        position,
        playerNames,
        usedNames,
        usedNumbers,
        country
      )
    );
  }

  // Meio-campistas
  const midfieldCount = formation.includes("5")
    ? 5
    : formation.includes("4")
    ? 4
    : 3;
  const midfieldPositions = [
    "Central Midfield",
    "Defensive Midfield",
    "Attacking Midfield",
  ];
  for (let i = 0; i < midfieldCount; i++) {
    const position = midfieldPositions[i % midfieldPositions.length];
    players.push(
      generatePlayer(
        playerId++,
        position,
        playerNames,
        usedNames,
        usedNumbers,
        country
      )
    );
  }

  // Atacantes
  const forwardCount = formation.endsWith("3")
    ? 3
    : formation.endsWith("2")
    ? 2
    : 1;
  const forwardPositions = ["Centre-Forward", "Left Winger", "Right Winger"];
  for (let i = 0; i < forwardCount; i++) {
    const position = forwardPositions[i % forwardPositions.length];
    players.push(
      generatePlayer(
        playerId++,
        position,
        playerNames,
        usedNames,
        usedNumbers,
        country
      )
    );
  }

  return players;
}

// Gerar reservas
function generateSubstitutes(playerNames, usedNames, usedNumbers, country) {
  const substitutes = [];
  let playerId = 12;

  // 2 goleiros reservas
  for (let i = 0; i < 2; i++) {
    substitutes.push(
      generatePlayer(
        playerId++,
        "Goalkeeper",
        playerNames,
        usedNames,
        usedNumbers,
        country
      )
    );
  }

  // 3 defensores reservas
  const defensePositions = ["Centre-Back", "Left-Back", "Right-Back"];
  for (let i = 0; i < 3; i++) {
    substitutes.push(
      generatePlayer(
        playerId++,
        defensePositions[i],
        playerNames,
        usedNames,
        usedNumbers,
        country
      )
    );
  }

  // 2 meio-campistas reservas
  for (let i = 0; i < 2; i++) {
    substitutes.push(
      generatePlayer(
        playerId++,
        "Central Midfield",
        playerNames,
        usedNames,
        usedNumbers,
        country
      )
    );
  }

  // 2 atacantes reservas
  for (let i = 0; i < 2; i++) {
    substitutes.push(
      generatePlayer(
        playerId++,
        "Centre-Forward",
        playerNames,
        usedNames,
        usedNumbers,
        country
      )
    );
  }

  return substitutes;
}

// Gerar jogador individual
function generatePlayer(
  id,
  position,
  playerNames,
  usedNames,
  usedNumbers,
  country,
  preferredNumber = null
) {
  let playerName, shirtNumber;

  do {
    playerName = playerNames[Math.floor(Math.random() * playerNames.length)];
  } while (usedNames.has(playerName));

  if (preferredNumber && !usedNumbers.has(preferredNumber)) {
    shirtNumber = preferredNumber;
  } else {
    do {
      shirtNumber = Math.floor(Math.random() * 99) + 1;
    } while (usedNumbers.has(shirtNumber));
  }

  usedNames.add(playerName);
  usedNumbers.add(shirtNumber);

  return {
    id: id,
    name: playerName,
    position: position,
    shirtNumber: shirtNumber,
    nationality: country,
    dateOfBirth: new Date(
      1990 + Math.floor(Math.random() * 15),
      Math.floor(Math.random() * 12),
      Math.floor(Math.random() * 28)
    ).toISOString(),
    marketValue: Math.floor(Math.random() * 50000000) + 1000000,
    contract: {
      start: "2023-07-01",
      until: "2027-06-30",
    },
  };
}

// Nomes por país
function getPlayerNamesByCountry(country) {
  const namesByCountry = {
    Spain: [
      "Sergio Ramos",
      "Iker Casillas",
      "David Villa",
      "Fernando Torres",
      "Xavi Hernández",
      "Andrés Iniesta",
      "Carles Puyol",
      "Raúl González",
      "David Silva",
      "Juan Mata",
      "Álvaro Morata",
      "Marco Asensio",
      "Pablo Sarabia",
      "Dani Carvajal",
      "Jordi Alba",
      "Sergio Busquets",
      "Pedri González",
      "Gavi Páez",
      "Ansu Fati",
      "Ferran Torres",
    ],
    Germany: [
      "Manuel Neuer",
      "Thomas Müller",
      "Joshua Kimmich",
      "Leon Goretzka",
      "Serge Gnabry",
      "Leroy Sané",
      "Timo Werner",
      "Kai Havertz",
      "Antonio Rüdiger",
      "Mats Hummels",
      "Marco Reus",
      "Florian Wirtz",
      "Jamal Musiala",
      "Ilkay Gündogan",
      "Niklas Süle",
      "Robin Gosens",
      "Jonas Hofmann",
      "David Raum",
      "Nico Schlotterbeck",
      "Youssoufa Moukoko",
    ],
  };

  return namesByCountry[country] || namesByCountry.Spain;
}

// Técnicos por país
function getRandomCoach(country) {
  const coachesByCountry = {
    Spain: [
      "Pep Guardiola",
      "Carlo Ancelotti",
      "Diego Simeone",
      "Xavi Hernández",
    ],
    Germany: [
      "Jürgen Klopp",
      "Thomas Tuchel",
      "Julian Nagelsmann",
      "Hansi Flick",
    ],
  };

  const coaches = coachesByCountry[country] || coachesByCountry.Spain;
  return coaches[Math.floor(Math.random() * coaches.length)];
}

// Prefixos de estádio por país
function getStadiumPrefix(country) {
  const prefixes = {
    Spain: "Estadio",
    Germany: "Stadion",
  };
  return prefixes[country] || "Stadium";
}

// Cores por país
function getTeamColors(country) {
  const colors = {
    Spain: [
      "Azul / Blanco",
      "Rojo / Blanco",
      "Verde / Blanco",
      "Amarillo / Azul",
    ],
    Germany: ["Rot / Weiß", "Blau / Weiß", "Gelb / Schwarz", "Grün / Weiß"],
  };

  const countryColors = colors[country] || colors.Spain;
  return countryColors[Math.floor(Math.random() * countryColors.length)];
}

// Rota de teste melhorada
app.get("/api/test", async (req, res) => {
  console.log("\n🧪 EXECUTANDO TESTE DA API...");

  try {
    // Testar conectividade
    const testResponse = await fetch(`${FOOTBALL_API_BASE}/competitions`, {
      headers: getApiHeaders(),
    });

    let apiStatus = "❌ Erro";
    let apiMessage = "";

    if (testResponse.ok) {
      apiStatus = "✅ Funcionando";
      const data = await testResponse.json();
      apiMessage = `${data.competitions?.length || 0} competições encontradas`;
    } else {
      apiMessage = `HTTP ${testResponse.status} - ${testResponse.statusText}`;
    }

    res.json({
      message: "Backend funcionando!",
      timestamp: new Date().toISOString(),
      apiKey: FOOTBALL_API_KEY ? "✅ Configurada" : "❌ Não configurada",
      apiStatus: apiStatus,
      apiMessage: apiMessage,
      totalTeams: Object.keys(TEAMS_DATABASE).length,
      leagues: {
        "La Liga": Object.values(TEAMS_DATABASE).filter(
          (t) => t.league === "La Liga"
        ).length,
        Bundesliga: Object.values(TEAMS_DATABASE).filter(
          (t) => t.league === "Bundesliga"
        ).length,
      },
      availableTeams: Object.keys(TEAMS_DATABASE),
      rateLimitInfo: "10 requisições por minuto (plano gratuito)",
    });

    console.log(`✅ Teste concluído - API Status: ${apiStatus}`);
  } catch (error) {
    console.log(`❌ Erro no teste:`, error.message);
    res.json({
      message: "Backend funcionando!",
      timestamp: new Date().toISOString(),
      apiKey: FOOTBALL_API_KEY ? "✅ Configurada" : "❌ Não configurada",
      apiStatus: "❌ Erro na conexão",
      apiMessage: error.message,
      totalTeams: Object.keys(TEAMS_DATABASE).length,
      availableTeams: Object.keys(TEAMS_DATABASE),
    });
  }
});

app.listen(PORT, () => {
  console.log(`\n🚀 BACKEND INICIADO`);
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(
    `🔑 API Key: ${FOOTBALL_API_KEY ? "✅ Configurada" : "❌ Não configurada"}`
  );
  console.log(`⚽ Times mapeados: ${Object.keys(TEAMS_DATABASE).length}`);
  console.log(
    `🇪🇸 La Liga: ${
      Object.values(TEAMS_DATABASE).filter((t) => t.league === "La Liga").length
    } times`
  );
  console.log(
    `🇩🇪 Bundesliga: ${
      Object.values(TEAMS_DATABASE).filter((t) => t.league === "Bundesliga")
        .length
    } times`
  );
  console.log(`🧪 Teste: http://localhost:${PORT}/api/test`);
  console.log(
    `\n💡 DICA: Acesse o teste primeiro para verificar se a API está funcionando!`
  );
});
