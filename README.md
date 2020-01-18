# M7011E - Project
This project consisting of the labs in the course **M7011E - Design of Dynamic Web Systems** at LTU.
## Group Tenta Noobs
- Martin Terneborg -- termar-5@student.ltu.se
- Hugo Wangler -- hugwan-6@student.ltu.se

# Setup
## Simulator/API
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

## App
Place a file in the app directory called app.env and fill out as below
```
API_ADDRESS=<graphql-api address (including port)>
API_REST_ADDRESS=<rest-api address (including port)>

SERVER_PORT<port on which to run the app server>

SECRET=<secret key used for authentication (has to be the same as for Simulator/API)>
```

## Authorization token
Through out the system authentication is performed by using json webtokens. The token is passed in the headers of the requests and is stored in a cookie on the client, and contains two fields: accountId(identifies the account associated with a user) and manager (boolean that indicates whether or not the user is a manager). The name of the header is `authToken` and can be retrieved as the result from login or registration mutations in the GraphQL-API.
