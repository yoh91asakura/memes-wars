/**
 * SpecService Implementation
 * 
 * Manages specification documents and their lifecycle within the spec-kit workflow.
 * Central service for feature specification creation, validation, and management.
 */

import type {
  SpecificationDocument,
  SpecificationResult,
  ValidationResult,
  SpecificationStatus,
  SpecificationSummary,
  ApprovalResult,
  ImplementationResult,
  CompletionResult,
  SpecFilter,
  SpecStatus,
  ValidationError,
  createSpecificationId,
  validateSpecificationId,
  validateStatusTransition,
  calculateCompleteness
} from '@/models/SpecificationDocument';

/**
 * SpecService class implementation
 * Implements the contract defined in tests/contract/SpecService.test.ts
 */
export class SpecService {
  private specifications: Map<string, SpecificationDocument> = new Map();
  private nextSpecNumber: number = 5; // Start after existing specs
  
  constructor() {
    // Load existing specifications (simplified - would use file system in real implementation)
    this.loadExistingSpecifications();
  }

  /**
   * Creates a new specification with numbered branch and directory structure
   */
  async createSpecification(description: string): Promise<SpecificationResult> {
    const startTime = Date.now();
    
    try {
      // Generate unique ID
      const specId = this.generateSpecificationId(description);
      
      // Create git branch
      const branchName = specId;
      await this.createGitBranch(branchName);
      
      // Create directory structure
      const specFile = await this.createSpecDirectory(specId);
      
      // Create initial specification document
      const specification: SpecificationDocument = {
        id: specId,
        title: description,
        status: 'draft',
        createdDate: new Date(),
        lastModified: new Date(),
        branch: branchName,
        requirements: [],
        userStories: [],
        entities: [],
        filePath: specFile,
        files: {
          specFile
        },
        progress: {
          phase0Research: false,
          phase1Design: false,
          phase2Planning: false,
          phase3Implementation: false,
          phase4Validation: false
        }
      };
      
      // Store specification
      this.specifications.set(specId, specification);
      
      // Write to file system (simplified)
      await this.writeSpecificationFile(specification);
      
      const duration = Date.now() - startTime;
      if (duration > 5000) {
        console.warn(`Specification creation took ${duration}ms, exceeding 5s target`);
      }
      
      return {
        id: specId,
        branchName,
        specFile,
        status: 'created'
      };
      
    } catch (error) {
      throw new Error(`Failed to create specification: ${error}`);
    }
  }

