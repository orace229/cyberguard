FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
# Route toutes les requêtes vers index.html : react-router-dom gère le
# routage côté client, nginx ne doit pas 404 sur /historique, /profil, etc.
RUN printf 'server {\n\
    listen 80;\n\
    root /usr/share/nginx/html;\n\
    location / {\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["sh", "-c", "echo \"window.__ENV__ = { VITE_API_URL: '${VITE_API_URL}' };\" > /usr/share/nginx/html/env-config.js && exec nginx -g 'daemon off;'"]
