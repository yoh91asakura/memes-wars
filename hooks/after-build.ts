#!/usr/bin/env node
/**
 * Hook après build pour optimiser et vérifier
 */

import { hooks } from './emoji-mayhem-hooks';

async function afterBuild() {
  console.log('📦 Post-traitement du build...\n');
  
  try {
    await hooks.afterBuild();
    console.log('\n✅ Build optimisé et validé!');
  } catch (error) {
    console.error('\n⚠️ Avertissement lors du post-traitement:', error);
    // Ne pas faire échouer le build pour des warnings
    process.exit(0);
  }
}

afterBuild();
