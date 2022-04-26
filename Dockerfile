FROM node:14-alpine

RUN mkdir -p /home/node/data
RUN mkdir -p /home/node/node_modules

RUN chown -R node:node /home/node

WORKDIR /home/node

COPY package*.json ./

USER node

RUN npm install

COPY --chown=node:node . .

CMD [ "node", "app.mjs" ]