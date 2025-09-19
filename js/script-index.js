let currentMultiplaRow = null;

// Variáveis para controle de filtro e estado
let currentFilter = "all";
let scrollPositions = {};

// CORREÇÃO: Primeiro definir storedBets a partir do localStorage
let storedBets = localStorage.getItem("betsData");

// Inicializa betsData a partir do localStorage se houver
let betsData = storedBets
  ? JSON.parse(storedBets)
  : {
      janeiro: [],
      fevereiro: [],
      março: [],
      abril: [],
      maio: [],
      junho: [],
      julho: [],
      agosto: [],
      setembro: [],
      outubro: [],
      novembro: [],
      dezembro: [],
    };

// MultiplaData também, se quiser
let storedMultipla = localStorage.getItem("multiplaData");
let multiplaData = storedMultipla ? JSON.parse(storedMultipla) : {};

// Variável para controlar qual mês está ativo
let currentActiveMonth = "setembro";

// Função para formatar números no padrão brasileiro
function formatBRL(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(value);
}

// Carregar dados salvos
document.addEventListener("DOMContentLoaded", function () {
  initializeTabs();
  loadAllBets();
  updateStats();
});

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

function showMonth(month) {
  // Salvar posição de scroll da aba atual
  saveScrollPosition();

  // Atualizar a variável do mês ativo
  currentActiveMonth = month;

  // Remove a classe active de todas as tabs
  document
    .querySelectorAll(".tab")
    .forEach((tab) => tab.classList.remove("active"));

  // Esconde todos os conteúdos das abas
  document.querySelectorAll(".month-content").forEach((content) => {
    content.style.display = "none";
    content.classList.remove("active");
  });

  // CORREÇÃO: Encontrar a tab pelo texto ao invés do onclick
  const tabs = document.querySelectorAll(".tab");
  tabs.forEach((tab) => {
    if (tab.textContent.toLowerCase() === month.toLowerCase()) {
      tab.classList.add("active");
    }
  });

  // Mostra o conteúdo da aba selecionada
  const selectedContent = document.getElementById(month);
  if (selectedContent) {
    selectedContent.style.display = "block";
    selectedContent.classList.add("active");
  }

  // Salvar aba ativa
  localStorage.setItem("lastActiveTab", month);

  // Aplicar filtro atual na nova aba
  applyFilter(currentFilter);

  // Restaurar posição de scroll
  restoreScrollPosition(month);

  // IMPORTANTE: Atualizar as estatísticas para o novo mês
  updateStats();
}

function addNewBet(month) {
  const tbody = document.getElementById(month + "-tbody");

  // Criar a nova linha
  const newRow = document.createElement("tr");
  const rowId = `${month}-${Date.now()}-${Math.random()
    .toString(36)
    .substr(2, 9)}`;
  newRow.setAttribute("data-row-id", rowId);

  newRow.innerHTML = `
    <td class="cell-data"><input type="date"></td>
    <td class="cell-tipo">
      <select onchange="handleTipoChange(this)">
        <option value="simples">Simples</option>
        <option value="multipla">Múltipla</option>
      </select>
    </td>
    <td class="cell-esporte">
      <select>
        <option value="futebol">⚽ Futebol</option>
        <option value="basquete">🏀 Basquete</option>
        <option value="tenis">🎾 Tênis</option>
        <option value="volei">🏐 Vôlei</option>
        <option value="ufc">🥊 UFC/MMA</option>
        <option value="ciclismo">🚴 Ciclismo</option>
        <option value="esports">🎮 E-Sports</option>
        <option value="outros">🏆 Outros</option>
      </select>
    </td>
    <td class="cell-evento"><input type="text" placeholder="Nome do jogo"></td>
    <td class="cell-metodo"><input type="text" placeholder="Método/Estratégia"></td>
    <td class="cell-confianca"><span class="confidence conf-60" onclick="toggleConfidence(this)">60%</span></td>
    <td class="cell-odd"><input type="number" step="0.01" min="1.01" placeholder="1.00" onchange="calculateReturn(this)"></td>
    <td class="cell-unidade"><input type="number" step="0.1" min="0.1" placeholder="1.0" onchange="calculateReturn(this)"></td>
    <td class="cell-retorno"><span class="return-value">R$ 0,00</span></td>
    <td class="cell-resultado">
      <select onchange="handleResultChange(this)" class="pending">
        <option value="pending">Pendente</option>
        <option value="green">Green</option>
        <option value="red">Red</option>
        <option value="cash">Cash</option>
      </select>
    </td>
    <td class="cell-casa-apostas">
      <select class="casa-apostas-select">
        <option value="betano">🔥 Betano</option>
        <option value="superbet">💎 SuperBet</option>
        <option value="bet365">🎯 Bet365</option>
        <option value="estrelabet">⭐ Estrelabet</option>
        <option value="outros">🏪 Outros</option>
      </select>
    </td>
    <td class="cell-acoes">
      <button class="delete-btn" onclick="removeRow(this)">🗑️</button>
    </td>
  `;

  // Inserir a nova linha e reorganizar por data
  tbody.appendChild(newRow);
  sortTableByDate(month); // Reorganizar após adicionar

  // Adicionar event listener para reordenar quando a data for preenchida
  const dateInput = newRow.querySelector(".cell-data input");
  dateInput.addEventListener("change", function () {
    sortTableByDate(month);
    updateStats();
  });

  const inputs = newRow.querySelectorAll("input, select");
  inputs.forEach((input) => {
    input.addEventListener("change", () => {
      updateStats();
    });
  });
}

