FROM node:18-alpine

WORKDIR /app

# package.json のみを先にコピーして依存関係をインストール
COPY package.json ./

# npm cache をクリアして確実にインストール
RUN npm cache clean --force && \
    npm install --only=production --no-audit --no-fund

# アプリケーションコードをコピー
COPY server.js ./

EXPOSE 8080

CMD ["node", "server.js"]
