/**
 * @fileoverview Tests unitaires pour l'API Todo
 * @description Tests complets des endpoints CRUD et de la logique métier
 */

const request = require('supertest');
const { app } = require('../../src/app');
const taskModel = require('../../src/models/Task');

// =============================================================================
// Configuration des tests
// =============================================================================

describe('Todo API Tests', () => {
  let server;

  // Configuration avant tous les tests
  beforeAll(async () => {
    // Démarrer le serveur de test
    server = app.listen(0); // Port 0 = port automatique
  });

  // Nettoyage après tous les tests
  afterAll(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  // Réinitialiser les données avant chaque test
  beforeEach(() => {
    taskModel.clear();
  });

  // =============================================================================
  // Tests du modèle Task
  // =============================================================================

  describe('Task Model', () => {
    describe('create()', () => {
      test('devrait créer une nouvelle tâche avec les propriétés requises', () => {
        const taskData = { title: 'Test Task', completed: false };
        const task = taskModel.create(taskData);

        expect(task).toMatchObject({
          id: expect.any(Number),
          title: 'Test Task',
          completed: false,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date)
        });
        expect(task.id).toBe(1);
      });

      test('devrait définir completed à false par défaut', () => {
        const taskData = { title: 'Test Task' };
        const task = taskModel.create(taskData);

        expect(task.completed).toBe(false);
      });

      test('devrait générer des IDs incrémentaux', () => {
        const task1 = taskModel.create({ title: 'Task 1' });
        const task2 = taskModel.create({ title: 'Task 2' });
        const task3 = taskModel.create({ title: 'Task 3' });

        expect(task1.id).toBe(1);
        expect(task2.id).toBe(2);
        expect(task3.id).toBe(3);
      });
    });

    describe('findAll()', () => {
      test('devrait retourner un tableau vide quand aucune tâche', () => {
        const tasks = taskModel.findAll();
        expect(tasks).toEqual([]);
      });

      test('devrait retourner toutes les tâches créées', () => {
        taskModel.create({ title: 'Task 1' });
        taskModel.create({ title: 'Task 2' });
        taskModel.create({ title: 'Task 3' });

        const tasks = taskModel.findAll();
        expect(tasks).toHaveLength(3);
        expect(tasks[0].title).toBe('Task 1');
        expect(tasks[1].title).toBe('Task 2');
        expect(tasks[2].title).toBe('Task 3');
      });
    });

    describe('findById()', () => {
      test('devrait trouver une tâche par son ID', () => {
        const createdTask = taskModel.create({ title: 'Test Task' });
        const foundTask = taskModel.findById(createdTask.id);

        expect(foundTask).toEqual(createdTask);
      });

      test('devrait retourner undefined pour un ID inexistant', () => {
        const foundTask = taskModel.findById(999);
        expect(foundTask).toBeUndefined();
      });

      test('devrait gérer les IDs sous forme de string', () => {
        const createdTask = taskModel.create({ title: 'Test Task' });
        const foundTask = taskModel.findById('1');

        expect(foundTask).toEqual(createdTask);
      });
    });

    describe('update()', () => {
      test('devrait mettre à jour le titre d\'une tâche', () => {
        const task = taskModel.create({ title: 'Original Title' });
        const updatedTask = taskModel.update(task.id, { title: 'Updated Title' });

        expect(updatedTask.title).toBe('Updated Title');
        expect(updatedTask.id).toBe(task.id);
expect(updatedTask.updatedAt.getTime()).toBeGreaterThanOrEqual(task.updatedAt.getTime());
      });

      test('devrait mettre à jour le statut completed', () => {
        const task = taskModel.create({ title: 'Test Task', completed: false });
        const updatedTask = taskModel.update(task.id, { completed: true });

        expect(updatedTask.completed).toBe(true);
        expect(updatedTask.title).toBe('Test Task');
      });

      test('devrait mettre à jour plusieurs propriétés à la fois', () => {
        const task = taskModel.create({ title: 'Original', completed: false });
        const updatedTask = taskModel.update(task.id, {
          title: 'Updated',
          completed: true
        });

        expect(updatedTask.title).toBe('Updated');
        expect(updatedTask.completed).toBe(true);
      });

      test('devrait retourner null pour un ID inexistant', () => {
        const result = taskModel.update(999, { title: 'Updated' });
        expect(result).toBeNull();
      });

      test('ne devrait pas modifier les propriétés non fournies', () => {
        const task = taskModel.create({ title: 'Test Task', completed: false });
        const updatedTask = taskModel.update(task.id, { completed: true });

        expect(updatedTask.title).toBe('Test Task');
        expect(updatedTask.completed).toBe(true);
      });
    });

    describe('delete()', () => {
      test('devrait supprimer une tâche existante', () => {
        const task = taskModel.create({ title: 'Test Task' });
        const result = taskModel.delete(task.id);

        expect(result).toBe(true);
        expect(taskModel.findById(task.id)).toBeUndefined();
        expect(taskModel.findAll()).toHaveLength(0);
      });

      test('devrait retourner false pour un ID inexistant', () => {
        const result = taskModel.delete(999);
        expect(result).toBe(false);
      });

      test('devrait maintenir les autres tâches après suppression', () => {
        const task1 = taskModel.create({ title: 'Task 1' });
        const task2 = taskModel.create({ title: 'Task 2' });
        const task3 = taskModel.create({ title: 'Task 3' });

        taskModel.delete(task2.id);

        const remainingTasks = taskModel.findAll();
        expect(remainingTasks).toHaveLength(2);
        expect(remainingTasks.find(t => t.id === task1.id)).toBeDefined();
        expect(remainingTasks.find(t => t.id === task3.id)).toBeDefined();
        expect(remainingTasks.find(t => t.id === task2.id)).toBeUndefined();
      });
    });

    describe('count() et clear()', () => {
      test('count() devrait retourner le nombre correct de tâches', () => {
        expect(taskModel.count()).toBe(0);

        taskModel.create({ title: 'Task 1' });
        expect(taskModel.count()).toBe(1);

        taskModel.create({ title: 'Task 2' });
        expect(taskModel.count()).toBe(2);
      });

      test('clear() devrait supprimer toutes les tâches et réinitialiser l\'ID', () => {
        taskModel.create({ title: 'Task 1' });
        taskModel.create({ title: 'Task 2' });
        
        expect(taskModel.count()).toBe(2);
        
        taskModel.clear();
        
        expect(taskModel.count()).toBe(0);
        expect(taskModel.findAll()).toEqual([]);
        
        // Vérifier que l'ID est réinitialisé
        const newTask = taskModel.create({ title: 'New Task' });
        expect(newTask.id).toBe(1);
      });
    });
  });

  // =============================================================================
  // Tests des endpoints API
  // =============================================================================

  describe('API Endpoints', () => {
    describe('GET /health', () => {
      test('devrait retourner le statut de santé de l\'API', async () => {
        const response = await request(app)
          .get('/health')
          .expect(200);

        expect(response.body).toMatchObject({
          status: 'OK',
          timestamp: expect.any(String),
          uptime: expect.any(Number),
          version: expect.any(String),
          environment: 'test'
        });
      });
    });

    describe('GET /api', () => {
      test('devrait retourner les informations de l\'API', async () => {
        const response = await request(app)
          .get('/api')
          .expect(200);

        expect(response.body).toMatchObject({
          name: 'Todo API',
          version: '1.0.0',
          description: expect.any(String),
          endpoints: expect.any(Object),
          documentation: expect.any(Object)
        });
      });
    });

    describe('POST /api/tasks', () => {
      test('devrait créer une nouvelle tâche avec des données valides', async () => {
        const taskData = { title: 'Test Task', completed: false };

        const response = await request(app)
          .post('/api/tasks')
          .send(taskData)
          .expect(201);

        expect(response.body).toMatchObject({
          id: 1,
          title: 'Test Task',
          completed: false,
          createdAt: expect.any(String),
          updatedAt: expect.any(String)
        });
      });

      test('devrait créer une tâche avec completed par défaut à false', async () => {
        const taskData = { title: 'Test Task' };

        const response = await request(app)
          .post('/api/tasks')
          .send(taskData)
          .expect(201);

        expect(response.body.completed).toBe(false);
      });

      test('devrait retourner 400 si le titre est manquant', async () => {
        const response = await request(app)
          .post('/api/tasks')
          .send({})
          .expect(400);

        expect(response.body).toMatchObject({
          success: false,
          message: expect.stringContaining('titre')
        });
      });

      test('devrait retourner 400 si le titre est vide', async () => {
        const response = await request(app)
          .post('/api/tasks')
          .send({ title: '   ' })
          .expect(400);

        expect(response.body).toMatchObject({
          success: false,
          message: expect.stringContaining('titre')
        });
      });

      test('devrait retourner 400 si le titre n\'est pas une string', async () => {
        const response = await request(app)
          .post('/api/tasks')
          .send({ title: 123 })
          .expect(400);

        expect(response.body).toMatchObject({
          success: false,
          message: expect.stringContaining('titre')
        });
      });

      test('devrait retourner 400 si completed n\'est pas un booléen', async () => {
        const response = await request(app)
          .post('/api/tasks')
          .send({ title: 'Test Task', completed: 'true' })
          .expect(400);

        expect(response.body).toMatchObject({
          success: false,
          message: expect.stringContaining('completed')
        });
      });

      test('devrait trim les espaces du titre', async () => {
        const response = await request(app)
          .post('/api/tasks')
          .send({ title: '  Test Task  ' })
          .expect(201);

        expect(response.body.title).toBe('Test Task');
      });
    });

    describe('GET /api/tasks', () => {
      test('devrait retourner un tableau vide quand aucune tâche', async () => {
        const response = await request(app)
          .get('/api/tasks')
          .expect(200);

        expect(response.body).toEqual([]);
      });

      test('devrait retourner toutes les tâches', async () => {
        // Créer quelques tâches
        await request(app)
          .post('/api/tasks')
          .send({ title: 'Task 1' });
        
        await request(app)
          .post('/api/tasks')
          .send({ title: 'Task 2', completed: true });

        const response = await request(app)
          .get('/api/tasks')
          .expect(200);

        expect(response.body).toHaveLength(2);
        expect(response.body[0]).toMatchObject({
          id: 1,
          title: 'Task 1',
          completed: false
        });
        expect(response.body[1]).toMatchObject({
          id: 2,
          title: 'Task 2',
          completed: true
        });
      });
    });

    describe('GET /api/tasks/:id', () => {
      test('devrait retourner une tâche spécifique', async () => {
        const createResponse = await request(app)
          .post('/api/tasks')
          .send({ title: 'Test Task' });

        const response = await request(app)
          .get(`/api/tasks/${createResponse.body.id}`)
          .expect(200);

        expect(response.body).toEqual(createResponse.body);
      });

      test('devrait retourner 404 pour un ID inexistant', async () => {
        const response = await request(app)
          .get('/api/tasks/999')
          .expect(404);

        expect(response.body).toMatchObject({
          success: false,
          message: expect.stringContaining('non trouvée')
        });
      });

      test('devrait retourner 400 pour un ID invalide', async () => {
        const response = await request(app)
          .get('/api/tasks/invalid')
          .expect(400);

        expect(response.body).toMatchObject({
          success: false,
          message: expect.stringContaining('ID invalide')
        });
      });
    });

    describe('PUT /api/tasks/:id', () => {
      let taskId;

      beforeEach(async () => {
        const response = await request(app)
          .post('/api/tasks')
          .send({ title: 'Original Task', completed: false });
        taskId = response.body.id;
      });

  test('devrait mettre à jour le titre d\'une tâche', async () => {
  const task = taskModel.create({ title: 'Original Title' });
  
  await new Promise(resolve => setTimeout(resolve, 1));
  
  const updatedTask = taskModel.update(task.id, { title: 'Updated Title' });

  expect(updatedTask.title).toBe('Updated Title');
  expect(updatedTask.id).toBe(task.id);
expect(updatedTask.updatedAt.getTime()).toBeGreaterThanOrEqual(task.updatedAt.getTime());
});

      test('devrait mettre à jour le statut completed', async () => {
        const response = await request(app)
          .put(`/api/tasks/${taskId}`)
          .send({ completed: true })
          .expect(200);

        expect(response.body).toMatchObject({
          id: taskId,
          title: 'Original Task',
          completed: true
        });
      });

      test('devrait mettre à jour plusieurs propriétés', async () => {
        const response = await request(app)
          .put(`/api/tasks/${taskId}`)
          .send({ title: 'Updated Task', completed: true })
          .expect(200);

        expect(response.body).toMatchObject({
          id: taskId,
          title: 'Updated Task',
          completed: true
        });
      });

      test('devrait retourner 404 pour un ID inexistant', async () => {
        const response = await request(app)
          .put('/api/tasks/999')
          .send({ title: 'Updated Task' })
          .expect(404);

        expect(response.body).toMatchObject({
          success: false,
          message: expect.stringContaining('non trouvée')
        });
      });

      test('devrait retourner 400 pour un titre vide', async () => {
        const response = await request(app)
          .put(`/api/tasks/${taskId}`)
          .send({ title: '   ' })
          .expect(400);

        expect(response.body).toMatchObject({
          success: false,
          message: expect.stringContaining('titre')
        });
      });

      test('devrait retourner 400 pour un completed invalide', async () => {
        const response = await request(app)
          .put(`/api/tasks/${taskId}`)
          .send({ completed: 'maybe' })
          .expect(400);

        expect(response.body).toMatchObject({
          success: false,
          message: expect.stringContaining('completed')
        });
      });

      test('devrait trim les espaces du titre', async () => {
        const response = await request(app)
          .put(`/api/tasks/${taskId}`)
          .send({ title: '  Updated Task  ' })
          .expect(200);

        expect(response.body.title).toBe('Updated Task');
      });
    });

    describe('DELETE /api/tasks/:id', () => {
      let taskId;

      beforeEach(async () => {
        const response = await request(app)
          .post('/api/tasks')
          .send({ title: 'Task to delete' });
        taskId = response.body.id;
      });

      test('devrait supprimer une tâche existante', async () => {
        const response = await request(app)
          .delete(`/api/tasks/${taskId}`)
          .expect(200);

        expect(response.body).toMatchObject({
          message: 'Task deleted successfully'
        });

        // Vérifier que la tâche n'existe plus
        await request(app)
          .get(`/api/tasks/${taskId}`)
          .expect(404);
      });

      test('devrait retourner 404 pour un ID inexistant', async () => {
        const response = await request(app)
          .delete('/api/tasks/999')
          .expect(404);

        expect(response.body).toMatchObject({
          success: false,
          message: expect.stringContaining('non trouvée')
        });
      });

      test('devrait retourner 400 pour un ID invalide', async () => {
        const response = await request(app)
          .delete('/api/tasks/invalid')
          .expect(400);

        expect(response.body).toMatchObject({
          success: false,
          message: expect.stringContaining('ID invalide')
        });
      });
    });

    describe('GET /api/tasks/stats', () => {
      test('devrait retourner des statistiques vides pour aucune tâche', async () => {
        const response = await request(app)
          .get('/api/tasks/stats')
          .expect(200);

        expect(response.body).toEqual({
          total: 0,
          completed: 0,
          pending: 0,
          completionRate: 0
        });
      });

      test('devrait calculer les statistiques correctement', async () => {
        // Créer plusieurs tâches avec différents statuts
        await request(app).post('/api/tasks').send({ title: 'Task 1', completed: true });
        await request(app).post('/api/tasks').send({ title: 'Task 2', completed: false });
        await request(app).post('/api/tasks').send({ title: 'Task 3', completed: true });
        await request(app).post('/api/tasks').send({ title: 'Task 4', completed: false });
        await request(app).post('/api/tasks').send({ title: 'Task 5', completed: true });

        const response = await request(app)
          .get('/api/tasks/stats')
          .expect(200);

        expect(response.body).toEqual({
          total: 5,
          completed: 3,
          pending: 2,
          completionRate: 60
        });
      });

      test('devrait gérer le calcul avec 100% de completion', async () => {
        await request(app).post('/api/tasks').send({ title: 'Task 1', completed: true });
        await request(app).post('/api/tasks').send({ title: 'Task 2', completed: true });

        const response = await request(app)
          .get('/api/tasks/stats')
          .expect(200);

        expect(response.body).toEqual({
          total: 2,
          completed: 2,
          pending: 0,
          completionRate: 100
        });
      });
    });
  });

  // =============================================================================
  // Tests d'intégration et de scénarios
  // =============================================================================

  describe('Scénarios d\'intégration', () => {
    test('Workflow complet : créer → lire → modifier → supprimer', async () => {
      // 1. Créer une tâche
      const createResponse = await request(app)
        .post('/api/tasks')
        .send({ title: 'Integration Test Task' })
        .expect(201);

      const taskId = createResponse.body.id;
      expect(createResponse.body.title).toBe('Integration Test Task');
      expect(createResponse.body.completed).toBe(false);

      // 2. Lire la tâche
      const readResponse = await request(app)
        .get(`/api/tasks/${taskId}`)
        .expect(200);

      expect(readResponse.body).toEqual(createResponse.body);

      // 3. Modifier la tâche
      const updateResponse = await request(app)
        .put(`/api/tasks/${taskId}`)
        .send({ title: 'Updated Integration Task', completed: true })
        .expect(200);

      expect(updateResponse.body.title).toBe('Updated Integration Task');
      expect(updateResponse.body.completed).toBe(true);
      expect(updateResponse.body.id).toBe(taskId);

      // 4. Vérifier la modification
      const readUpdatedResponse = await request(app)
        .get(`/api/tasks/${taskId}`)
        .expect(200);

      expect(readUpdatedResponse.body).toEqual(updateResponse.body);

      // 5. Supprimer la tâche
      await request(app)
        .delete(`/api/tasks/${taskId}`)
        .expect(200);

      // 6. Vérifier la suppression
      await request(app)
        .get(`/api/tasks/${taskId}`)
        .expect(404);
    });

    test('devrait gérer plusieurs tâches simultanément', async () => {
      const tasks = [];

      // Créer plusieurs tâches
      for (let i = 1; i <= 5; i++) {
        const response = await request(app)
          .post('/api/tasks')
          .send({ title: `Task ${i}`, completed: i % 2 === 0 });
        tasks.push(response.body);
      }

      // Vérifier que toutes les tâches existent
      const allTasksResponse = await request(app)
        .get('/api/tasks')
        .expect(200);

      expect(allTasksResponse.body).toHaveLength(5);

      // Modifier quelques tâches
      await request(app)
        .put(`/api/tasks/${tasks[0].id}`)
        .send({ completed: true });

      await request(app)
        .put(`/api/tasks/${tasks[2].id}`)
        .send({ title: 'Modified Task 3' });

      // Supprimer une tâche
      await request(app)
        .delete(`/api/tasks/${tasks[4].id}`);

      // Vérifier le résultat final
      const finalResponse = await request(app)
        .get('/api/tasks')
        .expect(200);

      expect(finalResponse.body).toHaveLength(4);
    });

    test('devrait maintenir la cohérence des statistiques', async () => {
      // Créer des tâches
      await request(app).post('/api/tasks').send({ title: 'Task 1', completed: false });
      await request(app).post('/api/tasks').send({ title: 'Task 2', completed: false });
      await request(app).post('/api/tasks').send({ title: 'Task 3', completed: false });

      // Vérifier les stats initiales
      let statsResponse = await request(app).get('/api/tasks/stats').expect(200);
      expect(statsResponse.body).toEqual({
        total: 3,
        completed: 0,
        pending: 3,
        completionRate: 0
      });

      // Compléter une tâche
      await request(app)
        .put('/api/tasks/1')
        .send({ completed: true });

      // Vérifier les stats mises à jour
      statsResponse = await request(app).get('/api/tasks/stats').expect(200);
      expect(statsResponse.body).toEqual({
        total: 3,
        completed: 1,
        pending: 2,
        completionRate: 33
      });

      // Supprimer une tâche non complétée
      await request(app)
        .delete('/api/tasks/2');

      // Vérifier les stats finales
      statsResponse = await request(app).get('/api/tasks/stats').expect(200);
      expect(statsResponse.body).toEqual({
        total: 2,
        completed: 1,
        pending: 1,
        completionRate: 50
      });
    });
  });

  // =============================================================================
  // Tests des routes statiques et de documentation
  // =============================================================================

  describe('Routes de l\'application', () => {
    test('GET / devrait servir l\'interface HTML', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.headers['content-type']).toMatch(/text\/html/);
    });

    test('GET /api-docs.json devrait retourner la spec Swagger', async () => {
      const response = await request(app)
        .get('/api-docs.json')
        .expect(200);

      expect(response.headers['content-type']).toMatch(/application\/json/);
      expect(response.body).toHaveProperty('openapi');
      expect(response.body).toHaveProperty('info');
      expect(response.body).toHaveProperty('paths');
    });

    test('GET /nonexistent devrait retourner 404', async () => {
      const response = await request(app)
        .get('/nonexistent')
        .expect(404);

      expect(response.body).toMatchObject({
        success: false,
        message: expect.stringContaining('Route non trouvée')
      });
    });
  });
});

