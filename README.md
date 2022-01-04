# compass

## 環境変数

|環境変数|設定例|説明|
|---|---|---|
| DATABASE_URL | mysql://`username`:`password`@`hostname`:`port`/`database` | DB接続文字列 |
| TOKEN_SECRET | this-is-a-secret-value-with-at-least-32-characters | セッショントークンのシークレットキー (32文字以上) |
| ADMIN_SECRET | secret | 管理ページへのアクセスパスワード |

## Setup Dev Backend
`cd .dev/compass-dev-backends`  
`docker-compose up -d`

## Install
`npm install`  
`vi .env`  
`npx prisma db push`

## Dev
`npm run dev`

## Build
`npm run build`

## Start
`npm run start`
