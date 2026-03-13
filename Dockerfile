FROM node:20-alpine

# Instalar ffmpeg para conversões de vídeo/áudio
RUN apk add --no-cache ffmpeg python3

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000 4173

CMD ["npm", "run", "start"]
