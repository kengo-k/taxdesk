#!/bin/bash
npx prisma generate
npx prisma migrate deploy
node seed.js
npm run build
npm start
