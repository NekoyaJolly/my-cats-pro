# タスク2: ∞軌道レイアウト - 技術詳細

## 数学的アプローチ

### パラメトリック方程式

疑似∞軌道は、2つの円をパラメータ `t ∈ [0, 1)` で結合した軌跡として定義されます。

#### 右の円（t ∈ [0, 0.5)）
```
x(t) = cxRight + r · cos(4πt)
y(t) = cy + r · sin(4πt)
```

#### 左の円（t ∈ [0.5, 1)）
```
x(t) = cxLeft + r · cos(4π(t - 0.5))
y(t) = cy + r · sin(4π(t - 0.5))
```

### パラメータの対応

| t値 | 位置 | 説明 |
|-----|------|------|
| 0.00 | 右円の右端 | 3時方向 |
| 0.125 | 右円の下右 | 4時半方向 |
| 0.25 | 右円の下端 | 6時方向 ⬇️ |
| 0.375 | 右円の下左 | 7時半方向 |
| 0.50 | 左円の右端 | 3時方向（左円） |
| 0.625 | 左円の下右 | 4時半方向 |
| 0.75 | 左円の下端 | 6時方向 ⬇️ |
| 0.875 | 左円の下左 | 7時半方向 |

### 実装での座標計算

```typescript
const DIAL_SIZE = 260;
const radius = DIAL_SIZE / 2 = 130;

const INFINITY_CIRCLE_RADIUS = 55;
const INFINITY_CIRCLE_OFFSET = 45;

// 左の円の中心
cxLeft = radius - INFINITY_CIRCLE_OFFSET = 130 - 45 = 85
cyLeft = radius = 130

// 右の円の中心
cxRight = radius + INFINITY_CIRCLE_OFFSET = 130 + 45 = 175
cyRight = radius = 130
```

### 座標系の視覚化

```
(0, 0) ─────────────────────────► x
│
│       左の円               右の円
│        (85,130)          (175,130)
│          ●                  ●
│         / \                / \
│        /   \              /   \
│       │  r=55│          │  r=55│
│        \   /              \   /
│         \ /                \ /
│          ●                  ●
│
▼
y

DIAL_SIZE = 260 × 260
中心 = (130, 130)
```

---

## 位相シフトの計算

### 目的

タスク1で実装した「下側中央（6時方向）が選択位置」を維持するため。

### 計算ロジック

```typescript
// 回転角度を0-1の範囲に正規化
const rotationNormalized = ((displayRotation % 360) + 360) % 360;
const tBase = rotationNormalized / 360;

// 各アイテムの基本位置
const itemT = tBase + (index / items.length);

// 位相シフト（0.75 = 下側）
const phaseShift = 0.75;
const wrappedT = itemT + phaseShift;
```

### なぜ 0.75 なのか？

右の円での対応:
- `t = 0.00` → 3時方向（右端）
- `t = 0.25` → 6時方向（下端）← ここに選択位置を持ってきたい
- `t = 0.50` → 9時方向（左端）

左の円での対応:
- `t = 0.50` → 3時方向（右端）
- `t = 0.75` → 6時方向（下端）← ここに選択位置を持ってきたい
- `t = 1.00` → 9時方向（左端）

→ `phaseShift = 0.75` により、選択中アイテムが常に下側（6時方向）に配置される

---

## アイテム配置の例

### 8アイテムの場合

| Index | tBase=0 での位置 | phaseShift後 | 最終的な位置 |
|-------|-----------------|-------------|-------------|
| 0 | 0.00 | 0.75 | 左円の下端 |
| 1 | 0.125 | 0.875 | 左円の下左 |
| 2 | 0.25 | 1.00 (→0.00) | 右円の右端 |
| 3 | 0.375 | 0.125 | 右円の下右 |
| 4 | 0.50 | 0.25 | 右円の下端 |
| 5 | 0.625 | 0.375 | 右円の下左 |
| 6 | 0.75 | 0.50 | 左円の右端 |
| 7 | 0.875 | 0.625 | 左円の下右 |

### 選択位置の確認

`displayRotation = 0` の場合:
- `selectedIndex = 0`
- `t = 0.75`（左円の下端）← 選択位置 ✅

---

## 回転とスナップの動作

### ホイール操作（1ステップ）

```typescript
const direction = e.deltaY > 0 ? 1 : -1;
const anglePerItem = 360 / items.length; // 8アイテムなら45度

// 現在の回転角から次のスナップ位置を計算
const targetRotation = currentRotation + direction * anglePerItem;
const snapAngle = getSnapAngle(targetRotation, items.length);
```

