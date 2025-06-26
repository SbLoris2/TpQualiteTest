/**
 * @fileoverview Interface JavaScript pour l'application Todo API
 * @description Gestion complète de l'interface utilisateur avec consommation de l'API REST
 */

// =============================================================================
// Configuration et constantes
// =============================================================================

const API_BASE_URL = '/api';
const ENDPOINTS = {
  tasks: `${API_BASE_URL}/tasks`,
  stats: `${API_BASE_URL}/tasks/stats`
};

// =============================================================================
// Variables globales
// =============================================================================

let tasks = [];
let currentFilter = 'all';
let editingTaskId = null;

// =============================================================================
// Éléments DOM
// =============================================================================

const elements = {
  // Forms et inputs
  addTaskForm: document.getElementById('addTaskForm'),
  taskTitle: document.getElementById('taskTitle'),
  addTaskBtn: document.getElementById('addTaskBtn'),
  
  // Liste des tâches
  tasksList: document.getElementById('tasksList'),
  emptyState: document.getElementById('emptyState'),
  
  // Filtres
  filterTabs: document.querySelectorAll('.filter-tab'),
  
  // Actions
  refreshBtn: document.getElementById('refreshBtn'),
  clearAllBtn: document.getElementById('clearAllBtn'),
  
  // Stats
  totalTasks: document.getElementById('totalTasks'),
  completedTasks: document.getElementById('completedTasks'),
  pendingTasks: document.getElementById('pendingTasks'),
  completionRate: document.getElementById('completionRate'),
  
  // Compteurs des filtres
  allCount: document.getElementById('allCount'),
  pendingCount: document.getElementById('pendingCount'),
  completedCount: document.getElementById('completedCount'),
  
  // UI
  loadingOverlay: document.getElementById('loadingOverlay'),
  toastContainer: document.getElementById('toastContainer'),
  modalOverlay: document.getElementById('modalOverlay'),
  modalTitle: document.getElementById('modalTitle'),
  modalMessage: document.getElementById('modalMessage'),
  modalConfirm: document.getElementById('modalConfirm'),
  modalCancel: document.getElementById('modalCancel'),
  modalClose: document.getElementById('modalClose')
};

// =============================================================================
// API Client
// =============================================================================

class ApiClient {
  /**
   * Effectue une requête HTTP
   * @param {string} url - URL de la requête
   * @param {Object} options - Options de la requête (method, body, etc.)
   * @returns {Promise<Object>} Réponse de l'API
   */
  static async request(url, options = {}) {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'X-API-Client': 'Todo-Web-Interface',
        ...options.headers
      },
      ...options
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur API:', error);
      throw error;
    }
  }

  /**
   * Récupère toutes les tâches
   * @returns {Promise<Array>} Liste des tâches
   */
  static async getTasks() {
    return await this.request(ENDPOINTS.tasks);
  }

  /**
   * Récupère les statistiques des tâches
   * @returns {Promise<Object>} Statistiques
   */
  static async getStats() {
    return await this.request(ENDPOINTS.stats);
  }

  /**
   * Crée une nouvelle tâche
   * @param {Object} taskData - Données de la tâche
   * @returns {Promise<Object>} Tâche créée
   */
  static async createTask(taskData) {
    return await this.request(ENDPOINTS.tasks, {
      method: 'POST',
      body: taskData
    });
  }

  /**
   * Met à jour une tâche
   * @param {number} id - ID de la tâche
   * @param {Object} updateData - Données à mettre à jour
   * @returns {Promise<Object>} Tâche mise à jour
   */
  static async updateTask(id, updateData) {
    return await this.request(`${ENDPOINTS.tasks}/${id}`, {
      method: 'PUT',
      body: updateData
    });
  }

  /**
   * Supprime une tâche
   * @param {number} id - ID de la tâche à supprimer
   * @returns {Promise<Object>} Confirmation de suppression
   */
  static async deleteTask(id) {
    return await this.request(`${ENDPOINTS.tasks}/${id}`, {
      method: 'DELETE'
    });
  }
}

