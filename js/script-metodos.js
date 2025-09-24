// ==================== SISTEMA DE DADOS LOCAIS ====================

let methodsData = {
  methods: JSON.parse(localStorage.getItem("userMethods")) || {},
  settings: JSON.parse(localStorage.getItem("methodsSettings")) || {},
};

// Métodos padrão do sistema
const defaultMethods = {
  // Métodos de Gols
  ambas_marcam: {
    id: "ambas_marcam",
    name: "Ambas Marcam",
    category: "gols",
    icon: "⚽",
    description: "Ambos os times marcam pelo menos 1 gol",
    minOdd: 1.4,
    maxOdd: 2.5,
    favorite: false,
    isDefault: true,
    createdAt: new Date().toISOString(),
  },
  over_05_casa: {
    id: "over_05_casa",
    name: "+0.5 Gols Casa",
    category: "gols",
    icon: "🏠",
    description: "Time da casa marca pelo menos 1 gol",
    minOdd: 1.2,
    maxOdd: 2.0,
    favorite: false,
    isDefault: true,
    createdAt: new Date().toISOString(),
  },
  over_05_visitante: {
    id: "over_05_visitante",
    name: "+0.5 Gols Visitante",
    category: "gols",
    icon: "✈️",
    description: "Time visitante marca pelo menos 1 gol",
    minOdd: 1.3,
    maxOdd: 2.2,
    favorite: false,
    isDefault: true,
    createdAt: new Date().toISOString(),
  },
  over_15_casa: {
    id: "over_15_casa",
    name: "+1.5 Gols Casa",
    category: "gols",
    icon: "🏠",
    description: "Time da casa marca 2 ou mais gols",
    minOdd: 2.0,
    maxOdd: 4.0,
    favorite: false,
    isDefault: true,
    createdAt: new Date().toISOString(),
  },
  over_15_visitante: {
    id: "over_15_visitante",
    name: "+1.5 Gols Visitante",
    category: "gols",
    icon: "✈️",
    description: "Time visitante marca 2 ou mais gols",
    minOdd: 2.5,
    maxOdd: 5.0,
    favorite: false,
    isDefault: true,
    createdAt: new Date().toISOString(),
  },
  over_25_geral: {
    id: "over_25_geral",
    name: "Over 2.5 Gols",
    category: "gols",
    icon: "📈",
    description: "Partida com 3 ou mais gols no total",
    minOdd: 1.6,
    maxOdd: 2.8,
    favorite: true,
    isDefault: true,
    createdAt: new Date().toISOString(),
  },

  // Métodos de Dupla Chance
  dupla_casa_over05: {
    id: "dupla_casa_over05",
    name: "Dupla Chance Casa & +0.5 Gols Casa",
    category: "dupla",
    icon: "🔄",
    description: "Casa não perde E marca pelo menos 1 gol",
    minOdd: 1.3,
    maxOdd: 2.0,
    favorite: false,
    isDefault: true,
    createdAt: new Date().toISOString(),
  },
  dupla_visitante_over05: {
    id: "dupla_visitante_over05",
    name: "Dupla Chance Visitante & +0.5 Gols Visitante",
    category: "dupla",
    icon: "🔄",
    description: "Visitante não perde E marca pelo menos 1 gol",
    minOdd: 1.4,
    maxOdd: 2.5,
    favorite: false,
    isDefault: true,
    createdAt: new Date().toISOString(),
  },
  dupla_casa_over15: {
    id: "dupla_casa_over15",
    name: "Dupla Chance Casa & +1.5 Gols",
    category: "dupla",
    icon: "🔄",
    description: "Casa não perde E partida com 2+ gols",
    minOdd: 1.5,
    maxOdd: 2.2,
    favorite: false,
    isDefault: true,
    createdAt: new Date().toISOString(),
  },
  dupla_visitante_over05_v2: {
    id: "dupla_visitante_over05_v2",
    name: "Dupla Chance Visitante & +0.5 Gols",
    category: "dupla",
    icon: "🔄",
    description: "Visitante não perde E partida com 1+ gols",
    minOdd: 1.25,
    maxOdd: 1.8,
    favorite: true,
    isDefault: true,
    createdAt: new Date().toISOString(),
  },

  // Métodos Especiais
  primeiro_tempo_over05: {
    id: "primeiro_tempo_over05",
    name: "1º Tempo Over 0.5",
    category: "especial",
    icon: "🎯",
    description: "Pelo menos 1 gol no primeiro tempo",
    minOdd: 1.2,
    maxOdd: 1.7,
    favorite: true,
    isDefault: true,
    createdAt: new Date().toISOString(),
  },
  cantos_over85: {
    id: "cantos_over85",
    name: "Over 8.5 Escanteios",
    category: "especial",
    icon: "📐",
    description: "9 ou mais escanteios na partida",
    minOdd: 1.7,
    maxOdd: 2.5,
    favorite: false,
    isDefault: true,
    createdAt: new Date().toISOString(),
  },
};

