FROM --platform=amd64 node:16-alpine AS builder

ARG DOCKER_ENV
ENV NODE_ENV=${DOCKER_ENV}

WORKDIR /app
COPY ./ .
RUN npm i --production=false \
  && npm run build

FROM --platform=amd64 node:16-alpine

ARG DOCKER_ENV
ENV NODE_ENV=${DOCKER_ENV}

WORKDIR /app

VOLUME /app/public

COPY --from=builder /app/dist ./dist
COPY ./ .

RUN chmod +x ./docker-entrypoint.sh \
	&& npm i --production=true

ENTRYPOINT [ "./docker-entrypoint.sh" ]

EXPOSE 3000
CMD npm run start
