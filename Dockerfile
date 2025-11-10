FROM node:22-bullseye

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

# Copy the rest of the source code
COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]
