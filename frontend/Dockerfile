FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ENV VITE_API_URL=/api
RUN npm run build

FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html

# Configuration Nginx avec Reverse Proxy unifié :
# 1. SPA Routing (React Router) sur /index.html
# 2. Transfère automatiquement /api et /sanctum au service backend Docker/Render
RUN printf 'server {\n\
    listen 80;\n\
    root /usr/share/nginx/html;\n\
    \n\
    location / {\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
    \n\
    location /api {\n\
        proxy_pass http://cyberguard-backend:10000;\n\
        proxy_set_header Host $host;\n\
        proxy_set_header X-Real-IP $remote_addr;\n\
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n\
        proxy_set_header X-Forwarded-Proto $scheme;\n\
        proxy_read_timeout 120s;\n\
        proxy_connect_timeout 120s;\n\
        proxy_send_timeout 120s;\n\
    }\n\
    \n\
    location /sanctum {\n\
        proxy_pass http://cyberguard-backend:10000;\n\
        proxy_set_header Host $host;\n\
        proxy_set_header X-Real-IP $remote_addr;\n\
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n\
        proxy_set_header X-Forwarded-Proto $scheme;\n\
        proxy_read_timeout 120s;\n\
        proxy_connect_timeout 120s;\n\
        proxy_send_timeout 120s;\n\
    }\n\
}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
