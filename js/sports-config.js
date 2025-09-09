// ========================================
// sports-config.js
// Configurações de esportes, ligas e dados estáticos
// ========================================

const SPORTS_MAP = {
  // Competições de seleções
  soccer_fifa_world_cup: {
    name: "Copa do Mundo FIFA",
    icon: "🏆",
    flagUrl: null,
    hasDraws: true,
  },
  soccer_uefa_european_championship: {
    name: "Eurocopa",
    icon: "🏆",
    flagUrl: null,
    hasDraws: true,
  },
  soccer_conmebol_copa_america: {
    name: "Copa América",
    icon: "🏆",
    flagUrl: null,
    hasDraws: true,
  },
  soccer_uefa_nations_league: {
    name: "Liga das Nações UEFA",
    icon: "🌍",
    flagUrl: null,
    hasDraws: true,
  },
  soccer_fifa_world_cup_qualifier_conmebol: {
    name: "Eliminatórias Sul-Americanas",
    icon: "🌎",
    flagUrl: null,
    hasDraws: true,
  },
  soccer_fifa_world_cup_qualifier_uefa: {
    name: "Eliminatórias Europeias",
    icon: "🌍",
    flagUrl: null,
    hasDraws: true,
  },
  soccer_international_friendlies: {
    name: "Amistosos Internacionais",
    icon: "🤝",
    flagUrl: null,
    hasDraws: true,
  },

  // ELIMINATÓRIAS
  soccer_fifa_world_cup_qualifiers_europe: {
    name: "Eliminatórias Europeias",
    icon: "🌍",
    flagUrl: null,
    hasDraws: true,
  },
  soccer_fifa_world_cup_qualifiers_south_america: {
    name: "Eliminatórias Sul-Americanas",
    icon: "🌎",
    flagUrl: null,
    hasDraws: true,
  },

  // Ligas principais - COM URLs DAS BANDEIRAS
  soccer_epl: {
    name: "Premier League",
    icon: "🇬🇧",
    flagUrl: "https://flagcdn.com/32x24/gb.png",
    hasDraws: true,
  },
  soccer_uefa_champs_league: {
    name: "Champions League",
    icon: "🏆",
    flagUrl: null,
    hasDraws: true,
  },
  soccer_uefa_europa_league: {
    name: "Europa League",
    icon: "🥈",
    flagUrl: null,
    hasDraws: true,
  },
  soccer_spain_la_liga: {
    name: "La Liga",
    icon: "🇪🇸",
    flagUrl: "https://flagcdn.com/32x24/es.png",
    hasDraws: true,
  },
  soccer_italy_serie_a: {
    name: "Serie A",
    icon: "🇮🇹",
    flagUrl: "https://flagcdn.com/32x24/it.png",
    hasDraws: true,
  },
  soccer_germany_bundesliga: {
    name: "Bundesliga",
    icon: "🇩🇪",
    flagUrl: "https://flagcdn.com/32x24/de.png",
    hasDraws: true,
  },
  soccer_france_ligue_one: {
    name: "Ligue 1",
    icon: "🇫🇷",
    flagUrl: "https://flagcdn.com/32x24/fr.png",
    hasDraws: true,
  },

  // Brasil - BANDEIRA BRASILEIRA COM URL
  soccer_brazil_campeonato: {
    name: "Brasileirão Série A",
    icon: "🇧🇷",
    flagUrl: "https://flagcdn.com/32x24/br.png",
    hasDraws: true,
  },
  soccer_brazil_serie_b: {
    name: "Brasileirão Série B",
    icon: "🇧🇷",
    flagUrl: "https://flagcdn.com/32x24/br.png",
    hasDraws: true,
  },
  soccer_brazil_campeonato_carioca: {
    name: "Campeonato Carioca",
    icon: "🇧🇷",
    flagUrl: "https://flagcdn.com/32x24/br.png",
    hasDraws: true,
  },
  soccer_brazil_campeonato_paulista: {
    name: "Campeonato Paulista",
    icon: "🇧🇷",
    flagUrl: "https://flagcdn.com/32x24/br.png",
    hasDraws: true,
  },
  soccer_conmebol_libertadores: {
    name: "Libertadores",
    icon: "🏆",
    flagUrl: null,
    hasDraws: true,
  },
  soccer_conmebol_sudamericana: {
    name: "Sul-Americana",
    icon: "🥈",
    flagUrl: null,
    hasDraws: true,
  },

  // Outras ligas - COM URLs DAS BANDEIRAS
  soccer_argentina_primera_division: {
    name: "Primera División Argentina",
    icon: "🇦🇷",
    flagUrl: "https://flagcdn.com/32x24/ar.png",
    hasDraws: true,
  },
  soccer_portugal_primeira_liga: {
    name: "Primeira Liga Portugal",
    icon: "🇵🇹",
    flagUrl: "https://flagcdn.com/32x24/pt.png",
    hasDraws: true,
  },
  soccer_netherlands_eredivisie: {
    name: "Eredivisie",
    icon: "🇳🇱",
    flagUrl: "https://flagcdn.com/32x24/nl.png",
    hasDraws: true,
  },
  soccer_mexico_liga_mx: {
    name: "Liga MX",
    icon: "🇲🇽",
    flagUrl: "https://flagcdn.com/32x24/mx.png",
    hasDraws: true,
  },
  soccer_usa_mls: {
    name: "Major League Soccer",
    icon: "🇺🇸",
    flagUrl: "https://flagcdn.com/32x24/us.png",
    hasDraws: true,
  },
  soccer_colombia_primera_a: {
    name: "Primera A Colombia",
    icon: "🇨🇴",
    flagUrl: "https://flagcdn.com/32x24/co.png",
    hasDraws: true,
  },
  soccer_chile_primera_division: {
    name: "Primera División Chile",
    icon: "🇨🇱",
    flagUrl: "https://flagcdn.com/32x24/cl.png",
    hasDraws: true,
  },
  soccer_uruguay_primera_division: {
    name: "Primera División Uruguay",
    icon: "🇺🇾",
    flagUrl: "https://flagcdn.com/32x24/uy.png",
    hasDraws: true,
  },
  soccer_peru_primera_division: {
    name: "Primera División Peru",
    icon: "🇵🇪",
    flagUrl: "https://flagcdn.com/32x24/pe.png",
    hasDraws: true,
  },
  soccer_ecuador_primera_a: {
    name: "Primera A Ecuador",
    icon: "🇪🇨",
    flagUrl: "https://flagcdn.com/32x24/ec.png",
    hasDraws: true,
  },

  // Tennis (sem empate)
  tennis_atp_french_open: {
    name: "Roland Garros ATP",
    icon: "🎾",
    flagUrl: null,
    hasDraws: false,
  },
  tennis_wta_french_open: {
    name: "Roland Garros WTA",
    icon: "🎾",
    flagUrl: null,
    hasDraws: false,
  },
  tennis_atp_wimbledon: {
    name: "Wimbledon ATP",
    icon: "🎾",
    flagUrl: null,
    hasDraws: false,
  },
  tennis_wta_wimbledon: {
    name: "Wimbledon WTA",
    icon: "🎾",
    flagUrl: null,
    hasDraws: false,
  },
  tennis_atp_us_open: {
    name: "US Open ATP",
    icon: "🎾",
    flagUrl: null,
    hasDraws: false,
  },
  tennis_wta_us_open: {
    name: "US Open WTA",
    icon: "🎾",
    flagUrl: null,
    hasDraws: false,
  },
  tennis_atp_australian_open: {
    name: "Australian Open ATP",
    icon: "🎾",
    flagUrl: null,
    hasDraws: false,
  },
  tennis_wta_australian_open: {
    name: "Australian Open WTA",
    icon: "🎾",
    flagUrl: null,
    hasDraws: false,
  },
};

