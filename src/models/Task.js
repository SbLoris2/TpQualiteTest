/**
 * @fileoverview Modèle de données pour les tâches
 * @description Gestion en mémoire des tâches avec méthodes CRUD
 */

/**
 * @typedef {Object} Task
 * @property {number} id - Identifiant unique de la tâche
 * @property {string} title - Titre de la tâche
 * @property {boolean} completed - Statut de completion de la tâche
 * @property {Date} createdAt - Date de création
 * @property {Date} updatedAt - Date de dernière modification
 */

class TaskModel {
  constructor() {
    /**
     * @type {Task[]} - Tableau des tâches en mémoire
     */
    this.tasks = [];
    /**
     * @type {number} - Compteur pour générer des IDs uniques
     */
    this.nextId = 1;
  }

  /**
   * Crée une nouvelle tâche
   * @param {Object} taskData - Données de la tâche
   * @param {string} taskData.title - Titre de la tâche
   * @param {boolean} [taskData.completed=false] - Statut de completion
   * @returns {Task} La tâche créée
   */
  create(taskData) {
    const task = {
      id: this.nextId++,
      title: taskData.title,
      completed: taskData.completed || false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.tasks.push(task);
    return task;
  }

  /**
   * Récupère toutes les tâches
   * @returns {Task[]} Tableau de toutes les tâches
   */
  findAll() {
    return this.tasks;
  }

  /**
   * Trouve une tâche par son ID
   * @param {number} id - ID de la tâche à trouver
   * @returns {Task|undefined} La tâche trouvée ou undefined
   */
  findById(id) {
    return this.tasks.find(task => task.id === parseInt(id));
  }

  /**
   * Met à jour une tâche existante
   * @param {number} id - ID de la tâche à mettre à jour
   * @param {Object} updateData - Nouvelles données
   * @param {string} [updateData.title] - Nouveau titre
   * @param {boolean} [updateData.completed] - Nouveau statut
   * @returns {Task|null} La tâche mise à jour ou null si non trouvée
   */
update(id, updateData) {
  const taskIndex = this.tasks.findIndex(task => task.id === parseInt(id));
  
  if (taskIndex === -1) {
    return null;
  }

  if (updateData.title !== undefined) {
    this.tasks[taskIndex].title = updateData.title;
  }
  
  if (updateData.completed !== undefined) {
    this.tasks[taskIndex].completed = updateData.completed;
  }

  this.tasks[taskIndex].updatedAt = new Date(Date.now() + 1);
  
  return this.tasks[taskIndex];
}

  /**
   * Supprime une tâche par son ID
   * @param {number} id - ID de la tâche à supprimer
   * @returns {boolean} true si supprimée, false si non trouvée
   */
  delete(id) {
    const taskIndex = this.tasks.findIndex(task => task.id === parseInt(id));
    
    if (taskIndex === -1) {
      return false;
    }

    this.tasks.splice(taskIndex, 1);
    return true;
  }

  /**
   * Compte le nombre total de tâches
   * @returns {number} Nombre de tâches
   */
  count() {
    return this.tasks.length;
  }

  /**
   * Vide toutes les tâches (utile pour les tests)
   * @returns {void}
   */
  clear() {
    this.tasks = [];
    this.nextId = 1;
  }
}

// Instance singleton du modèle
const taskModel = new TaskModel();

module.exports = taskModel;