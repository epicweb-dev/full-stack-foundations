# This file is moved to the root directory before building the image

# base node image
FROM node:18-bookworm-slim as base

RUN apt-get update && apt-get install -y git

ENV KCDSHOP_CONTEXT_CWD="/myapp"
ENV KCDSHOP_DEPLOYED="true"
ENV FLY="true"
ENV PORT="8080"
ENV NODE_ENV="production"
ENV SKIP_PLAYGROUND="true"
ENV SKIP_PLAYWRIGHT="true"

WORKDIR /myapp

ADD . .

RUN node setup.js

CMD ["node", "./scripts/start.js"]
