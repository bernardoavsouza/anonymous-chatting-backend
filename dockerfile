FROM node:22.16.0-alpine AS build
ENV NODE_ENV=development

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN npm install -g pnpm@10.11.0
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build

# ----------------------------------------------------------- #

FROM node:22.16.0-alpine AS production
ENV NODE_ENV=production

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN npm install -g pnpm@10.11.0
RUN pnpm install --frozen-lockfile --prod --ignore-scripts

COPY --from=build /app/dist ./dist

EXPOSE 3000
ENTRYPOINT [ "node" ]
CMD [ "dist/main.js" ]