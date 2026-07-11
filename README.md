# 消化器外科 論文ダイジェスト

PubMed から消化器外科(食道・胃・大腸・肝臓・膵臓・胆道)領域の新着論文を毎日自動収集し、
掲載誌のインパクト・新着度でスコアリングした上で、日本語要約と自動生成インフォグラフィックとともに紹介する Web アプリです。

## 仕組み

1. **収集** — `scripts/fetch-digest.mjs` が PubMed E-utilities (`esearch` / `efetch`) を叩き、消化器外科関連のMeSH/キーワードにマッチする直近の論文を取得します。
2. **スコアリング** — `data/journals.json` に定義した掲載誌ティア(NEJM, Lancet, Annals of Surgery など)と新着度(指数減衰)から `impactScore` を算出し、インパクトの強い論文を優先表示します。
3. **要約・構造化** — `ANTHROPIC_API_KEY` が設定されていれば Claude を使って日本語タイトル・箇条書き要約・構造化情報(対象臓器・術式・アプローチ・サンプル数・結論の方向性など)を生成します。未設定の場合はキーワード辞書によるフォールバック(未翻訳)になります。
4. **可視化** — 構造化情報をもとに、臓器アイコン・術式アイコン(腹腔鏡/ロボット/開腹/内視鏡)・結果の傾向(良好/中立/要注意)を組み合わせた簡易インフォグラフィックを `components/PaperInfographic.tsx` が SVG でその場生成します(画像生成AIは使わず、コードで確定的に描画)。
5. **公開** — Next.js の静的ページとして `data/digests/*.json` を読み込み、トップページ(最新)・アーカイブ・論文詳細ページを生成します。

## ローカルでの実行

```bash
npm install
npm run dev
```

http://localhost:3000 を開くと、`data/digests/2026-07-10.json` に入っている**サンプルデータ**(画面上部にサンプルである旨のバナーが出ます)が表示されます。

## 実データを取得する

```bash
cp .env.example .env
# .env に ANTHROPIC_API_KEY (任意) や NCBI_API_KEY (任意) を設定
npm run fetch-digest
```

`data/digests/YYYY-MM-DD.json` が生成され、`npm run dev` / `npm run build` で反映されます。
`ANTHROPIC_API_KEY` を設定しない場合でも動作しますが、タイトル・要約は日本語訳されず `[未翻訳]` 表記になります(医学的な誤訳を避けるため、キーによる正式な要約なしに独自翻訳は行いません)。

### 環境変数

`.env.example` を参照してください。主なもの:

| 変数 | 説明 |
| --- | --- |
| `ANTHROPIC_API_KEY` | 日本語要約・構造化に使用。未設定でも動作(フォールバック) |
| `ANTHROPIC_MODEL` | 使用モデルID。既定 `claude-sonnet-5` |
| `NCBI_API_KEY` | PubMed APIのレート制限緩和用(任意) |
| `DIGEST_LOOKBACK_DAYS` | 何日前までの新着論文を検索するか(既定 3日) |
| `DIGEST_MAX_PAPERS` | 1日のダイジェストに含める最大論文数(既定 15件) |

## 毎日自動更新する(GitHub Actions)

`.github/workflows/daily-digest.yml` が毎日 06:00 JST に `npm run fetch-digest` を実行し、
生成された `data/digests/*.json` を自動コミットします。

有効化する手順:

1. このリポジトリのデフォルトブランチ(`main`)にこのワークフローをマージする(スケジュール実行はデフォルトブランチ上のワークフローのみ動作します)。
2. Settings → Secrets and variables → Actions で `ANTHROPIC_API_KEY`(推奨)・`NCBI_API_KEY`(任意)を登録する。
3. 手動で試す場合は Actions タブから "Daily PubMed Digest" を `workflow_dispatch` で実行できます。

## デプロイ

Next.js の標準的なアプリなので [Vercel](https://vercel.com/new) へのデプロイが最も簡単です。
GitHub Actions が `data/digests/` を更新 → main へ push → Vercel が自動で再ビルド、という流れで
「毎日自動更新されるダイジェストサイト」になります。

## ディレクトリ構成(抜粋)

```
app/                  # ページ (トップ / アーカイブ / 論文詳細)
components/           # PaperCard, PaperInfographic などのUI
lib/                  # 型定義・データ読み込み・アイコン(SVG)定義
data/journals.json    # 掲載誌ティア定義
data/digests/*.json   # 日次ダイジェストデータ(自動生成 / サンプル)
scripts/fetch-digest.mjs  # PubMed取得〜要約〜JSON生成のバッチ処理
.github/workflows/daily-digest.yml  # 毎日の自動実行ジョブ
```

## 免責事項

本アプリの要約・図示はAIによる自動生成であり、内容の完全性・正確性を保証するものではありません。
臨床判断は必ず一次情報(原著論文)および専門家の判断に基づいて行ってください。
