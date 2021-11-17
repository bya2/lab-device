FROM node:16-alpine

LABEL maintainer="byaa1972@gmail.com"

RUN apk add --no-cache --upgrade bash

ENV NODE_ENV=production

RUN addgroup -S labdevice && adduser -S -G labdevice
RUN mkdir /app && chown labdevice /app

WORKDIR /app

COPY --chown=labdevice:labdevice package.json package-lock.json /app/

RUN npm i --production

COPY --chown=labdevice:labdevice . .

ENTRYPOINT [ "node", "index.js" ]

