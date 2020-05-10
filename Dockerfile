FROM node:14
WORKDIR /app
ADD  https://mcsi.mp/simpsons.json modules/simpsons.json
COPY package*.json ./
RUN npm install
COPY . .
RUN ./node_modules/.bin/webpack
CMD [ "node", "build/build.js" ]
