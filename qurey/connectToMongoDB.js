const mongoose = require('mongoose');
require('dotenv').config();
const fs = require('fs');

const setEnvValues = async (databaseURI) => {
  if (databaseURI) {
    const envFilePath = '.env';
    let envContent = fs.readFileSync(envFilePath, 'utf-8');

    envContent = envContent.replace(/DATABASE_URI=.*/, `DATABASE_URI=${databaseURI}`);

    fs.writeFileSync(envFilePath, envContent);
    process.env.DATABASE_URI = databaseURI; // อัพเดตค่าใน process.env
    return databaseURI; // คืนค่าเป็น databaseURI ที่ถูก set
  }
};

const connectToMongoDB = async (databaseURI) => {
  const envDbName = process.env.DB_NAME;
  let envDatabaseURI = process.env.DATABASE_URI;

  if (databaseURI) {
    envDatabaseURI = await setEnvValues(databaseURI);
  }

  console.log("envDatabaseURI ข้างนอก => ", envDatabaseURI);

  try {
    // ปิดการเชื่อมต่อเดิมก่อนถึงจะเริ่มเชื่อมต่อใหม่
    await mongoose.disconnect();

    // เริ่มเชื่อมต่อใหม่กับ connection string ใหม่
    await mongoose.connect(envDatabaseURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: envDbName
    });

    console.log('Connected to MongoDB');
  } catch (err) {
    console.error(err);
  }
};

module.exports = connectToMongoDB;