const months = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

// Função para inicializar as tabs
function initializeTabs() {
  const tabsHeader = document.getElementById("tabs-header");
  const monthContents = document.getElementById("month-contents");

  // Gerar tabs
  months.forEach((month, index) => {
    const tab = document.createElement("div");
    tab.className = index === 8 ? "tab active" : "tab"; // setembro ativo
    tab.textContent = month.charAt(0).toUpperCase() + month.slice(1);
    tab.onclick = () => showMonth(month);
    tabsHeader.appendChild(tab);

    // Gerar conteúdo do mês
    const content = document.createElement("div");
    content.id = month;
    content.className = "month-content";
    content.style.display = index === 8 ? "block" : "none";
    content.innerHTML = createMonthContent(month);
    monthContents.appendChild(content);
  });
}

function createMonthContent(month) {
  return `
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>Data</th>
            <th>Tipo</th>
            <th>Esporte</th>
            <th>Jogo</th>
            <th>Método</th>
            <th>Confiança</th>
            <th>Odd</th>
            <th>Unidade</th>
            <th>Retorno</th>
            <th>Resultado</th>
            <th>Casa de Apostas</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody id="${month}-tbody"></tbody>
      </table>
    </div>
    <button class="add-btn" onclick="addNewBet('${month}')">
      + Adicionar Aposta
    </button>
  `;
}

// Função corrigida para reordenar a tabela (do menor para o maior)
function sortTableByDate(month) {
  const tbody = document.getElementById(month + "-tbody");
  const rows = Array.from(tbody.querySelectorAll("tr"));

  rows.sort((a, b) => {
    const dateA = new Date(
      a.querySelector(".cell-data input").value || "1970-01-01"
    );
    const dateB = new Date(
      b.querySelector(".cell-data input").value || "1970-01-01"
    );
    return dateA - dateB; // Ordem crescente (mais antigo primeiro)
  });

  // Limpar tbody e readicionar as linhas ordenadas
  tbody.innerHTML = "";
  rows.forEach((row) => tbody.appendChild(row));
}

