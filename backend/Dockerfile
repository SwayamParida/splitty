FROM node:16
WORKDIR /app
COPY ./package.json ./package.json
COPY ./server.ts ./server.ts
RUN yarn install
EXPOSE 9000
CMD ["ts-node", "server.ts"]