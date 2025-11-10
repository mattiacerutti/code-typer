# Use Debian-based Node image (better build toolchain for ARM64)
FROM node:20-bullseye

# Set working directory
WORKDIR /app

# Copy dependency files first for caching
COPY package*.json ./
COPY prisma ./prisma/

# Install required system packages + Node dependencies
RUN npm install

# Copy the rest of the source code
COPY . .

# Generate Prisma client and build app
RUN npx prisma generate
RUN npm run build

# Expose the application port
EXPOSE 3000

# Start the production server
CMD ["npm", "run", "start"]
