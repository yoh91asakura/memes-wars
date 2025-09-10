#!/usr/bin/env bash
# Automated documentation synchronization using DocumentationSyncService
# Integrates with the existing DocumentationSyncService for consistent updates
# Usage: ./sync-documentation.sh [--auto] [--json]

set -e

# Source common functions
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

REPO_ROOT=$(get_repo_root)
CURRENT_BRANCH=$(get_current_branch)

JSON_MODE=false
AUTO_MODE=false
SYNC_ALL=false

# Parse arguments
for arg in "$@"; do
    case "$arg" in
        --json) JSON_MODE=true ;;
        --auto) AUTO_MODE=true ;;
        --all) SYNC_ALL=true ;;
        --help|-h) 
            echo "Usage: $0 [--auto] [--all] [--json]"
            echo "  --auto: Run automated sync without prompts"
            echo "  --all:  Sync all documentation files"
            echo "  --json: Output results in JSON format"
            exit 0 
            ;;
    esac
done

# Get all paths
eval $(get_feature_paths)

# Define documentation files to sync
PRIMARY_CONTEXT="$REPO_ROOT/CLAUDE.md"
SECONDARY_CONTEXTS=(
    "$REPO_ROOT/.github/copilot-instructions.md"
    "$REPO_ROOT/STATUS.md"
)

# Additional files for full sync
if $SYNC_ALL; then
    SECONDARY_CONTEXTS+=(
        "$REPO_ROOT/README.md"
        "$REPO_ROOT/GEMINI.md"
    )
fi

echo "=== Documentation Synchronization Service ==="
echo "Branch: $CURRENT_BRANCH"
echo "Primary context: $PRIMARY_CONTEXT"
echo "Secondary contexts: ${SECONDARY_CONTEXTS[*]}"

# Function to check if sync is needed
check_sync_needed() {
    local primary="$1"
    local secondary="$2"
    
    if [ ! -f "$primary" ]; then
        echo "false"
        return
    fi
    
    if [ ! -f "$secondary" ]; then
        echo "true"
        return
    fi
    
    # Compare modification times
    if [ "$primary" -nt "$secondary" ]; then
        echo "true"
    else
        echo "false"
    fi
}

# Function to extract key information from primary context
extract_context_info() {
    local file="$1"
    
    if [ ! -f "$file" ]; then
        echo "ERROR: Primary context file not found: $file"
        return 1
    fi
    
    # Extract current phase
    local current_phase
    current_phase=$(grep -E "^.*Current.*Phase|^.*Phase.*:" "$file" | head -1 | sed -E 's/^[^:]*:?\s*(.*)$/\1/' || echo "Unknown")
    
    # Extract implementation status
    local impl_status
    impl_status=$(grep -E "^.*Implementation.*Status|^.*Status.*:" "$file" -A 3 | tail -3 | head -1 | sed 's/^[[:space:]]*//' || echo "Unknown")
    
    # Extract recent changes
    local recent_changes
    recent_changes=$(grep -E "^.*Recent.*Changes|^.*Changes.*:" "$file" -A 3 | tail -3 | sed 's/^[[:space:]]*//' | paste -sd '|' - || echo "")
    
    echo "CURRENT_PHASE=\"$current_phase\""
    echo "IMPL_STATUS=\"$impl_status\""
    echo "RECENT_CHANGES=\"$recent_changes\""
}

# Function to sync a single file
sync_single_file() {
    local primary="$1"
    local secondary="$2"
    local changes_info="$3"
    
    echo "Syncing: $(basename "$primary") → $(basename "$secondary")"
    
    # Extract context information
    eval "$changes_info"
    
    # Create backup
    if [ -f "$secondary" ]; then
        cp "$secondary" "$secondary.backup.$(date +%Y%m%d_%H%M%S)"
    fi
    
    # Determine sync strategy based on file type
    local sync_strategy="selective"
    case "$secondary" in
        *copilot-instructions.md)
            sync_strategy="transform"
            ;;
        *STATUS.md)
            sync_strategy="summary"
            ;;
        *README.md)
            sync_strategy="merge"
            ;;
    esac
    
    # Perform sync based on strategy
    case "$sync_strategy" in
        "transform")
            # Transform content for GitHub Copilot
            {
                echo "# GitHub Copilot Instructions"
                echo ""
                echo "## Project Context"
                echo "Branch: $CURRENT_BRANCH"
                echo "Phase: $CURRENT_PHASE"
                echo "Implementation Status: $IMPL_STATUS"
                echo ""
                echo "## Key Information"
                if [ -f "$primary" ]; then
                    # Extract tech stack and commands
                    grep -E "^##.*Tech|^##.*Stack" "$primary" -A 10 | head -10
                    echo ""
                    grep -E "^##.*Commands" "$primary" -A 10 | head -10
                fi
                echo ""
                echo "🤖 Auto-synchronized from $primary"
            } > "$secondary"
            ;;
        "summary")
            # Create summary status
            {
                echo "# Project Status"
                echo ""
                echo "**Branch**: $CURRENT_BRANCH"
                echo "**Current Phase**: $CURRENT_PHASE"
                echo "**Implementation Status**: $IMPL_STATUS"
                echo ""
                echo "## Recent Changes"
                if [ ! -z "$RECENT_CHANGES" ]; then
                    echo "$RECENT_CHANGES" | tr '|' '\n' | sed 's/^/- /'
                fi
                echo ""
                echo "**Last Updated**: $(date '+%Y-%m-%d %H:%M:%S')"
                echo "**Auto-synchronized from**: $(basename "$primary")"
            } > "$secondary"
            ;;
        "merge")
            # Merge approach for README.md
            if [ -f "$secondary" ]; then
                # Update specific sections without overwriting entire file
                local temp_file=$(mktemp)
                cp "$secondary" "$temp_file"
                
                # Update development status section if it exists
                if grep -q "## Development Status" "$temp_file"; then
                    sed -i "/## Development Status/,/^## /c\\