// ==================== FUNÇÕES DE DADOS ====================

function saveMethodsData() {
  localStorage.setItem("userMethods", JSON.stringify(methodsData.methods));
  localStorage.setItem("methodsSettings", JSON.stringify(methodsData.settings));
}

function initializeDefaultMethods() {
  // Se não há métodos salvos, inicializar com os padrão
  if (Object.keys(methodsData.methods).length === 0) {
    methodsData.methods = { ...defaultMethods };
    saveMethodsData();
  }
}

function getAllMethods() {
  return Object.values(methodsData.methods);
}

function getMethodsByCategory(category) {
  return getAllMethods().filter((method) => method.category === category);
}

function addMethod(methodData) {
  const methodId =
    methodData.name.toLowerCase().replace(/\s+/g, "_") + "_" + Date.now();

  methodsData.methods[methodId] = {
    id: methodId,
    name: methodData.name,
    category: methodData.category,
    icon: methodData.icon || "⚽",
    description: methodData.description || "",
    minOdd: parseFloat(methodData.minOdd) || null,
    maxOdd: parseFloat(methodData.maxOdd) || null,
    favorite: methodData.favorite || false,
    isDefault: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  saveMethodsData();
  return methodsData.methods[methodId];
}

function updateMethod(methodId, newData) {
  if (methodsData.methods[methodId]) {
    methodsData.methods[methodId] = {
      ...methodsData.methods[methodId],
      ...newData,
      updatedAt: new Date().toISOString(),
    };
    saveMethodsData();
    return methodsData.methods[methodId];
  }
  return null;
}

function deleteMethod(methodId) {
  if (
    methodsData.methods[methodId] &&
    !methodsData.methods[methodId].isDefault
  ) {
    delete methodsData.methods[methodId];
    saveMethodsData();
    return true;
  }
  return false;
}

function toggleFavorite(methodId) {
  if (methodsData.methods[methodId]) {
    methodsData.methods[methodId].favorite =
      !methodsData.methods[methodId].favorite;
    methodsData.methods[methodId].updatedAt = new Date().toISOString();
    saveMethodsData();
    return methodsData.methods[methodId];
  }
  return null;
}

// ==================== FUNÇÕES DE UI ====================

function updateQuickStats() {
  const allMethods = getAllMethods();
  const favoriteMethods = allMethods.filter((m) => m.favorite);
  const customMethods = allMethods.filter((m) => !m.isDefault);

  document.getElementById("totalMethods").textContent = allMethods.length;
  document.getElementById("favoriteMethods").textContent =
    favoriteMethods.length;
  document.getElementById("customMethods").textContent = customMethods.length;
}

function loadMethods() {
  loadMethodsByCategory("gols", "golsMethods");
  loadMethodsByCategory("dupla", "duplaMethods");
  loadMethodsByCategory("especial", "especialMethods");
  loadCustomMethods();
  updateSectionCounts();
}

function loadMethodsByCategory(category, containerId) {
  const methods = getMethodsByCategory(category);
  const container = document.getElementById(containerId);

  if (methods.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📝</div>
        <h4>Nenhum método ${category}</h4>
        <p>Adicione métodos para esta categoria</p>
      </div>
    `;
    return;
  }

  container.innerHTML = methods
    .map((method) => createMethodCard(method))
    .join("");
}

function loadCustomMethods() {
  const customMethods = getAllMethods().filter((m) => !m.isDefault);
  const container = document.getElementById("customMethods");

  if (customMethods.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📝</div>
        <h4>Nenhum método personalizado</h4>
        <p>Crie seus próprios métodos de apostas</p>
        <button class="btn-primary" onclick="showAddMethodModal()">
          ➕ Criar Primeiro Método
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = customMethods
    .map((method) => createMethodCard(method))
    .join("");
}

function createMethodCard(method) {
  const oddRangeText =
    method.minOdd && method.maxOdd
      ? `${method.minOdd} - ${method.maxOdd}`
      : "Sem limite";

  const favoriteClass = method.favorite ? "favorite" : "";
  const defaultBadge = method.isDefault
    ? '<span class="default-badge">Padrão</span>'
    : "";

  return `
    <div class="method-card ${favoriteClass}" onclick="showMethodDetails('${
    method.id
  }')">
      <div class="method-actions">
        ${
          !method.isDefault
            ? `<button class="action-btn edit-btn" onclick="event.stopPropagation(); editMethod('${method.id}')" title="Editar">✏️</button>`
            : ""
        }
        ${
          !method.isDefault
            ? `<button class="action-btn delete-btn" onclick="event.stopPropagation(); confirmDeleteMethod('${method.id}')" title="Excluir">🗑️</button>`
            : ""
        }
        <button class="action-btn favorite-btn" onclick="event.stopPropagation(); toggleMethodFavorite('${
          method.id
        }')" title="${
    method.favorite ? "Remover dos favoritos" : "Adicionar aos favoritos"
  }">
          ${method.favorite ? "⭐" : "☆"}
        </button>
      </div>
      
      <div class="method-header">
        <div class="method-icon">${method.icon}</div>
        <div class="method-info">
          <div class="method-name">${method.name}</div>
          <div class="method-category">${getCategoryLabel(
            method.category
          )}</div>
        </div>
      </div>
      
      ${
        method.description
          ? `<div class="method-description">${method.description}</div>`
          : ""
      }
      
      <div class="method-meta">
        <div class="odd-range">Odds: ${oddRangeText}</div>
        ${defaultBadge}
      </div>
    </div>
  `;
}

function getCategoryLabel(category) {
  const labels = {
    gols: "⚽ Gols",
    resultado: "🏆 Resultado",
    dupla: "🔄 Dupla Chance",
    especial: "🎯 Especiais",
  };
  return labels[category] || category;
}

function updateSectionCounts() {
  document.getElementById("golsCount").textContent =
    getMethodsByCategory("gols").length;
  document.getElementById("duplaCount").textContent =
    getMethodsByCategory("dupla").length;
  document.getElementById("especialCount").textContent =
    getMethodsByCategory("especial").length;
  document.getElementById("customCount").textContent = getAllMethods().filter(
    (m) => !m.isDefault
  ).length;
}

// ==================== FUNÇÕES DE MODAL ====================

function showAddMethodModal() {
  document.getElementById("modalTitle").textContent = "➕ Novo Método";
  document.getElementById("methodForm").reset();
  document.getElementById("methodModal").style.display = "block";
}

function editMethod(methodId) {
  const method = methodsData.methods[methodId];
  if (!method) return;

  document.getElementById("modalTitle").textContent = "✏️ Editar Método";
  document.getElementById("methodName").value = method.name;
  document.getElementById("methodCategory").value = method.category;
  document.getElementById("methodIcon").value = method.icon;
  document.getElementById("methodDescription").value = method.description || "";
  document.getElementById("methodMinOdd").value = method.minOdd || "";
  document.getElementById("methodMaxOdd").value = method.maxOdd || "";
  document.getElementById("methodFavorite").checked = method.favorite;

  // Armazenar ID para edição
  document.getElementById("methodForm").dataset.editingId = methodId;

  document.getElementById("methodModal").style.display = "block";
}

function closeMethodModal() {
  document.getElementById("methodModal").style.display = "none";
  document.getElementById("methodForm").reset();
  delete document.getElementById("methodForm").dataset.editingId;
}

function saveMethod(event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const methodData = {
    name: formData.get("methodName"),
    category: formData.get("methodCategory"),
    icon: formData.get("methodIcon"),
    description: formData.get("methodDescription"),
    minOdd: formData.get("methodMinOdd"),
    maxOdd: formData.get("methodMaxOdd"),
    favorite: formData.has("methodFavorite"),
  };

  const editingId = event.target.dataset.editingId;

  try {
    if (editingId) {
      // Editando método existente
      updateMethod(editingId, methodData);
      showNotification("Método atualizado com sucesso!", "success");
    } else {
      // Adicionando novo método
      addMethod(methodData);
      showNotification("Método criado com sucesso!", "success");
    }

    closeMethodModal();
    loadMethods();
    updateQuickStats();
  } catch (error) {
    console.error("Erro ao salvar método:", error);
    showNotification("Erro ao salvar método", "error");
  }
}

function showMethodDetails(methodId) {
  const method = methodsData.methods[methodId];
  if (!method) return;

  const createdDate = new Date(method.createdAt).toLocaleDateString("pt-BR");
  const updatedDate = method.updatedAt
    ? new Date(method.updatedAt).toLocaleDateString("pt-BR")
    : null;

  const content = `
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="font-size: 48px; margin-bottom: 12px;">${method.icon}</div>
      <h3 style="margin: 0; color: #2d3748;">${method.name}</h3>
      <span style="background: #e2e8f0; color: #4a5568; padding: 4px 12px; border-radius: 12px; font-size: 12px; margin-top: 8px; display: inline-block;">
        ${getCategoryLabel(method.category)}
      </span>
      ${
        method.favorite
          ? '<div style="margin-top: 8px;">⭐ <span style="color: #d69e2e; font-weight: 600;">Favorito</span></div>'
          : ""
      }
      ${
        method.isDefault
          ? '<div style="margin-top: 8px;">🔒 <span style="color: #38a169; font-weight: 600;">Método Padrão</span></div>'
          : ""
      }
    </div>
    
    ${
      method.description
        ? `
      <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
        <h4 style="margin: 0 0 8px 0; color: #4a5568;">Descrição</h4>
        <p style="margin: 0; color: #2d3748;">${method.description}</p>
      </div>
    `
        : ""
    }
    
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px;">
      <div style="background: #f0fff4; padding: 16px; border-radius: 8px; text-align: center;">
        <div style="font-size: 20px; font-weight: 600; color: #22543d;">
          ${method.minOdd || "N/A"}
        </div>
        <div style="font-size: 12px; color: #22543d;">Odd Mínima</div>
      </div>
      <div style="background: #fff5f5; padding: 16px; border-radius: 8px; text-align: center;">
        <div style="font-size: 20px; font-weight: 600; color: #c53030;">
          ${method.maxOdd || "N/A"}
        </div>
        <div style="font-size: 12px; color: #c53030;">Odd Máxima</div>
      </div>
    </div>
    
    <div style="background: #edf2f7; padding: 16px; border-radius: 8px; font-size: 14px; color: #4a5568;">
      <div><strong>Criado em:</strong> ${createdDate}</div>
      ${
        updatedDate
          ? `<div><strong>Última atualização:</strong> ${updatedDate}</div>`
          : ""
      }
    </div>
    
    <div style="display: flex; gap: 12px; justify-content: center; margin-top: 24px;">
      ${
        !method.isDefault
          ? `
        <button onclick="closeDetailsModal(); editMethod('${method.id}')" class="btn-primary">
          ✏️ Editar
        </button>
        <button onclick="confirmDeleteMethod('${method.id}')" class="btn-secondary" style="background: #fed7d7; color: #c53030;">
          🗑️ Excluir
        </button>
      `
          : ""
      }
      <button onclick="closeDetailsModal()" class="btn-secondary">
        Fechar
      </button>
    </div>
  `;

  document.getElementById(
    "detailsTitle"
  ).textContent = `Detalhes: ${method.name}`;
  document.getElementById("methodDetailsContent").innerHTML = content;
  document.getElementById("methodDetailsModal").style.display = "block";
}

function closeDetailsModal() {
  document.getElementById("methodDetailsModal").style.display = "none";
}

function toggleMethodFavorite(methodId) {
  const method = toggleFavorite(methodId);
  if (method) {
    showNotification(
      method.favorite
        ? "Método adicionado aos favoritos!"
        : "Método removido dos favoritos!",
      "success"
    );
    loadMethods();
    updateQuickStats();
  }
}

function confirmDeleteMethod(methodId) {
  const method = methodsData.methods[methodId];
  if (!method) return;

  if (method.isDefault) {
    showNotification(
      "Não é possível excluir métodos padrão do sistema",
      "error"
    );
    return;
  }

  if (
    confirm(
      `Tem certeza que deseja excluir o método "${method.name}"?\n\nEsta ação não pode ser desfeita.`
    )
  ) {
    if (deleteMethod(methodId)) {
      showNotification("Método excluído com sucesso!", "success");
      loadMethods();
      updateQuickStats();
      closeDetailsModal();
    } else {
      showNotification("Erro ao excluir método", "error");
    }
  }
}

// ==================== FUNÇÕES DE BUSCA E FILTRO ====================

function searchMethods(query) {
  const allMethods = getAllMethods();
  const filteredMethods = allMethods.filter(
    (method) =>
      method.name.toLowerCase().includes(query.toLowerCase()) ||
      method.description.toLowerCase().includes(query.toLowerCase()) ||
      getCategoryLabel(method.category)
        .toLowerCase()
        .includes(query.toLowerCase())
  );

  // Se há busca ativa, mostrar resultados em uma seção especial
  if (query.trim()) {
    displaySearchResults(filteredMethods, query);
  } else {
    // Se não há busca, voltar ao layout normal
    loadMethods();
  }
}

function displaySearchResults(methods, query) {
  const container = document.querySelector(".methods-container");

  if (methods.length === 0) {
    container.innerHTML = `
      <div class="methods-section">
        <div class="section-header">
          <h3>🔍 Resultados da busca: "${query}"</h3>
          <span class="section-count">0</span>
        </div>
        <div class="empty-state">
          <div class="empty-icon">🔍</div>
          <h4>Nenhum método encontrado</h4>
          <p>Tente usar termos diferentes</p>
        </div>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="methods-section">
      <div class="section-header">
        <h3>🔍 Resultados da busca: "${query}"</h3>
        <span class="section-count">${methods.length}</span>
      </div>
      <div class="methods-grid">
        ${methods.map((method) => createMethodCard(method)).join("")}
      </div>
    </div>
  `;
}

function filterMethods() {
  const categoryFilter = document.getElementById("categoryFilter").value;
  const searchQuery = document.getElementById("searchInput").value;

  if (categoryFilter) {
    const methods = getMethodsByCategory(categoryFilter);
    displaySearchResults(
      methods,
      `Categoria: ${getCategoryLabel(categoryFilter)}`
    );
  } else if (searchQuery.trim()) {
    searchMethods(searchQuery);
  } else {
    loadMethods();
  }
}

// ==================== FUNÇÕES DE NOTIFICAÇÃO ====================

function showNotification(message, type = "success") {
  const notification = document.getElementById("notification");
  const notificationText = document.getElementById("notificationText");

  notificationText.textContent = message;
  notification.className = `notification ${type}`;
  notification.classList.add("show");

  setTimeout(() => {
    notification.classList.remove("show");
  }, 3000);
}

// ==================== FUNÇÃO DE EXPORTAÇÃO (PARA OUTRAS PÁGINAS) ====================

// Função para ser usada em outras páginas para obter métodos
function getUserMethods() {
  return getAllMethods();
}

function getMethodById(methodId) {
  return methodsData.methods[methodId] || null;
}

// ==================== INICIALIZAÇÃO ====================

document.addEventListener("DOMContentLoaded", function () {
  try {
    initializeDefaultMethods();
    loadMethods();
    updateQuickStats();

    // Fechar modal ao clicar fora
    window.addEventListener("click", function (event) {
      const methodModal = document.getElementById("methodModal");
      const detailsModal = document.getElementById("methodDetailsModal");

      if (event.target === methodModal) {
        closeMethodModal();
      }

      if (event.target === detailsModal) {
        closeDetailsModal();
      }
    });

    console.log("Sistema de métodos iniciado com sucesso");
  } catch (error) {
    console.error("Erro na inicialização do sistema de métodos:", error);
    showNotification("Erro ao carregar métodos", "error");
  }
});

// ==================== UTILITÁRIOS ====================

// Função para resetar todos os dados (desenvolvimento)
function resetMethodsData() {
  if (
    confirm(
      "ATENÇÃO: Isso vai apagar TODOS os métodos personalizados e resetar para os padrão. Confirma?"
    )
  ) {
    localStorage.removeItem("userMethods");
    localStorage.removeItem("methodsSettings");
    methodsData = {
      methods: {},
      settings: {},
    };
    initializeDefaultMethods();
    loadMethods();
    updateQuickStats();
    showNotification("Dados resetados para padrão do sistema", "success");
  }
}

// Função para exportar métodos
function exportMethods() {
  const dataStr = JSON.stringify(methodsData, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "metodos-backup.json";
  link.click();
  showNotification("Backup dos métodos criado!", "success");
}
