# Quickstart Guide: Spec-Kit Optimized Development

**Feature**: Project Refactoring for Claude Code & Spec-Kit Optimization  
**For**: Developers using AI-assisted development with Claude Code  
**Last Updated**: 2025-09-09

## 🚀 Quick Start (5 minutes)

### Prerequisites Check
```bash
# Verify you have required tools
node --version    # Should be 18+
npm --version     # Should be 9+
git --version     # Any recent version
npx playwright --version  # Should be installed

# For Windows users, ensure Git Bash is available
which bash        # Should return a path
```

### 1. Clone and Setup
```bash
# Clone the repository
git clone <repository-url>
cd memes-wars

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install
```

### 2. Verify Spec-Kit Workflow
```bash
# Check spec-kit scripts are executable
bash scripts/create-new-feature.sh --help
bash scripts/setup-plan.sh --help

# Verify current project structure
ls specs/               # Should show numbered spec directories
cat CLAUDE.md          # Should contain project context for AI
```

### 3. Run Development Environment
```bash
# Start the development server
npm run dev

# In another terminal, run tests to verify setup
npm run test           # Unit tests with Vitest
npm run test:e2e       # End-to-end tests with Playwright
```

### 4. Test AI Agent Integration
```bash
# Verify Claude Code can understand the project
# Open Claude Code and ask: "What is the current project structure?"
# Expected: Claude should reference CLAUDE.md and explain the atomic design pattern

# Test spec-kit workflow
bash scripts/create-new-feature.sh "test feature for quickstart"
# Expected: Creates new spec directory and branch
```

## 🎯 Development Workflow

### Standard Feature Development Cycle

#### 1. Specification Phase
```bash
# Create new feature specification
bash scripts/create-new-feature.sh "your feature description"

# This creates:
# - New branch: XXX-your-feature-name
# - Spec directory: specs/XXX-your-feature-name/
# - Initial spec.md file with template

# Edit spec.md to define requirements and user stories
# Ensure all [NEEDS CLARIFICATION] items are resolved
```

#### 2. Planning Phase
```bash
# Setup implementation plan
bash scripts/setup-plan.sh

# This creates planning structure:
# - plan.md (this guide)
# - research.md (best practices research)
# - data-model.md (entity definitions)
# - contracts/ (service interfaces)
# - quickstart.md (onboarding guide)
```

#### 3. Task Generation Phase
```bash
# Generate implementation tasks
# (Command to be implemented in Phase 2)
# Creates: specs/XXX-feature/tasks.md with ordered, testable tasks
```

#### 4. Implementation Phase
```bash
# Follow TDD approach: Tests first, then implementation
# 1. Write contract tests (tests/contract/)
# 2. Write integration tests (tests/integration/)
# 3. Write E2E tests (tests/e2e/)
# 4. Write unit tests (tests/unit/)
# 5. Implement code to make tests pass

# Verify implementation
npm run test           # All tests should pass
npm run typecheck      # TypeScript validation
npm run lint           # Code quality checks
```

## 🧪 Testing Strategy

### Test Hierarchy (Constitutional Order)
```bash
# 1. Contract Tests - Service interface validation
npm run test:contract

# 2. Integration Tests - Service interaction validation  
npm run test:integration

# 3. End-to-End Tests - Full user workflow validation
npm run test:e2e

# 4. Unit Tests - Individual component validation
npm run test:unit

# Run all tests in constitutional order
npm run test:all
```

### Playwright E2E Testing
```bash
# Run E2E tests in different modes
npm run test:e2e                    # Headless mode
npm run test:e2e:headed             # With browser UI
npm run test:e2e:debug              # Debug mode with inspector

# Run tests in specific browsers
npm run test:e2e -- --project=chromium
npm run test:e2e -- --project=firefox
npm run test:e2e -- --project=webkit

# Generate test reports
npm run test:e2e -- --reporter=html
```

### Test Data Management
```bash
# Test data is isolated and reproducible
# Location: tests/fixtures/
# - users.json (test user data)
# - games.json (test game states)
# - cards.json (test card collections)

# Tests automatically clean up after themselves
# Real dependencies used (not mocks) for integration tests
```

## 🤖 AI Agent Collaboration

### Claude Code Integration
```markdown
# CLAUDE.md contains project context optimized for Claude Code
# - Current project status and phase
# - Architecture overview and patterns
# - Key commands and workflows
# - Recent changes and next steps
# - File locations and structure

# Claude Code can:
# - Understand project instantly (<30 seconds)
# - Navigate codebase using atomic design patterns
# - Follow spec-kit workflows automatically
# - Collaborate with other AI agents effectively
```

### Multi-Agent Workflows
```bash
# Agent context files for different AI assistants:
# - CLAUDE.md (Claude Code)
# - .github/copilot-instructions.md (GitHub Copilot)
# - GEMINI.md (Gemini CLI) - when applicable

# Context synchronization
bash scripts/update-agent-context.sh claude
bash scripts/update-agent-context.sh copilot
```

### Agent Communication Patterns
```markdown
# Agents share context through:
# 1. Specification documents (single source of truth)
# 2. Task lists with clear ownership
# 3. Service contracts (API definitions)
# 4. Test scenarios (behavioral specifications)
# 5. Documentation sync (consistency maintenance)
```

## 🏗️ Project Structure Navigation