例（8アイテム）:
- `displayRotation = 0` → 次: `45`
- `selectedIndex = 0` → 次: `1`
- ∞軌道上で1アイテム分移動

### ドラッグ操作

```typescript
// ドラッグ中の角度差分を計算
const deltaAngle = currentAngle - dragStartRef.current.angle;
const newRotation = dragStartRef.current.rotation + deltaAngle;

// 離した時にスナップ
const snapAngle = getSnapAngle(targetRotation, items.length);
```

---

## パフォーマンス最適化

### 計算の複雑度

**infinityPath 関数:**
```typescript
O(1) - 定数時間
- 条件分岐: 1回
- 三角関数: 2回（cos, sin）
- 算術演算: 数回
```

**従来の円形レイアウト:**
```typescript
O(1) - 定数時間
- 三角関数: 2回（cos, sin）
- 算術演算: 数回
```

→ **計算コストは同等**

### メモリ使用量

追加されたもの:
- `InfinityPathOptions` オブジェクト: ~40 bytes
- `infinityPath` 関数: ~300 bytes（コード）

→ **メモリオーバーヘッドは無視できるレベル**

---

## 拡張性とカスタマイズ

### パラメータ調整

```typescript
// 円の大きさを変更
const INFINITY_CIRCLE_RADIUS = 55;  // 40-70 推奨

// 左右の間隔を変更
const INFINITY_CIRCLE_OFFSET = 45;  // 30-60 推奨

// 選択位置を変更（通常は変更不要）
const phaseShift = 0.75;  // 0-1
```

### アイテム数による調整

| アイテム数 | 推奨半径 | 推奨オフセット | 備考 |
|-----------|---------|--------------|------|
| 4-8 | 55-60 | 40-50 | 標準 |
| 9-12 | 50-55 | 45-55 | やや密 |
| 13-16 | 45-50 | 50-60 | 最密 |

---

## デバッグ情報

### 座標の確認方法

開発者ツールで以下を実行:

```javascript
// 特定のtに対する座標を確認
const opts = {
  cxLeft: 85,
  cxRight: 175,
  cy: 130,
  r: 55,
};

// 下側（選択位置）の座標
console.log(infinityPath(0.25, opts));  // 右円の下
console.log(infinityPath(0.75, opts));  // 左円の下
```

### よくある問題と解決

#### 問題1: アイテムが重なる

**原因:** 円の半径が大きすぎる or アイテム数が多すぎる

**解決:**
```typescript
// 半径を小さくする
const INFINITY_CIRCLE_RADIUS = 45;  // 55 → 45

// または、オフセットを大きくする
const INFINITY_CIRCLE_OFFSET = 55;  // 45 → 55
```

#### 問題2: 選択位置がずれる

**原因:** 位相シフトが間違っている

**解決:**
```typescript
// 位相を再調整
const phaseShift = 0.75;  // 確認

// デバッグ出力を追加
console.log('wrappedT:', wrappedT % 1);
console.log('pos:', pos);
```

#### 問題3: 回転方向が逆

**原因:** 角度の符号が逆

**解決:**
```typescript
// angleToIndex での符号を確認
const normalized = normalizeAngle(-angle + 180);  // マイナス符号が重要
```

---

## テストケース

### 単体テスト用データ

```typescript
describe('infinityPath', () => {
  const opts = {
    cxLeft: 85,
    cxRight: 175,
    cy: 130,
    r: 55,
  };

  it('should return right circle right edge at t=0', () => {
    const pos = infinityPath(0, opts);
    expect(pos.x).toBeCloseTo(230);  // 175 + 55
    expect(pos.y).toBeCloseTo(130);
  });

  it('should return right circle bottom at t=0.25', () => {
    const pos = infinityPath(0.25, opts);
    expect(pos.x).toBeCloseTo(175);
    expect(pos.y).toBeCloseTo(185);  // 130 + 55
  });

  it('should return left circle bottom at t=0.75', () => {
    const pos = infinityPath(0.75, opts);
    expect(pos.x).toBeCloseTo(85);
    expect(pos.y).toBeCloseTo(185);  // 130 + 55
  });
});
```

---

## 参考資料

### 数学的背景

- パラメトリック方程式: https://ja.wikipedia.org/wiki/パラメトリック方程式
- 三角関数: https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Math

### 実装の参考

- Framer Motion: https://www.framer.com/motion/
- React Hooks: https://react.dev/reference/react

---

*作成日: 2025-12-02*
*最終更新: 2025-12-02*
