// Configuração da API
const API_KEY = "e6151727b9b3162bb023a5d9283dc608";
const API_BASE_URL = "https://api.the-odds-api.com/v4";

// Configuração da API Football-data.org
const FOOTBALL_DATA_API_KEY = "4acf7c9cdcea47df8d841279263b4a07";
const FOOTBALL_DATA_BASE_URL = "https://api.football-data.org/v4";

// Configuração do backend
// const BACKEND_BASE_URL = "http://localhost:3001/api";
const BACKEND_BASE_URL = "https://aposta-backend-al15.onrender.com/api";

// Cache para armazenar dados já buscados
let lineupsCache = {};
let currentTab = "lineups";

let isLoading = false;

// Mapeamento de bookmakers
const BOOKMAKER_MAP = {
  bet365: { name: "Bet365", logo: "🎯" },
  betano: { name: "Betano", logo: "🔥" },
  superbet: { name: "SuperBet", logo: "💎" },
};

// Mapeamento de times brasileiros para IDs da API
const TEAM_ID_MAP = {
  Grêmio: 1023,
  Botafogo: 1957,
  "Vasco da Gama": 1963,
  Bahia: 1945,
  "Athletic Club (MG)": 1942,
  "Atlético Paranaense": 1942,
  "Clube de Regatas Brasil": 1950,
  "Vila Nova": 1960,
  "Operario PR": 1958,
  Cuiabá: 1952,
  "Amazonas FC": 1961,
  // Adicionar mais conforme necessário
};

// Função para buscar odds reais da API
async function fetchRealOdds() {
  if (isLoading) return;

  try {
    isLoading = true;
    updateRefreshButton(true);

    // Primeiro, buscar esportes disponíveis
    const sportsResponse = await fetch(
      `${API_BASE_URL}/sports?apiKey=${API_KEY}`
    );

    if (!sportsResponse.ok) {
      throw new Error(`Erro na API: ${sportsResponse.status}`);
    }

    const sports = await sportsResponse.json();

    console.log(sports, "SPORTS");

    // Filtrar apenas esportes que temos no mapeamento
    const availableSports = sports.filter(
      (sport) => SPORTS_MAP[sport.key] && sport.active
    ); // Limitar para economizar créditos

    if (availableSports.length === 0) {
      throw new Error("Nenhum esporte disponível no momento");
    }

    // Buscar odds para cada esporte
    const allGames = [];
    const regions = "us,uk,eu"; // Múltiplas regiões para mais bookmakers
    const markets = "h2h"; // Head to head (1x2)

    for (const sport of availableSports) {
      try {
        const oddsResponse = await fetch(
          `${API_BASE_URL}/sports/${sport.key}/odds?apiKey=${API_KEY}&regions=${regions}&markets=${markets}&oddsFormat=decimal&dateFormat=iso`
        );

        if (oddsResponse.ok) {
          const oddsData = await oddsResponse.json();

          console.log(oddsData, "ODDS DATA");

          if (oddsData.length > 0) {
            allGames.push({
              sport: sport.key,
              sportInfo: SPORTS_MAP[sport.key],
              games: oddsData, // Limitar jogos por esporte
            });
          }
        }
      } catch (error) {
        console.error(`Erro ao buscar odds para ${sport.key}:`, error);
      }
    }

    return allGames;
  } catch (error) {
    console.error("Erro ao buscar dados da API:", error);
    throw error;
  } finally {
    isLoading = false;
    updateRefreshButton(false);
  }
}

// Função para obter logo do time
function getTeamLogo(teamName) {
  const teamLogos = {
    // Times brasileiros - Série A
    Flamengo:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Flamengo-RJ_%28BRA%29.png/32px-Flamengo-RJ_%28BRA%29.png",
    "CR Flamengo":
      "https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Flamengo-RJ_%28BRA%29.png/32px-Flamengo-RJ_%28BRA%29.png",

    Palmeiras:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Palmeiras_logo.svg/32px-Palmeiras_logo.svg.png",
    "SE Palmeiras":
      "https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Palmeiras_logo.svg/32px-Palmeiras_logo.svg.png",

    "São Paulo":
      "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Brasao_do_Sao_Paulo_Futebol_Clube.svg/32px-Brasao_do_Sao_Paulo_Futebol_Clube.svg.png",
    "Sao Paulo":
      "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Brasao_do_Sao_Paulo_Futebol_Clube.svg/32px-Brasao_do_Sao_Paulo_Futebol_Clube.svg.png",

    Corinthians:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Sport_Club_Corinthians_Paulista_crest.svg/32px-Sport_Club_Corinthians_Paulista_crest.svg.png",
    "SC Corinthians":
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Sport_Club_Corinthians_Paulista_crest.svg/32px-Sport_Club_Corinthians_Paulista_crest.svg.png",

    Santos:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Santos_logo.svg/32px-Santos_logo.svg.png",
    "Santos FC":
      "https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Santos_logo.svg/32px-Santos_logo.svg.png",

    "Vasco da Gama":
      "https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Vasco_da_Gama_Logo.svg/32px-Vasco_da_Gama_Logo.svg.png",
    Vasco:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Vasco_da_Gama_Logo.svg/32px-Vasco_da_Gama_Logo.svg.png",

    Botafogo:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Botafogo_de_Futebol_e_Regatas_logo.svg/32px-Botafogo_de_Futebol_e_Regatas_logo.svg.png",
    "Botafogo FR":
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Botafogo_de_Futebol_e_Regatas_logo.svg/32px-Botafogo_de_Futebol_e_Regatas_logo.svg.png",

    "Atlético Mineiro":
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Atletico_mineiro_galo.png/32px-Atletico_mineiro_galo.png",
    "Atletico Mineiro":
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Atletico_mineiro_galo.png/32px-Atletico_mineiro_galo.png",

    Bragantino:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Red_Bull_Bragantino_logo.svg/32px-Red_Bull_Bragantino_logo.svg.png",
    "Bragantino-SP":
      "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Red_Bull_Bragantino_logo.svg/32px-Red_Bull_Bragantino_logo.svg.png",
    "Red Bull Bragantino":
      "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Red_Bull_Bragantino_logo.svg/32px-Red_Bull_Bragantino_logo.svg.png",
    "RB Bragantino":
      "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Red_Bull_Bragantino_logo.svg/32px-Red_Bull_Bragantino_logo.svg.png",

    "Sport Recife":
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Sport_Club_do_Recife_logo.svg/32px-Sport_Club_do_Recife_logo.svg.png",
    Sport:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Sport_Club_do_Recife_logo.svg/32px-Sport_Club_do_Recife_logo.svg.png",

    Juventude:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Esporte_Clube_Juventude_logo.png/32px-Esporte_Clube_Juventude_logo.png",
    "EC Juventude":
      "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Esporte_Clube_Juventude_logo.png/32px-Esporte_Clube_Juventude_logo.png",

    Grêmio:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Gremio_logo.svg/32px-Gremio_logo.svg.png",
    Gremio:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Gremio_logo.svg/32px-Gremio_logo.svg.png",

    Internacional:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Escudo_do_Sport_Club_Internacional.svg/32px-Escudo_do_Sport_Club_Internacional.svg.png",
    Inter:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Escudo_do_Sport_Club_Internacional.svg/32px-Escudo_do_Sport_Club_Internacional.svg.png",

    Ceará:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Ceara_sporting_club_logo.png/32px-Ceara_sporting_club_logo.png",
    Ceara:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Ceara_sporting_club_logo.png/32px-Ceara_sporting_club_logo.png",

    Fortaleza:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/FortalezaEsporteClube.svg/32px-FortalezaEsporteClube.svg.png",
    Bahia:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/EscudoBahia.svg/32px-EscudoBahia.svg.png",
    Cruzeiro:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Cruzeiro_Esporte_Clube_%28logo%29.svg/32px-Cruzeiro_Esporte_Clube_%28logo%29.svg.png",

    // Times da Série B
    Guarani:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Guarani_FC_logo.svg/32px-Guarani_FC_logo.svg.png",
    "Ponte Preta":
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Associa%C3%A7%C3%A3o_Atl%C3%A9tica_Ponte_Preta_logo.svg/32px-Associa%C3%A7%C3%A3o_Atl%C3%A9tica_Ponte_Preta_logo.svg.png",
    Avaí: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Avai_FC_logo.svg/32px-Avai_FC_logo.svg.png",
    Chapecoense:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Chapecoense_Logo.png/32px-Chapecoense_Logo.png",
    CRB: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Clube_de_Regatas_Brasil_logo.svg/32px-Clube_de_Regatas_Brasil_logo.svg.png",
    "Vila Nova":
      "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Vila_Nova_FC_logo.svg/32px-Vila_Nova_FC_logo.svg.png",
    "Operário-PR":
      "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Opera%C3%A1rio_Ferroviario_Esporte_Clube_logo.svg/32px-Opera%C3%A1rio_Ferroviario_Esporte_Clube_logo.svg.png",
    Novorizontino:
      "https://ui-avatars.com/api/?name=NOV&background=006400&color=ffffff&size=32&format=png&rounded=true&bold=true",
    Mirassol:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Mirassol_FC_logo.svg/32px-Mirassol_FC_logo.svg.png",
    "América-MG":
      "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Am%C3%A9rica_Futebol_Clube_%28MG%29_logo.svg/32px-Am%C3%A9rica_Futebol_Clube_%28MG%29_logo.svg.png",
    Goiás:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Goi%C3%A1s_Esporte_Clube_logo.svg/32px-Goi%C3%A1s_Esporte_Clube_logo.svg.png",

    // Seleções Sul-Americanas
    Brazil:
      "https://upload.wikimedia.org/wikipedia/en/thumb/0/05/Brazil_national_football_team_logo.svg/32px-Brazil_national_football_team_logo.svg.png",
    Brasil:
      "https://upload.wikimedia.org/wikipedia/en/thumb/0/05/Brazil_national_football_team_logo.svg/32px-Brazil_national_football_team_logo.svg.png",
    Argentina:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Argentina_crest.svg/32px-Argentina_crest.svg.png",
    Uruguay:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Escudo_de_la_Asociaci%C3%B3n_Uruguaya_de_F%C3%BAtbol.svg/32px-Escudo_de_la_Asociaci%C3%B3n_Uruguaya_de_F%C3%BAtbol.svg.png",
    Colombia:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Escudo_de_la_Selecci%C3%B3n_de_f%C3%BAtbol_de_Colombia.svg/32px-Escudo_de_la_Selecci%C3%B3n_de_f%C3%BAtbol_de_Colombia.svg.png",
    Chile:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Escudo_selecci%C3%B3n_chilena_de_f%C3%BAtbol.svg/32px-Escudo_selecci%C3%B3n_chilena_de_f%C3%BAtbol.svg.png",
    Peru: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Escudo_de_la_Selecci%C3%B3n_de_f%C3%BAtbol_del_Per%C3%BA.svg/32px-Escudo_de_la_Selecci%C3%B3n_de_f%C3%BAtbol_del_Per%C3%BA.svg.png",
    Ecuador:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Escudo_de_la_Selecci%C3%B3n_de_f%C3%BAtbol_de_Ecuador.svg/32px-Escudo_de_la_Selecci%C3%B3n_de_f%C3%BAtbol_de_Ecuador.svg.png",
    Paraguay:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Escudo_de_la_Selecci%C3%B3n_de_f%C3%BAtbol_de_Paraguay.svg/32px-Escudo_de_la_Selecci%C3%B3n_de_f%C3%BAtbol_de_Paraguay.svg.png",
    Bolivia:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Escudo_de_la_Selecci%C3%B3n_de_f%C3%BAtbol_de_Bolivia.svg/32px-Escudo_de_la_Selecci%C3%B3n_de_f%C3%BAtbol_de_Bolivia.svg.png",
    Venezuela:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Escudo_de_la_Selecci%C3%B3n_de_f%C3%BAtbol_de_Venezuela.svg/32px-Escudo_de_la_Selecci%C3%B3n_de_f%C3%BAtbol_de_Venezuela.svg.png",

    // Seleções Europeias
    France:
      "https://upload.wikimedia.org/wikipedia/en/thumb/c/c1/France_national_football_team_logo.svg/32px-France_national_football_team_logo.svg.png",
    França:
      "https://upload.wikimedia.org/wikipedia/en/thumb/c/c1/France_national_football_team_logo.svg/32px-France_national_football_team_logo.svg.png",
    Germany:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/DFB-Logo.svg/32px-DFB-Logo.svg.png",
    Alemanha:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/DFB-Logo.svg/32px-DFB-Logo.svg.png",
    Spain:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Escudo_de_la_Selecci%C3%B3n_de_f%C3%BAtbol_de_Espa%C3%B1a.svg/32px-Escudo_de_la_Selecci%C3%B3n_de_f%C3%BAtbol_de_Espa%C3%B1a.svg.png",
    Espanha:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Escudo_de_la_Selecci%C3%B3n_de_f%C3%BAtbol_de_Espa%C3%B1a.svg/32px-Escudo_de_la_Selecci%C3%B3n_de_f%C3%BAtbol_de_Espa%C3%B1a.svg.png",
    Italy:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/FIGC_Logo.svg/32px-FIGC_Logo.svg.png",
    Itália:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/FIGC_Logo.svg/32px-FIGC_Logo.svg.png",
    England:
      "https://upload.wikimedia.org/wikipedia/en/thumb/e/e3/England_crest_2009.svg/32px-England_crest_2009.svg.png",
    Inglaterra:
      "https://upload.wikimedia.org/wikipedia/en/thumb/e/e3/England_crest_2009.svg/32px-England_crest_2009.svg.png",
    Portugal:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Portuguese_Football_Federation.svg/32px-Portuguese_Football_Federation.svg.png",
    Netherlands:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/KNVB_logo.svg/32px-KNVB_logo.svg.png",
    Holanda:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/KNVB_logo.svg/32px-KNVB_logo.svg.png",

    // Times internacionais principais
    "Real Madrid":
      "https://upload.wikimedia.org/wikipedia/en/thumb/5/56/Real_Madrid_CF.svg/32px-Real_Madrid_CF.svg.png",
    Barcelona:
      "https://upload.wikimedia.org/wikipedia/en/thumb/4/47/FC_Barcelona_%28crest%29.svg/32px-FC_Barcelona_%28crest%29.svg.png",
    "Manchester City":
      "https://upload.wikimedia.org/wikipedia/en/thumb/e/eb/Manchester_City_FC_badge.svg/32px-Manchester_City_FC_badge.svg.png",
    "Manchester United":
      "https://upload.wikimedia.org/wikipedia/en/thumb/7/7a/Manchester_United_FC_crest.svg/32px-Manchester_United_FC_crest.svg.png",
    Liverpool:
      "https://upload.wikimedia.org/wikipedia/en/thumb/0/0c/Liverpool_FC.svg/32px-Liverpool_FC.svg.png",
    Arsenal:
      "https://upload.wikimedia.org/wikipedia/en/thumb/5/53/Arsenal_FC.svg/32px-Arsenal_FC.svg.png",
    Chelsea:
      "https://upload.wikimedia.org/wikipedia/en/thumb/c/cc/Chelsea_FC.svg/32px-Chelsea_FC.svg.png",
    PSG: "https://upload.wikimedia.org/wikipedia/en/thumb/a/a7/Paris_Saint-Germain_F.C..svg/32px-Paris_Saint-Germain_F.C..svg.png",
    "Bayern Munich":
      "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg/32px-FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg.png",
    Juventus:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Juventus_FC_2017_logo.svg/32px-Juventus_FC_2017_logo.svg.png",
    "AC Milan":
      "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Logo_of_AC_Milan.svg/32px-Logo_of_AC_Milan.svg.png",
    Sevilla:
      "https://upload.wikimedia.org/wikipedia/en/thumb/3/3b/Sevilla_FC_logo.svg/32px-Sevilla_FC_logo.svg.png",
    "Elche CF":
      "https://upload.wikimedia.org/wikipedia/en/thumb/1/1d/Elche_CF_logo.svg/32px-Elche_CF_logo.svg.png",
    Elche:
      "https://upload.wikimedia.org/wikipedia/en/thumb/1/1d/Elche_CF_logo.svg/32px-Elche_CF_logo.svg.png",
  };

  return (
    teamLogos[teamName] ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      teamName
    )}&background=f0f9ff&color=0369a1&size=32&format=png&rounded=true&bold=true`
  );
}

// Função para logo de fallback (caso a imagem não carregue)
function getFallbackLogo(teamName) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    teamName.substring(0, 2)
  )}&background=e2e8f0&color=475569&size=50&format=png&rounded=true&bold=true`;
}

