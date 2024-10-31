FROM node:18-alpine AS base

RUN npm i -g pnpm

FROM base AS dependencies

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install

FROM base AS build

WORKDIR /app
RUN npm i -g @vercel/ncc
COPY . .
COPY --from=dependencies /app/node_modules ./node_modules
RUN pnpm prisma generate
RUN pnpm build
RUN pnpm prune --prod
RUN ncc build dist/main.js -o dist-ncc
# prisma engine should be located alongside index.js, but ncc bundler create client subfolder
RUN mv dist-ncc/client/* dist-ncc/

FROM node:18-alpine

WORKDIR /app
COPY --from=build /app/dist-ncc .

CMD [ "node", "index.js" ]