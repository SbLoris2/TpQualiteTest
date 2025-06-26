/**
 * @fileoverview Routes pour la gestion des tâches
 * @description Définition des endpoints REST pour les opérations CRUD sur les tâches
 */

const express = require('express');
const taskController = require('../controllers/taskController');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Task:
 *       type: object
 *       required:
 *         - title
 *       properties:
 *         id:
 *           type: integer
 *           description: Identifiant unique de la tâche
 *           example: 1
 *         title:
 *           type: string
 *           description: Titre de la tâche
 *           example: "Apprendre Node.js"
 *         completed:
 *           type: boolean
 *           description: Statut de completion de la tâche
 *           example: false
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date de création
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Date de dernière modification
 *     
 *     TaskInput:
 *       type: object
 *       required:
 *         - title
 *       properties:
 *         title:
 *           type: string
 *           description: Titre de la tâche
 *           example: "Apprendre Node.js"
 *         completed:
 *           type: boolean
 *           description: Statut de completion
 *           example: false
 *     
 *     TaskUpdate:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           description: Nouveau titre de la tâche
 *           example: "Maîtriser Node.js"
 *         completed:
 *           type: boolean
 *           description: Nouveau statut de completion
 *           example: true
 *     
 *     Error:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: "Message d'erreur"
 *     
 *     TaskStats:
 *       type: object
 *       properties:
 *         total:
 *           type: integer
 *           description: Nombre total de tâches
 *           example: 10
 *         completed:
 *           type: integer
 *           description: Nombre de tâches complétées
 *           example: 7
 *         pending:
 *           type: integer
 *           description: Nombre de tâches en attente
 *           example: 3
 *         completionRate:
 *           type: integer
 *           description: Pourcentage de completion
 *           example: 70
 */

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Créer une nouvelle tâche
 *     tags: [Tasks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TaskInput'
 *     responses:
 *       201:
 *         description: Tâche créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       400:
 *         description: Données d'entrée invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erreur interne du serveur
 */
router.post('/', taskController.createTask);

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Récupérer toutes les tâches
 *     tags: [Tasks]
 *     responses:
 *       200:
 *         description: Liste de toutes les tâches
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Task'
 *       500:
 *         description: Erreur interne du serveur
 */
router.get('/', taskController.getAllTasks);

/**
 * @swagger
 * /api/tasks/stats:
 *   get:
 *     summary: Récupérer les statistiques des tâches
 *     tags: [Tasks]
 *     responses:
 *       200:
 *         description: Statistiques des tâches
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TaskStats'
 *       500:
 *         description: Erreur interne du serveur
 */
router.get('/stats', taskController.getTaskStats);

/**
 * @swagger
 * /api/tasks/{id}:
 *   get:
 *     summary: Récupérer une tâche par son ID
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la tâche
 *     responses:
 *       200:
 *         description: Tâche trouvée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       400:
 *         description: ID invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Tâche non trouvée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erreur interne du serveur
 */
router.get('/:id', taskController.getTaskById);

/**
 * @swagger
 * /api/tasks/{id}:
 *   put:
 *     summary: Mettre à jour une tâche
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la tâche à mettre à jour
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TaskUpdate'
 *     responses:
 *       200:
 *         description: Tâche mise à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       400:
 *         description: Données invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Tâche non trouvée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erreur interne du serveur
 */
router.put('/:id', taskController.updateTask);

/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     summary: Supprimer une tâche
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la tâche à supprimer
 *     responses:
 *       200:
 *         description: Tâche supprimée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Task deleted successfully"
 *       400:
 *         description: ID invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Tâche non trouvée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erreur interne du serveur
 */
router.delete('/:id', taskController.deleteTask);

module.exports = router;