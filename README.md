# 本棚 (hondana)

読んだ本を登録して、自分だけの本棚を育てていくモバイルアプリ。
Expo (React Native + TypeScript) 製で、iOS / Android 向けにビルドして App Store / Google Play に提出できます。

## 機能

- **本棚ビジュアル** — 登録した本が背表紙で棚に並ぶ。お気に入りにした本は表紙を見せて「面置き」表示
- **書籍検索で簡単登録** — Google Books API でタイトル・著者を検索し、表紙つきでワンタップ登録
- **感想・評価メモ** — 星評価（1〜5）、読んだ月、感想メモを記録
- **読書統計** — 合計冊数・今年の冊数・平均評価、直近12か月の月別読了数、評価の内訳
- **リンクで本棚を共有** — サーバー不要。本棚データをURLに埋め込み、静的ビューワー（`docs/index.html`）で誰でも閲覧できる

データは端末内（AsyncStorage）に保存されます。アカウント登録は不要です。

## 開発

```bash
npm install
npm start          # Expo Dev Server 起動（Expo Go アプリで実機確認）
npx tsc --noEmit   # 型チェック
```

## 共有ビューワーの公開（GitHub Pages）

共有リンクは `https://wa-ra-so.github.io/hon/#b=...` 形式です。
リポジトリの Settings → Pages で **Branch: main / Folder: `/docs`** を指定して公開してください。
別のURLで公開する場合は `src/share.ts` の `VIEWER_URL` を変更します。

## App Store への提出

1. [Apple Developer Program](https://developer.apple.com/jp/programs/)（年間 $99）に登録
2. `npm install -g eas-cli` して `eas login`
3. `eas build --platform ios` でクラウドビルド
4. `eas submit --platform ios` で App Store Connect に提出
5. App Store Connect でスクリーンショット・説明文を設定して審査へ

Bundle ID は `app.json` の `com.waraso.hondana` を必要に応じて変更してください。

## 構成

```
App.tsx                     ナビゲーション（タブ + 詳細スタック）
src/
  store.tsx                 本データの状態管理 + AsyncStorage 永続化
  googleBooks.ts            Google Books API 検索
  share.ts                  本棚データのURLエンコードと共有
  components/Shelf.tsx      本棚ビジュアル（背表紙・面置き）
  screens/                  本棚 / 検索 / 統計 / 本の詳細
docs/index.html             共有リンク用の静的ビューワー（GitHub Pages）
```
