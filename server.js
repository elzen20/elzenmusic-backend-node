const express = require("express");
const app = express();
const { resolve } = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");
// Replace if using a different env file or config
require("dotenv").config({ path: "./.env" });
require('./logger');
const routes = require('./src/routes/index');

app.use(cors());
const PORT = process.env.PORT;
app.use(bodyParser.json());
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Origin', '*'); //3000
  res.header(
    'Access-Control-Allow-Methods',
    'GET,OPTIONS,PUT,POST,DELETE,UPDATE'
  );
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  next();
});
app.use(express.static(process.env.STATIC_DIR));
app.use('/api', routes)
app.listen(PORT, () =>
  logger.info(`Node server listening at http://localhost:${PORT}`)
);
