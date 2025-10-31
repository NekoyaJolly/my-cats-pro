@echo off
REM ###############################################
REM MyCats Pro - Windows用開発サーバー起動スクリプト
REM バックエンドとフロントエンドを同時に起動します
REM ###############################################

setlocal

set "SCRIPT_DIR=%~dp0"
set "PROJECT_ROOT=%SCRIPT_DIR%.."
cd /d "%PROJECT_ROOT%"

echo 🐱 MyCats Pro 開発サーバーを起動します...
echo.

REM Dockerコンテナの状態を確認
docker ps | findstr mycats_postgres >nul
if errorlevel 1 (
    echo ⚠️  データベースが起動していません。起動します...
    docker-compose up -d postgres
    
    echo PostgreSQL の起動を待機中...
    timeout /t 5 /nobreak >nul
    
    REM ヘルスチェック
    set /a RETRY_COUNT=0
    set /a MAX_RETRIES=15
    
    :HEALTHCHECK_LOOP
    docker exec mycats_postgres pg_isready -U mycats -d mycats_development >nul 2>&1
    if not errorlevel 1 (
        echo ✓ PostgreSQL が起動しました
        goto :HEALTHCHECK_DONE
    )
    
    set /a RETRY_COUNT+=1
    if %RETRY_COUNT% geq %MAX_RETRIES% (
        echo ❌ PostgreSQL の起動に失敗しました
        exit /b 1
    )
    
    timeout /t 2 /nobreak >nul
    goto :HEALTHCHECK_LOOP
)

:HEALTHCHECK_DONE
echo.
echo ========================================
echo サーバーを起動しています...
echo ========================================
echo.
echo 📝 ログを確認するには:
echo   - バックエンド: backend/のターミナル
echo   - フロントエンド: frontend/のターミナル
echo.
echo 🌐 アクセス URL:
echo   - フロントエンド: http://localhost:3000
echo   - バックエンドAPI: http://localhost:3004
echo.
echo ⏹️  停止するには: Ctrl+C を押してください
echo.

REM Windows用の並列実行（推奨: pnpm run devを使用）
echo Windows環境では以下のコマンドを使用してください:
echo   pnpm run dev
echo.
echo または、2つのターミナルで個別に起動:
echo   ターミナル1: cd backend ^&^& pnpm run start:dev
echo   ターミナル2: cd frontend ^&^& pnpm run dev
echo.

pause

endlocal
