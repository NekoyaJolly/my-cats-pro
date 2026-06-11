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
    "/api/v1/users": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * ユーザー一覧取得
         * @description SUPER_ADMINは全ユーザー、TENANT_ADMINは自テナントのユーザーを取得します。
         */
        get: operations["UsersController_listUsers"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/users/me": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * 自身のプロフィール取得
         * @description JWTで認証されたユーザー自身のプロフィール情報を取得します。
         */
        get: operations["UsersController_getMe"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /**
         * 自身のプロフィール更新
         * @description JWTで認証されたユーザー自身のプロフィール情報を更新します。各フィールドはオプショナルです。
         */
        patch: operations["UsersController_updateMe"];
        trace?: never;
    };
    "/api/v1/users/invite": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * ユーザー招待
         * @description SUPER_ADMINは任意のテナント、TENANT_ADMINは自テナントにユーザーを招待します。
         */
        post: operations["UsersController_inviteUser"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/users/{id}/role": {
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
        /**
         * ユーザーロール変更
         * @description SUPER_ADMINは任意のユーザー、TENANT_ADMINは自テナントのADMIN/USERのロールを変更します。
         */
        patch: operations["UsersController_updateUserRole"];
        trace?: never;
    };
    "/api/v1/users/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /**
         * ユーザー削除
         * @description SUPER_ADMINは任意のユーザー（自分と他のSUPER_ADMINを除く）、TENANT_ADMINは自テナントのADMIN/USERを削除します。
         */
        delete: operations["UsersController_deleteUser"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/tenants": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * テナント一覧取得
         * @description SuperAdminのみが実行可能。全テナントの一覧を取得します。
         */
        get: operations["TenantsController_listTenants"];
        put?: never;
        /**
         * テナント作成
         * @description SuperAdminのみが実行可能。新しいテナントを作成します。
         */
        post: operations["TenantsController_createTenant"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/tenants/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * テナント詳細取得
         * @description SuperAdminまたはテナント管理者（自テナントのみ）が実行可能。指定IDのテナント詳細を取得します。
         */
        get: operations["TenantsController_getTenantById"];
        put?: never;
        post?: never;
        /**
         * テナント削除
         * @description SuperAdminのみが実行可能。指定IDのテナントを削除します。所属ユーザーがいる場合は削除できません。
         */
        delete: operations["TenantsController_deleteTenant"];
        options?: never;
        head?: never;
        /**
         * テナント更新
         * @description SuperAdminのみが実行可能。指定IDのテナントを更新します。
         */
        patch: operations["TenantsController_updateTenant"];
        trace?: never;
    };
    "/api/v1/tenants/invite-admin": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * テナント管理者を招待
         * @description SuperAdminのみが実行可能。新しいテナントを作成し、管理者を招待します。
         */
        post: operations["TenantsController_inviteTenantAdmin"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/tenants/{tenantId}/users/invite": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * ユーザーを招待
         * @description テナント管理者が自分のテナントにユーザーを招待します。
         */
        post: operations["TenantsController_inviteUser"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/tenants/complete-invitation": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * 招待完了
         * @description 招待トークンを使用してユーザー登録を完了します。認証不要。
         */
        post: operations["TenantsController_completeInvitation"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/tenant-settings/tag-color-defaults": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * タグカラーデフォルト設定を取得
         * @description テナントのタグカラーデフォルト設定を取得します。設定が存在しない場合はフロントエンドのデフォルト値を返します。
         */
        get: operations["TenantSettingsController_getTagColorDefaults"];
        /**
         * タグカラーデフォルト設定を更新
         * @description テナントのタグカラーデフォルト設定を更新します。部分更新をサポートしています。
         */
        put: operations["TenantSettingsController_updateTagColorDefaults"];
        post?: never;
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
    "/api/v1/cats/kittens": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 子猫一覧を取得（生後6ヶ月未満、母猫ごとにグループ化） */
        get: operations["CatsController_findKittens"];
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
    "/api/v1/cats/{id}/family": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 猫の家族情報を取得（血統タブ用） */
        get: operations["CatsController_getCatFamily"];
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
    "/api/v1/cats/{id}/weight-records": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 猫の体重記録一覧を取得 */
        get: operations["CatsController_getWeightRecords"];
        put?: never;
        /** 猫の体重記録を追加 */
        post: operations["CatsController_createWeightRecord"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/cats/weight-records/{recordId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 体重記録を取得 */
        get: operations["CatsController_getWeightRecord"];
        put?: never;
        post?: never;
        /** 体重記録を削除 */
        delete: operations["CatsController_deleteWeightRecord"];
        options?: never;
        head?: never;
        /** 体重記録を更新 */
        patch: operations["CatsController_updateWeightRecord"];
        trace?: never;
    };
    "/api/v1/cats/weight-records/bulk": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** 複数の猫の体重を一括登録 */
        post: operations["CatsController_createBulkWeightRecords"];
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
    "/api/v1/pedigrees/next-id": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 次の血統書番号を取得 */
        get: operations["PedigreeController_getNextId"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/pedigrees/print-settings": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 印刷設定を取得 */
        get: operations["PedigreeController_getPrintSettings"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /** 印刷設定を更新 */
        patch: operations["PedigreeController_updatePrintSettings"];
        trace?: never;
    };
    "/api/v1/pedigrees/print-settings/reset": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** 印刷設定をデフォルトにリセット */
        post: operations["PedigreeController_resetPrintSettings"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/pedigrees/pedigree-id/{pedigreeId}/pdf": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 血統書PDFを生成してダウンロード */
        get: operations["PedigreeController_generatePdf"];
        put?: never;
        post?: never;
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
    "/api/v1/print-templates/categories": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["PrintTemplatesController_getCategories"];
        put?: never;
        post: operations["PrintTemplatesController_createCategory"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/print-templates/categories/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["PrintTemplatesController_getCategory"];
        put?: never;
        post?: never;
        delete: operations["PrintTemplatesController_removeCategory"];
        options?: never;
        head?: never;
        patch: operations["PrintTemplatesController_updateCategory"];
        trace?: never;
    };
    "/api/v1/print-templates/data-sources": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["PrintTemplatesController_getDataSources"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/print-templates": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["PrintTemplatesController_findAll"];
        put?: never;
        post: operations["PrintTemplatesController_create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/print-templates/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["PrintTemplatesController_findOne"];
        put?: never;
        post?: never;
        delete: operations["PrintTemplatesController_remove"];
        options?: never;
        head?: never;
        patch: operations["PrintTemplatesController_update"];
        trace?: never;
    };
    "/api/v1/print-templates/{id}/duplicate": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["PrintTemplatesController_duplicate"];
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
    "/api/v1/breeds/master-data": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Pedigree連携用の品種マスターデータを取得 */
        get: operations["BreedsController_getMasterData"];
        put?: never;
        post?: never;
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
    "/api/v1/display-preferences/me": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 自身の表示設定を取得 */
        get: operations["DisplayPreferencesController_getMine"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /** 自身の表示設定を更新 */
        patch: operations["DisplayPreferencesController_updateMine"];
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
    "/api/v1/coat-colors/master-data": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Pedigree連携用の色柄マスターデータを取得 */
        get: operations["CoatColorsController_getMasterData"];
        put?: never;
        post?: never;
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
    "/api/v1/breeding/schedules": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 交配スケジュール一覧の取得 */
        get: operations["BreedingController_findAllBreedingSchedules"];
        put?: never;
        /** 交配スケジュールの作成 */
        post: operations["BreedingController_createBreedingSchedule"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/breeding/schedules/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** 交配スケジュールの削除 */
        delete: operations["BreedingController_removeBreedingSchedule"];
        options?: never;
        head?: never;
        /** 交配スケジュールの更新 */
        patch: operations["BreedingController_updateBreedingSchedule"];
        trace?: never;
    };
    "/api/v1/breeding/schedules/{scheduleId}/checks": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 交配チェック一覧の取得 */
        get: operations["BreedingController_findMatingChecks"];
        put?: never;
        /** 交配チェックの追加 */
        post: operations["BreedingController_createMatingCheck"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/breeding/mating-checks/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** 交配チェックの削除 */
        delete: operations["BreedingController_removeMatingCheck"];
        options?: never;
        head?: never;
        /** 交配チェックの更新 */
        patch: operations["BreedingController_updateMatingCheck"];
        trace?: never;
    };
    "/api/v1/breeding/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** 交配記録の削除 */
        delete: operations["BreedingController_remove"];
        options?: never;
        head?: never;
        /** 交配記録の更新 */
        patch: operations["BreedingController_update"];
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
    "/api/v1/care/medical-records/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 医療記録の詳細取得 */
        get: operations["CareController_findMedicalRecordById"];
        put?: never;
        post?: never;
        /** 医療記録の削除 */
        delete: operations["CareController_deleteMedicalRecord"];
        options?: never;
        head?: never;
        /** 医療記録の更新 */
        patch: operations["CareController_updateMedicalRecord"];
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
    "/api/v1/graduations/cats/{id}/transfer": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** 猫を譲渡（卒業）する */
        post: operations["GraduationController_transferCat"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/graduations": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 卒業猫一覧取得 */
        get: operations["GraduationController_findAllGraduations"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/graduations/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 卒業猫詳細取得 */
        get: operations["GraduationController_findOneGraduation"];
        put?: never;
        post?: never;
        /** 卒業取り消し（緊急時用） */
        delete: operations["GraduationController_cancelGraduation"];
        options?: never;
        head?: never;
        /** 卒業記録の更新 */
        patch: operations["GraduationController_updateGraduation"];
        trace?: never;
    };
    "/api/v1/gallery/upload/signed-url": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * アップロード用Signed URLを生成
         * @description クライアントがGCSへ直接アップロードするためのSigned URLを発行します。有効期限は15分です。
         */
        post: operations["GalleryUploadController_generateUploadUrl"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/gallery/upload/confirm": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * アップロード完了を確認
         * @description クライアントがGCSへアップロード完了後に呼び出し、ファイルの存在を確認します。
         */
        post: operations["GalleryUploadController_confirmUpload"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/gallery/upload/{fileKey}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /**
         * アップロード済みファイルを削除
         * @description 指定されたファイルキーのファイルをGCSから削除します。
         */
        delete: operations["GalleryUploadController_deleteFile"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/gallery": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** ギャラリーエントリ一覧取得 */
        get: operations["GalleryController_findAll"];
        put?: never;
        /** ギャラリーエントリ作成 */
        post: operations["GalleryController_create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/gallery/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** ギャラリーエントリ詳細取得 */
        get: operations["GalleryController_findOne"];
        /** ギャラリーエントリ更新 */
        put: operations["GalleryController_update"];
        post?: never;
        /** ギャラリーエントリ削除 */
        delete: operations["GalleryController_delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/gallery/{id}/media": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** メディア追加 */
        post: operations["GalleryController_addMedia"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/gallery/media/{mediaId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** メディア削除 */
        delete: operations["GalleryController_deleteMedia"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/gallery/bulk": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** 一括登録（子育て中タブ用） */
        post: operations["GalleryController_bulkCreate"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/export": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** データをエクスポート */
        post: operations["ExportController_export"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/import/preview": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** インポートファイルのプレビュー */
        post: operations["ImportController_preview"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/import/cats": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** 猫データのインポート */
        post: operations["ImportController_importCats"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/import/pedigrees": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** 血統書データのインポート */
        post: operations["ImportController_importPedigrees"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/import/tags": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** タグデータのインポート */
        post: operations["ImportController_importTags"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
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
        UpdateProfileDto: {
            /**
             * @description 名
             * @example 太郎
             */
            firstName?: string;
            /**
             * @description 姓
             * @example 山田
             */
            lastName?: string;
            /**
             * @description メールアドレス
             * @example user@example.com
             */
            email?: string;
        };
        InviteUserDto: {
            /**
             * @description 招待するメールアドレス
             * @example user@example.com
             */
            email: string;
            /**
             * @description ユーザーロール
             * @default USER
             * @enum {string}
             */
            role: "USER" | "ADMIN" | "SUPER_ADMIN" | "TENANT_ADMIN";
        };
        UpdateUserRoleDto: {
            /**
             * @description 新しいロール
             * @example ADMIN
             * @enum {string}
             */
            role: "USER" | "ADMIN" | "SUPER_ADMIN" | "TENANT_ADMIN";
        };
        CreateTenantDto: {
            /**
             * @description テナント名
             * @example サンプルテナント
             */
            name: string;
            /**
             * @description テナントスラッグ（未入力の場合は自動生成）
             * @example sample-tenant
             */
            slug?: string;
        };
        UpdateTenantDto: {
            /**
             * @description テナント名
             * @example 更新後テナント名
             */
            name?: string;
            /**
             * @description テナントスラッグ
             * @example updated-tenant
             */
            slug?: string;
            /**
             * @description 有効/無効フラグ
             * @example true
             */
            isActive?: boolean;
        };
        InviteTenantAdminDto: {
            /**
             * @description 招待するメールアドレス
             * @example admin@example.com
             */
            email: string;
            /**
             * @description テナント名
             * @example Sample Tenant
             */
            tenantName: string;
            /**
             * @description テナントスラッグ（URL識別子）
             * @example sample-tenant
             */
            tenantSlug?: string;
        };
        CompleteInvitationDto: {
            /** @description 招待トークン */
            token: string;
            /** @description パスワード */
            password: string;
            /** @description 名 */
            firstName?: string;
            /** @description 姓 */
            lastName?: string;
        };
        ColorSettingDto: {
            /**
             * @description 背景カラー（16進数カラーコード）
             * @example #6366F1
             */
            color: string;
            /**
             * @description テキストカラー（16進数カラーコード）
             * @example #111827
             */
            textColor: string;
        };
        TagColorDefaultsDto: {
            /** @description カテゴリのデフォルトカラー設定 */
            category?: components["schemas"]["ColorSettingDto"];
            /** @description グループのデフォルトカラー設定 */
            group?: components["schemas"]["ColorSettingDto"];
            /** @description タグのデフォルトカラー設定 */
            tag?: components["schemas"]["ColorSettingDto"];
        };
        PartialColorSettingDto: {
            /**
             * @description 背景カラー（16進数カラーコード）
             * @example #6366F1
             */
            color?: string;
            /**
             * @description テキストカラー（16進数カラーコード）
             * @example #111827
             */
            textColor?: string;
        };
        UpdateTagColorDefaultsDto: {
            /** @description カテゴリのデフォルトカラー設定（部分更新可能） */
            category?: components["schemas"]["PartialColorSettingDto"];
            /** @description グループのデフォルトカラー設定（部分更新可能） */
            group?: components["schemas"]["PartialColorSettingDto"];
            /** @description タグのデフォルトカラー設定（部分更新可能） */
            tag?: components["schemas"]["PartialColorSettingDto"];
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
        CreateWeightRecordDto: {
            /**
             * @description 体重（グラム単位）
             * @example 350
             */
            weight: number;
            /**
             * @description 記録日時（省略時は現在日時）
             * @example 2024-01-15T10:00:00.000Z
             */
            recordedAt?: string;
            /**
             * @description メモ
             * @example ミルクをよく飲んでいる
             */
            notes?: string;
        };
        UpdateWeightRecordDto: {
            /**
             * @description 体重（グラム単位）
             * @example 380
             */
            weight?: number;
            /**
             * @description 記録日時
             * @example 2024-01-15T10:00:00.000Z
             */
            recordedAt?: string;
            /**
             * @description メモ
             * @example 順調に成長中
             */
            notes?: string;
        };
        BulkWeightRecordItemDto: {
            /**
             * @description 猫ID
             * @example 550e8400-e29b-41d4-a716-446655440000
             */
            catId: string;
            /**
             * @description 体重（グラム単位）
             * @example 350
             */
            weight: number;
            /**
             * @description メモ
             * @example 元気
             */
            notes?: string;
        };
        CreateBulkWeightRecordsDto: {
            /**
             * @description 記録日時（全レコード共通）
             * @example 2024-01-15T10:00:00.000Z
             */
            recordedAt: string;
            /** @description 体重記録の配列 */
            records: components["schemas"]["BulkWeightRecordItemDto"][];
        };
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
        CreatePrintDocCategoryDto: Record<string, never>;
        UpdatePrintDocCategoryDto: Record<string, never>;
        CreatePrintTemplateDto: Record<string, never>;
        DuplicatePrintTemplateDto: Record<string, never>;
        UpdatePrintTemplateDto: Record<string, never>;
        MasterDataItemDto: {
            /**
             * @description マスターデータのコード
             * @example 26
             */
            code: number;
            /**
             * @description CSV 定義のデフォルト名称
             * @example Maine Coon
             */
            name: string;
            /**
             * @description 画面に表示される名称。個別設定が無い場合は name と同一。
             * @example 26 - Maine Coon
             */
            displayName?: string;
            /**
             * @description このレコードに適用された表示モード
             * @example CODE_AND_NAME
             * @enum {string}
             */
            displayNameMode?: "CANONICAL" | "CODE_AND_NAME" | "CUSTOM";
            /**
             * @description ユーザー上書きが適用された場合に true
             * @example true
             */
            isOverridden?: boolean;
        };
        CreateBreedDto: {
            /** @description 品種コード */
            code: number;
            /** @description 品種名 */
            name: string;
            /** @description 品種の説明 */
            description?: string;
        };
        UpdateBreedDto: Record<string, never>;
        LabelOverrideDto: {
            /**
             * @description 対象コード
             * @example 26
             */
            code?: number;
            /**
             * @description 表示名の上書き
             * @example メインクーン
             */
            label?: string;
        };
        UpdateDisplayPreferenceDto: {
            /**
             * @description 品種マスタの表示モード
             * @enum {string}
             */
            breedNameMode?: "CANONICAL" | "CODE_AND_NAME" | "CUSTOM";
            /**
             * @description 毛色マスタの表示モード
             * @enum {string}
             */
            coatColorNameMode?: "CANONICAL" | "CODE_AND_NAME" | "CUSTOM";
            /** @description 品種コードごとの表示名上書き */
            breedLabelOverrides?: components["schemas"]["LabelOverrideDto"][];
            /** @description 毛色コードごとの表示名上書き */
            coatColorLabelOverrides?: components["schemas"]["LabelOverrideDto"][];
        };
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
        CreateBreedingScheduleDto: {
            /** @description オス猫ID */
            maleId: string;
            /** @description メス猫ID */
            femaleId: string;
            /** @description 開始日 (ISO8601) */
            startDate: string;
            /** @description 期間（日数） */
            duration: number;
            /**
             * @description ステータス
             * @enum {string}
             */
            status?: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
            /** @description メモ */
            notes?: string;
        };
        UpdateBreedingScheduleDto: {
            /** @description オス猫ID */
            maleId?: string;
            /** @description メス猫ID */
            femaleId?: string;
            /** @description 開始日 (ISO8601) */
            startDate?: string;
            /** @description 期間（日数） */
            duration?: number;
            /**
             * @description ステータス
             * @enum {string}
             */
            status?: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
            /** @description メモ */
            notes?: string;
        };
        CreateMatingCheckDto: {
            /** @description チェック日 (ISO8601) */
            checkDate: string;
            /**
             * @description チェック回数
             * @default 1
             */
            count: number;
        };
        UpdateMatingCheckDto: {
            /** @description チェック日 (ISO8601) */
            checkDate?: string;
            /**
             * @description チェック回数
             * @default 1
             */
            count: number;
        };
        UpdateBreedingDto: Record<string, never>;
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
            remindAt?: string | null;
            /** @example 2 */
            offsetValue?: number | null;
            /**
             * @example DAY
             * @enum {string|null}
             */
            offsetUnit?: "MINUTE" | "HOUR" | "DAY" | "WEEK" | "MONTH" | null;
            /**
             * @example START_DATE
             * @enum {string|null}
             */
            relativeTo?: "START_DATE" | "END_DATE" | "CUSTOM_DATE" | null;
            /**
             * @example IN_APP
             * @enum {string}
             */
            channel: "IN_APP" | "EMAIL" | "SMS" | "PUSH";
            /**
             * @example NONE
             * @enum {string|null}
             */
            repeatFrequency?: "NONE" | "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY" | "CUSTOM" | null;
            /** @example 1 */
            repeatInterval?: number | null;
            /** @example 5 */
            repeatCount?: number | null;
            /** @example 2025-12-31T00:00:00.000Z */
            repeatUntil?: string | null;
            /** @example 前日9時に通知 */
            notes?: string | null;
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
            parentId?: string | null;
        };
        CareScheduleItemDto: {
            /** @example a6f7e52f-4a3b-4a76-9870-1234567890ab */
            id: string;
            /** @example 年次健康診断 */
            name: string;
            /** @example 年次健康診断 */
            title: string;
            /** @example 毎年の定期健診 */
            description: string | null;
            /** @example 2025-09-01T00:00:00.000Z */
            scheduleDate: string;
            /** @example 2025-09-01T01:00:00.000Z */
            endDate?: string | null;
            /** @example Asia/Tokyo */
            timezone?: string | null;
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
            recurrenceRule?: string | null;
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
            /**
             * @example {
             *       "scheduleId": "a6f7e52f-4a3b-4a76-9870-1234567890ab",
             *       "recordId": "bcdef123-4567-890a-bcde-f1234567890a",
             *       "medicalRecordId": "f1234567-89ab-cdef-0123-456789abcdef"
             *     }
             */
            data: Record<string, never>;
        };
        MedicalRecordVisitTypeDto: {
            /** @example c4a52a14-8d93-4b87-9f8c-7a6c2ef81234 */
            id: string;
            /** @example CHECKUP */
            key?: Record<string, never>;
            /** @example 健康診断 */
            name: string;
            /** @example 定期的な健康診断 */
            description?: Record<string, never>;
            /** @example 1 */
            displayOrder: number;
            /** @example true */
            isActive: boolean;
        };
        MedicalRecordSymptomDto: {
            /** @example くしゃみ */
            label: string;
            /** @example 1週間継続 */
            note?: Record<string, never>;
        };
        MedicalRecordMedicationDto: {
            /** @example 抗生物質 */
            name: string;
            /** @example 朝晩1錠 */
            dosage?: Record<string, never>;
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
            /** @example ワクチン */
            name: string;
            /** @example #3B82F6 */
            color?: Record<string, never>;
            /** @example #FFFFFF */
            textColor?: Record<string, never>;
            /** @example group-123 */
            groupId: string;
            /** @example 医療 */
            groupName?: Record<string, never>;
            /** @example category-456 */
            categoryId?: Record<string, never>;
            /** @example 医療タグ */
            categoryName?: Record<string, never>;
        };
        MedicalRecordAttachmentDto: {
            /** @example https://cdn.example.com/xray.png */
            url: string;
            /** @example 胸部レントゲン */
            description?: Record<string, never>;
            /** @example xray.png */
            fileName?: Record<string, never>;
            /** @example image/png */
            fileType?: Record<string, never>;
            /** @example 204800 */
            fileSize?: Record<string, never>;
            /** @example 2025-08-10T09:30:00.000Z */
            capturedAt?: Record<string, never>;
        };
        MedicalRecordItemDto: {
            /** @example bcdef123-4567-890a-bcde-f1234567890a */
            id: string;
            /** @example 2025-08-10T00:00:00.000Z */
            visitDate: string;
            visitType: components["schemas"]["MedicalRecordVisitTypeDto"] | null;
            /** @example ねこクリニック東京 */
            hospitalName?: Record<string, never>;
            /** @example くしゃみが止まらない */
            symptom?: Record<string, never>;
            symptomDetails?: components["schemas"]["MedicalRecordSymptomDto"][];
            /** @example 猫風邪 */
            diseaseName?: Record<string, never>;
            /** @example 猫風邪の兆候 */
            diagnosis?: Record<string, never>;
            /** @example 抗生物質を5日間投与 */
            treatmentPlan?: Record<string, never>;
            medications?: components["schemas"]["MedicalRecordMedicationDto"][];
            /** @example 2025-08-13T00:00:00.000Z */
            followUpDate?: Record<string, never>;
            /**
             * @example TREATING
             * @enum {string}
             */
            status: "TREATING" | "COMPLETED";
            /** @example 食欲は戻ってきた */
            notes?: Record<string, never>;
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
             * @description 受診種別ID
             * @example c4a52a14-8d93-4b87-9f8c-7a6c2ef81234
             */
            visitTypeId?: string;
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
            /** @description 関連タグID */
            tagIds?: string[];
            /** @description 添付ファイル */
            attachments?: components["schemas"]["MedicalRecordAttachmentInputDto"][];
        };
        MedicalRecordResponseDto: {
            /** @example true */
            success: boolean;
            data: components["schemas"]["MedicalRecordItemDto"];
        };
        UpdateMedicalRecordDto: {
            /**
             * @description 猫ID
             * @example e7b6a7a7-2d7f-4b2f-9f3a-1c2b3d4e5f60
             */
            catId?: string;
            /**
             * @description スケジュールID
             * @example a6f7e52f-4a3b-4a76-9870-1234567890ab
             */
            scheduleId?: string;
            /**
             * @description 受診日
             * @example 2025-08-10
             */
            visitDate?: string;
            /**
             * @description 受診種別ID
             * @example c4a52a14-8d93-4b87-9f8c-7a6c2ef81234
             */
            visitTypeId?: string;
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
            /** @description 関連タグID */
            tagIds?: string[];
            /** @description 添付ファイル */
            attachments?: components["schemas"]["MedicalRecordAttachmentInputDto"][];
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
            /** @description ルール名（未入力時は自動生成） */
            name?: string;
            /** @description ルールの説明 */
            description?: Record<string, never>;
            /**
             * @description トリガータイプ
             * @example EVENT
             * @enum {string}
             */
            triggerType: "EVENT" | "SCHEDULE" | "MANUAL";
            /**
             * @description イベントタイプ
             * @example PAGE_ACTION
             * @enum {string}
             */
            eventType?: "BREEDING_PLANNED" | "BREEDING_CONFIRMED" | "PREGNANCY_CONFIRMED" | "KITTEN_REGISTERED" | "AGE_THRESHOLD" | "CUSTOM" | "PAGE_ACTION" | "TAG_ASSIGNED";
            /**
             * @description 適用範囲（スコープ）
             * @example breeding
             */
            scope?: Record<string, never>;
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
             *       ],
             *       "actionType": "ASSIGN"
             *     }
             */
            config?: Record<string, never>;
        };
        UpdateTagAutomationRuleDto: {
            /** @description ルールの一意なキー（自動生成可能） */
            key?: string;
            /** @description ルール名（未入力時は自動生成） */
            name?: string;
            /** @description ルールの説明 */
            description?: Record<string, never>;
            /**
             * @description トリガータイプ
             * @example EVENT
             * @enum {string}
             */
            triggerType?: "EVENT" | "SCHEDULE" | "MANUAL";
            /**
             * @description イベントタイプ
             * @example PAGE_ACTION
             * @enum {string}
             */
            eventType?: "BREEDING_PLANNED" | "BREEDING_CONFIRMED" | "PREGNANCY_CONFIRMED" | "KITTEN_REGISTERED" | "AGE_THRESHOLD" | "CUSTOM" | "PAGE_ACTION" | "TAG_ASSIGNED";
            /**
             * @description 適用範囲（スコープ）
             * @example breeding
             */
            scope?: Record<string, never>;
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
             *       ],
             *       "actionType": "ASSIGN"
             *     }
             */
            config?: Record<string, never>;
        };
        CreateStaffDto: Record<string, never>;
        UpdateStaffDto: Record<string, never>;
        CreateShiftDto: Record<string, never>;
        UpdateShiftDto: Record<string, never>;
        TransferCatDto: {
            /**
             * @description 譲渡日
             * @example 2025-11-11
             */
            transferDate: string;
            /**
             * @description 譲渡先
             * @example 山田家
             */
            destination: string;
            /**
             * @description 備考
             * @example 譲渡先は愛情深い家庭です
             */
            notes?: string;
        };
        UpdateGraduationDto: {
            /**
             * @description 譲渡日
             * @example 2025-11-11
             */
            transferDate?: string;
            /**
             * @description 譲渡先
             * @example 山田家
             */
            destination?: string;
            /**
             * @description 備考
             * @example 譲渡先は愛情深い家庭です
             */
            notes?: string;
        };
        GenerateUploadUrlDto: {
            /**
             * @description ファイル名
             * @example kitten-photo-1.jpg
             */
            fileName: string;
            /**
             * @description コンテンツタイプ
             * @example image/jpeg
             * @enum {string}
             */
            contentType: "image/jpeg" | "image/png" | "image/webp";
            /**
             * @description ファイルサイズ（バイト）
             * @example 1024000
             */
            fileSize: number;
        };
        ConfirmUploadDto: {
            /**
             * @description アップロード時に発行されたファイルキー
             * @example gallery/550e8400-e29b-41d4-a716-446655440000.jpg
             */
            fileKey: string;
            /**
             * @description 紐付けるギャラリーエントリID（任意）
             * @example 550e8400-e29b-41d4-a716-446655440001
             */
            galleryEntryId?: string;
        };
        CreateMediaDto: {
            /**
             * @description メディアタイプ
             * @enum {string}
             */
            type: "IMAGE" | "YOUTUBE";
            /** @description メディアURL */
            url: string;
            /** @description サムネイルURL（YouTube用） */
            thumbnailUrl?: string;
            /** @description 表示順序 */
            order?: number;
        };
        CreateGalleryEntryDto: {
            /**
             * @description カテゴリ
             * @enum {string}
             */
            category: "KITTEN" | "FATHER" | "MOTHER" | "GRADUATION";
            /** @description 猫の名前 */
            name: string;
            /**
             * @description 性別
             * @enum {string}
             */
            gender: "MALE" | "FEMALE" | "NEUTER" | "SPAY";
            /** @description 毛色 */
            coatColor?: string;
            /** @description 品種 */
            breed?: string;
            /** @description 在舎猫ID（参照用） */
            catId?: string;
            /** @description 譲渡日（卒業猫用） */
            transferDate?: string;
            /** @description 譲渡先（卒業猫用） */
            destination?: string;
            /** @description 外部リンク（卒業猫用） */
            externalLink?: string;
            /** @description 備考 */
            notes?: string;
            /** @description メディア（画像・動画） */
            media?: components["schemas"]["CreateMediaDto"][];
        };
        UpdateGalleryEntryDto: {
            /**
             * @description カテゴリ
             * @enum {string}
             */
            category?: "KITTEN" | "FATHER" | "MOTHER" | "GRADUATION";
            /** @description 猫の名前 */
            name?: string;
            /**
             * @description 性別
             * @enum {string}
             */
            gender?: "MALE" | "FEMALE" | "NEUTER" | "SPAY";
            /** @description 毛色 */
            coatColor?: string;
            /** @description 品種 */
            breed?: string;
            /** @description 在舎猫ID（参照用） */
            catId?: string;
            /** @description 譲渡日（卒業猫用） */
            transferDate?: string;
            /** @description 譲渡先（卒業猫用） */
            destination?: string;
            /** @description 外部リンク（卒業猫用） */
            externalLink?: string;
            /** @description 備考 */
            notes?: string;
            /** @description メディア（画像・動画） */
            media?: components["schemas"]["CreateMediaDto"][];
        };
        AddMediaDto: {
            /**
             * @description メディアタイプ
             * @enum {string}
             */
            type: "IMAGE" | "YOUTUBE";
            /** @description メディアURL */
            url: string;
            /** @description サムネイルURL（YouTube用） */
            thumbnailUrl?: string;
        };
        ExportRequestDto: {
            /**
             * @description エクスポート対象データ種別
             * @enum {string}
             */
            dataType: "cats" | "pedigrees" | "medical_records" | "care_schedules" | "tags";
            /**
             * @description エクスポート形式
             * @default csv
             * @enum {string}
             */
            format: "csv" | "json";
            /** @description 開始日（フィルタ用） */
            startDate?: string;
            /** @description 終了日（フィルタ用） */
            endDate?: string;
            /** @description 対象IDリスト（特定データのみエクスポート） */
            ids?: string[];
        };
        ImportPreviewDto: {
            /** @description プレビューデータ件数 */
            previewCount: number;
            /** @description サンプルデータ（最初の5件） */
            sampleData: unknown[];
            /** @description 検出されたカラム */
            columns: string[];
            /** @description データ総件数 */
            totalCount: number;
        };
        ImportResultDto: {
            /** @description インポート成功件数 */
            successCount: number;
            /** @description インポート失敗件数 */
            errorCount: number;
            /** @description 処理総件数 */
            totalCount: number;
            /** @description エラー詳細（最初の10件） */
            errors?: string[];
        };
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
    UsersController_listUsers: {
        parameters: {
            query?: {
                /** @description テナント ID でフィルタ（SUPER_ADMIN のみ有効） */
                tenantId?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description ユーザー一覧を返却 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 認証が必要です */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 権限がありません */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    UsersController_getMe: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description プロフィール情報を返却 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 認証が必要です */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description ユーザーが見つかりません */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    UsersController_updateMe: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateProfileDto"];
            };
        };
        responses: {
            /** @description プロフィールが更新されました */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 更新するフィールドがありません */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 認証が必要です */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description メールアドレスが既に使用されています */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    UsersController_inviteUser: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["InviteUserDto"];
            };
        };
        responses: {
            /** @description 招待が作成されました */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 認証が必要です */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 権限がありません */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description テナントが見つかりません */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description メールアドレスが既に使用されています */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    UsersController_updateUserRole: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description 対象ユーザー ID */
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateUserRoleDto"];
            };
        };
        responses: {
            /** @description ロールが更新されました */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 認証が必要です */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 権限がありません */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description ユーザーが見つかりません */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    UsersController_deleteUser: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description 対象ユーザー ID */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description ユーザーが削除されました */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 認証が必要です */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 権限がありません */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description ユーザーが見つかりません */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    TenantsController_listTenants: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description テナント一覧を返却 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 認証が必要です */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 権限がありません */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    TenantsController_createTenant: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateTenantDto"];
            };
        };
        responses: {
            /** @description テナントが作成されました */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 不正なリクエスト */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 権限がありません */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description スラッグが既に使用されています */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    TenantsController_getTenantById: {
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
            /** @description テナント詳細を返却 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 認証が必要です */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 権限がありません */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description テナントが見つかりません */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    TenantsController_deleteTenant: {
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
            /** @description テナントが削除されました */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 認証が必要です */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 権限がありません */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description テナントが見つかりません */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 所属ユーザーが存在するため削除できません */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    TenantsController_updateTenant: {
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
                "application/json": components["schemas"]["UpdateTenantDto"];
            };
        };
        responses: {
            /** @description テナントが更新されました */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 認証が必要です */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 権限がありません */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description テナントが見つかりません */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description スラッグが既に使用されています */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    TenantsController_inviteTenantAdmin: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["InviteTenantAdminDto"];
            };
        };
        responses: {
            /** @description 招待が正常に作成されました */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 不正なリクエスト */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 権限がありません */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description メールアドレスまたはスラッグが既に使用されています */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    TenantsController_inviteUser: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                tenantId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["InviteUserDto"];
            };
        };
        responses: {
            /** @description 招待が正常に作成されました */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 不正なリクエスト */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 権限がありません */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description テナントが見つかりません */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description メールアドレスが既に使用されています */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    TenantsController_completeInvitation: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CompleteInvitationDto"];
            };
        };
        responses: {
            /** @description ユーザー登録が完了しました */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 不正なリクエストまたは無効なトークン */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description メールアドレスが既に使用されています */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    TenantSettingsController_getTagColorDefaults: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description タグカラーデフォルト設定を返却 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TagColorDefaultsDto"];
                };
            };
            /** @description 認証が必要です */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description テナントが見つかりません */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    TenantSettingsController_updateTagColorDefaults: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateTagColorDefaultsDto"];
            };
        };
        responses: {
            /** @description タグカラーデフォルト設定が更新されました */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TagColorDefaultsDto"];
                };
            };
            /** @description 不正なリクエスト */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 認証が必要です */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 権限がありません */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description テナントが見つかりません */
            404: {
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
                /** @description 在舎中フィルター */
                isInHouse?: boolean;
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
    CatsController_findKittens: {
        parameters: {
            query?: {
                /** @description 母猫ID（指定時はその母猫の子猫のみ取得） */
                motherId?: string;
                /** @description ページ番号 */
                page?: number;
                /** @description 1ページあたりの件数 */
                limit?: number;
                /** @description 検索キーワード（子猫名） */
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
            /** @description 子猫データの一覧（母猫ごとにグループ化） */
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
    CatsController_getCatFamily: {
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
            /** @description 家族情報（親・兄弟姉妹・子猫） */
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
    CatsController_getWeightRecords: {
        parameters: {
            query?: {
                /** @description ページ番号 */
                page?: number;
                /** @description 1ページあたりの件数 */
                limit?: number;
                /** @description 開始日 */
                startDate?: string;
                /** @description 終了日 */
                endDate?: string;
                /** @description ソート順 */
                sortOrder?: string;
            };
            header?: never;
            path: {
                /** @description 猫データのID */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 体重記録一覧 */
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
    CatsController_createWeightRecord: {
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
                "application/json": components["schemas"]["CreateWeightRecordDto"];
            };
        };
        responses: {
            /** @description 体重記録が正常に作成されました */
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
            /** @description 猫データが見つかりません */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    CatsController_getWeightRecord: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description 体重記録のID */
                recordId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 体重記録 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 体重記録が見つかりません */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    CatsController_deleteWeightRecord: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description 体重記録のID */
                recordId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 体重記録が正常に削除されました */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 体重記録が見つかりません */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    CatsController_updateWeightRecord: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description 体重記録のID */
                recordId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateWeightRecordDto"];
            };
        };
        responses: {
            /** @description 体重記録が正常に更新されました */
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
            /** @description 体重記録が見つかりません */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    CatsController_createBulkWeightRecords: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateBulkWeightRecordsDto"];
            };
        };
        responses: {
            /** @description 体重記録が正常に一括作成されました */
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
    PedigreeController_getNextId: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 次の血統書番号 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    PedigreeController_getPrintSettings: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 現在の印刷設定 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    PedigreeController_updatePrintSettings: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 更新後の印刷設定 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 無効な設定データです */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    PedigreeController_resetPrintSettings: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description リセット後の印刷設定 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    PedigreeController_generatePdf: {
        parameters: {
            query?: {
                /** @description 出力形式 (pdf|base64) */
                format?: string;
                /** @description デバッグモード（背景画像表示） */
                debug?: string;
            };
            header?: never;
            path: {
                /** @description 血統書番号 */
                pedigreeId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description PDF生成成功 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"];
                };
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
    PrintTemplatesController_getCategories: {
        parameters: {
            query: {
                tenantId: string;
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
    PrintTemplatesController_createCategory: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreatePrintDocCategoryDto"];
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
    PrintTemplatesController_getCategory: {
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
    PrintTemplatesController_removeCategory: {
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
    PrintTemplatesController_updateCategory: {
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
                "application/json": components["schemas"]["UpdatePrintDocCategoryDto"];
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
    PrintTemplatesController_getDataSources: {
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
    PrintTemplatesController_findAll: {
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
    PrintTemplatesController_create: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreatePrintTemplateDto"];
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
    PrintTemplatesController_findOne: {
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
    PrintTemplatesController_remove: {
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
    PrintTemplatesController_update: {
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
                "application/json": components["schemas"]["UpdatePrintTemplateDto"];
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
    PrintTemplatesController_duplicate: {
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
                "application/json": components["schemas"]["DuplicatePrintTemplateDto"];
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
    BreedsController_getMasterData: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description CSV マスターデータを displayName / displayNameMode 付きで返却 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MasterDataItemDto"][];
                };
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
    DisplayPreferencesController_getMine: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 表示設定の取得に成功 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    DisplayPreferencesController_updateMine: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateDisplayPreferenceDto"];
            };
        };
        responses: {
            /** @description 表示設定の更新に成功 */
            200: {
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
    CoatColorsController_getMasterData: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description CSV マスターデータを displayName / displayNameMode 付きで返却 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MasterDataItemDto"][];
                };
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
    BreedingController_findAllBreedingSchedules: {
        parameters: {
            query?: {
                /** @description ページ番号 */
                page?: number;
                /** @description 1ページあたりの件数 */
                limit?: number;
                /** @description オス猫IDでフィルタ */
                maleId?: string;
                /** @description メス猫IDでフィルタ */
                femaleId?: string;
                /** @description ステータスでフィルタ */
                status?: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
                /** @description 開始日（from） */
                dateFrom?: string;
                /** @description 開始日（to） */
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
                content?: never;
            };
        };
    };
    BreedingController_createBreedingSchedule: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateBreedingScheduleDto"];
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
    BreedingController_removeBreedingSchedule: {
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
    BreedingController_updateBreedingSchedule: {
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
                "application/json": components["schemas"]["UpdateBreedingScheduleDto"];
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
    BreedingController_findMatingChecks: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                scheduleId: string;
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
    BreedingController_createMatingCheck: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                scheduleId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateMatingCheckDto"];
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
    BreedingController_removeMatingCheck: {
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
    BreedingController_updateMatingCheck: {
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
                "application/json": components["schemas"]["UpdateMatingCheckDto"];
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
    BreedingController_remove: {
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
    BreedingController_update: {
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
                "application/json": components["schemas"]["UpdateBreedingDto"];
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
                /** @description 受診種別ID */
                visitTypeId?: string;
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
    CareController_findMedicalRecordById: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description 医療記録ID */
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
                content: {
                    "application/json": components["schemas"]["MedicalRecordResponseDto"];
                };
            };
        };
    };
    CareController_deleteMedicalRecord: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description 医療記録ID */
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
    CareController_updateMedicalRecord: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description 医療記録ID */
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateMedicalRecordDto"];
            };
        };
        responses: {
            200: {
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
    GraduationController_transferCat: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description 猫ID */
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["TransferCatDto"];
            };
        };
        responses: {
            /** @description 譲渡成功 */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description すでに卒業済みです */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 猫が見つかりません */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    GraduationController_findAllGraduations: {
        parameters: {
            query?: {
                page?: number;
                limit?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 卒業猫一覧 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    GraduationController_findOneGraduation: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description 卒業ID */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 卒業猫詳細 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 卒業記録が見つかりません */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    GraduationController_cancelGraduation: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description 卒業ID */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 卒業取り消し成功 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 卒業記録が見つかりません */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    GraduationController_updateGraduation: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description 卒業ID */
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateGraduationDto"];
            };
        };
        responses: {
            /** @description 更新成功 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 卒業記録が見つかりません */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    GalleryUploadController_generateUploadUrl: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["GenerateUploadUrlDto"];
            };
        };
        responses: {
            /** @description Signed URL生成成功 */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @example true */
                        success?: boolean;
                        data?: {
                            /** @description アップロード用Signed URL */
                            uploadUrl?: string;
                            /** @description GCS内のファイルキー */
                            fileKey?: string;
                            /** @description アップロード後の公開URL */
                            publicUrl?: string;
                        };
                    };
                };
            };
            /** @description パラメータエラー */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    GalleryUploadController_confirmUpload: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ConfirmUploadDto"];
            };
        };
        responses: {
            /** @description 確認成功 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @example true */
                        success?: boolean;
                        data?: {
                            /** @example true */
                            success?: boolean;
                            /** @description ファイルの公開URL */
                            url?: string;
                            /** @description ファイルサイズ（バイト） */
                            size?: number;
                        };
                    };
                };
            };
            /** @description ファイルが見つからない */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    GalleryUploadController_deleteFile: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description 削除するファイルのキー（URLエンコード済み） */
                fileKey: string;
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
    GalleryController_findAll: {
        parameters: {
            query?: {
                /** @description カテゴリでフィルタリング */
                category?: "KITTEN" | "FATHER" | "MOTHER" | "GRADUATION";
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
            /** @description ギャラリー一覧 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    GalleryController_create: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateGalleryEntryDto"];
            };
        };
        responses: {
            /** @description 作成成功 */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    GalleryController_findOne: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description エントリID */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description ギャラリー詳細 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description エントリが見つかりません */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    GalleryController_update: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description エントリID */
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateGalleryEntryDto"];
            };
        };
        responses: {
            /** @description 更新成功 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description エントリが見つかりません */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    GalleryController_delete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description エントリID */
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
            /** @description エントリが見つかりません */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    GalleryController_addMedia: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description エントリID */
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AddMediaDto"];
            };
        };
        responses: {
            /** @description メディア追加成功 */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    GalleryController_deleteMedia: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description メディアID */
                mediaId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description メディア削除成功 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    GalleryController_bulkCreate: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": string[];
            };
        };
        responses: {
            /** @description 一括登録成功 */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ExportController_export: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ExportRequestDto"];
            };
        };
        responses: {
            /** @description エクスポート成功 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 無効なリクエスト */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ImportController_preview: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "multipart/form-data": {
                    /**
                     * Format: binary
                     * @description CSVファイル
                     */
                    file: string;
                };
            };
        };
        responses: {
            /** @description プレビュー取得成功 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ImportPreviewDto"];
                };
            };
            /** @description ファイルが不正な形式 */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 認証が必要 */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ImportController_importCats: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "multipart/form-data": {
                    /**
                     * Format: binary
                     * @description CSVファイル（カラム: name, gender, birthDate, breed, color, registrationNumber, microchipNumber, notes）
                     */
                    file: string;
                };
            };
        };
        responses: {
            /** @description インポート完了 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ImportResultDto"];
                };
            };
            /** @description ファイルが不正な形式 */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 認証が必要 */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ImportController_importPedigrees: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "multipart/form-data": {
                    /**
                     * Format: binary
                     * @description CSVファイル（カラム: pedigreeId, catName, title, breedCode, genderCode, coatColorCode）
                     */
                    file: string;
                };
            };
        };
        responses: {
            /** @description インポート完了 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ImportResultDto"];
                };
            };
            /** @description ファイルが不正な形式 */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 認証が必要 */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ImportController_importTags: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "multipart/form-data": {
                    /**
                     * Format: binary
                     * @description CSVファイル（カラム: name, category, group, color, isActive）
                     */
                    file: string;
                };
            };
        };
        responses: {
            /** @description インポート完了 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ImportResultDto"];
                };
            };
            /** @description ファイルが不正な形式 */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 認証が必要 */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
}

