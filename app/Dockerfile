FROM node:13.0.1-alpine

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY package.json .
COPY package-lock.json .

RUN npm install -g
RUN npm install --only-dev # Dev dependencies

COPY server/ .
COPY client/ .

EXPOSE 3000

CMD ["npm", "run", "dev"]
