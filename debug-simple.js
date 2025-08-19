import { chromium } from 'playwright';

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  console.log('🎭 Lancement de Playwright pour debug...');
  console.log('⚠️  Assurez-vous que le serveur est lancé sur localhost:3000, 3001 ou 3002');
  
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
  
  // Essayer plusieurs ports
  const ports = [3002, 3001, 3000, 5173];
  let connected = false;
  let url = '';
  
  for (const port of ports) {
    try {
      url = `http://localhost:${port}`;
      console.log(`📱 Tentative de connexion à ${url}...`);
      await page.goto(url, { waitUntil: 'networkidle', timeout: 5000 });
      console.log(`✅ Connecté à ${url}`);
      connected = true;
      break;
    } catch (e) {
      console.log(`❌ Échec sur le port ${port}`);
    }
  }
  
  if (!connected) {
    console.error('❌ Impossible de se connecter au serveur. Lancez d\'abord: npm run dev');
    await browser.close();
    process.exit(1);
  }
  
  console.log('✅ Page chargée');
  
  try {
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
      
      // Vérifier si l'application a crashé
      const appCrashed = await page.locator('text="Something went wrong"').count() > 0;
      if (appCrashed) {
        console.error('💥 L\'APPLICATION A CRASHÉ!');
        
        // Essayer de récupérer l'erreur depuis React
        const errorMessage = await page.locator('.error-boundary-message').textContent().catch(() => null);
        if (errorMessage) {
          console.error('Message d\'erreur:', errorMessage);
        }
      }
      
      // Vérifier les éléments de carte spécifiques
      const cardElements = {
        frame: await page.locator('.cardFrame').count(),
        header: await page.locator('[class*="CardHeader"]').count(),
        image: await page.locator('[class*="CardImage"]').count(),
        footer: await page.locator('[class*="CardFooter"]').count()
      };
      
      console.log('📋 Éléments de carte trouvés:', cardElements);
      
      // Si des cartes sont présentes, vérifier leur contenu
      if (cards > 0) {
        const firstCard = page.locator('.tcg-card').first();
        
        // Essayer de récupérer les données de la carte
        const cardData = await firstCard.evaluate(el => {
          const getTextContent = (selector) => {
            const elem = el.querySelector(selector);
            return elem ? elem.textContent : null;
          };
          
          return {
            name: getTextContent('[class*="cardName"]'),
            stats: getTextContent('[class*="statValue"]'),
            hasEmoji: el.querySelector('[class*="mainEmoji"]') !== null,
            classes: el.className,
            errorInCard: el.querySelector('.error') !== null
          };
        });
        
        console.log('🃏 Données de la première carte:', cardData);
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
    errors.push({ type: 'test', message: error.message });
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
        console.log(`   Stack: ${err.stack.substring(0, 500)}...`);
      }
    });
  }
  
  console.log('\n🔍 Navigateur ouvert pour inspection manuelle');
  console.log('💡 Ouvrez la console du navigateur (F12) pour voir les détails');
  console.log('⌨️ Appuyez sur Ctrl+C pour fermer');
  
  // Garder ouvert pendant 5 minutes
  await wait(300000);
  
  await browser.close();
  process.exit(0);
})();