// Função para processar e exibir dados da API
function processApiData(apiData) {
  return apiData.map((league) => ({
    league: league.sportInfo.name,
    icon: league.sportInfo.icon,
    flagUrl: league.sportInfo.flagUrl, // Adiciona a URL da bandeira
    games: league.games.map((game) => {
      const gameTime = new Date(game.commence_time);
      const timeString = gameTime.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      });

      const dayOfMonth = gameTime.getDate().toString().padStart(2, "0");
      const monthName = gameTime.toLocaleDateString("pt-BR", {
        month: "short",
      });
      const dateString = `${dayOfMonth} ${monthName}`;

      const homeTeam = game.home_team;
      const awayTeam = game.away_team;

      const processedOdds = game.bookmakers
        .slice(0, 1)
        .map((bookmaker) => {
          const bookmakerInfo = BOOKMAKER_MAP[bookmaker.key] || {
            name: bookmaker.title,
            logo: "🏪",
          };

          const h2hMarket = bookmaker.markets.find((m) => m.key === "h2h");
          if (!h2hMarket) return null;

          const outcomes = h2hMarket.outcomes;
          const homeOdd =
            outcomes.find((o) => o.name === homeTeam)?.price?.toFixed(2) ||
            "N/A";
          const awayOdd =
            outcomes.find((o) => o.name === awayTeam)?.price?.toFixed(2) ||
            "N/A";

          let drawOdd = "N/A";
          if (league.sportInfo.hasDraws) {
            const drawOutcome = outcomes.find((o) => o.name === "Draw");
            drawOdd = drawOutcome?.price?.toFixed(2) || "N/A";
          }

          return {
            bookmaker: bookmakerInfo.name,
            logo: bookmakerInfo.logo,
            home: homeOdd,
            draw: league.sportInfo.hasDraws ? drawOdd : "-",
            away: awayOdd,
          };
        })
        .filter(Boolean);

      return {
        time: timeString,
        date: dateString,
        homeTeam: homeTeam,
        awayTeam: awayTeam,
        homeIcon: getTeamIcon(homeTeam),
        awayIcon: getTeamIcon(awayTeam),
        status: gameTime > new Date() ? "upcoming" : "live",
        odds: processedOdds,
        hasDraws: league.sportInfo.hasDraws,
      };
    }),
  }));
}

// Função para gerar ícones de times
// SUBSTITUIR sua função getTeamIcon por esta:
function getTeamIcon(teamName) {
  // Retorna uma imagem HTML em vez de emoji
  return `<img src="${getTeamLogo(
    teamName
  )}" alt="${teamName}" class="team-logo" onerror="this.src='${getFallbackLogo(
    teamName
  )}'">`;
}

// Função para gerar dados simulados (fallback)
function generateMockGamesData() {
  return [
    {
      league: "Premier League",
      icon: "🇬🇧",
      games: [
        {
          time: "16:30",
          homeTeam: "Manchester City",
          awayTeam: "Arsenal",
          homeIcon: "💙",
          awayIcon: "🔴",
          status: "upcoming",
          hasDraws: true,
          odds: [
            {
              bookmaker: "Bet365",
              logo: "🎯",
              home: "1.85",
              draw: "3.60",
              away: "4.20",
            },
            {
              bookmaker: "Betano",
              logo: "🔥",
              home: "1.88",
              draw: "3.55",
              away: "4.15",
            },
          ],
        },
      ],
    },
    {
      league: "NBA",
      icon: "🏀",
      games: [
        {
          time: "21:00",
          homeTeam: "Lakers",
          awayTeam: "Warriors",
          homeIcon: "💜",
          awayIcon: "💙",
          status: "upcoming",
          hasDraws: false,
          odds: [
            {
              bookmaker: "Bet365",
              logo: "🎯",
              home: "1.95",
              draw: "-",
              away: "1.85",
            },
          ],
        },
      ],
    },
  ];
}

// Função para exibir os jogos na tela
function displayGames(leagues) {
  const container = document.getElementById("games-container");

  if (leagues.length === 0) {
    container.innerHTML = `
      <div class="no-games">
        <div class="no-games-icon">😴</div>
        <p>Nenhum jogo disponível no momento</p>
        <p style="font-size: 0.9rem; color: #666; margin-top: 10px;">
          Tente atualizar mais tarde ou verifique outros esportes
        </p>
      </div>
    `;
    return;
  }

  container.innerHTML = "";

  leagues.forEach((league) => {
    if (league.games.length === 0) return;

    const section = document.createElement("div");
    section.className = "games-section";

    // Limpar o nome da liga removendo códigos como "BR", "🇧🇷", etc.
    const cleanLeagueName = league.league
      .replace(/^[A-Z]{2,3}\s+/, "") // Remove códigos como "BR ", "ESP ", etc.
      .replace(/^🇧🇷\s+/, "") // Remove emoji brasileiro
      .replace(/^🇪🇸\s+/, "") // Remove emoji espanhol
      .replace(/^🇬🇧\s+/, "") // Remove emoji inglês
      .replace(/^🇮🇹\s+/, "") // Remove emoji italiano
      .replace(/^🇩🇪\s+/, "") // Remove emoji alemão
      .replace(/^🇫🇷\s+/, "") // Remove emoji francês
      .replace(/^🇦🇷\s+/, "") // Remove emoji argentino
      .replace(/^🇵🇹\s+/, "") // Remove emoji português
      .replace(/^🇳🇱\s+/, "") // Remove emoji holandês
      .replace(/^[\u{1F1E6}-\u{1F1FF}][\u{1F1E6}-\u{1F1FF}]\s+/u, "") // Remove qualquer bandeira emoji
      .trim();

    // Se tem URL da bandeira, usa APENAS a imagem + nome da liga limpo
    // Se não tem URL, usa APENAS o ícone + nome da liga limpo
    const leagueIconHtml = league.flagUrl
      ? `<img src="${league.flagUrl}" alt="${cleanLeagueName}" class="league-flag" onerror="this.outerHTML='<div class=\\"league-icon\\${league.icon}</div>`
      : `<div class="league-icon">${league.icon}</div>`;

    section.innerHTML = `
      <div class="league-title">
        ${leagueIconHtml}
        <span>${cleanLeagueName}</span>
      </div>
      <div class="games-grid">
        ${league.games.map((game) => createGameCard(game)).join("")}
      </div>
    `;

    container.appendChild(section);
  });

  // 🆕 LINHAS ADICIONADAS PARA INTEGRAÇÃO COM CARRINHO
  currentGames = leagues;
  allGames = convertLeaguesToGames(leagues);
  updateCartButtons();
}

// Função para criar card de jogo individual
function createGameCard(game) {
  const hasDraws = game.hasDraws !== false;

  if (game.odds.length === 0) {
    return `
      <div class="game-card" data-home="${game.homeTeam}" data-away="${
      game.awayTeam
    }">
        <div class="game-header">
          <div class="game-time">${game.time}</div>
          <div class="game-status status-${game.status}">
            ${game.status === "upcoming" ? "Em breve" : "🔴 Ao Vivo"}
          </div>
        </div>
        
        <div class="teams-container">
          <div class="team">
            <div class="team-logo">${game.homeIcon}</div>
            <span>${game.homeTeam}</span>
          </div>
          <div class="vs-divider">VS</div>
          <div class="team">
            <span>${game.awayTeam}</span>
            <div class="team-logo">${game.awayIcon}</div>
          </div>
        </div>
        
        <div class="game-actions">
          <button class="lineup-btn" onclick="showLineups('${
            game.homeTeam
          }', '${game.awayTeam}')">
            📋 Ver Escalação
          </button>
        </div>
        
        <div style="text-align: center; color: #666; padding: 20px;">
          Odds indisponíveis
        </div>
      </div>
    `;
  }

  return `
    <div class="game-card" data-home="${game.homeTeam}" data-away="${
    game.awayTeam
  }">
      <div class="game-header">
        <div>
          <div class="game-time">${game.time}</div>
          <div style="font-size: 0.8rem; color: #666;">${game.date || ""}</div>
        </div>
        <div class="game-status status-${game.status}">
          ${game.status === "upcoming" ? "Próximo" : "🔴 Ao Vivo"}
        </div>
      </div>
      
      <div class="teams-container">
        <div class="team">
          <div class="team-logo">${game.homeIcon}</div>
          <span>${game.homeTeam}</span>
        </div>
        <div class="vs-divider">VS</div>
        <div class="team">
          <span>${game.awayTeam}</span>
          <div class="team-logo">${game.awayIcon}</div>
        </div>
      </div>
      
      <div class="game-actions">
        <button class="lineup-btn" onclick="showLineups('${game.homeTeam}', '${
    game.awayTeam
  }')">
          📋 Ver Escalação
        </button>
      </div>
      
      <div class="odds-container">
        ${game.odds
          .map(
            (bookmaker) => `
          <div class="bookmaker">
            <div class="odds-grid" style="grid-template-columns: ${
              hasDraws ? "1fr 1fr 1fr" : "1fr 1fr"
            };">
              <div class="odd-button" onclick="addToCart('${game.homeTeam}-${
              game.awayTeam
            }', 'h2h', '${game.homeTeam}', '${bookmaker.home}', '${
              game.homeTeam
            }', '${game.awayTeam}', 'Liga')">
                <div class="odd-label">${game.homeTeam.split(" ")[0]}</div>
                <div class="odd-value">${bookmaker.home}</div>
              </div>
              ${
                hasDraws
                  ? `
                <div class="odd-button" onclick="addToCart('${game.homeTeam}-${game.awayTeam}', 'h2h', 'Empate', '${bookmaker.draw}', '${game.homeTeam}', '${game.awayTeam}', 'Liga')">
                  <div class="odd-label">Empate</div>
                  <div class="odd-value">${bookmaker.draw}</div>
                </div>
              `
                  : ""
              }
              <div class="odd-button" onclick="addToCart('${game.homeTeam}-${
              game.awayTeam
            }', 'h2h', '${game.awayTeam}', '${bookmaker.away}', '${
              game.homeTeam
            }', '${game.awayTeam}', 'Liga')">
                <div class="odd-label">${game.awayTeam.split(" ")[0]}</div>
                <div class="odd-value">${bookmaker.away}</div>
              </div>
            </div>
          </div>
        `
          )
          .join("")}
      </div>
    </div>
  `;
}

