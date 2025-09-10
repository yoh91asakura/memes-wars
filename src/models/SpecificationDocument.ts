/**
 * SpecificationDocument Model
 * 
 * Represents a feature specification within the spec-kit workflow.
 * Central entity for managing feature requirements and lifecycle.
 */

export type SpecStatus = 'draft' | 'approved' | 'in-progress' | 'completed';

export interface FunctionalRequirement {
  id: string;              // e.g., "FR-001"
  title: string;           // Short requirement title
  description: string;     // Detailed requirement description
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string;        // e.g., "Documentation", "Testing"
  acceptanceCriteria: string[];
  dependencies: string[];  // Other requirement IDs
  testable: boolean;
}

export interface UserStory {
  id: string;              // e.g., "US-001"
  title: string;           // Story title
  asA: string;            // Actor role
  iWant: string;          // Desired capability
  soThat: string;         // Business value
  acceptanceScenarios: AcceptanceScenario[];
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface AcceptanceScenario {
  id: string;
  title: string;
  given: string[];        // Preconditions
  when: string[];         // Actions
  then: string[];         // Expected outcomes
}

export interface Entity {
  name: string;           // Entity name
  description: string;    // Purpose and role
  attributes: EntityAttribute[];
  relationships: EntityRelationship[];
}

export interface EntityAttribute {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

export interface EntityRelationship {
  type: 'has-one' | 'has-many' | 'belongs-to' | 'many-to-many';
  targetEntity: string;
  description: string;
}

export interface PhaseProgress {
  phase0Research: boolean;
  phase1Design: boolean;
  phase2Planning: boolean;
  phase3Implementation: boolean;
  phase4Validation: boolean;
}

export interface SpecificationFiles {
  specFile: string;           // spec.md path
  planFile?: string;          // plan.md path
  researchFile?: string;      // research.md path
  dataModelFile?: string;     // data-model.md path
  quickstartFile?: string;    // quickstart.md path
  tasksFile?: string;         // tasks.md path
  contractsDir?: string;      // contracts/ directory
}

/**
 * Core SpecificationDocument interface
 * Central entity for spec-kit workflow management
 */
export interface SpecificationDocument {
  // Identity
  id: string;                    // e.g., "004-refactor-all-the"
  title: string;                 // Human-readable feature name
  status: SpecStatus;            // Current lifecycle status
  
  // Metadata
  createdDate: Date;            // When specification was created
  lastModified: Date;           // Last update timestamp
  branch: string;               // Git branch name
  
  // Content
  requirements: FunctionalRequirement[];  // List of functional requirements
  userStories: UserStory[];               // Acceptance scenarios
  entities: Entity[];                     // Key data entities involved
  
  // File system
  filePath: string;             // Absolute path to spec.md file
  files: SpecificationFiles;    // Related spec files
  
  // Progress tracking
  progress: PhaseProgress;      // Implementation phase completion
}

/**
 * Results and operation responses
 */
export interface SpecificationResult {
  id: string;               // Generated spec ID
  branchName: string;       // Created Git branch
  specFile: string;         // Absolute path to spec.md
  status: 'created';        // Initial status
}

export interface ValidationError {
  section: string;          // Spec section with error
  field: string;            // Specific field
  message: string;          // Error description
  severity: 'error' | 'warning';
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  completeness: number;     // 0-100 percentage
}

export interface SpecificationStatus {
  id: string;
  title: string;
  status: SpecStatus;
  currentPhase: string;
  progress: PhaseProgress;
  lastModified: Date;
  branch: string;
  files: SpecificationFiles;
}

export interface SpecFilter {
  status?: SpecStatus;
  branch?: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
  hasImplementation?: boolean;
}

export interface SpecificationSummary {
  id: string;
  title: string;
  status: SpecStatus;
  createdDate: Date;
  lastModified: Date;
  requirementsCount: number;
  tasksCount?: number;
}

export interface ApprovalResult {
  success: boolean;
  previousStatus: SpecStatus;
  newStatus: SpecStatus;
  message: string;
}

export interface ImplementationResult {
  success: boolean;
  planFile: string;
  tasksGenerated: number;
  phase: string;
}

export interface CompletionResult {
  success: boolean;
  archivedFiles: string[];
  completionDate: Date;
}

/**
 * Validation functions
 */
export const validateSpecificationId = (id: string): boolean => {
  const pattern = /^\d{3}-[\w-]+$/;
  return pattern.test(id);
};

export const validateStatusTransition = (
  from: SpecStatus, 
  to: SpecStatus
): boolean => {
  const validTransitions: Record<SpecStatus, SpecStatus[]> = {
    'draft': ['approved'],
    'approved': ['in-progress'],
    'in-progress': ['completed'],
    'completed': []
  };
  
  return validTransitions[from]?.includes(to) ?? false;
};

/**
 * Utility functions
 */
export const createSpecificationId = (description: string, nextNumber: number): string => {
  const normalized = description
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50);
  
  return `${nextNumber.toString().padStart(3, '0')}-${normalized}`;
};

export const calculateCompleteness = (spec: SpecificationDocument): number => {
  const checks = [
    spec.requirements.length > 0,
    spec.userStories.length > 0,
    spec.entities.length > 0,
    spec.requirements.every(req => req.acceptanceCriteria.length > 0),
    spec.userStories.every(story => story.acceptanceScenarios.length > 0),
    spec.files.specFile !== undefined
  ];
  
  const completed = checks.filter(Boolean).length;
  return Math.round((completed / checks.length) * 100);
};