## Development Status\\
\\
**Current Phase**: $CURRENT_PHASE\\
**Implementation Progress**: $IMPL_STATUS\\
\\
*Last updated: $(date '+%Y-%m-%d')*\\
\\
" "$temp_file"
                fi
                
                mv "$temp_file" "$secondary"
            else
                # Create new README with basic structure
                {
                    echo "# $(basename "$REPO_ROOT")"
                    echo ""
                    echo "## Development Status"
                    echo ""
                    echo "**Current Phase**: $CURRENT_PHASE"
                    echo "**Implementation Progress**: $IMPL_STATUS"
                    echo ""
                    echo "*Auto-generated from project context*"
                } > "$secondary"
            fi
            ;;
        *)
            # Selective sync (default)
            if [ -f "$primary" ]; then
                # Copy essential sections
                {
                    echo "# Agent Context (Synced)"
                    echo ""
                    echo "**Source**: $(basename "$primary")"
                    echo "**Branch**: $CURRENT_BRANCH"
                    echo "**Phase**: $CURRENT_PHASE"
                    echo ""
                    # Copy key sections from primary
                    grep -E "^## (Tech|Commands|Current)" "$primary" -A 5 | head -20
                    echo ""
                    echo "🔄 Last sync: $(date '+%Y-%m-%d %H:%M:%S')"
                } > "$secondary"
            fi
            ;;
    esac
    
    echo "✅ Synced: $(basename "$secondary")"
    return 0
}

# Main sync process
SYNC_RESULTS=()
ERRORS=()
TOTAL_SYNCED=0

# Extract information from primary context
CONTEXT_INFO=$(extract_context_info "$PRIMARY_CONTEXT")

if [ $? -ne 0 ]; then
    echo "ERROR: Could not extract context information from primary file"
    exit 1
fi

# Process each secondary context
for secondary_file in "${SECONDARY_CONTEXTS[@]}"; do
    # Skip if file doesn't exist and we're not in sync-all mode
    if [ ! -f "$secondary_file" ] && ! $SYNC_ALL; then
        echo "Skipping non-existent file: $(basename "$secondary_file")"
        continue
    fi
    
    # Check if sync is needed
    sync_needed=$(check_sync_needed "$PRIMARY_CONTEXT" "$secondary_file")
    
    if [ "$sync_needed" = "true" ] || $AUTO_MODE || $SYNC_ALL; then
        # Create directory if needed
        mkdir -p "$(dirname "$secondary_file")"
        
        if sync_single_file "$PRIMARY_CONTEXT" "$secondary_file" "$CONTEXT_INFO"; then
            SYNC_RESULTS+=("$(basename "$secondary_file"): success")
            ((TOTAL_SYNCED++))
        else
            ERRORS+=("$(basename "$secondary_file"): failed")
        fi
    else
        echo "⏸️  Skipping $(basename "$secondary_file") (up to date)"
        SYNC_RESULTS+=("$(basename "$secondary_file"): skipped")
    fi
done

# Update agent contexts using the existing script
if $AUTO_MODE && [ -f "$SCRIPT_DIR/update-agent-context.sh" ]; then
    echo ""
    echo "=== Updating Agent Contexts ==="
    bash "$SCRIPT_DIR/update-agent-context.sh" claude
fi

# Output results
if $JSON_MODE; then
    # Build JSON array for results
    results_json=""
    for result in "${SYNC_RESULTS[@]}"; do
        file=$(echo "$result" | cut -d: -f1)
        status=$(echo "$result" | cut -d: -f2 | tr -d ' ')
        results_json="$results_json{\"file\":\"$file\",\"status\":\"$status\"},"
    done
    results_json="[${results_json%,}]"
    
    errors_json=""
    for error in "${ERRORS[@]}"; do
        errors_json="$errors_json\"$error\","
    done
    errors_json="[${errors_json%,}]"
    
    printf '{"branch":"%s","synced":%d,"results":%s,"errors":%s,"timestamp":"%s"}\n' \
        "$CURRENT_BRANCH" "$TOTAL_SYNCED" "$results_json" "$errors_json" "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
else
    echo ""
    echo "=== Sync Summary ==="
    echo "Branch: $CURRENT_BRANCH"
    echo "Files synced: $TOTAL_SYNCED"
    
    if [ ${#SYNC_RESULTS[@]} -gt 0 ]; then
        echo "Results:"
        printf '  %s\n' "${SYNC_RESULTS[@]}"
    fi
    
    if [ ${#ERRORS[@]} -gt 0 ]; then
        echo "Errors:"
        printf '  %s\n' "${ERRORS[@]}"
    fi
    
    echo "Sync completed at: $(date '+%Y-%m-%d %H:%M:%S')"
fi

# Exit with error code if there were errors
if [ ${#ERRORS[@]} -gt 0 ]; then
    exit 1
fi

exit 0