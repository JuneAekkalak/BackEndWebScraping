/**
 * @swagger
 * /scopus/corresponding/{eid}:
 *     get:
 *       summary: Get corresponding authors by Scopus EID
 *       tags: [Corresponding]
 *       parameters:
 *         - in: path
 *           name: eid
 *           schema:
 *             type: string
 *           required: true
 *           description: Scopus EID of the article
 *       responses:
 *         '200':
 *           description: Successful response with corresponding authors
 *           content:
 *             application/json:
 *               schema:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Corresponding'
 *         '404':
 *           description: Corresponding authors not found
 *           content:
 *             application/json:
 *               example:
 *                 error: Corresponding not found
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Corresponding:
 *       type: object
 *       properties:
 *         scopusEID:
 *           type: string
 *         corresAuthorID:
 *           type: array
 *           items:
 *             type: string
 *         correspondingData:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               author_name:
 *                 type: string
 *               department:
 *                 type: string
 *               email:
 *                 type: string
 */

const express = require("express");
const router = express.Router();
const Corresponding = require('../models/Corresponding');

router.get('/corresponding/:eid', async (req, res, next) => {
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