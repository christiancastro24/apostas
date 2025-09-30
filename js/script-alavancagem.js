// Variáveis globais
let alavancagens = [];
let currentAlavancagem = null;

// Inicialização
document.addEventListener("DOMContentLoaded", function () {
  loadFromStorage();
  showListView();

  // Event listener para o formulário
  const form = document.getElementById("create-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      createAlavancagem();
    });
  }
});

// Carregar do localStorage
function loadFromStorage() {
  const stored = localStorage.getItem("alavancagens");
  if (stored) {
    try {
      alavancagens = JSON.parse(stored);
    } catch (e) {
      console.error("Erro ao carregar alavancagens:", e);
      alavancagens = [];
    }
  }
}

// Salvar no localStorage
function saveAlavancagens() {
  try {
    localStorage.setItem("alavancagens", JSON.stringify(alavancagens));
  } catch (e) {
    console.error("Erro ao salvar alavancagens:", e);
    alert("Erro ao salvar dados. Tente novamente.");
  }
}

// Calcular estatísticas
function calculateStats() {
  let totalGanho = 0;
  let totalPerdido = 0;
  let completas = 0;
  let falhas = 0;

  alavancagens.forEach((alav) => {
    if (alav.status === "complete") {
      const lucroFinal = alav.levels[alav.levels.length - 1].lucro;
      totalGanho += lucroFinal - alav.valorInicial;
      completas++;
    } else if (alav.status === "failed") {
      totalPerdido += alav.valorInicial;
      falhas++;
    }
  });

  const total = completas + falhas;
  const taxaSucesso = total > 0 ? ((completas / total) * 100).toFixed(1) : 0;
  const lucroLiquido = totalGanho - totalPerdido;

  return {
    totalGanho,
    totalPerdido,
    taxaSucesso,
    lucroLiquido,
  };
}

// Atualizar dashboard de estatísticas
function updateStatsDashboard() {
  const stats = calculateStats();

  document.getElementById(
    "total-ganho"
  ).textContent = `R$ ${stats.totalGanho.toFixed(2)}`;
  document.getElementById(
    "total-perdido"
  ).textContent = `R$ ${stats.totalPerdido.toFixed(2)}`;
  document.getElementById("taxa-sucesso").textContent = `${stats.taxaSucesso}%`;

  const lucroLiquidoEl = document.getElementById("lucro-liquido");
  lucroLiquidoEl.textContent = `R$ ${stats.lucroLiquido.toFixed(2)}`;

  // Mudar cor do lucro líquido
  if (stats.lucroLiquido > 0) {
    lucroLiquidoEl.className = "stat-value success";
  } else if (stats.lucroLiquido < 0) {
    lucroLiquidoEl.className = "stat-value danger";
  } else {
    lucroLiquidoEl.className = "stat-value warning";
  }
}

// Navegação entre views
function showListView() {
  document.getElementById("list-view").style.display = "block";
  document.getElementById("create-view").style.display = "none";
  document.getElementById("detail-view").style.display = "none";
  updateStatsDashboard();
  loadAlavancagens();
}

function showCreateForm() {
  document.getElementById("list-view").style.display = "none";
  document.getElementById("create-view").style.display = "block";
  document.getElementById("detail-view").style.display = "none";
}

function showDetailView(id) {
  currentAlavancagem = alavancagens.find((a) => a.id === id);
  if (!currentAlavancagem) {
    alert("Alavancagem não encontrada!");
    showListView();
    return;
  }

  document.getElementById("list-view").style.display = "none";
  document.getElementById("create-view").style.display = "none";
  document.getElementById("detail-view").style.display = "block";
  renderDetailView();
}

