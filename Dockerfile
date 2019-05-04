FROM node:dubnium-slim

RUN npm i -g yarn

WORKDIR /mqtt-logger

COPY package.json yarn.lock tsconfig.json tsconfig.module.json ./
COPY ./src ./src

RUN yarn install
RUN yarn build


CMD [ "yarn", "start" ]