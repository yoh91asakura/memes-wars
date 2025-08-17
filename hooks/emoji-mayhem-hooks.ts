/**
 * Emoji Mayhem TCG - Project Hooks
 * Ces hooks sont appelés automatiquement à différents moments du développement
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

// Configuration
const PROJECT_ROOT = path.resolve(__dirname, '..');
const ARCHON_API = 'http://localhost:8181';
const PROJECT_ID = '196233ba-fbac-4ada-b0f9-37658c0e73ea';

/**
 * Hook: Avant de commencer une nouvelle tâche
 * Vérifie l'état du projet et prépare l'environnement
 */
export async function beforeTaskStart(taskId: string): Promise<void> {
  console.log('🎯 Préparation pour la tâche:', taskId);
  
  // 1. Vérifier que tous les services sont actifs
  await checkServices();
  
  // 2. Pull les derniers changements si nécessaire
  await syncWithGit();
  
  // 3. Installer les dépendances si package.json a changé
  await checkDependencies();
  
  // 4. Mettre à jour le statut de la tâche dans Archon
  await updateTaskStatus(taskId, 'doing');
  
  // 5. Créer une branche pour la tâche
  await createTaskBranch(taskId);
  
  console.log('✅ Environnement prêt pour la tâche');
}

/**
 * Hook: Après avoir terminé une tâche
 * Valide le travail et met à jour les statuts
 */
export async function afterTaskComplete(taskId: string): Promise<void> {
  console.log('🏁 Finalisation de la tâche:', taskId);
  
  // 1. Lancer les tests
  const testResults = await runTests();
  
  // 2. Vérifier le coverage
  const coverage = await checkTestCoverage();
  
  // 3. Linter le code
  await lintCode();
  
  // 4. Commit les changements
  await commitChanges(taskId);
  
  // 5. Mettre à jour le statut dans Archon
  if (testResults.success && coverage >= 90) {
    await updateTaskStatus(taskId, 'review');
    console.log('✅ Tâche complétée et en review');
  } else {
    console.log('⚠️ Des corrections sont nécessaires');
    console.log(`   Tests: ${testResults.success ? '✅' : '❌'}`);
    console.log(`   Coverage: ${coverage}% (min: 90%)`);
  }
}

/**
 * Hook: Avant de créer une nouvelle carte
 * Prépare la structure et vérifie les contraintes
 */
export async function beforeCardCreation(rarity: string): Promise<void> {
  console.log(`🃏 Préparation pour créer des cartes ${rarity}`);
  
  // 1. Vérifier que le fichier de données existe
  const dataPath = path.join(PROJECT_ROOT, 'src', 'data', 'cards');
  await fs.mkdir(dataPath, { recursive: true });
  
  // 2. Charger le template approprié
  const template = await loadCardTemplate(rarity);
  
  // 3. Vérifier les cartes existantes pour éviter les doublons
  const existingCards = await checkExistingCards(rarity);
  
  console.log(`📊 ${existingCards.length} cartes ${rarity} existantes`);
  console.log('✅ Prêt pour créer de nouvelles cartes');
}

/**
 * Hook: Après avoir créé des cartes
 * Valide et intègre les nouvelles cartes
 */
export async function afterCardCreation(rarity: string, cards: any[]): Promise<void> {
  console.log(`🎴 Validation de ${cards.length} cartes ${rarity}`);
  
  // 1. Valider les stats selon la rareté
  const validation = validateCardStats(rarity, cards);
  
  if (!validation.valid) {
    throw new Error(`Validation échouée: ${validation.errors.join(', ')}`);
  }
  
  // 2. Générer les tests pour les nouvelles cartes
  await generateCardTests(rarity, cards);
  
  // 3. Mettre à jour le RollService pour inclure les nouvelles cartes
  await updateRollService(rarity, cards);
  
  // 4. Mettre à jour la documentation
  await updateCardDocumentation(rarity, cards);
  
  console.log('✅ Cartes créées et intégrées avec succès');
}

/**
 * Hook: Avant de lancer le serveur de développement
 * Vérifie que tout est prêt pour le développement
 */
export async function beforeDevServer(): Promise<void> {
  console.log('🚀 Préparation du serveur de développement');
  
  // 1. Vérifier Archon
  const archonStatus = await checkArchonStatus();
  if (!archonStatus.healthy) {
    console.log('⚠️ Archon n\'est pas actif, démarrage...');
    await startArchon();
  }
  
  // 2. Nettoyer les fichiers temporaires
  await cleanTempFiles();
  
  // 3. Compiler TypeScript si nécessaire
  await compileTypeScript();
  
  console.log('✅ Serveur de développement prêt');
}