// Criar nova alavancagem
function createAlavancagem() {
  const nome = document.getElementById("nome").value.trim();
  const valorInicial = parseFloat(
    document.getElementById("valor-inicial").value
  );
  const niveis = parseInt(document.getElementById("niveis").value);
  const oddMin = parseFloat(document.getElementById("odd-min").value);
  const oddMax = parseFloat(document.getElementById("odd-max").value);

  // Validações
  if (!nome) {
    alert("Digite um nome para a alavancagem!");
    return;
  }

  if (isNaN(valorInicial) || valorInicial <= 0) {
    alert("Digite um valor inicial válido!");
    return;
  }

  if (isNaN(niveis) || niveis < 2 || niveis > 10) {
    alert("O número de Entradas deve estar entre 2 e 10!");
    return;
  }

  if (isNaN(oddMin) || isNaN(oddMax) || oddMin < 1.01 || oddMax < 1.01) {
    alert("Digite odds válidas (mínimo 1.01)!");
    return;
  }

  if (oddMin >= oddMax) {
    alert("A odd mínima deve ser menor que a odd máxima!");
    return;
  }

  // Calcular Entradas com odd média
  const oddMedia = (oddMin + oddMax) / 2;
  const levels = [];
  let valorAtual = valorInicial;

  for (let i = 1; i <= niveis; i++) {
    const lucro = valorAtual * oddMedia;
    levels.push({
      nivel: i,
      valorBase: valorAtual,
      lucro: lucro,
      checked: false,
    });
    valorAtual = lucro;
  }

  const alavancagem = {
    id: Date.now(),
    nome: nome,
    valorInicial: valorInicial,
    niveis: niveis,
    oddMin: oddMin,
    oddMax: oddMax,
    oddMedia: oddMedia,
    levels: levels,
    createdAt: new Date().toISOString(),
    completedLevels: 0,
    status: "progress", // progress, complete, failed
  };

  alavancagens.push(alavancagem);
  saveAlavancagens();

  // Limpar formulário
  document.getElementById("create-form").reset();
  showListView();
}

