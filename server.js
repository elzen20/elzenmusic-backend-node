const express = require("express");
const app = express();
const { resolve } = require("path");
const bodyParser = require("body-parser");
// Replace if using a different env file or config
require("dotenv").config({ path: "./.env" });
const routes = require('./src/routes/index');


app.use(bodyParser.json());

app.use(express.static(process.env.STATIC_DIR));

app.use('', routes)








app.listen(5252, () =>
  console.log(`Node server listening at http://localhost:5252`)
);
