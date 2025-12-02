# ゴール概要

- 既存の `DialNavigation` コンポーネントをベースに、次を実現したい：
  1. **選択位置は画面下側中央（親指で届きやすいエリア）**
  2. **選択中アイコンの詳細情報は画面上側で確認できる UI**
  3. **円レイアウト → 左右2つの円からなる疑似∞軌道レイアウト**
  4. **最大16アイコン対応**
  5. **アイコンの六角形デザイン化**
  6. **ユーザーごとの表示/非表示＆順序編集（ドラッグ＆ドロップ）**

- 想定端末：iPhone 6.3インチ程度を目安に、
  - 画面を上下2分割＋左右3分割した時の **「下段中央」が一番楽に届く位置**
  - ここに「選択位置（フォーカス中のアイコン）」を置き、
  - 詳細ラベルや補足情報は **上部エリア** に表示する。

- 開発環境（リポジトリ）：
  - `NekoyaJolly/my-cats-pro`
  - 主に `frontend/` 以下の Next.js + Mantine + Framer Motion 環境
  - 既存ダイヤル UI：`frontend/src/components/dashboard/DialNavigation.tsx`

---

# タスク構成（4ステップ）

以下 4 つのタスクに分解しています。  
**必ずタスク1から順番に対応**してください。  
各タスク完了後は「次のタスクへ進むためのコメント」を出力してください（テンプレは後述）。

1. **タスク1：選択位置を「下側中央」に変更し、情報表示は上部に集約（円レイアウトのまま）**
2. **タスク2：円レイアウトを「疑似∞軌道レイアウト」に変更**
3. **タスク3：アイコン見た目を六角形に変更**
4. **タスク4：ユーザーごとの表示/非表示＆順序編集（ドラッグ＆ドロップ設定 UI）**

---

## タスク1：選択位置を下側中央に変更し、情報表示を上部へ

### 目的

- `DialNavigation` の UX を、
  - **「選択操作は下側中央」**
  - **「選択中アイテムの名前・説明などの情報は上部で確認」**
  に変更する。
- この段階では **円レイアウト（円形に並んだダイヤル）のままでよい**。  
  見た目の∞や六角形は後続タスクで行う。

### 対象

- リポジトリ: `NekoyaJolly/my-cats-pro`
- 主なファイル:
  - `frontend/src/components/dashboard/DialNavigation.tsx`

### 要件

1. **選択基準を「下側中央」に変更**
   - 現在は「上側（12時方向）のインジケーター位置にあるアイテム」が選択中として扱われている。
   - これを **「下側（6時方向）の中央に来たアイテム」が選択中**となるように変更する。
   - 具体的には：
     - 角度正規化／インデックス計算（`angleToIndex` 相当）のロジックを、「下方向が基準」となるよう調整する。
     - スナップも「下側に一番近いアイテム」に寄せるようにする。
   - 実装方針の一例：
     - 「ロジック上はこれまで通り上方向を0度として管理しつつ、**計算時に180度分オフセット**して下方向を基準にする」。
     - 既存ユーティリティ (`normalizeAngle`, `getSnapAngle`, `angleToIndex`) に「基準角（例えば 180度）」をオプションとして渡せるようにすると整理しやすい。

2. **UIレイアウト：「下側＝操作」「上側＝情報」への再配置**
   - ダイヤルコンテナ内レイアウトを調整する：
     - **下側中央**付近に「選択位置のインジケーター」（ハイライトやマーカー）を配置。
     - **上部エリア**に、選択中のアイテム名や説明などラベルをまとめる。
   - 既存実装ではダイヤル直下に選択中タイトル＋サブテキストが出ているが、これを **ダイヤルの上～上部エリアに移す**。
     - 例：`<Box>` 全体の中で
       - 上部：選択中アイテムのタイトル・説明
       - 中央：ダイヤル本体
       - 下部：ヒントテキストや補助 UI など
   - 最終的な感覚：
     - 「下側でクルクル回して選ぶ → 顔を少し上に向けると、画面上部に詳細情報が見える」。

