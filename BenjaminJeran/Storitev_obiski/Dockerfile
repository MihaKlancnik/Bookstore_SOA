# Dockerfile
FROM node:18-alpine

# Nastavimo okolje
WORKDIR /usr/src/app

# Kopiramo datoteke za aplikacijo
COPY package*.json ./
RUN npm install

COPY . .

# Zaženemo aplikacijo
CMD ["node", "index.js"]

EXPOSE 5000