// Carregar lista de alavancagens
function loadAlavancagens() {
  const container = document.getElementById("alavancagens-list");

  if (!container) return;

  if (alavancagens.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="12" y1="8" x2="12" y2="16"></line>
          <line x1="8" y1="12" x2="16" y2="12"></line>
        </svg>
        <h3>Nenhuma alavancagem cadastrada</h3>
        <p>Crie sua primeira alavancagem para começar a controlar seus lucros</p>
        <button class="btn-primary" onclick="showCreateForm()">
          Criar Primeira Alavancagem
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = alavancagens
    .map((alav) => {
      const progress = (alav.completedLevels / alav.niveis) * 100;
      const lucroFinal = alav.levels[alav.levels.length - 1].lucro;
      const dataFormatada = new Date(alav.createdAt).toLocaleDateString(
        "pt-BR"
      );

      let badgeClass = "badge-progress";
      let badgeText = "Em Progresso";
      let progressClass = "";

      if (alav.status === "complete") {
        badgeClass = "badge-complete";
        badgeText = "Completa";
        progressClass = "complete";
      } else if (alav.status === "failed") {
        badgeClass = "badge-failed";
        badgeText = "Falhou";
        progressClass = "failed";
      }

      return `
      <div class="alavancagem-card" onclick="showDetailView(${alav.id})">
        <div class="card-header-section">
          <div class="card-header-row">
            <div>
              <div class="card-title">${alav.nome}</div>
              <div class="card-date">${dataFormatada}</div>
            </div>
            <div class="card-badge ${badgeClass}">
              ${badgeText}
            </div>
          </div>
        </div>
        
        <div class="card-body">
          <div class="card-stats">
            <div class="stat">
              <div class="stat-label">Progresso</div>
              <div class="stat-value">${alav.completedLevels}/${
        alav.niveis
      }</div>
            </div>
            <div class="stat">
              <div class="stat-label">Lucro Final</div>
              <div class="stat-value success">R$ ${lucroFinal.toFixed(2)}</div>
            </div>
            <div class="stat">
              <div class="stat-label">Odds</div>
              <div class="stat-value">${alav.oddMin.toFixed(
                2
              )} - ${alav.oddMax.toFixed(2)}</div>
            </div>
          </div>
          
          <div class="progress-bar">
            <div class="progress-fill ${progressClass}" style="width: ${progress}%"></div>
          </div>
        </div>
      </div>
    `;
    })
    .join("");
}

// Renderizar view de detalhes
function renderDetailView() {
  if (!currentAlavancagem) return;

  // Atualizar header
  document.getElementById("detail-nome").textContent = currentAlavancagem.nome;
  document.getElementById(
    "detail-progresso"
  ).textContent = `${currentAlavancagem.completedLevels}/${currentAlavancagem.niveis} Entradas Completas`;

  const lucroFinal =
    currentAlavancagem.levels[currentAlavancagem.levels.length - 1].lucro;
  document.getElementById(
    "detail-lucro-total"
  ).textContent = `Lucro potencial: R$ ${lucroFinal.toFixed(2)}`;

  // Atualizar título do card
  document.getElementById(
    "card-title"
  ).textContent = `ALAVANCAGEM ${currentAlavancagem.niveis}X`;

  // Mostrar/ocultar botões baseado no status
  const btnComplete = document.getElementById("btn-complete");
  const btnFailed = document.getElementById("btn-failed");

  if (
    currentAlavancagem.status === "complete" ||
    currentAlavancagem.status === "failed"
  ) {
    btnComplete.style.display = "none";
    btnFailed.style.display = "none";
  } else {
    btnComplete.style.display = "inline-flex";
    btnFailed.style.display = "inline-flex";
  }

  // Renderizar tabela
  const tableRows = document.getElementById("table-rows");
  tableRows.innerHTML = currentAlavancagem.levels
    .map((level) => {
      // Se tem jogo cadastrado, mostra apenas a odd real (sem o nome do jogo)
      const oddDisplay = level.jogo
        ? level.oddReal.toFixed(2)
        : `${currentAlavancagem.oddMin.toFixed(
            2
          )} - ${currentAlavancagem.oddMax.toFixed(2)}`;

      const lucroDisplay = level.jogo ? level.lucroReal : level.lucro;
      const valorBaseDisplay = level.jogo
        ? level.valorApostado
        : level.valorBase;

      return `
      <div class="table-row ${level.checked ? "checked" : ""}" id="row-${
        level.nivel
      }">
        <div class="check-cell">
          <div class="check-box ${
            level.checked ? "checked" : ""
          }" onclick="toggleCheck(${level.nivel})">
            <svg class="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
        </div>
        <div class="nivel" onclick="openSingleLevelModal(${
          level.nivel
        })" style="cursor: pointer;" title="Clique para configurar">
          ${level.nivel}
          ${
            level.jogo
              ? '<div style="font-size: 14px; margin-top: 4px; color: #4ade80;">✓</div>'
              : ""
          }
        </div>
        <div class="odds">
          ${oddDisplay}
        </div>
        <div class="lucro-cell">
          <span class="lucro-label">LUCRO</span>
          <span class="lucro-valor">R$ ${lucroDisplay.toFixed(2)}</span>
          <span class="lucro-sub">(de R$ ${valorBaseDisplay.toFixed(2)})</span>
        </div>
      </div>
    `;
    })
    .join("");

  updateCounter();
}

// Abrir modal de configuração
function openConfigModal() {
  if (!currentAlavancagem) return;

  const modalBody = document.getElementById("config-modal-body");

  modalBody.innerHTML = currentAlavancagem.levels
    .map((level, index) => {
      const isConfigured = level.jogo ? true : false;
      const statusClass = isConfigured ? "configured" : "pending";
      const statusText = isConfigured ? "✓ Configurado" : "Pendente";

      // Calcular valor base para este nível
      let valorBase = currentAlavancagem.valorInicial;
      if (index > 0) {
        const nivelAnterior = currentAlavancagem.levels[index - 1];
        valorBase = nivelAnterior.lucroReal || nivelAnterior.lucro;
      }

      return `
      <div class="config-level">
        <div class="config-level-header">
          <div class="config-level-title">
            <span>🎯 Nível ${level.nivel}</span>
          </div>
          <span class="config-level-status ${statusClass}">${statusText}</span>
        </div>
        
        <div class="config-level-form">
          <div class="config-input-group">
            <label>Nome do Jogo</label>
            <input 
              type="text" 
              id="jogo-${level.nivel}" 
              placeholder="Ex: Flamengo x Palmeiras" 
              value="${level.jogo || ""}"
            >
          </div>
          
          <div class="config-input-row">
            <div class="config-input-group">
              <label>Odd Real</label>
              <input 
                type="number" 
                id="odd-${level.nivel}" 
                placeholder="Ex: 1.45" 
                step="0.01" 
                min="1.01"
                value="${level.oddReal || ""}"
              >
            </div>
            <div class="config-input-group">
              <label>Valor Base</label>
              <input 
                type="text" 
                value="R$ ${valorBase.toFixed(2)}" 
                disabled
                style="background: #edf2f7; color: #718096;"
              >
            </div>
          </div>
          
          <div style="display: flex; gap: 8px; margin-top: 8px;">
            <button class="btn-primary" style="flex: 1;" onclick="saveLevelConfig(${
              level.nivel
            })">
              💾 Salvar Nível ${level.nivel}
            </button>
            ${
              isConfigured
                ? `
              <button class="btn-config-clear" onclick="clearLevelConfig(${level.nivel})">
                🗑️
              </button>
            `
                : ""
            }
          </div>
        </div>
      </div>
    `;
    })
    .join("");

  document.getElementById("config-modal").style.display = "flex";
}

// Abrir modal de um nível específico
function openSingleLevelModal(nivel) {
  if (!currentAlavancagem) return;

  // Não permitir editar se já está completa ou falhou
  if (
    currentAlavancagem.status === "complete" ||
    currentAlavancagem.status === "failed"
  ) {
    alert("Não é possível editar uma alavancagem finalizada.");
    return;
  }

  const modalBody = document.getElementById("config-modal-body");
  const levelIndex = currentAlavancagem.levels.findIndex(
    (l) => l.nivel === nivel
  );
  const level = currentAlavancagem.levels[levelIndex];

  if (!level) return;

  const isConfigured = level.jogo ? true : false;
  const statusClass = isConfigured ? "configured" : "pending";
  const statusText = isConfigured ? "✓ Configurado" : "Pendente";

  // Calcular valor base para este nível
  let valorBase = currentAlavancagem.valorInicial;
  if (levelIndex > 0) {
    const nivelAnterior = currentAlavancagem.levels[levelIndex - 1];
    valorBase = nivelAnterior.lucroReal || nivelAnterior.lucro;
  }

  modalBody.innerHTML = `
    <div class="config-level">
      <div class="config-level-header">
        <div class="config-level-title">
          <span>🎯 Nível ${level.nivel}</span>
        </div>
        <span class="config-level-status ${statusClass}">${statusText}</span>
      </div>
      
      <div class="config-level-form">
        <div class="config-input-group">
          <label>Nome do Jogo</label>
          <input 
            type="text" 
            id="jogo-${level.nivel}" 
            placeholder="Ex: Flamengo x Palmeiras" 
            value="${level.jogo || ""}"
            autofocus
          >
        </div>
        
        <div class="config-input-row">
          <div class="config-input-group">
            <label>Odd Real</label>
            <input 
              type="number" 
              id="odd-${level.nivel}" 
              placeholder="Ex: 1.45" 
              step="0.01" 
              min="1.01"
              value="${level.oddReal || ""}"
            >
          </div>
          <div class="config-input-group">
            <label>Valor Base</label>
            <input 
              type="text" 
              value="R$ ${valorBase.toFixed(2)}" 
              disabled
              style="background: #edf2f7; color: #718096;"
            >
          </div>
        </div>
        
        <div style="display: flex; gap: 8px; margin-top: 8px;">
          <button class="btn-primary" style="flex: 1;" onclick="saveLevelConfig(${
            level.nivel
          })">
            💾 Salvar Nível ${level.nivel}
          </button>
          ${
            isConfigured
              ? `
            <button class="btn-config-clear" onclick="clearLevelConfig(${level.nivel})">
              🗑️
            </button>
          `
              : ""
          }
        </div>
      </div>
    </div>
    
    <div style="text-align: center; margin-top: 16px;">
      <button class="btn-secondary" onclick="openConfigModal()">
        Ver Todos os Entradas
      </button>
    </div>
  `;

  document.getElementById("config-modal").style.display = "flex";
}

// Fechar modal
function closeConfigModal() {
  document.getElementById("config-modal").style.display = "none";
  renderDetailView(); // Atualizar visualização
}

// Salvar configuração de um nível
function saveLevelConfig(nivel) {
  if (!currentAlavancagem) return;

  const jogoInput = document.getElementById(`jogo-${nivel}`);
  const oddInput = document.getElementById(`odd-${nivel}`);

  const jogo = jogoInput.value.trim();
  const oddReal = parseFloat(oddInput.value);

  if (!jogo) {
    alert("Digite o nome do jogo!");
    jogoInput.focus();
    return;
  }

  if (!oddReal || oddReal < 1.01) {
    alert("Digite uma odd válida (mínimo 1.01)!");
    oddInput.focus();
    return;
  }

  const level = currentAlavancagem.levels.find((l) => l.nivel === nivel);
  if (!level) return;

  // Calcular valor apostado
  let valorApostado = currentAlavancagem.valorInicial;

  if (nivel > 1) {
    const nivelAnterior = currentAlavancagem.levels.find(
      (l) => l.nivel === nivel - 1
    );
    if (nivelAnterior && nivelAnterior.lucroReal) {
      valorApostado = nivelAnterior.lucroReal;
    } else if (nivelAnterior) {
      valorApostado = nivelAnterior.lucro;
    }
  }

  const lucroReal = valorApostado * oddReal;

  // Salvar
  level.jogo = jogo;
  level.oddReal = oddReal;
  level.lucroReal = lucroReal;
  level.valorApostado = valorApostado;

  // Atualizar próximos Entradas
  for (let i = nivel; i < currentAlavancagem.niveis; i++) {
    const nextLevel = currentAlavancagem.levels.find((l) => l.nivel === i + 1);
    if (nextLevel && !nextLevel.jogo) {
      nextLevel.valorBase = level.lucroReal;
      nextLevel.lucro = level.lucroReal * currentAlavancagem.oddMedia;
    }
  }

  // Salvar no storage
  const alavIndex = alavancagens.findIndex(
    (a) => a.id === currentAlavancagem.id
  );
  if (alavIndex !== -1) {
    alavancagens[alavIndex] = currentAlavancagem;
    saveAlavancagens();
  }

  alert(
    `✅ Nível ${nivel} salvo com sucesso!\n\nJogo: ${jogo}\nOdd: ${oddReal.toFixed(
      2
    )}\nLucro: R$ ${lucroReal.toFixed(2)}`
  );

  // Reabrir modal para atualizar
  openConfigModal();
}

// Limpar configuração de um nível
function clearLevelConfig(nivel) {
  if (!currentAlavancagem) return;

  if (!confirm(`Limpar configuração do Nível ${nivel}?`)) return;

  const level = currentAlavancagem.levels.find((l) => l.nivel === nivel);
  if (!level) return;

  level.jogo = null;
  level.oddReal = null;
  level.lucroReal = null;
  level.valorApostado = null;

  // Atualizar
  const alavIndex = alavancagens.findIndex(
    (a) => a.id === currentAlavancagem.id
  );
  if (alavIndex !== -1) {
    alavancagens[alavIndex] = currentAlavancagem;
    saveAlavancagens();
  }

  openConfigModal();
}

// Toggle check nos Entradas
function toggleCheck(nivel) {
  if (!currentAlavancagem) return;

  // Não permitir marcar se já está completa ou falhou
  if (
    currentAlavancagem.status === "complete" ||
    currentAlavancagem.status === "failed"
  ) {
    return;
  }

  const levelIndex = currentAlavancagem.levels.findIndex(
    (l) => l.nivel === nivel
  );
  if (levelIndex === -1) return;

  // Toggle o estado
  currentAlavancagem.levels[levelIndex].checked =
    !currentAlavancagem.levels[levelIndex].checked;

  // Recalcular Entradas Completas
  currentAlavancagem.completedLevels = currentAlavancagem.levels.filter(
    (l) => l.checked
  ).length;

  // Atualizar no array principal
  const alavIndex = alavancagens.findIndex(
    (a) => a.id === currentAlavancagem.id
  );
  if (alavIndex !== -1) {
    alavancagens[alavIndex] = currentAlavancagem;
    saveAlavancagens();
  }

  // Re-renderizar
  renderDetailView();
}

// Marcar como completa
function markAsComplete() {
  if (!currentAlavancagem) return;

  if (confirm(`Marcar "${currentAlavancagem.nome}" como COMPLETA (ganhou)?`)) {
    currentAlavancagem.status = "complete";
    currentAlavancagem.completedLevels = currentAlavancagem.niveis;

    // Marcar todos os Entradas como checked
    currentAlavancagem.levels.forEach((level) => (level.checked = true));

    // Atualizar no array principal
    const alavIndex = alavancagens.findIndex(
      (a) => a.id === currentAlavancagem.id
    );
    if (alavIndex !== -1) {
      alavancagens[alavIndex] = currentAlavancagem;
      saveAlavancagens();
    }

    renderDetailView();
    alert("✅ Alavancagem marcada como COMPLETA! Parabéns pelo lucro!");
  }
}

// Marcar como falhou
function markAsFailed() {
  if (!currentAlavancagem) return;

  if (confirm(`Marcar "${currentAlavancagem.nome}" como FALHOU (perdeu)?`)) {
    currentAlavancagem.status = "failed";

    // Atualizar no array principal
    const alavIndex = alavancagens.findIndex(
      (a) => a.id === currentAlavancagem.id
    );
    if (alavIndex !== -1) {
      alavancagens[alavIndex] = currentAlavancagem;
      saveAlavancagens();
    }

    renderDetailView();
    alert(
      "❌ Alavancagem marcada como FALHOU. Não desanime, a próxima será melhor!"
    );
  }
}

// Atualizar contador do botão
function updateCounter() {
  if (!currentAlavancagem) return;

  const counterText = document.getElementById("counter-text");
  if (counterText) {
    counterText.textContent = `BAIXAR IMAGEM`;
  }
}

// Deletar alavancagem
function deleteAlavancagem() {
  if (!currentAlavancagem) return;

  if (confirm(`Tem certeza que deseja excluir "${currentAlavancagem.nome}"?`)) {
    alavancagens = alavancagens.filter((a) => a.id !== currentAlavancagem.id);
    saveAlavancagens();
    currentAlavancagem = null;
    showListView();
  }
}

// Download da imagem
async function downloadImage() {
  const element = document.getElementById("capture-area");

  if (!element) {
    alert("Erro: Elemento não encontrado!");
    return;
  }

  try {
    const canvas = await html2canvas(element, {
      backgroundColor: null,
      scale: 2,
      width: 1100,
      height: element.offsetHeight,
      logging: false,
      useCORS: true,
    });

    const link = document.createElement("a");
    const timestamp = new Date().getTime();
    const fileName = currentAlavancagem
      ? `${currentAlavancagem.nome
          .replace(/\s+/g, "-")
          .toLowerCase()}-${timestamp}.png`
      : `alavancagem-${timestamp}.png`;

    link.download = fileName;
    link.href = canvas.toDataURL("image/png");
    link.click();
  } catch (error) {
    console.error("Erro ao baixar imagem:", error);
    alert("Erro ao gerar imagem. Tente novamente.");
  }
}
