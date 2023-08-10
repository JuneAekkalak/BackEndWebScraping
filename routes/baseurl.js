const express = require("express");
const router = express.Router();
const { setEnvValues } = require('../qurey/baseURL')

router.use(express.json());

router.post('/setUrl', async (req, res, next) => {
  const { baseURL } = req.body;
  setEnvValues(baseURL)

  res.json({
    message: 'Suceesfull',
    URL: baseURL,
  });
});

module.exports = router;