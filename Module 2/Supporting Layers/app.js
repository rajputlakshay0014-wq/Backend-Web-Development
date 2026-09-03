const express = require('express');
const articlesRouter = require('./routes/articles');
const errorHandler = require('./middleware/errorHandler');
const config = require('./config');

const app = express();
app.use(express.json());

app.use('/articles', articlesRouter);

app.use(errorHandler);

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`articles-api listening on http://localhost:${PORT}`);
});

module.exports = app;