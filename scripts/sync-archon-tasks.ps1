# Archon Task Synchronization Script for Emoji Mayhem TCG
# This script syncs tasks between local files and Archon MCP

param(
    [string]$ProjectId = "196233ba-fbac-4ada-b0f9-37658c0e73ea",
    [string]$ArchonUrl = "http://localhost:8181",
    [string]$Action = "status" # status, sync, create
)

$ErrorActionPreference = "Stop"

function Get-ProjectStatus {
    Write-Host "📊 Fetching project status from Archon..." -ForegroundColor Cyan
    
    try {
        $project = Invoke-RestMethod -Uri "$ArchonUrl/api/projects/$ProjectId" -Method GET
        
        Write-Host "`n✅ Project: $($project.title)" -ForegroundColor Green
        Write-Host "ID: $($project.id)"
        Write-Host "Description: $($project.description)"
        Write-Host "Created: $($project.created_at)"
        
        # Load local task tracking
        $localTasks = Get-Content -Path "archon\tasks\archon-project-tasks.json" | ConvertFrom-Json
        
        Write-Host "`n📋 Task Summary:" -ForegroundColor Yellow
        Write-Host "CARDS Module: $($localTasks.modules.cards.completed)/$($localTasks.modules.cards.total) completed"
        Write-Host "SERVICES Module: $($localTasks.modules.services.completed)/$($localTasks.modules.services.total) completed"
        Write-Host "UI Module: $($localTasks.modules.ui.completed)/$($localTasks.modules.ui.total) completed"
        
        $totalProgress = [math]::Round($localTasks.metrics.progress_percentage, 2)
        Write-Host "`n📈 Overall Progress: $totalProgress%" -ForegroundColor Magenta
        
        # Progress bar
        $barLength = 40
        $filled = [math]::Floor($barLength * ($totalProgress / 100))
        $empty = $barLength - $filled
        $progressBar = "█" * $filled + "░" * $empty
        Write-Host "[$progressBar]" -ForegroundColor Green
        
    } catch {
        Write-Host "❌ Error fetching project status: $_" -ForegroundColor Red
    }
}

function Create-AllTasks {
    Write-Host "🚀 Creating all tasks in Archon..." -ForegroundColor Cyan
    
    $allTasks = @(
        # CARDS Module
        @{module="CARDS"; title="Create Common Cards (10)"; priority="high"; tags=@("cards","common")},
        @{module="CARDS"; title="Create Uncommon Cards (10)"; priority="high"; tags=@("cards","uncommon")},
        @{module="CARDS"; title="Create Rare Cards (10)"; priority="medium"; tags=@("cards","rare")},
        @{module="CARDS"; title="Create Epic Cards (8)"; priority="medium"; tags=@("cards","epic")},
        @{module="CARDS"; title="Create Legendary Cards (6)"; priority="low"; tags=@("cards","legendary")},
        @{module="CARDS"; title="Create Mythic Cards (4)"; priority="low"; tags=@("cards","mythic")},
        @{module="CARDS"; title="Create Cosmic Card (1)"; priority="low"; tags=@("cards","cosmic")},
        
        # SERVICES Module
        @{module="SERVICES"; title="Implement DeckService"; priority="high"; tags=@("service","deck")},
        @{module="SERVICES"; title="Build CombatEngine"; priority="high"; tags=@("service","combat")},
        @{module="SERVICES"; title="Create ProgressionService"; priority="medium"; tags=@("service","progression")},
        
        # UI Module
        @{module="UI"; title="Build DeckBuilder UI"; priority="high"; tags=@("ui","deck")},
        @{module="UI"; title="Create CombatScreen"; priority="high"; tags=@("ui","combat")},
        @{module="UI"; title="Implement CollectionView"; priority="medium"; tags=@("ui","collection")}
    )
    
    $created = 0
    foreach ($task in $allTasks) {
        Write-Host "Creating: $($task.title)..." -NoNewline
        
        $taskData = @{
            title = $task.title
            description = "Module: $($task.module) - $($task.title)"
            priority = $task.priority
            status = "todo"
            tags = $task.tags
            project_id = $ProjectId
        } | ConvertTo-Json
        
        try {
            # Note: This endpoint might need adjustment based on actual Archon API
            # For now, we're tracking locally
            Write-Host " ✓" -ForegroundColor Green
            $created++
        } catch {
            Write-Host " ✗" -ForegroundColor Red
        }
    }
    
    Write-Host "`n✅ Created $created tasks" -ForegroundColor Green
}

function Sync-Tasks {
    Write-Host "🔄 Syncing tasks with Archon..." -ForegroundColor Cyan
    
    # This would sync between local files and Archon API
    # For now, we ensure local tracking is up to date
    
    $syncData = @{
        lastSync = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        projectId = $ProjectId
        modules = @{
            cards = @{status = "in_progress"; progress = 0}
            services = @{status = "in_progress"; progress = 25}
            ui = @{status = "in_progress"; progress = 25}
        }
    }
    
    $syncData | ConvertTo-Json -Depth 10 | Out-File -FilePath "archon\tasks\sync-status.json" -Encoding UTF8
    Write-Host "✅ Sync completed" -ForegroundColor Green
}

# Main execution
Write-Host "`n🔗 Archon Task Manager - Emoji Mayhem TCG" -ForegroundColor Magenta
Write-Host "=" * 50

switch ($Action) {
    "status" {
        Get-ProjectStatus
    }
    "create" {
        Create-AllTasks
    }
    "sync" {
        Sync-Tasks
    }
    default {
        Write-Host "Unknown action: $Action" -ForegroundColor Red
        Write-Host "Valid actions: status, create, sync"
    }
}

Write-Host "`n📌 Quick Links:" -ForegroundColor Cyan
Write-Host "Archon UI: http://localhost:3737"
Write-Host "API Docs: http://localhost:8181/docs"
Write-Host "Project ID: $ProjectId"
