# Sử dụng Node.js bản đầy đủ (Debian) để tương thích 100% thư viện C++/OpenSSL
FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . prisma ./prisma/
RUN npx prisma generate

COPY . .

EXPOSE 5000

CMD ["npm", "start"]