// =============================================================================
// Gestionnaire de notifications (Toast)
// =============================================================================

class ToastManager {
  /**
   * Affiche une notification toast
   * @param {string} message - Message à afficher
   * @param {string} type - Type de notification (success, error, warning, info)
   * @param {number} duration - Durée d'affichage (ms)
   */
  static show(message, type = 'info', duration = 4000) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const iconMap = {
      success: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
      </svg>`,
      error: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
        <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>`,
      warning: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="currentColor" stroke-width="2"/>
        <line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" stroke-width="2"/>
        <line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" stroke-width="2"/>
      </svg>`,
      info: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
        <path d="M12 16v-4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <path d="M12 8h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>`
    };

    toast.innerHTML = `
      <div class="toast-icon">${iconMap[type]}</div>
      <div class="toast-content">
        <div class="toast-message">${message}</div>
      </div>
      <button class="toast-close">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2"/>
          <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2"/>
        </svg>
      </button>
    `;

    // Gestion de la fermeture
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => this.remove(toast));

    // Ajout au container
    elements.toastContainer.appendChild(toast);

    // Auto-suppression
    if (duration > 0) {
      setTimeout(() => this.remove(toast), duration);
    }

    return toast;
  }

  /**
   * Supprime une notification
   * @param {HTMLElement} toast - Élément toast à supprimer
   */
  static remove(toast) {
    if (toast && toast.parentNode) {
      toast.style.animation = 'slideInRight 0.3s ease-out reverse';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }
  }

  /**
   * Affiche une notification de succès
   * @param {string} message - Message de succès
   */
  static success(message) {
    this.show(message, 'success');
  }

  /**
   * Affiche une notification d'erreur
   * @param {string} message - Message d'erreur
   */
  static error(message) {
    this.show(message, 'error', 6000);
  }

  /**
   * Affiche une notification d'avertissement
   * @param {string} message - Message d'avertissement
   */
  static warning(message) {
    this.show(message, 'warning');
  }
}

// =============================================================================
// Gestionnaire de modal
// =============================================================================

class ModalManager {
  /**
   * Affiche une modal de confirmation
   * @param {string} title - Titre de la modal
   * @param {string} message - Message de confirmation
   * @returns {Promise<boolean>} Promesse résolue avec true si confirmé
   */
  static async confirm(title, message) {
    return new Promise((resolve) => {
      elements.modalTitle.textContent = title;
      elements.modalMessage.textContent = message;
      elements.modalOverlay.classList.add('show');

      const handleConfirm = () => {
        this.hide();
        resolve(true);
        cleanup();
      };

      const handleCancel = () => {
        this.hide();
        resolve(false);
        cleanup();
      };

      const cleanup = () => {
        elements.modalConfirm.removeEventListener('click', handleConfirm);
        elements.modalCancel.removeEventListener('click', handleCancel);
        elements.modalClose.removeEventListener('click', handleCancel);
        elements.modalOverlay.removeEventListener('click', handleOverlayClick);
        document.removeEventListener('keydown', handleKeydown);
      };

      const handleOverlayClick = (e) => {
        if (e.target === elements.modalOverlay) {
          handleCancel();
        }
      };

      const handleKeydown = (e) => {
        if (e.key === 'Escape') {
          handleCancel();
        }
      };

      elements.modalConfirm.addEventListener('click', handleConfirm);
      elements.modalCancel.addEventListener('click', handleCancel);
      elements.modalClose.addEventListener('click', handleCancel);
      elements.modalOverlay.addEventListener('click', handleOverlayClick);
      document.addEventListener('keydown', handleKeydown);
    });
  }

  /**
   * Cache la modal
   */
  static hide() {
    elements.modalOverlay.classList.remove('show');
  }
}

// =============================================================================
// Gestionnaire de chargement
// =============================================================================

class LoadingManager {
  static isLoading = false;

  /**
   * Affiche l'overlay de chargement
   */
  static show() {
    this.isLoading = true;
    elements.loadingOverlay.classList.add('show');
  }

