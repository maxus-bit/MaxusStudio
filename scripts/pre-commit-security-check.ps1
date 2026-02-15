# Security check script for PowerShell
# Usage: .\scripts\pre-commit-security-check.ps1

Write-Host "Security check before commit..." -ForegroundColor Cyan

$errors = 0

# 1. Check Firebase API keys (but not YOUR_API_KEY or PLACEHOLDER)
Write-Host -NoNewLine "Checking Firebase API keys... "
$staged = git diff --cached
$hasBadKey = $false
foreach ($line in $staged -split "`n") {
    if ($line -match "AIzaSy" -and $line -notmatch "YOUR_API_KEY" -and $line -notmatch "PLACEHOLDER") {
        $hasBadKey = $true
        break
    }
}
if ($hasBadKey) {
    Write-Host "ERROR: Firebase API keys detected!" -ForegroundColor Red
    $errors++
} else {
    Write-Host "OK" -ForegroundColor Green
}

# 2. Check Stripe keys (but not PLACEHOLDER or test placeholders)
Write-Host -NoNewLine "Checking Stripe keys... "
$hasBadKey = $false
foreach ($line in $staged -split "`n") {
    if ($line -match "sk_(live|test)_" -and $line -notmatch "PLACEHOLDER" -and $line -notmatch "YOUR_STRIPE") {
        # This is a real stripe key
        if ($line -match "sk_live_") {
            # Live key is critical!
            $hasBadKey = $true
            break
        }
        # Test keys are less critical but still warn
        if ($line -match "sk_test_[A-Za-z0-9]{20,}") {
            $hasBadKey = $true
            break
        }
    }
}
if ($hasBadKey) {
    Write-Host "ERROR: Stripe keys detected!" -ForegroundColor Red
    $errors++
} else {
    Write-Host "OK" -ForegroundColor Green
}

# 3. Check environment.development.ts
Write-Host -NoNewLine "Checking environment.development.ts... "
$files = git diff --cached --name-only
$isDangerousFile = $files | Where-Object { $_ -match "environment\.development\.ts$" }
if ($isDangerousFile) {
    Write-Host "ERROR: Trying to commit environment.development.ts!" -ForegroundColor Red
    Write-Host "Use: git reset src/environments/environment.development.ts" -ForegroundColor Yellow
    $errors++
} else {
    Write-Host "OK" -ForegroundColor Green
}

# 4. Check functions/.env
Write-Host -NoNewLine "Checking functions/.env... "
$isDangerousFile = $files | Where-Object { $_ -match "functions/\.env" -and $_ -notmatch "\.env\.example" }
if ($isDangerousFile) {
    Write-Host "ERROR: Trying to commit functions/.env!" -ForegroundColor Red
    Write-Host "Use: git reset functions/.env" -ForegroundColor Yellow
    $errors++
} else {
    Write-Host "OK" -ForegroundColor Green
}

# 5. Check .firebase/ files
Write-Host -NoNewLine "Checking .firebase/ folder... "
$isDangerousFile = $files | Where-Object { $_ -match "^\.firebase/" }
if ($isDangerousFile) {
    Write-Host "ERROR: Trying to commit .firebase/ files!" -ForegroundColor Red
    $errors++
} else {
    Write-Host "OK" -ForegroundColor Green
}

# 6. Check node_modules
Write-Host -NoNewLine "Checking node_modules... "
$isDangerousFile = $files | Where-Object { $_ -match "node_modules/" }
if ($isDangerousFile) {
    Write-Host "ERROR: Trying to commit node_modules!" -ForegroundColor Red
    $errors++
} else {
    Write-Host "OK" -ForegroundColor Green
}

# Final result
Write-Host ""
if ($errors -eq 0) {
    Write-Host "All checks passed! Commit approved." -ForegroundColor Green
    exit 0
} else {
    Write-Host "Found $errors security errors!" -ForegroundColor Red
    Write-Host "Fix issues and try again." -ForegroundColor Yellow
    exit 1
}



