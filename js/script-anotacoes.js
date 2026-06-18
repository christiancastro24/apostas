/* ============================================================
   script-anotacoes.js
   Bet Tracker Pro — Módulo de Anotações
   ============================================================ */

// ─── Estado ──────────────────────────────────────────────────
let notes = [];
let editingId = null;
let activeFilter = "todas";
let searchQuery = "";

const STORAGE_KEY = "anotacoesData";

const CATEGORIAS = {
  estrategia: { label: "Estratégia", icon: "📋" },
  analise: { label: "Análise", icon: "🔍" },
  financeiro: { label: "Financeiro", icon: "💰" },
  aviso: { label: "Aviso", icon: "⚠️" },
  geral: { label: "Geral", icon: "📝" },
};

// ─── Init ─────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  loadNotes();
  renderNotes();
  setupSearch();
});

// ─── Persistência ─────────────────────────────────────────────
function loadNotes() {
  const raw = localStorage.getItem(STORAGE_KEY);
  notes = raw ? JSON.parse(raw) : [];
}

function saveNotes() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

// ─── Helpers ──────────────────────────────────────────────────
function generateId() {
  return `note-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
}

function formatDate(isoString) {
  const d = new Date(isoString);
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getCatInfo(cat) {
  return CATEGORIAS[cat] || CATEGORIAS.geral;
}

// ─── Busca ────────────────────────────────────────────────────
function setupSearch() {
  const input = document.getElementById("searchInput");
  input.addEventListener("input", (e) => {
    searchQuery = e.target.value.toLowerCase();
    renderNotes();
  });
}

// ─── Filtro ───────────────────────────────────────────────────
function setFilter(filter) {
  activeFilter = filter;
  document.querySelectorAll(".tag-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.filter === filter);
  });
  renderNotes();
}

// ─── Render ───────────────────────────────────────────────────
function renderNotes() {
  const grid = document.getElementById("notesGrid");

  // Filtrar
  let filtered = notes.filter((note) => {
    const matchFilter =
      activeFilter === "todas" ||
      (activeFilter === "pinned" && note.pinned) ||
      note.categoria === activeFilter;

    const matchSearch =
      !searchQuery ||
      note.titulo.toLowerCase().includes(searchQuery) ||
      note.conteudo.toLowerCase().includes(searchQuery);

    return matchFilter && matchSearch;
  });

  // Ordenar: fixadas primeiro, depois por data decrescente
  filtered.sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.criadoEm) - new Date(a.criadoEm);
  });

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📒</div>
        <p>${searchQuery ? "Nenhuma anotação encontrada para sua busca." : "Nenhuma anotação ainda."}</p>
        <span class="empty-hint">Clique em "+ Nova Anotação" para começar.</span>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map((note) => buildCard(note)).join("");
}

function buildCard(note) {
  const cat = getCatInfo(note.categoria);
  const preview =
    note.conteudo.length > 180
      ? note.conteudo.slice(0, 180) + "…"
      : note.conteudo;

  return `
    <div class="note-card" data-id="${note.id}">
      <div class="note-card-header">
        <span class="note-title" onclick="openViewModal('${note.id}')">${escHtml(note.titulo)}</span>
        <div class="note-actions">
          <button title="Fixar" onclick="togglePin('${note.id}')">${note.pinned ? "📌" : "📍"}</button>
          <button title="Editar" onclick="openEditModal('${note.id}')">✏️</button>
          <button title="Excluir" onclick="deleteNote('${note.id}')">🗑️</button>
        </div>
      </div>

      <span class="note-tag ${note.categoria}">${cat.icon} ${cat.label}</span>

      <div class="note-body">${escHtml(preview)}</div>

      <div class="note-footer">
        <span class="note-date">🕐 ${formatDate(note.criadoEm)}</span>
        ${note.pinned ? '<span class="note-pinned" title="Fixada">📌</span>' : ""}
      </div>
    </div>
  `;
}

function escHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ─── Modal Nova / Editar ──────────────────────────────────────
function openNewModal() {
  editingId = null;
  document.getElementById("modalTitle").textContent = "✏️ Nova Anotação";
  document.getElementById("inputTitulo").value = "";
  document.getElementById("inputCategoria").value = "geral";
  document.getElementById("inputConteudo").value = "";
  openModal("editModal");
  setTimeout(() => document.getElementById("inputTitulo").focus(), 100);
}

function openEditModal(id) {
  const note = notes.find((n) => n.id === id);
  if (!note) return;

  editingId = id;
  document.getElementById("modalTitle").textContent = "✏️ Editar Anotação";
  document.getElementById("inputTitulo").value = note.titulo;
  document.getElementById("inputCategoria").value = note.categoria;
  document.getElementById("inputConteudo").value = note.conteudo;
  openModal("editModal");
  setTimeout(() => document.getElementById("inputTitulo").focus(), 100);
}

function saveNote() {
  const titulo = document.getElementById("inputTitulo").value.trim();
  const categoria = document.getElementById("inputCategoria").value;
  const conteudo = document.getElementById("inputConteudo").value.trim();

  if (!titulo) {
    showNotification("Por favor, preencha o título!", "error");
    document.getElementById("inputTitulo").focus();
    return;
  }

  if (!conteudo) {
    showNotification("Por favor, escreva o conteúdo da anotação!", "error");
    document.getElementById("inputConteudo").focus();
    return;
  }

  if (editingId) {
    // Editar
    const idx = notes.findIndex((n) => n.id === editingId);
    if (idx !== -1) {
      notes[idx] = {
        ...notes[idx],
        titulo,
        categoria,
        conteudo,
        atualizadoEm: new Date().toISOString(),
      };
    }
    showNotification("Anotação atualizada! ✅");
  } else {
    // Nova
    notes.unshift({
      id: generateId(),
      titulo,
      categoria,
      conteudo,
      pinned: false,
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    });
    showNotification("Anotação salva! 📝");
  }

  saveNotes();
  closeModal("editModal");
  renderNotes();
}

// ─── Modal Visualizar ─────────────────────────────────────────
function openViewModal(id) {
  const note = notes.find((n) => n.id === id);
  if (!note) return;

  const cat = getCatInfo(note.categoria);

  document.getElementById("viewModalTitle").textContent = escHtml(note.titulo);
  document.getElementById("viewMeta").innerHTML = `
    <span class="note-tag ${note.categoria}">${cat.icon} ${cat.label}</span>
    <span class="view-date">🕐 ${formatDate(note.criadoEm)}</span>
    ${note.pinned ? "<span>📌 Fixada</span>" : ""}
  `;
  document.getElementById("viewBody").textContent = note.conteudo;

  // Botões do rodapé
  document.getElementById("viewFooter").innerHTML = `
    <button class="btn-cancel-modal" onclick="closeModal('viewModal')">Fechar</button>
    <button class="btn-save-modal" onclick="closeModal('viewModal'); openEditModal('${id}')">✏️ Editar</button>
  `;

  openModal("viewModal");
}

// ─── Ações ────────────────────────────────────────────────────
function togglePin(id) {
  const note = notes.find((n) => n.id === id);
  if (!note) return;
  note.pinned = !note.pinned;
  saveNotes();
  renderNotes();
  showNotification(note.pinned ? "Anotação fixada 📌" : "Anotação desafixada");
}

function deleteNote(id) {
  if (!confirm("Tem certeza que deseja excluir esta anotação?")) return;
  notes = notes.filter((n) => n.id !== id);
  saveNotes();
  renderNotes();
  showNotification("Anotação excluída 🗑️");
}

// ─── Modal helpers ────────────────────────────────────────────
function openModal(id) {
  document.getElementById(id).classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeModal(id) {
  document.getElementById(id).classList.remove("open");
  document.body.style.overflow = "auto";
}

// Fechar clicando fora
document.addEventListener("click", (e) => {
  ["editModal", "viewModal"].forEach((id) => {
    const overlay = document.getElementById(id);
    if (e.target === overlay) closeModal(id);
  });
});

// Fechar com Escape
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeModal("editModal");
    closeModal("viewModal");
  }
});

// ─── Notification ─────────────────────────────────────────────
function showNotification(message, type = "success") {
  const el = document.createElement("div");
  el.className = "notification";
  if (type === "error") {
    el.style.background = "linear-gradient(135deg, #fc8181 0%, #e53e3e 100%)";
  }
  el.textContent = message;
  document.body.appendChild(el);

  setTimeout(() => el.classList.add("show"), 50);
  setTimeout(() => {
    el.classList.remove("show");
    setTimeout(() => el.remove(), 350);
  }, 2800);
}
