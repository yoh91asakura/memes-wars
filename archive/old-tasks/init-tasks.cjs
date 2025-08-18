#!/usr/bin/env node

/**
 * Initialize Critical Tasks for The Meme Wars TCG
 * Simplified JavaScript version
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Task constants
const TaskStatus = {
  BACKLOG: 'backlog',
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  IN_REVIEW: 'in_review',
  TESTING: 'testing',
  DONE: 'done',
  BLOCKED: 'blocked',
  CANCELLED: 'cancelled'
};

const TaskPriority = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
  NICE_TO_HAVE: 'nice_to_have'
};

const TaskSize = {
  XS: 'XS',    // < 2 hours
  S: 'S',      // 2-4 hours
  M: 'M',      // 4-8 hours (1 day)
  L: 'L',      // 2-3 days
  XL: 'XL',    // 3-5 days
  XXL: 'XXL'   // > 5 days (needs breakdown)
};

// Simple task manager
class SimpleTaskManager {
  constructor(projectRoot) {
    this.tasksDir = path.join(projectRoot, 'tasks');
    this.tasksFile = path.join(this.tasksDir, 'tasks.json');
    this.roadmapFile = path.join(projectRoot, 'roadmap.md');
    this.tasks = new Map();
    
    this.ensureTasksDirectory();
    this.loadTasks();
  }
  
  ensureTasksDirectory() {
    if (!fs.existsSync(this.tasksDir)) {
      fs.mkdirSync(this.tasksDir, { recursive: true });
    }
  }
  
  loadTasks() {
    if (fs.existsSync(this.tasksFile)) {
      try {
        const data = JSON.parse(fs.readFileSync(this.tasksFile, 'utf8'));
        data.tasks?.forEach((task) => {
          this.tasks.set(task.id, task);
        });
      } catch (error) {
        console.error('Error loading tasks:', error);
      }
    }
  }
  
  saveTasks() {
    const data = {
      tasks: Array.from(this.tasks.values()),
      metadata: {
        lastUpdated: new Date().toISOString(),
        version: '2.0.0'
      }
    };
    
    fs.writeFileSync(this.tasksFile, JSON.stringify(data, null, 2));
    
    // Also save individual task files
    this.tasks.forEach(task => {
      const taskFile = path.join(this.tasksDir, `task-${task.id}.json`);
      fs.writeFileSync(taskFile, JSON.stringify(task, null, 2));
    });
  }
  
  createTask(input) {
    const id = crypto.randomBytes(8).toString('hex');
    
    const task = {
      id,
      title: input.title,
      description: input.description || '',
      userStory: input.userStory,
      status: TaskStatus.BACKLOG,
      priority: input.priority || TaskPriority.MEDIUM,
      size: input.size || TaskSize.M,
      dependencies: input.dependencies || [],
      acceptanceCriteria: input.acceptanceCriteria.map((ac, index) => ({
        id: `${id}-ac-${index}`,
        description: ac,
        completed: false
      })),
      definitionOfDone: [
        'Code implemented and tested',
        'Tests written and passing',
        'Documentation updated',
        'Code reviewed',
        'No console errors',
        'Performance acceptable'
      ],
      context: input.context || {},
      tags: input.tags || [],
      labels: [],
      epic: input.epic,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      autoCreated: false,
      autoAssignable: true,
      comments: [],
      activity: [{
        id: `${id}-activity-1`,
        type: 'status_change',
        actor: 'system',
        details: 'Task created',
        timestamp: new Date().toISOString()
      }]
    };
    
    this.tasks.set(id, task);
    this.saveTasks();
    this.updateRoadmap();
    
    return task;
  }
  
  updateRoadmap() {
    const roadmap = this.generateRoadmap();
    fs.writeFileSync(this.roadmapFile, roadmap);
  }
  
  generateRoadmap() {
    let md = `# 🗺️ ROADMAP - The Meme Wars TCG\n\n`;
    md += `*Last Updated: ${new Date().toISOString()}*\n\n`;
    
    // Add statistics
    const stats = this.getStatistics();
    md += `## 📊 Current Status\n\n`;
    md += `- **Total Tasks:** ${stats.total}\n`;
    md += `- **In Progress:** ${stats.byStatus[TaskStatus.IN_PROGRESS] || 0}\n`;
    md += `- **Completed:** ${stats.byStatus[TaskStatus.DONE] || 0}\n`;
    md += `- **Blocked:** ${stats.byStatus[TaskStatus.BLOCKED] || 0}\n\n`;
    
    // Group tasks by priority
    md += `## 🎯 Priority Tasks\n\n`;
    
    // Critical tasks
    const criticalTasks = Array.from(this.tasks.values())
      .filter(t => t.priority === TaskPriority.CRITICAL && t.status !== TaskStatus.DONE);
    
    if (criticalTasks.length > 0) {
      md += `### 🔴 CRITICAL\n\n`;
      criticalTasks.forEach(task => {
        md += `- **${task.title}** (${task.size})\n`;
        if (task.userStory) {
          md += `  - As a ${task.userStory.persona}, I want ${task.userStory.want} so that ${task.userStory.reason}\n`;
        }
      });
      md += '\n';
    }
    
    // High priority tasks
    const highTasks = Array.from(this.tasks.values())
      .filter(t => t.priority === TaskPriority.HIGH && t.status !== TaskStatus.DONE);
    
    if (highTasks.length > 0) {
      md += `### 🟠 HIGH\n\n`;
      highTasks.forEach(task => {
        md += `- **${task.title}** (${task.size})\n`;
      });
      md += '\n';
    }
    
    // Medium priority tasks
    const mediumTasks = Array.from(this.tasks.values())
      .filter(t => t.priority === TaskPriority.MEDIUM && t.status !== TaskStatus.DONE);
    
    if (mediumTasks.length > 0) {
      md += `### 🟡 MEDIUM\n\n`;
      mediumTasks.forEach(task => {
        md += `- ${task.title} (${task.size})\n`;
      });
      md += '\n';
    }
    
    // Add epic sections
    const epics = {
      'refactoring-core': '🔧 Core Refactoring',
      'combat-system': '⚔️ Combat System',
      'ui-completion': '🎨 UI/UX Completion',
      'testing-quality': '🧪 Testing & Quality',
      'performance-optimization': '⚡ Performance'
    };
    
    md += `## 📦 Development Epics\n\n`;
    
    Object.entries(epics).forEach(([epicId, epicTitle]) => {
      const epicTasks = Array.from(this.tasks.values())
        .filter(t => t.epic === epicId);
      
      if (epicTasks.length > 0) {
        const completed = epicTasks.filter(t => t.status === TaskStatus.DONE).length;
        const total = epicTasks.length;
        const progress = Math.round((completed / total) * 100);
        
        md += `### ${epicTitle} (${progress}% complete)\n\n`;
        epicTasks.forEach(task => {
          const status = task.status === TaskStatus.DONE ? '✅' : '⬜';
          md += `- ${status} ${task.title}\n`;
        });
        md += '\n';
      }
    });
    
    // Add task breakdown
    md += `## 📈 Task Breakdown\n\n`;
    md += `| Priority | Count | Size Estimate |\n`;
    md += `|----------|-------|---------------|\n`;
    
    const priorities = [TaskPriority.CRITICAL, TaskPriority.HIGH, TaskPriority.MEDIUM, TaskPriority.LOW];
    priorities.forEach(priority => {
      const tasks = Array.from(this.tasks.values())
        .filter(t => t.priority === priority && t.status !== TaskStatus.DONE);
      
      const sizeEstimate = tasks.reduce((sum, task) => {
        const sizeHours = {
          'XS': 2,
          'S': 4,
          'M': 8,
          'L': 20,
          'XL': 32,
          'XXL': 40
        };
        return sum + (sizeHours[task.size] || 8);
      }, 0);
      
      md += `| ${priority.toUpperCase()} | ${tasks.length} | ~${sizeEstimate} hours |\n`;
    });
    
    md += '\n';
    
    return md;
  }
  
  getStatistics() {
    const stats = {
      total: this.tasks.size,
      byStatus: {},
      byPriority: {},
      bySize: {}
    };
    
    // Initialize counters
    Object.values(TaskStatus).forEach(status => {
      stats.byStatus[status] = 0;
    });
    Object.values(TaskPriority).forEach(priority => {
      stats.byPriority[priority] = 0;
    });
    Object.values(TaskSize).forEach(size => {
      stats.bySize[size] = 0;
    });
    
    // Count tasks
    this.tasks.forEach(task => {
      stats.byStatus[task.status]++;
      stats.byPriority[task.priority]++;
      stats.bySize[task.size]++;
    });
    
    return stats;
  }
}

// Define all critical tasks
const tasks = [
  // CRITICAL: Data Model Unification
  {
    title: 'Unify Card Data Models',
    description: 'Consolidate the two parallel card systems (Card.ts and card.ts) into a single, unified model',
    userStory: {
      persona: 'developer',
      want: 'a single, consistent card model',
      reason: 'I can maintain and extend the code without confusion'
    },
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
      userImpact: 'No visible changes, but more stable application',
      businessValue: 'Reduced bugs and faster feature development',
      risks: ['Breaking existing card data', 'Type conflicts during migration'],
      testScenarios: [
        'All existing cards load correctly',
        'New cards can be created with all properties',
        'Roll system works with unified model',
        'Collection management works correctly'
      ],
      suggestedApproach: 'Create new unified model first, then migrate incrementally with adapter pattern'
    },
    priority: TaskPriority.CRITICAL,
    size: TaskSize.L,
    tags: ['refactoring', 'architecture', 'technical-debt'],
    epic: 'refactoring-core'
  },
  
  // CRITICAL: Store Architecture Consolidation
  {
    title: 'Consolidate Store Architecture',
    description: 'Unify gameStore and rollStore to eliminate duplicate state management',
    userStory: {
      persona: 'developer',
      want: 'a clear, modular store architecture',
      reason: 'state management is predictable and maintainable'
    },
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
    },
    priority: TaskPriority.CRITICAL,
    size: TaskSize.M,
    tags: ['architecture', 'state-management', 'refactoring'],
    epic: 'refactoring-core',
    dependencies: ['Unify Card Data Models']
  },
  
  // HIGH: Combat Arena Implementation
  {
    title: 'Implement Combat Arena Component',
    description: 'Create the main combat arena where cards battle using emoji projectiles',
    userStory: {
      persona: 'player',
      want: 'to see my cards battle in an arena',
      reason: 'I can enjoy strategic combat gameplay'
    },
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
    },
    priority: TaskPriority.HIGH,
    size: TaskSize.XL,
    tags: ['feature', 'combat', 'ui', 'gameplay'],
    epic: 'combat-system'
  },
  
  // HIGH: Emoji Projectile System
  {
    title: 'Create Emoji Projectile System',
    description: 'Implement the emoji projectile mechanics with various trajectory patterns',
    userStory: {
      persona: 'player',
      want: 'to see emoji projectiles flying in combat',
      reason: 'combat is visually exciting and unique'
    },
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
    },
    priority: TaskPriority.HIGH,
    size: TaskSize.L,
    tags: ['feature', 'combat', 'graphics', 'performance'],
    epic: 'combat-system'
  },
  
  // HIGH: Collision Detection System
  {
    title: 'Implement Collision Detection',
    description: 'Create accurate and performant collision detection for projectiles',
    userStory: {
      persona: 'player',
      want: 'projectiles to hit targets and deal damage',
      reason: 'combat has meaningful consequences'
    },
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
    },
    priority: TaskPriority.HIGH,
    size: TaskSize.L,
    tags: ['feature', 'combat', 'physics', 'performance'],
    epic: 'combat-system'
  },
  
  // Additional tasks...
  {
    title: 'Implement HP and Damage System',
    priority: TaskPriority.HIGH,
    size: TaskSize.M,
    tags: ['feature', 'combat', 'ui', 'gameplay'],
    epic: 'combat-system',
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
      files: ['src/systems/DamageSystem.ts'],
      components: ['HealthBar', 'DamageNumber', 'CombatHUD'],
      services: ['DamageCalculator', 'CombatService']
    }
  },
  
  {
    title: 'Create Main Menu Interface',
    priority: TaskPriority.MEDIUM,
    size: TaskSize.M,
    tags: ['ui', 'navigation', 'feature'],
    epic: 'ui-completion',
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
      files: ['src/components/menu/MainMenu.tsx'],
      components: ['MainMenu', 'MenuButton', 'Navigation'],
      services: ['NavigationService']
    }
  },
  
  {
    title: 'Implement Card Collection View',
    priority: TaskPriority.MEDIUM,
    size: TaskSize.L,
    tags: ['ui', 'feature', 'collection'],
    epic: 'ui-completion',
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
      files: ['src/components/collection/CollectionView.tsx'],
      components: ['CollectionView', 'CardGrid', 'FilterPanel'],
      services: ['CollectionService']
    }
  },
  
  {
    title: 'Create Basic Deck Builder',
    priority: TaskPriority.MEDIUM,
    size: TaskSize.XL,
    tags: ['ui', 'feature', 'deckbuilding'],
    epic: 'ui-completion',
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
      files: ['src/components/deckbuilder/DeckBuilder.tsx'],
      components: ['DeckBuilder', 'DeckSlot', 'ManaCurve'],
      services: ['DeckService', 'ValidationService']
    }
  },
  
  {
    title: 'Optimize React Component Performance',
    priority: TaskPriority.HIGH,
    size: TaskSize.L,
    tags: ['performance', 'optimization', 'refactoring'],
    epic: 'performance-optimization',
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
      files: ['src/components/screens/RollScreen.tsx'],
      components: ['All major components'],
      services: []
    }
  },
  
  {
    title: 'Write Unit Tests for Core Services',
    priority: TaskPriority.MEDIUM,
    size: TaskSize.L,
    tags: ['testing', 'quality', 'technical-debt'],
    epic: 'testing-quality',
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
      files: ['src/services/__tests__/'],
      components: [],
      services: ['All services']
    }
  },
  
  {
    title: 'Create E2E Tests for Critical Flows',
    priority: TaskPriority.MEDIUM,
    size: TaskSize.L,
    tags: ['testing', 'e2e', 'quality'],
    epic: 'testing-quality',
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
      files: ['tests/e2e/'],
      components: [],
      services: []
    }
  },
  
  {
    title: 'Create Technical Documentation',
    priority: TaskPriority.LOW,
    size: TaskSize.M,
    tags: ['documentation', 'technical-debt'],
    epic: 'testing-quality',
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
      files: ['docs/'],
      components: [],
      services: []
    }
  }
];

// Initialize tasks
async function initializeTasks() {
  console.log('🚀 Initializing critical tasks for The Meme Wars TCG...\n');
  
  const manager = new SimpleTaskManager(process.cwd());
  const createdTasks = [];
  
  for (const taskData of tasks) {
    try {
      const task = manager.createTask(taskData);
      createdTasks.push(task);
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
  
  const stats = manager.getStatistics();
  console.log(`\n📈 Current Statistics:`);
  console.log(`- Total tasks in system: ${stats.total}`);
  console.log(`- Backlog: ${stats.byStatus[TaskStatus.BACKLOG]}`);
  console.log(`- TODO: ${stats.byStatus[TaskStatus.TODO]}`);
  console.log(`- In Progress: ${stats.byStatus[TaskStatus.IN_PROGRESS]}`);
  console.log(`- Done: ${stats.byStatus[TaskStatus.DONE]}`);
  
  console.log('\n✨ All tasks created successfully!');
  console.log('📋 Roadmap has been updated automatically at roadmap.md');
  console.log('\nNext steps:');
  console.log('1. View the updated roadmap.md file');
  console.log('2. Check tasks/ directory for individual task files');
  console.log('3. Start working on CRITICAL priority tasks first');
  
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

module.exports = { initializeTasks };
