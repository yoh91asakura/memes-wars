param(
    [string]$Action = "sync",
    [string]$TaskPath = "",
    [string]$ArchonUrl = "http://localhost:8181"
)

# Configuration
$ProjectName = "emoji-mayhem-tcg"
$TasksDir = Join-Path $PSScriptRoot "..\archon\tasks"

function Get-AllTasks {
    $tasks = @()
    
    # Récupérer tous les fichiers .md dans les modules
    $taskFiles = Get-ChildItem -Path "$TasksDir\modules" -Filter "*.md" -Recurse -ErrorAction SilentlyContinue
    
    foreach ($file in $taskFiles) {
        $relativePath = $file.FullName.Replace("$TasksDir\", "").Replace("\", "/")
        $content = Get-Content $file.FullName -Raw
        
        # Extraire le titre de la tâche
        if ($content -match "^#\s+(.+)$") {
            $title = $Matches[1]
        } else {
            $title = $file.BaseName
        }
        
        # Déterminer le module
        $module = if ($relativePath -match "modules/([^/]+)/") { $Matches[1] } else { "general" }
        
        # Déterminer le statut
        $status = if ($content -match "status:\s*(\w+)") { $Matches[1] } else { "TODO" }
        
        $tasks += @{
            id = $file.BaseName
            title = $title
            path = $relativePath
            module = $module
            status = $status
            content = $content
        }
    }
    
    return $tasks
}

function Sync-TasksToArchon {
    Write-Host "🔄 Synchronisation des tâches avec Archon..." -ForegroundColor Cyan
    
    $tasks = Get-AllTasks
    
    if ($tasks.Count -eq 0) {
        Write-Host "⚠️ Aucune tâche trouvée dans $TasksDir" -ForegroundColor Yellow
        return
    }
    
    Write-Host "📋 $($tasks.Count) tâches trouvées:" -ForegroundColor Green
    
    foreach ($task in $tasks) {
        Write-Host "  - [$($task.status)] $($task.title) ($($task.module))" -ForegroundColor Gray
        
        # Créer le payload pour l'API Archon
        $payload = @{
            project = $ProjectName
            task_id = $task.id
            title = $task.title
            module = $task.module
            status = $task.status
            content = $task.content
            path = $task.path
        } | ConvertTo-Json -Depth 10
        
        try {
            # Envoyer à Archon via l'API
            $response = Invoke-RestMethod -Uri "$ArchonUrl/api/tasks" -Method Post -Body $payload -ContentType "application/json" -ErrorAction Stop
            Write-Host "    ✅ Synchronisé" -ForegroundColor Green
        } catch {
            Write-Host "    ❌ Erreur: $_" -ForegroundColor Red
        }
    }
    
    Write-Host "`n✨ Synchronisation terminée!" -ForegroundColor Green
}

function Show-TaskStatus {
    Write-Host "`n📊 État des tâches:" -ForegroundColor Cyan
    Write-Host "==================" -ForegroundColor Cyan
    
    $tasks = Get-AllTasks
    $grouped = $tasks | Group-Object -Property module
    
    foreach ($group in $grouped) {
        Write-Host "`n📦 $($group.Name.ToUpper())" -ForegroundColor Yellow
        foreach ($task in $group.Group) {
            $statusIcon = switch ($task.status) {
                "DONE" { "✅" }
                "IN_PROGRESS" { "🔄" }
                "BLOCKED" { "🚫" }
                default { "⬜" }
            }
            Write-Host "  $statusIcon $($task.title)" -ForegroundColor White
        }
    }
    
    # Statistiques
    $stats = $tasks | Group-Object -Property status
    Write-Host "`n📈 Statistiques:" -ForegroundColor Cyan
    foreach ($stat in $stats) {
        Write-Host "  - $($stat.Name): $($stat.Count)" -ForegroundColor Gray
    }
}

function Create-NewTask {
    param([string]$Module, [string]$TaskName)
    
    if (-not $Module -or -not $TaskName) {
        Write-Host "❌ Usage: -Action create -TaskPath 'module/task-name'" -ForegroundColor Red
        return
    }
    
    $moduleDir = Join-Path $TasksDir "modules\$Module"
    if (-not (Test-Path $moduleDir)) {
        New-Item -ItemType Directory -Path $moduleDir -Force | Out-Null
    }
    
    $taskFile = Join-Path $moduleDir "$TaskName.md"
    
    if (Test-Path $taskFile) {
        Write-Host "⚠️ La tâche existe déjà: $taskFile" -ForegroundColor Yellow
        return
    }
    
    # Template de tâche
    $template = @"
# $TaskName

## 🎯 Objectif
[Décrire l'objectif de cette tâche]

## 📋 Description
[Description détaillée de ce qui doit être fait]

## ✅ Critères d'acceptation
- [ ] Critère 1
- [ ] Critère 2
- [ ] Critère 3

## 🔧 Implémentation
\`\`\`typescript
// Code à implémenter
\`\`\`

## 🧪 Tests
\`\`\`typescript
// Tests à écrire
\`\`\`

## 📝 Metadata
- **Module**: $Module
- **Status**: TODO
- **Priority**: P1
- **Assignee**: Non assigné
- **Created**: $(Get-Date -Format "yyyy-MM-dd")
"@
    
    Set-Content -Path $taskFile -Value $template
    Write-Host "✅ Tâche créée: $taskFile" -ForegroundColor Green
}

# Exécution principale
switch ($Action.ToLower()) {
    "sync" {
        Sync-TasksToArchon
    }
    "status" {
        Show-TaskStatus
    }
    "create" {
        if ($TaskPath -match "([^/]+)/(.+)") {
            Create-NewTask -Module $Matches[1] -TaskName $Matches[2]
        } else {
            Write-Host "❌ Format invalide. Utilisez: module/task-name" -ForegroundColor Red
        }
    }
    "list" {
        $tasks = Get-AllTasks
        $tasks | ForEach-Object {
            Write-Host "$($_.module)/$($_.id): $($_.title) [$($_.status)]"
        }
    }
    default {
        Write-Host "Actions disponibles: sync, status, create, list" -ForegroundColor Yellow
    }
}
