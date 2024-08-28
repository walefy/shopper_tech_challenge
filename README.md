# shopper tech challenge

## Endpoints disponíveis

|método|endpoint|
|---|---|
|post|/upload|
|patch|/confirm|
|get|/<customer_code>/list|
|get|/<customer_code>/list?measure_type=gas|
|get|/<customer_code>/list?measure_type=water|

## Como rodar

Primeiramente encontre o arquivo ```.env.example``` e renomeie ele para ```.env```. Após isso entre no arquivo e mude o valor da variável ```GEMINI_API_KEY``` para sua chave de api do gemini.

Após setar essa variável basta rodar o comando:

```bash
docker compose up -d
```

a api estará disponível na porta ```3001```.

## Executando os testes

Para executar os testes o banco de dados precisa estar funcionando pois os testes de integração não contam com mock do banco de dados. Para rodar apenas o banco de dados execute o seguinte comando:

```bash
docker compose up database -d
```

Após isso basta executar os testes com o Bun, rodando o seguinte comando:

```bash
bun run test:local
```

Caso não tenha o bun instalado, você pode rodar os testes dentro do container da aplicação com os seguintes comandos:

Primeiro vamos entrar no container:

```bash
docker exec -it shopper_backend bash
```

Depois basta rodar os testes:

```bash
bun run test:docker
```

## Tecnologias utilizadas

- Express: pra uma aplicação altamente customizável e simples
- Mysql: para um banco de dados simples mas robusto
- Minio: para simulação de um serviço s3 da amazon (deixa a aplicação mais proxima de como seria em um ambiente real)
- Gemini: para visão computacional
- Prisma: foi escolhido por ser um ORM poderoso e ao mesmo tempo simples
- Zod: para validação de entradas
- Bun: foi escolhido por ser um runtime leve, poderoso e moderno
