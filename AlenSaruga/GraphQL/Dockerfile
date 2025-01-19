FROM node:20-alpine

WORKDIR /app

COPY package.json /app

RUN npm install

COPY . .

EXPOSE 4004

CMD ["node", "index.js"]