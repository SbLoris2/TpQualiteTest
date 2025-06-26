/**
 * @fileoverview Middleware de gestion centralisée des erreurs
 * @description Gestion globale des erreurs avec logging et formatage des réponses
 */

/**
 * Middleware de gestion des erreurs 404 (Route non trouvée)
 * @param {Object} req - Objet de requête Express
 * @param {Object} res - Objet de réponse Express
 * @param {Function} next - Fonction next d'Express
 */
const notFound = (req, res, next) => {
  const error = new Error(`Route non trouvée - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * Middleware principal de gestion des erreurs
 * @param {Error} err - Objet d'erreur
 * @param {Object} req - Objet de requête Express
 * @param {Object} res - Objet de réponse Express
 * @param {Function} next - Fonction next d'Express
 */
const errorHandler = (err, req, res, next) => {
  // Récupération du code de statut (défaut : 500)
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // Gestion spécifique des erreurs de validation JSON
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = 400;
    message = 'JSON invalide dans le corps de la requête';
  }

  // Gestion des erreurs de cast (ex: ID invalide)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Ressource non trouvée - ID invalide';
  }

  // Gestion des erreurs de validation
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map(val => val.message).join(', ');
  }

  // Gestion des erreurs de duplication
  if (err.code === 11000) {
    statusCode = 400;
    message = 'Données dupliquées détectées';
  }

  // Log de l'erreur (en production, utiliser un logger comme Winston)
  console.error('🚨 Erreur détectée:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  // Réponse d'erreur formatée
  const errorResponse = {
    success: false,
    message: message,
    statusCode: statusCode
  };

  // En mode développement, inclure la stack trace
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
    errorResponse.details = {
      url: req.originalUrl,
      method: req.method,
      headers: req.headers,
      body: req.body,
      params: req.params,
      query: req.query
    };
  }

  res.status(statusCode).json(errorResponse);
};

/**
 * Middleware de validation des données JSON
 * @param {Error} err - Objet d'erreur
 * @param {Object} req - Objet de requête Express
 * @param {Object} res - Objet de réponse Express
 * @param {Function} next - Fonction next d'Express
 */
const validateJSON = (err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      message: 'JSON invalide dans le corps de la requête',
      error: 'Veuillez vérifier la syntaxe de votre JSON'
    });
  }
  next(err);
};

/**
 * Middleware de logging des requêtes (version simplifiée)
 * @param {Object} req - Objet de requête Express
 * @param {Object} res - Objet de réponse Express
 * @param {Function} next - Fonction next d'Express
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Log de la requête entrante
  console.log(`📥 ${req.method} ${req.originalUrl} - ${req.ip}`);
  
  // Intercepter la fin de la réponse pour logger la durée
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - start;
    console.log(`📤 ${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`);
    originalSend.call(this, data);
  };
  
  next();
};

/**
 * Middleware de validation des paramètres d'ID
 * @param {Object} req - Objet de requête Express
 * @param {Object} res - Objet de réponse Express
 * @param {Function} next - Fonction next d'Express
 */
const validateId = (req, res, next) => {
  const { id } = req.params;
  
  if (id && (isNaN(parseInt(id)) || parseInt(id) < 1)) {
    return res.status(400).json({
      success: false,
      message: 'ID invalide - doit être un nombre entier positif'
    });
  }
  
  next();
};

/**
 * Middleware de limitation de taille du body
 * @param {number} maxSize - Taille maximale en bytes
 * @returns {Function} Middleware Express
 */
const bodyLimit = (maxSize = 1024 * 1024) => { // 1MB par défaut
  return (req, res, next) => {
    const contentLength = req.get('Content-Length');
    
    if (contentLength && parseInt(contentLength) > maxSize) {
      return res.status(413).json({
        success: false,
        message: `Corps de la requête trop volumineux. Maximum autorisé: ${maxSize} bytes`
      });
    }
    
    next();
  };
};

/**
 * Middleware de sécurité basique
 * @param {Object} req - Objet de requête Express
 * @param {Object} res - Objet de réponse Express
 * @param {Function} next - Fonction next d'Express
 */
const basicSecurity = (req, res, next) => {
  // Headers de sécurité basiques
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Masquer la signature du serveur
  res.removeHeader('X-Powered-By');
  
  next();
};

module.exports = {
  notFound,
  errorHandler,
  validateJSON,
  requestLogger,
  validateId,
  bodyLimit,
  basicSecurity
};