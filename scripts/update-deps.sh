npx npm-check-updates --dep prod,dev --upgrade --workspaces --root
rm -rf node_modules package-lock.json
npm install
node setup.js
npm run typecheck
npm run lint --fix
