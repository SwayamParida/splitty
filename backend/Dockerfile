FROM node:16

WORKDIR /app/dev
COPY package.json /app`
COPY yarn.lock /app
COPY tsconfig.json /app

WORKDIR /app
RUN yarn install

EXPOSE 9000

WORKDIR /app/dev
CMD ["npm", "run", "start:watch"]