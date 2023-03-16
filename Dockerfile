FROM node:latest
WORKDIR /app
COPY . ./package.json ./package-lock.json ./magnicache-demo/package.json ./magnicache-server/package.json ./client/package.json /app/
COPY ./magnicache-client/package.json ./magnicache-client/package-lock.json /app/magnicache-client/
RUN npm install
RUN cd client && npm install
# RUN cd magnicache-client && npm install
RUN cd magnicache-demo && npm install
# RUN cd magnicache-server && npm install
COPY . .
RUN npm run build
EXPOSE 3000
ENTRYPOINT [ "node", "./magnicache-demo/server.js" ] 