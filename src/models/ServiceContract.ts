/**
 * ServiceContract Model
 * 
 * Defines interfaces and APIs for services in the system.
 * Central to contract-first development and TDD workflow.
 */

/**
 * Core ServiceContract interface
 */
export interface ServiceContract {
  // Identity
  name: string;              // Service name (e.g., "SpecService")
  purpose: string;           // Service responsibility
  version: string;           // Contract version
  
  // Interface definition
  methods: ServiceMethod[];
  dataTypes: DataType[];
  
  // Dependencies
  dependencies: string[];    // Other service names required
  
  // File locations
  filePath: string;          // Implementation file location
  contractPath: string;      // Contract documentation path
  testPath: string;          // Contract test file location
  
  // Metadata
  createdDate: Date;
  lastModified: Date;
  status: ContractStatus;
}

export type ContractStatus = 'draft' | 'approved' | 'implemented' | 'deprecated';

/**
 * Service method definition
 */
export interface ServiceMethod {
  // Identity
  name: string;              // Method name
  description: string;       // What the method does
  
  // Signature
  parameters: Parameter[];
  returnType: DataType;
  
  // Behavior specification
  behavior: string[];        // Step-by-step behavior description
  preconditions: string[];   // What must be true before calling
  postconditions: string[];  // What will be true after calling
  
  // Error handling
  exceptions: ExceptionSpec[];
  
  // Performance requirements
  maxExecutionTime?: number; // Milliseconds
  memoryLimit?: number;      // MB
  
  // Metadata
  async: boolean;
  idempotent: boolean;       // Same input = same output
  sideEffects: string[];     // External changes made
}

export interface Parameter {
  name: string;
  type: DataType;
  required: boolean;
  description: string;
  validation?: ValidationRule[];
  defaultValue?: any;
}

export interface ValidationRule {
  rule: string;              // e.g., "min-length", "regex", "range"
  value: any;               // Rule parameter
  message: string;          // Error message if validation fails
}

/**
 * Data type definitions
 */
export interface DataType {
  name: string;              // Type name
  kind: TypeKind;
  description?: string;
  
  // For complex types
  properties?: Property[];   // Object properties
  elementType?: DataType;    // Array/collection element type
  
  // Constraints
  constraints?: TypeConstraint[];
}

export type TypeKind = 
  | 'primitive'    // string, number, boolean, Date
  | 'object'       // Interface/class
  | 'array'        // Array or collection
  | 'union'        // Union type (A | B)
  | 'generic'      // Generic type parameter
  | 'enum';        // Enumeration

export interface Property {
  name: string;
  type: DataType;
  required: boolean;
  description?: string;
  readonly?: boolean;
}

export interface TypeConstraint {
  type: 'length' | 'range' | 'format' | 'unique' | 'custom';
  value: any;
  message: string;
}

/**
 * Exception specifications
 */
export interface ExceptionSpec {
  name: string;              // Exception class name
  conditions: string[];      // When this exception is thrown
  message: string;           // Error message format
  code?: string;            // Error code
  recoverySuggestions?: string[]; // How to handle/fix
}

/**
 * Contract validation and testing
 */
export interface ContractValidationResult {
  isValid: boolean;
  errors: ContractValidationError[];
  warnings: ContractValidationError[];
  completeness: number;      // 0-100 percentage
}

export interface ContractValidationError {
  section: 'methods' | 'types' | 'dependencies' | 'metadata';
  item?: string;             // Method/type name if applicable
  message: string;
  severity: 'error' | 'warning';
}

export interface ContractTestResult {
  contractName: string;
  testsPassing: boolean;
  totalTests: number;
  passingTests: number;
  failingTests: TestFailure[];
  coverage: TestCoverage;
}

export interface TestFailure {
  methodName: string;
  testCase: string;
  error: string;
  expected: any;
  actual: any;
}

export interface TestCoverage {
  methodsCovered: number;
  totalMethods: number;
  coveragePercentage: number;
  uncoveredMethods: string[];
}

/**
 * Contract utilities
 */
