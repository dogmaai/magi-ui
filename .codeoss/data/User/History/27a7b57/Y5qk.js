un@cloudshell:~/magi-app (screen-share-459802)$ node --check server.js
npm start
# 別タブ
curl -s http://localhost:8080/healthz; echo
/home/jun/magi-app/server.js:1
cd ~/magi-app
   ^

SyntaxError: Unexpected token '~'
    at checkSyntax (node:internal/main/check_syntax:74:5)

Node.js v22.19.0

> magi-app@1.0.0 start
> node server.js

file:///home/jun/magi-app/server.js:1
cd ~/magi-app
   ^

SyntaxError: Unexpected token '~'
    at compileSourceTextModule (node:internal/modules/esm/utils:346:16)
    at ModuleLoader.moduleStrategy (node:internal/modules/esm/translators:107:18)
    at #translate (node:internal/modules/esm/loader:540:12)
    at ModuleLoader.loadAndTranslate (node:internal/modules/esm/loader:587:27)
    at async ModuleJob._link (node:internal/modules/esm/module_job:162:19)

Node.js v22.19.0

jun@cloudshell:~/magi-app (screen-share-459802)$ 