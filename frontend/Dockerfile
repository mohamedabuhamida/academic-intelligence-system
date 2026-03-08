FROM node:20-bookworm-slim

WORKDIR /app

# Copy package files first (for caching)
COPY package*.json ./

RUN npm install --include=optional
RUN apt update && apt install -y \
    dnsutils \
    iputils-ping \
    netcat-openbsd \
    && rm -rf /var/lib/apt/lists/*

# Copy project files
COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
