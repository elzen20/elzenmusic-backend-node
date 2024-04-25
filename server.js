const express = require("express");
const app = express();
const { resolve } = require("path");
const bodyParser = require("body-parser");
// Replace if using a different env file or config
require("dotenv").config({ path: "./.env" });
require('./logger');
const routes = require('./src/routes/index');
const PORT = process.env.PORT;
app.use(bodyParser.json());
app.use(express.static(process.env.STATIC_DIR));
app.use('', routes)
app.listen(5252, () =>
  logger.info(`Node server listening at http://localhost:${PORT}`)
);
