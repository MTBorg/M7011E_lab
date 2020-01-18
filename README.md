# M7011E - Project
This project consisting of the labs in the course **M7011E - Design of Dynamic Web Systems** at LTU.
## Group Tenta Noobs
- Martin Terneborg -- termar-5@student.ltu.se
- Hugo Wangler -- hugwan-6@student.ltu.se

# Installation guide
Bellow follows information on how to get the system up and running on your local machine.

## Prerequisites
- [docker](https://docs.docker.com/install/)
- [docker-compose](https://docs.docker.com/compose/install/) (version 1.10.0 or later)

## Quick setup
To quickly deploy and test the system in dev environment locally clone the project and create the following (empty) files:
- Place a file in the simulator directory called sim.env
- Place a file in the app directory called app.env
- Place a file in the db directory called db.env

Then simply `docker-compose up --build` to start the system. By default the website is available at http://localhost:3000.

## Custom setup
If you want to change hostname, ports etc. the following files has to be created and filled out.
### Simulator/API
Place a file in the simulator directory called sim.env and fill out as below
```
DB_HOST=<database host address>
DB_USER=<database user>
DB_PORT=<database port>
DB_PASSWORD=<database password>
DB_DATABASE=<database name>

SECRET=<secret key used for authentication>
MANAGER_PASSWORD=<password needed when registering as a manager>
```

### App
Place a file in the app directory called app.env and fill out as below
```
API_ADDRESS=<graphql-api address (including port)>
API_REST_ADDRESS=<rest-api address (including port)>

SERVER_PORT<port on which to run the app server>

SECRET=<secret key used for authentication (has to be the same as for Simulator/API)>
```

### DB
Place a file in the db directory called db.env and fill out as below
```
DB_USER=<database user (has to be same as Simulator/API)>
DB_DATABASE=<database name>
```

# Authorization token
Through out the system authentication is performed by using json webtokens. The token is passed in the headers of the requests and is stored in a cookie on the client, and contains two fields: accountId(identifies the account associated with a user) and manager (boolean that indicates whether or not the user is a manager). The name of the header is `authToken` and can be retrieved as the result from login or registration mutations in the GraphQL-API.