  /**
   * Cache l'overlay de chargement
   */
  static hide() {
    this.isLoading = false;
    elements.loadingOverlay.classList.remove('show');
  }

  /**
   * Exécute une action avec indicateur de chargement
   * @param {Function} action - Action à exécuter
   * @returns {Promise} Résultat de l'action
   */
  static async withLoading(action) {
    this.show();
    try {
      const result = await action();
      return result;
    } finally {
      this.hide();
    }
  }
}

// =============================================================================
// Gestionnaire des tâches
// =============================================================================

class TaskManager {
  /**
   * Charge toutes les tâches depuis l'API
   */
  static async loadTasks() {
    try {
      tasks = await ApiClient.getTasks();
      this.renderTasks();
      this.updateStats();
      this.updateFilterCounts();
    } catch (error) {
      console.error('Erreur lors du chargement des tâches:', error);
      ToastManager.error('Impossible de charger les tâches');
    }
  }

  /**
   * Affiche les tâches dans l'interface (AMÉLIORÉE)
   */
  static renderTasks() {
    const filteredTasks = this.getFilteredTasks();
    
    // Vider la liste
    elements.tasksList.innerHTML = '';
    
    // Afficher l'état vide si aucune tâche
    if (filteredTasks.length === 0) {
      elements.emptyState.classList.remove('hidden');
      return;
    }
    
    elements.emptyState.classList.add('hidden');
    
    // Créer les éléments de tâche avec gestion d'erreur
    filteredTasks.forEach(task => {
      try {
        const taskElement = this.createTaskElement(task);
        elements.tasksList.appendChild(taskElement);
      } catch (error) {
        console.error('Erreur lors de la création de l\'élément tâche:', error);
      }
    });

    // Attacher les événements après avoir créé les éléments
    this.attachTaskEventListeners();
  }

