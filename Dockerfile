# Stage 1: Build the application
FROM node:20-alpine AS builder

# Install necessary build tools
RUN apk add --no-cache python3 make g++ pnpm

RUN npm install -g node-gyp

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock) files
COPY ./package*.json ./
# If using Yarn, use:
# COPY yarn.lock ./

# Install dependencies
RUN pnpm install
# If using Yarn, use:
# RUN yarn install

# Copy the rest of the application code
COPY . .

# Build the application for production
RUN pnpm run build
# If using Yarn, use:
# RUN yarn build

# Stage 2: Production
FROM node:20-alpine

# Install necessary runtime tools
RUN apk add --no-cache python3 make g++ pnpm
RUN npm install -g node-gyp

# Set the working directory
WORKDIR /app

# Copy only production dependencies from the build stage
COPY ./package*.json ./
# If using Yarn, use:
# COPY yarn.lock ./

RUN pnpm install --production
# If using Yarn, use:
# RUN yarn install --production

# Copy build artifacts from the build stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public/fonts ./public/fonts
COPY --from=builder /app/public/images ./public/images
COPY --from=builder /app/next.config.ts ./

ENV NEXTAUTH_URL="https://ui.ai.labs.etendo.cloud"

# Expose the port the application will use
EXPOSE 3000

# Command to start the application
CMD ["npm", "start"]