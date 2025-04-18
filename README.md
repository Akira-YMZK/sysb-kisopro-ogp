# 教室検索システム

このプロジェクトは教室検索システムのNext.jsアプリケーションです。

## プロジェクト構造

- `frontend/` - Next.jsアプリケーション
  - `src/lib/` - Server Actionsとデータファイル
    - `actions/` - Server Actions（'use server'宣言のある関数）
    - `data/` - JSONデータファイル
    - `utils/` - データ読み込み用のユーティリティ関数
  - `src/app/` - Next.jsのページとAPIルート
  - `src/components/` - Reactコンポーネント
  - `src/types/` - TypeScript型定義
  - `src/utils/` - ユーティリティ関数

## 技術スタック

- Next.js
- React
- TypeScript
- TailwindCSS

## 特徴

- Server Actionsを使用したサーバーサイド処理
- TypeScriptによる型安全性
- 教室データの検索と表示
- スケジュールデータの管理

プロジェクトの起動方法
１、frontendディレクトリへ移動
```bash
cd frontend
```
２、ライブラリ・依存関係のインストール
```bash
npm install
```
３、開発サーバーの起動(デバッグモード)
```bash
npm run dev
```