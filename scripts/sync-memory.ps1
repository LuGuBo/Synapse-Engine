# scripts/sync-memory.ps1
# PowerShell automation script for Synapse Engine Zettelkasten Vault & Graphify synchronization.
# Compliant with Windows execution and project-level rules.

$ErrorActionPreference = "Stop"

Write-Host "[SYNC] Starting Synapse Engine local memory synchronization..." -ForegroundColor Cyan

# 1. Update Graphify AST Graph
Write-Host "[GRAPH] Updating Graphify AST Graph..." -ForegroundColor Yellow
try {
    npm run harness:graphify
    Write-Host "[OK] Graphify AST updated successfully." -ForegroundColor Green
} catch {
    Write-Error "[FAIL] Failed to update Graphify AST. Make sure node and project packages are set up."
}

# 2. Check Directory Junction Integrity
Write-Host "[DIR] Verifying Directory Junction integrity..." -ForegroundColor Yellow
$vaultLinksPath = Join-Path (Get-Location) ".obsidian-vault\graphify-links"
if (Test-Path $vaultLinksPath) {
    $item = Get-Item $vaultLinksPath
    if ($item.Attributes -match "ReparsePoint") {
        Write-Host "[OK] Junction link verified: .obsidian-vault/graphify-links -> graphify-out" -ForegroundColor Green
    } else {
        Write-Warning "[WARN] Warning: .obsidian-vault/graphify-links exists but is NOT a Junction link."
    }
} else {
    Write-Error "[FAIL] Directory Junction .obsidian-vault/graphify-links is missing."
}

# 3. Validate Markdown files metadata (Frontmatter checking)
Write-Host "[AUDIT] Auditing Markdown notes in Obsidian Vault..." -ForegroundColor Yellow
$vaultDir = Join-Path (Get-Location) ".obsidian-vault"
$mdFiles = Get-ChildItem -Path $vaultDir -Filter "*.md" -Recurse

$valid = $true
$fileCount = 0

foreach ($file in $mdFiles) {
    $fileCount++
    $content = Get-Content -Path $file.FullName -Raw
    
    # If file contains YAML frontmatter, check format
    if ($content -match "(?s)^---\r?\n(.*?)\r?\n---\r?\n") {
        $frontmatterText = $Matches[1]
        $lines = $frontmatterText -split "\r?\n"
        foreach ($line in $lines) {
            if ($line.Trim() -ne "" -and $line -notmatch "^[a-zA-Z0-9_\-]+:\s*.*" -and $line -notmatch "^\s*-\s+.*") {
                Write-Host "[FAIL] Invalid Frontmatter YAML formatting in file: $($file.FullName) at line: '$line'" -ForegroundColor Red
                $valid = $false
            }
        }
    }
}

if ($valid) {
    Write-Host "[OK] Audit completed successfully! Verified $fileCount Markdown files." -ForegroundColor Green
} else {
    Write-Error "[FAIL] Metadata validation failed! Please correct Markdown YAML frontmatter files."
}

Write-Host "[DONE] Memory synchronization completed!" -ForegroundColor Cyan
