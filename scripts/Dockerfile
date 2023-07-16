# This file is moved to the root directory before building the image

# base node image
FROM node:18-bookworm-slim as base

ENV KCDSHOP_DEPLOYED="true"
ENV FLY="true"
ENV PORT="8080"
ENV NODE_ENV="production"

WORKDIR /myapp

ADD . .
RUN node setup.js

CMD ["npm", "start"]
