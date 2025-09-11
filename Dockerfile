# 1. Node公式イメージを利用
FROM node:20-alpine

# 2. 作業ディレクトリを作成
WORKDIR /app

# 3. 依存ファイルをコピーしてインストール
COPY package*.json ./
RUN npm install

# 4. ソースコードをコピー
COPY . .

# 5. Next.js をビルド
RUN npm run build

# 6. ポートを指定（Cloud Runで使われる）
EXPOSE 8080

# 7. 起動コマンド（Next.jsをprod起動）
CMD ["npm", "start"]
