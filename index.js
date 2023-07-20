const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const portfinder = require('portfinder');

const authorsRouter = require('./routes/authors');
const articlesRouter = require('./routes/articles');
const scraperRouter = require('./routes/scraper');
const articlesScopusRouter = require('./routes/articlesScopus');
const authorsScopusRouter = require('./routes/authorsScopus');
const journalRouter = require('./routes/journalScopus');

const connectToMongoDB = require("./qurey/connectToMongoDB");
(async () => {
  await connectToMongoDB();
})();

const app = express();
const PORT = process.env.PORT || 8080;
//mongodb+srv://root:1234@db01.uyg1g.mongodb.net/test
// wu-researcher wurisdb 
// mongoose.connect('mongodb://adminwuris:wurisadmin@192.168.75.58:27017/', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
//   dbName: 'wurisdb'
// })
//   .then(() => console.log('Connected to MongoDB'))
//   .catch((err) => console.error(err));


app.use(express.urlencoded({ extended: true }));
app.use(cors()); // Add this line to enable CORS
app.use('/scholar', authorsRouter);
app.use('/scholar', articlesRouter);
app.use('/scopus', authorsScopusRouter);
app.use('/scopus', articlesScopusRouter);
app.use('/scopus', journalRouter);
app.use('/scraper', scraperRouter);

portfinder.getPort((err, port) => {
  if (err) {
    console.error(err);
  } else {
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  }
});