function handleTipoChange(select) {
  const row = select.closest("tr");
  const metodoCell = row.querySelector(".cell-metodo");
  const esporteCell = row.querySelector(".cell-esporte");
  const eventoCell = row.querySelector(".cell-evento");

  if (select.value === "multipla") {
    currentMultiplaRow = row;
    openMultiplaModal();
  } else {
    // Resetar para simples
    metodoCell.innerHTML =
      '<input type="text" placeholder="Método/Estratégia">';
    esporteCell.innerHTML = `
      <select>
        <option value="futebol">⚽ Futebol</option>
        <option value="basquete">🏀 Basquete</option>
        <option value="tenis">🎾 Tênis</option>
        <option value="volei">🏐 Vôlei</option>
        <option value="ufc">🥊 UFC/MMA</option>
        <option value="ciclismo">🚴 Ciclismo</option>
        <option value="esports">🎮 E-Sports</option>
        <option value="outros">🏆 Outros</option>
      </select>
    `;
    eventoCell.innerHTML = '<input type="text" placeholder="Nome do jogo">';

    // Readicionar event listeners
    const inputs = row.querySelectorAll("input, select");
    inputs.forEach((input) => {
      input.addEventListener("change", () => {
        updateStats();
      });
    });
  }
}

function openMultiplaModal() {
  const modal = document.getElementById("multiplaModal");
  modal.style.display = "block";
  document.body.style.overflow = "hidden";

  const container = document.getElementById("games-container");
  container.innerHTML = "";
  document.getElementById("multiplaOdd").value = "";

  addGameToMultipla();
  addGameToMultipla(); // 2 jogos por padrão
}

function closeModal() {
  document.getElementById("multiplaModal").style.display = "none";
  document.body.style.overflow = "auto";
}

function addGameToMultipla() {
  const container = document.getElementById("games-container");
  const gameRow = document.createElement("div");
  gameRow.className = "game-row";
  gameRow.innerHTML = `
    <input type="text" placeholder="Nome do evento" class="game-event">
    <select class="game-sport">
      <option>Futebol</option>
      <option>Basquete</option>
      <option>Tênis</option>
      <option>Vôlei</option>
      <option>UFC/MMA</option>
      <option>E-Sports</option>
      <option>Outros</option>
    </select>
    <input type="text" placeholder="Método/Mercado" class="game-method">
    <button type="button" class="remove-game" onclick="removeGame(this)">×</button>
  `;
  container.appendChild(gameRow);
}

function removeGame(button) {
  const container = document.getElementById("games-container");
  if (container.children.length > 2) {
    button.parentElement.remove();
  } else {
    alert("Uma múltipla deve ter pelo menos 2 jogos!");
  }
}

function saveMultipla() {
  const games = [];
  const gameRows = document.querySelectorAll(".game-row");
  const multiplaOdd = parseFloat(document.getElementById("multiplaOdd").value);

  if (!multiplaOdd || multiplaOdd <= 1) {
    alert("Por favor, insira uma odd válida para a múltipla!");
    return;
  }

  gameRows.forEach((row) => {
    const event = row.querySelector(".game-event").value;
    const sport = row.querySelector(".game-sport").value;
    const method = row.querySelector(".game-method").value;

    if (event.trim() && method.trim()) {
      games.push({ event: event.trim(), sport, method: method.trim() });
    }
  });

  if (games.length < 2) {
    alert("Uma múltipla deve ter pelo menos 2 jogos válidos!");
    return;
  }

  const rowId = currentMultiplaRow.getAttribute("data-row-id");
  multiplaData[rowId] = { games, odd: multiplaOdd };

  // Criar resumo dos esportes
  const sportsCount = {};
  games.forEach((game) => {
    const sportName = game.sport;
    sportsCount[sportName] = (sportsCount[sportName] || 0) + 1;
  });

  const sportsIcons = {
    Futebol: "⚽",
    Basquete: "🏀",
    Tênis: "🎾",
    Vôlei: "🏐",
    "UFC/MMA": "🥊",
    Ciclismo: "🚴",
    "E-Sports": "🎮",
    Outros: "🏆",
  };

  const sportsSummary = Object.entries(sportsCount)
    .map(
      ([sport, count]) =>
        `${sportsIcons[sport] || "🏆"} ${sport}${
          count > 1 ? ` (${count})` : ""
        }`
    )
    .join(", ");

  // Criar resumo dos métodos (primeiros 2-3 métodos)
  const methodsSummary =
    games
      .slice(0, 3)
      .map((game) => game.method)
      .join(", ") + (games.length > 3 ? "..." : "");

  // Atualizar células
  const eventoCell = currentMultiplaRow.querySelector(".cell-evento");
  eventoCell.innerHTML = `<button class="multipla-btn" onclick="viewMultipla('${rowId}')">🎯 Múltipla (${games.length} jogos)</button>`;

  const metodoCell = currentMultiplaRow.querySelector(".cell-metodo");
  metodoCell.innerHTML = `<span style="color: #4a5568; font-weight: 500; font-size: 12px;">${methodsSummary}</span>`;

  const esporteCell = currentMultiplaRow.querySelector(".cell-esporte");
  esporteCell.innerHTML = `<span style="color: #4a5568; font-weight: 500; font-size: 12px;">${sportsSummary}</span>`;

  const oddCell = currentMultiplaRow.querySelector(".cell-odd input");
  oddCell.value = multiplaOdd.toFixed(2);

  calculateReturn(oddCell);
  closeModal();
}

