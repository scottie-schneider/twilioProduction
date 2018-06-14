const express = require('express');
const axios = require('axios');
const jsonParser = require('body-parser');

const routes = require('./routes');

const app = express();

app.use(jsonParser());

app.use('/chatbot', routes);
app.use('/', routes)
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is running on ${port}`);
})