// Função para converter leagues em formato compatível com carrinho
function convertLeaguesToGames(leagues) {
  const games = [];
  leagues.forEach((league) => {
    league.games.forEach((game) => {
      games.push({
        id: `${game.homeTeam}-${game.awayTeam}-${Date.now()}-${Math.random()}`,
        home_team: game.homeTeam,
        away_team: game.awayTeam,
        gameTime: game.time,
        league: { name: league.league, flag: league.icon },
        bookmakers:
          game.odds && game.odds[0]
            ? [
                {
                  markets: [
                    {
                      key: "h2h",
                      name: "Resultado",
                      outcomes: [
                        {
                          name: game.homeTeam,
                          price: parseFloat(game.odds[0].home) || 2.0,
                        },
                        {
                          name: game.awayTeam,
                          price: parseFloat(game.odds[0].away) || 2.0,
                        },
                      ],
                    },
                  ],
                },
              ]
            : [],
      });
    });
  });
  return games;
}

// Função para atualizar botões do carrinho
function updateCartButtons() {
  document.querySelectorAll(".game-card").forEach((card) => {
    const homeTeam = card.getAttribute("data-home");
    const awayTeam = card.getAttribute("data-away");
    const gameId = `${homeTeam}-${awayTeam}`;

    // Verificar se alguma odd deste jogo está no carrinho
    const gameInCart = cart.some((item) => item.gameId === gameId);

    // Atualizar visual das odds se o jogo estiver no carrinho
    const oddButtons = card.querySelectorAll(".odd-button");
    oddButtons.forEach((btn) => {
      if (gameInCart) {
        // Verificar se esta odd específica está no carrinho
        const oddText = btn.querySelector(".odd-value").textContent;
        const labelText = btn.querySelector(".odd-label").textContent;

        const isThisOddInCart = cart.some(
          (item) =>
            item.gameId === gameId &&
            item.odd == parseFloat(oddText) &&
            (item.selection === labelText ||
              (item.selection === homeTeam &&
                labelText.includes(homeTeam.split(" ")[0])) ||
              (item.selection === awayTeam &&
                labelText.includes(awayTeam.split(" ")[0])) ||
              (item.selection === "Empate" && labelText === "Empate"))
        );

        if (isThisOddInCart) {
          btn.classList.add("selected");
        } else {
          btn.classList.remove("selected");
        }
      } else {
        btn.classList.remove("selected");
      }
    });
  });
}

// Função para selecionar uma odd
function selectOdd(element, team, odd) {
  if (odd === "N/A") return;

  const gameCard = element.closest(".game-card");
  gameCard.querySelectorAll(".odd-button").forEach((btn) => {
    btn.classList.remove("selected");
  });

  element.classList.add("selected");

  element.style.transform = "scale(0.95)";
  setTimeout(() => {
    element.style.transform = "";
  }, 150);

  showNotification(`${team} selecionado com odd ${odd}`);
}

