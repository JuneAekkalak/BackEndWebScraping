const mongoose = require('mongoose');

const connectToMongoDB = async () => {
  const databaseURI = 'mongodb+srv://root:1234@db01.uyg1g.mongodb.net/test';
  const dbName = 'wu-researcher';
  try {
    await mongoose.connect(databaseURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: dbName
    });
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error(err);
  }
};

module.exports = connectToMongoDB;