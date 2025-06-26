/**
 * @fileoverview Configuration Swagger pour la documentation API
 * @description Configuration complète de Swagger UI avec définitions des schémas
 */

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

/**
 * Configuration de base pour Swagger
 */
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Todo API',
      version: '1.0.0',
      description: `
        API REST pour la gestion de tâches (To-Do List) avec opérations CRUD complètes.
        
        ## Fonctionnalités
        - ✅ Créer des tâches
        - 📋 Lister toutes les tâches
        - 🔍 Récupérer une tâche spécifique
        - ✏️ Mettre à jour des tâches
        - 🗑️ Supprimer des tâches
        - 📊 Statistiques des tâches
        
        ## Technologies utilisées
        - Node.js & Express.js
        - Tests avec Jest & Playwright
        - CI/CD avec GitHub Actions
        - Documentation automatique avec Swagger
      `,
      contact: {
        name: 'Support API Todo',
        email: 'support@todoapi.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Serveur de développement'
      },
      {
        url: 'https://your-production-url.com',
        description: 'Serveur de production'
      }
    ],
    tags: [
      {
        name: 'Tasks',
        description: 'Opérations CRUD sur les tâches'
      },
      {
        name: 'Health',
        description: 'Endpoints de santé de l\'API'
      }
    ],
    components: {
      schemas: {
        Task: {
          type: 'object',
          required: ['id', 'title', 'completed'],
          properties: {
            id: {
              type: 'integer',
              description: 'Identifiant unique de la tâche',
              example: 1,
              readOnly: true
            },
            title: {
              type: 'string',
              description: 'Titre de la tâche',
              example: 'Apprendre Node.js',
              minLength: 1,
              maxLength: 255
            },
            completed: {
              type: 'boolean',
              description: 'Statut de completion de la tâche',
              example: false
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Date de création de la tâche',
              example: '2025-06-26T10:30:00.000Z',
              readOnly: true
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Date de dernière modification',
              example: '2025-06-26T11:45:00.000Z',
              readOnly: true
            }
          }
        },
        TaskInput: {
          type: 'object',
          required: ['title'],
          properties: {
            title: {
              type: 'string',
              description: 'Titre de la tâche',
              example: 'Apprendre Node.js',
              minLength: 1,
              maxLength: 255
            },
            completed: {
              type: 'boolean',
              description: 'Statut de completion (optionnel, défaut: false)',
              example: false,
              default: false
            }
          }
        },
        TaskUpdate: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              description: 'Nouveau titre de la tâche',
              example: 'Maîtriser Node.js',
              minLength: 1,
              maxLength: 255
            },
            completed: {
              type: 'boolean',
              description: 'Nouveau statut de completion',
              example: true
            }
          },
          minProperties: 1
        },
        TaskStats: {
          type: 'object',
          properties: {
            total: {
              type: 'integer',
              description: 'Nombre total de tâches',
              example: 10,
              minimum: 0
            },
            completed: {
              type: 'integer',
              description: 'Nombre de tâches complétées',
              example: 7,
              minimum: 0
            },
            pending: {
              type: 'integer',
              description: 'Nombre de tâches en attente',
              example: 3,
              minimum: 0
            },
            completionRate: {
              type: 'integer',
              description: 'Pourcentage de completion (0-100)',
              example: 70,
              minimum: 0,
              maximum: 100
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
              description: 'Indique si la requête a échoué'
            },
            message: {
              type: 'string',
              example: 'Message d\'erreur détaillé',
              description: 'Description de l\'erreur'
            },
            statusCode: {
              type: 'integer',
              example: 400,
              description: 'Code de statut HTTP'
            }
          }
        },
        HealthCheck: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'OK',
              description: 'Statut de l\'API'
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              example: '2025-06-26T10:30:00.000Z',
              description: 'Timestamp de la vérification'
            },
            uptime: {
              type: 'number',
              example: 3600.5,
              description: 'Temps de fonctionnement en secondes'
            },
            version: {
              type: 'string',
              example: '1.0.0',
              description: 'Version de l\'API'
            },
            environment: {
              type: 'string',
              example: 'development',
              description: 'Environnement d\'exécution'
            }
          }
        }
      },
      responses: {
        BadRequest: {
          description: 'Requête invalide - données manquantes ou incorrectes',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                message: 'Le titre est requis et doit être une chaîne non vide',
                statusCode: 400
              }
            }
          }
        },
        NotFound: {
          description: 'Ressource non trouvée',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                message: 'Tâche non trouvée',
                statusCode: 404
              }
            }
          }
        },
        InternalServerError: {
          description: 'Erreur interne du serveur',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                message: 'Erreur interne du serveur',
                statusCode: 500
              }
            }
          }
        }
      },
      parameters: {
        TaskId: {
          name: 'id',
          in: 'path',
          required: true,
          schema: {
            type: 'integer',
            minimum: 1
          },
          description: 'Identifiant unique de la tâche',
          example: 1
        }
      }
    }
  },
  apis: [
    './src/routes/*.js',
    './src/app.js'
  ]
};

/**
 * Configuration personnalisée pour Swagger UI
 */
const swaggerUiOptions = {
  customCss: `
    .swagger-ui .topbar { display: none; }
    .swagger-ui .info .title { color: #2c3e50; }
    .swagger-ui .scheme-container { background: #f8f9fa; padding: 15px; border-radius: 5px; }
  `,
  customSiteTitle: 'Todo API Documentation',
  customfavIcon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTMgOEw2IDExTDEzIDQiIHN0cm9rZT0iIzJjM2U1MCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    docExpansion: 'list',
    filter: true,
    showExtensions: true,
    tryItOutEnabled: true,
    requestInterceptor: (req) => {
      req.headers['X-API-Client'] = 'Swagger-UI';
      return req;
    }
  }
};

/**
 * Génère la spécification Swagger
 */
const specs = swaggerJsdoc(swaggerOptions);

/**
 * Configuration du middleware Swagger
 * @param {Object} app - Instance Express
 */
const setupSwagger = (app) => {
  // Route pour la documentation JSON
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });

  // Route pour l'interface Swagger UI
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, swaggerUiOptions));

  // Route alternative pour la documentation
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(specs, swaggerUiOptions));

  console.log('📚 Documentation Swagger disponible sur:');
  console.log('   - http://localhost:3000/api-docs');
  console.log('   - http://localhost:3000/docs');
  console.log('   - http://localhost:3000/api-docs.json (JSON)');
};

module.exports = {
  setupSwagger,
  swaggerOptions,
  swaggerUiOptions,
  specs
};