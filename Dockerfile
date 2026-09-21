FROM node:22-alpine

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Instala openssl, que é obrigatório para a engine do Prisma rodar no Alpine
RUN apk update && apk add --no-cache openssl

# Copia os arquivos de configuração de dependências primeiro
COPY package*.json ./
COPY prisma ./prisma/

# Instala todas as dependências (incluindo devDependencies como o tsx)
RUN npm install

# Copia o restante do código fonte para dentro do container
COPY . .

# Gera o Prisma Client com a engine correta para o ambiente
RUN npx prisma generate

# Expõe a porta que a aplicação vai rodar (Render geralmente mapeia automaticamente, mas é boa prática)
EXPOSE 3333

# Inicia a aplicação usando o tsx (que já está no node_modules via devDependencies)
CMD ["npx", "tsx", "src/app/server.ts"]
