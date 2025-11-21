import { config } from 'dotenv';
import { resolve } from 'path';

// E2Eテスト実行前に.env.testファイルを読み込む
const envTestPath = resolve(__dirname, '../.env.test');
config({ path: envTestPath });
