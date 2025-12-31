FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package.json .

# Install dependencies
RUN npm install --only=production

# Copy app source
COPY . .

# Expose port
EXPOSE 3000

# Start app
CMD ["node", "index.js"]
