#!/usr/bin/env node
/**
 * Hook pre-commit pour valider le code avant commit
 */

import { hooks } from './emoji-mayhem-hooks';

async function preCommit() {
  console.log('🔍 Validation pre-commit en cours...\n');
  
  try {
    const canCommit = await hooks.preCommitHook();
    
    if (canCommit) {
      console.log('\n✅ Toutes les vérifications sont passées!');
      console.log('Le commit peut continuer.\n');
      process.exit(0);
    } else {
      console.log('\n❌ Le commit est bloqué.');
      console.log('Corrigez les erreurs ci-dessus avant de commiter.\n');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Erreur durant la validation:', error);
    process.exit(1);
  }
}

preCommit();
