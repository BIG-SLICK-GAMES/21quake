FROM node:20-alpine AS build

WORKDIR /app

ENV CI=true
ENV EXPO_PUBLIC_APP_ENV=development
ENV EXPO_PUBLIC_GAME_ID=21quake
ENV EXPO_PUBLIC_API_BASE_URL=
ENV EXPO_PUBLIC_SOCKET_BASE_URL=
ENV EXPO_PUBLIC_BIG_SLICK_GAMES_URL=https://bigslickgames.com

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run export:web

FROM nginx:1.27-alpine

COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/web-build /usr/share/nginx/html

EXPOSE 80
