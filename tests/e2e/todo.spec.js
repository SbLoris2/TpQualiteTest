/**
 * @fileoverview Tests Playwright pour l'application Todo (Version Compatible)
 * @description Tests end-to-end pour toutes les fonctionnalités de l'application
 */

const { test, expect } = require('@playwright/test');

// Configuration des timeouts et URL de base
const URL_BASE = 'http://localhost:3000'; // Ajustez selon votre configuration
const TIMEOUT = 10000;

// Données de test simulées
const TACHES_TEST = {
  simple: 'Acheter du pain',
  complexe: 'Préparer la présentation pour demain matin à 9h',
  longue: 'A'.repeat(250), // Tâche proche de la limite de 255 caractères
  vide: '',
  espacesOnly: '   '
};

// Fonction d'aide pour compter les éléments
const compterElements = async (page, selecteur) => {
  try {
    const elements = await page.locator(selecteur).all();
    return elements.length;
  } catch (error) {
    return 0;
  }
};

// Fonction d'aide pour vérifier si un élément est visible
const estVisible = async (page, selecteur) => {
  try {
    const element = page.locator(selecteur).first();
    return await element.isVisible();
  } catch (error) {
    return false;
  }
};

// Fonction d'aide pour vérifier si un élément est désactivé
const estDesactive = async (page, selecteur) => {
  try {
    const element = page.locator(selecteur).first();
    return await element.isDisabled();
  } catch (error) {
    return false;
  }
};

// Fonction d'aide pour vérifier si un élément a le focus
const aLeFocus = async (page, selecteur) => {
  try {
    const element = page.locator(selecteur).first();
    return await element.evaluate(el => document.activeElement === el);
  } catch (error) {
    return false;
  }
};

