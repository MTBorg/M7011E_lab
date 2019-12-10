FROM node:13.0.1-alpine

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

# Copy package and source files
COPY package.json .
COPY package-lock.json .
COPY server/ .
COPY client/ .

# Install packages
RUN npm install -g
RUN npm install --only-dev # Dev dependencies

EXPOSE 3000

CMD ["npm", "run", "dev"]
