#!/usr/bin/env node

/**
 * Spec File Watcher
 * Monitors markdown files in specs/ directory and updates CLAUDE.md
 * 
 * Usage: node scripts/spec-watcher.js [--watch] [--dry-run]
 * 
 * Features:
 * - Watches all spec.md files in specs directories
 * - Parses markdown content and extracts specific sections
 * - Updates CLAUDE.md with implementation status
 * - Debounced file change handling
 * - Cross-platform compatibility
 * - Comprehensive error handling and logging
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Dynamic import for chokidar at runtime
let chokidar = null;

class SpecWatcher {
  constructor(options = {}) {
    this.specsDir = path.resolve(process.cwd(), 'specs');
    this.claudeFile = path.resolve(process.cwd(), 'CLAUDE.md');
    this.dryRun = options.dryRun || false;
    this.watchMode = options.watch || false;
    this.debounceMs = options.debounceMs || 500;
    
    // Debounce map for file changes
    this.debounceTimers = new Map();
    
    // Track processed files to avoid infinite loops
    this.processedFiles = new Set();
    
    this.log = this.createLogger();
  }

  createLogger() {
    const logFile = path.resolve(process.cwd(), 'spec-watcher.log');
    const logStream = fs.createWriteStream(logFile, { flags: 'a' });
    
    return {
      info: (message) => {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] INFO: ${message}\n`;
        console.log(`📋 ${message}`);
        logStream.write(logMessage);
      },
      error: (message, error = null) => {
        const timestamp = new Date().toISOString();
        const errorDetails = error ? `\nError: ${error.message}\nStack: ${error.stack}` : '';
        const logMessage = `[${timestamp}] ERROR: ${message}${errorDetails}\n`;
        console.error(`❌ ${message}`);
        if (error) console.error(error);
        logStream.write(logMessage);
      },
      warn: (message) => {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] WARN: ${message}\n`;
        console.warn(`⚠️  ${message}`);
        logStream.write(logMessage);
      },
      debug: (message) => {
        if (process.env.DEBUG) {
          const timestamp = new Date().toISOString();
          const logMessage = `[${timestamp}] DEBUG: ${message}\n`;
          console.log(`🔍 ${message}`);
          logStream.write(logMessage);
        }
      }
    };
  }

  async init() {
    try {
      // Verify directories exist
      await this.ensureDirectoryStructure();
      
      // Initial scan and update
      await this.scanAndUpdate();
      
      if (this.watchMode) {
        await this.startWatching();
      }
      
      this.log.info('Spec watcher initialized successfully');
    } catch (error) {
      this.log.error('Failed to initialize spec watcher', error);
      process.exit(1);
    }
  }

  async ensureDirectoryStructure() {
    try {
      await fs.promises.access(this.specsDir);
    } catch (error) {
      throw new Error(`Specs directory not found: ${this.specsDir}`);
    }

    try {
      await fs.promises.access(this.claudeFile);
    } catch (error) {
      this.log.warn(`CLAUDE.md not found at ${this.claudeFile}, will create on update`);
    }
  }

  async scanAndUpdate() {
    try {
      const specFiles = await this.findSpecFiles();
      this.log.info(`Found ${specFiles.length} spec files to process`);
      
      if (specFiles.length === 0) {
        this.log.warn('No spec.md files found in specs directory');
        return;
      }

      const specData = await this.parseAllSpecs(specFiles);
      await this.updateClaudeFile(specData);
      
      this.log.info(`Successfully updated CLAUDE.md with data from ${specFiles.length} specs`);
    } catch (error) {
      this.log.error('Failed to scan and update specs', error);
      throw error;
    }
  }

  async findSpecFiles() {
    const specFiles = [];
    
    try {
      const specDirs = await fs.promises.readdir(this.specsDir, { withFileTypes: true });
      
      for (const dir of specDirs) {
        if (dir.isDirectory()) {
          const specFilePath = path.join(this.specsDir, dir.name, 'spec.md');
          
          try {
            await fs.promises.access(specFilePath);
            specFiles.push({
              path: specFilePath,
              dir: dir.name,
              relativePath: path.relative(process.cwd(), specFilePath)
            });
          } catch (error) {
            this.log.debug(`No spec.md found in ${dir.name}`);
          }
        }
      }
    } catch (error) {
      this.log.error('Failed to scan specs directory', error);
      throw error;
    }

    return specFiles.sort((a, b) => a.dir.localeCompare(b.dir));
  }

  async parseAllSpecs(specFiles) {
    const allSpecData = {
      lastUpdated: new Date().toISOString(),
      specs: []
    };

    for (const specFile of specFiles) {
      try {
        const content = await fs.promises.readFile(specFile.path, 'utf-8');
        const parsed = this.parseMarkdownContent(content, specFile);
        allSpecData.specs.push(parsed);
        this.log.debug(`Parsed spec: ${specFile.dir}`);
      } catch (error) {
        this.log.error(`Failed to parse spec file: ${specFile.path}`, error);
        // Continue with other files
      }
    }

    return allSpecData;
  }

  parseMarkdownContent(content, specFile) {
    const lines = content.split('\n');
    const spec = {
      name: specFile.dir,
      path: specFile.relativePath,
      sections: {},
      metadata: {
        title: '',
        status: 'unknown',
        lastModified: new Date().toISOString()
      }
    };

    let currentSection = null;
    let currentContent = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Extract title (first # heading)
      if (line.startsWith('# ') && !spec.metadata.title) {
        spec.metadata.title = line.replace('# ', '').trim();
        continue;
      }

      // Detect sections (## headings)
      if (line.startsWith('## ')) {
        // Save previous section
        if (currentSection) {
          spec.sections[currentSection] = currentContent.join('\n').trim();
        }
        
        // Start new section
        currentSection = line.replace('## ', '').trim().toLowerCase()
          .replace(/[^a-z0-9\s]/g, '')
          .replace(/\s+/g, '_');
        currentContent = [];
        continue;
      }

      // Look for status indicators
      if (line.includes('✅') || line.includes('🎯') || line.includes('🚧')) {
        if (line.includes('✅')) spec.metadata.status = 'completed';
        else if (line.includes('🎯')) spec.metadata.status = 'in_progress';
        else if (line.includes('🚧')) spec.metadata.status = 'planning';
      }

      // Add to current section
      if (currentSection) {
        currentContent.push(line);
      }
    }

    // Save final section
    if (currentSection) {
      spec.sections[currentSection] = currentContent.join('\n').trim();
    }

    return spec;
  }

  async updateClaudeFile(specData) {
    if (this.dryRun) {
      this.log.info('[DRY RUN] Would update CLAUDE.md with:');
      console.log(JSON.stringify(specData, null, 2));
      return;
    }

    try {
      // Read existing CLAUDE.md or create new
      let claudeContent = '';
      try {
        claudeContent = await fs.promises.readFile(this.claudeFile, 'utf-8');
      } catch (error) {
        this.log.info('Creating new CLAUDE.md file');
      }

      // Generate the updated implementation status section
      const updatedSection = this.generateImplementationStatusSection(specData);
      
      // Update or append the section
      const sectionMarker = '# 8. 🎯 CURRENT IMPLEMENTATION STATUS';
      const sectionEndMarker = '\n---\n';
      
      const sectionStart = claudeContent.indexOf(sectionMarker);
      if (sectionStart !== -1) {
        // Find end of section
        let sectionEnd = claudeContent.indexOf(sectionEndMarker, sectionStart + sectionMarker.length);
        if (sectionEnd === -1) {
          sectionEnd = claudeContent.length;
        } else {
          sectionEnd += sectionEndMarker.length;
        }
        
        // Replace existing section
        claudeContent = claudeContent.substring(0, sectionStart) + 
                      updatedSection + 
                      claudeContent.substring(sectionEnd);
      } else {
        // Append new section
        claudeContent += '\n\n' + updatedSection;
      }

      // Write updated content
      await fs.promises.writeFile(this.claudeFile, claudeContent, 'utf-8');
      this.log.info(`Updated CLAUDE.md with latest spec data (${specData.specs.length} specs processed)`);
      
    } catch (error) {
      this.log.error('Failed to update CLAUDE.md', error);
      throw error;
    }
  }

  generateImplementationStatusSection(specData) {
    const timestamp = new Date().toLocaleString();
    
    let section = `# 8. 🎯 CURRENT IMPLEMENTATION STATUS\n\n`;
    section += `*Last updated: ${timestamp} - Auto-generated from spec files*\n\n`;
    
    // Summary
    const completedSpecs = specData.specs.filter(s => s.metadata.status === 'completed').length;
    const inProgressSpecs = specData.specs.filter(s => s.metadata.status === 'in_progress').length;
    const totalSpecs = specData.specs.length;
    
    section += `## 📊 Implementation Overview\n\n`;
    section += `- **Total Specifications**: ${totalSpecs}\n`;
    section += `- **Completed**: ${completedSpecs} ✅\n`;
    section += `- **In Progress**: ${inProgressSpecs} 🎯\n`;
    section += `- **Completion Rate**: ${Math.round((completedSpecs / totalSpecs) * 100)}%\n\n`;
    
    // Individual spec status
    section += `## 📋 Specification Status\n\n`;
    
    for (const spec of specData.specs) {
      const statusIcon = {
        completed: '✅',
        in_progress: '🎯', 
        planning: '🚧',
        unknown: '❓'
      }[spec.metadata.status] || '❓';
      
      section += `### ${statusIcon} ${spec.metadata.title || spec.name}\n`;
      section += `**Path**: \`${spec.path}\`  \n`;
      section += `**Status**: ${spec.metadata.status.replace('_', ' ')}  \n`;
      
      // Add key sections if available
      if (spec.sections.overview || spec.sections.summary) {
        const overview = spec.sections.overview || spec.sections.summary;
        const firstLine = overview.split('\n')[0];
        if (firstLine) {
          section += `**Overview**: ${firstLine}  \n`;
        }
      }
      
      section += '\n';
    }
    
    // Auto-generated footer
    section += `---\n`;
    section += `*This section is automatically maintained by the spec watcher system*\n`;
    
    return section;
  }

  async startWatching() {
    this.log.info('Starting file watcher...');
    
    // Try to load chokidar dynamically
    try {
      const chokidarModule = await import('chokidar');
      chokidar = chokidarModule.default;
    } catch (error) {
      this.log.warn('chokidar not found, using fs.watch (less reliable)');
    }
    
    // Watch pattern for all spec.md files
    const watchPattern = path.join(this.specsDir, '*/spec.md');
    
    if (chokidar) {
      // Use chokidar for better reliability
      const watcher = chokidar.watch(watchPattern, {
        ignored: /node_modules/,
        persistent: true,
        ignoreInitial: true,
        awaitWriteFinish: {
          stabilityThreshold: 300,
          pollInterval: 100
        }
      });

      watcher
        .on('change', (filePath) => this.handleFileChange(filePath, 'changed'))
        .on('add', (filePath) => this.handleFileChange(filePath, 'added'))
        .on('unlink', (filePath) => this.handleFileChange(filePath, 'removed'))
        .on('error', (error) => this.log.error('Watcher error', error));

      this.log.info(`Watching spec files with chokidar: ${watchPattern}`);
    } else {
      // Fallback to fs.watch
      await this.startFsWatch();
    }

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      this.log.info('Shutting down spec watcher...');
      process.exit(0);
    });

    // Keep the process alive
    this.log.info('Spec watcher is running. Press Ctrl+C to stop.');
  }

  async startFsWatch() {
    const specDirs = await fs.promises.readdir(this.specsDir, { withFileTypes: true });
    
    for (const dir of specDirs) {
      if (dir.isDirectory()) {
        const specFile = path.join(this.specsDir, dir.name, 'spec.md');
        
        try {
          await fs.promises.access(specFile);
          
          // Watch the specific file
          fs.watchFile(specFile, { interval: 1000 }, (curr, prev) => {
            if (curr.mtime !== prev.mtime) {
              this.handleFileChange(specFile, 'changed');
            }
          });
          
          this.log.debug(`Watching: ${specFile}`);
        } catch (error) {
          // File doesn't exist, skip
        }
      }
    }
  }

  handleFileChange(filePath, event) {
    const relativePath = path.relative(process.cwd(), filePath);
    this.log.info(`File ${event}: ${relativePath}`);
    
    // Debounce rapid file changes
    const debounceKey = filePath;
    if (this.debounceTimers.has(debounceKey)) {
      clearTimeout(this.debounceTimers.get(debounceKey));
    }
    
    const timer = setTimeout(async () => {
      this.debounceTimers.delete(debounceKey);
      
      // Prevent processing the same file multiple times
      if (this.processedFiles.has(filePath)) {
        return;
      }
      
      this.processedFiles.add(filePath);
      
      try {
        await this.scanAndUpdate();
      } catch (error) {
        this.log.error(`Failed to process file change: ${relativePath}`, error);
      } finally {
        // Clear after a delay to allow for rapid changes
        setTimeout(() => {
          this.processedFiles.delete(filePath);
        }, 5000);
      }
    }, this.debounceMs);
    
    this.debounceTimers.set(debounceKey, timer);
  }
}

