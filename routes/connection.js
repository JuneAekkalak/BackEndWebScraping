const express = require("express");
const router = express.Router();
const connectToMongoDB = require('../qurey/connectToMongoDB')

router.use(express.json());

router.post('/connect-to-mongodb', async (req, res, next) => {
    const { databaseURI } = req.body;
    // console.log("Received:", databaseURI); 

    await connectToMongoDB(databaseURI);

    res.json({
        message: 'Connecting to MongoDB...',
        Connection: databaseURI,
    });
});

module.exports = router;