// Função para mostrar notificação
function showNotification(message) {
  const notification = document.createElement("div");
  notification.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
          color: white;
          padding: 15px 20px;
          border-radius: 10px;
          font-weight: 600;
          z-index: 1000;
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
          transform: translateX(400px);
          transition: transform 0.3s ease;
        `;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.transform = "translateX(0)";
  }, 100);

  setTimeout(() => {
    notification.style.transform = "translateX(400px)";
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

// Função para mostrar status da API
function showApiStatus(isUsingRealData, message = "") {
  const statusDiv = document.getElementById("api-status");
  statusDiv.style.display = "block";

  if (isUsingRealData) {
    statusDiv.innerHTML = "✅ Dados atualizados via The Odds API";
    statusDiv.style.background = "#f0fff4";
    statusDiv.style.color = "#38a169";
    statusDiv.style.border = "1px solid #68d391";
  } else {
    statusDiv.innerHTML = `⚠️ ${
      message || "Usando dados simulados (API indisponível)"
    }`;
    statusDiv.style.background = "#fffaf0";
    statusDiv.style.color = "#d69e2e";
    statusDiv.style.border = "1px solid #f6e05e";
  }

  setTimeout(() => {
    statusDiv.style.display = "none";
  }, 8000);
}

// Função para atualizar botão de refresh
function updateRefreshButton(loading) {
  const btn = document.getElementById("refreshBtn");
  if (loading) {
    btn.disabled = true;
    btn.innerHTML = "⏳ Atualizando...";
  } else {
    btn.disabled = false;
    btn.innerHTML = "🔄 Atualizar Odds";
  }
}

// Função principal para carregar jogos
async function loadTodaysGamesWithStatus() {
  const container = document.getElementById("games-container");
  container.innerHTML = `
          <div class="loading-spinner">
            <div class="spinner"></div>
            Buscando jogos da API The Odds...
          </div>
        `;

  try {
    const realGames = await fetchRealOdds();
    const processedGames = processApiData(realGames);
    displayGames(processedGames);
    showApiStatus(true);
  } catch (error) {
    console.error("Erro ao carregar odds da API:", error);

    // Mostrar erro específico se possível
    let errorMessage = "API indisponível - usando dados simulados";
    if (error.message.includes("429")) {
      errorMessage = "Limite de requisições atingido - usando dados simulados";
    } else if (error.message.includes("401")) {
      errorMessage = "Chave da API inválida - usando dados simulados";
    } else if (error.message.includes("403")) {
      errorMessage = "Acesso negado à API - usando dados simulados";
    }

    // Fallback para dados simulados
    const mockGames = generateMockGamesData();
    displayGames(mockGames);
    showApiStatus(false, errorMessage);
  }
}

// Função para atualizar as odds
function refreshOdds() {
  if (isLoading) return;
  loadTodaysGamesWithStatus();
}

// Variável global para armazenar a data selecionada
let selectedDate = new Date();

// Função para criar o filtro de data
function createDateFilter() {
  return `
    <div class="date-filter-container">
      <div class="date-tabs">
        <button class="date-tab ${
          isToday() ? "active" : ""
        }" onclick="selectDate('today')">
          <div class="date-number">${new Date().getDate()}</div>
          <div class="date-label">Hoje</div>
        </button>
        <button class="date-tab ${
          isTomorrow() ? "active" : ""
        }" onclick="selectDate('tomorrow')">
          <div class="date-number">${new Date(
            Date.now() + 86400000
          ).getDate()}</div>
          <div class="date-label">Amanhã</div>
        </button>
        <button class="date-tab" onclick="selectDate('day_after')">
          <div class="date-number">${new Date(
            Date.now() + 2 * 86400000
          ).getDate()}</div>
          <div class="date-label">${getDayName(2)}</div>
        </button>
        <button class="date-tab" onclick="selectDate('custom')" id="custom-date-btn">
          <div class="date-icon">📅</div>
          <div class="date-label">Mais</div>
        </button>
      </div>
    </div>
  `;
}

// Função para verificar se é hoje
function isToday() {
  const today = new Date();
  return selectedDate.toDateString() === today.toDateString();
}

// Função para verificar se é amanhã
function isTomorrow() {
  const tomorrow = new Date(Date.now() + 86400000);
  return selectedDate.toDateString() === tomorrow.toDateString();
}

// Função para obter nome do dia
function getDayName(daysFromNow) {
  const date = new Date(Date.now() + daysFromNow * 86400000);
  const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  return days[date.getDay()];
}

// Função para selecionar data
function selectDate(dateType) {
  const tabs = document.querySelectorAll(".date-tab");
  tabs.forEach((tab) => tab.classList.remove("active"));

  let newDate;

  switch (dateType) {
    case "today":
      newDate = new Date();
      break;
    case "tomorrow":
      newDate = new Date(Date.now() + 86400000);
      break;
    case "day_after":
      newDate = new Date(Date.now() + 2 * 86400000);
      break;
    case "custom":
      showDatePicker();
      return;
  }

  selectedDate = newDate;

  // Atualizar visual do tab ativo
  event.target.closest(".date-tab").classList.add("active");

  // Recarregar jogos para a data selecionada
  filterGamesByDate();

  // Mostrar notificação da data selecionada
  const dateStr = newDate.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
  showNotification(`Jogos para ${dateStr} selecionados`);
}

// Função para mostrar seletor de data personalizado
function showDatePicker() {
  // Remover modal existente se houver
  const existingModal = document.getElementById("date-picker-modal");
  if (existingModal) {
    existingModal.remove();
  }

  const modal = document.createElement("div");
  modal.id = "date-picker-modal";
  modal.innerHTML = `
    <div class="modal-overlay" onclick="closeDatePicker()">
      <div class="modal-content" onclick="event.stopPropagation()">
        <div class="modal-header">
          <h3>Selecionar Data</h3>
          <button class="close-btn" onclick="closeDatePicker()">×</button>
        </div>
        <div class="modal-body">
          <input type="date" id="date-input" />
          <div class="quick-dates">
            <button onclick="selectQuickDate(0)">Hoje</button>
            <button onclick="selectQuickDate(1)">Amanhã</button>
            <button onclick="selectQuickDate(2)">Depois de Amanhã</button>
            <button onclick="selectQuickDate(7)">Próxima Semana</button>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" onclick="closeDatePicker()">Cancelar</button>
          <button class="btn-confirm" onclick="confirmDateSelection()">Confirmar</button>
        </div>
      </div>
    </div>
  `;

  // Adicionar estilos do modal
  const modalStyles = `
    <style>
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
      animation: fadeIn 0.2s ease;
    }

    .modal-content {
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 25px rgba(0, 0, 0, 0.1);
      max-width: 400px;
      width: 90%;
      max-height: 80vh;
      overflow: hidden;
      animation: slideIn 0.3s ease;
    }

    .modal-header {
      padding: 20px;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .modal-header h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: #64748b;
      padding: 0;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .close-btn:hover {
      background: #f1f5f9;
    }

    .modal-body {
      padding: 20px;
    }

    #date-input {
      width: 100%;
      padding: 12px;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      font-size: 16px;
      margin-bottom: 20px;
    }

    #date-input:focus {
      outline: none;
      border-color: #3b82f6;
    }

    .quick-dates {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    .quick-dates button {
      padding: 10px 15px;
      border: 1px solid #e2e8f0;
      background: white;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s ease;
    }

    .quick-dates button:hover {
      background: #f8fafc;
      border-color: #3b82f6;
    }

    .modal-footer {
      padding: 20px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      gap: 10px;
      justify-content: flex-end;
    }

    .btn-cancel, .btn-confirm {
      padding: 10px 20px;
      border-radius: 6px;
      border: none;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-cancel {
      background: #f1f5f9;
      color: #475569;
    }

    .btn-cancel:hover {
      background: #e2e8f0;
    }

    .btn-confirm {
      background: #3b82f6;
      color: white;
    }

    .btn-confirm:hover {
      background: #2563eb;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideIn {
      from { transform: translateY(-20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    </style>
  `;

  document.head.insertAdjacentHTML("beforeend", modalStyles);
  document.body.appendChild(modal);

  // Configurar o input de data
  const dateInput = document.getElementById("date-input");
  const today = new Date();
  const maxDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

  dateInput.min = today.toISOString().split("T")[0];
  dateInput.max = maxDate.toISOString().split("T")[0];
  dateInput.value = selectedDate.toISOString().split("T")[0];

  // Focar no input
  setTimeout(() => dateInput.focus(), 100);
}

// Função para fechar o modal
function closeDatePicker() {
  const modal = document.getElementById("date-picker-modal");
  if (modal) {
    modal.remove();
  }
}

// Função para selecionar data rápida
function selectQuickDate(daysFromNow) {
  const date = new Date(Date.now() + daysFromNow * 24 * 60 * 60 * 1000);
  document.getElementById("date-input").value = date
    .toISOString()
    .split("T")[0];
}

// Função para confirmar seleção de data
function confirmDateSelection() {
  const dateInput = document.getElementById("date-input");
  if (dateInput.value) {
    selectedDate = new Date(dateInput.value + "T00:00:00");
    updateCustomDateTab();
    filterGamesByDate();
    closeDatePicker();
  }
}

// Função para atualizar o tab de data personalizada
function updateCustomDateTab() {
  const customBtn = document.getElementById("custom-date-btn");
  const dateNumber = selectedDate.getDate();
  const dayName = selectedDate.toLocaleDateString("pt-BR", {
    weekday: "short",
  });

  customBtn.innerHTML = `
    <div class="date-number">${dateNumber}</div>
    <div class="date-label">${dayName}</div>
  `;

  // Remover classe active de todos os tabs
  document
    .querySelectorAll(".date-tab")
    .forEach((tab) => tab.classList.remove("active"));
  customBtn.classList.add("active");
}

// Função para filtrar jogos por data
function filterGamesByDate() {
  // Esta função integrará com sua API existente
  // Por now, vamos simular o comportamento
  console.log("Filtrando jogos para:", selectedDate.toDateString());

  // Recarregar jogos com a nova data
  loadGamesForDate(selectedDate);
}

// Função para carregar jogos para uma data específica
async function loadGamesForDate(date) {
  const container = document.getElementById("games-container");
  container.innerHTML = `
    <div class="loading-spinner">
      <div class="spinner"></div>
      Buscando jogos para ${date.toLocaleDateString("pt-BR")}...
    </div>
  `;

  try {
    // Aqui você integraria com sua API existente
    // passando a data como parâmetro
    const realGames = await fetchRealOddsForDate(date);
    const processedGames = processApiData(realGames);
    displayGames(processedGames);

    showFilterStatus(
      `Jogos de ${date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
      })}`
    );
  } catch (error) {
    console.error("Erro ao carregar odds para a data:", error);

    // Fallback para dados simulados
    const mockGames = generateMockGamesForDate(date);
    displayGames(mockGames);
    showFilterStatus(
      `Simulação - ${date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
      })}`
    );
  }
}

// Função para buscar odds para uma data específica (substitui fetchRealOdds)
async function fetchRealOddsForDate(date) {
  if (isLoading) return;

  try {
    isLoading = true;
    updateRefreshButton(true);

    const sportsResponse = await fetch(
      `${API_BASE_URL}/sports?apiKey=${API_KEY}`
    );

    if (!sportsResponse.ok) {
      throw new Error(`Erro na API: ${sportsResponse.status}`);
    }

    const sports = await sportsResponse.json();
    const availableSports = sports.filter(
      (sport) => SPORTS_MAP[sport.key] && sport.active
    );

    if (availableSports.length === 0) {
      throw new Error("Nenhum esporte disponível no momento");
    }

    const allGames = [];
    const regions = "us,uk,eu";
    const markets = "h2h";

    for (const sport of availableSports) {
      try {
        const oddsResponse = await fetch(
          `${API_BASE_URL}/sports/${sport.key}/odds?apiKey=${API_KEY}&regions=${regions}&markets=${markets}&oddsFormat=decimal&dateFormat=iso`
        );

        if (oddsResponse.ok) {
          const oddsData = await oddsResponse.json();

          // Filtrar jogos pela data selecionada
          const filteredGames = oddsData.filter((game) => {
            const gameDate = new Date(game.commence_time);
            return gameDate.toDateString() === date.toDateString();
          });

          if (filteredGames.length > 0) {
            allGames.push({
              sport: sport.key,
              sportInfo: SPORTS_MAP[sport.key],
              games: filteredGames,
            });
          }
        }
      } catch (error) {
        console.error(`Erro ao buscar odds para ${sport.key}:`, error);
      }
    }

    return allGames;
  } catch (error) {
    console.error("Erro ao buscar dados da API:", error);
    throw error;
  } finally {
    isLoading = false;
    updateRefreshButton(false);
  }
}

// Função para mostrar status do filtro (substitui showApiStatus)
function showFilterStatus(message) {
  const statusDiv = document.getElementById("api-status");
  if (!statusDiv) return;

  statusDiv.style.display = "block";
  statusDiv.innerHTML = `📅 ${message}`;
  statusDiv.style.background = "#f0f9ff";
  statusDiv.style.color = "#0369a1";
  statusDiv.style.border = "1px solid #7dd3fc";

  setTimeout(() => {
    statusDiv.style.display = "none";
  }, 3000);
}

// Função para gerar dados mockados para uma data específica
function generateMockGamesForDate(date) {
  const dateStr = date.toLocaleDateString("pt-BR");

  return [
    {
      league: "Premier League",
      icon: "🇬🇧",
      games: [
        {
          time: "16:30",
          date: `${date
            .getDate()
            .toString()
            .padStart(2, "0")} ${date.toLocaleDateString("pt-BR", {
            month: "short",
          })}`,
          homeTeam: "Manchester City",
          awayTeam: "Arsenal",
          homeIcon: "💙",
          awayIcon: "🔴",
          status: "upcoming",
          hasDraws: true,
          odds: [
            {
              bookmaker: "Bet365",
              logo: "🎯",
              home: "1.85",
              draw: "3.60",
              away: "4.20",
            },
          ],
        },
      ],
    },
  ];
}

// CSS para o filtro de data
const dateFilterCSS = `
<style>
.date-filter-container {
  margin: 20px 0;
  padding: 0 20px;
}

.date-tabs {
  display: flex;
  gap: 8px;
  background: #f8fafc;
  padding: 8px;
  border-radius: 12px;
  overflow-x: auto;
}

.date-tab {
  background: transparent;
  border: none;
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 60px;
  text-align: center;
}

.date-tab:hover {
  background: #e2e8f0;
}

.date-tab.active {
  background: #3b82f6;
  color: white;
}

.date-number {
  font-size: 18px;
  font-weight: 600;
  line-height: 1;
}

.date-label {
  font-size: 12px;
  margin-top: 2px;
  opacity: 0.8;
}

.date-icon {
  font-size: 18px;
  line-height: 1;
}

@media (max-width: 768px) {
  .date-tabs {
    gap: 4px;
    padding: 4px;
  }
  
  .date-tab {
    padding: 8px 12px;
    min-width: 50px;
  }
  
  .date-number {
    font-size: 16px;
  }
  
  .date-label {
    font-size: 10px;
  }
}
</style>
`;

// Inicialização do filtro de data
document.addEventListener("DOMContentLoaded", function () {
  // Adicionar CSS
  document.head.insertAdjacentHTML("beforeend", dateFilterCSS);

  // Substituir o elemento de status da API pelo filtro de data
  const apiStatus = document.getElementById("api-status");
  if (apiStatus) {
    apiStatus.outerHTML = createDateFilter();
  } else {
    // Se não existir, criar antes do container de jogos
    const gamesContainer = document.getElementById("games-container");
    if (gamesContainer) {
      gamesContainer.insertAdjacentHTML("beforebegin", createDateFilter());
    }
  }

  // Carregar jogos de hoje inicialmente
  loadGamesForDate(selectedDate);
});

// Inicializar a aplicação
document.addEventListener("DOMContentLoaded", function () {
  loadTodaysGamesWithStatus();
  addFootballFieldCSS();

  // Auto-refresh a cada 5 minutos
  setInterval(() => {
    if (!isLoading) {
      loadTodaysGamesWithStatus();
    }
  }, 300000); // 5 minutos
});

// Variáveis para o carrinho
let cart = [];
let savedTickets = JSON.parse(localStorage.getItem("savedTickets")) || [];
let currentGames = [];
let allGames = []; // Para compatibilidade com o código do carrinho

// Inicializar carrinho ao carregar a página
document.addEventListener("DOMContentLoaded", function () {
  updateCartButton();
  updateSavedCount();
});

// Atualizar a função de renderizar jogos para incluir botão de carrinho
function renderGames(games) {
  const container = document.getElementById("gamesContainer");

  if (games.length === 0) {
    container.innerHTML = `
      <div class="no-games">
        <div class="no-games-icon">⚽</div>
        <h3>Nenhum jogo encontrado</h3>
        <p>Ajuste os filtros ou tente novamente mais tarde</p>
      </div>
    `;
    return;
  }

  container.innerHTML = games
    .map((game) => {
      const isInCart = cart.some((item) => item.id === game.id);

      return `
      <div class="game-card">
        <div class="game-header">
          <div class="game-league">
            <span class="league-flag">${game.league.flag}</span>
            <span class="league-name">${game.league.name}</span>
          </div>
          <div class="game-time">${game.gameTime}</div>
        </div>
        
        <div class="game-teams">
          <div class="team">${game.home_team}</div>
          <div class="vs">vs</div>
          <div class="team">${game.away_team}</div>
        </div>
        
        <div class="game-markets">
          ${game.markets
            .map(
              (market) => `
            <div class="market">
              <div class="market-name">${market.name}</div>
              <div class="market-odds">
                ${market.outcomes
                  .map(
                    (outcome) => `
                  <button class="odd-button" onclick="addToCart('${game.id}', '${market.name}', '${outcome.name}', ${outcome.price}, '${game.home_team}', '${game.away_team}', '${game.league.name}')">
                    <span class="outcome-name">${outcome.name}</span>
                    <span class="outcome-price">${outcome.price}</span>
                  </button>
                `
                  )
                  .join("")}
              </div>
            </div>
          `
            )
            .join("")}
        </div>
        
        <button class="add-to-cart ${isInCart ? "added" : ""}" 
                onclick="${
                  isInCart
                    ? `removeFromCart('${game.id}')`
                    : `quickAddToCart('${game.id}', '${game.home_team}', '${game.away_team}', '${game.league.name}')`
                }">
          ${isInCart ? "❌ Remover do Bilhete" : "🛒 Adicionar ao Bilhete"}
        </button>
      </div>
    `;
    })
    .join("");
}

// Adicionar jogo específico ao carrinho
function addToCart(
  gameId,
  marketName,
  outcomeName,
  price,
  homeTeam,
  awayTeam,
  league
) {
  const existingIndex = cart.findIndex(
    (item) => item.gameId === gameId && item.marketName === marketName
  );

  if (existingIndex > -1) {
    cart[existingIndex] = {
      id: `${gameId}-${marketName}`,
      gameId: gameId,
      match: `${homeTeam} vs ${awayTeam}`,
      league: league,
      marketName: marketName,
      selection: outcomeName,
      odd: price,
      addedAt: new Date().toLocaleString(),
    };
  } else {
    cart.push({
      id: `${gameId}-${marketName}`,
      gameId: gameId,
      match: `${homeTeam} vs ${awayTeam}`,
      league: league,
      marketName: marketName,
      selection: outcomeName,
      odd: price,
      addedAt: new Date().toLocaleString(),
    });
  }

  updateCartButton();
  showNotification(`${outcomeName} adicionado ao bilhete!`);
}

// Adicionar jogo rápido (primeira odd disponível)
function quickAddToCart(gameId, homeTeam, awayTeam, league) {
  // Encontrar o jogo nos dados
  const game = allGames.find((g) => g.id === gameId);
  if (
    !game ||
    !game.bookmakers ||
    !game.bookmakers[0] ||
    !game.bookmakers[0].markets
  )
    return;

  const firstMarket = game.bookmakers[0].markets[0];
  const firstOutcome = firstMarket.outcomes[0];

  addToCart(
    gameId,
    firstMarket.key,
    firstOutcome.name,
    firstOutcome.price,
    homeTeam,
    awayTeam,
    league
  );
  renderGames(currentGames); // Re-renderizar para atualizar botões
}

// Remover do carrinho
function removeFromCart(gameId) {
  cart = cart.filter((item) => item.gameId !== gameId);
  updateCartButton();
  renderGames(currentGames);
  updateCartContent();
  showNotification("Jogo removido do bilhete!");
}

// Atualizar botão do carrinho
function updateCartButton() {
  const cartButton = document.getElementById("cartButton");
  cartButton.textContent = `🛒 Bilhete (${cart.length})`;
}

// Toggle carrinho
function toggleCart() {
  const modal = document.getElementById("cartModal");
  modal.style.display = "block";
  updateCartContent();
}

// Fechar carrinho
function closeCart() {
  document.getElementById("cartModal").style.display = "none";
}

// Atualizar conteúdo do carrinho
// Na função updateCartContent, modificar a seção cart-actions
function updateCartContent() {
  const cartContent = document.getElementById("cartContent");
  const totalGames = document.getElementById("totalGames");
  const combinedOdd = document.getElementById("combinedOdd");

  if (cart.length === 0) {
    cartContent.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty-icon">🛒</div>
        <h3>Seu bilhete está vazio</h3>
        <p>Clique nas odds dos jogos para adicionar ao seu bilhete de apostas</p>
      </div>
    `;
    totalGames.textContent = "0";
    combinedOdd.textContent = "1.00";
    return;
  }

  cartContent.innerHTML = cart
    .map(
      (item) => `
    <div class="cart-item">
      <div class="cart-item-info">
        <div class="cart-item-title">${item.match}</div>
        <div class="cart-item-details">
          <span class="cart-league">${item.league}</span>
          <span class="cart-market">${item.marketName}</span>
          <span class="cart-selection">${item.selection}</span>
        </div>
      </div>
      <div class="cart-item-odd">${item.odd}</div>
      <button class="remove-from-cart" onclick="removeFromCartModal('${item.id}')" title="Remover aposta">×</button>
    </div>
  `
    )
    .join("");

  totalGames.textContent = cart.length;

  const combined = cart.reduce((acc, item) => acc * item.odd, 1);
  combinedOdd.textContent = combined.toFixed(2);
}

// Remover do carrinho via modal
function removeFromCartModal(itemId) {
  cart = cart.filter((item) => item.id !== itemId);
  updateCartButton();
  updateCartContent();
  renderGames(currentGames);
}

// Limpar carrinho
function clearCart() {
  cart = [];
  updateCartButton();
  updateCartContent();
  renderGames(currentGames);
  showNotification("Bilhete limpo!");
}

// Salvar bilhete
function saveTicket() {
  if (cart.length === 0) {
    alert("Adicione jogos ao bilhete antes de salvar!");
    return;
  }

  const ticketName =
    prompt("Nome do bilhete (opcional):") ||
    `Bilhete ${savedTickets.length + 1}`;

  const ticket = {
    id: Date.now(),
    name: ticketName,
    games: [...cart],
    combinedOdd: cart.reduce((acc, item) => acc * item.odd, 1).toFixed(2),
    createdAt: new Date().toLocaleString(),
    gamesCount: cart.length,
  };

  savedTickets.push(ticket);
  localStorage.setItem("savedTickets", JSON.stringify(savedTickets));

  updateSavedCount();
  closeCart();
  clearCart();

  showNotification(`Bilhete "${ticketName}" salvo com sucesso!`);
}

