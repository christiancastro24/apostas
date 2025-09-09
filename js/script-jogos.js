// Configuração da API
const API_KEY = "e6151727b9b3162bb023a5d9283dc608";
const API_BASE_URL = "https://api.the-odds-api.com/v4";

let isLoading = false;

// Mapeamento de bookmakers
const BOOKMAKER_MAP = {
  bet365: { name: "Bet365", logo: "🎯" },
  betano: { name: "Betano", logo: "🔥" },
  superbet: { name: "SuperBet", logo: "💎" },
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
}
// Função para criar card de jogo individual
function createGameCard(game) {
  const hasDraws = game.hasDraws !== false;

  if (game.odds.length === 0) {
    return `
      <div class="game-card">
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
        
        <div style="text-align: center; color: #666; padding: 20px;">
          Odds indisponíveis
        </div>
      </div>
    `;
  }

  return `
    <div class="game-card">
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
      
      <div class="odds-container">
        ${game.odds
          .map(
            (bookmaker) => `
          <div class="bookmaker">
            <div class="odds-grid" style="grid-template-columns: ${
              hasDraws ? "1fr 1fr 1fr" : "1fr 1fr"
            };">
              <div class="odd-button" onclick="selectOdd(this, '${
                game.homeTeam
              }', '${bookmaker.home}')">
                <div class="odd-label">${game.homeTeam.split(" ")[0]}</div>
                <div class="odd-value">${bookmaker.home}</div>
              </div>
              ${
                hasDraws
                  ? `
                <div class="odd-button" onclick="selectOdd(this, 'Empate', '${bookmaker.draw}')">
                  <div class="odd-label">Empate</div>
                  <div class="odd-value">${bookmaker.draw}</div>
                </div>
              `
                  : ""
              }
              <div class="odd-button" onclick="selectOdd(this, '${
                game.awayTeam
              }', '${bookmaker.away}')">
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

  // Auto-refresh a cada 5 minutos
  setInterval(() => {
    if (!isLoading) {
      loadTodaysGamesWithStatus();
    }
  }, 300000); // 5 minutos
});