  /**
   * Attache les événements aux éléments de tâche
   */
  static attachTaskEventListeners() {
    // Événements pour les checkboxes
    const checkboxes = elements.tasksList.querySelectorAll('.task-checkbox');
    checkboxes.forEach(checkbox => {
      checkbox.addEventListener('click', (e) => {
        const taskId = parseInt(e.target.closest('.task-item').dataset.taskId);
        this.toggleTask(taskId);
      });
    });

    // Événements pour les boutons d'édition
    const editButtons = elements.tasksList.querySelectorAll('.task-action.edit');
    editButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const taskId = parseInt(e.target.closest('.task-item').dataset.taskId);
        this.editTask(taskId);
      });
    });

    // Événements pour les boutons de suppression
    const deleteButtons = elements.tasksList.querySelectorAll('.task-action.delete');
    deleteButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const taskId = parseInt(e.target.closest('.task-item').dataset.taskId);
        this.deleteTask(taskId);
      });
    });
  }

  /**
   * Crée l'élément DOM pour une tâche
   * @param {Object} task - Données de la tâche
   * @returns {HTMLElement} Élément DOM de la tâche
   */
  static createTaskElement(task) {
    const taskItem = document.createElement('div');
    taskItem.className = `task-item ${task.completed ? 'completed' : ''}`;
    taskItem.dataset.taskId = task.id;

    const createdDate = new Date(task.createdAt).toLocaleDateString('fr-FR');
    const updatedDate = new Date(task.updatedAt).toLocaleDateString('fr-FR');

    taskItem.innerHTML = `
      <div class="task-checkbox ${task.completed ? 'checked' : ''}"></div>
      <div class="task-content">
        <div class="task-title">${this.escapeHtml(task.title)}</div>
        <div class="task-meta">
          <span>Créée: ${createdDate}</span>
          ${updatedDate !== createdDate ? `<span>Modifiée: ${updatedDate}</span>` : ''}
        </div>
      </div>
      <div class="task-actions">
        <button class="task-action edit" title="Modifier">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" stroke-width="2"/>
            <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="2"/>
          </svg>
        </button>
        <button class="task-action delete" title="Supprimer">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <polyline points="3,6 5,6 21,6" stroke="currentColor" stroke-width="2"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" stroke-width="2"/>
          </svg>
        </button>
      </div>
    `;

    return taskItem;
  }

  /**
   * Échapper les caractères HTML
   * @param {string} text - Texte à échapper
   * @returns {string} Texte échappé
   */
  static escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Obtient les tâches filtrées selon le filtre actuel
   * @returns {Array} Tâches filtrées
   */
  static getFilteredTasks() {
    switch (currentFilter) {
      case 'completed':
        return tasks.filter(task => task.completed);
      case 'pending':
        return tasks.filter(task => !task.completed);
      default:
        return tasks;
    }
  }

  /**
   * Crée une nouvelle tâche (AMÉLIORÉE)
   * @param {string} title - Titre de la tâche
   */
  static async createTask(title) {
    if (!title.trim()) {
      ToastManager.warning('Le titre de la tâche ne peut pas être vide');
      // Marquer visuellement l'erreur
      elements.taskTitle.classList.add('error');
      elements.taskTitle.focus();
      return;
    }

    // Vérifier la longueur
    if (title.trim().length > 255) {
      ToastManager.warning('Le titre ne peut pas dépasser 255 caractères');
      elements.taskTitle.classList.add('error');
      elements.taskTitle.focus();
      return;
    }

    try {
      const newTask = await LoadingManager.withLoading(async () => {
        return await ApiClient.createTask({ title: title.trim() });
      });

      tasks.push(newTask);
      this.renderTasks();
      this.updateStats();
      this.updateFilterCounts();
      
      ToastManager.success('Tâche créée avec succès');
      
      // Réinitialiser le formulaire
      elements.taskTitle.value = '';
      elements.taskTitle.classList.remove('error');
      elements.addTaskBtn.disabled = true; // Désactiver le bouton
      elements.taskTitle.focus();
      
    } catch (error) {
      console.error('Erreur lors de la création de la tâche:', error);
      ToastManager.error(`Impossible de créer la tâche: ${error.message}`);
      elements.taskTitle.classList.add('error');
    }
  }

  /**
   * Bascule l'état d'une tâche (complétée/non complétée)
   * @param {number} taskId - ID de la tâche
   */
  static async toggleTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    try {
      const updatedTask = await LoadingManager.withLoading(async () => {
        return await ApiClient.updateTask(taskId, { completed: !task.completed });
      });

      // Mettre à jour la tâche locale
      const index = tasks.findIndex(t => t.id === taskId);
      if (index !== -1) {
        tasks[index] = updatedTask;
      }

      this.renderTasks();
      this.updateStats();
      this.updateFilterCounts();
      
      ToastManager.success(
        updatedTask.completed ? 'Tâche marquée comme terminée' : 'Tâche marquée comme en cours'
      );
      
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la tâche:', error);
      ToastManager.error(`Impossible de mettre à jour la tâche: ${error.message}`);
    }
  }

  /**
   * Démarre l'édition d'une tâche
   * @param {number} taskId - ID de la tâche à modifier
   */
  static editTask(taskId) {
    if (editingTaskId !== null) {
      this.cancelEdit();
    }

    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    editingTaskId = taskId;
    const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
    const taskContent = taskElement.querySelector('.task-content');
    const taskTitle = taskElement.querySelector('.task-title');
    const taskActions = taskElement.querySelector('.task-actions');

    // Masquer le titre et les actions
    taskTitle.style.display = 'none';
    taskActions.style.display = 'none';

    // Créer l'input d'édition
    const editContainer = document.createElement('div');
    editContainer.className = 'task-edit-container';
    editContainer.innerHTML = `
      <input type="text" class="task-edit-input" value="${this.escapeHtml(task.title)}" maxlength="255">
      <div class="task-edit-actions">
        <button class="btn btn-sm btn-success save-edit-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <polyline points="20,6 9,17 4,12" stroke="currentColor" stroke-width="2"/>
          </svg>
        </button>
        <button class="btn btn-sm btn-secondary cancel-edit-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2"/>
            <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2"/>
          </svg>
        </button>
      </div>
    `;

    taskContent.appendChild(editContainer);
    taskElement.classList.add('editing');

    // Focus sur l'input
    const input = editContainer.querySelector('.task-edit-input');
    input.focus();
    input.select();

    // Attacher les événements pour l'édition
    const saveBtn = editContainer.querySelector('.save-edit-btn');
    const cancelBtn = editContainer.querySelector('.cancel-edit-btn');

    saveBtn.addEventListener('click', () => this.saveEdit());
    cancelBtn.addEventListener('click', () => this.cancelEdit());

    // Gestion des touches
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.saveEdit();
      } else if (e.key === 'Escape') {
        this.cancelEdit();
      }
    });
  }

  /**
   * Sauvegarde l'édition d'une tâche
   */
  static async saveEdit() {
    if (editingTaskId === null) return;

    const taskElement = document.querySelector(`[data-task-id="${editingTaskId}"]`);
    const input = taskElement.querySelector('.task-edit-input');
    const newTitle = input.value.trim();

    if (!newTitle) {
      ToastManager.warning('Le titre ne peut pas être vide');
      return;
    }

    try {
      const updatedTask = await LoadingManager.withLoading(async () => {
        return await ApiClient.updateTask(editingTaskId, { title: newTitle });
      });

      // Mettre à jour la tâche locale
      const index = tasks.findIndex(t => t.id === editingTaskId);
      if (index !== -1) {
        tasks[index] = updatedTask;
      }

      this.cancelEdit();
      this.renderTasks();
      
      ToastManager.success('Tâche mise à jour avec succès');
      
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      ToastManager.error(`Impossible de mettre à jour la tâche: ${error.message}`);
    }
  }

  /**
   * Annule l'édition en cours
   */
  static cancelEdit() {
    if (editingTaskId === null) return;

    const taskElement = document.querySelector(`[data-task-id="${editingTaskId}"]`);
    const editContainer = taskElement.querySelector('.task-edit-container');
    const taskTitle = taskElement.querySelector('.task-title');
    const taskActions = taskElement.querySelector('.task-actions');

    // Supprimer le container d'édition
    if (editContainer) {
      editContainer.remove();
    }

    // Réafficher les éléments originaux
    taskTitle.style.display = '';
    taskActions.style.display = '';
    taskElement.classList.remove('editing');

    editingTaskId = null;
  }

  /**
   * Supprime une tâche
   * @param {number} taskId - ID de la tâche à supprimer
   */
  static async deleteTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const confirmed = await ModalManager.confirm(
      'Supprimer la tâche',
      `Êtes-vous sûr de vouloir supprimer la tâche "${task.title}" ?`
    );

    if (!confirmed) return;

    try {
      await LoadingManager.withLoading(async () => {
        await ApiClient.deleteTask(taskId);
      });

      // Supprimer de la liste locale
      tasks = tasks.filter(t => t.id !== taskId);
      
      this.renderTasks();
      this.updateStats();
      this.updateFilterCounts();
      
      ToastManager.success('Tâche supprimée avec succès');
      
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      ToastManager.error(`Impossible de supprimer la tâche: ${error.message}`);
    }
  }

  /**
   * Supprime toutes les tâches
   */
  static async clearAllTasks() {
    if (tasks.length === 0) {
      ToastManager.warning('Aucune tâche à supprimer');
      return;
    }

    const confirmed = await ModalManager.confirm(
      'Supprimer toutes les tâches',
      `Êtes-vous sûr de vouloir supprimer toutes les ${tasks.length} tâches ? Cette action est irréversible.`
    );

    if (!confirmed) return;

    try {
      await LoadingManager.withLoading(async () => {
        // Supprimer toutes les tâches une par une
        const deletePromises = tasks.map(task => ApiClient.deleteTask(task.id));
        await Promise.all(deletePromises);
      });

      tasks = [];
      this.renderTasks();
      this.updateStats();
      this.updateFilterCounts();
      
      ToastManager.success('Toutes les tâches ont été supprimées');
      
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      ToastManager.error(`Impossible de supprimer toutes les tâches: ${error.message}`);
      // Recharger les tâches pour synchroniser l'état
      this.loadTasks();
    }
  }

  /**
   * Met à jour les statistiques affichées
   */
  static async updateStats() {
    try {
      const stats = await ApiClient.getStats();
      
      elements.totalTasks.textContent = stats.total;
      elements.completedTasks.textContent = stats.completed;
      elements.pendingTasks.textContent = stats.pending;
      elements.completionRate.textContent = `${stats.completionRate}%`;
      
    } catch (error) {
      console.error('Erreur lors de la mise à jour des stats:', error);
      // Fallback: calculer les stats localement
      const total = tasks.length;
      const completed = tasks.filter(t => t.completed).length;
      const pending = total - completed;
      const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
      
      elements.totalTasks.textContent = total;
      elements.completedTasks.textContent = completed;
      elements.pendingTasks.textContent = pending;
      elements.completionRate.textContent = `${rate}%`;
    }
  }

  /**
   * Met à jour les compteurs des filtres
   */
  static updateFilterCounts() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;
    
    elements.allCount.textContent = total;
    elements.completedCount.textContent = completed;
    elements.pendingCount.textContent = pending;
  }

  /**
   * Change le filtre actuel
   * @param {string} filter - Nouveau filtre (all, completed, pending)
   */
  static setFilter(filter) {
    currentFilter = filter;
    
    // Mettre à jour l'UI des onglets
    elements.filterTabs.forEach(tab => {
      tab.classList.toggle('active', tab.dataset.filter === filter);
    });
    
    this.renderTasks();
  }
}

