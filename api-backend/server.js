const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3001;

// Configuração da API Football-data.org
const FOOTBALL_API_KEY = "4acf7c9cdcea47df8d841279263b4a07";
const FOOTBALL_API_BASE = "https://api.football-data.org/v4";

// Times da La Liga com IDs corretos (atualizados)
const LA_LIGA_TEAMS = {
  "Real Madrid": 86,
  Barcelona: 81,
  "Atletico Madrid": 78,
  Sevilla: 559,
  "Real Betis": 90,
  "Real Sociedad": 92,
  Villarreal: 94,
  "Athletic Bilbao": 77,
  Valencia: 95,
  "Celta Vigo": 558,
  Osasuna: 79,
  Girona: 298,
  "Las Palmas": 275,
  Getafe: 82,
  Alaves: 263,
  Mallorca: 1044,
  "Rayo Vallecano": 87,
  Cadiz: 264,
  // Times que podem ter mudado de ID ou nome
  "CA Osasuna": 79,
  "Elche CF": 1049, // ID atualizado
  "Real Valladolid": 250,
  Espanyol: 80,
};

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
      source: "Football-data.org La Liga",
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
  let teamId = LA_LIGA_TEAMS[teamName];

  // Tentar variações do nome se não encontrar
  if (!teamId) {
    const variations = [
      teamName,
      teamName.replace("CF", "").trim(),
      teamName.replace("FC", "").trim(),
      teamName.replace("UD", "").trim(),
      teamName.replace("Athletic Club", "Athletic Bilbao"),
      teamName.replace("Athletic Bilbao", "Athletic Club"),
    ];

    for (const variation of variations) {
      if (LA_LIGA_TEAMS[variation]) {
        teamId = LA_LIGA_TEAMS[variation];
        console.log(`✅ ID encontrado com variação "${variation}": ${teamId}`);
        break;
      }
    }
  } else {
    console.log(`✅ ID encontrado diretamente: ${teamId}`);
  }

  if (!teamId) {
    console.log(`❌ Time ${teamName} NÃO encontrado no mapeamento`);
    console.log(`📝 Times disponíveis:`, Object.keys(LA_LIGA_TEAMS));
    return generateMockTeamData(teamName, "Time não encontrado no mapeamento");
  }

  try {
    console.log(
      `🌐 Fazendo requisição para API: ${FOOTBALL_API_BASE}/teams/${teamId}`
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
        return generateMockTeamData(
          teamName,
          "Limite de requisições excedido (10/min)"
        );
      }
      if (testResponse.status === 403) {
        console.log(`🔑 CHAVE DA API INVÁLIDA OU EXPIRADA!`);
        return generateMockTeamData(teamName, "Chave da API inválida");
      }
      if (testResponse.status === 404) {
        console.log(`🚫 RECURSO NÃO ENCONTRADO!`);
        return generateMockTeamData(teamName, "Recurso não encontrado");
      }
    }

    // Buscar informações do time
    const teamResponse = await fetch(`${FOOTBALL_API_BASE}/teams/${teamId}`, {
      headers: getApiHeaders(),
    });

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
        throw new Error(`Time com ID ${teamId} não encontrado na API`);
      }
      throw new Error(`HTTP ${teamResponse.status}: ${errorText}`);
    }

    const teamData = await teamResponse.json();
    console.log(`✅ Dados do time recebidos:`, {
      name: teamData.name,
      squadSize: teamData.squad?.length || 0,
      founded: teamData.founded,
    });

    // Buscar últimas partidas (opcional, pode falhar)
    let matchesData = { matches: [] };
    try {
      const matchesResponse = await fetch(
        `${FOOTBALL_API_BASE}/teams/${teamId}/matches?status=FINISHED&limit=5`,
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

    return {
      id: teamId,
      name: teamData.name || teamName,
      squad: teamData.squad || [],
      recentMatches: matchesData.matches || [],
      venue: teamData.venue || {},
      founded: teamData.founded,
      colors: teamData.clubColors,
      crest: teamData.crest,
      source: "Football-data.org",
    };
  } catch (error) {
    console.log(`❌ ERRO NA API para ${teamName}:`, error.message);
    console.log(`🔄 Usando dados simulados como fallback`);
    return generateMockTeamData(teamName, `Erro na API: ${error.message}`);
  }
}

