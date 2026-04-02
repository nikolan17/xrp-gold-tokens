# ═══════════════════════════════════════════════════
#   XRP Gold Tokens — Add Affiliate Route
#   Double-click add-affiliate.bat to run this
# ═══════════════════════════════════════════════════

$Host.UI.RawUI.WindowTitle = "XRP Gold Tokens — Add Affiliate"
Clear-Host

Write-Host ""
Write-Host "  ╔══════════════════════════════════════════╗" -ForegroundColor Yellow
Write-Host "  ║     XRP GOLD TOKENS — AFFILIATE TOOL     ║" -ForegroundColor Yellow
Write-Host "  ╚══════════════════════════════════════════╝" -ForegroundColor Yellow
Write-Host ""

# ── Show existing routes ──────────────────────────
$htmlPath  = "C:\Users\Dell\xrp-gold-token.html"
$deployDir = "C:\Users\Dell\xrp-deploy"

Write-Host "  Current affiliate routes:" -ForegroundColor Cyan
$content = Get-Content $htmlPath -Raw
$matches_ = [regex]::Matches($content, "(\w+):\s*'(https?://[^']+)'")
foreach ($m in $matches_) {
    if ($m.Groups[1].Value -notin @('BASE_URL','_path','_match','TARGET_URL')) {
        Write-Host "    /$($m.Groups[1].Value)  →  $($m.Groups[2].Value)" -ForegroundColor White
    }
}

Write-Host ""
Write-Host "  ─────────────────────────────────────────────" -ForegroundColor DarkGray
Write-Host ""

# ── Input ─────────────────────────────────────────
$route = Read-Host "  Enter route code (e.g. MV, BB, XY)"
$route = $route.Trim().ToUpper()

if ([string]::IsNullOrWhiteSpace($route)) {
    Write-Host "  [ERROR] Route code cannot be empty." -ForegroundColor Red
    pause; exit
}

Write-Host ""
$url = Read-Host "  Enter destination URL"
$url = $url.Trim()

if ([string]::IsNullOrWhiteSpace($url)) {
    Write-Host "  [ERROR] URL cannot be empty." -ForegroundColor Red
    pause; exit
}

Write-Host ""
Write-Host "  Adding route: /$route  →  $url" -ForegroundColor Green
Write-Host ""

# ── Check if route already exists ─────────────────
if ($content -match "${route}:\s*'https?://") {
    Write-Host "  [INFO] Route /$route already exists — updating it." -ForegroundColor Yellow
    $content = $content -replace "${route}:\s*'[^']+'", "${route}: '$url'"
} else {
    # Insert new route before the closing }; of ROUTES object
    $content = $content -replace "(BB:\s*'[^']+',)", "`$1`n  ${route}: '$url',"
    # Fallback: insert before BASE_URL line if BB not found
    if ($content -notmatch "${route}:\s*'$url'") {
        $content = $content -replace "(const BASE_URL)", "  ${route}: '$url',`n`$1"
    }
    # Update the regex match pattern to include new route
    $content = $content -replace '\(BV\|MV\|BB\)', "(BV|MV|BB|$route)"
}

# ── Save main HTML ─────────────────────────────────
Set-Content -Path $htmlPath -Value $content -Encoding UTF8
Write-Host "  [OK] HTML updated." -ForegroundColor Green

# ── Copy & fix paths for deploy ───────────────────
Copy-Item $htmlPath "$deployDir\index.html" -Force
$deploy = Get-Content "$deployDir\index.html" -Raw
$deploy = $deploy -replace 'Downloads/frontsidepng\.png',  'frontsidepng.png'
$deploy = $deploy -replace 'Downloads/backsidepng\.png',   'backsidepng.png'
$deploy = $deploy -replace 'OneDrive/Desktop/dashboard-deploy/qfslogosajt\.png', 'qfslogosajt.png'
Set-Content -Path "$deployDir\index.html" -Value $deploy -Encoding UTF8
Write-Host "  [OK] Deploy folder ready." -ForegroundColor Green

# ── Deploy to Vercel ──────────────────────────────
Write-Host ""
Write-Host "  Deploying to Vercel..." -ForegroundColor Cyan
Set-Location $deployDir
$result = & vercel --prod --yes 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "  ╔══════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "  ║           DEPLOYED SUCCESSFULLY!         ║" -ForegroundColor Green
    Write-Host "  ╚══════════════════════════════════════════╝" -ForegroundColor Green
    Write-Host ""
    Write-Host "  Live at: https://xrpgoldtokens.com/$route" -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "  [ERROR] Deploy failed. Output:" -ForegroundColor Red
    Write-Host $result -ForegroundColor Red
}

Write-Host ""
Write-Host "  Press any key to close..." -ForegroundColor DarkGray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
