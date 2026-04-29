FROM ghcr.io/puppeteer/puppeteer:latest

USER root

# Define o diretório de trabalho
WORKDIR /app

# Copia os arquivos de dependência
COPY package*.json ./

# Instala as dependências
RUN npm install

# Copia o restante do código
COPY . .

# Expõe a porta que a Render precisa
EXPOSE 3000

# Inicia o robô
CMD ["npm", "start"]