  /**
   * Validates specification against template requirements and best practices
   */
  async validateSpecification(specId: string): Promise<ValidationResult> {
    const startTime = Date.now();
    
    try {
      const specification = await this.getSpecificationById(specId);
      if (!specification) {
        throw new Error('SpecificationNotFound');
      }
      
      const errors: ValidationError[] = [];
      const warnings: ValidationError[] = [];
      
      // Validate required sections
      if (specification.requirements.length === 0) {
        errors.push({
          section: 'requirements',
          field: 'functional requirements',
          message: 'Specification must define functional requirements',
          severity: 'error'
        });
      }
      
      if (specification.userStories.length === 0) {
        warnings.push({
          section: 'user stories',
          field: 'acceptance scenarios',
          message: 'Specification should include user stories',
          severity: 'warning'
        });
      }
      
      if (specification.entities.length === 0) {
        warnings.push({
          section: 'entities',
          field: 'key entities',
          message: 'Specification should identify key entities',
          severity: 'warning'
        });
      }
      
      // Validate functional requirements format
      specification.requirements.forEach((req, index) => {
        if (!req.id.startsWith('FR-')) {
          errors.push({
            section: 'requirements',
            field: `requirement[${index}].id`,
            message: 'Functional requirement ID must start with FR-',
            severity: 'error'
          });
        }
        
        if (req.acceptanceCriteria.length === 0) {
          warnings.push({
            section: 'requirements',
            field: `requirement[${index}].acceptanceCriteria`,
            message: 'Requirements should have acceptance criteria',
            severity: 'warning'
          });
        }
      });
      
      // Validate user stories follow Given-When-Then pattern
      specification.userStories.forEach((story, index) => {
        story.acceptanceScenarios.forEach((scenario, scenarioIndex) => {
          if (scenario.given.length === 0) {
            errors.push({
              section: 'user stories',
              field: `story[${index}].scenario[${scenarioIndex}].given`,
              message: 'Scenarios must specify Given conditions',
              severity: 'error'
            });
          }
        });
      });
      
      // Calculate completeness
      const completeness = this.calculateSpecificationCompleteness(specification);
      
      const duration = Date.now() - startTime;
      if (duration > 2000) {
        console.warn(`Validation took ${duration}ms, exceeding 2s target`);
      }
      
      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        completeness
      };
      
    } catch (error) {
      if (error instanceof Error && error.message === 'SpecificationNotFound') {
        throw error;
      }
      throw new Error(`Validation failed: ${error}`);
    }
  }

  /**
   * Retrieves current status and metadata for a specification
   */
  async getSpecificationStatus(specId: string): Promise<SpecificationStatus> {
    const startTime = Date.now();
    
    try {
      const specification = await this.getSpecificationById(specId);
      if (!specification) {
        throw new Error('SpecificationNotFound');
      }
      
      const duration = Date.now() - startTime;
      if (duration > 500) {
        console.warn(`Status query took ${duration}ms, exceeding 500ms target`);
      }
      
      return {
        id: specification.id,
        title: specification.title,
        status: specification.status,
        currentPhase: this.getCurrentPhase(specification),
        progress: specification.progress,
        lastModified: specification.lastModified,
        branch: specification.branch,
        files: specification.files
      };
      
    } catch (error) {
      if (error instanceof Error && error.message === 'SpecificationNotFound') {
        throw error;
      }
      throw new Error(`Failed to get status: ${error}`);
    }
  }

  /**
   * Lists all specifications with optional filtering
   */
  async listSpecifications(filter?: SpecFilter): Promise<SpecificationSummary[]> {
    const startTime = Date.now();
    
    try {
      let specs = Array.from(this.specifications.values());
      
      // Apply filters
      if (filter) {
        if (filter.status) {
          specs = specs.filter(spec => spec.status === filter.status);
        }
        
        if (filter.branch) {
          specs = specs.filter(spec => spec.branch === filter.branch);
        }
        
        if (filter.dateRange) {
          specs = specs.filter(spec => 
            spec.createdDate >= filter.dateRange!.from &&
            spec.createdDate <= filter.dateRange!.to
          );
        }
        
        if (filter.hasImplementation !== undefined) {
          specs = specs.filter(spec => 
            filter.hasImplementation 
              ? spec.files.tasksFile !== undefined
              : spec.files.tasksFile === undefined
          );
        }
      }
      
      const summaries = specs.map(spec => ({
        id: spec.id,
        title: spec.title,
        status: spec.status,
        createdDate: spec.createdDate,
        lastModified: spec.lastModified,
        requirementsCount: spec.requirements.length,
        tasksCount: spec.files.tasksFile ? this.getTaskCount(spec.id) : undefined
      }));
      
      const duration = Date.now() - startTime;
      if (duration > 1000) {
        console.warn(`List operation took ${duration}ms, exceeding 1s target`);
      }
      
      return summaries;
      
    } catch (error) {
      throw new Error(`Failed to list specifications: ${error}`);
    }
  }

  /**
   * Transitions specification from draft to approved status
   */
  async approveSpecification(specId: string): Promise<ApprovalResult> {
    try {
      const specification = await this.getSpecificationById(specId);
      if (!specification) {
        throw new Error('SpecificationNotFound');
      }
      
      // Validate transition
      if (!validateStatusTransition(specification.status, 'approved')) {
        throw new Error('InvalidStateTransition');
      }
      
      const previousStatus = specification.status;
      specification.status = 'approved';
      specification.lastModified = new Date();
      
      // Update storage
      this.specifications.set(specId, specification);
      await this.writeSpecificationFile(specification);
      
      return {
        success: true,
        previousStatus,
        newStatus: 'approved',
        message: `Specification ${specId} has been approved`
      };
      
    } catch (error) {
      if (error instanceof Error && 
          (error.message === 'SpecificationNotFound' || 
           error.message === 'InvalidStateTransition')) {
        throw error;
      }
      throw new Error(`Failed to approve specification: ${error}`);
    }
  }

  /**
   * Initiates planning phase for approved specification
   */
  async startImplementation(specId: string): Promise<ImplementationResult> {
    try {
      const specification = await this.getSpecificationById(specId);
      if (!specification) {
        throw new Error('SpecificationNotFound');
      }
      
      // Validate transition
      if (!validateStatusTransition(specification.status, 'in-progress')) {
        throw new Error('InvalidStateTransition');
      }
      
      // Update status
      specification.status = 'in-progress';
      specification.lastModified = new Date();
      specification.progress.phase2Planning = true;
      
      // Create plan file
      const planFile = await this.createPlanFile(specId);
      specification.files.planFile = planFile;
      
      // Generate tasks (simplified)
      const tasksGenerated = await this.generateTasks(specId);
      
      // Update storage
      this.specifications.set(specId, specification);
      await this.writeSpecificationFile(specification);
      
      return {
        success: true,
        planFile,
        tasksGenerated,
        phase: 'Phase 2: Planning'
      };
      
    } catch (error) {
      if (error instanceof Error && 
          (error.message === 'SpecificationNotFound' || 
           error.message === 'InvalidStateTransition')) {
        throw error;
      }
      throw new Error(`Failed to start implementation: ${error}`);
    }
  }

  /**
   * Marks specification as completed and archives relevant files
   */
  async completeSpecification(specId: string): Promise<CompletionResult> {
    try {
      const specification = await this.getSpecificationById(specId);
      if (!specification) {
        throw new Error('SpecificationNotFound');
      }
      
      // Validate transition
      if (!validateStatusTransition(specification.status, 'completed')) {
        throw new Error('InvalidStateTransition');
      }
      
      // Update status
      specification.status = 'completed';
      specification.lastModified = new Date();
      specification.progress.phase4Validation = true;
      
      // Archive files
      const archivedFiles = await this.archiveSpecificationFiles(specId);
      
      // Update storage
      this.specifications.set(specId, specification);
      await this.writeSpecificationFile(specification);
      
      return {
        success: true,
        archivedFiles,
        completionDate: new Date()
      };
      
    } catch (error) {
      if (error instanceof Error && 
          (error.message === 'SpecificationNotFound' || 
           error.message === 'InvalidStateTransition')) {
        throw error;
      }
      throw new Error(`Failed to complete specification: ${error}`);
    }
  }

  // Private helper methods

  private async getSpecificationById(specId: string): Promise<SpecificationDocument | null> {
    return this.specifications.get(specId) || null;
  }

  private generateSpecificationId(description: string): string {
    const normalized = description
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);
    
    const specId = `${this.nextSpecNumber.toString().padStart(3, '0')}-${normalized}`;
    this.nextSpecNumber++;
    
    return specId;
  }

  private async createGitBranch(branchName: string): Promise<void> {
    // Simplified - in real implementation would use git commands
    console.log(`Creating git branch: ${branchName}`);
  }

  private async createSpecDirectory(specId: string): Promise<string> {
    const specDir = `specs/${specId}`;
    const specFile = `${specDir}/spec.md`;
    
    // Simplified - in real implementation would create actual directories
    console.log(`Creating spec directory: ${specDir}`);
    
    return specFile;
  }

  private async writeSpecificationFile(specification: SpecificationDocument): Promise<void> {
    // Simplified - in real implementation would write to file system
    console.log(`Writing specification file: ${specification.filePath}`);
  }

  private calculateSpecificationCompleteness(specification: SpecificationDocument): number {
    const checks = [
      specification.requirements.length > 0,
      specification.userStories.length > 0,
      specification.entities.length > 0,
      specification.requirements.every(req => req.acceptanceCriteria.length > 0),
      specification.userStories.every(story => story.acceptanceScenarios.length > 0),
      specification.files.specFile !== undefined
    ];
    
    const completed = checks.filter(Boolean).length;
    return Math.round((completed / checks.length) * 100);
  }

  private getCurrentPhase(specification: SpecificationDocument): string {
    if (!specification.progress.phase0Research) return 'Phase 0: Research';
    if (!specification.progress.phase1Design) return 'Phase 1: Design';
    if (!specification.progress.phase2Planning) return 'Phase 2: Planning';
    if (!specification.progress.phase3Implementation) return 'Phase 3: Implementation';
    if (!specification.progress.phase4Validation) return 'Phase 4: Validation';
    return 'Completed';
  }

  private getTaskCount(specId: string): number {
    // Simplified - would count tasks from tasks file
    return 0;
  }

  private async createPlanFile(specId: string): Promise<string> {
    const planFile = `specs/${specId}/plan.md`;
    // Simplified - would create actual file
    console.log(`Creating plan file: ${planFile}`);
    return planFile;
  }

  private async generateTasks(specId: string): Promise<number> {
    // Simplified - would generate actual tasks from specification
    console.log(`Generating tasks for specification: ${specId}`);
    return 10; // Mock task count
  }

  private async archiveSpecificationFiles(specId: string): Promise<string[]> {
    const specification = this.specifications.get(specId);
    if (!specification) return [];
    
    const files = [
      specification.files.specFile,
      specification.files.planFile,
      specification.files.tasksFile
    ].filter(Boolean) as string[];
    
    // Simplified - would actually archive files
    console.log(`Archiving files for ${specId}:`, files);
    
    return files;
  }

  private loadExistingSpecifications(): void {
    // Load the current active specification
    const currentSpec: SpecificationDocument = {
      id: '004-refactor-all-the',
      title: 'Project Refactoring for Claude Code & Spec-Kit Optimization',
      status: 'in-progress',
      createdDate: new Date('2025-09-09'),
      lastModified: new Date(),
      branch: '004-refactor-all-the',
      requirements: [
        {
          id: 'FR-001',
          title: 'AI Context Management',
          description: 'System must maintain single source of truth in CLAUDE.md',
          priority: 'critical',
          category: 'Documentation',
          acceptanceCriteria: ['CLAUDE.md exists', 'Context under 150 lines'],
          dependencies: [],
          testable: true
        }
      ],
      userStories: [],
      entities: [],
      filePath: 'specs/004-refactor-all-the/spec.md',
      files: {
        specFile: 'specs/004-refactor-all-the/spec.md',
        planFile: 'specs/004-refactor-all-the/plan.md',
        tasksFile: 'specs/004-refactor-all-the/tasks.md',
        dataModelFile: 'specs/004-refactor-all-the/data-model.md'
      },
      progress: {
        phase0Research: true,
        phase1Design: true,
        phase2Planning: true,
        phase3Implementation: true,
        phase4Validation: false
      }
    };
    
    this.specifications.set(currentSpec.id, currentSpec);
  }
}

// Export singleton instance
export const specService = new SpecService();