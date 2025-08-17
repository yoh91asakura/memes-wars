#!/usr/bin/env node

/**
 * Initialize Critical Tasks for The Meme Wars TCG
 * Creates all critical tasks based on the audit recommendations
 */

import { 
  AdvancedTaskManager,
  TaskPriority,
  TaskSize,
  TaskStatus,
  UserStory,
  TaskContext
} from './advanced-task-system.js';

const manager = new AdvancedTaskManager(process.cwd());

// Create Epics first
const epics = [
  {
    id: 'refactoring-core',
    title: '🔧 Core Refactoring',
    description: 'Unify and optimize the core data models and architecture'
  },
  {
    id: 'combat-system',
    title: '⚔️ Combat System Implementation',
    description: 'Implement the bullet-hell combat system with emoji projectiles'
  },
  {
    id: 'ui-completion',
    title: '🎨 UI/UX Completion',
    description: 'Complete all missing UI components for MVP'
  },
  {
    id: 'testing-quality',
    title: '🧪 Testing & Quality',
    description: 'Implement comprehensive testing and quality assurance'
  },
  {
    id: 'performance-optimization',
    title: '⚡ Performance Optimization',
    description: 'Optimize performance across the application'
  }
];

// Define all critical tasks
const tasks = [
  // ============================================
  // CRITICAL: Data Model Unification
  // ============================================
  {
    title: 'Unify Card Data Models',
    userStory: {
      persona: 'developer',
      want: 'a single, consistent card model',
      reason: 'I can maintain and extend the code without confusion'
    } as UserStory,
    acceptanceCriteria: [
      'Single Card interface defined in src/models/unified/Card.ts',
      'All card properties consolidated from both existing models',
      'TypeScript strict mode passing with no errors',
      'All existing code migrated to use new model',
      'No duplicate card type definitions remain',
      'Card model supports both simple and complex card types',
      'Backward compatibility maintained for existing data'
    ],
    context: {
      files: [
        'src/models/Card.ts',
        'src/types/card.ts',
        'src/services/RollService.ts',
        'src/services/CardService.ts',
        'src/stores/gameStore.ts',
        'src/stores/rollStore.ts'
      ],
      components: ['CardDisplay', 'CardReveal', 'RollScreen'],
      services: ['RollService', 'CardService'],
      apis: [],
      userImpact: 'No visible changes, but more stable application',
      businessValue: 'Reduced bugs and faster feature development',
      risks: ['Breaking existing card data', 'Type conflicts during migration'],
      testScenarios: [
        'All existing cards load correctly',
        'New cards can be created with all properties',
        'Roll system works with unified model',
        'Collection management works correctly'
      ],
      suggestedApproach: 'Create new unified model first, then migrate incrementally with adapter pattern',
      documentation: ['Document all card properties and their purposes']
    } as TaskContext,
    priority: TaskPriority.CRITICAL,
    size: TaskSize.L,
    tags: ['refactoring', 'architecture', 'technical-debt'],
    epic: 'refactoring-core'
  },

  // ============================================
  // CRITICAL: Store Architecture Consolidation
  // ============================================
  {
    title: 'Consolidate Store Architecture',
    userStory: {
      persona: 'developer',
      want: 'a clear, modular store architecture',
      reason: 'state management is predictable and maintainable'
    } as UserStory,
    acceptanceCriteria: [
      'Central gameStore with modular slices',
      'No duplicate state management logic',
      'Clear separation of concerns between stores',
      'All components using centralized stores',
      'Store actions are typed and documented',
      'Middleware for persistence implemented',
      'DevTools integration working'
    ],
    context: {
      files: [
        'src/stores/gameStore.ts',
        'src/stores/rollStore.ts',
        'src/stores/index.ts'
      ],
      components: ['All components using stores'],
      services: [],
      apis: [],
      userImpact: 'Faster UI updates and more consistent state',
      businessValue: 'Easier to add new features and fix bugs',
      risks: ['State migration issues', 'Component breaking changes'],
      testScenarios: [
        'State persists across page refreshes',
        'All UI components update correctly',
        'No race conditions in state updates',
        'Undo/redo functionality possible'
      ],
      suggestedApproach: 'Use Zustand slices pattern with immer for immutability'
    } as TaskContext,
    priority: TaskPriority.CRITICAL,
    size: TaskSize.M,
    tags: ['architecture', 'state-management', 'refactoring'],
    epic: 'refactoring-core',
    dependencies: ['Unify Card Data Models']
  },

  // ============================================
  // HIGH: Combat Arena Implementation
  // ============================================
  {
    title: 'Implement Combat Arena Component',
    userStory: {
      persona: 'player',
      want: 'to see my cards battle in an arena',
      reason: 'I can enjoy strategic combat gameplay'
    } as UserStory,
    acceptanceCriteria: [
      'Combat arena renders at 60 FPS',
      'Player and opponent zones clearly defined',
      'Card placement system working',
      'Visual feedback for actions',
      'Responsive design for different screen sizes',
      'Smooth animations for card movements',
      'Arena boundaries properly defined'
    ],
    context: {
      files: [
        'src/components/combat/CombatArena.tsx',
        'src/components/combat/PlayerZone.tsx',
        'src/components/combat/OpponentZone.tsx'
      ],
      components: ['CombatScreen', 'CombatArena'],
      services: ['CombatService'],
      apis: [],
      userImpact: 'Core gameplay feature becomes available',
      businessValue: 'Main game loop completed, ready for players',
      risks: ['Performance issues with many cards', 'Browser compatibility'],
      testScenarios: [
        'Arena renders on all screen sizes',
        'Can place cards in valid zones',
        'Cannot place cards in invalid zones',
        'Visual feedback is clear and immediate'
      ],
      suggestedApproach: 'Use Canvas or WebGL for performance, React for UI overlay'
    } as TaskContext,
    priority: TaskPriority.HIGH,
    size: TaskSize.XL,
    tags: ['feature', 'combat', 'ui', 'gameplay'],
    epic: 'combat-system'
  },

  // ============================================
  // HIGH: Emoji Projectile System
  // ============================================
  {
    title: 'Create Emoji Projectile System',
    userStory: {
      persona: 'player',
      want: 'to see emoji projectiles flying in combat',
      reason: 'combat is visually exciting and unique'
    } as UserStory,
    acceptanceCriteria: [
      'Projectiles spawn from cards correctly',
      'Trajectory patterns implemented (straight, wave, spiral, homing)',
      'Projectile speed and damage calculated correctly',
      'Visual effects for projectile trails',
      'Projectiles despawn at boundaries',
      'Memory management for many projectiles',
      'Smooth animation at 60 FPS with 100+ projectiles'
    ],
    context: {
      files: [
        'src/systems/ProjectileSystem.ts',
        'src/models/Projectile.ts',
        'src/components/combat/ProjectileRenderer.tsx'
      ],
      components: ['ProjectileRenderer', 'CombatArena'],
      services: ['ProjectileService', 'PhysicsEngine'],
      apis: [],
      userImpact: 'Unique and engaging combat visuals',
      businessValue: 'Differentiates game from competitors',
      risks: ['Performance degradation', 'Memory leaks'],
      testScenarios: [
        'Spawn 100 projectiles without lag',
        'All trajectory patterns work correctly',
        'Projectiles interact with boundaries',
        'Memory is properly cleaned up'
      ],
      suggestedApproach: 'Object pooling for projectiles, WebGL for rendering'
    } as TaskContext,
    priority: TaskPriority.HIGH,
    size: TaskSize.L,
    tags: ['feature', 'combat', 'graphics', 'performance'],
    epic: 'combat-system',
    dependencies: ['Implement Combat Arena Component']
  },

  // ============================================
  // HIGH: Collision Detection System
  // ============================================
  {
    title: 'Implement Collision Detection',
    userStory: {
      persona: 'player',
      want: 'projectiles to hit targets and deal damage',
      reason: 'combat has meaningful consequences'
    } as UserStory,
    acceptanceCriteria: [
      'Accurate AABB collision detection',
      'Pixel-perfect collision for special cases',
      'Spatial partitioning for performance',
      'Collision events properly fired',
      'No false positives or negatives',
      'Performance remains stable with many objects',
      'Collision shapes properly defined for all entities'
    ],
    context: {
      files: [
        'src/systems/CollisionSystem.ts',
        'src/systems/PhysicsEngine.ts',
        'src/utils/collision.ts'
      ],
      components: ['CombatArena'],
      services: ['CollisionService', 'PhysicsEngine'],
      apis: [],
      userImpact: 'Combat mechanics work correctly',
      businessValue: 'Core gameplay loop functional',
      risks: ['Performance issues', 'Inaccurate collisions'],
      testScenarios: [
        'Projectiles hit targets accurately',
        'No tunneling at high speeds',
        'Performance with 200+ collision checks/frame',
        'Edge cases handled properly'
      ],
      suggestedApproach: 'Quadtree for spatial partitioning, AABB for broad phase'
    } as TaskContext,
    priority: TaskPriority.HIGH,
    size: TaskSize.L,
    tags: ['feature', 'combat', 'physics', 'performance'],
    epic: 'combat-system',
    dependencies: ['Create Emoji Projectile System']
  },

  // ============================================
  // HIGH: HP/Damage System
  // ============================================
  {
    title: 'Implement HP and Damage System',
    userStory: {
      persona: 'player',
      want: 'to see health bars and damage numbers',
      reason: 'I can track combat progress and make strategic decisions'
    } as UserStory,
    acceptanceCriteria: [
      'HP bars display for all entities',
      'Damage calculations work correctly',
      'Damage numbers appear on hit',
      'Critical hits and effects implemented',
      'Healing mechanics work',
      'Death/defeat conditions trigger correctly',
      'HP persistence between rounds'
    ],
    context: {
      files: [
        'src/systems/DamageSystem.ts',
        'src/components/combat/HealthBar.tsx',
        'src/components/combat/DamageNumber.tsx'
      ],
      components: ['HealthBar', 'DamageNumber', 'CombatHUD'],
      services: ['DamageCalculator', 'CombatService'],
      apis: [],
      userImpact: 'Clear feedback on combat progress',
      businessValue: 'Complete combat loop enables monetization',
      risks: ['Balance issues', 'Unclear feedback'],
      testScenarios: [
        'Damage reduces HP correctly',
        'Healing increases HP correctly',
        'HP cannot go below 0 or above max',
        'Visual feedback is clear and timely'
      ]
    } as TaskContext,
    priority: TaskPriority.HIGH,
    size: TaskSize.M,
    tags: ['feature', 'combat', 'ui', 'gameplay'],
    epic: 'combat-system',
    dependencies: ['Implement Collision Detection']
  },

  // ============================================
  // MEDIUM: Main Menu Implementation
  // ============================================
  {
    title: 'Create Main Menu Interface',
    userStory: {
      persona: 'player',
      want: 'a welcoming main menu',
      reason: 'I can easily navigate to different game modes'
    } as UserStory,
    acceptanceCriteria: [
      'Main menu displays on app load',
      'All navigation options visible',
      'Animations smooth and appealing',
      'Settings accessible',
      'Profile information displayed',
      'News/updates section visible',
      'Responsive on all devices'
    ],
    context: {
      files: [
        'src/components/menu/MainMenu.tsx',
        'src/components/menu/MenuButton.tsx',
        'src/router/AppRouter.tsx'
      ],
      components: ['MainMenu', 'MenuButton', 'Navigation'],
      services: ['NavigationService'],
      apis: [],
      userImpact: 'First impression of the game',
      businessValue: 'Professional appearance increases retention',
      risks: ['Poor first impression', 'Navigation confusion'],
      testScenarios: [
        'All buttons navigate correctly',
        'Back button works from all screens',
        'Menu loads quickly',
        'Animations do not cause lag'
      ]
    } as TaskContext,
    priority: TaskPriority.MEDIUM,
    size: TaskSize.M,
    tags: ['ui', 'navigation', 'feature'],
    epic: 'ui-completion'
  },

  // ============================================
  // MEDIUM: Collection View
  // ============================================
  {
    title: 'Implement Card Collection View',
    userStory: {
      persona: 'player',
      want: 'to view and manage my card collection',
      reason: 'I can see my progress and plan strategies'
    } as UserStory,
    acceptanceCriteria: [
      'Grid view of all owned cards',
      'Filter by rarity, type, cost',
      'Sort by various attributes',
      'Search functionality',
      'Card details on click/hover',
      'Collection statistics displayed',
      'Smooth scrolling with many cards'
    ],
    context: {
      files: [
        'src/components/collection/CollectionView.tsx',
        'src/components/collection/CardGrid.tsx',
        'src/components/collection/FilterPanel.tsx'
      ],
      components: ['CollectionView', 'CardGrid', 'FilterPanel'],
      services: ['CollectionService'],
      apis: [],
      userImpact: 'Can manage and appreciate collection',
      businessValue: 'Increases engagement and retention',
      risks: ['Performance with large collections', 'Complex filtering logic'],
      testScenarios: [
        'Display 1000+ cards without lag',
        'Filters work correctly',
        'Search is responsive',
        'Card details load quickly'
      ],
      suggestedApproach: 'Virtual scrolling for performance, memo for card components'
    } as TaskContext,
    priority: TaskPriority.MEDIUM,
    size: TaskSize.L,
    tags: ['ui', 'feature', 'collection'],
    epic: 'ui-completion'
  },

  // ============================================
  // MEDIUM: Deck Builder
  // ============================================
  {
    title: 'Create Basic Deck Builder',
    userStory: {
      persona: 'player',
      want: 'to build and customize my decks',
      reason: 'I can create unique strategies'
    } as UserStory,
    acceptanceCriteria: [
      'Drag and drop cards into deck',
      'Deck validation rules enforced',
      'Save/load deck functionality',
      'Deck statistics displayed',
      'Mana curve visualization',
      'Export/import deck codes',
      'Multiple deck slots'
    ],
    context: {
      files: [
        'src/components/deckbuilder/DeckBuilder.tsx',
        'src/components/deckbuilder/DeckSlot.tsx',
        'src/services/DeckService.ts'
      ],
      components: ['DeckBuilder', 'DeckSlot', 'ManaCurve'],
      services: ['DeckService', 'ValidationService'],
      apis: [],
      userImpact: 'Core gameplay feature for strategy',
      businessValue: 'Increases depth and replayability',
      risks: ['Complex validation rules', 'Save/load reliability'],
      testScenarios: [
        'Can build valid decks',
        'Invalid decks are rejected',
        'Decks save and load correctly',
        'Drag and drop works smoothly'
      ]
    } as TaskContext,
    priority: TaskPriority.MEDIUM,
    size: TaskSize.XL,
    tags: ['ui', 'feature', 'deckbuilding'],
    epic: 'ui-completion',
    dependencies: ['Implement Card Collection View']
  },

  // ============================================
  // HIGH: Performance Optimization
  // ============================================
  {
    title: 'Optimize React Component Performance',
    userStory: {
      persona: 'player',
      want: 'smooth, responsive gameplay',
      reason: 'I can enjoy the game without frustration'
    } as UserStory,
    acceptanceCriteria: [
      'All components use React.memo where appropriate',
      'useMemo and useCallback properly implemented',
      'No unnecessary re-renders',
      'Bundle size reduced by 30%',
      'Initial load time under 3 seconds',
      'Time to interactive under 5 seconds',
      'Lighthouse score above 90'
    ],
    context: {
      files: [
        'src/components/screens/RollScreen.tsx',
        'src/components/combat/CombatScreen.tsx',
        'src/App.tsx'
      ],
      components: ['All major components'],
      services: [],
      apis: [],
      userImpact: 'Faster, smoother experience',
      businessValue: 'Better user retention and reviews',
      risks: ['Over-optimization causing bugs', 'Premature optimization'],
      testScenarios: [
        'Measure render counts',
        'Profile with React DevTools',
        'Test on low-end devices',
        'Monitor memory usage'
      ],
      suggestedApproach: 'Profile first, optimize bottlenecks, use React DevTools Profiler'
    } as TaskContext,
    priority: TaskPriority.HIGH,
    size: TaskSize.L,
    tags: ['performance', 'optimization', 'refactoring'],
    epic: 'performance-optimization'
  },

  // ============================================
  // MEDIUM: Unit Testing
  // ============================================
  {
    title: 'Write Unit Tests for Core Services',
    userStory: {
      persona: 'developer',
      want: 'comprehensive test coverage',
      reason: 'I can refactor with confidence'
    } as UserStory,
    acceptanceCriteria: [
      'RollService 100% coverage',
      'CardService 100% coverage',
      'Store actions tested',
      'Utility functions tested',
      'Edge cases covered',
      'Tests run in under 10 seconds',
      'CI/CD integration ready'
    ],
    context: {
      files: [
        'src/services/__tests__/RollService.test.ts',
        'src/services/__tests__/CardService.test.ts',
        'src/stores/__tests__/gameStore.test.ts'
      ],
      components: [],
      services: ['All services'],
      apis: [],
      userImpact: 'More stable, bug-free experience',
      businessValue: 'Reduced bugs in production',
      risks: ['Time investment', 'Test maintenance burden'],
      testScenarios: [
        'All happy paths',
        'Error conditions',
        'Edge cases',
        'Performance benchmarks'
      ]
    } as TaskContext,
    priority: TaskPriority.MEDIUM,
    size: TaskSize.L,
    tags: ['testing', 'quality', 'technical-debt'],
    epic: 'testing-quality'
  },

  // ============================================
  // MEDIUM: E2E Testing
  // ============================================
  {
    title: 'Create E2E Tests for Critical Flows',
    userStory: {
      persona: 'QA engineer',
      want: 'automated testing of user flows',
      reason: 'we catch bugs before users do'
    } as UserStory,
    acceptanceCriteria: [
      'Card rolling flow tested',
      'Collection management tested',
      'Combat flow tested',
      'Navigation tested',
      'Tests run in CI/CD',
      'Visual regression tests',
      'Cross-browser testing'
    ],
    context: {
      files: [
        'tests/e2e/roll.spec.ts',
        'tests/e2e/combat.spec.ts',
        'tests/e2e/collection.spec.ts'
      ],
      components: [],
      services: [],
      apis: [],
      userImpact: 'Fewer bugs in production',
      businessValue: 'Higher quality releases',
      risks: ['Flaky tests', 'Maintenance overhead'],
      testScenarios: [
        'Complete user journeys',
        'Error recovery',
        'Performance under load',
        'Mobile responsiveness'
      ]
    } as TaskContext,
    priority: TaskPriority.MEDIUM,
    size: TaskSize.L,
    tags: ['testing', 'e2e', 'quality'],
    epic: 'testing-quality',
    dependencies: ['Write Unit Tests for Core Services']
  },

  // ============================================
  // LOW: Documentation
  // ============================================
  {
    title: 'Create Technical Documentation',
    userStory: {
      persona: 'new developer',
      want: 'comprehensive documentation',
      reason: 'I can quickly understand and contribute to the project'
    } as UserStory,
    acceptanceCriteria: [
      'Architecture overview documented',
      'API documentation complete',
      'Component library documented',
      'Setup guide updated',
      'Deployment guide created',
      'Code style guide defined',
      'Contributing guidelines written'
    ],
    context: {
      files: [
        'docs/ARCHITECTURE.md',
        'docs/API.md',
        'docs/COMPONENTS.md',
        'docs/CONTRIBUTING.md'
      ],
      components: [],
      services: [],
      apis: [],
      userImpact: 'None directly',
      businessValue: 'Faster onboarding, better collaboration',
      risks: ['Documentation becoming outdated'],
      testScenarios: [
        'New developer can set up project',
        'Documentation is searchable',
        'Examples work correctly'
      ]
    } as TaskContext,
    priority: TaskPriority.LOW,
    size: TaskSize.M,
    tags: ['documentation', 'technical-debt'],
    epic: 'testing-quality'
  }
];