test.describe('Application Todo', () => {
  
  // Configuration avant chaque test
  test.beforeEach(async ({ page }) => {
    await page.goto(URL_BASE);
    await page.waitForLoadState('networkidle');
    
    // Attendre que l'application soit initialisée
    await page.waitForSelector('.header', { timeout: 10000 });
    await page.waitForSelector('#taskTitle', { timeout: 10000 });
  });

  test.describe('Interface et Navigation', () => {
    
    test('devrait afficher l\'interface principale correctement', async ({ page }) => {
      // Vérifier la présence des éléments principaux
      await expect(page.locator('.header h1')).toContainText('Todo API');
      
      const statsVisible = await estVisible(page, '.stats-section');
      expect(statsVisible).toBe(true);
      
      const addTaskVisible = await estVisible(page, '.add-task-section');
      expect(addTaskVisible).toBe(true);
      
      const tasksVisible = await estVisible(page, '.tasks-section');
      expect(tasksVisible).toBe(true);
      
      // Vérifier les liens de navigation
      const apiDocsVisible = await estVisible(page, 'a[href="/api-docs"]');
      expect(apiDocsVisible).toBe(true);
      
      const healthVisible = await estVisible(page, 'a[href="/health"]');
      expect(healthVisible).toBe(true);
    });

    test('devrait afficher les statistiques initiales correctes', async ({ page }) => {
      // Vérifier les statistiques initiales
      await expect(page.locator('#totalTasks')).toContainText('0');
      await expect(page.locator('#completedTasks')).toContainText('0');
      await expect(page.locator('#pendingTasks')).toContainText('0');
      await expect(page.locator('#completionRate')).toContainText('0%');
    });

    test('devrait afficher les onglets de filtre avec les bons compteurs', async ({ page }) => {
      await expect(page.locator('#allCount')).toContainText('0');
      await expect(page.locator('#pendingCount')).toContainText('0');
      await expect(page.locator('#completedCount')).toContainText('0');
      
      // Vérifier que l'onglet "Toutes" est actif par défaut
      await expect(page.locator('[data-filter="all"]')).toHaveClass(/active/);
    });
  });

  test.describe('Création de Tâches', () => {
    
    test('devrait créer une tâche avec la touche Entrée', async ({ page }) => {
      const inputTache = page.locator('#taskTitle');
      
      await inputTache.fill(TACHES_TEST.complexe);
      await inputTache.press('Enter');
      
      await page.waitForTimeout(2000);
      const nombreTaches = await compterElements(page, '.task-item');
      expect(nombreTaches).toBe(1);
      
      await expect(page.locator('.task-title').first()).toContainText(TACHES_TEST.complexe);
    });


    test('devrait désactiver le bouton ajouter quand l\'input est vide', async ({ page }) => {
      const inputTache = page.locator('#taskTitle');
      const boutonAjouter = page.locator('#addTaskBtn');
      
      // L'input devrait être vide au départ et le bouton désactivé
      const estInitialementDesactive = await estDesactive(page, '#addTaskBtn');
      expect(estInitialementDesactive).toBe(true);
      
      // Saisir du texte
      await inputTache.fill('Test');
      await page.waitForTimeout(100);
      const estActiveApresTexte = await estDesactive(page, '#addTaskBtn');
      expect(estActiveApresTexte).toBe(false);
      
      // Vider l'input
      await inputTache.fill('');
      await page.waitForTimeout(100);
      const estDesactiveApresVide = await estDesactive(page, '#addTaskBtn');
      expect(estDesactiveApresVide).toBe(true);
    });
  });

  test.describe('Gestion des Tâches', () => {
    
    // Fonction d'aide pour créer une tâche de test
    const creerTacheTest = async (page, titre = TACHES_TEST.simple) => {
      await page.locator('#taskTitle').fill(titre);
      await page.locator('#addTaskBtn').click();
      await page.waitForTimeout(2000);
      
      // Vérifier que la tâche est créée
      const nombreTaches = await compterElements(page, '.task-item');
      expect(nombreTaches).toBeGreaterThan(0);
    };

    test('devrait basculer l\'état de completion d\'une tâche', async ({ page }) => {
      await creerTacheTest(page);
      
      const itemTache = page.locator('.task-item').first();
      const checkbox = itemTache.locator('.task-checkbox');
      
      // Vérifier l'état initial (non complétée)
      await expect(itemTache).not.toHaveClass(/completed/);
      await expect(checkbox).not.toHaveClass(/checked/);
      
      // Marquer comme complétée
      await checkbox.click();
      await page.waitForTimeout(2000); // Attendre la mise à jour
      
      // Vérifier le changement d'état
      await expect(itemTache).toHaveClass(/completed/);
      await expect(checkbox).toHaveClass(/checked/);
      await expect(page.locator('.toast.success').last()).toContainText('Tâche marquée comme terminée');
      
      // Marquer comme non complétée
      await checkbox.click();
      await page.waitForTimeout(2000);
      
      await expect(itemTache).not.toHaveClass(/completed/);
      await expect(checkbox).not.toHaveClass(/checked/);
      await expect(page.locator('.toast.success').last()).toContainText('Tâche marquée comme en cours');
    });

    test('devrait modifier une tâche avec la touche Entrée', async ({ page }) => {
      await creerTacheTest(page);
      
      const itemTache = page.locator('.task-item').first();
      await itemTache.locator('.task-action.edit').click();
      
      const inputModification = itemTache.locator('.task-edit-input');
      const nouveauTitre = 'Modifié avec Entrée';
      
      await inputModification.fill(nouveauTitre);
      await inputModification.press('Enter');
      await page.waitForTimeout(2000);
      
      await expect(itemTache.locator('.task-title')).toContainText(nouveauTitre);
    });

    test('ne devrait pas sauvegarder une modification vide', async ({ page }) => {
      await creerTacheTest(page);
      
      const itemTache = page.locator('.task-item').first();
      await itemTache.locator('.task-action.edit').click();
      
      const inputModification = itemTache.locator('.task-edit-input');
      await inputModification.fill('');
      await itemTache.locator('.save-edit-btn').click();
      
      // Vérifier qu'un avertissement est affiché
      await expect(page.locator('.toast.warning')).toContainText('Le titre ne peut pas être vide');
      
      // Vérifier que l'édition continue
      await expect(itemTache).toHaveClass(/editing/);
    });
  });

  test.describe('Actions Globales', () => {
    
    test('devrait actualiser les tâches', async ({ page }) => {
      // Créer une tâche
      await page.locator('#taskTitle').fill('Tâche test');
      await page.locator('#addTaskBtn').click();
      await page.waitForTimeout(2000);
      
      // Cliquer sur actualiser
      await page.locator('#refreshBtn').click();
      
      // Vérifier la notification
      await expect(page.locator('.toast.success').last()).toContainText('Tâches actualisées');
    });
  });

  test.describe('États d\'Interface', () => {
    
    test('devrait masquer l\'état vide quand des tâches existent', async ({ page }) => {
      await page.locator('#taskTitle').fill('Ma première tâche');
      await page.locator('#addTaskBtn').click();
      
      await page.waitForTimeout(2000);
      await expect(page.locator('.empty-state')).toHaveClass(/hidden/);
      
      const taskVisible = await estVisible(page, '.task-item');
      expect(taskVisible).toBe(true);
    });
  });

  test.describe('Raccourcis Clavier', () => {
    
    test('devrait donner le focus à l\'input avec la touche /', async ({ page }) => {
      // Presser la touche /
      await page.keyboard.press('/');
      await page.waitForTimeout(100);
      
      // Vérifier que l'input a le focus
      const inputALeFocus = await aLeFocus(page, '#taskTitle');
      expect(inputALeFocus).toBe(true);
    });
  });

  test.describe('Responsivité et Accessibilité', () => {
    
    test('devrait fonctionner sur un écran mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Vérifier que l'interface s'adapte
      const containerVisible = await estVisible(page, '.container');
      expect(containerVisible).toBe(true);
      
      const inputVisible = await estVisible(page, '#taskTitle');
      expect(inputVisible).toBe(true);
      
      // Créer une tâche en mode mobile
      await page.locator('#taskTitle').fill('Tâche mobile');
      await page.locator('#addTaskBtn').click();
      
      await page.waitForTimeout(2000);
      const taskVisible = await estVisible(page, '.task-item');
      expect(taskVisible).toBe(true);
    });
  });

  
});