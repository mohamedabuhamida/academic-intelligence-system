FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# In development, we use 'npm run dev' to allow hot-reloading
CMD ["npm", "run", "dev"]