// Mostrar bilhetes salvos
function showSavedTickets() {
  const modal = document.getElementById("savedTicketsModal");
  const content = document.getElementById("savedTicketsContent");

  if (savedTickets.length === 0) {
    content.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📋</div>
        <h3>Nenhum bilhete salvo</h3>
        <p>Crie e salve bilhetes para acessá-los depois</p>
      </div>
    `;
  } else {
    content.innerHTML = savedTickets
      .map(
        (ticket) => `
      <div class="saved-ticket-card">
        <div class="ticket-header">
          <div class="ticket-info">
            <h4 class="ticket-title">${ticket.name}</h4>
            <span class="ticket-date">${ticket.createdAt}</span>
          </div>
          <div class="ticket-stats">
            <div class="stat-item">
              <span class="stat-label">Jogos</span>
              <span class="stat-value">${ticket.gamesCount}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Odd</span>
              <span class="stat-value">${ticket.combinedOdd}</span>
            </div>
          </div>
        </div>
        
        <div class="ticket-games">
          ${ticket.games
            .map(
              (game) => `
            <div class="game-row">
              <div class="game-match">${game.match}</div>
              <div class="game-selection">
                <span class="selection-name">${game.selection}</span>
                <span class="selection-odd">${game.odd}</span>
              </div>
            </div>
          `
            )
            .join("")}
        </div>
        
        <div class="ticket-actions">
          <button class="btn-action btn-load" onclick="loadTicket(${
            ticket.id
          })">
            <span class="btn-icon">⚡</span>
            Carregar
          </button>
          <button class="btn-action btn-copy" onclick="exportSavedTicket(${
            ticket.id
          })">
            <span class="btn-icon">📋</span>
            Copiar
          </button>
          <button class="btn-action btn-betano" onclick="loadAndRedirect(${
            ticket.id
          })">
            <span class="btn-icon">🎯</span>
            Betano
          </button>
          <button class="btn-action btn-delete" onclick="deleteTicket(${
            ticket.id
          })">
            <span class="btn-icon">🗑️</span>
            Excluir
          </button>
        </div>
      </div>
    `
      )
      .join("");
  }

  modal.style.display = "block";
}

// Exportar bilhete atual
function exportTicket() {
  if (cart.length === 0) {
    showNotification("Carrinho vazio!");
    return;
  }

  const ticketText = cart
    .map((item) => `${item.match} - ${item.selection} @${item.odd}`)
    .join("\n");

  const fullText = `BILHETE DE APOSTAS:\n\n${ticketText}\n\nOdd Total: ${cart
    .reduce((acc, item) => acc * item.odd, 1)
    .toFixed(2)}`;

  navigator.clipboard
    .writeText(fullText)
    .then(() => {
      showNotification("Bilhete copiado para área de transferência!");
    })
    .catch(() => {
      // Fallback para navegadores mais antigos
      const textArea = document.createElement("textarea");
      textArea.value = fullText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      showNotification("Bilhete copiado!");
    });
}

// Exportar bilhete salvo
function exportSavedTicket(ticketId) {
  const ticket = savedTickets.find((t) => t.id === ticketId);
  if (!ticket) return;

  const ticketText = ticket.games
    .map((game) => `${game.match} - ${game.selection} @${game.odd}`)
    .join("\n");

  const fullText = `BILHETE: ${ticket.name}\n\n${ticketText}\n\nOdd Total: ${ticket.combinedOdd}`;

  navigator.clipboard
    .writeText(fullText)
    .then(() => {
      showNotification(`Bilhete "${ticket.name}" copiado!`);
    })
    .catch(() => {
      const textArea = document.createElement("textarea");
      textArea.value = fullText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      showNotification(`Bilhete "${ticket.name}" copiado!`);
    });
}

// Redirecionar para Betano
// Substituir sua função redirectToBetano existente por esta:
function redirectToBetano() {
  if (cart.length === 0) {
    window.open("https://www.betano.bet.br/sport/", "_blank");
    showNotification("Betano aberta! Carrinho vazio.");
    return;
  }

  const instructions = `INSTRUÇÕES PARA GERAR LINK DO BILHETE:

1. Acesse: https://www.betano.bet.br/sport/futebol/
2. Monte seu bilhete com estas apostas:

${cart
  .map((item) => `• ${item.match} - ${item.selection} @${item.odd}`)
  .join("\n")}

3. Após montar, clique em "Compartilhar bilhete"
4. Copie o link gerado (bookingcode/XXXXX)
5. Salve esse link para compartilhar sua aposta!

Odd total esperada: ${cart
    .reduce((acc, item) => acc * item.odd, 1)
    .toFixed(2)}`;

  // Copiar instruções
  navigator.clipboard.writeText(instructions);

  // Abrir Betano
  window.open("https://www.betano.bet.br/sport/futebol/", "_blank");

  showNotification(
    "Instruções copiadas! Monte o bilhete na Betano e gere o código de compartilhamento."
  );
}

// Carregar bilhete e redirecionar para Betano
// Substituir sua função loadAndRedirect existente por esta:
function loadAndRedirect(ticketId) {
  const ticket = savedTickets.find((t) => t.id === ticketId);
  if (!ticket) return;

  const instructions = `INSTRUÇÕES PARA GERAR LINK DO BILHETE: ${ticket.name}

1. Acesse: https://www.betano.bet.br/sport/futebol/
2. Monte seu bilhete com estas apostas:

${ticket.games
  .map((game) => `• ${game.match} - ${game.selection} @${game.odd}`)
  .join("\n")}

3. Após montar, clique em "Compartilhar bilhete"
4. Copie o link gerado (bookingcode/XXXXX)

Odd total: ${ticket.combinedOdd}`;

  navigator.clipboard.writeText(instructions);
  window.open("https://www.betano.bet.br/sport/futebol/", "_blank");
  showNotification(`Instruções do bilhete "${ticket.name}" copiadas!`);
}

// Fechar bilhetes salvos
function closeSavedTickets() {
  document.getElementById("savedTicketsModal").style.display = "none";
}

// Carregar bilhete
function loadTicket(ticketId) {
  const ticket = savedTickets.find((t) => t.id === ticketId);
  if (!ticket) return;

  // Carregar os jogos do bilhete para o carrinho atual
  cart = [...ticket.games];

  // Atualizar interface do carrinho
  updateCartButton();
  updateCartButtons();

  // Fechar modal de bilhetes salvos
  closeSavedTickets();

  // Abrir o carrinho para mostrar os jogos carregados
  toggleCart();

  showNotification(
    `Bilhete "${ticket.name}" carregado com ${ticket.games.length} jogos!`
  );
}

// Excluir bilhete
function deleteTicket(ticketId) {
  if (!confirm("Tem certeza que deseja excluir este bilhete?")) return;

  savedTickets = savedTickets.filter((t) => t.id !== ticketId);
  localStorage.setItem("savedTickets", JSON.stringify(savedTickets));

  updateSavedCount();
  showSavedTickets(); // Refresh da lista

  showNotification("Bilhete excluído!");
}

// Atualizar contador de bilhetes salvos
function updateSavedCount() {
  document.getElementById("savedCount").textContent = savedTickets.length;
}

// Notificação
function showNotification(message) {
  const notification = document.createElement("div");
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #48bb78, #38a169);
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    z-index: 10000;
    font-weight: 600;
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    animation: slideIn 0.3s ease;
  `;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => notification.remove(), 3000);
}

// Fechar modais ao clicar fora
window.onclick = function (event) {
  const cartModal = document.getElementById("cartModal");
  const savedModal = document.getElementById("savedTicketsModal");

  if (event.target === cartModal) {
    closeCart();
  }
  if (event.target === savedModal) {
    closeSavedTickets();
  }
};

async function getTeamData(teamName) {
  try {
    // Mapear nome do time para ID da API (você pode expandir este mapeamento)
    const teamMapping = {
      "Manchester City": 65,
      Arsenal: 57,
      Chelsea: 61,
      Liverpool: 64,
      "Manchester United": 66,
      Tottenham: 73,
      // Adicione mais times conforme necessário
    };

    const teamId = teamMapping[teamName];

    if (!teamId) {
      // Se não tiver o ID mapeado, retornar dados simulados
      return generateMockTeamData(teamName);
    }

    const headers = {
      "X-Auth-Token": FOOTBALL_DATA_API_KEY,
    };

    // Buscar informações básicas do time
    const teamResponse = await fetch(
      `https://cors-anywhere.herokuapp.com/${FOOTBALL_DATA_BASE_URL}/teams/${teamId}`,
      { headers }
    );

    const teamData = await teamResponse.json();

    // Buscar últimas partidas
    const matchesResponse = await fetch(
      `${FOOTBALL_DATA_BASE_URL}/teams/${teamId}/matches?limit=5`,
      { headers }
    );
    const matchesData = await matchesResponse.json();

    return {
      name: teamData.name,
      squad: teamData.squad || [],
      recentMatches: matchesData.matches || [],
      injuries: [], // A API gratuita não tem lesões, simularemos
    };
  } catch (error) {
    console.error(`Erro ao buscar dados do ${teamName}:`, error);
    return generateMockTeamData(teamName);
  }
}

async function getTeamDataFromAPI(teamName) {
  const teamId = TEAM_ID_MAP[teamName];

  if (!teamId) {
    throw new Error(`Time ${teamName} não encontrado no mapeamento da API`);
  }

  const headers = {
    "X-Auth-Token": FOOTBALL_DATA_API_KEY,
  };

  try {
    // Buscar informações do time
    const teamResponse = await fetch(
      `${FOOTBALL_DATA_BASE_URL}/teams/${teamId}`,
      { headers }
    );

    if (!teamResponse.ok) {
      if (teamResponse.status === 429) {
        throw new Error("Limite de requisições excedido (10/min)");
      }
      if (teamResponse.status === 403) {
        throw new Error("Acesso negado - verifique a chave da API");
      }
      throw new Error(`Erro HTTP ${teamResponse.status}`);
    }

    const teamData = await teamResponse.json();

    // Buscar últimas partidas
    const matchesResponse = await fetch(
      `${FOOTBALL_DATA_BASE_URL}/teams/${teamId}/matches?status=FINISHED&limit=5`,
      { headers }
    );
    let matchesData = { matches: [] };

    if (matchesResponse.ok) {
      matchesData = await matchesResponse.json();
    }

    return {
      name: teamData.name || teamName,
      squad: teamData.squad || [],
      recentMatches: matchesData.matches || [],
      injuries: [], // API gratuita não tem lesões
      venue: teamData.venue || {},
      founded: teamData.founded,
      colors: teamData.clubColors,
    };
  } catch (error) {
    console.error(`Erro ao buscar ${teamName}:`, error);
    throw error;
  }
}

// Função principal atualizada para mostrar escalações
async function showLineups(homeTeam, awayTeam) {
  const modal = document.getElementById("lineups-modal");
  const teamNames = document.getElementById("modal-team-names");
  const content = document.getElementById("lineups-content");

  if (!modal || !teamNames || !content) {
    console.error("Elementos do modal não encontrados");
    return;
  }

  teamNames.textContent = `${homeTeam} vs ${awayTeam}`;
  modal.style.display = "block";

  // Reset tabs
  currentTab = "lineups";
  document
    .querySelectorAll(".tab-btn")
    .forEach((btn) => btn.classList.remove("active"));
  const firstTab = document.querySelector(".tab-btn");
  if (firstTab) firstTab.classList.add("active");

  content.innerHTML = `
    <div class="loading-spinner">
      <div class="spinner"></div>
      <p>Buscando escalações da La Liga...</p>
    </div>
  `;

  try {
    // Fazer requisição para o backend hospedado
    const response = await fetch(`${BACKEND_BASE_URL}/teams/lineups`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        teamNames: [homeTeam, awayTeam],
      }),
    });

    if (!response.ok) {
      throw new Error(`Erro no servidor: ${response.status}`);
    }

    const data = await response.json();

    if (!data.teams || data.teams.length < 2) {
      throw new Error("Dados incompletos recebidos");
    }

    // Mostrar dados com tabs
    content.innerHTML = displayMatchTabs(data.teams[0], data.teams[1]);
    showNotification(`Escalações carregadas: ${data.source}`);
  } catch (error) {
    console.error("Erro ao carregar escalações:", error);

    let errorMsg = error.message;
    if (error.message.includes("Failed to fetch")) {
      errorMsg = "Erro de conexão. Verifique sua internet.";
    }

    content.innerHTML = `
      <div style="text-align: center; padding: 40px;">
        <div style="font-size: 48px; margin-bottom: 16px;">⚠️</div>
        <h4>Erro ao carregar escalações</h4>
        <p style="color: #666; margin-bottom: 16px;">${errorMsg}</p>
        <button onclick="showLineups('${homeTeam}', '${awayTeam}')" class="lineup-btn">
          🔄 Tentar Novamente
        </button>
      </div>
    `;
  }
}

function retryAPICall(homeTeam, awayTeam) {
  showLineups(homeTeam, awayTeam);
}

