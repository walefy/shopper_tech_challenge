FROM oven/bun:latest

WORKDIR /app

COPY package.json .
COPY bun.lockb .
COPY ./src ./src

RUN bun install

CMD [ "bun", "run", "dev" ]
