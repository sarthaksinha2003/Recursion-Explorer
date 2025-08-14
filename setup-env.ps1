Write-Host "Setting up environment variables..." -ForegroundColor Green
Write-Host ""

if (Test-Path ".env") {
    Write-Host ".env file already exists!" -ForegroundColor Yellow
    Write-Host "Please backup and remove the existing .env file first." -ForegroundColor Yellow
    Read-Host "Press Enter to continue"
    exit 1
}

try {
    Copy-Item "env.example" ".env"
    Write-Host ""
    Write-Host "Successfully created .env file!" -ForegroundColor Green
    Write-Host ""
    Write-Host "IMPORTANT: Please edit the .env file and update the following values:" -ForegroundColor Yellow
    Write-Host "- JWT_SECRET: Change to a secure random string" -ForegroundColor Cyan
    Write-Host "- EMAIL_USER: Your email address" -ForegroundColor Cyan
    Write-Host "- EMAIL_PASS: Your email app password" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "The MongoDB URL is already configured." -ForegroundColor Green
    Write-Host ""
    
    $openEditor = Read-Host "Would you like to open the .env file for editing now? (y/n)"
    if ($openEditor -eq "y" -or $openEditor -eq "Y") {
        if (Get-Command "code" -ErrorAction SilentlyContinue) {
            code .env
        } elseif (Get-Command "notepad" -ErrorAction SilentlyContinue) {
            notepad .env
        } else {
            Write-Host "Please open .env file manually in your preferred text editor." -ForegroundColor Yellow
        }
    }
    
} catch {
    Write-Host "Failed to create .env file!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Read-Host "Press Enter to continue"
    exit 1
}

Write-Host ""
Write-Host "Environment setup complete!" -ForegroundColor Green
Read-Host "Press Enter to continue" 