// Função auxiliar para obter classe CSS da posição
function getPositionClass(position) {
  const pos = position?.toLowerCase() || "";
  if (pos.includes("goalkeeper") || pos.includes("goleiro"))
    return "goalkeeper";
  if (
    pos.includes("defender") ||
    pos.includes("zagueiro") ||
    pos.includes("lateral")
  )
    return "defender";
  if (
    pos.includes("midfielder") ||
    pos.includes("meio") ||
    pos.includes("volante")
  )
    return "midfielder";
  if (
    pos.includes("forward") ||
    pos.includes("atacante") ||
    pos.includes("centroavante")
  )
    return "forward";
  return "midfielder";
}

// Função para fechar modal
function closeLineupsModal() {
  const modal = document.getElementById("lineups-modal");
  if (modal) {
    modal.style.display = "none";
  }
  lineupsCache = {};
}

// Fechar modal clicando fora
document.addEventListener("click", function (event) {
  const modal = document.getElementById("lineups-modal");
  if (event.target === modal) {
    closeLineupsModal();
  }
});

function displayForm(homeData, awayData) {
  const renderMatches = (team) => {
    if (!team.recentMatches || team.recentMatches.length === 0) {
      return '<div class="no-data">Sem dados de partidas recentes</div>';
    }

    return team.recentMatches
      .slice(0, 5)
      .map((match) => {
        const isHome = match.homeTeam.name === team.name;
        const opponent = isHome ? match.awayTeam.name : match.homeTeam.name;
        const homeScore = match.score?.fullTime?.homeTeam || 0;
        const awayScore = match.score?.fullTime?.awayTeam || 0;

        let result = "draw";
        if (isHome) {
          result =
            homeScore > awayScore
              ? "win"
              : homeScore < awayScore
              ? "loss"
              : "draw";
        } else {
          result =
            awayScore > homeScore
              ? "win"
              : awayScore < homeScore
              ? "loss"
              : "draw";
        }

        const resultText =
          result === "win" ? "V" : result === "draw" ? "E" : "D";

        return `
        <div class="form-match">
          <div class="match-info">
            <span>${isHome ? "vs" : "@"} ${opponent}</span>
            <span class="score">${homeScore}-${awayScore}</span>
            <span class="date">${new Date(match.utcDate).toLocaleDateString(
              "pt-BR"
            )}</span>
          </div>
          <div class="match-result ${result}">${resultText}</div>
        </div>
      `;
      })
      .join("");
  };

  return `
    <div class="lineups-container">
      <div class="team-lineup">
        <div class="team-name">🏠 ${homeData.name} - Últimos 5 Jogos</div>
        <div class="form-list">
          ${renderMatches(homeData)}
        </div>
      </div>
      
      <div class="team-lineup">
        <div class="team-name">✈️ ${awayData.name} - Últimos 5 Jogos</div>
        <div class="form-list">
          ${renderMatches(awayData)}
        </div>
      </div>
    </div>
  `;
}

// Função para exibir lesões
// Função para exibir lesões
function displayInjuries() {
  return `
    <div class="no-data">
      <div style="font-size: 48px; margin-bottom: 16px;">🏥</div>
      <h4>Dados de lesões não disponíveis</h4>
      <p>A API Football-data.org não fornece informações sobre lesões na versão gratuita.</p>
    </div>
  `;
}

// Função para organizar jogadores por posição melhorada
function organizePlayersByPosition(squad) {
  if (!squad || squad.length === 0) {
    return {
      goalkeepers: [],
      defenders: [],
      midfielders: [],
      wingers: [],
      forwards: [],
    };
  }

  const positionMap = {
    goalkeepers: ["Goalkeeper"],
    defenders: [
      "Centre-Back",
      "Left-Back",
      "Right-Back",
      "Left Centre-Back",
      "Right Centre-Back",
      "Defender",
    ],
    midfielders: [
      "Central Midfield",
      "Defensive Midfield",
      "Attacking Midfield",
      "Left Midfield",
      "Right Midfield",
      "Centre Midfield",
      "Midfielder",
    ],
    wingers: [
      "Left Winger",
      "Right Winger",
      "Left Wing-Back",
      "Right Wing-Back",
    ],
    forwards: [
      "Centre-Forward",
      "Left Centre-Forward",
      "Right Centre-Forward",
      "Second Striker",
      "Forward",
    ],
  };

  const organized = {
    goalkeepers: [],
    defenders: [],
    midfielders: [],
    wingers: [],
    forwards: [],
  };

  squad.forEach((player) => {
    let placed = false;
    for (const [category, positions] of Object.entries(positionMap)) {
      if (positions.includes(player.position)) {
        organized[category].push(player);
        placed = true;
        break;
      }
    }
    // Se não encontrar a posição, colocar como meio-campo por padrão
    if (!placed) {
      organized.midfielders.push(player);
    }
  });

  // Ordenar por número da camisa dentro de cada posição
  Object.keys(organized).forEach((key) => {
    organized[key].sort((a, b) => a.shirtNumber - b.shirtNumber);
  });

  return organized;
}

// Função principal para exibir escalações aprimorada
function displayLineups(homeData, awayData) {
  const homePositions = organizePlayersByPosition(homeData.squad);
  const awayPositions = organizePlayersByPosition(awayData.squad);

  return `
    <div class="lineups-header">
      <div class="team-header home-team">
        <div class="team-crest">
          <img src="${homeData.crest}" alt="${
    homeData.name
  }" onerror="this.style.display='none'">
        </div>
        <div class="team-info">
          <h3 class="team-name">🏠 ${homeData.name}</h3>
          <div class="team-stats">
            <span class="squad-size">Elenco: ${
              homeData.squad?.length || 0
            }</span>
            ${
              homeData.coach
                ? `<span class="coach">Técnico: ${homeData.coach.name}</span>`
                : ""
            }
          </div>
        </div>
      </div>
      
      <div class="vs-divider">
        <span class="vs-text">VS</span>
      </div>
      
      <div class="team-header away-team">
        <div class="team-info">
          <h3 class="team-name">✈️ ${awayData.name}</h3>
          <div class="team-stats">
            <span class="squad-size">Elenco: ${
              awayData.squad?.length || 0
            }</span>
            ${
              awayData.coach
                ? `<span class="coach">Técnico: ${awayData.coach.name}</span>`
                : ""
            }
          </div>
        </div>
        <div class="team-crest">
          <img src="${awayData.crest}" alt="${
    awayData.name
  }" onerror="this.style.display='none'">
        </div>
      </div>
    </div>

    <div class="lineups-container">
      <div class="team-lineup home-lineup">
        ${renderPositionGroup(
          "Goleiros",
          homePositions.goalkeepers,
          "goalkeeper"
        )}
        ${renderPositionGroup(
          "Defensores",
          homePositions.defenders,
          "defender"
        )}
        ${renderPositionGroup(
          "Meio-campistas",
          homePositions.midfielders,
          "midfielder"
        )}
        ${renderPositionGroup("Pontas", homePositions.wingers, "winger")}
        ${renderPositionGroup("Atacantes", homePositions.forwards, "forward")}
      </div>
      
      <div class="team-lineup away-lineup">
        ${renderPositionGroup(
          "Goleiros",
          awayPositions.goalkeepers,
          "goalkeeper"
        )}
        ${renderPositionGroup(
          "Defensores",
          awayPositions.defenders,
          "defender"
        )}
        ${renderPositionGroup(
          "Meio-campistas",
          awayPositions.midfielders,
          "midfielder"
        )}
        ${renderPositionGroup("Pontas", awayPositions.wingers, "winger")}
        ${renderPositionGroup("Atacantes", awayPositions.forwards, "forward")}
      </div>
    </div>
    
    <div class="info-footer">
      <div class="info-box">
        <div class="info-icon">📋</div>
        <div class="info-content">
          <strong>Informação:</strong> Escalações oficiais são divulgadas 1h antes do jogo.
          <br>
          <small>Dados de ${
            homeData.source || "Football-data.org"
          } • Última atualização: ${new Date().toLocaleString("pt-BR")}</small>
        </div>
      </div>
    </div>
  `;
}

function displayRealLineups(homeData, awayData) {
  // Organizar jogadores por posição
  const organizeByPosition = (squad) => {
    const positions = {
      goalkeepers: squad.filter((p) => p.position === "Goalkeeper"),
      defenders: squad.filter((p) => p.position === "Defence"),
      midfielders: squad.filter((p) => p.position === "Midfield"),
      forwards: squad.filter((p) => p.position === "Offence"),
    };
    return positions;
  };

  const homePositions = organizeByPosition(homeData.squad);
  const awayPositions = organizeByPosition(awayData.squad);

  return `
    <div class="lineups-container">
      <div class="team-lineup">
        <div class="team-name">
          🏠 ${homeData.name}
          <span class="formation">Elenco Completo</span>
        </div>
        ${renderPositionGroup(
          "Goleiros",
          homePositions.goalkeepers,
          "goalkeeper"
        )}
        ${renderPositionGroup(
          "Defensores",
          homePositions.defenders,
          "defender"
        )}
        ${renderPositionGroup(
          "Meio-campo",
          homePositions.midfielders,
          "midfielder"
        )}
        ${renderPositionGroup("Atacantes", homePositions.forwards, "forward")}
      </div>
      
      <div class="team-lineup">
        <div class="team-name">
          ✈️ ${awayData.name}
          <span class="formation">Elenco Completo</span>
        </div>
        ${renderPositionGroup(
          "Goleiros",
          awayPositions.goalkeepers,
          "goalkeeper"
        )}
        ${renderPositionGroup(
          "Defensores",
          awayPositions.defenders,
          "defender"
        )}
        ${renderPositionGroup(
          "Meio-campo",
          awayPositions.midfielders,
          "midfielder"
        )}
        ${renderPositionGroup("Atacantes", awayPositions.forwards, "forward")}
      </div>
    </div>
    
    <div style="margin-top: 20px; padding: 16px; background: #f8fafc; border-radius: 8px; font-size: 14px; color: #64748b;">
      <strong>📋 Nota:</strong> Escalações oficiais são divulgadas aproximadamente 1 hora antes do jogo. 
      Os dados acima mostram o elenco completo disponível.
    </div>
  `;
}

// Função para renderizar grupo de posição aprimorada
function renderPositionGroup(title, players, category) {
  if (!players || players.length === 0) {
    return `
      <div class="position-group">
        <h4 class="position-title ${category}">${title}</h4>
        <div class="empty-position">
          <span class="empty-text">Nenhum jogador disponível</span>
        </div>
      </div>
    `;
  }

  const playersHtml = players
    .map((player) => {
      const age = calculateAge(player.dateOfBirth);
      const flag = getNationalityFlag(player.nationality);
      const colors = getPositionColor(player.position);
      const marketValue = player.marketValue
        ? formatMarketValue(player.marketValue)
        : "N/A";

      return `
      <div class="player-card ${category}">
        <div class="player-main">
          <div class="player-number" style="background: ${
            colors.bg
          }; color: white;">
            ${player.shirtNumber}
          </div>
          <div class="player-info">
            <div class="player-name">${player.name}</div>
            <div class="player-details">
              <span class="player-position" style="color: ${colors.bg};">
                ${player.position}
              </span>
              <span class="player-age">${age} anos</span>
              <span class="player-nationality">${flag} ${
        player.nationality
      }</span>
            </div>
          </div>
        </div>
        <div class="player-extra">
          <div class="market-value">${marketValue}</div>
          ${
            player.contract
              ? `<div class="contract-info">Até ${new Date(
                  player.contract.until
                ).getFullYear()}</div>`
              : ""
          }
        </div>
      </div>
    `;
    })
    .join("");

  return `
    <div class="position-group">
      <h4 class="position-title ${category}">
        <span class="position-icon">${getPositionIcon(category)}</span>
        ${title} 
        <span class="player-count">(${players.length})</span>
      </h4>
      <div class="players-grid">
        ${playersHtml}
      </div>
    </div>
  `;
}

// Função para obter ícone da posição
function getPositionIcon(category) {
  const icons = {
    goalkeeper: "🥅",
    defender: "🛡️",
    midfielder: "⚽",
    winger: "🏃‍♂️",
    forward: "🎯",
  };
  return icons[category] || "⚽";
}

