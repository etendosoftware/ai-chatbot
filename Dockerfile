# Stage 1: Build Stage - Install dependencies and prepare the application
FROM node:20-alpine AS builder

# Install necessary build tools
RUN apk add --no-cache python3 make g++ && \
    npm install -g node-gyp

# Set the working directory
WORKDIR /app

# Copy .env along with package files to leverage caching and external configuration
COPY .env package.json yarn.lock ./

# Install all dependencies using Yarn
RUN yarn install

# Copy the rest of the application source code
COPY . .

# Stage 2: Development Stage - Create the runtime image
FROM node:20-alpine

# Install necessary runtime tools
RUN apk add --no-cache python3 make g++ && \
    npm install -g node-gyp

# Set the working directory
WORKDIR /app

# Copy the entire application (including .env) from the builder stage
COPY --from=builder /app .

# Expose the default Next.js port
EXPOSE 3000

# Command to start the Next.js development server
CMD ["yarn", "dev"]