// Create all tasks
async function initializeTasks() {
  console.log('🚀 Initializing critical tasks for The Meme Wars TCG...\n');
  
  const createdTasks = [];
  
  for (const taskData of tasks) {
    try {
      const task = manager.createTask({
        title: taskData.title,
        userStory: taskData.userStory,
        acceptanceCriteria: taskData.acceptanceCriteria,
        context: taskData.context,
        priority: taskData.priority,
        size: taskData.size,
        tags: taskData.tags
      });
      
      createdTasks.push(task);
      
      // Set epic if provided
      if (taskData.epic) {
        task.epic = taskData.epic;
      }
      
      // Auto-assign if appropriate
      if (task.autoAssignable) {
        await manager.autoAssignTask(task.id);
      }
      
      console.log(`✅ Created: ${task.title} [${task.priority}] (${task.id})`);
    } catch (error) {
      console.error(`❌ Failed to create task: ${taskData.title}`, error);
    }
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`- Total tasks created: ${createdTasks.length}`);
  console.log(`- Critical tasks: ${createdTasks.filter(t => t.priority === TaskPriority.CRITICAL).length}`);
  console.log(`- High priority: ${createdTasks.filter(t => t.priority === TaskPriority.HIGH).length}`);
  console.log(`- Medium priority: ${createdTasks.filter(t => t.priority === TaskPriority.MEDIUM).length}`);
  console.log(`- Low priority: ${createdTasks.filter(t => t.priority === TaskPriority.LOW).length}`);
  
  // Display stats
  const stats = manager.getStatistics();
  console.log(`\n📈 Current Statistics:`);
  console.log(`- Total tasks in system: ${stats.total}`);
  console.log(`- Backlog: ${stats.byStatus[TaskStatus.BACKLOG]}`);
  console.log(`- TODO: ${stats.byStatus[TaskStatus.TODO]}`);
  console.log(`- In Progress: ${stats.byStatus[TaskStatus.IN_PROGRESS]}`);
  console.log(`- Done: ${stats.byStatus[TaskStatus.DONE]}`);
  
  console.log('\n✨ All tasks created successfully!');
  console.log('📋 Roadmap has been updated automatically');
  console.log('\nNext steps:');
  console.log('1. Run "npm run task:list" to see all tasks');
  console.log('2. Run "npm run task:view <task-id>" to see task details');
  console.log('3. Run "npm run task:monitor" to start auto-monitoring');
  
  return createdTasks;
}

// Run if executed directly
if (require.main === module) {
  initializeTasks()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Failed to initialize tasks:', error);
      process.exit(1);
    });
}

export { initializeTasks };