3. **最大16アイコンまで違和感なく動くように維持**
   - このタスクではまだレイアウトは円なので、
     - `items.length <= 16` でも選択インデックス計算やスナップが破綻しないようにする。
   - レイアウトが崩れる場合は `DIAL_SIZE` や `ICON_RADIUS` を少し調整してもよい。

4. **既存挙動の維持**
   - 以下の挙動は変更しない：
     - ドラッグ or ホイールで回転
     - 中央クリックでのサブアクション展開／遷移
     - サブアクション（放射状の小アイコン）の展開アニメーション
   - これらはあくまで「選択位置が上→下になっただけ」で同じように使えること。

5. **コード品質**
   - TypeScript の型エラー・lint エラーがないようにする。
   - 角度基準を変更した箇所には、簡潔なコメント（「下側=6時方向を基準にしている」など）を入れて読みやすくする。

---

## タスク2：円レイアウト → 疑似∞軌道レイアウト

### 目的

- タスク1で「下側中央が選択基準」になった `DialNavigation` を、
  - **円周レイアウトから「左右2つの円をつないだ疑似∞軌道レイアウト」に変更**する。
- 操作感（ドラッグ／ホイール／スナップ／サブアクション）はタスク1と同様のまま。

### 対象

- `frontend/src/components/dashboard/DialNavigation.tsx`

### 疑似∞の仕様（ざっくり数学）

- 2つの円を使った簡易∞。  
  パラメータ `t (0〜1)` として：

  - `0 ≦ t < 0.5`: 右の円を1周
  - `0.5 ≦ t < 1`: 左の円を1周

- 座標はこんなイメージ：

  ```ts
  interface InfinityPathOptions {
    cxLeft: number;
    cxRight: number;
    cy: number;
    r: number;
  }

  function infinityPath(t: number, opts: InfinityPathOptions): { x: number; y: number } {
    const { cxLeft, cxRight, cy, r } = opts;
    const tt = ((t % 1) + 1) % 1; // 0-1 に正規化

    if (tt < 0.5) {
      const localT = tt / 0.5;             // 0-1
      const angle = localT * 2 * Math.PI;  // 0-2π
      return {
        x: cxRight + r * Math.cos(angle),
        y: cy + r * Math.sin(angle),
      };
    } else {
      const localT = (tt - 0.5) / 0.5;
      const angle = localT * 2 * Math.PI;
      return {
        x: cxLeft + r * Math.cos(angle),
        y: cy + r * Math.sin(angle),
      };
    }
  }
  ```

### 要件

1. **`infinityPath` ヘルパーの導入**
   - 上記のような `infinityPath` 関数を `DialNavigation.tsx` 内（あるいは適切なユーティリティ）に追加する。
   - `InfinityPathOptions` は、ダイヤルのサイズ (`DIAL_SIZE`, `ICON_RADIUS`) と整合するようにパラメータ調整する。

2. **円周レイアウトから∞レイアウトへの置き換え**
   - 現在、各アイテムの位置は `theta` を使って円周上に計算しているはずなので、その `theta` ベースの配置をやめて：
     - 「ダイヤルの回転角（`displayRotation` or `rotationValue`）＋ index から param `t` を計算」
     - その `t` を `infinityPath` に渡して `(x, y)` を取得
     - アイコン container を絶対配置（`left: x`, `top: y` or `transform: translate(-50%, -50%)`）する
   - `t` 計算の一例：

     ```ts
     const normalized = ((displayRotation % 360) + 360) % 360;
     const tBase = normalized / 360;           // 1周で0→1
     const itemT = tBase + index / items.length;
     const wrappedT = itemT /* + phaseShift */; // 下側基準に合わせて位相調整
     ```

3. **「下側中央が選択位置」のまま維持**
   - タスク1で「下方向基準」のスナップ／インデックスになっている前提。
   - 疑似∞になっても、
     - **下側中央位置に来たアイテムが selectedIndex に対応する**
     - ホイール 1 ステップ／スワイプで、次のアイテムが下側基準にスナップする
     という挙動を保つように、`t` の位相（`phaseShift`）と `InfinityPathOptions` の `cy` を調整する。

