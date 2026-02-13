FROM node:18-alpine

WORKDIR /usr/src/app

# Copy package manifests first for cached installs
COPY package.json ./
COPY package-lock.json ./

# Install dependencies
RUN if [ -f package-lock.json ]; then npm ci --production; else npm install --production; fi

# Copy app source only
COPY src ./src
# Optionally copy other needed files (README.md, etc.)
COPY README.md ./

EXPOSE 3000

CMD ["node", "src/server.js"]
