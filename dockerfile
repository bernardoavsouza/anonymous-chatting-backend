FROM node:20.11.1-slim AS build
ENV NODE_ENV=development

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN npm install -g pnpm@9.9.0
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build

# ----------------------------------------------------------- #

FROM node:20.11.1-slim AS production
ENV NODE_ENV=production

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN npm install -g pnpm@9.9.0
RUN pnpm install --frozen-lockfile --prod --ignore-scripts

COPY --from=build /app/dist .app/dist

EXPOSE 3000
ENTRYPOINT [ "node" ]
CMD [ "dist/index.js" ]