FROM debian:bullseye as builder

ARG NODE_VERSION=18.11.0

RUN apt-get update; apt install -y curl
RUN curl https://get.volta.sh | bash
ENV VOLTA_HOME /root/.volta
ENV PATH /root/.volta/bin:$PATH
RUN volta install node@${NODE_VERSION}

RUN mkdir /app
WORKDIR /app

ENV NODE_ENV production

RUN npm i -g pnpm

COPY package*.json ./
COPY pnpm-lock*.yaml ./

RUN pnpm install --production=false

COPY . .

RUN pnpm run build

########################

FROM node:18.11.0-alpine

WORKDIR /app
ENV NODE_ENV production
ENV PATH /root/.volta/bin:$PATH

RUN npm i -g pnpm
RUN apk add --no-cache bash

LABEL fly_launch_runtime="nodejs"

COPY --from=builder /root/.volta /root/.volta
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/pnpm-lock*.yaml ./

RUN pnpm install --prod
RUN pnpm install express

COPY --from=builder /app/dist ./dist

CMD [ "node", "dist/main.js" ]
