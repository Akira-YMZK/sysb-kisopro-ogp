# システム技術コンテキスト

## 1. 変更履歴サマリ
- **Home ページ** (`frontend/src/app/page.tsx`)
  - 「経路検索」ボタン押下時に前回セッションデータをクリアし、`sessionStorage` に出発地と目的地を保存して  
    ロケーション詳細ページへ遷移するロジックを追加。
- **経路探索ロジック** (`frontend/src/lib/actions/findpath.ts`)
  - `location_navigation.json` を直接 import し、Dijkstra アルゴリズムで最短経路を計算するよう実装を全面書き換え。
- **ロケーション詳細ページ** (`frontend/src/app/location/[location]/page.tsx`)
  - ページ初期化時にセッションストレージから案内情報を復元し、未取得なら `findPath` で新規経路を計算。  
  - `次へ進む` ボタンでステップを進め、`案内終了` ボタンでセッションをクリアする UI ロジックを実装。  
  - 現在ステップ・進捗の表示、到達時の「案内終了」メッセージ表示、パノラマ画像上に次ステップ矢印を強調表示。

## 2. 技術スタック
- フレームワーク：Next.js (App Router)  
- 言語／型：TypeScript  
- UI：React 18（`use client`／Hooks）、CSS Modules  
- データ取得：`fetch` API + Next.js Server Actions（一部）  
- クライアント状態：`sessionStorage`  
- ビルド・バンドラ：Next.js（ESM モジュール解決）  
- JSON モジュール読み込み：`resolveJsonModule` 有効  

## 3. コアロジック
1. **Home → ナビゲーション開始**  
   - Home ページのフォームで出発地・目的地を選択  
   - `handleRouteSearch` で既存のセッションを破棄し、新しい `navigationDestination`・`navigationStepIndex` を初期化  
   - ルーターで `/location/[startLocation]` へ遷移  
2. **経路探索（findPath）**  
   - `location_navigation.json` から全ロケーションデータを読み込み、Map 構造に整形  
   - Dijkstra アルゴリズムで各ノードへの最短距離を計算し、`previous` マップで経路を記録  
   - ゴールからスタートへ逆順で辿りながら経路配列を構築し、返却  
3. **ロケーション詳細ページでの案内制御**  
   - ページロード時に API でロケーション情報と接続データをフェッチ  
   - `sessionStorage` の案内情報を復元し、経路未取得なら新規探索、取得済なら進捗を復元  
   - `次へ進む` ボタンで `navigationStepIndex` をインクリメントし、ルーターで次のロケーションページへ遷移  
   - 最終ステップ到達で「案内終了」状態を表示し、`案内終了` ボタンでセッションを全クリア  
   - 進行中の次ステップ矢印を CSS アニメーションで点滅／強調表示  

以上が最新の変更・技術スタック・主要ロジックの概要です。
