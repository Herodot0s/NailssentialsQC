# Stage 1: Build
FROM node:20-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
# Custom nginx config to handle SPA routing if needed
# For now, standard nginx is fine for simple testing
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
