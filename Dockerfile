FROM oven/bun:latest

WORKDIR /app

COPY package.json .
COPY bun.lockb .
COPY prisma .
COPY . .

RUN bun install

CMD [ "bun", "run", "dev" ]
