#!/usr/bin/env node
/**
 * Script pour lancer le serveur de développement avec les hooks
 */

import { hooks } from './emoji-mayhem-hooks';
import { spawn } from 'child_process';

async function runDev() {
  console.log('🚀 Préparation du serveur de développement...');
  
  try {
    // Exécuter le hook beforeDevServer
    await hooks.beforeDevServer();
    
    console.log('✅ Environnement prêt, lancement de Vite...\n');
    
    // Lancer Vite
    const vite = spawn('npx', ['vite'], {
      stdio: 'inherit',
      shell: true
    });
    
    vite.on('error', (err) => {
      console.error('❌ Erreur lors du lancement de Vite:', err);
      process.exit(1);
    });
    
    vite.on('exit', (code) => {
      process.exit(code || 0);
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de la préparation:', error);
    process.exit(1);
  }
}

runDev();
