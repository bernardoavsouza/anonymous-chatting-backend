FROM node:20.11.1-slim

WORKDIR /app

COPY . .

RUN npm install -g pnpm@9.9.0

EXPOSE 3000
ENTRYPOINT [ "pnpm", "run" ]
CMD ["dev"]