function viewMultipla(rowId) {
  const multipla = multiplaData[rowId];
  if (!multipla) {
    alert("Dados da múltipla não encontrados!");
    return;
  }

  const container = document.getElementById("games-container");
  container.innerHTML = "";
  document.getElementById("multiplaOdd").value = multipla.odd || "";

  multipla.games.forEach((game) => {
    const gameRow = document.createElement("div");
    gameRow.className = "game-row";
    gameRow.innerHTML = `
      <input type="text" value="${game.event}" class="game-event">
      <select class="game-sport">
        <option ${game.sport === "Futebol" ? "selected" : ""}>Futebol</option>
        <option ${game.sport === "Basquete" ? "selected" : ""}>Basquete</option>
        <option ${game.sport === "Tênis" ? "selected" : ""}>Tênis</option>
        <option ${game.sport === "Vôlei" ? "selected" : ""}>Vôlei</option>
        <option ${game.sport === "UFC/MMA" ? "selected" : ""}>UFC/MMA</option>
        <option ${game.sport === "E-Sports" ? "selected" : ""}>E-Sports</option>
        <option ${game.sport === "Outros" ? "selected" : ""}>Outros</option>
      </select>
      <input type="text" value="${game.method}" class="game-method">
      <button type="button" class="remove-game" onclick="removeGame(this)">×</button>
    `;
    container.appendChild(gameRow);
  });

  currentMultiplaRow = document.querySelector(`tr[data-row-id="${rowId}"]`);
  document.getElementById("multiplaModal").style.display = "block";
  document.body.style.overflow = "hidden";
}

function toggleConfidence(element) {
  const currentValue = parseInt(element.textContent);
  let newValue;

  if (currentValue === 20) newValue = 40;
  else if (currentValue === 40) newValue = 60;
  else if (currentValue === 60) newValue = 80;
  else if (currentValue === 80) newValue = 100;
  else newValue = 20;

  element.textContent = newValue + "%";
  element.className = `confidence conf-${newValue}`;
}

function calculateReturn(oddInput) {
  const row = oddInput.closest("tr");
  const odd = parseFloat(oddInput.value) || 0;
  const unidade =
    parseFloat(row.querySelector(".cell-unidade input").value) || 0;
  const returnValue = odd * unidade * 50;

  row.querySelector(".cell-retorno .return-value").textContent =
    formatBRL(returnValue);
  updateStats();
}

function handleResultChange(select) {
  select.classList.remove("green", "red", "cash", "pending");
  select.classList.add(select.value);

  updateStats();

  // Reaplicar filtro após mudança de resultado
  applyFilter(currentFilter);
}

function removeRow(button) {
  const row = button.closest("tr");
  const rowId = row.getAttribute("data-row-id");

  // Remove dos dados da múltipla se existir
  if (rowId && multiplaData[rowId]) {
    delete multiplaData[rowId];
  }

  // Remove a linha da tela
  row.remove();

  // Atualiza as estatísticas
  updateStats();

  // CORREÇÃO: Salva os dados atualizados no localStorage
  saveBetsData();

  showNotification("A Aposta foi Atualizada!");
}

