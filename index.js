const express = require('express');
const axios = require("axios");
const cors = require('cors');
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const cron = require('node-cron');
const { getCron } = require('./qurey/setCron')
const fs = require('fs');
const path = require('path');

const { connectToMongoDB } = require("./qurey/connectToMongoDB");
(async () => {
  await connectToMongoDB();
})();

const authorsRouter = require('./routes/authors');
const articlesRouter = require('./routes/articles');
const scraperRouter = require('./routes/scraper');
const articlesScopusRouter = require('./routes/articlesScopus');
const authorsScopusRouter = require('./routes/authorsScopus');
const journalRouter = require('./routes/journalScopus');
const conectionDB = require('./routes/connection');
const baseUrl = require('./routes/baseurl')
const corespondingRouter = require('./routes/corresponding')
const timeCron = require('./routes/setcron')
const baseApi = require('./scraper/baseApi')

const app = express();
const PORT = process.env.PORT || 8000;

const jsonFilePath = path.join(__dirname, '.','apiDoc.json');

const swaggerDocument = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));


app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use('/scholar', authorsRouter);
app.use('/scholar', articlesRouter);
app.use('/scopus', authorsScopusRouter);
app.use('/scopus', articlesScopusRouter);
app.use('/scopus', journalRouter);
app.use('/scopus', corespondingRouter);
app.use('/scraper', scraperRouter);
app.use('/conectionDB', conectionDB);
app.use('/baseurl', baseUrl);
app.use('/timecron', timeCron);
app.use('/api-docs/', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const cronFormat = getCron()
cron.schedule(cronFormat, async () => {
  try {
    console.log('Running scraper job... At 17:25');
    const scopus = axios.get(`${baseApi}scraper/scraper-scopus-cron`);
    const scholar = axios.get(`${baseApi}scraper/scholar`);

  } catch (error) {
    console.error("Cron job error:", error);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