### Atomic Design Pattern
```
src/
├── components/
│   ├── atoms/          # Basic UI elements (Button, Input)
│   ├── molecules/      # Combined atoms (Card, FormField)
│   ├── organisms/      # Complex components (Header, CombatArena)
│   ├── pages/         # Full page components
│   └── templates/     # Page layouts
├── services/          # Business logic and API calls
├── stores/           # Zustand state management
├── models/          # TypeScript type definitions
└── utils/           # Helper functions and utilities
```

### Spec-Kit Structure
```
specs/
├── 001-extract-current-project/    # Completed project extraction
├── 004-refactor-all-the/          # Current refactoring work
│   ├── spec.md                     # Feature specification
│   ├── plan.md                     # Implementation plan
│   ├── research.md                 # Best practices research
│   ├── data-model.md              # Entity definitions
│   ├── quickstart.md              # This guide
│   ├── tasks.md                   # Implementation tasks (future)
│   └── contracts/                 # Service interface definitions
└── [future-features]/             # Additional specs as needed
```

### Test Structure
```
tests/
├── contract/          # Service contract validation
├── integration/       # Service interaction tests
├── e2e/              # End-to-end user workflow tests
├── unit/             # Component and utility tests
├── fixtures/         # Test data and mocks
└── screenshots/      # Visual test artifacts
```

## 📋 Common Commands Reference

### Development Commands
```bash
# Core development
npm run dev            # Start development server
npm run build          # Production build
npm run preview        # Preview production build

# Code quality
npm run typecheck      # TypeScript validation
npm run lint           # ESLint checking
npm run lint:fix       # Auto-fix linting issues

# Testing
npm run test           # Run all unit tests
npm run test:watch     # Watch mode for TDD
npm run test:coverage  # Generate coverage report
npm run test:e2e       # End-to-end tests
npm run test:e2e:ui    # Interactive E2E test runner
```

### Spec-Kit Commands
```bash
# Feature workflow
bash scripts/create-new-feature.sh "feature description"
bash scripts/setup-plan.sh
bash scripts/check-task-prerequisites.sh

# Context management
bash scripts/update-agent-context.sh claude
bash scripts/update-agent-context.sh copilot

# Documentation sync
# (Commands to be implemented in Phase 2)
```

### Git Workflow
```bash
# Standard feature branch workflow
git checkout main
git pull origin main
bash scripts/create-new-feature.sh "new feature"  # Creates and switches to branch
# ... develop feature ...
git add .
git commit -m "feat: implement new feature"
git push -u origin XXX-new-feature
# Create PR through GitHub/GitLab interface
```

## 🔧 Troubleshooting

### Common Issues and Solutions

#### "Spec-kit scripts not found or not executable"
```bash
# Solution: Ensure Git Bash is available on Windows
# Check script permissions
ls -la scripts/
chmod +x scripts/*.sh  # On Unix systems
```

#### "Playwright tests failing with browser not found"
```bash
# Solution: Install Playwright browsers
npx playwright install
npx playwright install-deps  # Linux only
```

#### "TypeScript errors in IDE but not in terminal"
```bash
# Solution: Restart TypeScript service in your IDE
# VS Code: Ctrl+Shift+P → "TypeScript: Restart TS Server"
# Check tsconfig.json is properly configured
```

#### "Claude Code doesn't understand project structure"
```bash
# Solution: Update CLAUDE.md with current context
bash scripts/update-agent-context.sh claude
# Ensure CLAUDE.md is under 150 lines for optimal token usage
```

#### "Tests pass individually but fail in suite"
```bash
# Solution: Ensure test isolation
# Check for shared state between tests
# Verify test data cleanup between tests
# Use unique identifiers for test data
```

### Performance Issues

#### "Development server slow to start"
```bash
# Solution: Clear cache and node_modules
rm -rf node_modules package-lock.json
npm install
# Use npm run dev:fast if available (skips type checking)
```

#### "E2E tests taking too long"
```bash
# Solution: Optimize test execution
# Run tests in parallel: npm run test:e2e -- --workers=4
# Use headed mode for debugging: npm run test:e2e:headed
# Focus on specific tests: npm run test:e2e -- --grep "specific test"
```

## 📚 Additional Resources

### Documentation
- [Atomic Design Methodology](https://atomicdesign.bradfrost.com/)
- [Playwright Testing Guide](https://playwright.dev/docs/intro)
- [Vitest Testing Framework](https://vitest.dev/guide/)
- [Zustand State Management](https://zustand-demo.pmnd.rs/)

### Spec-Kit Resources
- Spec-kit workflow documentation (internal)
- AI agent collaboration patterns (internal)
- Constitutional development principles (internal)

### Project-Specific Guides
- `README.md` - Project overview and setup
- `CLAUDE.md` - AI agent context and current status
- `specs/001-extract-current-project/spec.md` - Original project requirements

## 🎯 Success Metrics

### Verify Your Setup is Working
- [ ] Development server starts in < 10 seconds
- [ ] All tests pass in < 2 minutes
- [ ] Claude Code understands project in < 30 seconds
- [ ] Spec-kit scripts execute without errors
- [ ] TypeScript compilation succeeds
- [ ] Playwright tests run in all browsers

### Development Velocity Indicators
- [ ] Can create new feature spec in < 5 minutes
- [ ] TDD cycle (Red-Green-Refactor) completes in < 10 minutes
- [ ] Agent collaboration reduces development time by 50%
- [ ] Documentation stays synchronized automatically
- [ ] Cross-platform development works seamlessly

---

**Need Help?** Check the troubleshooting section above or refer to project documentation in `CLAUDE.md` and `README.md`.