// FUNÇÃO CORRIGIDA - Calcula stats do mês ativo + saldo total geral
function updateStats() {
  // === STATS DO MÊS ATIVO (para cards superiores) ===
  let monthlyGreen = 0,
    monthlyRed = 0,
    monthlyCash = 0,
    monthlyReturn = 0;

  // IMPORTANTE: Usa apenas o mês atual para Green/Red/Assertividade
  const tbody = document.getElementById(currentActiveMonth + "-tbody");
  const rows = tbody.querySelectorAll("tr");

  rows.forEach((row) => {
    const resultSelect = row.querySelector(".cell-resultado select");
    const dateInput = row.querySelector(".cell-data input");
    const odd = parseFloat(row.querySelector(".cell-odd input").value) || 0;
    const unidade =
      parseFloat(row.querySelector(".cell-unidade input").value) || 0;
    const apostado = unidade * 50;
    let lucro = 0;

    if (resultSelect.value === "green") {
      lucro = odd * unidade * 50 - apostado;
      monthlyGreen++;
    } else if (resultSelect.value === "red") {
      lucro = -apostado;
      monthlyRed++;
    } else if (resultSelect.value === "cash") {
      lucro = 0;
      monthlyCash++;
    }

    monthlyReturn += lucro;
  });

  // === SALDO TOTAL GERAL (para informações da banca) ===
  let totalGlobalReturn = 0;

  months.forEach((month) => {
    const monthTbody = document.getElementById(month + "-tbody");
    const monthRows = monthTbody.querySelectorAll("tr");

    monthRows.forEach((row) => {
      const resultSelect = row.querySelector(".cell-resultado select");
      const odd = parseFloat(row.querySelector(".cell-odd input").value) || 0;
      const unidade =
        parseFloat(row.querySelector(".cell-unidade input").value) || 0;
      const apostado = unidade * 50;
      let lucro = 0;

      if (resultSelect.value === "green") {
        lucro = odd * unidade * 50 - apostado;
      } else if (resultSelect.value === "red") {
        lucro = -apostado;
      } else if (resultSelect.value === "cash") {
        lucro = 0;
      }

      totalGlobalReturn += lucro;
    });
  });

  // === CALCULAR ASSERTIVIDADE DO MÊS ===
  const totalBets = monthlyGreen + monthlyRed + monthlyCash;
  const assertividade =
    totalBets > 0 ? ((monthlyGreen / totalBets) * 100).toFixed(1) : 0;

  // === ATUALIZAR CARDS SUPERIORES (dados do mês) ===
  document.getElementById("totalGreen").textContent = monthlyGreen;
  document.getElementById("totalRed").textContent = monthlyRed;
  document.getElementById("totalReturn").textContent = formatBRL(monthlyReturn);
  document.getElementById("assertividade").textContent = assertividade + "%";

  // === ATUALIZAR SALDO ATUAL (dados globais) ===
  // === ATUALIZAR SALDO ATUAL E UNIDADES (dados globais) ===
  const currentBalance = 2900 + totalGlobalReturn;
  const currentUnits = Math.floor(currentBalance / 50);

  document.getElementById("currentBalance").textContent =
    formatBRL(currentBalance);
  document.getElementById("currentUnits").textContent = currentUnits;

  // === ATUALIZAR ESTATÍSTICAS MENSAIS ===
  document.getElementById(
    "changeGreen"
  ).innerHTML = `↗ ${monthlyGreen} este mês`;
  document.getElementById("changeRed").innerHTML = `↘ ${monthlyRed} este mês`;

  // === FEEDBACK DA ASSERTIVIDADE ===
  const assertividadeElement = document.getElementById("changeAssertividade");
  if (assertividade >= 70) {
    assertividadeElement.innerHTML = `🎯 Excelente performance em ${currentActiveMonth}`;
    assertividadeElement.className = "stat-change positive";
  } else if (assertividade >= 50) {
    assertividadeElement.innerHTML = `📊 Performance regular em ${currentActiveMonth}`;
    assertividadeElement.className = "stat-change";
  } else {
    assertividadeElement.innerHTML = `⚠️ Precisa melhorar em ${currentActiveMonth}`;
    assertividadeElement.className = "stat-change negative";
  }

  // === VARIAÇÃO DO RETORNO MENSAL ===
  const changeReturnElement = document.getElementById("changeReturn");
  if (monthlyReturn > 0) {
    changeReturnElement.innerHTML = `↗ +${formatBRL(monthlyReturn)} este mês`;
    changeReturnElement.className = "stat-change positive";
  } else if (monthlyReturn < 0) {
    changeReturnElement.innerHTML = `↘ ${formatBRL(monthlyReturn)} este mês`;
    changeReturnElement.className = "stat-change negative";
  } else {
    changeReturnElement.innerHTML = "→ Sem alteração este mês";
    changeReturnElement.className = "stat-change";
  }
}

