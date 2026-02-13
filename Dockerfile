FROM node:18-alpine

#Change the working directory.
WORKDIR /usr/src/app

#Build argument (default false).
ARG RUN_TESTS=false

#Copy package manifests first for cached installs.
COPY package.json ./
COPY package-lock.json* ./

#Install dependencies (include devDependencies if tests are enabled).
RUN if [ "$RUN_TESTS" = "true" ]; then \
      echo "Installing all dependencies (including dev)"; \
      npm ci; \
    else \
      echo "Installing production dependencies only"; \
      npm ci --omit=dev; \
    fi

#Copy required files.
COPY src ./src
COPY test ./test
COPY README.md ./

#Run tests only if enabled.
RUN if [ "$RUN_TESTS" = "true" ]; then \
      echo "Running tests..."; \
      npm test; \
    fi

#Expose listening port.
EXPOSE 3000

#Run process.
CMD ["node", "src/server.js"]