const express = require("express");
const router = express.Router();
const Corresponding = require('../models/Corresponding');

router.get('/corresponding/:eid', async (req, res, next) => {
    try {
        const { eid } = req.params;
        const corres = await Corresponding.findOne({ 'scopusEID': eid });
        if (!corres) {
            return res.status(404).json({ error: 'Coresponding not found' });
        }
        res.status(200).json(corres);
    } catch (err) {
        next(err);
    }
});

module.exports = router;