#!/usr/bin/env node

import fs from 'fs';
import crypto from 'crypto';

// Read current tasks
const tasksPath = './tasks/tasks.json';
const tasksData = JSON.parse(fs.readFileSync(tasksPath, 'utf8'));

// Generate unique ID
function generateId() {
  return crypto.randomBytes(8).toString('hex');
}

// Create timestamp
const now = new Date().toISOString();

// New tasks to add
const newTasks = [
  {
    id: generateId(),
    title: "Migrate Card Data Files to Unified Model",
    description: "Migrate all card data files (common, uncommon, rare, epic, legendary, mythic, cosmic) to use the unified card model",
    userStory: {
      persona: "developer",
      want: "all card data to use the unified model",
      reason: "data consistency and easier maintenance"
    },
    status: "todo",
    priority: "critical",
    size: "L",
    dependencies: ["Unify Card Data Models"],
    acceptanceCriteria: [
      {
        id: generateId() + "-ac-0",
        description: "All common.ts cards converted to unified format",
        completed: false
      },
      {
        id: generateId() + "-ac-1", 
        description: "All uncommon.ts cards converted to unified format",
        completed: false
      },
      {
        id: generateId() + "-ac-2",
        description: "All rare.ts cards converted to unified format", 
        completed: false
      },
      {
        id: generateId() + "-ac-3",
        description: "All epic.ts cards converted to unified format",
        completed: false
      },
      {
        id: generateId() + "-ac-4",
        description: "All legendary.ts cards converted to unified format",
        completed: false
      },
      {
        id: generateId() + "-ac-5",
        description: "All mythic.ts cards converted to unified format",
        completed: false
      },
      {
        id: generateId() + "-ac-6",
        description: "All cosmic.ts cards converted to unified format",
        completed: false
      }
    ],
    definitionOfDone: [
      "Code implemented and tested",
      "All card data files migrated",
      "Backward compatibility maintained",
      "No console errors",
      "TypeScript compilation passes"
    ],
    context: {
      files: [
        "src/data/cards/common.ts",
        "src/data/cards/uncommon.ts", 
        "src/data/cards/rare.ts",
        "src/data/cards/epic.ts",
        "src/data/cards/legendary.ts",
        "src/data/cards/mythic.ts",
        "src/data/cards/cosmic.ts"
      ],
      components: ["All card-related components"],
      services: ["CardService", "RollService"],
      userImpact: "Consistent card properties and behavior",
      businessValue: "Unified development experience",
      risks: ["Data loss during migration", "Compatibility issues"],
      testScenarios: [
        "All existing cards load correctly",
        "Card properties are preserved",
        "Roll system works with new format",
        "UI components display cards correctly"
      ],
      suggestedApproach: "Migrate one rarity at a time with validation"
    },
    tags: ["data-migration", "refactoring", "cards"],
    labels: [],
    epic: "refactoring-core",
    createdAt: now,
    updatedAt: now,
    autoCreated: false,
    autoAssignable: true,
    comments: [],
    activity: [
      {
        id: generateId() + "-activity-1",
        type: "status_change",
        actor: "system",
        details: "Task created",
        timestamp: now
      }
    ]
  },
  
  {
    id: generateId(),
    title: "Update Services for Unified Card Model",
    description: "Update CardService, RollService, and related services to work with the unified card model",
    userStory: {
      persona: "developer",
      want: "all services to use the unified card model",
      reason: "consistent API and functionality"
    },
    status: "todo",
    priority: "high",
    size: "M",
    dependencies: ["Migrate Card Data Files to Unified Model"],
    acceptanceCriteria: [
      {
        id: generateId() + "-ac-0",
        description: "CardService updated to handle unified model",
        completed: false
      },
      {
        id: generateId() + "-ac-1",
        description: "RollService updated to handle unified model",
        completed: false
      },
      {
        id: generateId() + "-ac-2",
        description: "EmojiAssignmentService updated",
        completed: false
      },
      {
        id: generateId() + "-ac-3", 
        description: "UncommonCardService updated",
        completed: false
      },
      {
        id: generateId() + "-ac-4",
        description: "CombatEngine updated for unified cards",
        completed: false
      },
      {
        id: generateId() + "-ac-5",
        description: "All service methods return unified cards",
        completed: false
      },
      {
        id: generateId() + "-ac-6",
        description: "Backward compatibility adapters implemented",
        completed: false
      }
    ],
    definitionOfDone: [
      "Code implemented and tested",
      "All services updated",
      "Tests passing",
      "Documentation updated",
      "No breaking changes for existing code"
    ],
    context: {
      files: [
        "src/services/CardService.ts",
        "src/services/RollService.ts",
        "src/services/EmojiAssignmentService.ts",
        "src/services/UncommonCardService.ts",
        "src/services/CombatEngine.ts"
      ],
      components: [],
      services: ["All card-related services"],
      userImpact: "More reliable card operations",
      businessValue: "Consistent service layer",
      risks: ["Breaking existing functionality"],
      testScenarios: [
        "All service methods work correctly",
        "Card generation uses unified model",
        "Roll results are consistent",
        "Combat calculations work properly"
      ],
      suggestedApproach: "Update services incrementally with adapter pattern"
    },
    tags: ["services", "refactoring", "api"],
    labels: [],
    epic: "refactoring-core",
    createdAt: now,
    updatedAt: now,
    autoCreated: false,
    autoAssignable: true,
    comments: [],
    activity: [
      {
        id: generateId() + "-activity-1",
        type: "status_change",
        actor: "system",
        details: "Task created",
        timestamp: now
      }
    ]
  },

  {
    id: generateId(),
    title: "Update Components for Unified Card Model",
    description: "Update all React components to work with the unified card model",
    userStory: {
      persona: "user",
      want: "consistent card display and behavior",
      reason: "better user experience"
    },
    status: "todo",
    priority: "high",
    size: "L",
    dependencies: ["Update Services for Unified Card Model"],
    acceptanceCriteria: [
      {
        id: generateId() + "-ac-0",
        description: "CardDisplay component updated",
        completed: false
      },
      {
        id: generateId() + "-ac-1",
        description: "CardReveal component updated",
        completed: false
      },
      {
        id: generateId() + "-ac-2",
        description: "CardTCG component updated",
        completed: false
      },
      {
        id: generateId() + "-ac-3",
        description: "RollScreen component updated", 
        completed: false
      },
      {
        id: generateId() + "-ac-4",
        description: "CombatScreen component updated",
        completed: false
      },
      {
        id: generateId() + "-ac-5",
        description: "All components display unified card properties",
        completed: false
      },
      {
        id: generateId() + "-ac-6",
        description: "No UI regressions or breaking changes",
        completed: false
      }
    ],
    definitionOfDone: [
      "Code implemented and tested",
      "All components updated", 
      "UI works correctly",
      "No visual regressions",
      "TypeScript compilation passes"
    ],
    context: {
      files: [
        "src/components/cards/CardDisplay.tsx",
        "src/components/roll/CardReveal.tsx",
        "src/components/cards/CardTCG.tsx",
        "src/components/screens/RollScreen.tsx", 
        "src/components/screens/CombatScreen.tsx"
      ],
      components: ["All card-related components"],
      services: [],
      userImpact: "Consistent card display and interaction",
      businessValue: "Better user experience",
      risks: ["UI breaking changes", "Performance issues"],
      testScenarios: [
        "All card components render correctly",
        "Card properties display properly",
        "Interactions work as expected",
        "Performance is maintained"
      ],
      suggestedApproach: "Update components incrementally with testing"
    },
    tags: ["components", "ui", "refactoring"],
    labels: [],
    epic: "refactoring-core",
    createdAt: now,
    updatedAt: now,
    autoCreated: false,
    autoAssignable: true,
    comments: [],
    activity: [
      {
        id: generateId() + "-activity-1",
        type: "status_change",
        actor: "system",
        details: "Task created",
        timestamp: now
      }
    ]
  },

  {
    id: generateId(),
    title: "Add Missing Card Properties and Enhancements",
    description: "Add missing properties like PassiveAbility and EmojiProjectile configurations to existing cards",
    userStory: {
      persona: "player",
      want: "all cards to have complete properties and abilities",
      reason: "richer gameplay experience"
    },
    status: "todo",
    priority: "medium",
    size: "M",
    dependencies: ["Migrate Card Data Files to Unified Model"],
    acceptanceCriteria: [
      {
        id: generateId() + "-ac-0",
        description: "All cards have PassiveAbility defined",
        completed: false
      },
      {
        id: generateId() + "-ac-1",
        description: "All cards have EmojiProjectile configurations",
        completed: false
      },
      {
        id: generateId() + "-ac-2",
        description: "Stack levels and experience added to existing cards",
        completed: false
      },
      {
        id: generateId() + "-ac-3",
        description: "Combat stats calculated for all cards",
        completed: false
      },
      {
        id: generateId() + "-ac-4",
        description: "Visual properties (glow, borders) added",
        completed: false
      },
      {
        id: generateId() + "-ac-5",
        description: "Unique abilities created for each rarity level",
        completed: false
      },
      {
        id: generateId() + "-ac-6",
        description: "Card balance validated and tested",
        completed: false
      }
    ],
    definitionOfDone: [
      "Code implemented and tested",
      "All cards enhanced",
      "Game balance maintained", 
      "Documentation updated",
      "Performance acceptable"
    ],
    context: {
      files: [
        "src/data/cards/*/",
        "src/models/unified/Card.ts"
      ],
      components: ["Card display components"],
      services: ["CardService", "RollService"],
      userImpact: "More engaging cards with unique abilities", 
      businessValue: "Richer gameplay mechanics",
      risks: ["Game balance issues", "Performance impact"],
      testScenarios: [
        "All passive abilities work correctly",
        "Projectile configurations are valid",
        "Card stats are balanced",
        "Visual enhancements display properly"
      ],
      suggestedApproach: "Enhance cards by rarity level with playtesting"
    },
    tags: ["enhancement", "gameplay", "balance"],
    labels: [],
    epic: "refactoring-core",
    createdAt: now,
    updatedAt: now,
    autoCreated: false,
    autoAssignable: true,
    comments: [],
    activity: [
      {
        id: generateId() + "-activity-1",
        type: "status_change",
        actor: "system",
        details: "Task created",
        timestamp: now
      }
    ]
  }
];

// Add new tasks to the existing tasks array
tasksData.tasks.push(...newTasks);

// Update metadata
tasksData.metadata.lastUpdated = now;

// Write back to file
fs.writeFileSync(tasksPath, JSON.stringify(tasksData, null, 2));

console.log(`✅ Added ${newTasks.length} new tasks for card model unification`);
console.log('📋 Tasks added:');
newTasks.forEach((task, index) => {
  console.log(`${index + 1}. ${task.title} (${task.priority} priority)`);
});