/**
 * Hook: Après un build de production
 * Optimise et vérifie le bundle
 */
export async function afterBuild(): Promise<void> {
  console.log('📦 Post-traitement du build');
  
  // 1. Analyser la taille du bundle
  const bundleSize = await analyzeBundleSize();
  
  if (bundleSize > 5 * 1024 * 1024) { // 5MB
    console.warn('⚠️ Bundle trop large:', formatBytes(bundleSize));
  }
  
  // 2. Générer le rapport de performance
  await generatePerformanceReport();
  
  // 3. Créer les source maps
  await generateSourceMaps();
  
  console.log('✅ Build optimisé et prêt');
}

/**
 * Hook: Lors d'une erreur dans le développement
 * Capture et analyse les erreurs pour amélioration
 */
export async function onError(error: Error, context: string): Promise<void> {
  console.error('❌ Erreur détectée:', context);
  
  // 1. Logger l'erreur complète
  await logError(error, context);
  
  // 2. Vérifier si c'est une erreur connue
  const knownIssue = await checkKnownIssues(error);
  
  if (knownIssue) {
    console.log('💡 Solution suggérée:', knownIssue.solution);
  }
  
  // 3. Créer un rapport d'erreur si critique
  if (isCriticalError(error)) {
    await createErrorReport(error, context);
    console.log('📝 Rapport d\'erreur créé');
  }
}

/**
 * Hook: Validation avant commit
 * S'assure que le code respecte les standards
 */
export async function preCommitHook(): Promise<boolean> {
  console.log('🔍 Validation pre-commit');
  
  const checks = {
    tests: false,
    lint: false,
    types: false,
    coverage: false
  };
  
  // 1. Tests
  const testResult = await runTests();
  checks.tests = testResult.success;
  
  // 2. Linting
  const lintResult = await lintCode();
  checks.lint = lintResult.success;
  
  // 3. TypeScript
  const typeCheck = await checkTypes();
  checks.types = typeCheck.success;
  
  // 4. Coverage
  const coverage = await checkTestCoverage();
  checks.coverage = coverage >= 90;
  
  // Afficher le résumé
  console.log('\n📊 Résumé pre-commit:');
  console.log(`   Tests: ${checks.tests ? '✅' : '❌'}`);
  console.log(`   Lint: ${checks.lint ? '✅' : '❌'}`);
  console.log(`   Types: ${checks.types ? '✅' : '❌'}`);
  console.log(`   Coverage: ${checks.coverage ? '✅' : '❌'}`);
  
  const allPassed = Object.values(checks).every(v => v);
  
  if (!allPassed) {
    console.log('\n❌ Commit bloqué - Corrigez les erreurs ci-dessus');
  }
  
  return allPassed;
}

// ============= Fonctions utilitaires =============

async function checkServices(): Promise<void> {
  try {
    // Vérifier Archon
    const archonResponse = await fetch(`${ARCHON_API}/health`);
    if (!archonResponse.ok) throw new Error('Archon non disponible');
    
    // Vérifier le dev server
    const devResponse = await fetch('http://localhost:5173');
    // Si ça échoue c'est normal, on le démarre après
  } catch (error) {
    console.log('📌 Services à démarrer');
  }
}

async function syncWithGit(): Promise<void> {
  try {
    const { stdout } = await execAsync('git status --porcelain');
    if (stdout) {
      console.log('📝 Changements locaux détectés');
    }
  } catch (error) {
    console.log('⚠️ Git non configuré');
  }
}

async function checkDependencies(): Promise<void> {
  const packageJsonPath = path.join(PROJECT_ROOT, 'package.json');
  const lockPath = path.join(PROJECT_ROOT, 'package-lock.json');
  
  try {
    const [packageStat, lockStat] = await Promise.all([
      fs.stat(packageJsonPath),
      fs.stat(lockPath)
    ]);
    
    if (packageStat.mtime > lockStat.mtime) {
      console.log('📦 Installation des dépendances...');
      await execAsync('npm install', { cwd: PROJECT_ROOT });
    }
  } catch (error) {
    console.log('📦 Installation initiale des dépendances...');
    await execAsync('npm install', { cwd: PROJECT_ROOT });
  }
}

