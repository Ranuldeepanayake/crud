FROM node:18-alpine

WORKDIR /usr/src/app

# copy package manifests first for cached installs
COPY package.json package-lock.json* ./
RUN npm install --production

# copy app
COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