// Gerar dados simulados com motivo
function generateMockTeamData(teamName, reason = "Dados simulados") {
  console.log(`🎭 Gerando dados mock para ${teamName}. Motivo: ${reason}`);

  // Posições mais detalhadas e realistas
  const detailedPositions = [
    // Goleiros (3)
    "Goalkeeper",
    "Goalkeeper",
    "Goalkeeper",
    // Defensores (8)
    "Centre-Back",
    "Centre-Back",
    "Left-Back",
    "Right-Back",
    "Centre-Back",
    "Left-Back",
    "Right-Back",
    "Centre-Back",
    // Meio-campistas (8)
    "Central Midfield",
    "Central Midfield",
    "Attacking Midfield",
    "Defensive Midfield",
    "Central Midfield",
    "Attacking Midfield",
    "Left Midfield",
    "Right Midfield",
    // Pontas (4)
    "Left Winger",
    "Right Winger",
    "Left Winger",
    "Right Winger",
    // Atacantes (5)
    "Centre-Forward",
    "Centre-Forward",
    "Second Striker",
    "Centre-Forward",
    "Left Centre-Forward",
  ];

  const playerNames = [
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
    "Lionel Messi",
    "Neymar Jr",
    "Kylian Mbappé",
    "Robert Lewandowski",
    "Kevin De Bruyne",
    "Erling Haaland",
    "Vinícius Jr",
    "Jude Bellingham",
  ];

  const nationalities = [
    "Spain",
    "Argentina",
    "Brazil",
    "France",
    "Germany",
    "Portugal",
    "Netherlands",
    "Belgium",
    "Croatia",
    "Morocco",
    "England",
    "Italy",
  ];

  const usedNames = new Set();
  const usedNumbers = new Set();

  const squad = detailedPositions.map((position, index) => {
    let playerName, shirtNumber;

    do {
      playerName = playerNames[Math.floor(Math.random() * playerNames.length)];
    } while (usedNames.has(playerName));

    do {
      shirtNumber = Math.floor(Math.random() * 99) + 1;
    } while (usedNumbers.has(shirtNumber));

    usedNames.add(playerName);
    usedNumbers.add(shirtNumber);

    return {
      id: index + 1,
      name: playerName,
      position: position,
      shirtNumber: shirtNumber,
      nationality:
        nationalities[Math.floor(Math.random() * nationalities.length)],
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
  });

  // Ordenar por número da camisa
  squad.sort((a, b) => a.shirtNumber - b.shirtNumber);

  return {
    id: `mock_${teamName.replace(/\s/g, "_")}`,
    name: teamName,
    squad: squad,
    recentMatches: [],
    venue: {
      name: `Estadio ${teamName}`,
      capacity: 30000 + Math.floor(Math.random() * 50000),
    },
    founded: 1900 + Math.floor(Math.random() * 80),
    colors: "Azul / Blanco",
    crest: `https://ui-avatars.com/api/?name=${encodeURIComponent(
      teamName.substring(0, 2)
    )}&background=1e40af&color=ffffff&size=64&format=png&rounded=true&bold=true`,
    source: `Dados simulados - ${reason}`,
    coach: {
      name: [
        "Pep Guardiola",
        "Carlo Ancelotti",
        "Diego Simeone",
        "Xavi Hernández",
      ][Math.floor(Math.random() * 4)],
      nationality: "Spain",
    },
  };
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
      laLigaTeams: Object.keys(LA_LIGA_TEAMS).length,
      availableTeams: Object.keys(LA_LIGA_TEAMS),
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
      laLigaTeams: Object.keys(LA_LIGA_TEAMS).length,
      availableTeams: Object.keys(LA_LIGA_TEAMS),
    });
  }
});

app.listen(PORT, () => {
  console.log(`\n🚀 BACKEND INICIADO`);
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(
    `🔑 API Key: ${FOOTBALL_API_KEY ? "✅ Configurada" : "❌ Não configurada"}`
  );
  console.log(`🇪🇸 Times mapeados: ${Object.keys(LA_LIGA_TEAMS).length}`);
  console.log(`🧪 Teste: http://localhost:${PORT}/api/test`);
  console.log(
    `\n💡 DICA: Acesse o teste primeiro para verificar se a API está funcionando!`
  );
});
