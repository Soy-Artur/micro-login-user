FROM node:18-alpine

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install --omit=dev

# Copiar el código fuente
COPY . .

# Exponer el puerto
EXPOSE ${PORT:-4000}

# Variables de entorno
ENV NODE_ENV=production
ENV PORT=${PORT:-4000}

# Comando de inicio
CMD ["npm", "start"]