// Mapeamento de países para bandeiras
const COUNTRY_FLAGS = {
  brazil: "🇧🇷",
  england: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  spain: "🇪🇸",
  italy: "🇮🇹",
  germany: "🇩🇪",
  france: "🇫🇷",
  argentina: "🇦🇷",
  portugal: "🇵🇹",
  netherlands: "🇳🇱",
  usa: "🇺🇸",
  mexico: "🇲🇽",
  colombia: "🇨🇴",
  chile: "🇨🇱",
  uruguay: "🇺🇾",
  peru: "🇵🇪",
  ecuador: "🇪🇨",
};

// Logos de seleções nacionais e times
const TEAM_LOGOS = {
  // Seleções Sul-Americanas
  Brazil:
    "https://upload.wikimedia.org/wikipedia/en/thumb/0/05/Brazil_national_football_team_logo.svg/100px-Brazil_national_football_team_logo.svg.png",
  Brasil:
    "https://upload.wikimedia.org/wikipedia/en/thumb/0/05/Brazil_national_football_team_logo.svg/100px-Brazil_national_football_team_logo.svg.png",
  Argentina:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Argentina_crest.svg/100px-Argentina_crest.svg.png",
  Uruguay:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Escudo_de_la_Asociaci%C3%B3n_Uruguaya_de_F%C3%BAtbol.svg/100px-Escudo_de_la_Asociaci%C3%B3n_Uruguaya_de_F%C3%BAtbol.svg.png",
  Colombia:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Escudo_de_la_Selecci%C3%B3n_de_f%C3%BAtbol_de_Colombia.svg/100px-Escudo_de_la_Selecci%C3%B3n_de_f%C3%BAtbol_de_Colombia.svg.png",
  Chile:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Escudo_selecci%C3%B3n_chilena_de_f%C3%BAtbol.svg/100px-Escudo_selecci%C3%B3n_chilena_de_f%C3%BAtbol.svg.png",
  Peru: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Escudo_de_la_Selecci%C3%B3n_de_f%C3%BAtbol_del_Per%C3%BA.svg/100px-Escudo_de_la_Selecci%C3%B3n_de_f%C3%BAtbol_del_Per%C3%BA.svg.png",
  Ecuador:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Escudo_de_la_Selecci%C3%B3n_de_f%C3%BAtbol_de_Ecuador.svg/100px-Escudo_de_la_Selecci%C3%B3n_de_f%C3%BAtbol_de_Ecuador.svg.png",
  Paraguay:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Escudo_de_la_Selecci%C3%B3n_de_f%C3%BAtbol_de_Paraguay.svg/100px-Escudo_de_la_Selecci%C3%B3n_de_f%C3%BAtbol_de_Paraguay.svg.png",
  Bolivia:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Escudo_de_la_Selecci%C3%B3n_de_f%C3%BAtbol_de_Bolivia.svg/100px-Escudo_de_la_Selecci%C3%B3n_de_f%C3%BAtbol_de_Bolivia.svg.png",
  Venezuela:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Escudo_de_la_Selecci%C3%B3n_de_f%C3%BAtbol_de_Venezuela.svg/100px-Escudo_de_la_Selecci%C3%B3n_de_f%C3%BAtbol_de_Venezuela.svg.png",

  // Seleções Europeias principais
  France:
    "https://upload.wikimedia.org/wikipedia/en/thumb/c/c1/France_national_football_team_logo.svg/100px-France_national_football_team_logo.svg.png",
  França:
    "https://upload.wikimedia.org/wikipedia/en/thumb/c/c1/France_national_football_team_logo.svg/100px-France_national_football_team_logo.svg.png",
  Germany:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/DFB-Logo.svg/100px-DFB-Logo.svg.png",
  Alemanha:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/DFB-Logo.svg/100px-DFB-Logo.svg.png",
  Spain:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Escudo_de_la_Selecci%C3%B3n_de_f%C3%BAtbol_de_Espa%C3%B1a.svg/100px-Escudo_de_la_Selecci%C3%B3n_de_f%C3%BAtbol_de_Espa%C3%B1a.svg.png",
  Espanha:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Escudo_de_la_Selecci%C3%B3n_de_f%C3%BAtbol_de_Espa%C3%B1a.svg/100px-Escudo_de_la_Selecci%C3%B3n_de_f%C3%BAtbol_de_Espa%C3%B1a.svg.png",
  Italy:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/FIGC_Logo.svg/100px-FIGC_Logo.svg.png",
  Itália:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/FIGC_Logo.svg/100px-FIGC_Logo.svg.png",
  England:
    "https://upload.wikimedia.org/wikipedia/en/thumb/e/e3/England_crest_2009.svg/100px-England_crest_2009.svg.png",
  Inglaterra:
    "https://upload.wikimedia.org/wikipedia/en/thumb/e/e3/England_crest_2009.svg/100px-England_crest_2009.svg.png",
  Portugal:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Portuguese_Football_Federation.svg/100px-Portuguese_Football_Federation.svg.png",
  Netherlands:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/KNVB_logo.svg/100px-KNVB_logo.svg.png",
  Holanda:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/KNVB_logo.svg/100px-KNVB_logo.svg.png",

  // Times da Série B (principais)
  Guarani:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Guarani_FC_logo.svg/100px-Guarani_FC_logo.svg.png",
  "Ponte Preta":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Associa%C3%A7%C3%A3o_Atl%C3%A9tica_Ponte_Preta_logo.svg/100px-Associa%C3%A7%C3%A3o_Atl%C3%A9tica_Ponte_Preta_logo.svg.png",
  Avaí: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Avai_FC_logo.svg/100px-Avai_FC_logo.svg.png",
  Chapecoense:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Chapecoense_Logo.png/100px-Chapecoense_Logo.png",
  CRB: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Clube_de_Regatas_Brasil_logo.svg/100px-Clube_de_Regatas_Brasil_logo.svg.png",
  "Vila Nova":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Vila_Nova_FC_logo.svg/100px-Vila_Nova_FC_logo.svg.png",
  "Operário-PR":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Opera%C3%A1rio_Ferroviario_Esporte_Clube_logo.svg/100px-Opera%C3%A1rio_Ferroviario_Esporte_Clube_logo.svg.png",
  Novorizontino:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Grêmio_Novorizontino_logo.png/100px-Grêmio_Novorizontino_logo.png",
  Mirassol:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Mirassol_FC_logo.svg/100px-Mirassol_FC_logo.svg.png",
};

// ========================================
// FUNÇÕES UTILITÁRIAS
// ========================================

function getCountryFlag(country) {
  return COUNTRY_FLAGS[country.toLowerCase()] || "🌍";
}

function getTeamLogo(teamName) {
  return TEAM_LOGOS[teamName] || null;
}

function getSportInfo(sportKey) {
  return SPORTS_MAP[sportKey] || null;
}

// Função para buscar ligas por tipo de esporte
function getLeaguesBySport(sportType) {
  return Object.entries(SPORTS_MAP)
    .filter(([key, value]) => key.startsWith(sportType))
    .reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {});
}

// Função para buscar apenas ligas de futebol
function getSoccerLeagues() {
  return getLeaguesBySport("soccer");
}

// Função para buscar apenas torneios de tênis
function getTennisTournaments() {
  return getLeaguesBySport("tennis");
}
