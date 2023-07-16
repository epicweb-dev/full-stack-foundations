# This file is moved to the root directory before building the image

# base node image
FROM node:18-bookworm-slim as base

# set for base and all layer that inherit from it
ENV NODE_ENV production

# Install all node_modules, including dev dependencies
FROM base as deps

WORKDIR /myapp

ADD package.json package-lock.json .npmrc ./
RUN npm install --include=dev

# Setup production node_modules
FROM base as production-deps

WORKDIR /myapp

COPY --from=deps /myapp/node_modules /myapp/node_modules
ADD package.json package-lock.json .npmrc ./
RUN npm prune --omit=dev

# Finally, build the production image with minimal footprint
FROM base

ENV KCDSHOP_DEPLOYED="true"
ENV FLY="true"
ENV PORT="8080"
ENV NODE_ENV="production"

WORKDIR /myapp

COPY --from=production-deps /myapp/node_modules /myapp/node_modules

ADD . .

CMD ["npm", "start"]