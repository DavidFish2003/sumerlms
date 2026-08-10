@echo off
echo ===================================================
echo   SummerLMS Git & GitHub Deployment Assistant
echo ===================================================
echo.

:: Check if git is initialized
if not exist .git (
    echo [1/3] Initializing local Git repository...
    git init
    git branch -M main
) else (
    echo [1/3] Git repository already initialized.
)

:: Prompt for git user config if missing
git config user.name >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo It looks like your Git user name is not set up yet.
    set /p gitname="Enter your Name (for Git commits): "
    git config --global user.name "%gitname%"
)
git config user.email >nul 2>&1
if %errorlevel% neq 0 (
    set /p gitemail="Enter your Email (for Git commits): "
    git config --global user.email "%gitemail%"
)

:: Stage and commit all files
echo.
echo [2/3] Staging and committing files...
git add .
git commit -m "Initial commit of Bakersfield K-12 Interactive Examination Portal"

:: Prompt for GitHub Remote Repository URL
echo.
echo ===================================================
echo   To deploy, you need a GitHub Repository.
echo   1. Go to https://github.com/new
echo   2. Create a public repository (do NOT add README, .gitignore or license)
echo   3. Copy the HTTPS link (e.g., https://github.com/your-username/your-repo.git)
echo ===================================================
echo.
set /p repourl="Paste your GitHub repository URL: "

if "%repourl%"=="" (
    echo No repository URL provided. Commit completed locally. You can push manually later.
    goto :end
)

:: Set remote origin and push
echo.
echo [3/3] Linking remote origin and pushing to GitHub main branch...
git remote remove origin >nul 2>&1
git remote add origin %repourl%
git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ===================================================
    echo   SUCCESS! Your code has been pushed to GitHub.
    echo.
    echo   To get a shareable link:
    echo   1. Go to https://vercel.com/new or https://app.netlify.com/
    echo   2. Log in with your GitHub account.
    echo   3. Import this repository ("summerlms").
    echo   4. Vercel/Netlify will automatically build and deploy it!
    echo   5. You will get a production shareable link for your students.
    echo ===================================================
) else (
    echo.
    echo Something went wrong while pushing. Please make sure you copied the correct URL
    echo and have permission to write to that repository.
)

:end
echo.
pause
