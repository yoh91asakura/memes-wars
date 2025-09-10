/**
 * ImplementationPlan Model
 * 
 * Represents the planning phase output for a specification.
 * Contains technical context, phases, and implementation strategy.
 */

export interface TechnicalContext {
  techStack: TechStackItem[];
  constraints: Constraint[];
  assumptions: string[];
  risks: Risk[];
}

export interface TechStackItem {
  name: string;              // e.g., "React", "TypeScript"
  version: string;           // Version constraint
  purpose: string;           // Why this technology
  alternatives: string[];    // Other options considered
}

export interface Constraint {
  id: string;
  type: 'technical' | 'business' | 'resource' | 'time';
  description: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  mitigation?: string;
}

export interface Risk {
  id: string;
  description: string;
  probability: number;       // 0-1 scale
  impact: 'low' | 'medium' | 'high' | 'critical';
  mitigation: string;
  owner: string;
}

export interface ConstitutionCheck {
  compliant: boolean;
  checkDate: Date;
  violations: ConstitutionViolation[];
  recommendations: string[];
}

export interface ConstitutionViolation {
  rule: string;              // Constitutional rule violated
  description: string;       // What was violated
  severity: 'warning' | 'error' | 'critical';
  remediation: string;       // How to fix
}

export interface ProjectStructure {
  directories: DirectoryStructure[];
  filePatterns: FilePattern[];
  namingConventions: NamingConvention[];
  organizationPrinciples: string[];
}

export interface DirectoryStructure {
  path: string;              // e.g., "src/components/atoms"
  purpose: string;           // Role in architecture
  conventions: string[];     // Rules for this directory
}

export interface FilePattern {
  pattern: string;           // e.g., "*.test.ts"
  location: string;          // Where files should go
  template?: string;         // Template file reference
}

export interface NamingConvention {
  context: string;           // e.g., "Components", "Services"
  pattern: string;           // e.g., "PascalCase", "camelCase"
  examples: string[];
}

export interface Phase {
  id: string;                // e.g., "Phase 1"
  name: string;              // Human-readable name
  description: string;       // What happens in this phase
  order: number;             // Execution order
  duration: number;          // Estimated hours
  deliverables: Deliverable[];
  dependencies: string[];    // Other phase IDs
  entryConditions: string[];
  exitConditions: string[];
}

export interface Deliverable {
  id: string;
  name: string;
  type: 'document' | 'code' | 'test' | 'configuration';
  path?: string;             // File location if applicable
  description: string;
}

export interface ResearchFinding {
  id: string;
  topic: string;             // Research area
  question: string;          // Question investigated
  findings: string[];        // Key discoveries
  recommendations: string[];
  sources: string[];         // References
  confidence: number;        // 0-1 scale
}

/**
 * Core ImplementationPlan interface
 */
export interface ImplementationPlan {
  // Identity
  specificationId: string;   // References SpecificationDocument.id
  
  // Technical foundation
  technicalContext: TechnicalContext;
  constitutionCheck: ConstitutionCheck;
  projectStructure: ProjectStructure;
  
  // Implementation strategy
  phases: Phase[];
  researchFindings: ResearchFinding[];
  
  // Deliverables references
  contracts: ServiceContractReference[];
  dataModel: DataModelReference;
  quickstartGuide: QuickstartGuideReference;
  
  // Metadata
  createdDate: Date;
  lastModified: Date;
  version: string;
  status: PlanStatus;
}

export type PlanStatus = 'draft' | 'approved' | 'active' | 'completed' | 'archived';

export interface ServiceContractReference {
  serviceName: string;
  contractFile: string;
  purpose: string;
  methods: string[];         // Key method names
}

export interface DataModelReference {
  file: string;              // data-model.md path
  entities: string[];        // Entity names
  relationships: string[];   // Key relationships
}

export interface QuickstartGuideReference {
  file: string;              // quickstart.md path
  scenarios: string[];       // Test scenarios
  workflows: string[];       // Development workflows
}

/**
 * Plan validation and utilities
 */
export interface PlanValidationResult {
  isValid: boolean;
  errors: PlanValidationError[];
  warnings: PlanValidationError[];
  completeness: number;
}

export interface PlanValidationError {
  phase?: string;
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

export const validatePhaseOrder = (phases: Phase[]): boolean => {
  const orderedPhases = [...phases].sort((a, b) => a.order - b.order);
  return orderedPhases.every((phase, index) => phase.order === index + 1);
};

export const validatePhaseDependencies = (phases: Phase[]): string[] => {
  const phaseIds = phases.map(p => p.id);
  const violations: string[] = [];
  
  phases.forEach(phase => {
    phase.dependencies.forEach(depId => {
      if (!phaseIds.includes(depId)) {
        violations.push(`Phase ${phase.id} depends on non-existent phase ${depId}`);
      }
    });
  });
  
  return violations;
};

export const calculatePlanCompleteness = (plan: ImplementationPlan): number => {
  const checks = [
    plan.technicalContext.techStack.length > 0,
    plan.constitutionCheck.compliant,
    plan.phases.length > 0,
    plan.contracts.length > 0,
    plan.researchFindings.length > 0,
    plan.phases.every(p => p.entryConditions.length > 0),
    plan.phases.every(p => p.exitConditions.length > 0),
    validatePhaseOrder(plan.phases),
    validatePhaseDependencies(plan.phases).length === 0
  ];
  
  const completed = checks.filter(Boolean).length;
  return Math.round((completed / checks.length) * 100);
};

/**
 * Plan generation utilities
 */
export const createPhaseFromTemplate = (
  templateType: string,
  phaseData: Partial<Phase>
): Phase => {
  const templates: Record<string, Partial<Phase>> = {
    'setup': {
      name: 'Setup & Configuration',
      description: 'Prepare project structure and dependencies',
      entryConditions: ['Specification approved'],
      exitConditions: ['All dependencies installed', 'Configuration validated']
    },
    'implementation': {
      name: 'Core Implementation',
      description: 'Implement main features following TDD',
      entryConditions: ['Setup complete', 'Tests written'],
      exitConditions: ['All tests passing', 'Code review complete']
    },
    'validation': {
      name: 'Testing & Validation',
      description: 'Comprehensive testing and quality assurance',
      entryConditions: ['Implementation complete'],
      exitConditions: ['All tests passing', 'Performance validated']
    }
  };
  
  const template = templates[templateType] || {};
  
  return {
    id: phaseData.id || `phase-${Date.now()}`,
    order: phaseData.order || 1,
    duration: phaseData.duration || 8,
    deliverables: phaseData.deliverables || [],
    dependencies: phaseData.dependencies || [],
    ...template,
    ...phaseData
  } as Phase;
};