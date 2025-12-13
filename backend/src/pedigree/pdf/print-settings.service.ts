import * as fs from 'fs';
import * as path from 'path';

import { Injectable, Logger } from '@nestjs/common';

// 座標設定の型定義
interface Position {
  x: number;
  y: number;
  align?: 'left' | 'center' | 'right';
}

interface ParentPositions {
  name: Position;
  color: Position;
  eyeColor?: Position;
  jcu: Position;
}

interface GrandParentPositions {
  name: Position;
  color: Position;
  jcu: Position;
}

interface GreatGrandParentPositions {
  name: Position;
  jcu: Position;
}

interface FontSizes {
  catName: number;
  wcaNo: number;
  headerInfo: number;
  parentName: number;
  parentDetail: number;
  grandParentName: number;
  grandParentDetail: number;
  greatGrandParent: number;
  footer: number;
}

export interface PositionsConfig {
  offsetX: number;
  offsetY: number;
  breed: Position;
  sex: Position;
  dateOfBirth: Position;
  eyeColor: Position;
  color: Position;
  catName: Position;
  wcaNo: Position;
  owner: Position;
  breeder: Position;
  dateOfRegistration: Position;
  littersM: Position;
  littersF: Position;
  sire: ParentPositions;
  dam: ParentPositions;
  grandParents: {
    ff: GrandParentPositions;
    fm: GrandParentPositions;
    mf: GrandParentPositions;
    mm: GrandParentPositions;
  };
  greatGrandParents: {
    fff: GreatGrandParentPositions;
    ffm: GreatGrandParentPositions;
    fmf: GreatGrandParentPositions;
    fmm: GreatGrandParentPositions;
    mff: GreatGrandParentPositions;
    mfm: GreatGrandParentPositions;
    mmf: GreatGrandParentPositions;
    mmm: GreatGrandParentPositions;
  };
  otherOrganizationsNo: Position;
  fontSizes: FontSizes;
}

/**
 * 血統書印刷設定サービス
 * positions.json の読み書きを担当
 */
@Injectable()
export class PrintSettingsService {
  private readonly logger = new Logger(PrintSettingsService.name);
  private readonly positionsFilePath: string;

  constructor() {
    // 開発時はsrc、本番時はdistからの相対パスでsrcを参照
    // process.cwd() はプロジェクトルート（backend/）を指す
    this.positionsFilePath = path.join(
      process.cwd(),
      'src',
      'pedigree',
      'pdf',
      'positions.json'
    );
  }

  /**
   * 現在の印刷設定を取得
   */
  getSettings(): PositionsConfig {
    try {
      const fileContent = fs.readFileSync(this.positionsFilePath, 'utf-8');
      return JSON.parse(fileContent) as PositionsConfig;
    } catch (error) {
      this.logger.error('印刷設定の読み込みに失敗しました', error);
      throw new Error('印刷設定の読み込みに失敗しました');
    }
  }

  /**
   * 印刷設定を更新
   */
  updateSettings(settings: PositionsConfig): PositionsConfig {
    try {
      // バックアップを作成
      const backupPath = `${this.positionsFilePath}.backup`;
      if (fs.existsSync(this.positionsFilePath)) {
        fs.copyFileSync(this.positionsFilePath, backupPath);
      }

      // 設定を保存
      fs.writeFileSync(
        this.positionsFilePath,
        JSON.stringify(settings, null, 2),
        'utf-8'
      );

      this.logger.log('印刷設定を更新しました');
      return settings;
    } catch (error) {
      this.logger.error('印刷設定の保存に失敗しました', error);
      throw new Error('印刷設定の保存に失敗しました');
    }
  }

  /**
   * 設定をデフォルトにリセット
   */
  resetToDefault(): PositionsConfig {
    const defaultSettings: PositionsConfig = {
      offsetX: 0,
      offsetY: 0,
      breed: { x: 50, y: 50 },
      sex: { x: 50, y: 60 },
      dateOfBirth: { x: 77, y: 60 },
      eyeColor: { x: 50, y: 69 },
      color: { x: 77, y: 69 },
      catName: { x: 170, y: 55, align: 'center' },
      wcaNo: { x: 170, y: 69, align: 'center' },
      owner: { x: 320, y: 50, align: 'right' },
      breeder: { x: 320, y: 60, align: 'right' },
      dateOfRegistration: { x: 240, y: 69 },
      littersM: { x: 277, y: 69 },
      littersF: { x: 285, y: 69 },
      sire: {
        name: { x: 50, y: 110 },
        color: { x: 50, y: 127 },
        eyeColor: { x: 50, y: 132 },
        jcu: { x: 50, y: 137 }
      },
      dam: {
        name: { x: 50, y: 160 },
        color: { x: 50, y: 177 },
        eyeColor: { x: 50, y: 182 },
        jcu: { x: 50, y: 188 }
      },
      grandParents: {
        ff: { name: { x: 140, y: 101 }, color: { x: 140, y: 106 }, jcu: { x: 140, y: 111 } },
        fm: { name: { x: 140, y: 127 }, color: { x: 140, y: 132 }, jcu: { x: 140, y: 137 } },
        mf: { name: { x: 140, y: 152 }, color: { x: 140, y: 157 }, jcu: { x: 140, y: 162 } },
        mm: { name: { x: 140, y: 178 }, color: { x: 140, y: 183 }, jcu: { x: 140, y: 188 } }
      },
      greatGrandParents: {
        fff: { name: { x: 232, y: 94 }, jcu: { x: 232, y: 98 } },
        ffm: { name: { x: 232, y: 107 }, jcu: { x: 232, y: 111 } },
        fmf: { name: { x: 232, y: 120 }, jcu: { x: 232, y: 124 } },
        fmm: { name: { x: 232, y: 133 }, jcu: { x: 232, y: 137 } },
        mff: { name: { x: 232, y: 146 }, jcu: { x: 232, y: 150 } },
        mfm: { name: { x: 232, y: 158 }, jcu: { x: 232, y: 162 } },
        mmf: { name: { x: 232, y: 171 }, jcu: { x: 232, y: 175 } },
        mmm: { name: { x: 232, y: 184 }, jcu: { x: 232, y: 188 } }
      },
      otherOrganizationsNo: { x: 85, y: 210 },
      fontSizes: {
        catName: 13,
        wcaNo: 12,
        headerInfo: 11,
        parentName: 12,
        parentDetail: 11,
        grandParentName: 11,
        grandParentDetail: 11,
        greatGrandParent: 10,
        footer: 7
      }
    };

    return this.updateSettings(defaultSettings);
  }
}