// Função para calcular idade
function calculateAge(dateOfBirth) {
  const today = new Date();
  const birth = new Date(dateOfBirth);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

// Função para formatar valor de mercado
function formatMarketValue(value) {
  if (value >= 1000000) {
    return `€${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `€${(value / 1000).toFixed(0)}K`;
  }
  return `€${value}`;
}

// Função para obter cor da posição
function getPositionColor(position) {
  const goalkeepers = ["Goalkeeper"];
  const defenders = [
    "Centre-Back",
    "Left-Back",
    "Right-Back",
    "Left Centre-Back",
    "Right Centre-Back",
    "Defender",
  ];
  const midfielders = [
    "Central Midfield",
    "Defensive Midfield",
    "Attacking Midfield",
    "Left Midfield",
    "Right Midfield",
    "Centre Midfield",
    "Midfielder",
  ];
  const wingers = [
    "Left Winger",
    "Right Winger",
    "Left Wing-Back",
    "Right Wing-Back",
  ];
  const forwards = [
    "Centre-Forward",
    "Left Centre-Forward",
    "Right Centre-Forward",
    "Second Striker",
    "Forward",
  ];

  if (goalkeepers.includes(position)) return { bg: "#10b981", text: "#065f46" };
  if (defenders.includes(position)) return { bg: "#3b82f6", text: "#1e40af" };
  if (midfielders.includes(position)) return { bg: "#f59e0b", text: "#92400e" };
  if (wingers.includes(position)) return { bg: "#8b5cf6", text: "#5b21b6" };
  if (forwards.includes(position)) return { bg: "#ef4444", text: "#991b1b" };

  return { bg: "#6b7280", text: "#374151" }; // default
}

function getNationalityFlag(nationality) {
  const flags = {
    Spain: "🇪🇸",
    Argentina: "🇦🇷",
    Brazil: "🇧🇷",
    France: "🇫🇷",
    Germany: "🇩🇪",
    Portugal: "🇵🇹",
    Netherlands: "🇳🇱",
    Belgium: "🇧🇪",
    Croatia: "🇭🇷",
    Morocco: "🇲🇦",
    England: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    Italy: "🇮🇹",
    Uruguay: "🇺🇾",
    Colombia: "🇨🇴",
    Mexico: "🇲🇽",
    Poland: "🇵🇱",
    Norway: "🇳🇴",
    Denmark: "🇩🇰",
  };
  return flags[nationality] || "🏳️";
}

// Função para exibir conteúdo da tab ativa
function displayTabContent() {
  const content = document.getElementById("lineups-content");
  const cacheKey = Object.keys(lineupsCache)[0];

  if (!content || !cacheKey || !lineupsCache[cacheKey]) {
    return;
  }

  const data = lineupsCache[cacheKey];

  switch (currentTab) {
    case "lineups":
      content.innerHTML = displayLineups(data.home, data.away);
      break;
    case "form":
      content.innerHTML = displayForm(data.home, data.away);
      break;
    case "injuries":
      content.innerHTML = displayInjuries();
      break;
    default:
      content.innerHTML = displayLineups(data.home, data.away);
  }
}

function displayFormTab(homeData, awayData) {
  return `
    <div class="lineups-container">
      <div class="team-lineup">
        <div class="team-name">🏠 ${homeData.name} - Últimos 5 Jogos</div>
        <div class="form-list">
          ${
            homeData.recentMatches.length > 0
              ? homeData.recentMatches
                  .slice(0, 5)
                  .map((match) => {
                    const isHome = match.homeTeam.name === homeData.name;
                    const opponent = isHome
                      ? match.awayTeam.name
                      : match.homeTeam.name;
                    const homeScore = match.score?.fullTime?.homeTeam || 0;
                    const awayScore = match.score?.fullTime?.awayTeam || 0;

                    let result = "draw";
                    if (isHome) {
                      result =
                        homeScore > awayScore
                          ? "win"
                          : homeScore < awayScore
                          ? "loss"
                          : "draw";
                    } else {
                      result =
                        awayScore > homeScore
                          ? "win"
                          : awayScore < homeScore
                          ? "loss"
                          : "draw";
                    }

                    return `
              <div class="form-match">
                <div class="match-info">
                  <span>${isHome ? "vs" : "@"} ${opponent}</span>
                  <span>${homeScore}-${awayScore}</span>
                  <span style="font-size: 12px; color: #666;">
                    ${new Date(match.utcDate).toLocaleDateString("pt-BR")}
                  </span>
                </div>
                <div class="match-result ${result}">
                  ${result === "win" ? "V" : result === "draw" ? "E" : "D"}
                </div>
              </div>
            `;
                  })
                  .join("")
              : '<div class="no-data"><p>Dados de jogos não disponíveis</p></div>'
          }
        </div>
      </div>
      
      <div class="team-lineup">
        <div class="team-name">✈️ ${awayData.name} - Últimos 5 Jogos</div>
        <div class="form-list">
          ${
            awayData.recentMatches.length > 0
              ? awayData.recentMatches
                  .slice(0, 5)
                  .map((match) => {
                    const isHome = match.homeTeam.name === awayData.name;
                    const opponent = isHome
                      ? match.awayTeam.name
                      : match.homeTeam.name;
                    const homeScore = match.score?.fullTime?.homeTeam || 0;
                    const awayScore = match.score?.fullTime?.awayTeam || 0;

                    let result = "draw";
                    if (isHome) {
                      result =
                        homeScore > awayScore
                          ? "win"
                          : homeScore < awayScore
                          ? "loss"
                          : "draw";
                    } else {
                      result =
                        awayScore > homeScore
                          ? "win"
                          : awayScore < homeScore
                          ? "loss"
                          : "draw";
                    }

                    return `
              <div class="form-match">
                <div class="match-info">
                  <span>${isHome ? "vs" : "@"} ${opponent}</span>
                  <span>${homeScore}-${awayScore}</span>
                  <span style="font-size: 12px; color: #666;">
                    ${new Date(match.utcDate).toLocaleDateString("pt-BR")}
                  </span>
                </div>
                <div class="match-result ${result}">
                  ${result === "win" ? "V" : result === "draw" ? "E" : "D"}
                </div>
              </div>
            `;
                  })
                  .join("")
              : '<div class="no-data"><p>Dados de jogos não disponíveis</p></div>'
          }
        </div>
      </div>
    </div>
  `;
}

function displayInjuriesTab(homeData, awayData) {
  return `
    <div class="no-data">
      <div class="no-data-icon">🏥</div>
      <h4>Dados de lesões não disponíveis</h4>
      <p>A API Football-data.org gratuita não fornece informações sobre lesões.</p>
      <p style="font-size: 14px; margin-top: 8px;">
        Para informações de lesões, consulte sites especializados como Transfermarkt ou ESPN.
      </p>
    </div>
  `;
}

function switchTab(event, tabName) {
  if (!event) return;

  currentTab = tabName;

  // Atualizar visual das abas
  document
    .querySelectorAll(".tab-btn")
    .forEach((btn) => btn.classList.remove("active"));
  event.target.classList.add("active");

  // Exibir conteúdo da aba
  displayTabContent();
}

// Função para gerar dados simulados quando a API não está disponível
function generateMockTeamData(teamName) {
  const positions = ["Goalkeeper", "Defender", "Midfielder", "Forward"];
  const mockPlayers = [];

  // Gerar escalação simulada
  for (let i = 1; i <= 11; i++) {
    mockPlayers.push({
      id: i,
      name: `Jogador ${i}`,
      position: positions[Math.floor(Math.random() * positions.length)],
      shirtNumber: i,
    });
  }

  // Gerar lesões simuladas
  const mockInjuries = [
    {
      player: "Jogador 12",
      injury: "Lesão muscular",
      expectedReturn: "2 semanas",
    },
  ];

  // Gerar últimos jogos simulados
  const mockMatches = [];
  const results = ["WIN", "DRAW", "LOSS"];
  const opponents = ["Time A", "Time B", "Time C", "Time D", "Time E"];

  for (let i = 0; i < 5; i++) {
    mockMatches.push({
      homeTeam: { name: i % 2 === 0 ? teamName : opponents[i] },
      awayTeam: { name: i % 2 === 0 ? opponents[i] : teamName },
      score: {
        fullTime: {
          homeTeam: Math.floor(Math.random() * 3),
          awayTeam: Math.floor(Math.random() * 3),
        },
      },
      utcDate: new Date(
        Date.now() - (i + 1) * 7 * 24 * 60 * 60 * 1000
      ).toISOString(),
      status: "FINISHED",
    });
  }

  return {
    name: teamName,
    squad: mockPlayers,
    recentMatches: mockMatches,
    injuries: mockInjuries,
  };
}

// Função para renderizar as últimas partidas corrigida
function displayRecentMatches(homeData, awayData) {
  return `
    <div class="recent-matches-container">
      <div class="team-recent-matches">
        <div class="team-header">
          <div class="team-crest">
            <img src="${homeData.crest}" alt="${
    homeData.name
  }" onerror="this.style.display='none'">
          </div>
          <h4 class="team-name">${homeData.name} - Últimos 5 Jogos</h4>
        </div>
        ${renderMatchesList(homeData.recentMatches, homeData.name)}
      </div>
      
      <div class="team-recent-matches">
        <div class="team-header">
          <div class="team-crest">
            <img src="${awayData.crest}" alt="${
    awayData.name
  }" onerror="this.style.display='none'">
          </div>
          <h4 class="team-name">${awayData.name} - Últimos 5 Jogos</h4>
        </div>
        ${renderMatchesList(awayData.recentMatches, awayData.name)}
      </div>
    </div>
  `;
}

// Função para renderizar lista de partidas
function renderMatchesList(matches, teamName) {
  if (!matches || matches.length === 0) {
    return `
      <div class="no-matches">
        <div class="no-matches-icon">⚽</div>
        <div class="no-matches-text">Sem dados de partidas recentes</div>
      </div>
    `;
  }

  const matchesHtml = matches
    .slice(0, 5)
    .map((match) => {
      // Verificar se o time é mandante ou visitante
      const isHome =
        match.homeTeam.name === teamName ||
        match.homeTeam.shortName === teamName ||
        match.homeTeam.name.includes(teamName) ||
        teamName.includes(match.homeTeam.name);

      // Obter nomes dos times
      const homeTeamName = match.homeTeam.shortName || match.homeTeam.name;
      const awayTeamName = match.awayTeam.shortName || match.awayTeam.name;

      // Obter placares (corrigido para pegar os dados corretos)
      const homeScore =
        match.score?.fullTime?.home ?? match.score?.fullTime?.homeTeam ?? 0;
      const awayScore =
        match.score?.fullTime?.away ?? match.score?.fullTime?.awayTeam ?? 0;

      // Determinar resultado para o time
      let resultClass = "draw";
      let resultText = "E";

      if (match.score && homeScore !== null && awayScore !== null) {
        if (isHome) {
          if (homeScore > awayScore) {
            resultClass = "win";
            resultText = "V";
          } else if (homeScore < awayScore) {
            resultClass = "loss";
            resultText = "D";
          }
        } else {
          if (awayScore > homeScore) {
            resultClass = "win";
            resultText = "V";
          } else if (awayScore < homeScore) {
            resultClass = "loss";
            resultText = "D";
          }
        }
      }

      // Formatar data
      const matchDate = new Date(match.utcDate).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });

      // Nome do oponente
      const opponent = isHome ? awayTeamName : homeTeamName;
      const homeAway = isHome ? "Casa" : "Fora";
      const homeAwayIcon = isHome ? "🏠" : "✈️";

      // Competição
      const competition =
        match.competition?.name || match.competition?.code || "La Liga";
      const competitionShort = competition.includes("Champions")
        ? "UCL"
        : competition.includes("Primera") || competition.includes("Liga")
        ? "Liga"
        : competition.includes("Copa")
        ? "Copa"
        : competition;

      return `
      <div class="match-item">
        <div class="match-main">
          <div class="match-result ${resultClass}">
            ${resultText}
          </div>
          <div class="match-info">
            <div class="match-teams">
              <span class="opponent">${homeAwayIcon} vs ${opponent}</span>
              <div class="match-score">
                ${
                  homeScore !== null && awayScore !== null
                    ? `${homeScore}-${awayScore}`
                    : "N/A"
                }
              </div>
            </div>
            <div class="match-details">
              <span class="match-date">${matchDate}</span>
              <span class="match-competition">${competitionShort}</span>
              <span class="match-location">${homeAway}</span>
            </div>
          </div>
        </div>
      </div>
    `;
    })
    .join("");

  return `<div class="matches-list">${matchesHtml}</div>`;
}

// Função principal para exibir as tabs
function displayMatchTabs(homeData, awayData) {
  return `
    <div class="match-tabs">
      <div class="lineups-tabs">
        <button class="tab-btn active" onclick="showTab('lineups')">Escalações</button>
        <button class="tab-btn" onclick="showTab('recent')">Últimos Jogos</button>
        <button class="tab-btn" onclick="showTab('stats')">Estatísticas</button>
        <button class="tab-btn" onclick="showTab('field')">Campo</button>
      </div>
      
      <div class="tab-content">
        <div id="lineups-tab" class="tab-pane active">
          ${displayLineups(homeData, awayData)}
        </div>
        
        <div id="recent-tab" class="tab-pane">
          ${displayRecentMatches(homeData, awayData)}
        </div>
        
        <div id="stats-tab" class="tab-pane">
          ${displayTeamStats(homeData, awayData)}
        </div>

        <div id="field-tab" class="tab-pane active">
  ${displayFootballField(homeData, awayData)}
</div>
      </div>
    </div>
  `;
}

function showTab(tabName) {
  // Remover classe active de todas as tabs
  document
    .querySelectorAll(".tab-btn")
    .forEach((btn) => btn.classList.remove("active"));
  document
    .querySelectorAll(".tab-pane")
    .forEach((pane) => pane.classList.remove("active"));

  // Adicionar classe active na tab selecionada
  document
    .querySelector(`button[onclick="showTab('${tabName}')"]`)
    .classList.add("active");
  document.getElementById(`${tabName}-tab`).classList.add("active");
}

// Função para exibir estatísticas dos times
function displayTeamStats(homeData, awayData) {
  const homeStats = calculateTeamStats(homeData);
  const awayStats = calculateTeamStats(awayData);

  return `
    <div class="team-stats-container">
      <div class="stats-comparison">
        <div class="team-stat-section">
          <div class="stat-team-header">
            <img src="${homeData.crest}" alt="${
    homeData.name
  }" class="stat-team-crest">
            <h4>${homeData.name}</h4>
          </div>
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-label">Fundado</div>
              <div class="stat-value">${homeData.founded || "N/A"}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">Estádio</div>
              <div class="stat-value">${homeData.venue?.name || "N/A"}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">Capacidade</div>
              <div class="stat-value">${
                homeData.venue?.capacity
                  ? homeData.venue.capacity.toLocaleString()
                  : "N/A"
              }</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">Elenco</div>
              <div class="stat-value">${
                homeData.squad?.length || 0
              } jogadores</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">Últimos 5 jogos</div>
              <div class="stat-value">
                <div class="recent-form">
                  ${homeStats.recentForm
                    .map(
                      (result) =>
                        `<span class="form-result ${result.toLowerCase()}">${result}</span>`
                    )
                    .join("")}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="vs-separator">VS</div>

        <div class="team-stat-section">
          <div class="stat-team-header">
            <img src="${awayData.crest}" alt="${
    awayData.name
  }" class="stat-team-crest">
            <h4>${awayData.name}</h4>
          </div>
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-label">Fundado</div>
              <div class="stat-value">${awayData.founded || "N/A"}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">Estádio</div>
              <div class="stat-value">${awayData.venue?.name || "N/A"}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">Capacidade</div>
              <div class="stat-value">${
                awayData.venue?.capacity
                  ? awayData.venue.capacity.toLocaleString()
                  : "N/A"
              }</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">Elenco</div>
              <div class="stat-value">${
                awayData.squad?.length || 0
              } jogadores</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">Últimos 5 jogos</div>
              <div class="stat-value">
                <div class="recent-form">
                  ${awayStats.recentForm
                    .map(
                      (result) =>
                        `<span class="form-result ${result.toLowerCase()}">${result}</span>`
                    )
                    .join("")}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function calculateTeamStats(teamData) {
  const recentForm = [];

  if (teamData.recentMatches && teamData.recentMatches.length > 0) {
    teamData.recentMatches.slice(0, 5).forEach((match) => {
      const isHome =
        match.homeTeam.name === teamData.name ||
        match.homeTeam.shortName === teamData.name ||
        match.homeTeam.name.includes(teamData.name) ||
        teamData.name.includes(match.homeTeam.name);

      const homeScore =
        match.score?.fullTime?.home ?? match.score?.fullTime?.homeTeam ?? 0;
      const awayScore =
        match.score?.fullTime?.away ?? match.score?.fullTime?.awayTeam ?? 0;

      if (homeScore !== null && awayScore !== null) {
        if (isHome) {
          if (homeScore > awayScore) recentForm.push("V");
          else if (homeScore < awayScore) recentForm.push("D");
          else recentForm.push("E");
        } else {
          if (awayScore > homeScore) recentForm.push("V");
          else if (awayScore < homeScore) recentForm.push("D");
          else recentForm.push("E");
        }
      } else {
        recentForm.push("-");
      }
    });
  }

  // Preencher com '-' se não tiver jogos suficientes
  while (recentForm.length < 5) {
    recentForm.push("-");
  }

  return {
    recentForm: recentForm,
  };
}

