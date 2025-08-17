#!/usr/bin/env node
/**
 * Script pour vérifier et préparer une tâche spécifique
 */

import { hooks } from './emoji-mayhem-hooks';

async function checkTask() {
  const taskId = process.argv[2];
  
  if (!taskId) {
    console.error('❌ Usage: npm run hooks:check-task <task-id>');
    console.error('Exemple: npm run hooks:check-task 81add012-996b-4e5a-b0e0-b98199238b2d');
    process.exit(1);
  }
  
  console.log(`📋 Vérification de la tâche: ${taskId}\n`);
  
  try {
    await hooks.beforeTaskStart(taskId);
    console.log('\n✅ Tâche prête à être développée!');
    console.log('Vous pouvez maintenant commencer l\'implémentation.\n');
  } catch (error) {
    console.error('\n❌ Erreur lors de la préparation de la tâche:', error);
    process.exit(1);
  }
}

checkTask();
