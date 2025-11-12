# H2: データベース最適化 - 実装レポート

**日付**: 2025年1月13日  
**タスク**: H2 - Database Index Optimization & N+1 Query Resolution  
**ブランチ**: `feature/database-optimization`

## 実施内容

### 1. データベースインデックス追加

#### 1.1 主要テーブルへのインデックス追加

以下のテーブルに対して、検索頻度の高いフィールドへのシングルカラムインデックスと、よく使用されるクエリパターンに対応した複合インデックスを追加しました。

**追加されたテーブル**:
- `users` - email, role, isActive, lastLoginAt + 複合2個
- `login_attempts` - userId, email, success, createdAt + 複合3個
- `breeds` - code, name, isActive
- `coat_colors` - code, name, isActive
- `genders` - code, name
- `cats` - name, gender, isInHouse, isGraduated, registrationNumber + 複合3個
- `pedigrees` - **pedigreeId(ユーザー要望)**, breedId, coatColorId, genderId, birthDate + 複合1個
- `breeding_records` - recordedBy, pregnancyStatus + 複合4個
- `care_records` - recordedBy, nextDueDate + 複合4個
- `schedules` - scheduleType, priority, isRecurring + 複合5個
- `pregnancy_checks` - status, recordedBy + 複合2個
- `birth_plans` - status, recordedBy, actualBirthDate + 複合3個
- `medical_records` - status, recordedBy + 複合3個
- `shifts` - 複合3個追加
- `shift_templates` - name, displayOrder
- `staff` - name, email, isActive + 複合1個
- `staff_availabilities` - dayOfWeek, isAvailable + 複合2個

#### 1.2 インデックス戦略

**シングルカラムインデックス**:
- 検索頻度が高いフィールド（name, email, status等）
- ソートに使用されるフィールド（date, createdAt等）
- 外部キー以外の重要なフィールド

**複合インデックス**:
- 同時に使用される検索条件の組み合わせ
  - 例: `[catId, careDate]` - 特定の猫の時系列ケア記録検索
  - 例: `[status, visitDate]` - ステータス別の医療記録検索
- パフォーマンスクリティカルな検索パターン
  - 例: `[isInHouse, isGraduated]` - 在舎・卒業状態の組み合わせフィルター

#### 1.3 マイグレーション

マイグレーションファイル: `backend/prisma/migrations/20250102000000_enhance_performance_indexes/migration.sql`

全てのインデックス追加を`CREATE INDEX IF NOT EXISTS`で実装しているため、既存のインデックスと衝突せず安全に適用可能です。

### 2. N+1クエリ問題の解消

#### 2.1 既存コードの調査結果

主要なサービス層を調査した結果、以下の状況を確認:

**✅ 既に最適化済み**:
- `CatsService.findAll()` - breed, coatColor, tagsをincludeで一括取得
- `CatsService.findOne()` - 深いネストのリレーションもincludeで取得
- `BreedingService.findAll()` - male, femaleをincludeで取得
- `CareService.findAllSchedules()` - cat, scheduleCats, remindersを一括取得
- `ShiftService.findAll()` - staffリレーションをinclude

#### 2.2 最適化実施箇所

**PedigreeService.getFamily()メソッド**:

**問題**: 家系図を取得する際に、父と母のPedigreeを個別にfindUniqueで取得していた

```typescript
// 修正前: N+1クエリ発生
if (pedigreeData.fatherPedigreeId) {
  const father = await this.prisma.pedigree.findUnique({
    where: { id: pedigreeData.fatherPedigreeId },
  });
}
if (pedigreeData.motherPedigreeId) {
  const mother = await this.prisma.pedigree.findUnique({
    where: { id: pedigreeData.motherPedigreeId },
  });
}
```

**解決策**: includeを使用して必要な世代数分のリレーションを一度に取得

```typescript
// 修正後: 1クエリで全世代取得
const pedigree = await this.prisma.pedigree.findUnique({
  where: { id },
  include: this.buildFamilyInclude(generations),
});

// 再帰的にincludeを構築
private buildFamilyInclude(generations: number): Prisma.PedigreeInclude | undefined {
  if (generations <= 0) return undefined;
  
  const childInclude = this.buildFamilyInclude(generations - 1);
  
  return {
    fatherPedigree: childInclude ? { include: childInclude } : true,
    motherPedigree: childInclude ? { include: childInclude } : true,
    breed: true,
    coatColor: true,
    gender: true,
  };
}
```