// Função para exibir o campo de futebol
function displayFootballField(homeData, awayData) {
  return `
    <div class="football-field-wrapper">
      <div class="match-field-header">
        <div class="field-team-info">
          <div class="field-team">
            <img src="${homeData.crest}" alt="${
    homeData.name
  }" class="field-team-crest">
            <div>
              <div class="field-team-name">${homeData.name}</div>
              <div class="field-formation">4-2-3-1</div>
            </div>
          </div>
          <div class="field-vs">VS</div>
          <div class="field-team">
            <div>
              <div class="field-team-name">${awayData.name}</div>
              <div class="field-formation">4-3-3</div>
            </div>
            <img src="${awayData.crest}" alt="${
    awayData.name
  }" class="field-team-crest">
          </div>
        </div>
      </div>

      <div class="football-field">
        <!-- Linhas do campo -->
        <div class="field-lines">
          <div class="center-line"></div>
          <div class="center-circle"></div>
          <div class="penalty-area-top"></div>
          <div class="penalty-area-bottom"></div>
          <div class="goal-area-top"></div>
          <div class="goal-area-bottom"></div>
        </div>

        <!-- Jogadores Time da Casa (parte inferior) -->
        ${generateFieldPlayers(homeData.squad, "home")}
        
        <!-- Jogadores Time Visitante (parte superior) -->
        ${generateFieldPlayers(awayData.squad, "away")}
      </div>

      <div class="field-controls">
        <div class="formation-selector">
          <button class="field-formation-btn active" onclick="changeFieldFormation('4-2-3-1')">4-2-3-1</button>
          <button class="field-formation-btn" onclick="changeFieldFormation('4-3-3')">4-3-3</button>
          <button class="field-formation-btn" onclick="changeFieldFormation('3-5-2')">3-5-2</button>
          <button class="field-formation-btn" onclick="changeFieldFormation('4-4-2')">4-4-2</button>
        </div>
        
        <div class="field-legend">
          <div class="legend-item">
            <div class="legend-color home-team-color"></div>
            <span>${homeData.name}</span>
          </div>
          <div class="legend-item">
            <div class="legend-color away-team-color"></div>
            <span>${awayData.name}</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Função para gerar jogadores no campo
function generateFieldPlayers(squad, team) {
  if (!squad || squad.length === 0) {
    return '<div class="no-players">Escalação não disponível</div>';
  }

  const positions = getFieldPositions(team);
  const players = squad.slice(0, 11); // Primeiros 11 jogadores

  return players
    .map((player, index) => {
      const position = positions[index] || { bottom: "50%", left: "50%" };
      const positionStyle =
        team === "home"
          ? `bottom: ${position.bottom}; left: ${position.left};`
          : `top: ${position.top}; left: ${position.left};`;

      return `
      <div class="field-player ${team}-team-color" style="${positionStyle}" 
           onclick="showPlayerInfo('${player.name}', '${player.position}', '${
        player.nationality
      }')">
        ${player.shirtNumber || index + 1}
        <div class="field-player-tooltip">
          ${player.name} (${player.position || "Jogador"})
        </div>
      </div>
    `;
    })
    .join("");
}

// Posições no campo para formação 4-2-3-1
function getFieldPositions(team) {
  if (team === "home") {
    return [
      { bottom: "20px", left: "50%" }, // Goleiro
      { bottom: "120px", left: "20%" }, // LD
      { bottom: "120px", left: "36.67%" }, // Zagueiro
      { bottom: "120px", left: "63.33%" }, // Zagueiro
      { bottom: "120px", left: "80%" }, // LE
      { bottom: "200px", left: "35%" }, // Volante
      { bottom: "200px", left: "65%" }, // Volante
      { bottom: "280px", left: "20%" }, // Ponta Esq
      { bottom: "280px", left: "50%" }, // Meia
      { bottom: "280px", left: "80%" }, // Ponta Dir
      { bottom: "360px", left: "50%" }, // Atacante
    ];
  } else {
    return [
      { top: "20px", left: "50%" }, // Goleiro
      { top: "120px", left: "80%" }, // LD (invertido)
      { top: "120px", left: "63.33%" }, // Zagueiro
      { top: "120px", left: "36.67%" }, // Zagueiro
      { top: "120px", left: "20%" }, // LE (invertido)
      { top: "200px", left: "65%" }, // Volante
      { top: "200px", left: "35%" }, // Volante
      { top: "280px", left: "80%" }, // Ponta Dir (invertido)
      { top: "280px", left: "50%" }, // Meia
      { top: "280px", left: "20%" }, // Ponta Esq (invertido)
      { top: "360px", left: "50%" }, // Atacante
    ];
  }
}

// Função para mostrar informações do jogador
function showPlayerInfo(name, position, nationality) {
  const flag = getNationalityFlag(nationality);
  showNotification(`${name} - ${position} ${flag}`);
}

// Função para mudar formação no campo
function changeFieldFormation(formation) {
  document.querySelectorAll(".field-formation-btn").forEach((btn) => {
    btn.classList.remove("active");
  });
  event.target.classList.add("active");

  // Aqui você pode implementar a lógica para reposicionar os jogadores
  // baseado na formação selecionada
  showNotification(`Formação alterada para: ${formation}`);
}

/* ===== CSS PARA O CAMPO DE FUTEBOL ===== */
const footballFieldCSS = `
<style>
/* Campo de Futebol - Container */
.football-field-wrapper {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

/* Header do Campo */
.match-field-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
}

.field-team-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.field-team {
  display: flex;
  align-items: center;
  gap: 12px;
}

.field-team-crest {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid white;
  object-fit: cover;
}

.field-team-name {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 4px;
}

.field-formation {
  font-size: 14px;
  opacity: 0.9;
}

.field-vs {
  background: rgba(255,255,255,0.2);
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 700;
  backdrop-filter: blur(10px);
}

/* Campo de Futebol */
.football-field {
  position: relative;
  width: 100%;
  height: 500px;
  background: linear-gradient(to bottom, 
    #2d5a27 0%, 
    #357a2b 25%, 
    #2d5a27 50%, 
    #357a2b 75%, 
    #2d5a27 100%
  );
  background-size: 100% 30px;
  overflow: hidden;
}

/* Linhas do Campo */
.field-lines {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.center-line {
  position: absolute;
  top: 50%;
  left: 0;
  width: 100%;
  height: 2px;
  background: rgba(255,255,255,0.8);
  transform: translateY(-50%);
}

.center-circle {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100px;
  height: 100px;
  border: 2px solid rgba(255,255,255,0.8);
  border-radius: 50%;
  transform: translate(-50%, -50%);
}

.penalty-area-top, .penalty-area-bottom {
  position: absolute;
  left: 50%;
  width: 180px;
  height: 65px;
  border: 2px solid rgba(255,255,255,0.8);
  transform: translateX(-50%);
}

.penalty-area-top {
  top: 0;
  border-bottom: none;
}

.penalty-area-bottom {
  bottom: 0;
  border-top: none;
}

.goal-area-top, .goal-area-bottom {
  position: absolute;
  left: 50%;
  width: 100px;
  height: 35px;
  border: 2px solid rgba(255,255,255,0.8);
  transform: translateX(-50%);
}

.goal-area-top {
  top: 0;
  border-bottom: none;
}

.goal-area-bottom {
  bottom: 0;
  border-top: none;
}

/* Jogadores no Campo */
.field-player {
  position: absolute;
  width: 45px;
  height: 45px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 3px solid white;
  box-shadow: 0 4px 15px rgba(0,0,0,0.3);
  transform: translate(-50%, -50%);
  z-index: 5;
}

.field-player:hover {
  transform: translate(-50%, -50%) scale(1.15);
  z-index: 10;
  box-shadow: 0 6px 20px rgba(0,0,0,0.4);
}

.field-player-tooltip {
  position: absolute;
  bottom: -35px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0,0,0,0.8);
  color: white;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 11px;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
  z-index: 15;
}

.field-player:hover .field-player-tooltip {
  opacity: 1;
}

/* Cores dos Times */
.home-team-color {
  background: #e53e3e;
}

.away-team-color {
  background: #3182ce;
}

/* Controles do Campo */
.field-controls {
  padding: 20px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
}

.formation-selector {
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 15px;
}

.field-formation-btn {
  background: white;
  border: 2px solid #e2e8f0;
  padding: 8px 15px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  font-size: 13px;
}

.field-formation-btn:hover {
  border-color: #667eea;
  color: #667eea;
}

.field-formation-btn.active {
  background: #667eea;
  border-color: #667eea;
  color: white;
}

.field-legend {
  display: flex;
  justify-content: center;
  gap: 20px;
  font-size: 12px;
  color: #64748b;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

/* Quando não há jogadores */
.no-players {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0,0,0,0.7);
  color: white;
  padding: 15px 25px;
  border-radius: 10px;
  font-size: 14px;
  text-align: center;
}

/* Responsividade */
@media (max-width: 768px) {
  .football-field {
    height: 400px;
  }
  
  .field-player {
    width: 40px;
    height: 40px;
    font-size: 11px;
  }
  
  .center-circle {
    width: 80px;
    height: 80px;
  }
  
  .penalty-area-top, .penalty-area-bottom {
    width: 140px;
    height: 50px;
  }
  
  .field-team-name {
    font-size: 16px;
  }
  
  .field-controls {
    padding: 15px;
  }
}

@media (max-width: 480px) {
  .football-field {
    height: 350px;
  }
  
  .field-player {
    width: 35px;
    height: 35px;
    font-size: 10px;
  }
  
  .field-team-info {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
  
  .formation-selector {
    gap: 8px;
  }
  
  .field-formation-btn {
    padding: 6px 12px;
    font-size: 12px;
  }
}
</style>
`;

// Adicionar o CSS ao head do documento (chame esta função uma vez)
function addFootballFieldCSS() {
  if (!document.getElementById("football-field-css")) {
    const styleElement = document.createElement("style");
    styleElement.id = "football-field-css";
    styleElement.innerHTML = footballFieldCSS
      .replace("<style>", "")
      .replace("</style>", "");
    document.head.appendChild(styleElement);
  }
}