4. **最大16アイコン前提での見た目調整**
   - `items.length <= 16` を前提に、
     - ループ間隔（`cxLeft` と `cxRight` の距離）
     - 半径 `r`
     - 縦方向のセンタリング `cy`
   を決める。
   - 目標：
     - 左右のループが少し重なりつつも、アイコン同士が重なりすぎない。
     - 下側中央のアイコンが「親指で押しやすい高さ」かつ「上部ラベルや他 UI と被らない」位置になる。

5. **既存の Framer Motion アニメーションを尊重**
   - `motion.div` による `rotate` アニメーションは極力そのまま使い、`x, y` のみ座標として更新する。
   - 各アイコンの逆回転（`rotate: -displayRotation`）なども今まで通り動くようにする。

6. **コードコメント**
   - `infinityPath` や `t` 計算周りには、「なぜこうしているか」簡潔にコメントを書く。
   - 特に「下側を選択基準にするための位相調整」が分かるようにしておく。

---

## タスク3：アイコンの六角形化（見た目）

### 目的

- `DialNavigation` の各アイコンを **六角形のボタン**として描画する。
- 挙動（選択／ホバー／クリックなど）は現状を維持しつつ、見た目だけをリッチにする。

### 対象

- `frontend/src/components/dashboard/DialNavigation.tsx`
- 必要に応じて新規ファイル（例：`frontend/src/components/dashboard/HexIconButton.tsx`・CSS モジュールなど）

### 要件

1. **六角形ボタンコンポーネントの実装**
   - 例：`HexIconButton.tsx` というプレゼンテーションコンポーネントを追加。
   - 想定 props：

     ```ts
     interface HexIconButtonProps {
       size: number;                 // 外接円基準のサイズ（px）
       selected?: boolean;
       hovered?: boolean;
       color?: string;               // Mantine カラー or カラーコード
       badge?: string | number;
       children: ReactNode;          // 中央アイコン
       onClick?: () => void;
     }
     ```

   - 六角形の作り方はお任せするが、シンプルに CSS `clip-path` が候補：
     ```css
     .hex {
       width: var(--size);
       height: var(--size);
       clip-path: polygon(
         25% 3%, 75% 3%,
         97% 50%,
         75% 97%, 25% 97%,
         3% 50%
       );
     }
     ```
   - バッジは右上に `position: absolute` で配置。

2. **スタイル仕様**
   - `selected: true` の時：
     - 背景：`item.color` ベース（Mantine のメインカラー想定）
     - アイコンカラー：白 or 高コントラスト
     - 影強め（選択中を強調）
   - `selected: false` の時：
     - 背景：白～薄いグレー、枠線 or 影は控えめ
   - `hovered: true` の時：
     - 少しスケールアップ・影強化など（PC 用）
   - バッジがある場合は右上に小さく円形 or 角丸バッジ。

3. **DialNavigation への適用**
   - 現在丸い ThemeIcon や div で出しているアイコンを、`HexIconButton` に差し替える。
   - `selectedIndex`・`hoveredIndex` に応じて `selected` / `hovered` を渡す。
   - サイズは最大 16 アイコンでも視認性が保てる大きさに（例：`size=48` 前後）。

4. **アクセシビリティ**
   - `button` 要素として定義する or `role="button"` と `aria-label` を付けるなど最低限考慮する。
   - フォーカス時に完全にアウトラインが消えないように（CSS reset で消されている場合はカスタムフォーカスリングを用意してもよい）。

---

## タスク4：ユーザーごとの表示/非表示＆順序編集（ドラッグ＆ドロップ UI）

### 目的

- ダイヤルメニュー項目を、**ユーザーごとに「表示/非表示」「順序」を設定できる**ようにする。
- 設定 UI として、既存 `DashboardCardSettings` と似た **モーダル + D&D リスト**を用意する。

### 対象

- 参考：
  - `frontend/src/components/dashboard/DashboardCardSettings.tsx`
- 新規・変更：
  - `frontend/src/components/dashboard/` 以下に `DialMenuSettings.tsx`（仮名）
  - `DialNavigation` を利用している画面（ダッシュボード等）

### 要件

