FROM node:20 AS build
WORKDIR /app
COPY src/client/package*.json ./
RUN npm install
COPY src/client ./

RUN NODE_OPTIONS="--max-old-space-size=8192" npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]