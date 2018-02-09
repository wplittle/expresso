const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const errorhandler = require('errorhandler');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(bodyParser.json());
app.use(cors());
app.use(errorhandler());

app.listen(PORT, () => {
  console.log('Listening on port ' + PORT);
});

module.exports = app;