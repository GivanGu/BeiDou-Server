FROM node:20 AS builder
 
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      optipng build-essential ca-certificates pkg-config libpng-dev zlib1g-dev python3 make gcc g++
 
WORKDIR /opt/ui
 
COPY ./gms-ui/package.json ./
COPY ./gms-ui/yarn.lock ./
 
RUN --mount=type=cache,target=/root/.cache yarn global add yarn@v1.22.10 && \
    yarn install --frozen-lockfile --ignore-scripts && \
    PLATFORM=$(node -p "process.platform + '-' + process.arch") && \
    mkdir -p node_modules/optipng-bin/vendor/$PLATFORM && \
    ln -sf /usr/bin/optipng node_modules/optipng-bin/vendor/$PLATFORM/optipng
 
COPY ./gms-ui/ ./
 
RUN yarn build --outDir ./dist
 
FROM nginx:alpine
 
COPY --from=builder /opt/ui/dist/ /usr/share/nginx/html/
 
COPY ./docker/nginx-ui.conf /etc/nginx/conf.d/default.conf
 
EXPOSE 8686