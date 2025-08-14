@echo off
echo Setting up environment variables...
echo.

if exist .env (
    echo .env file already exists!
    echo Please backup and remove the existing .env file first.
    pause
    exit /b 1
)

copy env.example .env
if %errorlevel% equ 0 (
    echo.
    echo Successfully created .env file!
    echo.
    echo IMPORTANT: Please edit the .env file and update the following values:
    echo - JWT_SECRET: Change to a secure random string
    echo - EMAIL_USER: Your email address
    echo - EMAIL_PASS: Your email app password
    echo.
    echo The MongoDB URL is already configured.
    echo.
    echo Press any key to open the .env file for editing...
    pause >nul
    notepad .env
) else (
    echo Failed to create .env file!
    pause
    exit /b 1
)

echo.
echo Environment setup complete!
pause 