// CLI Interface
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    watch: false,
    dryRun: false,
    help: false
  };

  for (const arg of args) {
    switch (arg) {
      case '--watch':
      case '-w':
        options.watch = true;
        break;
      case '--dry-run':
      case '-d':
        options.dryRun = true;
        break;
      case '--help':
      case '-h':
        options.help = true;
        break;
      default:
        console.error(`Unknown option: ${arg}`);
        options.help = true;
    }
  }

  return options;
}

function showHelp() {
  console.log(`
Spec File Watcher - Monitors markdown specs and updates CLAUDE.md

Usage: node scripts/spec-watcher.js [options]

Options:
  --watch, -w      Watch for file changes (default: single run)
  --dry-run, -d    Show what would be updated without making changes
  --help, -h       Show this help message

Examples:
  node scripts/spec-watcher.js                    # Single update run
  node scripts/spec-watcher.js --watch            # Continuous watching
  node scripts/spec-watcher.js --dry-run          # Preview changes
  
Environment Variables:
  DEBUG=1                                         # Enable debug logging

The watcher monitors all specs/*/spec.md files and updates the 
"CURRENT IMPLEMENTATION STATUS" section in CLAUDE.md automatically.
  `);
}

// Main execution
async function main() {
  const options = parseArgs();
  
  if (options.help) {
    showHelp();
    return;
  }

  try {
    const watcher = new SpecWatcher(options);
    await watcher.init();
    
    if (!options.watch) {
      console.log('✅ Single run completed successfully');
    }
  } catch (error) {
    console.error('❌ Spec watcher failed:', error.message);
    process.exit(1);
  }
}

// Only run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default SpecWatcher;