// =============================================================================
// Tests de performance et de charge
// =============================================================================

describe('Tests de performance', () => {
  beforeEach(() => {
    taskModel.clear();
  });

  test('devrait gérer la création de nombreuses tâches', async () => {
    const startTime = Date.now();
    const promises = [];

    // Créer 100 tâches simultanément
    for (let i = 1; i <= 100; i++) {
      promises.push(
        request(app)
          .post('/api/tasks')
          .send({ title: `Performance Task ${i}` })
      );
    }

    const responses = await Promise.all(promises);
    const endTime = Date.now();

    // Vérifier que toutes les requêtes ont réussi
    responses.forEach(response => {
      expect(response.status).toBe(201);
    });

    // Vérifier que toutes les tâches ont été créées
    const allTasks = await request(app).get('/api/tasks');
    expect(allTasks.body).toHaveLength(100);

    // Le test devrait prendre moins de 5 secondes
    expect(endTime - startTime).toBeLessThan(5000);
  }, 10000); // Timeout de 10 secondes

  test('devrait maintenir la performance avec de nombreuses tâches', async () => {
    // Créer 1000 tâches
    for (let i = 1; i <= 1000; i++) {
      taskModel.create({ title: `Task ${i}`, completed: i % 2 === 0 });
    }

    const startTime = Date.now();

    // Effectuer diverses opérations
    await request(app).get('/api/tasks');
    await request(app).get('/api/tasks/stats');
    await request(app).get('/api/tasks/500');
    await request(app).put('/api/tasks/250').send({ completed: true });
    await request(app).delete('/api/tasks/750');

    const endTime = Date.now();

    // Les opérations devraient rester rapides même avec beaucoup de données
    expect(endTime - startTime).toBeLessThan(1000);
  });
});