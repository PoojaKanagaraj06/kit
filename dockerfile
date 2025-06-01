# Use Node.js image
FROM node:18

# Set working directory
WORKDIR /app

# Copy backend code
COPY backend/package*.json ./backend/
RUN cd backend && npm install

# Copy all source code
COPY . .

# Expose port
EXPOSE 3000

# Run the app
CMD ["node", "backend/server.js"]