function saveBetsData() {
  months.forEach((month) => {
    const tbody = document.getElementById(month + "-tbody");
    const rows = tbody.querySelectorAll("tr");
    const monthData = [];

    rows.forEach((row) => {
      const rowId = row.getAttribute("data-row-id");
      const isMultipla = !!row.querySelector(".multipla-btn");

      monthData.push({
        rowId: rowId,
        data: row.querySelector(".cell-data input").value,
        tipo: row.querySelector(".cell-tipo select").value,
        esporte: isMultipla
          ? "Futebol"
          : row.querySelector(".cell-esporte select")?.value || "",
        evento: isMultipla
          ? "Múltipla"
          : row.querySelector(".cell-evento input")?.value || "",
        metodo: isMultipla
          ? "-"
          : row.querySelector(".cell-metodo input")?.value || "",
        confianca: row.querySelector(".cell-confianca .confidence").textContent,
        odd: row.querySelector(".cell-odd input").value,
        unidade: row.querySelector(".cell-unidade input").value,
        resultado: row.querySelector(".cell-resultado select").value,
        casaApostas: row.querySelector(".cell-casa-apostas select").value,
        isMultipla: isMultipla,
      });
    });

    betsData[month] = monthData;
  });

  showNotification("A Aposta foi Salva!");

  localStorage.setItem("betsData", JSON.stringify(betsData));
  localStorage.setItem("multiplaData", JSON.stringify(multiplaData));
}

