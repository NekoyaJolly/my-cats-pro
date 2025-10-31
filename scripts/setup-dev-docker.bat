@echo off
REM ###############################################
REM MyCats Pro - Windows用開発環境セットアップスクリプト
REM Docker環境でフロントエンド、バックエンド、DBを起動します
REM ###############################################

setlocal enabledelayedexpansion

echo 🐱 MyCats Pro 開発環境セットアップを開始します...
echo.

REM プロジェクトルートを取得
set "SCRIPT_DIR=%~dp0"
set "PROJECT_ROOT=%SCRIPT_DIR%.."
cd /d "%PROJECT_ROOT%"

echo 📁 プロジェクトルート: %PROJECT_ROOT%
echo.

REM 1. 環境変数ファイルの確認
echo [1/5] 環境変数ファイルを確認中...

if not exist "backend\.env" (
    echo ⚠️  backend\.env が存在しません。作成します...
    copy ".env.development" "backend\.env"
    echo ✓ backend\.env を作成しました
) else (
    echo ✓ backend\.env が存在します
)

if not exist "frontend\.env.local" (
    echo ⚠️  frontend\.env.local が存在しません。作成します...
    (
        echo # フロントエンド環境変数 ^(開発環境^)
        echo NEXT_PUBLIC_API_URL=http://localhost:3004
        echo NEXT_PUBLIC_ENV=development
    ) > "frontend\.env.local"
    echo ✓ frontend\.env.local を作成しました
) else (
    echo ✓ frontend\.env.local が存在します
)

echo.

REM 2. Docker Composeでデータベースを起動
echo [2/5] Docker Compose でデータベースを起動中...

REM 既存のコンテナを停止（あれば）
docker ps -a -q -f name=mycats_postgres >nul 2>&1
if not errorlevel 1 (
    echo 既存の mycats_postgres コンテナを停止します...
    docker-compose down
)

REM データベースを起動
docker-compose up -d postgres

echo PostgreSQL の起動を待機中...
timeout /t 5 /nobreak >nul

REM ヘルスチェック
set /a RETRY_COUNT=0
set /a MAX_RETRIES=30

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

echo PostgreSQL の起動を待機中... ^(%RETRY_COUNT%/%MAX_RETRIES%^)
timeout /t 2 /nobreak >nul
goto :HEALTHCHECK_LOOP

:HEALTHCHECK_DONE
echo.

REM 3. 依存関係のインストール
echo [3/5] 依存関係をインストール中...

if not exist "node_modules" (
    echo ルートの依存関係をインストール...
    call pnpm install
)

if not exist "backend\node_modules" (
    echo バックエンドの依存関係をインストール...
    cd backend
    call pnpm install
    cd ..
)

if not exist "frontend\node_modules" (
    echo フロントエンドの依存関係をインストール...
    cd frontend
    call pnpm install
    cd ..
)

echo ✓ 依存関係のインストールが完了しました
echo.

REM 4. Prisma の初期化
echo [4/5] Prisma を初期化中...
cd backend

echo Prisma Client を生成...
call pnpm prisma:generate

echo データベースマイグレーションを実行...
call pnpm prisma:migrate

echo シードデータを投入...
call pnpm run seed 2>nul || echo ⚠️  シードの実行に失敗しました（既にデータが存在する可能性があります）

cd ..
echo ✓ Prisma の初期化が完了しました
echo.

REM 5. 完了メッセージ
echo ========================================
echo 🎉 セットアップが完了しました！
echo ========================================
echo.
echo 📝 次のステップ:
echo.
echo   【バックエンドを起動】
echo   $ cd backend
echo   $ pnpm run start:dev
echo.
echo   【フロントエンドを起動（別のターミナルで）】
echo   $ cd frontend
echo   $ pnpm run dev
echo.
echo   または、並列起動スクリプトを使用:
echo   $ pnpm run dev
echo.
echo   【データベースを停止】
echo   $ docker-compose down
echo.
echo 🌐 アクセス URL:
echo   - フロントエンド: http://localhost:3000
echo   - バックエンドAPI: http://localhost:3004
echo   - pgAdmin: http://localhost:5050
echo.
echo 📊 データベース接続情報:
echo   - Host: localhost
echo   - Port: 5433
echo   - Database: mycats_development
echo   - User: mycats
echo   - Password: mycats_dev_password
echo.

endlocal
