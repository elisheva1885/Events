const express = require('express');
const { connectMongo } = require('./db/connect.db');
const mongoHealth = require('./db/health.db');

const app = express();
app.get('/health/mongo', mongoHealth);

connectMongo().then(() => {
  app.listen(process.env.PORT || 3000, () => console.log('API up'));
});

