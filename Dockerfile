FROM node:14
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN ./node_modules/.bin/webpack
CMD [ "node", "build/build.js" ]
