const express = require("express");

const app = express();
app.get("/", (req, res) => {
  res.send("Hello World! hahahahahaha\n");
});

app.listen(process.env.SERVER_PORT, () => {
  console.log(
    `Web app running on http://${process.env.SERVER_HOST}:${process.env.SERVER_PORT}`
  );
});
