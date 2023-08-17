/**
 * @swagger
 * /scopus/journal:
 *     get:
 *       summary: Get a list of journals
 *       tags: [Journal]
 *       parameters:
 *         - in: query
 *           name: sortField
 *           schema:
 *             type: string
 *           description: Field to sort by (e.g. "journal-name")
 *         - in: query
 *           name: sortOrder
 *           schema:
 *             type: string
 *           description: Sort order ("asc" or "desc")
 *         - in: query
 *           name: page
 *           schema:
 *             type: integer
 *           description: Page number for pagination
 *       responses:
 *         '200':
 *           description: Successful response with a list of journals
 *           content:
 *             application/json:
 *               schema:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Journal'
 */

/**
 * @swagger
 * /scopus/journal/getTotal:
 *     get:
 *       summary: Get the total count of journals
 *       tags: [Journal]
 *       responses:
 *         '200':
 *           description: Successful response with the total count
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   count:
 *                     type: integer
 */

/**
 * @swagger
 * /scopus/journal/{source_id}:
 *     get:
 *       summary: Get a journal by source ID
 *       tags: [Journal]
 *       parameters:
 *         - in: path
 *           name: source_id
 *           schema:
 *             type: string
 *           required: true
 *           description: Source ID of the journal
 *       responses:
 *         '200':
 *           description: Successful response with the journal data
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Journal'
 *         '404':
 *           description: Journal not found
 *           content:
 *             application/json:
 *               example:
 *                 error: Journal not found
 */

/**
 * @swagger
 * /scopus/journal/citescore/{source_id}:
 *     get:
 *       summary: Get CiteScore data for a journal by source ID
 *       tags: [Journal]
 *       parameters:
 *         - in: path
 *           name: source_id
 *           schema:
 *             type: string
 *           required: true
 *           description: Source ID of the journal
 *       responses:
 *         '200':
 *           description: Successful response with CiteScore data
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   source_id:
 *                     type: string
 *                   cite_source:
 *                     type: array
 *                     items:
 *                       type: string
 *         '404':
 *           description: Journal not found
 *           content:
 *             application/json:
 *               example:
 *                 error: Journal not found
 */

/**
 * @swagger
 * /scopus/journal/name/{journalName}:
 *     get:
 *       summary: Search for journals by name
 *       tags: [Journal]
 *       parameters:
 *         - in: path
 *           name: journalName
 *           schema:
 *             type: string
 *           required: true
 *           description: Name of the journal
 *       responses:
 *         '200':
 *           description: Successful response with matching journals
 *           content:
 *             application/json:
 *               schema:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Journal'
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Journal:
 *       type: object
 *       properties:
 *         source_id:
 *           type: string
 *         journal_name:
 *           type: string
 *         scopus_coverage_years:
 *           type: string
 *         publisher:
 *           type: string
 *         issn:
 *           type: string
 *         eissn:
 *           type: string
 *         source_type:
 *           type: string
 *         subject_area:
 *           type: array
 *           items:
 *             type: string
 *         changeJournal:
 *           type: object
 *         cite_source:
 *           type: array
 *           items:
 *             type: string
 */

const express = require("express");
const router = express.Router();
const Journal = require('../models/journal');

router.get('/journal', async (req, res, next) => {
    try {
        const { sortField, sortOrder, page } = req.query;
        const pageNumber = page || 1;
        const limit = 20;

        const sortQuery = {};
        if (sortField === 'journal-name') {
            sortQuery['journal_name'] = sortOrder === 'desc' ? -1 : 1;
        }

        const journals = await Journal.find({})
            .sort(sortQuery)
            .skip((pageNumber - 1) * limit)
            .limit(limit);

        res.json(journals);
    } catch (error) {
        next(error);
    }
});


router.get('/journal/getTotal', (req, res, next) => {
    Journal.countDocuments()
        .then((count) => {
            res.json({ count });
        })
        .catch((err) => {
            next(err);
        });
});

router.get('/journal/:source_id', async (req, res, next) => {
    try {
        const { source_id } = req.params;
        console.log(source_id)
        const journal = await Journal.find({ 'source_id': source_id });
        if (journal.length === 0) {
            return res.status(404).json(false);
        }
        res.json(journal);
    } catch (err) {
        next(err);
    }
});

router.get('/journal/changeJournal/:source_id', async (req, res, next) => {
    try {
        const { source_id } = req.params;
        console.log(source_id)
        const journal = await Journal.find({ 'source_id': source_id });
        if (journal.length === 0) {
            return res.status(200).json(false);
        }else{
            return res.status(200).json(true);
        }
    } catch (err) {
        next(err);
    }
});

router.get('/journal/citescore/:source_id', async (req, res, next) => {
    try {
        const { source_id } = req.params;
        console.log(source_id)
        const journal = await Journal.find({ 'source_id': source_id })
            .select('source_id cite_source');
        if (journal.length === 0) {
            return res.status(404).json(false);
        }
        res.json(journal);
    } catch (err) {
        next(err);
    }
});

router.get('/journal/name/:journalName', (req, res, next) => {
    const { journalName } = req.params;
    const query = {};

    if (journalName) {
        const regex = new RegExp(`.*${journalName}.*`, 'i');
        query.journal_name = { $regex: regex };
    }

    Journal.find(query)
        .then((journal) => {
            res.json(journal);
        })
        .catch((err) => {
            next(err);
        });
});

module.exports = router;