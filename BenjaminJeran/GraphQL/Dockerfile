# Uporabimo uradno Node.js sliko kot osnovno sliko
FROM node:16

# Nastavimo delovni imenik v sliki
WORKDIR /usr/src/app

# Kopiramo package.json in package-lock.json (če obstaja)
COPY package*.json ./

# Namestimo odvisnosti
RUN npm install

# Kopiramo preostalo kodo aplikacije v sliko
COPY . .

# Odpremo vrata, na katerih bo aplikacija tekla
EXPOSE 4000

# Določimo ukaz za zagon aplikacije
CMD ["node", "server.js"]
