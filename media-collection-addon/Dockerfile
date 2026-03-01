FROM node:20-alpine

# Build dependencies for better-sqlite3 native compilation
RUN apk add --no-cache python3 make g++

# Copy and install Node.js dependencies
WORKDIR /app
COPY app/package.json ./
RUN npm install --omit=dev

COPY app/ ./

# Copy startup script
COPY run.sh /run.sh
RUN chmod +x /run.sh

EXPOSE 8099

CMD ["/run.sh"]
