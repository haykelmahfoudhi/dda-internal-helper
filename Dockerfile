ARG NODE_VERSION=24.11-alpine3.22

FROM node:${NODE_VERSION} AS build

WORKDIR /builder

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:${NODE_VERSION} AS release

WORKDIR /home/node/app

RUN apk add --no-cache curl

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=build --chown=node:node /builder/.next ./.next
COPY --from=build --chown=node:node /builder/public ./public
COPY --from=build --chown=node:node /builder/next.config.ts ./
COPY --from=build --chown=node:node /builder/package.json ./

USER node

ENV PORT=3009
ENV NODE_ENV=production
ENV HOST=0.0.0.0

EXPOSE 3009

ENTRYPOINT ["node", "node_modules/.bin/next", "start", "-p", "3009"]
