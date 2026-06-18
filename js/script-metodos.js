// ==================== SISTEMA DE DADOS LOCAIS ====================

let methodsData = {
  methods: JSON.parse(localStorage.getItem("userMethods")) || {},
  settings: JSON.parse(localStorage.getItem("methodsSettings")) || {},
};

// Sem métodos padrão chumbados — tudo criado pelo usuário

// ==================== FUNÇÕES DE DADOS ====================

function saveMethodsData() {
  localStorage.setItem("userMethods", JSON.stringify(methodsData.methods));
  localStorage.setItem("methodsSettings", JSON.stringify(methodsData.settings));
}

function initializeDefaultMethods() {
  // Nada a inicializar — sem métodos padrão chumbados
  saveMethodsData();
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
  if (methodsData.methods[methodId]) {
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
  loadMethodsByCategory("resultado", "resultMethods");
  loadMethodsByCategory("escanteios", "escanteiosMethods");
  loadFavoriteMethods();
  loadCustomMethods();
  updateSectionCounts();
}

function loadMethodsByCategory(category, containerId) {
  const methods = getMethodsByCategory(category);
  const container = document.getElementById(containerId);
  if (!container) return;

  if (methods.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📝</div>
        <h4>Nenhum método cadastrado</h4>
        <p>Adicione métodos para esta categoria</p>
      </div>
    `;
    return;
  }

  container.innerHTML = methods
    .map((method) => createMethodCard(method))
    .join("");
}

function loadFavoriteMethods() {
  const favoriteMethods = getAllMethods().filter((m) => m.favorite);
  const container = document.getElementById("favoritesMethodsContainer");

  if (favoriteMethods.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">⭐</div>
        <h4>Nenhum método favorito</h4>
        <p>Marque métodos como favoritos para vê-los aqui</p>
      </div>
    `;
    return;
  }

  container.innerHTML = favoriteMethods
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

  return `
    <div class="method-card ${favoriteClass}" onclick="showMethodDetails('${method.id}')">
      <div class="method-actions">
        <button class="action-btn edit-btn" onclick="event.stopPropagation(); editMethod('${method.id}')" title="Editar">✏️</button>
        <button class="action-btn delete-btn" onclick="event.stopPropagation(); confirmDeleteMethod('${method.id}')" title="Excluir">🗑️</button>
        <button class="action-btn favorite-btn" onclick="event.stopPropagation(); toggleMethodFavorite('${method.id}')" title="${method.favorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}">
          ${method.favorite ? "⭐" : "☆"}
        </button>
      </div>

      <div class="method-header">
        <div class="method-icon">${method.icon}</div>
        <div class="method-info">
          <div class="method-name">${method.name}</div>
          <div class="method-category">${getCategoryLabel(method.category)}</div>
        </div>
      </div>

      ${method.description ? `<div class="method-description">${method.description}</div>` : ""}

      <div class="method-meta">
        <div class="odd-range">Odds: ${oddRangeText}</div>
      </div>
    </div>
  `;
}

function getCategoryLabel(category) {
  const labels = {
    gols: "⚽ Gols",
    resultado: "🏆 Resultado",
    dupla: "🔄 Dupla Chance",
    especial: "💡 Especiais",
    escanteios: "🚩 Escanteios",
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
  document.getElementById("resultCount").textContent =
    getMethodsByCategory("resultado").length;
  document.getElementById("escanteiosCount").textContent =
    getMethodsByCategory("escanteios").length;
  document.getElementById("favoritesCount").textContent =
    getAllMethods().filter((m) => m.favorite).length;
  document.getElementById("customCount").textContent = getAllMethods().filter(
    (m) => !m.isDefault,
  ).length;
}

// ==================== FUNÇÕES DE MODAL ====================

function showAddMethodModal() {
  document.getElementById("modalTitle").textContent = "➕ Novo Método";
  document.getElementById("methodForm").reset();
  delete document.getElementById("methodForm").dataset.editingId;
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
      updateMethod(editingId, methodData);
      showNotification("Método atualizado com sucesso!", "success");
    } else {
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

  const formatDescription = (description) => {
    if (!description) return "";
    return description
      .split("\n")
      .filter((line) => line.trim() !== "")
      .map((line) => {
        const t = line.trim();
        return `<div style="margin-bottom: 8px;">${t}</div>`;
      })
      .join("");
  };

  const content = `
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="font-size: 48px; margin-bottom: 12px;">${method.icon}</div>
      <h3 style="margin: 0; color: #2d3748;">${method.name}</h3>
      <span style="background: #e2e8f0; color: #4a5568; padding: 4px 12px; border-radius: 12px; font-size: 12px; margin-top: 8px; display: inline-block;">
        ${getCategoryLabel(method.category)}
      </span>
      ${method.favorite ? '<div style="margin-top: 8px;">⭐ <span style="color: #d69e2e; font-weight: 600;">Favorito</span></div>' : ""}
    </div>

    ${
      method.description
        ? `
      <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
        <h4 style="margin: 0 0 12px 0; color: #4a5568;">Descrição</h4>
        <div style="color: #2d3748; line-height: 1.5; text-align: left;">
          ${formatDescription(method.description)}
        </div>
      </div>
    `
        : ""
    }

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px;">
      <div style="background: #f0fff4; padding: 16px; border-radius: 8px; text-align: center;">
        <div style="font-size: 20px; font-weight: 600; color: #22543d;">${method.minOdd || "N/A"}</div>
        <div style="font-size: 12px; color: #22543d;">Odd Mínima</div>
      </div>
      <div style="background: #fff5f5; padding: 16px; border-radius: 8px; text-align: center;">
        <div style="font-size: 20px; font-weight: 600; color: #c53030;">${method.maxOdd || "N/A"}</div>
        <div style="font-size: 12px; color: #c53030;">Odd Máxima</div>
      </div>
    </div>

    <div style="background: #edf2f7; padding: 16px; border-radius: 8px; font-size: 14px; color: #4a5568;">
      <div style="margin-bottom: 4px;"><strong>Criado em:</strong> ${createdDate}</div>
      ${updatedDate ? `<div><strong>Última atualização:</strong> ${updatedDate}</div>` : ""}
    </div>

    <div style="display: flex; gap: 12px; justify-content: center; margin-top: 24px;">
      <button onclick="closeDetailsModal(); editMethod('${method.id}')" class="btn-primary">✏️ Editar</button>
      <button onclick="confirmDeleteMethod('${method.id}')" class="btn-secondary" style="background: #fed7d7; color: #c53030;">🗑️ Excluir</button>
      <button onclick="closeDetailsModal()" class="btn-secondary">Fechar</button>
    </div>
  `;

  document.getElementById("detailsTitle").textContent =
    `Detalhes: ${method.name}`;
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
      "success",
    );
    loadMethods();
    updateQuickStats();
  }
}