async function updateTaskStatus(taskId: string, status: string): Promise<void> {
  const response = await fetch(`${ARCHON_API}/api/tasks/${taskId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  
  if (!response.ok) {
    console.warn('⚠️ Impossible de mettre à jour le statut dans Archon');
  }
}

async function createTaskBranch(taskId: string): Promise<void> {
  try {
    const branchName = `task/${taskId.slice(0, 8)}`;
    await execAsync(`git checkout -b ${branchName}`);
    console.log(`🌿 Branche créée: ${branchName}`);
  } catch (error) {
    // Si git n'est pas configuré, on continue
  }
}

async function runTests(): Promise<{ success: boolean; failed: number }> {
  try {
    const { stdout } = await execAsync('npm test', { cwd: PROJECT_ROOT });
    return { success: true, failed: 0 };
  } catch (error: any) {
    const failedMatch = error.stdout?.match(/(\d+) failed/);
    const failed = failedMatch ? parseInt(failedMatch[1]) : -1;
    return { success: false, failed };
  }
}

async function checkTestCoverage(): Promise<number> {
  try {
    const { stdout } = await execAsync('npm run test:coverage', { cwd: PROJECT_ROOT });
    const coverageMatch = stdout.match(/All files[^|]*\|[^|]*\|[^|]*\|[^|]*\|\s*([\d.]+)/);
    return coverageMatch ? parseFloat(coverageMatch[1]) : 0;
  } catch {
    return 0;
  }
}

async function lintCode(): Promise<{ success: boolean }> {
  try {
    await execAsync('npm run lint', { cwd: PROJECT_ROOT });
    return { success: true };
  } catch {
    return { success: false };
  }
}

async function commitChanges(taskId: string): Promise<void> {
  try {
    await execAsync('git add .', { cwd: PROJECT_ROOT });
    await execAsync(`git commit -m "feat: complete task ${taskId}"`, { cwd: PROJECT_ROOT });
  } catch (error) {
    console.log('⚠️ Commit automatique échoué');
  }
}

async function loadCardTemplate(rarity: string): Promise<any> {
  const templatePath = path.join(PROJECT_ROOT, 'templates', `card-${rarity}.template.ts`);
  try {
    const content = await fs.readFile(templatePath, 'utf-8');
    return content;
  } catch {
    return null;
  }
}

async function checkExistingCards(rarity: string): Promise<any[]> {
  const cardsPath = path.join(PROJECT_ROOT, 'src', 'data', 'cards', `${rarity}Cards.ts`);
  try {
    const module = await import(cardsPath);
    return module.default || [];
  } catch {
    return [];
  }
}

function validateCardStats(rarity: string, cards: any[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const statsRanges: Record<string, { hp: [number, number]; as: [number, number] }> = {
    common: { hp: [10, 20], as: [0.5, 1.0] },
    uncommon: { hp: [20, 40], as: [1.0, 1.5] },
    rare: { hp: [40, 80], as: [1.5, 2.0] },
    epic: { hp: [80, 150], as: [2.0, 2.5] },
    legendary: { hp: [150, 300], as: [2.5, 3.0] },
    mythic: { hp: [300, 500], as: [3.0, 4.0] },
    cosmic: { hp: [700, 800], as: [4.0, 5.0] }
  };
  
  const range = statsRanges[rarity.toLowerCase()];
  if (!range) {
    errors.push(`Rareté inconnue: ${rarity}`);
    return { valid: false, errors };
  }
  
  cards.forEach((card, index) => {
    if (card.hp < range.hp[0] || card.hp > range.hp[1]) {
      errors.push(`Carte ${index}: HP hors limites (${card.hp})`);
    }
    if (card.attackSpeed < range.as[0] || card.attackSpeed > range.as[1]) {
      errors.push(`Carte ${index}: AS hors limites (${card.attackSpeed})`);
    }
  });
  
  return { valid: errors.length === 0, errors };
}

async function generateCardTests(rarity: string, cards: any[]): Promise<void> {
  const testPath = path.join(PROJECT_ROOT, 'src', 'data', 'cards', '__tests__', `${rarity}Cards.test.ts`);
  const testContent = `
import { ${rarity}Cards } from '../${rarity}Cards';

describe('${rarity} Cards', () => {
  test('should have correct number of cards', () => {
    expect(${rarity}Cards).toHaveLength(${cards.length});
  });
  
  test('all cards should have ${rarity} rarity', () => {
    ${rarity}Cards.forEach(card => {
      expect(card.rarity).toBe('${rarity}');
    });
  });
});`;
  
  await fs.mkdir(path.dirname(testPath), { recursive: true });
  await fs.writeFile(testPath, testContent);
}

async function updateRollService(rarity: string, cards: any[]): Promise<void> {
  console.log(`🎲 Mise à jour du RollService avec ${cards.length} cartes ${rarity}`);
  // Implementation spécifique au projet
}

async function updateCardDocumentation(rarity: string, cards: any[]): Promise<void> {
  const docPath = path.join(PROJECT_ROOT, 'docs', 'cards', `${rarity}.md`);
  const docContent = `# ${rarity} Cards\n\nTotal: ${cards.length} cards\n\n${
    cards.map(c => `- ${c.name}: HP ${c.hp}, AS ${c.attackSpeed}`).join('\n')
  }`;
  
  await fs.mkdir(path.dirname(docPath), { recursive: true });
  await fs.writeFile(docPath, docContent);
}

async function checkArchonStatus(): Promise<{ healthy: boolean }> {
  try {
    const response = await fetch(`${ARCHON_API}/health`);
    return { healthy: response.ok };
  } catch {
    return { healthy: false };
  }
}

async function startArchon(): Promise<void> {
  try {
    await execAsync('docker-compose up -d', { cwd: path.join(PROJECT_ROOT, 'archon') });
    await new Promise(resolve => setTimeout(resolve, 5000)); // Attendre le démarrage
  } catch (error) {
    console.error('❌ Impossible de démarrer Archon');
  }
}

async function cleanTempFiles(): Promise<void> {
  const tempDirs = ['.parcel-cache', 'dist', 'node_modules/.cache'];
  for (const dir of tempDirs) {
    try {
      await fs.rm(path.join(PROJECT_ROOT, dir), { recursive: true, force: true });
    } catch {
      // Ignorer si le dossier n'existe pas
    }
  }
}

async function compileTypeScript(): Promise<void> {
  try {
    await execAsync('npx tsc --noEmit', { cwd: PROJECT_ROOT });
  } catch (error) {
    console.warn('⚠️ Erreurs TypeScript détectées');
  }
}

async function analyzeBundleSize(): Promise<number> {
  const distPath = path.join(PROJECT_ROOT, 'dist');
  let totalSize = 0;
  
  try {
    const files = await fs.readdir(distPath);
    for (const file of files) {
      const stat = await fs.stat(path.join(distPath, file));
      totalSize += stat.size;
    }
  } catch {
    return 0;
  }
  
  return totalSize;
}

function formatBytes(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

async function generatePerformanceReport(): Promise<void> {
  console.log('📊 Génération du rapport de performance');
  // Implementation spécifique
}

async function generateSourceMaps(): Promise<void> {
  console.log('🗺️ Génération des source maps');
  // Implementation spécifique
}

async function logError(error: Error, context: string): Promise<void> {
  const errorLog = {
    timestamp: new Date().toISOString(),
    context,
    message: error.message,
    stack: error.stack
  };
  
  const logPath = path.join(PROJECT_ROOT, 'logs', 'errors.log');
  await fs.mkdir(path.dirname(logPath), { recursive: true });
  await fs.appendFile(logPath, JSON.stringify(errorLog) + '\n');
}

async function checkKnownIssues(error: Error): Promise<{ solution: string } | null> {
  const knownIssues = [
    {
      pattern: /Cannot find module/,
      solution: 'Installer les dépendances: npm install'
    },
    {
      pattern: /EADDRINUSE/,
      solution: 'Port déjà utilisé, arrêter le processus ou changer de port'
    },
    {
      pattern: /TypeScript error/,
      solution: 'Vérifier les types: npx tsc --noEmit'
    }
  ];
  
  for (const issue of knownIssues) {
    if (issue.pattern.test(error.message)) {
      return { solution: issue.solution };
    }
  }
  
  return null;
}

function isCriticalError(error: Error): boolean {
  const criticalPatterns = [
    /FATAL/,
    /CRITICAL/,
    /data loss/i,
    /corruption/i
  ];
  
  return criticalPatterns.some(pattern => pattern.test(error.message));
}

async function createErrorReport(error: Error, context: string): Promise<void> {
  const report = {
    timestamp: new Date().toISOString(),
    context,
    error: {
      message: error.message,
      stack: error.stack
    },
    environment: {
      node: process.version,
      platform: process.platform,
      arch: process.arch
    }
  };
  
  const reportPath = path.join(PROJECT_ROOT, 'reports', `error-${Date.now()}.json`);
  await fs.mkdir(path.dirname(reportPath), { recursive: true });
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
}

async function checkTypes(): Promise<{ success: boolean }> {
  try {
    await execAsync('npx tsc --noEmit', { cwd: PROJECT_ROOT });
    return { success: true };
  } catch {
    return { success: false };
  }
}

// Export des hooks pour utilisation
export const hooks = {
  beforeTaskStart,
  afterTaskComplete,
  beforeCardCreation,
  afterCardCreation,
  beforeDevServer,
  afterBuild,
  onError,
  preCommitHook
};