export const validateServiceContract = (contract: ServiceContract): ContractValidationResult => {
  const errors: ContractValidationError[] = [];
  const warnings: ContractValidationError[] = [];
  
  // Required fields validation
  if (!contract.name) {
    errors.push({ section: 'metadata', message: 'Service name is required', severity: 'error' });
  }
  
  if (!contract.purpose) {
    errors.push({ section: 'metadata', message: 'Service purpose is required', severity: 'error' });
  }
  
  if (contract.methods.length === 0) {
    errors.push({ section: 'methods', message: 'Contract must define at least one method', severity: 'error' });
  }
  
  // Method validation
  contract.methods.forEach(method => {
    if (!method.name) {
      errors.push({ section: 'methods', item: 'unnamed', message: 'Method name is required', severity: 'error' });
    }
    
    if (!method.description) {
      warnings.push({ section: 'methods', item: method.name, message: 'Method should have description', severity: 'warning' });
    }
    
    if (method.behavior.length === 0) {
      warnings.push({ section: 'methods', item: method.name, message: 'Method should specify behavior', severity: 'warning' });
    }
    
    // Parameter validation
    method.parameters.forEach(param => {
      if (!param.name || !param.type) {
        errors.push({ section: 'methods', item: method.name, message: `Invalid parameter: ${param.name}`, severity: 'error' });
      }
    });
  });
  
  // Dependency validation
  contract.dependencies.forEach(dep => {
    if (dep === contract.name) {
      errors.push({ section: 'dependencies', message: 'Service cannot depend on itself', severity: 'error' });
    }
  });
  
  // File path validation
  if (!contract.filePath) {
    warnings.push({ section: 'metadata', message: 'Implementation file path should be specified', severity: 'warning' });
  }
  
  if (!contract.testPath) {
    warnings.push({ section: 'metadata', message: 'Contract test path should be specified', severity: 'warning' });
  }
  
  // Calculate completeness
  const completenessChecks = [
    contract.name !== '',
    contract.purpose !== '',
    contract.methods.length > 0,
    contract.methods.every(m => m.description !== ''),
    contract.methods.every(m => m.behavior.length > 0),
    contract.dataTypes.length > 0,
    contract.filePath !== '',
    contract.testPath !== ''
  ];
  
  const completeness = Math.round(
    (completenessChecks.filter(Boolean).length / completenessChecks.length) * 100
  );
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    completeness
  };
};

export const createDataType = (name: string, kind: TypeKind, properties?: Property[]): DataType => {
  return {
    name,
    kind,
    properties: properties || [],
    constraints: []
  };
};

export const createServiceMethod = (
  name: string,
  description: string,
  returnType: DataType,
  parameters: Parameter[] = []
): ServiceMethod => {
  return {
    name,
    description,
    parameters,
    returnType,
    behavior: [],
    preconditions: [],
    postconditions: [],
    exceptions: [],
    async: false,
    idempotent: false,
    sideEffects: []
  };
};

export const generateContractFromInterface = (interfaceDefinition: any): ServiceContract => {
  // This would parse a TypeScript interface and generate a contract
  // Simplified implementation for now
  
  return {
    name: 'GeneratedService',
    purpose: 'Generated from interface',
    version: '1.0.0',
    methods: [],
    dataTypes: [],
    dependencies: [],
    filePath: '',
    contractPath: '',
    testPath: '',
    createdDate: new Date(),
    lastModified: new Date(),
    status: 'draft'
  };
};

export const findCircularDependencies = (contracts: ServiceContract[]): string[] => {
  const graph = new Map<string, string[]>();
  
  // Build dependency graph
  contracts.forEach(contract => {
    graph.set(contract.name, contract.dependencies);
  });
  
  // Detect cycles using DFS
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  const cycles: string[] = [];
  
  const hasCycle = (serviceName: string, path: string[]): boolean => {
    visited.add(serviceName);
    recursionStack.add(serviceName);
    
    const dependencies = graph.get(serviceName) || [];
    
    for (const depName of dependencies) {
      if (!visited.has(depName)) {
        if (hasCycle(depName, [...path, depName])) {
          return true;
        }
      } else if (recursionStack.has(depName)) {
        cycles.push(`Circular dependency: ${[...path, depName, serviceName].join(' → ')}`);
        return true;
      }
    }
    
    recursionStack.delete(serviceName);
    return false;
  };
  
  // Check all services
  contracts.forEach(contract => {
    if (!visited.has(contract.name)) {
      hasCycle(contract.name, [contract.name]);
    }
  });
  
  return cycles;
};