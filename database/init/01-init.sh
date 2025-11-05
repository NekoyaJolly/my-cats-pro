#!/bin/bash
set -e

echo "🔄 データベース初期化を開始..."

# UUIDエクステンションを有効化
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Enable UUID extension
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    
    -- Enable pg_trgm for text search
    CREATE EXTENSION IF NOT EXISTS pg_trgm;
EOSQL

echo "✅ 拡張機能のインストール完了"

# シードデータがあれば実行
if [ -f /docker-entrypoint-initdb.d/seed-cats-data.sql ]; then
    echo "🌱 シードデータを読み込み中..."
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" < /docker-entrypoint-initdb.d/seed-cats-data.sql
    echo "✅ シードデータの読み込み完了"
fi

# インデックスを作成
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Create indexes for better performance (if tables exist)
    DO \$\$
    BEGIN
        IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'cats') THEN
            CREATE INDEX IF NOT EXISTS idx_cats_owner_id ON cats("ownerId");
            CREATE INDEX IF NOT EXISTS idx_cats_is_in_house ON cats("isInHouse");
            CREATE INDEX IF NOT EXISTS idx_cats_registration_number ON cats("registrationNumber");
            CREATE INDEX IF NOT EXISTS idx_cats_mother_id ON cats("motherId");
            CREATE INDEX IF NOT EXISTS idx_cats_father_id ON cats("fatherId");
            CREATE INDEX IF NOT EXISTS idx_cats_birth_date ON cats("birthDate");
        END IF;

        IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'breeding_records') THEN
            CREATE INDEX IF NOT EXISTS idx_breeding_records_male_id ON breeding_records("maleId");
            CREATE INDEX IF NOT EXISTS idx_breeding_records_female_id ON breeding_records("femaleId");
            CREATE INDEX IF NOT EXISTS idx_breeding_records_date ON breeding_records("breedingDate");
        END IF;

        IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'birth_plans') THEN
            CREATE INDEX IF NOT EXISTS idx_birth_plans_mother_id ON birth_plans("motherId");
            CREATE INDEX IF NOT EXISTS idx_birth_plans_father_id ON birth_plans("fatherId");
            CREATE INDEX IF NOT EXISTS idx_birth_plans_status ON birth_plans(status);
            CREATE INDEX IF NOT EXISTS idx_birth_plans_expected_date ON birth_plans("expectedBirthDate");
        END IF;

        IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'care_records') THEN
            CREATE INDEX IF NOT EXISTS idx_care_records_cat_id ON care_records("catId");
            CREATE INDEX IF NOT EXISTS idx_care_records_care_date ON care_records("careDate");
            CREATE INDEX IF NOT EXISTS idx_care_records_type ON care_records("careType");
        END IF;

        IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'schedules') THEN
            CREATE INDEX IF NOT EXISTS idx_schedules_assigned_to ON schedules("assignedTo");
            CREATE INDEX IF NOT EXISTS idx_schedules_cat_id ON schedules("catId");
            CREATE INDEX IF NOT EXISTS idx_schedules_schedule_date ON schedules("scheduleDate");
        END IF;

        IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'pedigrees') THEN
            CREATE INDEX IF NOT EXISTS idx_pedigrees_cat_id ON pedigrees("catId");
            CREATE INDEX IF NOT EXISTS idx_pedigrees_call_name ON pedigrees("callName");
        END IF;
    END
    \$\$;
EOSQL

echo "✅ インデックスの作成完了"
echo "🎉 データベース初期化が完了しました"
