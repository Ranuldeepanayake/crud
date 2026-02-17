FROM node:18-alpine

#Provisions for the test user.
# ARG TEST_USER_ID=1000
# ARG TEST_GROUP_ID=1000
# ARG TEST_USER_NAME=appuser
# ARG TEST_GROUP_NAME=appgroup
# #RUN groupadd -g $TEST_USER_ID appuser && useradd -m -u $TEST_USER_ID -g $TEST_USER_ID appuser #Debian style
# # RUN if ! getent group $TEST_GROUP_NAME >/dev/null; then \
# #       addgroup -g $TEST_GROUP_ID $TEST_GROUP_NAME; \
# #     fi && \
# #     adduser -u $TEST_USER_ID -G $TEST_GROUP_NAME -D $TEST_USER_NAME
# # RUN adduser -u $TEST_USER_ID -G $TEST_GROUP_NAME -D $TEST_USER_NAME
# RUN GROUP_NAME=$(getent group $TEST_GROUP_ID | cut -d: -f1 || true) && \
#     if [ -z "$GROUP_NAME" ]; then \
#         addgroup -g $TEST_GROUP_ID $TEST_GROUP_NAME && GROUP_NAME=$TEST_GROUP_NAME; \
#     fi && \
#     adduser -D -u $TEST_USER_ID -G $GROUP_NAME $TEST_USER_NAME

# RUN addgroup -g $TEST_GROUP_ID appuser && 
# RUN adduser -u $TEST_USER_ID -G $TEST_GROUP_ID -D appuser

#Check if the user ID exists. Else, fail the build.
RUN getent passwd 1000

USER node

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
