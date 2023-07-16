# This file is moved to the root directory before building the image

# base node image
FROM node:18-bookworm-slim as base

RUN apt-get update && apt-get install -y git

WORKDIR /myapp

ADD . .

ENV SKIP_PLAYGROUND="true"
ENV SKIP_PLAYWRIGHT="true"

RUN node setup.js

ENV KCDSHOP_DEPLOYED="true"
ENV FLY="true"
ENV PORT="8080"
ENV NODE_ENV="production"

CMD ["npm", "start"]
