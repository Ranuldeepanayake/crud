FROM node:18-alpine

#Check if the user ID exists. Else, fail the build.
RUN getent passwd 1000

#Run everything as the specified user.
#USER node

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

#Does not leave devDependencies in the image even if tests are enabled but adds the cost of building twice.

# ---------- Stage 1: Build & Test ----------
# FROM node:18-alpine AS builder

# WORKDIR /usr/src/app
# ARG RUN_TESTS=false

# COPY package.json package-lock.json* ./
# RUN npm ci

# COPY src ./src
# COPY test ./test
# COPY README.md ./

# RUN if [ "$RUN_TESTS" = "true" ]; then npm test; fi


# # ---------- Stage 2: Production ----------
# #Image starts with a new stage and does not install test components.
# FROM node:18-alpine

# WORKDIR /usr/src/app

# COPY package.json package-lock.json* ./
# RUN npm ci --omit=dev

# COPY src ./src
# COPY README.md ./

# EXPOSE 3000
# CMD ["node", "src/server.js"]
