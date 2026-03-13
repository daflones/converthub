# ConvertHub

Plataforma completa de conversão de mídia com download de YouTube, conversores de vídeo/áudio/imagem/documento/base64, isolamento de sessão por visitor ID, streaming de progresso via SSE e UI moderna.

## 🚀 Features

- **YouTube Download**: Baixe vídeos do YouTube com progresso em tempo real
- **Conversores de Mídia**:
  - Vídeo (MP4, AVI, MOV, MKV, OGG, WebM, FLV, 3GP, TS, M4V)
  - Áudio (MP3, WAV, AAC, FLAC, M4A, Opus, WMA, OGG)
  - Imagem (JPG, PNG, WebP, GIF, BMP, TIFF, AVIF, ICO)
  - Documento (PDF, DOCX, TXT, HTML, CSV, XLSX, JSON)
  - Base64 (Encode/Decode)
- **Isolamento de Sessão**: Cada visitante tem seu próprio espaço temporário
- **Progresso em Tempo Real**: SSE streaming para feedback instantâneo
- **UI Moderna**: React + Tailwind CSS + Framer Motion

## 📦 Instalação

```bash
npm install
```

## 🔧 Configuração

Crie um arquivo `.env` baseado no `.env.example`:

```bash
APIFY_API_TOKEN=seu_token_apify_aqui
# PORT é opcional - padrão 3000 em dev, use 80 em produção
```

## 🏗️ Build

```bash
npm run build
```

Isso gera a pasta `dist/` com o frontend otimizado.

## 🚀 Deploy em Produção

### Opção 1: Servidor único (Backend serve Frontend)

1. **Build do frontend**:
   ```bash
   npm run build
   ```

2. **Configure a porta** (opcional):
   ```bash
   # No arquivo .env do servidor
   PORT=80
   ```

3. **Inicie o servidor**:
   ```bash
   npm start
   ```

O backend Express vai:
- Servir arquivos estáticos da pasta `dist/`
- Responder às rotas de API em `/api/*`
- Redirecionar todas as outras rotas para `index.html` (SPA routing)

### Opção 2: Frontend e Backend separados

**Frontend** (Netlify, Vercel, etc.):
```bash
npm run build
# Deploy da pasta dist/
```

**Backend** (VPS, Heroku, etc.):
```bash
node server.js
```

Configure CORS no `server.js` para aceitar o domínio do frontend.

## 🌐 Configuração de Domínios

### Se você tem um domínio apontando para o servidor:

1. **Certifique-se que o build foi feito**: `npm run build`
2. **Configure a porta no .env**:
   - Para porta 80 (HTTP): `PORT=80`
   - Para porta 443 (HTTPS com proxy reverso): deixe o proxy (nginx/caddy) gerenciar
3. **Inicie o servidor**: `npm start`

### Portas recomendadas:

- **Desenvolvimento**: `PORT=3000` (padrão)
- **Produção HTTP**: `PORT=80`
- **Produção HTTPS**: Use nginx/caddy como proxy reverso na porta 443, backend na 3000

## 📝 Scripts

```bash
npm run dev      # Desenvolvimento (Vite + Backend)
npm run build    # Build do frontend
npm start        # Produção (Preview + Backend)
npm run preview  # Preview do build
```

## 🐳 Docker

```bash
docker build -t converthub .
docker run -p 80:80 -e APIFY_API_TOKEN=seu_token converthub
```

## 🔒 Variáveis de Ambiente

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `APIFY_API_TOKEN` | Token da API Apify para YouTube download | Obrigatório |
| `PORT` | Porta do servidor Express | `3000` |

## 📄 Licença

MIT