// =============================================================================
// Gestionnaire d'événements (AMÉLIORÉ)
// =============================================================================

class EventManager {
  /**
   * Initialise tous les gestionnaires d'événements
   */
  static init() {
    this.setupFormEvents();
    this.setupFilterEvents();
    this.setupActionEvents();
    this.setupKeyboardEvents();
  }

  /**
   * Configure les événements des formulaires (AMÉLIORÉ)
   */
  static setupFormEvents() {
    // Formulaire d'ajout de tâche
    elements.addTaskForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const title = elements.taskTitle.value.trim();
      if (title) {
        await TaskManager.createTask(title);
      }
    });

    // Validation en temps réel améliorée
    elements.taskTitle.addEventListener('input', (e) => {
      const isValid = e.target.value.trim().length > 0;
      elements.addTaskBtn.disabled = !isValid;
      
      // Enlever les classes d'erreur si l'utilisateur tape
      e.target.classList.remove('error');
    });

    // Validation au focus pour s'assurer de l'état correct
    elements.taskTitle.addEventListener('focus', () => {
      App.initializeButtonState();
    });

    // Gestion du paste pour valider immédiatement
    elements.taskTitle.addEventListener('paste', () => {
      // Utiliser setTimeout pour que le contenu soit mis à jour
      setTimeout(() => {
        App.initializeButtonState();
      }, 0);
    });
  }

  /**
   * Configure les événements des filtres
   */
  static setupFilterEvents() {
    elements.filterTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        TaskManager.setFilter(tab.dataset.filter);
      });
    });
  }

  /**
   * Configure les événements des actions
   */
  static setupActionEvents() {
    // Bouton de rafraîchissement
    elements.refreshBtn.addEventListener('click', async () => {
      await TaskManager.loadTasks();
      ToastManager.success('Tâches actualisées');
    });

    // Bouton de suppression globale
    elements.clearAllBtn.addEventListener('click', async () => {
      await TaskManager.clearAllTasks();
    });
  }

  /**
   * Configure les raccourcis clavier (AMÉLIORÉS)
   */
  static setupKeyboardEvents() {
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + R pour rafraîchir
      if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        TaskManager.loadTasks();
        ToastManager.success('Actualisation forcée');
      }

      // Échapper pour annuler l'édition
      if (e.key === 'Escape' && editingTaskId !== null) {
        TaskManager.cancelEdit();
      }

      // Focus sur l'input avec '/'
      if (e.key === '/' && !e.target.matches('input, textarea')) {
        e.preventDefault();
        elements.taskTitle.focus();
      }

      // Raccourcis supplémentaires
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'n': // Ctrl+N pour nouveau
            e.preventDefault();
            elements.taskTitle.focus();
            break;
          case 'a': // Ctrl+A pour tout sélectionner (si dans une liste)
            if (e.target.closest('.tasks-list')) {
              e.preventDefault();
              // Logique pour sélectionner toutes les tâches
            }
            break;
        }
      }
    });

    // Gestion des raccourcis globaux
    document.addEventListener('keyup', (e) => {
      // Ctrl rapide pour des actions
      if (e.key === 'Control' || e.key === 'Meta') {
        // Réinitialiser les états si nécessaire
      }
    });
  }
}