**効果**:
- 3世代の家系図取得: **7クエリ → 1クエリ** (約85%削減)
- レスポンス時間の大幅改善

### 3. パフォーマンス検証準備

#### 3.1 インデックス使用状況確認用SQLスクリプト

```sql
-- インデックス使用統計
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan AS index_scans,
  idx_tup_read AS tuples_read,
  idx_tup_fetch AS tuples_fetched
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;

-- インデックスサイズ確認
SELECT
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY pg_relation_size(indexrelid) DESC;
```

#### 3.2 クエリパフォーマンステスト方法

```sql
-- EXPLAIN ANALYZEでクエリプラン確認
EXPLAIN ANALYZE
SELECT * FROM cats 
WHERE is_in_house = true 
  AND is_graduated = false 
ORDER BY birth_date DESC;

-- インデックスが使用されているか確認
-- 出力の"Index Scan using cats_is_in_house_is_graduated_idx"を確認
```

## 期待される効果

### インデックス追加による改善

1. **検索クエリの高速化**
   - name検索: フルスキャン → インデックススキャン
   - 日付範囲検索: 大幅な性能向上
   - ステータスフィルター: 即座に該当レコード特定

2. **複合条件検索の最適化**
   - 在舎猫の検索 (`is_in_house = true AND is_graduated = false`)
   - 特定猫の時系列記録検索 (`cat_id = X ORDER BY date`)
   - ユーザー別ログイン履歴 (`user_id = X ORDER BY created_at`)

3. **ソート処理の高速化**
   - ORDER BY句で使用されるフィールドにインデックスを付与
   - 大量データでのページネーション性能向上

### N+1クエリ解消による改善

1. **家系図取得の高速化**
   - 3世代: 7クエリ → 1クエリ (約85%削減)
   - データベース往復回数の大幅削減
   - レスポンスタイムの短縮

2. **アプリケーション全体の負荷軽減**
   - データベース接続数の削減
   - ネットワーク遅延の最小化

## 今後の課題

### 1. 本番環境での性能測定

- [ ] 実データでのインデックス効果測定
- [ ] EXPLAIN ANALYZEによるクエリプラン検証
- [ ] インデックス使用率のモニタリング

### 2. 未使用インデックスの監視

```sql
-- 使用されていないインデックスの確認
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND idx_scan = 0
ORDER BY pg_relation_size(indexrelid) DESC;
```

### 3. 追加の最適化機会

- [ ] CareRecordの履歴検索パターン分析
- [ ] MedicalRecordの検索クエリ最適化
- [ ] 大量データ取得時のカーソルベースページネーション検討

## 変更ファイル一覧

### スキーマ変更
- `backend/prisma/schema.prisma` - 18テーブルにインデックス追加

### マイグレーション
- `backend/prisma/migrations/20250102000000_enhance_performance_indexes/migration.sql` - 新規作成

### サービス層最適化
- `backend/src/pedigree/pedigree.service.ts` - getFamily()メソッドの最適化

## 検証コマンド

```bash
# Prisma Client再生成
cd backend && pnpm prisma:generate

# TypeScript型チェック
cd backend && pnpm typecheck

# ビルド確認
cd backend && pnpm build

# 本番環境でのマイグレーション適用 (要注意)
# ※必ずバックアップを取得してから実行
cd backend && pnpm prisma migrate deploy
```

## まとめ

H2タスクにおいて、データベースの性能最適化を実施しました:

1. **18テーブルに対して戦略的なインデックスを追加** - 検索頻度の高いフィールドと複合検索パターンに対応
2. **N+1クエリ問題を解消** - PedigreeServiceの家系図取得を最適化(7クエリ→1クエリ)
3. **パフォーマンス検証の準備** - インデックス使用状況確認用SQLスクリプト作成

これらの最適化により、大量データ環境下でのアプリケーション性能が大幅に向上することが期待されます。
