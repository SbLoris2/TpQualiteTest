# 📝 Todo API Project

API REST pour la gestion de tâches avec interface web, tests automatisés et CI/CD.

## 🚀 Installation

```bash
# Installation des dépendances
npm install

# Lancement en mode développement
npm run dev

# Lancement des tests
npm test

# Tests E2E
npm run test:e2e
```

## 📋 Endpoints API

- `POST /api/tasks` - Créer une tâche
- `GET /api/tasks` - Récupérer toutes les tâches
- `PUT /api/tasks/:id` - Mettre à jour une tâche
- `DELETE /api/tasks/:id` - Supprimer une tâche

## 📚 Documentation

La documentation Swagger est disponible sur : `http://localhost:3000/api-docs`

## 🧪 Tests

- Tests unitaires : Jest
- Tests E2E : Playwright
- CI/CD : GitHub Actions
