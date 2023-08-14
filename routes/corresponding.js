const express = require("express");
const router = express.Router();
const Corresponding = require('../models/Corresponding');

router.get('/coresponding/:eid', async (req, res, next) => {
    try {
        const { eid } = req.params;
        const cores = await Corresponding.find({ 'scopusEID': eid });
        if (cores.length === 0) {
            return res.status(404).json({ error: 'Coresponding not found' });
        }
        res.status(200).json(cores);
    } catch (err) {
        next(err);
    }
});

module.exports = router;