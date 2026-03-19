FROM node:22-alpine

RUN npm install -g pnpm

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/contracts/package.json ./packages/contracts/
COPY apps/api/package.json ./apps/api/

RUN pnpm install

COPY . .

EXPOSE 3000

CMD ["pnpm", "--filter", "@ifretes/api", "run", "dev"]
