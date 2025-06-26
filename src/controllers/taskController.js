/**
 * @fileoverview Contrôleur pour la gestion des tâches
 * @description Contient toute la logique métier pour les opérations CRUD sur les tâches
 */

const taskModel = require('../models/Task');

/**
 * @typedef {Object} ApiResponse
 * @property {boolean} success - Statut de la réponse
 * @property {*} data - Données de la réponse
 * @property {string} [message] - Message optionnel
 */

/**
 * Contrôleur pour la gestion des tâches
 */
class TaskController {
  
  /**
   * Crée une nouvelle tâche
   * @param {Object} req - Objet de requête Express
   * @param {Object} res - Objet de réponse Express
   * @returns {Promise<void>}
   */
  async createTask(req, res) {
    try {
      const { title, completed } = req.body;

      // Validation des données d'entrée
      if (!title || typeof title !== 'string' || title.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Le titre est requis et doit être une chaîne non vide'
        });
      }

      if (completed !== undefined && typeof completed !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: 'Le champ completed doit être un booléen'
        });
      }

      // Création de la tâche
      const taskData = {
        title: title.trim(),
        completed: completed || false
      };

      const newTask = taskModel.create(taskData);

      res.status(201).json(newTask);
    } catch (error) {
      console.error('Erreur lors de la création de la tâche:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  }

  /**
   * Récupère toutes les tâches
   * @param {Object} req - Objet de requête Express
   * @param {Object} res - Objet de réponse Express
   * @returns {Promise<void>}
   */
  async getAllTasks(req, res) {
    try {
      const tasks = taskModel.findAll();
      
      res.status(200).json(tasks);
    } catch (error) {
      console.error('Erreur lors de la récupération des tâches:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  }

  /**
   * Récupère une tâche par son ID
   * @param {Object} req - Objet de requête Express
   * @param {Object} res - Objet de réponse Express
   * @returns {Promise<void>}
   */
  async getTaskById(req, res) {
    try {
      const { id } = req.params;

      // Validation de l'ID
      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          message: 'ID invalide'
        });
      }

      const task = taskModel.findById(id);

      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Tâche non trouvée'
        });
      }

      res.status(200).json(task);
    } catch (error) {
      console.error('Erreur lors de la récupération de la tâche:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  }

  /**
   * Met à jour une tâche existante
   * @param {Object} req - Objet de requête Express
   * @param {Object} res - Objet de réponse Express
   * @returns {Promise<void>}
   */
  async updateTask(req, res) {
    try {
      const { id } = req.params;
      const { title, completed } = req.body;

      // Validation de l'ID
      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          message: 'ID invalide'
        });
      }

      // Validation des données d'entrée
      if (title !== undefined) {
        if (typeof title !== 'string' || title.trim().length === 0) {
          return res.status(400).json({
            success: false,
            message: 'Le titre doit être une chaîne non vide'
          });
        }
      }

      if (completed !== undefined && typeof completed !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: 'Le champ completed doit être un booléen'
        });
      }

      // Vérification que la tâche existe
      const existingTask = taskModel.findById(id);
      if (!existingTask) {
        return res.status(404).json({
          success: false,
          message: 'Tâche non trouvée'
        });
      }

      // Préparation des données de mise à jour
      const updateData = {};
      if (title !== undefined) {
        updateData.title = title.trim();
      }
      if (completed !== undefined) {
        updateData.completed = completed;
      }

      // Mise à jour de la tâche
      const updatedTask = taskModel.update(id, updateData);

      res.status(200).json(updatedTask);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la tâche:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  }

  /**
   * Supprime une tâche
   * @param {Object} req - Objet de requête Express
   * @param {Object} res - Objet de réponse Express
   * @returns {Promise<void>}
   */
  async deleteTask(req, res) {
    try {
      const { id } = req.params;

      // Validation de l'ID
      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          message: 'ID invalide'
        });
      }

      // Suppression de la tâche
      const deleted = taskModel.delete(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Tâche non trouvée'
        });
      }

      res.status(200).json({
        message: 'Task deleted successfully'
      });
    } catch (error) {
      console.error('Erreur lors de la suppression de la tâche:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  }

  /**
   * Récupère les statistiques des tâches
   * @param {Object} req - Objet de requête Express
   * @param {Object} res - Objet de réponse Express
   * @returns {Promise<void>}
   */
  async getTaskStats(req, res) {
    try {
      const allTasks = taskModel.findAll();
      const totalTasks = allTasks.length;
      const completedTasks = allTasks.filter(task => task.completed).length;
      const pendingTasks = totalTasks - completedTasks;

      const stats = {
        total: totalTasks,
        completed: completedTasks,
        pending: pendingTasks,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
      };

      res.status(200).json(stats);
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  }
}

// Export d'une instance du contrôleur
module.exports = new TaskController();