// =============================================================================
// Utilitaires de debug pour les tests
// =============================================================================

class DebugUtils {
  static logState() {
    console.log('=== État de l\'application ===');
    console.log('Tâches:', tasks);
    console.log('Filtre actuel:', currentFilter);
    console.log('ID en cours d\'édition:', editingTaskId);
    console.log('Bouton désactivé:', elements.addTaskBtn?.disabled);
    console.log('Valeur input:', elements.taskTitle?.value);
  }

  static countElements(selector) {
    const elements = document.querySelectorAll(selector);
    console.log(`Éléments "${selector}":`, elements.length);
    return elements.length;
  }

  static checkToasts() {
    const toasts = document.querySelectorAll('.toast');
    console.log('Toasts actifs:', toasts.length);
    toasts.forEach((toast, index) => {
      console.log(`Toast ${index}:`, toast.className, toast.textContent);
    });
  }
}

// =============================================================================
// Initialisation de l'application (AMÉLIORÉE)
// =============================================================================

class App {
  /**
   * Initialise l'application
   */
  static async init() {
    console.log('🚀 Initialisation de l\'application Todo...');
    
    try {
      // Initialiser les gestionnaires d'événements
      EventManager.init();
      
      // Initialiser l'état du bouton selon l'input
      this.initializeButtonState();
      
      // Charger les données initiales
      await TaskManager.loadTasks();
      
      // Focus sur l'input de création
      elements.taskTitle.focus();
      
      console.log('✅ Application initialisée avec succès');
      ToastManager.success('Application prête à l\'utilisation');
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation:', error);
      ToastManager.error('Erreur lors du chargement de l\'application');
    }
  }