function confirmDeleteMethod(methodId) {
  const method = methodsData.methods[methodId];
  if (!method) return;

  if (
    confirm(
      `Tem certeza que deseja excluir o método "${method.name}"?\n\nEsta ação não pode ser desfeita.`,
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

// ==================== BUSCA E FILTRO ====================

function searchMethods(query) {
  if (query.trim()) {
    const filtered = getAllMethods().filter(
      (m) =>
        m.name.toLowerCase().includes(query.toLowerCase()) ||
        (m.description || "").toLowerCase().includes(query.toLowerCase()) ||
        getCategoryLabel(m.category)
          .toLowerCase()
          .includes(query.toLowerCase()),
    );
    displaySearchResults(filtered, query);
  } else {
    loadMethods();
  }
}

function displaySearchResults(methods, query) {
  const container = document.querySelector(".methods-container");

  if (methods.length === 0) {
    container.innerHTML = `
      <div class="methods-section">
        <div class="section-header">
          <h3>🔍 Resultados: "${query}"</h3>
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
        <h3>🔍 Resultados: "${query}"</h3>
        <span class="section-count">${methods.length}</span>
      </div>
      <div class="methods-grid">
        ${methods.map((m) => createMethodCard(m)).join("")}
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
      `Categoria: ${getCategoryLabel(categoryFilter)}`,
    );
  } else if (searchQuery.trim()) {
    searchMethods(searchQuery);
  } else {
    loadMethods();
  }
}

// ==================== NOTIFICAÇÃO ====================

function showNotification(message, type = "success") {
  const notification = document.getElementById("notification");
  const notificationText = document.getElementById("notificationText");

  notificationText.textContent = message;
  notification.className = `notification ${type}`;
  notification.classList.add("show");

  setTimeout(() => notification.classList.remove("show"), 3000);
}

// ==================== EXPORTAÇÃO ====================

function getUserMethods() {
  return getAllMethods();
}
function getMethodById(methodId) {
  return methodsData.methods[methodId] || null;
}

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

// ==================== INICIALIZAÇÃO ====================

document.addEventListener("DOMContentLoaded", function () {
  try {
    loadMethods();
    updateQuickStats();

    window.addEventListener("click", function (event) {
      if (event.target === document.getElementById("methodModal"))
        closeMethodModal();
      if (event.target === document.getElementById("methodDetailsModal"))
        closeDetailsModal();
    });

    console.log("Sistema de métodos iniciado com sucesso");
  } catch (error) {
    console.error("Erro na inicialização:", error);
    showNotification("Erro ao carregar métodos", "error");
  }
});
