FROM node:14-alpine

RUN mkdir -p /home/node/data
RUN mkdir -p /home/node/node_modules

WORKDIR /home/node

COPY package*.json ./

RUN npm install

COPY . .

CMD [ "node", "app.mjs" ]