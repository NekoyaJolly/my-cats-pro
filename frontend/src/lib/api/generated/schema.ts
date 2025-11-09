/* eslint-disable */
/* tslint:disable */
/**
 * 🔒 このファイルは自動生成されています。
 * 生成コマンド: pnpm --filter frontend generate:api-types
 * 直接編集せず、OpenAPI スキーマを更新して再生成してください。
 */
export type paths = {
    "/api/v1/master/genders": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 性別マスタデータを取得（認証不要） */
        get: operations["MasterDataController_getGenders"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/login": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** ログイン（JWT発行） */
        post: operations["AuthController_login"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/register": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** ユーザー登録（メール＋パスワード） */
        post: operations["AuthController_register"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/set-password": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** パスワード設定/変更（要JWT） */
        post: operations["AuthController_setPassword"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/change-password": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** パスワード変更（現在のパスワード確認必要） */
        post: operations["AuthController_changePassword"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/request-password-reset": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** パスワードリセット要求 */
        post: operations["AuthController_requestPasswordReset"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/reset-password": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** パスワードリセット実行 */
        post: operations["AuthController_resetPassword"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/refresh": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** リフレッシュトークンでアクセストークン再取得 */
        post: operations["AuthController_refresh"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/logout": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** ログアウト（リフレッシュトークン削除） */
        post: operations["AuthController_logout"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/cats": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 猫データを検索・一覧取得 */
        get: operations["CatsController_findAll"];
        put?: never;
        /** 猫データを作成 */
        post: operations["CatsController_create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/cats/statistics": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 猫データの統計情報を取得 */
        get: operations["CatsController_getStatistics"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/cats/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** IDで猫データを取得 */
        get: operations["CatsController_findOne"];
        put?: never;
        post?: never;
        /** 猫データを削除 */
        delete: operations["CatsController_remove"];
        options?: never;
        head?: never;
        /** 猫データを更新 */
        patch: operations["CatsController_update"];
        trace?: never;
    };
    "/api/v1/cats/{id}/breeding-history": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 猫の繁殖履歴を取得 */
        get: operations["CatsController_getBreedingHistory"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/cats/{id}/care-history": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 猫のケア履歴を取得 */
        get: operations["CatsController_getCareHistory"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/cats/genders": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 性別マスタデータを取得 */
        get: operations["CatsController_getGenders"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/pedigrees": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 血統書データを検索・一覧取得 */
        get: operations["PedigreeController_findAll"];
        put?: never;
        /** 血統書データを作成（管理者のみ） */
        post: operations["PedigreeController_create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/pedigrees/pedigree-id/{pedigreeId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 血統書番号で血統書データを取得 */
        get: operations["PedigreeController_findByPedigreeId"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/pedigrees/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** IDで血統書データを取得 */
        get: operations["PedigreeController_findOne"];
        put?: never;
        post?: never;
        /** 血統書データを削除（管理者のみ） */
        delete: operations["PedigreeController_remove"];
        options?: never;
        head?: never;
        /** 血統書データを更新（管理者のみ） */
        patch: operations["PedigreeController_update"];
        trace?: never;
    };
    "/api/v1/pedigrees/{id}/family-tree": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 血統書の家系図を取得 */
        get: operations["PedigreeController_getFamilyTree"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/pedigrees/{id}/family": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 血統書データの家系図を取得 */
        get: operations["PedigreeController_getFamily"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/pedigrees/{id}/descendants": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 血統書データの子孫を取得 */
        get: operations["PedigreeController_getDescendants"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/breeds": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 品種データを検索・一覧取得 */
        get: operations["BreedsController_findAll"];
        put?: never;
        /** 品種データを作成（管理者のみ） */
        post: operations["BreedsController_create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/breeds/statistics": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 品種データの統計情報を取得 */
        get: operations["BreedsController_getStatistics"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/breeds/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** IDで品種データを取得 */
        get: operations["BreedsController_findOne"];
        put?: never;
        post?: never;
        /** 品種データを削除（管理者のみ） */
        delete: operations["BreedsController_remove"];
        options?: never;
        head?: never;
        /** 品種データを更新（管理者のみ） */
        patch: operations["BreedsController_update"];
        trace?: never;
    };
    "/api/v1/coat-colors": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 毛色データを検索・一覧取得 */
        get: operations["CoatColorsController_findAll"];
        put?: never;
        /** 毛色データを作成（管理者のみ） */
        post: operations["CoatColorsController_create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/coat-colors/statistics": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 毛色データの統計情報を取得 */
        get: operations["CoatColorsController_getStatistics"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/coat-colors/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** IDで毛色データを取得 */
        get: operations["CoatColorsController_findOne"];
        put?: never;
        post?: never;
        /** 毛色データを削除（管理者のみ） */
        delete: operations["CoatColorsController_remove"];
        options?: never;
        head?: never;
        /** 毛色データを更新（管理者のみ） */
        patch: operations["CoatColorsController_update"];
        trace?: never;
    };
    "/api/v1/breeding": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 交配記録一覧の取得 */
        get: operations["BreedingController_findAll"];
        put?: never;
        /** 交配記録の新規作成 */
        post: operations["BreedingController_create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/breeding/ng-rules": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** NGペアルール一覧の取得 */
        get: operations["BreedingController_findNgRules"];
        put?: never;
        /** NGペアルールの作成 */
        post: operations["BreedingController_createNgRule"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/breeding/ng-rules/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** NGペアルールの削除 */
        delete: operations["BreedingController_removeNgRule"];
        options?: never;
        head?: never;
        /** NGペアルールの更新 */
        patch: operations["BreedingController_updateNgRule"];
        trace?: never;
    };
    "/api/v1/breeding/test": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** テスト */
        get: operations["BreedingController_test"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/breeding/pregnancy-checks": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 妊娠チェック一覧の取得 */
        get: operations["BreedingController_findAllPregnancyChecks"];
        put?: never;
        /** 妊娠チェックの新規作成 */
        post: operations["BreedingController_createPregnancyCheck"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/breeding/pregnancy-checks/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** 妊娠チェックの削除 */
        delete: operations["BreedingController_removePregnancyCheck"];
        options?: never;
        head?: never;
        /** 妊娠チェックの更新 */
        patch: operations["BreedingController_updatePregnancyCheck"];
        trace?: never;
    };
    "/api/v1/breeding/birth-plans": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 出産計画一覧の取得 */
        get: operations["BreedingController_findAllBirthPlans"];
        put?: never;
        /** 出産計画の新規作成 */
        post: operations["BreedingController_createBirthPlan"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/breeding/birth-plans/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** 出産計画の削除 */
        delete: operations["BreedingController_removeBirthPlan"];
        options?: never;
        head?: never;
        /** 出産計画の更新 */
        patch: operations["BreedingController_updateBirthPlan"];
        trace?: never;
    };
    "/api/v1/breeding/kitten-dispositions/{birthRecordId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 出産記録の子猫処遇一覧取得 */
        get: operations["BreedingController_findAllKittenDispositions"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/breeding/kitten-dispositions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** 子猫処遇の登録 */
        post: operations["BreedingController_createKittenDisposition"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/breeding/kitten-dispositions/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** 子猫処遇の削除 */
        delete: operations["BreedingController_removeKittenDisposition"];
        options?: never;
        head?: never;
        /** 子猫処遇の更新 */
        patch: operations["BreedingController_updateKittenDisposition"];
        trace?: never;
    };
    "/api/v1/breeding/birth-plans/{id}/complete": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** 出産記録の完了 */
        post: operations["BreedingController_completeBirthRecord"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/care/schedules": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** ケアスケジュール一覧の取得 */
        get: operations["CareController_findSchedules"];
        put?: never;
        /** ケアスケジュールの追加 */
        post: operations["CareController_addSchedule"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/care/schedules/{id}/complete": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /** ケア完了処理（PATCH/PUT対応） */
        patch: operations["CareController_complete"];
        trace?: never;
    };
    "/api/v1/care/schedules/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** ケアスケジュールの削除 */
        delete: operations["CareController_deleteSchedule"];
        options?: never;
        head?: never;
        /** ケアスケジュールの更新 */
        patch: operations["CareController_updateSchedule"];
        trace?: never;
    };
    "/api/v1/care/medical-records": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 医療記録一覧の取得 */
        get: operations["CareController_findMedicalRecords"];
        put?: never;
        /** 医療記録の追加 */
        post: operations["CareController_addMedicalRecord"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/tags": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** タグ一覧の取得 */
        get: operations["TagsController_findAll"];
        put?: never;
        /** タグの作成 */
        post: operations["TagsController_create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/tags/reorder": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /** タグの並び替え */
        patch: operations["TagsController_reorder"];
        trace?: never;
    };
    "/api/v1/tags/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** タグの削除 */
        delete: operations["TagsController_remove"];
        options?: never;
        head?: never;
        /** タグの更新 */
        patch: operations["TagsController_update"];
        trace?: never;
    };
    "/api/v1/tags/cats/{id}/tags": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** 猫にタグを付与 */
        post: operations["TagsController_assign"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/tags/cats/{id}/tags/{tagId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** 猫からタグを剥奪 */
        delete: operations["TagsController_unassign"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/tags/categories": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** タグカテゴリ一覧の取得 */
        get: operations["TagCategoriesController_findAll"];
        put?: never;
        /** タグカテゴリの作成 */
        post: operations["TagCategoriesController_create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/tags/categories/reorder": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /** タグカテゴリの並び替え */
        patch: operations["TagCategoriesController_reorder"];
        trace?: never;
    };
    "/api/v1/tags/categories/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** タグカテゴリの削除 */
        delete: operations["TagCategoriesController_remove"];
        options?: never;
        head?: never;
        /** タグカテゴリの更新 */
        patch: operations["TagCategoriesController_update"];
        trace?: never;
    };
    "/api/v1/tags/groups": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** タググループの作成 */
        post: operations["TagGroupsController_create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/tags/groups/reorder": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /** タググループの並び替え */
        patch: operations["TagGroupsController_reorder"];
        trace?: never;
    };
    "/api/v1/tags/groups/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** タググループの削除 */
        delete: operations["TagGroupsController_remove"];
        options?: never;
        head?: never;
        /** タググループの更新 */
        patch: operations["TagGroupsController_update"];
        trace?: never;
    };
    "/api/v1/tags/automation/rules": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 自動化ルール一覧の取得 */
        get: operations["TagAutomationController_findRules"];
        put?: never;
        /** 自動化ルールの作成 */
        post: operations["TagAutomationController_createRule"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/tags/automation/rules/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 自動化ルール詳細の取得 */
        get: operations["TagAutomationController_findRuleById"];
        put?: never;
        post?: never;
        /** 自動化ルールの削除 */
        delete: operations["TagAutomationController_deleteRule"];
        options?: never;
        head?: never;
        /** 自動化ルールの更新 */
        patch: operations["TagAutomationController_updateRule"];
        trace?: never;
    };
    "/api/v1/tags/automation/runs": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** ルール実行履歴の取得 */
        get: operations["TagAutomationController_findRuns"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/tags/automation/rules/{id}/execute": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** ルールを手動実行（テスト用） */
        post: operations["TagAutomationController_executeRule"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/health": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["HealthController_check"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/staff": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["StaffController_findAll"];
        put?: never;
        post: operations["StaffController_create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/staff/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["StaffController_findOne"];
        put?: never;
        post?: never;
        delete: operations["StaffController_remove"];
        options?: never;
        head?: never;
        patch: operations["StaffController_update"];
        trace?: never;
    };
    "/api/v1/staff/{id}/restore": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch: operations["StaffController_restore"];
        trace?: never;
    };
    "/api/v1/shifts": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["ShiftController_findAll"];
        put?: never;
        post: operations["ShiftController_create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/shifts/calendar": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["ShiftController_getCalendarData"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/shifts/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["ShiftController_findOne"];
        put?: never;
        post?: never;
        delete: operations["ShiftController_remove"];
        options?: never;
        head?: never;
        patch: operations["ShiftController_update"];
        trace?: never;
    };
};
export type webhooks = Record<string, never>;
export type components = {
    schemas: {
        LoginDto: {
            /**
             * @description ログインに使用するメールアドレス
             * @example user@example.com
             */
            email: string;
            /**
             * @description パスワード (8文字以上推奨)
             * @example SecurePassword123!
             */
            password: string;
        };
        ChangePasswordDto: {
            /**
             * @description 現在のパスワード
             * @example oldPassword123!
             */
            currentPassword: string;
            /**
             * @description 新しいパスワード（8文字以上、大文字・小文字・数字・特殊文字を含む）
             * @example NewSecurePassword123!
             */
            newPassword: string;
        };
        RequestPasswordResetDto: {
            /**
             * @description メールアドレス
             * @example user@example.com
             */
            email: string;
        };
        ResetPasswordDto: {
            /**
             * @description パスワードリセットトークン
             * @example a1b2c3d4e5f6...
             */
            token: string;
            /**
             * @description 新しいパスワード
             * @example NewSecurePassword123!
             */
            newPassword: string;
        };
        RefreshTokenDto: {
            /**
             * @description リフレッシュトークン (Cookie利用時は省略可)
             * @example eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
             */
            refreshToken?: string;
        };
        CreateCatDto: {
            /**
             * @description 猫の名前
             * @example Alpha
             */
            name: string;
            /**
             * @description 性別
             * @example MALE
             * @enum {string}
             */
            gender: "MALE" | "FEMALE" | "NEUTER" | "SPAY";
            /**
             * @description 生年月日
             * @example 2024-05-01
             */
            birthDate: string;
            /** @description 品種ID */
            breedId?: string;
            /** @description 毛色ID */
            coatColorId?: string;
            /** @description マイクロチップ番号 */
            microchipNumber?: string;
            /** @description 登録番号 */
            registrationNumber?: string;
            /** @description 説明・備考 */
            description?: string;
            /** @description 施設内に在舎しているか */
            isInHouse?: boolean;
            /** @description 父猫のID */
            fatherId?: string;
            /** @description 母猫のID */
            motherId?: string;
            /** @description タグID配列 */
            tagIds?: string[];
        };
        UpdateCatDto: Record<string, never>;
        CreatePedigreeDto: {
            /**
             * @description 血統書番号
             * @example 700545
             */
            pedigreeId: string;
            /**
             * @description タイトル
             * @example Champion
             */
            title?: string;
            /**
             * @description 猫の名前
             * @example Jolly Tokuichi
             */
            catName?: string;
            /**
             * @description キャッテリー名
             * @example Jolly Tokuichi
             */
            catName2?: string;
            /**
             * @description 品種コード
             * @example 92
             */
            breedCode?: number;
            /**
             * @description 性別コード (1: オス, 2: メス)
             * @example 1
             */
            genderCode?: number;
            /**
             * @description 目の色
             * @example Gold
             */
            eyeColor?: string;
            /**
             * @description 毛色コード
             * @example 190
             */
            coatColorCode?: number;
            /**
             * @description 生年月日
             * @example 2019-01-05
             */
            birthDate?: string;
            /**
             * @description ブリーダー名
             * @example Hayato Inami
             */
            breederName?: string;
            /**
             * @description オーナー名
             * @example Hayato Inami
             */
            ownerName?: string;
            /**
             * @description 登録年月日
             * @example 2022-02-22
             */
            registrationDate?: string;
            /**
             * @description 兄弟の人数
             * @example 2
             */
            brotherCount?: number;
            /**
             * @description 姉妹の人数
             * @example 2
             */
            sisterCount?: number;
            /** @description 備考 */
            notes?: string;
            /** @description 備考２ */
            notes2?: string;
            /**
             * @description 他団体No
             * @example 921901-700545
             */
            otherNo?: string;
            /** @description 父親タイトル */
            fatherTitle?: string;
            /** @description 父親名 */
            fatherCatName?: string;
            /** @description 父親キャッテリー名 */
            fatherCatName2?: string;
            /** @description 父親毛色 */
            fatherCoatColor?: string;
            /** @description 父親目の色 */
            fatherEyeColor?: string;
            /** @description 父親JCU番号 */
            fatherJCU?: string;
            /** @description 父親他団体コード */
            fatherOtherCode?: string;
            /** @description 母親タイトル */
            motherTitle?: string;
            /** @description 母親名 */
            motherCatName?: string;
            /** @description 母親キャッテリー名 */
            motherCatName2?: string;
            /** @description 母親毛色 */
            motherCoatColor?: string;
            /** @description 母親目の色 */
            motherEyeColor?: string;
            /** @description 母親JCU番号 */
            motherJCU?: string;
            /** @description 母親他団体コード */
            motherOtherCode?: string;
            /** @description 父方祖父タイトル */
            ffTitle?: string;
            /** @description 父方祖父名 */
            ffCatName?: string;
            /** @description 父方祖父毛色 */
            ffCatColor?: string;
            /** @description 父方祖父JCU */
            ffjcu?: string;
            /** @description 父方祖母タイトル */
            fmTitle?: string;
            /** @description 父方祖母名 */
            fmCatName?: string;
            /** @description 父方祖母毛色 */
            fmCatColor?: string;
            /** @description 父方祖母JCU */
            fmjcu?: string;
            /** @description 母方祖父タイトル */
            mfTitle?: string;
            /** @description 母方祖父名 */
            mfCatName?: string;
            /** @description 母方祖父毛色 */
            mfCatColor?: string;
            /** @description 母方祖父JCU */
            mfjcu?: string;
            /** @description 母方祖母タイトル */
            mmTitle?: string;
            /** @description 母方祖母名 */
            mmCatName?: string;
            /** @description 母方祖母毛色 */
            mmCatColor?: string;
            /** @description 母方祖母JCU */
            mmjcu?: string;
            /** @description 父父父タイトル */
            fffTitle?: string;
            /** @description 父父父名 */
            fffCatName?: string;
            /** @description 父父父毛色 */
            fffCatColor?: string;
            /** @description 父父父JCU */
            fffjcu?: string;
            /** @description 父父母タイトル */
            ffmTitle?: string;
            /** @description 父父母名 */
            ffmCatName?: string;
            /** @description 父父母毛色 */
            ffmCatColor?: string;
            /** @description 父父母JCU */
            ffmjcu?: string;
            /** @description 父母父タイトル */
            fmfTitle?: string;
            /** @description 父母父名 */
            fmfCatName?: string;
            /** @description 父母父毛色 */
            fmfCatColor?: string;
            /** @description 父母父JCU */
            fmfjcu?: string;
            /** @description 父母母タイトル */
            fmmTitle?: string;
            /** @description 父母母名 */
            fmmCatName?: string;
            /** @description 父母母毛色 */
            fmmCatColor?: string;
            /** @description 父母母JCU */
            fmmjcu?: string;
            /** @description 母父父タイトル */
            mffTitle?: string;
            /** @description 母父父名 */
            mffCatName?: string;
            /** @description 母父父毛色 */
            mffCatColor?: string;
            /** @description 母父父JCU */
            mffjcu?: string;
            /** @description 母父母タイトル */
            mfmTitle?: string;
            /** @description 母父母名 */
            mfmCatName?: string;
            /** @description 母父母毛色 */
            mfmCatColor?: string;
            /** @description 母父母JCU */
            mfmjcu?: string;
            /** @description 母母父タイトル */
            mmfTitle?: string;
            /** @description 母母父名 */
            mmfCatName?: string;
            /** @description 母母父毛色 */
            mmfCatColor?: string;
            /** @description 母母父JCU */
            mmfjcu?: string;
            /** @description 母母母タイトル */
            mmmTitle?: string;
            /** @description 母母母名 */
            mmmCatName?: string;
            /** @description 母母母毛色 */
            mmmCatColor?: string;
            /** @description 母母母JCU */
            mmmjcu?: string;
            /** @description 旧コード */
            oldCode?: string;
        };
        UpdatePedigreeDto: Record<string, never>;
        CreateBreedDto: {
            /** @description 品種コード */
            code: number;
            /** @description 品種名 */
            name: string;
            /** @description 品種の説明 */
            description?: string;
        };
        UpdateBreedDto: Record<string, never>;
        CreateCoatColorDto: {
            /** @description 毛色コード */
            code: number;
            /** @description 毛色名 */
            name: string;
            /** @description 毛色の説明 */
            description?: string;
        };
        UpdateCoatColorDto: Record<string, never>;
        CreateBreedingDto: {
            /**
             * @description メス猫のID
             * @example 11111111-1111-1111-1111-111111111111
             */
            femaleId: string;
            /**
             * @description オス猫のID
             * @example 22222222-2222-2222-2222-222222222222
             */
            maleId: string;
            /**
             * @description 交配日
             * @example 2025-08-01
             */
            breedingDate: string;
            /**
             * @description 出産予定日 (YYYY-MM-DD)
             * @example 2025-10-01
             */
            expectedDueDate?: string;
            /**
             * @description メモ
             * @example 初回の交配。
             */
            notes?: string;
        };
        CreateBreedingNgRuleDto: {
            /**
             * @description ルール名
             * @example 近親交配防止
             */
            name: string;
            /**
             * @description 説明
             * @example 血統書付き同士の交配を避ける
             */
            description?: string;
            /**
             * @example TAG_COMBINATION
             * @enum {string}
             */
            type: "TAG_COMBINATION" | "INDIVIDUAL_PROHIBITION" | "GENERATION_LIMIT";
            /**
             * @description 有効フラグ
             * @default true
             */
            active: boolean;
            /** @description オス側のタグ条件 */
            maleConditions?: string[];
            /** @description メス側のタグ条件 */
            femaleConditions?: string[];
            /** @description 禁止するオス猫の名前 */
            maleNames?: string[];
            /** @description 禁止するメス猫の名前 */
            femaleNames?: string[];
            /** @description 世代制限 (親等) */
            generationLimit?: number;
        };
        UpdateBreedingNgRuleDto: Record<string, never>;
        CreatePregnancyCheckDto: {
            /** @description 妊娠チェック対象の猫ID */
            motherId: string;
            /** @description 父猫のID */
            fatherId?: string;
            /** @description 交配日 */
            matingDate?: string;
            /** @description 妊娠チェック日 */
            checkDate: string;
            /**
             * @description 妊娠状態
             * @enum {string}
             */
            status: "CONFIRMED" | "SUSPECTED" | "NEGATIVE" | "ABORTED";
            /** @description メモ */
            notes?: string;
        };
        UpdatePregnancyCheckDto: {
            /** @description 父猫のID */
            fatherId?: string;
            /** @description 交配日 */
            matingDate?: string;
            /** @description 妊娠チェック日 */
            checkDate?: string;
            /**
             * @description 妊娠状態
             * @enum {string}
             */
            status?: "CONFIRMED" | "SUSPECTED" | "NEGATIVE" | "ABORTED";
            /** @description メモ */
            notes?: string;
        };
        CreateBirthPlanDto: {
            /** @description 出産予定の母親猫ID */
            motherId: string;
            /** @description 父猫のID */
            fatherId?: string;
            /** @description 交配日 */
            matingDate?: string;
            /** @description 出産予定日 */
            expectedBirthDate: string;
            /** @description 実際の出産日 */
            actualBirthDate?: string;
            /**
             * @description 出産状態
             * @enum {string}
             */
            status: "EXPECTED" | "BORN" | "ABORTED" | "STILLBORN";
            /** @description 予想される子猫の数 */
            expectedKittens?: number;
            /** @description 実際の子猫の数 */
            actualKittens?: number;
            /** @description メモ */
            notes?: string;
        };
        UpdateBirthPlanDto: {
            /** @description 父猫のID */
            fatherId?: string;
            /** @description 交配日 */
            matingDate?: string;
            /** @description 出産予定日 */
            expectedBirthDate?: string;
            /** @description 実際の出産日 */
            actualBirthDate?: string;
            /**
             * @description 出産状態
             * @enum {string}
             */
            status?: "EXPECTED" | "BORN" | "ABORTED" | "STILLBORN";
            /** @description 予想される子猫の数 */
            expectedKittens?: number;
            /** @description 実際の子猫の数 */
            actualKittens?: number;
            /** @description メモ */
            notes?: string;
        };
        SaleInfoDto: {
            /** @description 譲渡先（個人名/業者名） */
            buyer: string;
            /** @description 譲渡金額 */
            price: number;
            /** @description 譲渡日 */
            saleDate: string;
            /** @description メモ */
            notes?: string;
        };
        CreateKittenDispositionDto: {
            /** @description 出産記録ID */
            birthRecordId: string;
            /** @description 子猫ID（養成の場合のみ） */
            kittenId?: string;
            /** @description 子猫名 */
            name: string;
            /** @description 性別 */
            gender: string;
            /**
             * @description 処遇タイプ
             * @enum {string}
             */
            disposition: "TRAINING" | "SALE" | "DECEASED";
            /** @description 養成開始日（養成の場合） */
            trainingStartDate?: string;
            /** @description 譲渡情報（出荷の場合） */
            saleInfo?: components["schemas"]["SaleInfoDto"];
            /** @description 死亡日（死亡の場合） */
            deathDate?: string;
            /** @description 死亡理由（死亡の場合） */
            deathReason?: string;
            /** @description メモ */
            notes?: string;
        };
        UpdateKittenDispositionDto: {
            /** @description 子猫ID（養成の場合のみ） */
            kittenId?: string;
            /** @description 子猫名 */
            name?: string;
            /** @description 性別 */
            gender?: string;
            /** @description 処遇タイプ */
            disposition?: string;
            /** @description 養成開始日（養成の場合） */
            trainingStartDate?: string;
            /** @description 譲渡情報（出荷の場合） */
            saleInfo?: components["schemas"]["SaleInfoDto"];
            /** @description 死亡日（死亡の場合） */
            deathDate?: string;
            /** @description 死亡理由（死亡の場合） */
            deathReason?: string;
            /** @description メモ */
            notes?: string;
        };
        CareScheduleCatDto: {
            /** @example e7b6a7a7-2d7f-4b2f-9f3a-1c2b3d4e5f60 */
            id: string;
            /** @example レオ */
            name: string;
        };
        CareScheduleReminderDto: {
            /** @example f1e2d3c4-b5a6-7890-1234-56789abcdef0 */
            id: string;
            /**
             * @example ABSOLUTE
             * @enum {string}
             */
            timingType: "ABSOLUTE" | "RELATIVE";
            /** @example 2025-08-01T09:00:00.000Z */
            remindAt?: string;
            /** @example 2 */
            offsetValue?: number;
            /**
             * @example DAY
             * @enum {string}
             */
            offsetUnit?: "MINUTE" | "HOUR" | "DAY" | "WEEK" | "MONTH";
            /**
             * @example START_DATE
             * @enum {string}
             */
            relativeTo?: "START_DATE" | "END_DATE" | "CUSTOM_DATE";
            /**
             * @example IN_APP
             * @enum {string}
             */
            channel: "IN_APP" | "EMAIL" | "SMS" | "PUSH";
            /**
             * @example NONE
             * @enum {string}
             */
            repeatFrequency?: "NONE" | "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY" | "CUSTOM";
            /** @example 1 */
            repeatInterval?: number;
            /** @example 5 */
            repeatCount?: number;
            /** @example 2025-12-31T00:00:00.000Z */
            repeatUntil?: string;
            /** @example 前日9時に通知 */
            notes?: string;
            /** @example true */
            isActive: boolean;
        };
        CareScheduleTagDto: {
            /** @example a1b2c3d4-5678-90ab-cdef-1234567890ab */
            id: string;
            /** @example vaccination */
            slug: string;
            /** @example ワクチン */
            label: string;
            /** @example 1 */
            level: number;
            /** @example parent-tag-id */
            parentId?: string;
        };
        CareScheduleItemDto: {
            /** @example a6f7e52f-4a3b-4a76-9870-1234567890ab */
            id: string;
            /** @example 年次健康診断 */
            name: string;
            /** @example 年次健康診断 */
            title: string;
            /** @example 毎年の定期健診 */
            description: string;
            /** @example 2025-09-01T00:00:00.000Z */
            scheduleDate: string;
            /** @example 2025-09-01T01:00:00.000Z */
            endDate?: string;
            /** @example Asia/Tokyo */
            timezone?: string;
            /**
             * @example CARE
             * @enum {string}
             */
            scheduleType: "BREEDING" | "CARE" | "APPOINTMENT" | "REMINDER" | "MAINTENANCE";
            /**
             * @example PENDING
             * @enum {string}
             */
            status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
            /**
             * @example HEALTH_CHECK
             * @enum {string|null}
             */
            careType: "VACCINATION" | "HEALTH_CHECK" | "GROOMING" | "DENTAL_CARE" | "MEDICATION" | "SURGERY" | "OTHER" | null;
            /**
             * @example MEDIUM
             * @enum {string}
             */
            priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
            /** @example FREQ=YEARLY;INTERVAL=1 */
            recurrenceRule?: string;
            /** @example f3a2c1d7-1234-5678-90ab-cdef12345678 */
            assignedTo: string;
            cat: components["schemas"]["CareScheduleCatDto"] | null;
            /** @description 対象猫の配列 */
            cats: components["schemas"]["CareScheduleCatDto"][];
            reminders: components["schemas"]["CareScheduleReminderDto"][];
            tags: components["schemas"]["CareScheduleTagDto"][];
            /** @example 2025-08-01T00:00:00.000Z */
            createdAt: string;
            /** @example 2025-08-15T12:34:56.000Z */
            updatedAt: string;
        };
        CareScheduleMetaDto: {
            /** @example 42 */
            total: number;
            /** @example 1 */
            page: number;
            /** @example 20 */
            limit: number;
            /** @example 3 */
            totalPages: number;
        };
        CareScheduleListResponseDto: {
            /** @example true */
            success: boolean;
            data: components["schemas"]["CareScheduleItemDto"][];
            meta: components["schemas"]["CareScheduleMetaDto"];
        };
        ScheduleReminderDto: {
            /** @enum {string} */
            timingType: "ABSOLUTE" | "RELATIVE";
            /**
             * @description 指定日時 (ISO8601)
             * @example 2025-08-01T09:00:00.000Z
             */
            remindAt?: string;
            /**
             * @description 相対リマインドの値
             * @example 2
             */
            offsetValue?: number;
            /**
             * @example DAY
             * @enum {string}
             */
            offsetUnit?: "MINUTE" | "HOUR" | "DAY" | "WEEK" | "MONTH";
            /**
             * @example START_DATE
             * @enum {string}
             */
            relativeTo?: "START_DATE" | "END_DATE" | "CUSTOM_DATE";
            /**
             * @example IN_APP
             * @enum {string}
             */
            channel: "IN_APP" | "EMAIL" | "SMS" | "PUSH";
            /**
             * @example NONE
             * @enum {string}
             */
            repeatFrequency?: "NONE" | "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY" | "CUSTOM";
            /**
             * @description 繰り返し間隔
             * @example 1
             */
            repeatInterval?: number;
            /**
             * @description 繰り返し回数
             * @example 5
             */
            repeatCount?: number;
            /**
             * @description 繰り返し終了日時
             * @example 2025-12-31T00:00:00.000Z
             */
            repeatUntil?: string;
            /**
             * @description 備考
             * @example 前日9時に通知
             */
            notes?: string;
            /**
             * @description 有効フラグ
             * @example true
             */
            isActive?: boolean;
        };
        CreateCareScheduleDto: {
            /**
             * @description 対象猫IDの配列
             * @example [
             *       "e7b6a7a7-2d7f-4b2f-9f3a-1c2b3d4e5f60"
             *     ]
             */
            catIds: string[];
            /**
             * @description ケア名
             * @example 年次健康診断
             */
            name: string;
            /**
             * @description ケア種別
             * @example HEALTH_CHECK
             * @enum {string}
             */
            careType: "VACCINATION" | "HEALTH_CHECK" | "GROOMING" | "DENTAL_CARE" | "MEDICATION" | "SURGERY" | "OTHER";
            /**
             * @description 予定日 (ISO8601)
             * @example 2025-09-01
             */
            scheduledDate: string;
            /**
             * @description 終了日時 (ISO8601)
             * @example 2025-09-01T10:00:00.000Z
             */
            endDate?: string;
            /**
             * @description タイムゾーン
             * @example Asia/Tokyo
             */
            timezone?: string;
            /**
             * @description ケア名/詳細
             * @example 健康診断 (年1回)
             */
            description?: string;
            /**
             * @example MEDIUM
             * @enum {string}
             */
            priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
            /**
             * @description RRULE形式などの繰り返しルール
             * @example FREQ=YEARLY;INTERVAL=1
             */
            recurrenceRule?: string;
            /** @description リマインダー設定 */
            reminders?: components["schemas"]["ScheduleReminderDto"][];
            /** @description 関連ケアタグID (最大3階層) */
            careTagIds?: string[];
        };
        CareScheduleResponseDto: {
            /** @example true */
            success: boolean;
            data: components["schemas"]["CareScheduleItemDto"];
        };
        CompleteCareMedicalRecordDto: Record<string, never>;
        CompleteCareDto: {
            /**
             * @description 完了日 (YYYY-MM-DD)
             * @example 2025-08-10
             */
            completedDate?: string;
            /**
             * @description 次回予定日 (YYYY-MM-DD)
             * @example 2026-08-10
             */
            nextScheduledDate?: string;
            /**
             * @description メモ
             * @example 体調良好。次回はワクチンA。
             */
            notes?: string;
            medicalRecord?: components["schemas"]["CompleteCareMedicalRecordDto"];
        };
        CareCompleteResponseDto: {
            /** @example true */
            success: boolean;
            /** @example {
             *       "scheduleId": "a6f7e52f-4a3b-4a76-9870-1234567890ab",
             *       "recordId": "bcdef123-4567-890a-bcde-f1234567890a",
             *       "medicalRecordId": "f1234567-89ab-cdef-0123-456789abcdef"
             *     } */
            data: Record<string, never>;
        };
        MedicalRecordSymptomDto: {
            /** @example くしゃみ */
            label: string;
            /** @example 1週間継続 */
            note?: string;
        };
        MedicalRecordMedicationDto: {
            /** @example 抗生物質 */
            name: string;
            /** @example 朝晩1錠 */
            dosage?: string;
        };
        MedicalRecordCatDto: {
            /** @example e7b6a7a7-2d7f-4b2f-9f3a-1c2b3d4e5f60 */
            id: string;
            /** @example ミケ */
            name: string;
        };
        MedicalRecordScheduleDto: {
            /** @example a6f7e52f-4a3b-4a76-9870-1234567890ab */
            id: string;
            /** @example ワクチン接種 */
            name: string;
        };
        MedicalRecordTagDto: {
            /** @example tag-123 */
            id: string;
            /** @example vaccination */
            slug: string;
            /** @example ワクチン */
            label: string;
            /** @example 1 */
            level: number;
            /** @example parent-tag */
            parentId?: string;
        };
        MedicalRecordAttachmentDto: {
            /** @example https://cdn.example.com/xray.png */
            url: string;
            /** @example 胸部レントゲン */
            description?: string;
            /** @example xray.png */
            fileName?: string;
            /** @example image/png */
            fileType?: string;
            /** @example 204800 */
            fileSize?: number;
            /** @example 2025-08-10T09:30:00.000Z */
            capturedAt?: string;
        };
        MedicalRecordItemDto: {
            /** @example bcdef123-4567-890a-bcde-f1234567890a */
            id: string;
            /** @example 2025-08-10T00:00:00.000Z */
            visitDate: string;
            /**
             * @example CHECKUP
             * @enum {string|null}
             */
            visitType: "CHECKUP" | "EMERGENCY" | "SURGERY" | "FOLLOW_UP" | "VACCINATION" | "OTHER" | null;
            /** @example ねこクリニック東京 */
            hospitalName?: string;
            /** @example くしゃみが止まらない */
            symptom?: string;
            symptomDetails?: components["schemas"]["MedicalRecordSymptomDto"][];
            /** @example 猫風邪 */
            diseaseName?: string;
            /** @example 猫風邪の兆候 */
            diagnosis?: string;
            /** @example 抗生物質を5日間投与 */
            treatmentPlan?: string;
            medications?: components["schemas"]["MedicalRecordMedicationDto"][];
            /** @example 2025-08-13T00:00:00.000Z */
            followUpDate?: string;
            /**
             * @example TREATING
             * @enum {string}
             */
            status: "TREATING" | "COMPLETED";
            /** @example 食欲は戻ってきた */
            notes?: string;
            cat: components["schemas"]["MedicalRecordCatDto"];
            schedule?: components["schemas"]["MedicalRecordScheduleDto"] | null;
            tags: components["schemas"]["MedicalRecordTagDto"][];
            attachments: components["schemas"]["MedicalRecordAttachmentDto"][];
            /** @example f3a2c1d7-1234-5678-90ab-cdef12345678 */
            recordedBy: string;
            /** @example 2025-08-10T09:30:00.000Z */
            createdAt: string;
            /** @example 2025-08-15T12:34:56.000Z */
            updatedAt: string;
        };
        MedicalRecordMetaDto: {
            /** @example 42 */
            total: number;
            /** @example 1 */
            page: number;
            /** @example 20 */
            limit: number;
            /** @example 3 */
            totalPages: number;
        };
        MedicalRecordListResponseDto: {
            /** @example true */
            success: boolean;
            data: components["schemas"]["MedicalRecordItemDto"][];
            meta: components["schemas"]["MedicalRecordMetaDto"];
        };
        MedicalRecordAttachmentInputDto: {
            /** @example https://cdn.example.com/xray.png */
            url: string;
            /** @example 胸部レントゲン */
            description?: string;
            /** @example xray.png */
            fileName?: string;
            /** @example image/png */
            fileType?: string;
            /** @example 204800 */
            fileSize?: number;
            /** @example 2025-08-10T09:30:00.000Z */
            capturedAt?: string;
        };
        CreateMedicalRecordDto: {
            /**
             * @description 猫ID
             * @example e7b6a7a7-2d7f-4b2f-9f3a-1c2b3d4e5f60
             */
            catId: string;
            /**
             * @description スケジュールID
             * @example a6f7e52f-4a3b-4a76-9870-1234567890ab
             */
            scheduleId?: string;
            /**
             * @description 受診日
             * @example 2025-08-10
             */
            visitDate: string;
            /**
             * @example CHECKUP
             * @enum {string}
             */
            visitType?: "CHECKUP" | "EMERGENCY" | "SURGERY" | "FOLLOW_UP" | "VACCINATION" | "OTHER";
            /** @example ねこクリニック東京 */
            hospitalName?: string;
            /** @example くしゃみが止まらない */
            symptom?: string;
            symptomDetails?: components["schemas"]["MedicalRecordSymptomDto"][];
            /** @example 猫風邪 */
            diseaseName?: string;
            /** @example 猫風邪の兆候 */
            diagnosis?: string;
            /** @example 抗生物質を5日間投与 */
            treatmentPlan?: string;
            medications?: components["schemas"]["MedicalRecordMedicationDto"][];
            /** @example 2025-08-13 */
            followUpDate?: string;
            /**
             * @default TREATING
             * @example TREATING
             * @enum {string}
             */
            status: "TREATING" | "COMPLETED";
            /** @example 食欲も戻りつつあり */
            notes?: string;
            /** @description 関連ケアタグID */
            careTagIds?: string[];
            /** @description 添付ファイル */
            attachments?: components["schemas"]["MedicalRecordAttachmentInputDto"][];
        };
        MedicalRecordResponseDto: {
            /** @example true */
            success: boolean;
            data: components["schemas"]["MedicalRecordItemDto"];
        };
        CreateTagDto: {
            /**
             * @description タグ名
             * @example Indoor
             */
            name: string;
            /**
             * @description タググループID
             * @example aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee
             */
            groupId: string;
            /**
             * @description カラーコード
             * @example #3B82F6
             */
            color?: string;
            /**
             * @description テキストカラーコード
             * @example #FFFFFF
             */
            textColor?: string;
            /**
             * @description 説明
             * @example 室内飼いタグ
             */
            description?: string;
            /**
             * @description 手動操作で利用可能か
             * @example true
             */
            allowsManual?: boolean;
            /**
             * @description 自動ルールで利用可能か
             * @example true
             */
            allowsAutomation?: boolean;
            /**
             * @description 表示順
             * @example 10
             */
            displayOrder?: number;
            /** @description 任意のメタデータ */
            metadata?: Record<string, never>;
            /**
             * @description アクティブかどうか
             * @example true
             */
            isActive?: boolean;
        };
        TagOrderItemDto: {
            /**
             * Format: uuid
             * @description タグID
             */
            id: string;
            /**
             * @description 表示順
             * @example 12
             */
            displayOrder: number;
            /**
             * Format: uuid
             * @description 所属タググループID
             */
            groupId?: string;
        };
        ReorderTagsDto: {
            items: components["schemas"]["TagOrderItemDto"][];
        };
        UpdateTagDto: {
            /**
             * @description タグ名
             * @example Indoor
             */
            name?: string;
            /**
             * @description タググループID
             * @example aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee
             */
            groupId?: string;
            /**
             * @description カラーコード
             * @example #3B82F6
             */
            color?: string;
            /**
             * @description テキストカラーコード
             * @example #FFFFFF
             */
            textColor?: string;
            /**
             * @description 説明
             * @example 室内飼いタグ
             */
            description?: string;
            /**
             * @description 手動操作で利用可能か
             * @example true
             */
            allowsManual?: boolean;
            /**
             * @description 自動ルールで利用可能か
             * @example true
             */
            allowsAutomation?: boolean;
            /**
             * @description 表示順
             * @example 10
             */
            displayOrder?: number;
            /** @description 任意のメタデータ */
            metadata?: Record<string, never>;
            /**
             * @description アクティブかどうか
             * @example true
             */
            isActive?: boolean;
        };
        AssignTagDto: {
            /**
             * @description タグID
             * @example aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee
             */
            tagId: string;
        };
        CreateTagCategoryDto: {
            /**
             * @description ユニークキー (未指定時は名前から生成)
             * @example cats_status
             */
            key?: string;
            /**
             * @description カテゴリ名
             * @example 猫ステータス
             */
            name: string;
            /** @description カテゴリの説明 */
            description?: string;
            /**
             * @description カテゴリの代表カラー
             * @example #6366F1
             */
            color?: string;
            /**
             * @description カテゴリに使用するテキストカラー
             * @example #111827
             */
            textColor?: string;
            /** @description 表示順 */
            displayOrder?: number;
            /** @description 利用するスコープ一覧 */
            scopes?: string[];
            /**
             * @description アクティブかどうか
             * @example true
             */
            isActive?: boolean;
        };
        TagCategoryOrderItemDto: {
            /**
             * Format: uuid
             * @description カテゴリID
             */
            id: string;
            /**
             * @description 表示順
             * @example 10
             */
            displayOrder: number;
        };
        ReorderTagCategoriesDto: {
            items: components["schemas"]["TagCategoryOrderItemDto"][];
        };
        UpdateTagCategoryDto: {
            /**
             * @description ユニークキー (未指定時は名前から生成)
             * @example cats_status
             */
            key?: string;
            /**
             * @description カテゴリ名
             * @example 猫ステータス
             */
            name?: string;
            /** @description カテゴリの説明 */
            description?: string;
            /**
             * @description カテゴリの代表カラー
             * @example #6366F1
             */
            color?: string;
            /**
             * @description カテゴリに使用するテキストカラー
             * @example #111827
             */
            textColor?: string;
            /** @description 表示順 */
            displayOrder?: number;
            /** @description 利用するスコープ一覧 */
            scopes?: string[];
            /**
             * @description アクティブかどうか
             * @example true
             */
            isActive?: boolean;
        };
        CreateTagGroupDto: {
            /**
             * @description 所属カテゴリID
             * @example aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee
             */
            categoryId: string;
            /**
             * @description グループ名
             * @example 屋内管理
             */
            name: string;
            /** @description グループの説明 */
            description?: string;
            /**
             * @description 表示順
             * @example 10
             */
            displayOrder?: number;
            /**
             * @description アクティブかどうか
             * @example true
             */
            isActive?: boolean;
            /**
             * @description グループ表示用のカラー
             * @example #3B82F6
             */
            color?: string;
            /**
             * @description グループタイトルのテキストカラー
             * @example #111827
             */
            textColor?: string;
        };
        TagGroupOrderItemDto: {
            /**
             * Format: uuid
             * @description グループID
             */
            id: string;
            /**
             * @description 表示順
             * @example 10
             */
            displayOrder: number;
            /**
             * Format: uuid
             * @description 移動先カテゴリID
             */
            categoryId?: string;
        };
        ReorderTagGroupDto: {
            items: components["schemas"]["TagGroupOrderItemDto"][];
        };
        UpdateTagGroupDto: {
            /**
             * @description 所属カテゴリID
             * @example aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee
             */
            categoryId?: string;
            /**
             * @description グループ名
             * @example 屋内管理
             */
            name?: string;
            /** @description グループの説明 */
            description?: string;
            /**
             * @description 表示順
             * @example 10
             */
            displayOrder?: number;
            /**
             * @description アクティブかどうか
             * @example true
             */
            isActive?: boolean;
            /**
             * @description グループ表示用のカラー
             * @example #3B82F6
             */
            color?: string;
            /**
             * @description グループタイトルのテキストカラー
             * @example #111827
             */
            textColor?: string;
        };
        CreateTagAutomationRuleDto: {
            /** @description ルールの一意なキー（自動生成可能） */
            key?: string;
            /** @description ルール名 */
            name: string;
            /** @description ルールの説明 */
            description?: string;
            /**
             * @description トリガータイプ
             * @example EVENT
             * @enum {string}
             */
            triggerType: "EVENT" | "SCHEDULE" | "MANUAL";
            /**
             * @description イベントタイプ
             * @example BREEDING_PLANNED
             * @enum {string}
             */
            eventType: "BREEDING_PLANNED" | "BREEDING_CONFIRMED" | "PREGNANCY_CONFIRMED" | "KITTEN_REGISTERED" | "AGE_THRESHOLD" | "PAGE_ACTION" | "CUSTOM";
            /**
             * @description 適用範囲（スコープ）
             * @example breeding
             */
            scope?: string;
            /**
             * @description ルールが有効かどうか
             * @default true
             */
            isActive: boolean;
            /**
             * @description 優先度（-100から100、大きいほど優先）
             * @default 0
             */
            priority: number;
            /**
             * @description ルール設定（JSON）
             * @example {
             *       "tagIds": [
             *         "tag-id-1",
             *         "tag-id-2"
             *       ]
             *     }
             */
            config?: Record<string, never>;
        };
        UpdateTagAutomationRuleDto: {
            /** @description ルールの一意なキー（自動生成可能） */
            key?: string;
            /** @description ルール名 */
            name?: string;
            /** @description ルールの説明 */
            description?: string;
            /**
             * @description トリガータイプ
             * @example EVENT
             * @enum {string}
             */
            triggerType?: "EVENT" | "SCHEDULE" | "MANUAL";
            /**
             * @description イベントタイプ
             * @example BREEDING_PLANNED
             * @enum {string}
             */
            eventType?: "BREEDING_PLANNED" | "BREEDING_CONFIRMED" | "PREGNANCY_CONFIRMED" | "KITTEN_REGISTERED" | "AGE_THRESHOLD" | "PAGE_ACTION" | "CUSTOM";
            /**
             * @description 適用範囲（スコープ）
             * @example breeding
             */
            scope?: string;
            /**
             * @description ルールが有効かどうか
             * @default true
             */
            isActive: boolean;
            /**
             * @description 優先度（-100から100、大きいほど優先）
             * @default 0
             */
            priority: number;
            /**
             * @description ルール設定（JSON）
             * @example {
             *       "tagIds": [
             *         "tag-id-1",
             *         "tag-id-2"
             *       ]
             *     }
             */
            config?: Record<string, never>;
        };
        CreateStaffDto: Record<string, never>;
        UpdateStaffDto: Record<string, never>;
        CreateShiftDto: Record<string, never>;
        UpdateShiftDto: Record<string, never>;
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
};
export type $defs = Record<string, never>;
export interface operations {
    MasterDataController_getGenders: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 性別マスタデータを返却 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AuthController_login: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["LoginDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AuthController_register: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["LoginDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AuthController_setPassword: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["LoginDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AuthController_changePassword: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ChangePasswordDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AuthController_requestPasswordReset: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RequestPasswordResetDto"];
            };
        };
        responses: {
            /** @description リセット手順をメールで送信 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AuthController_resetPassword: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ResetPasswordDto"];
            };
        };
        responses: {
            /** @description パスワードがリセットされました */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 無効または期限切れのトークン */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AuthController_refresh: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RefreshTokenDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AuthController_logout: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    CatsController_findAll: {
        parameters: {
            query?: {
                /** @description ページ番号 */
                page?: number;
                /** @description 1ページあたりの件数 */
                limit?: number;
                /** @description 検索キーワード */
                search?: string;
                /** @description 品種ID */
                breedId?: string;
                /** @description 毛色ID */
                coatColorId?: string;
                /** @description 性別 */
                gender?: "MALE" | "FEMALE" | "NEUTER" | "SPAY" | "1" | "2" | "3" | "4";
                /** @description 最小年齢 */
                ageMin?: number;
                /** @description 最大年齢 */
                ageMax?: number;
                /** @description ソート項目 */
                sortBy?: string;
                /** @description ソート順 */
                sortOrder?: string;
                /** @description ステータス */
                status?: unknown;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 猫データの一覧 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    CatsController_create: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateCatDto"];
            };
        };
        responses: {
            /** @description 猫データが正常に作成されました */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 無効なデータです */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    CatsController_getStatistics: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 統計情報 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    CatsController_findOne: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description 猫データのID */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 猫データ */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 猫データが見つかりません */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    CatsController_remove: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description 猫データのID */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 猫データが正常に削除されました */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 猫データが見つかりません */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    CatsController_update: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description 猫データのID */
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateCatDto"];
            };
        };
        responses: {
            /** @description 猫データが正常に更新されました */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 無効なデータです */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 猫データが見つかりません */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    CatsController_getBreedingHistory: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description 猫データのID */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 繁殖履歴 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 猫データが見つかりません */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    CatsController_getCareHistory: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description 猫データのID */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description ケア履歴 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 猫データが見つかりません */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    CatsController_getGenders: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 性別マスタデータを返却 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    PedigreeController_findAll: {
        parameters: {
            query?: {
                /** @description ページ番号 */
                page?: number;
                /** @description 1ページあたりの件数 */
                limit?: number;
                /** @description 検索キーワード */
                search?: string;
                /** @description 品種ID */
                breedId?: string;
                /** @description 毛色ID */
                coatColorId?: string;
                /** @description 性別 (1: オス, 2: メス) */
                gender?: string;
                /** @description キャッテリー名 */
                catName2?: string;
                /** @description 目の色 */
                eyeColor?: string;
                /** @description ソート項目 */
                sortBy?: string;
                /** @description ソート順 */
                sortOrder?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 血統書データの一覧 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    PedigreeController_create: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreatePedigreeDto"];
            };
        };
        responses: {
            /** @description 血統書データが正常に作成されました */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 無効なデータです */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 管理者権限が必要です */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    PedigreeController_findByPedigreeId: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description 血統書番号 */
                pedigreeId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 血統書データ */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 血統書データが見つかりません */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    PedigreeController_findOne: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description 血統書データのID */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 血統書データ */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 血統書データが見つかりません */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    PedigreeController_remove: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description 血統書データのID */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 血統書データが正常に削除されました */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 管理者権限が必要です */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 血統書データが見つかりません */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    PedigreeController_update: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description 血統書データのID */
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdatePedigreeDto"];
            };
        };
        responses: {
            /** @description 血統書データが正常に更新されました */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 無効なデータです */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 管理者権限が必要です */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 血統書データが見つかりません */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    PedigreeController_getFamilyTree: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description 血統書データのID */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 家系図データ */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 血統書データが見つかりません */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    PedigreeController_getFamily: {
        parameters: {
            query?: {
                /** @description 取得する世代数 */
                generations?: number;
            };
            header?: never;
            path: {
                /** @description 血統書データのID */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 家系図データ */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 血統書データが見つかりません */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    PedigreeController_getDescendants: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description 血統書データのID */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 子孫データ */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 血統書データが見つかりません */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    BreedsController_findAll: {
        parameters: {
            query?: {
                /** @description ページ番号 */
                page?: number;
                /** @description 1ページあたりの件数 */
                limit?: number;
                /** @description 検索キーワード */
                search?: string;
                /** @description ソート項目 */
                sortBy?: string;
                /** @description ソート順 */
                sortOrder?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 品種データの一覧 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    BreedsController_create: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateBreedDto"];
            };
        };
        responses: {
            /** @description 品種データが正常に作成されました */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 無効なデータです */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 管理者権限が必要です */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    BreedsController_getStatistics: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 統計情報 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    BreedsController_findOne: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description 品種データのID */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 品種データ */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 品種データが見つかりません */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    BreedsController_remove: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description 品種データのID */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 品種データが正常に削除されました */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 管理者権限が必要です */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 品種データが見つかりません */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    BreedsController_update: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description 品種データのID */
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateBreedDto"];
            };
        };
        responses: {
            /** @description 品種データが正常に更新されました */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 無効なデータです */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 管理者権限が必要です */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 品種データが見つかりません */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    CoatColorsController_findAll: {
        parameters: {
            query?: {
                /** @description ページ番号 */
                page?: number;
                /** @description 1ページあたりの件数 */
                limit?: number;
                /** @description 検索キーワード */
                search?: string;
                /** @description ソート項目 */
                sortBy?: string;
                /** @description ソート順 */
                sortOrder?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 毛色データの一覧 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    CoatColorsController_create: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateCoatColorDto"];
            };
        };
        responses: {
            /** @description 毛色データが正常に作成されました */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 無効なデータです */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 管理者権限が必要です */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    CoatColorsController_getStatistics: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 統計情報 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    CoatColorsController_findOne: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description 毛色データのID */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 毛色データ */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 毛色データが見つかりません */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    CoatColorsController_remove: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description 毛色データのID */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 毛色データが正常に削除されました */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 管理者権限が必要です */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 毛色データが見つかりません */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    CoatColorsController_update: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description 毛色データのID */
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateCoatColorDto"];
            };
        };
        responses: {
            /** @description 毛色データが正常に更新されました */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 無効なデータです */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 管理者権限が必要です */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 毛色データが見つかりません */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    BreedingController_findAll: {
        parameters: {
            query?: {
                page?: number;
                limit?: number;
                /** @description メス猫ID */
                femaleId?: string;
                /** @description オス猫ID */
                maleId?: string;
                /** @description 開始日(YYYY-MM-DD) */
                dateFrom?: string;
                /** @description 終了日(YYYY-MM-DD) */
                dateTo?: string;
                sortBy?: string;
                sortOrder?: "asc" | "desc";
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    BreedingController_create: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateBreedingDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    BreedingController_findNgRules: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    BreedingController_createNgRule: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateBreedingNgRuleDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    BreedingController_removeNgRule: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    BreedingController_updateNgRule: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateBreedingNgRuleDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    BreedingController_test: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    BreedingController_findAllPregnancyChecks: {
        parameters: {
            query?: {
                /** @description 母親の猫ID */
                motherId?: string;
                /** @description 妊娠状態 */
                status?: "CONFIRMED" | "SUSPECTED" | "NEGATIVE" | "ABORTED";
                /** @description ページ番号 */
                page?: number;
                /** @description 1ページあたりの件数 */
                limit?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    BreedingController_createPregnancyCheck: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreatePregnancyCheckDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    BreedingController_removePregnancyCheck: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    BreedingController_updatePregnancyCheck: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdatePregnancyCheckDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    BreedingController_findAllBirthPlans: {
        parameters: {
            query?: {
                /** @description 母親の猫ID */
                motherId?: string;
                /** @description 出産状態 */
                status?: "EXPECTED" | "BORN" | "ABORTED" | "STILLBORN";
                /** @description ページ番号 */
                page?: number;
                /** @description 1ページあたりの件数 */
                limit?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    BreedingController_createBirthPlan: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateBirthPlanDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    BreedingController_removeBirthPlan: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    BreedingController_updateBirthPlan: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateBirthPlanDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    BreedingController_findAllKittenDispositions: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                birthRecordId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    BreedingController_createKittenDisposition: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateKittenDispositionDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    BreedingController_removeKittenDisposition: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    BreedingController_updateKittenDisposition: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateKittenDispositionDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    BreedingController_completeBirthRecord: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    CareController_findSchedules: {
        parameters: {
            query?: {
                page?: number;
                limit?: number;
                /** @description 猫ID */
                catId?: string;
                /** @description ケア種別 */
                careType?: "VACCINATION" | "HEALTH_CHECK" | "GROOMING" | "DENTAL_CARE" | "MEDICATION" | "SURGERY" | "OTHER";
                /** @description 開始日 (YYYY-MM-DD) */
                dateFrom?: string;
                /** @description 終了日 (YYYY-MM-DD) */
                dateTo?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CareScheduleListResponseDto"];
                };
            };
        };
    };
    CareController_addSchedule: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateCareScheduleDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CareScheduleResponseDto"];
                };
            };
        };
    };
    CareController_complete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CompleteCareDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CareCompleteResponseDto"];
                };
            };
        };
    };
    CareController_deleteSchedule: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description スケジュールID */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 削除成功 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    CareController_updateSchedule: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description スケジュールID */
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateCareScheduleDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CareScheduleResponseDto"];
                };
            };
        };
    };
    CareController_findMedicalRecords: {
        parameters: {
            query?: {
                page?: number;
                limit?: number;
                /** @description 猫ID */
                catId?: string;
                /** @description スケジュールID */
                scheduleId?: string;
                visitType?: "CHECKUP" | "EMERGENCY" | "SURGERY" | "FOLLOW_UP" | "VACCINATION" | "OTHER";
                status?: "TREATING" | "COMPLETED";
                /** @description 受診開始日 */
                dateFrom?: string;
                /** @description 受診終了日 */
                dateTo?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MedicalRecordListResponseDto"];
                };
            };
        };
    };
    CareController_addMedicalRecord: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateMedicalRecordDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MedicalRecordResponseDto"];
                };
            };
        };
    };
    TagsController_findAll: {
        parameters: {
            query?: {
                /** @description 非アクティブなタグを含めるか */
                includeInactive?: boolean;
                /** @description 対象スコープ */
                scope?: string[];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    TagsController_create: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateTagDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    TagsController_reorder: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ReorderTagsDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    TagsController_remove: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    TagsController_update: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateTagDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    TagsController_assign: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AssignTagDto"];
            };
        };
        responses: {
            /** @description 付与成功（重複時もOK） */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    TagsController_unassign: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
                tagId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    TagCategoriesController_findAll: {
        parameters: {
            query?: {
                /** @description 非アクティブカテゴリを含める */
                includeInactive?: boolean;
                /** @description 対象スコープ */
                scope?: string[];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    TagCategoriesController_create: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateTagCategoryDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    TagCategoriesController_reorder: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ReorderTagCategoriesDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    TagCategoriesController_remove: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    TagCategoriesController_update: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateTagCategoryDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    TagGroupsController_create: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateTagGroupDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    TagGroupsController_reorder: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ReorderTagGroupDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    TagGroupsController_remove: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    TagGroupsController_update: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateTagGroupDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    TagAutomationController_findRules: {
        parameters: {
            query?: {
                /** @description アクティブなルールのみ取得 */
                active?: boolean;
                /** @description スコープでフィルタ */
                scope?: string;
                /** @description トリガータイプでフィルタ */
                triggerType?: string;
                /** @description イベントタイプでフィルタ */
                eventType?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description ルール一覧を返却 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    TagAutomationController_createRule: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateTagAutomationRuleDto"];
            };
        };
        responses: {
            /** @description ルールを作成しました */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 入力エラー */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    TagAutomationController_findRuleById: {
        parameters: {
            query?: {
                /** @description 実行履歴を含める */
                includeRuns?: boolean;
                /** @description 付与履歴件数を含める */
                includeHistoryCount?: boolean;
            };
            header?: never;
            path: {
                /** @description ルールID */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description ルール詳細を返却 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description ルールが見つかりません */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    TagAutomationController_deleteRule: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description ルールID */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description ルールを削除しました */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description ルールが見つかりません */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    TagAutomationController_updateRule: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description ルールID */
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateTagAutomationRuleDto"];
            };
        };
        responses: {
            /** @description ルールを更新しました */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description ルールが見つかりません */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    TagAutomationController_findRuns: {
        parameters: {
            query?: {
                /** @description ルールIDでフィルタ */
                ruleId?: string;
                /** @description ステータスでフィルタ (PENDING, COMPLETED, FAILED) */
                status?: string;
                /** @description 取得件数の上限 */
                limit?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 実行履歴一覧を返却 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    TagAutomationController_executeRule: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description ルールID */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description ルール実行成功 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    HealthController_check: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    StaffController_findAll: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    StaffController_create: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateStaffDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    StaffController_findOne: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    StaffController_remove: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    StaffController_update: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateStaffDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    StaffController_restore: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ShiftController_findAll: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ShiftController_create: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateShiftDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ShiftController_getCalendarData: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ShiftController_findOne: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ShiftController_remove: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ShiftController_update: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateShiftDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
}

