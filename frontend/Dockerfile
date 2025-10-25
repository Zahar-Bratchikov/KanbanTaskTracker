FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_API_URL=http://localhost:5000
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build
RUN ls -la dist/ && test -s dist/index.html

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80