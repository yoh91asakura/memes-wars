# Cross-Platform npm Scripts Guide

This project uses cross-platform tools to ensure all scripts work identically on Windows, macOS, and Linux.

## Key Cross-Platform Tools Used

### 1. `cross-env` - Environment Variables
Sets environment variables consistently across platforms:
```json
"dev": "cross-env NODE_ENV=development vite"
```
- **Windows**: Uses `set NODE_ENV=development && vite`
- **Unix**: Uses `NODE_ENV=development vite`

### 2. `rimraf` - File/Directory Deletion
Cross-platform alternative to `rm -rf`:
```json
"clean": "rimraf dist node_modules/.cache"
```
- Works on all platforms without shell differences
- Handles locked files better than native commands

### 3. `shx` - Shell Commands
Portable Unix commands for Windows:
```json
"mkdir": "shx mkdir -p",
"echo": "shx echo"
```
- Provides Unix-like commands on Windows
- Consistent behavior across platforms

### 4. `cpx2` - File Copying
Cross-platform file copying with glob support:
```json
"copy:assets": "cpx2 \"src/assets/**/*\" \"dist/assets\""
```
- Supports complex glob patterns
- Preserves file permissions and timestamps

### 5. `concurrently` - Parallel Execution
Run multiple commands simultaneously:
```json
"validate": "concurrently \"npm run typecheck\" \"npm run lint\" \"npm run format:check\""
```
- Color-coded output
- Fails fast if any command fails

## Script Categories

### Development Scripts
```bash
npm run dev           # Development server with NODE_ENV=development
npm run dev:fast      # Fast dev server with host binding
npm run dev:debug     # Development with debug output
npm run build         # Production build with typecheck
npm run preview       # Preview production build
```

### Testing Scripts
```bash
npm run test          # Unit tests with proper NODE_ENV
npm run test:watch    # Watch mode for TDD
npm run test:coverage # Coverage reports
npm run test:ci       # CI-optimized tests
npm run test:e2e      # End-to-end tests
```

### Code Quality Scripts
```bash
npm run lint          # ESLint check
npm run lint:fix      # Auto-fix linting issues
npm run typecheck     # TypeScript validation
npm run format        # Format code with Prettier
npm run validate      # Run all quality checks in parallel
```

### Cleaning Scripts
```bash
npm run clean         # Remove build artifacts
npm run clean:all     # Nuclear clean (includes node_modules)
npm run clean:cache   # Clear caches only
npm run clean:install # Clean and reinstall dependencies
```

### Spec Management Scripts
```bash
npm run spec:create   # Create new feature specification
npm run spec:plan     # Setup implementation plan
npm run spec:check    # Check task prerequisites
npm run spec:update   # Update agent context
```

## Advanced Cross-Platform Patterns

### 1. Conditional Commands by Platform
For platform-specific behavior, use the Node.js script runner:
```javascript
// In scripts/run-script.js
const isWindows = process.platform === 'win32';
if (isWindows) {
  // Windows-specific logic
} else {
  // Unix-specific logic
}
```

### 2. Environment-Specific Builds
```json
"build:dev": "cross-env NODE_ENV=development npm run build",
"build:prod": "cross-env NODE_ENV=production npm run build",
"build:staging": "cross-env NODE_ENV=staging npm run build"
```

### 3. Path Handling
Always use forward slashes in glob patterns, even on Windows:
```json
"format": "prettier --write \"src/**/*.{ts,tsx,json,md}\""
```

### 4. Complex Script Chains
Use `&&` for sequential execution and `concurrently` for parallel:
```json
"prebuild": "npm run typecheck",
"build": "vite build",
"postbuild": "npm run copy:assets"
```

## Troubleshooting

### Common Issues

1. **Script not found on Windows**
   - Ensure Git Bash is installed for .sh scripts
   - Use the Node.js script runner for complex scripts

2. **Permission errors**
   - Use `shx` commands instead of native shell commands
   - Ensure scripts have proper permissions: `chmod +x script.sh`

3. **Path issues**
   - Use forward slashes in npm scripts
   - Use `path.join()` in Node.js scripts for proper path handling

4. **Environment variables**
   - Always use `cross-env` for setting environment variables
   - Quote values with spaces: `cross-env MESSAGE="Hello World"`

### Testing Cross-Platform Compatibility

Run these tests to verify cross-platform functionality:

```bash
# Test basic commands
npm run echo "Test message"
npm run mkdir temp-test
npm run clean:cache

# Test environment variables
npm run dev:debug  # Should show DEBUG=* in environment

# Test parallel execution
npm run validate   # Should run multiple commands simultaneously
```

## Best Practices

1. **Always use cross-env** for environment variables
2. **Prefer dedicated tools** over shell commands (`rimraf` vs `rm -rf`)
3. **Test on multiple platforms** if possible
4. **Use consistent quoting** in package.json scripts
5. **Document platform requirements** in README.md
6. **Keep complex logic in Node.js scripts** rather than npm scripts

This setup ensures your development workflow is identical across Windows, macOS, and Linux, making collaboration seamless and reducing platform-specific bugs.