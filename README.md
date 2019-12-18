# M7011E - Project
This project consisting of the labs in the course **M7011E - Design of Dynamic Web Systems** at LTU.
## Group Tenta Noobs
- Martin Terneborg -- termar-5@student.ltu.se
- Hugo Wangler -- hugwan-6@student.ltu.se

# Setup
## Database
Place a file in the simulator directory called sim.env and fill out as below
```
DB_HOST=<database host address>
DB_USER=<database user>
DB_PASSWORD=<database password>
DB_DATABASE=<database name>
```

## Authorization token
Through out the system authentication is performed by using json webtokens. The token is passed in the headers of the requests and is stored in a cookie on the client, and contains two fields: accountId(identifies the account associated with a user) and manager (boolean that indicates whether or not the user is a manager). The name of the header is `authToken` and can be retrieved as the result from login or registration mutations in the GraphQL-API.