function loadAllBets() {
  const savedBets = localStorage.getItem("betsData");
  const savedMultiplas = localStorage.getItem("multiplaData");

  if (savedBets) betsData = JSON.parse(savedBets);
  if (savedMultiplas) multiplaData = JSON.parse(savedMultiplas);

  months.forEach((month) => {
    const monthData = betsData[month] || [];
    const tbody = document.getElementById(month + "-tbody");

    // ORDENAR OS DADOS POR DATA (CRESCENTE - MAIS ANTIGO PRIMEIRO)
    const sortedData = monthData.sort((a, b) => {
      const dateA = new Date(a.data || "1970-01-01");
      const dateB = new Date(b.data || "1970-01-01");
      return dateA - dateB; // Ordem crescente (mais antigo primeiro)
    });

    sortedData.forEach((bet) => {
      const newRow = tbody.insertRow();
      const rowId =
        bet.rowId ||
        `${month}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      newRow.setAttribute("data-row-id", rowId);

      newRow.innerHTML = `
        <td class="cell-data"><input type="date"></td>
        <td class="cell-tipo"><select onchange="handleTipoChange(this)">
          <option value="simples">Simples</option>
          <option value="multipla">Múltipla</option>
        </select></td>
        <td class="cell-esporte"><select>
          <option value="futebol">⚽ Futebol</option>
          <option value="basquete">🏀 Basquete</option>
          <option value="tenis">🎾 Tênis</option>
          <option value="volei">🏐 Vôlei</option>
          <option value="ufc">🥊 UFC/MMA</option>
          <option value="ciclismo">🚴 Ciclismo</option>
          <option value="esports">🎮 E-Sports</option>
          <option value="outros">🏆 Outros</option>
        </select></td>
        <td class="cell-evento"><input type="text" placeholder="Nome do jogo"></td>
        <td class="cell-metodo"><input type="text" placeholder="Método/Estratégia"></td>
        <td class="cell-confianca"><span class="confidence conf-60" onclick="toggleConfidence(this)">60%</span></td>
        <td class="cell-odd"><input type="number" step="0.01" min="1.01" placeholder="1.00" onchange="calculateReturn(this)"></td>
        <td class="cell-unidade"><input type="number" step="0.1" min="0.1" placeholder="1.0" onchange="calculateReturn(this)"></td>
        <td class="cell-retorno"><span class="return-value">R$ 0,00</span></td>
        <td class="cell-resultado"><select onchange="handleResultChange(this)">
          <option value="pending">Pendente</option>
          <option value="green">Green</option>
          <option value="red">Red</option>
          <option value="cash">Cash</option>
        </select></td>
        <td class="cell-casa-apostas"><select class="casa-apostas-select">
          <option value="bet365">🎯 Bet365</option>
          <option value="superbet">💎 SuperBet</option>
          <option value="pixbet">⚡ Pixbet</option>
          <option value="betano">🔥 Betano</option>
          <option value="sportingbet">⭐ Sportingbet</option>
          <option value="1xbet">🎰 1xBet</option>
          <option value="outros">🏪 Outros</option>
        </select></td>
        <td class="cell-acoes"><button class="delete-btn" onclick="removeRow(this)">🗑️</button></td>
      `;

      // Preencher os dados salvos
      newRow.querySelector(".cell-data input").value = bet.data || "";
      newRow.querySelector(".cell-tipo select").value = bet.tipo || "simples";

      // Verificar se é múltipla
      if (bet.isMultipla && multiplaData[rowId]) {
        const multipla = multiplaData[rowId];

        // Criar resumos
        const sportsCount = {};
        multipla.games?.forEach((game) => {
          sportsCount[game.sport] = (sportsCount[game.sport] || 0) + 1;
        });

        const sportsIcons = {
          Futebol: "⚽",
          Basquete: "🏀",
          Tênis: "🎾",
          Vôlei: "🏐",
          "UFC/MMA": "🥊",
          Ciclismo: "🚴",
          "E-Sports": "🎮",
          Outros: "🏆",
        };

        const sportsSummary = Object.entries(sportsCount)
          .map(
            ([sport, count]) =>
              `${sportsIcons[sport] || "🏆"} ${sport}${
                count > 1 ? ` (${count})` : ""
              }`
          )
          .join(", ");

        const methodsSummary =
          multipla.games
            ?.slice(0, 3)
            .map((game) => game.method)
            .join(", ") + (multipla.games?.length > 3 ? "..." : "");

        newRow.querySelector(
          ".cell-evento"
        ).innerHTML = `<button class="multipla-btn" onclick="viewMultipla('${rowId}')">🎯 Múltipla (${
          multipla.games?.length || 0
        } jogos)</button>`;
        newRow.querySelector(
          ".cell-metodo"
        ).innerHTML = `<span style="color: #4a5568; font-weight: 500; font-size: 12px;">${methodsSummary}</span>`;
        newRow.querySelector(
          ".cell-esporte"
        ).innerHTML = `<span style="color: #4a5568; font-weight: 500; font-size: 12px;">${sportsSummary}</span>`;
      } else {
        // Se for aposta simples, preencher os campos normalmente
        if (!bet.isMultipla) {
          newRow.querySelector(".cell-esporte select").value =
            bet.esporte || "Futebol";
          newRow.querySelector(".cell-evento input").value = bet.evento || "";
          newRow.querySelector(".cell-metodo input").value = bet.metodo || "";
        }
      }

      const confidenceSpan = newRow.querySelector(
        ".cell-confianca .confidence"
      );
      confidenceSpan.textContent = bet.confianca || "60%";
      confidenceSpan.className = `confidence conf-${
        parseInt(bet.confianca) || 60
      }`;

      newRow.querySelector(".cell-odd input").value = bet.odd || "";
      newRow.querySelector(".cell-unidade input").value = bet.unidade || "";

      const resultSelect = newRow.querySelector(".cell-resultado select");
      resultSelect.value = bet.resultado || "pending";
      resultSelect.classList.remove("green", "red", "cash", "pending");
      resultSelect.classList.add(bet.resultado || "pending");

      newRow.querySelector(".cell-casa-apostas select").value =
        bet.casaApostas || "betano";

      calculateReturn(newRow.querySelector(".cell-odd input"));

      const inputs = newRow.querySelectorAll("input, select");
      inputs.forEach((input) => {
        input.addEventListener("change", () => {
          updateStats();
        });
      });
    });
  });

  // === ADIÇÕES PARA RESTAURAR ESTADO ===
  // Restaurar filtro salvo
  const savedFilter = localStorage.getItem("currentFilter");
  if (savedFilter) {
    currentFilter = savedFilter;
  }

  // Restaurar aba ativa
  const savedTab = localStorage.getItem("lastActiveTab");
  if (savedTab && document.getElementById(savedTab)) {
    currentActiveMonth = savedTab;
    showMonth(savedTab);
  } else {
    // Aplicar filtro na aba padrão
    applyFilter(currentFilter);
  }

  // Restaurar posições de scroll
  const savedPositions = localStorage.getItem("scrollPositions");
  if (savedPositions) {
    scrollPositions = JSON.parse(savedPositions);
  }
}

// Fechar modal ao clicar fora
window.onclick = function (event) {
  const modal = document.getElementById("multiplaModal");
  if (event.target === modal) closeModal();
};

// Export / Import
function exportData() {
  const data = {
    betsData,
    multiplaData,
    exportDate: new Date().toISOString(),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `apostas_backup_${new Date().toISOString().split("T")[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function importData(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const data = JSON.parse(e.target.result);
      if (data.betsData) betsData = data.betsData;
      if (data.multiplaData) multiplaData = data.multiplaData;

      document
        .querySelectorAll("tbody")
        .forEach((tbody) => (tbody.innerHTML = ""));
      loadAllBets();
      updateStats();
      alert("Dados importados com sucesso! 🎉");
    } catch (err) {
      alert("Erro ao importar arquivo: " + err.message);
    }
  };
  reader.readAsText(file);
  event.target.value = "";
}

// Função de filtro
function applyFilter(filterType) {
  currentFilter = filterType;

  // Atualizar botões de filtro
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.classList.remove("active");
  });
  document
    .querySelector(`[data-filter="${filterType}"]`)
    .classList.add("active");

  // Aplicar filtro na aba ativa
  const activeTab = document.querySelector(
    '.month-content:not([style*="display: none"])'
  );
  if (activeTab) {
    const tbody = activeTab.querySelector("tbody");
    const rows = tbody.querySelectorAll("tr");

    rows.forEach((row) => {
      const resultSelect = row.querySelector(".cell-resultado select");
      const resultValue = resultSelect ? resultSelect.value : "";

      if (filterType === "all") {
        row.classList.remove("row-hidden");
      } else {
        if (resultValue === filterType) {
          row.classList.remove("row-hidden");
        } else {
          row.classList.add("row-hidden");
        }
      }
    });
  }

  // Salvar filtro no localStorage
  localStorage.setItem("currentFilter", filterType);
}

// Salvar posição de scroll
function saveScrollPosition() {
  const activeContent = document.querySelector(
    '.month-content:not([style*="display: none"])'
  );
  if (activeContent) {
    const container = activeContent.querySelector(".table-container");
    const tabId = activeContent.id;
    if (container) {
      scrollPositions[tabId] = container.scrollTop;
      localStorage.setItem("scrollPositions", JSON.stringify(scrollPositions));
    }
  }
}

// Restaurar posição de scroll
function restoreScrollPosition(tabId) {
  const savedPositions = localStorage.getItem("scrollPositions");
  if (savedPositions) {
    scrollPositions = JSON.parse(savedPositions);
  }

  setTimeout(() => {
    const container = document.querySelector(`#${tabId} .table-container`);
    if (container && scrollPositions[tabId]) {
      container.scrollTop = scrollPositions[tabId];
    }
  }, 100);
}
