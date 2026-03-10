FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --include=dev

COPY . .

RUN NODE_OPTIONS=--max-old-space-size=4096 npm run build

FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --omit=dev

COPY --from=0 /app/dist ./dist
COPY --from=0 /app/server ./server
COPY --from=0 /app/scripts ./scripts
COPY server.js .
COPY bootstrap.js .

EXPOSE 8080

CMD ["npm", "start"]
