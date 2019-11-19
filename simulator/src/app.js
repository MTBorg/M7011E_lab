const express = require("express");
const expressGraphQL = require("express-graphql");
const schema = require("./schema.js");
const { Client } = require("pg");

const app = express();
app.use(
  "/graphql",
  expressGraphQL({
    schema,
    graphiql: true
  })
);
const port = 8080;
app.listen(port, () => {
  console.log(
    `Express GraphQl Server Now Running On localhost:${port}/graphql`
  );
});
