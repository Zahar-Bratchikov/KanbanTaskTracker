FROM node:20-alpine AS build
WORKDIR /app
# Use Google DNS to avoid EAI_AGAIN in container (Alpine resolver can be flaky)
RUN echo "nameserver 8.8.8.8" >> /etc/resolv.conf && echo "nameserver 8.8.4.4" >> /etc/resolv.conf
# Install all deps (including devDependencies) so vite is available for build
COPY package*.json ./
RUN npm ci --include=dev
COPY . .
ARG VITE_API_URL=http://localhost:5000
ENV VITE_API_URL=$VITE_API_URL
# Use local binary so the build step never hits the network (avoids npx fetch)
RUN ./node_modules/.bin/vite build
RUN ls -la dist/ && test -s dist/index.html

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80