1. **ダイヤル項目設定用の型**
   - ダイヤル用の設定型を定義（既存 `DialItem` をラップ or 拡張）：

     ```ts
     export interface DialMenuItemConfig {
       id: string;
       title: string;
       icon: ReactNode;
       color: string;
       href: string;
       badge?: string | number;
       subActions?: { id: string; title: string; icon: ReactNode; href: string }[];
       visible: boolean;
       order: number;
     }
     ```

   - 実際に `DialNavigation` に渡す items は `visible === true` のものだけ、`order` 昇順で並べて渡す。

2. **DialMenuSettings モーダル**
   - `DashboardCardSettings` を参考にしながら、ダイヤル項目専用の設定モーダルを作成。
   - 機能：
     - 全項目リスト（title・description 的なテキスト＋アイコン表示）
     - 各行に「表示/非表示」スイッチ
     - dnd-kit によるドラッグ＆ドロップで `order` 編集
     - 変更件数／選択中件数の表示
     - 「リセット」→ 初期状態（props の items など）に戻す
     - 「保存」→ 親コンポーネントに `DialMenuItemConfig[]` を返す
   - UI テキストは日本語で構わない（例：「ダイヤルメニューの編集」「表示/非表示」「並び順」など）。

3. **DialNavigation との統合**
   - ダイヤル近辺に「編集」ボタン（小さなアイコンボタンや設定アイコン）を置き、押すと `DialMenuSettings` モーダルが開く。
   - 親コンポーネント（ダッシュボード画面など）で:
     - `DialMenuItemConfig[]` を state 管理
     - `DialMenuSettings` の `onSave` で state 更新
     - `DialNavigation` には `visible` かつ `order` ソート済みの items を渡す。
   - データ永続化（バックエンド or localStorage）は、既に類似の設定保存処理があるならそれに合わせる。なければ一旦フロント state のみでよい。

4. **Drag & Drop の挙動**
   - `DashboardCardSettings` 同様、dnd-kit でソートを実装。
   - 項目が最大16個まで並ぶ想定のため、スクロール可能なリストにする。
   - ドラッグ中は影・透明度変化などで視認性を出す。

5. **DialNavigation 側の動作確認**
   - 設定で `visible=false` にされたアイテムがダイヤルから消えること。
   - 並び順変更が反映され、スナップやドラッグ挙動に問題ないこと。
   - 変更後も「下側中央選択＋上部情報表示＋疑似∞軌道＋六角形アイコン」が崩れないこと。

---

# タスク完了時のコメント（テンプレ）

各タスクが完了したら、**次のタスクに進めるように短いコメントを出力**してください。  
例として、以下の文面を使ってください（実際に完了した内容に応じて調整可）：

### タスク1完了時

> タスク1（DialNavigation の選択位置を下側中央に変更し、情報表示を上部に移動）が完了しました。  
> 次はタスク2として、円レイアウトを左右2つの円からなる疑似∞軌道レイアウトに置き換えてください。  
> この .md 内の「タスク2」の要件を参照して作業を続けてください。

### タスク2完了時

> タスク2（DialNavigation のレイアウトを疑似∞軌道に変更）が完了しました。  
> 次はタスク3として、アイコンの見た目を六角形デザインに差し替えてください。  
> この .md 内の「タスク3」の要件を参照して作業を続けてください。

### タスク3完了時

> タスク3（六角形アイコンコンポーネントの実装と DialNavigation への適用）が完了しました。  
> 次はタスク4として、ダイヤルメニューの表示/非表示と並び順を編集できるドラッグ＆ドロップ設定モーダルを実装してください。  
> この .md 内の「タスク4」の要件を参照して作業を続けてください。

### タスク4完了時

> タスク4（ダイヤルメニュー設定 UI の実装と DialNavigation との統合）が完了しました。  
> これで、下部中央での選択操作・上部での情報確認・疑似∞軌道・六角形アイコン・ユーザーごとの項目編集まで一通り実装されています。  
> 必要に応じて、最終的な UI 微調整やコードクリーンアップ用の追加タスクを検討してください。

---

以上が CopilotAgent に渡すための完全版プロンプトです。  
この `.md` をリポジトリに保存し、タスク1から順に参照しながら実装を進めてください。