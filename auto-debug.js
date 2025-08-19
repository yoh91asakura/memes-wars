import { chromium } from 'playwright';
import { spawn } from 'child_process';

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  console.log('🚀 Lancement du serveur de développement...');
  
  const devServer = spawn('npm', ['run', 'dev'], {
    shell: true,
    stdio: 'pipe'
  });
  
  let serverUrl = '';
  let serverReady = false;
  
  // Capture la sortie du serveur
  devServer.stdout.on('data', (data) => {
    const output = data.toString();
    if (output.includes('Local:')) {
      const match = output.match(/http:\/\/localhost:\d+/);
      if (match) {
        serverUrl = match[0];
        serverReady = true;
        console.log(`✅ Serveur prêt sur ${serverUrl}`);
      }
    }
  });
  
  // Attendre que le serveur soit prêt
  while (!serverReady) {
    await wait(500);
  }
  
  await wait(2000); // Attendre un peu plus pour être sûr
  
  console.log('🎭 Lancement de Playwright avec capture d\'erreurs...');
  
  const browser = await chromium.launch({ 
    headless: false,
    devtools: true
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Liste pour stocker toutes les erreurs
  const errors = [];
  
  // Capturer TOUTES les erreurs console
  page.on('console', msg => {
    if (msg.type() === 'error') {
      const errorText = msg.text();
      console.error('❌ Console Error:', errorText);
      errors.push({ type: 'console', message: errorText });
    } else if (msg.type() === 'warning') {
      console.warn('⚠️ Console Warning:', msg.text());
    }
  });
  
  // Capturer les erreurs de page
  page.on('pageerror', error => {
    console.error('❌ Page Error:', error.message);
    errors.push({ type: 'page', message: error.message, stack: error.stack });
  });
  
  // Injecter un listener d'erreurs global
  await page.addInitScript(() => {
    window.addEventListener('error', (e) => {
      console.error('Runtime error:', e.message, e.error);
    });
    
    window.addEventListener('unhandledrejection', (e) => {
      console.error('Unhandled promise rejection:', e.reason);
    });
  });
  
  console.log(`📱 Navigation vers ${serverUrl}...`);
  
  try {
    await page.goto(serverUrl, { waitUntil: 'networkidle' });
    console.log('✅ Page chargée');
    
    // Attendre que le bouton Roll soit visible
    console.log('🔍 Recherche du bouton Roll...');
    const rollButton = page.locator('button:has-text("Roll Card")').first();
    
    // Vérifier si le bouton existe
    const buttonCount = await rollButton.count();
    if (buttonCount === 0) {
      console.error('❌ Bouton Roll non trouvé!');
    } else {
      console.log('✅ Bouton Roll trouvé');
      
      // Capturer l'état avant le click
      const isDisabled = await rollButton.isDisabled();
      console.log(`📊 Bouton disabled: ${isDisabled}`);
      
      // Attendre que le bouton soit visible et clickable
      await rollButton.waitFor({ state: 'visible', timeout: 5000 });
      
      console.log('🎲 Click sur le bouton Roll...');
      await rollButton.click();
      console.log('✅ Click effectué');
      
      // Attendre pour capturer les erreurs potentielles
      await wait(3000);
      
      // Vérifier si une carte est apparue
      const cards = await page.locator('.tcg-card').count();
      console.log(`🃏 Nombre de cartes TCG affichées: ${cards}`);
      
      // Vérifier le placeholder de carte
      const cardBack = await page.locator('.roll-panel__card-back').count();
      console.log(`📦 Card back visible: ${cardBack > 0}`);
      
      // Essayer de récupérer plus d'infos sur les cartes
      if (cards > 0) {
        const firstCard = page.locator('.tcg-card').first();
        
        // Vérifier les propriétés de la carte
        const cardInfo = await firstCard.evaluate(el => {
          const computed = window.getComputedStyle(el);
          return {
            display: computed.display,
            visibility: computed.visibility,
            width: el.offsetWidth,
            height: el.offsetHeight,
            innerHTML: el.innerHTML.substring(0, 200) // Premier 200 chars du HTML
          };
        });
        
        console.log('📋 Info première carte:', cardInfo);
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la navigation:', error);
    errors.push({ type: 'navigation', message: error.message });
  }
  
  // Afficher le résumé des erreurs
  console.log('\n' + '='.repeat(50));
  console.log('📊 RÉSUMÉ DES ERREURS CAPTURÉES:');
  console.log('='.repeat(50));
  
  if (errors.length === 0) {
    console.log('✅ Aucune erreur détectée!');
  } else {
    console.log(`❌ Total: ${errors.length} erreur(s)`);
    errors.forEach((err, i) => {
      console.log(`\n${i + 1}. Type: ${err.type}`);
      console.log(`   Message: ${err.message}`);
      if (err.stack) {
        console.log(`   Stack: ${err.stack.substring(0, 300)}...`);
      }
    });
  }
  
  console.log('\n🔍 Navigateur ouvert pour inspection manuelle');
  console.log('💡 Ouvrez la console du navigateur (F12) pour plus de détails');
  console.log('⌨️ Appuyez sur Ctrl+C pour fermer');
  
  // Garder ouvert pour inspection
  await wait(300000);
  
  await browser.close();
  devServer.kill();
  process.exit(0);
})();