  /**
   * Nouvelle méthode pour initialiser l'état du bouton
   */
  static initializeButtonState() {
    if (elements.taskTitle && elements.addTaskBtn) {
      const isValid = elements.taskTitle.value.trim().length > 0;
      elements.addTaskBtn.disabled = !isValid;
    }
  }

  /**
   * Gestion des erreurs globales améliorée
   */
  static setupErrorHandling() {
    // Gestion des erreurs non capturées
    window.addEventListener('error', (event) => {
      console.error('Erreur JavaScript:', event.error);
      ToastManager.error('Une erreur inattendue s\'est produite');
    });

    // Gestion des promesses rejetées
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Promesse rejetée:', event.reason);
      ToastManager.error('Erreur de communication avec le serveur');
      event.preventDefault(); // Empêche l'affichage dans la console
    });

    // Gestion des erreurs de connexion
    window.addEventListener('offline', () => {
      ToastManager.warning('Connexion Internet perdue');
    });

    window.addEventListener('online', () => {
      ToastManager.success('Connexion Internet rétablie');
    });
  }
}

// =============================================================================
// Lancement de l'application
// =============================================================================

// Exposer les utilitaires en mode développement
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
  window.DebugUtils = DebugUtils;
}

// Attendre que le DOM soit chargé
document.addEventListener('DOMContentLoaded', () => {
  App.setupErrorHandling();
  App.init();
});