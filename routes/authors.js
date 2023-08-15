/**
 * @swagger
 * /scholar/author:
 *   get:
 *     summary: Get a list of authors
 *     tags: [Scholar Authors]
 *     description: Retrieve a list of authors with optional sorting and pagination
 *     parameters:
 *       - in: query
 *         name: sortField
 *         schema:
 *           type: string
 *           enum: [h-index, document-count, name]
 *         description: Field to sort by (h-index, document-count, name)
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order (asc, desc)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination (default is 1)
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AuthorScholar'
 */

/**
 * @swagger
 * /scholar/author/getTotal:
 *   get:
 *     summary: Get the total number of authors
 *     tags: [Scholar Authors]
 *     description: Retrieve the total number of authors in the database
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 */

/**
 * @swagger
 * /scholar/author/{id}:
 *   get:
 *     summary: Get an author by ID
 *     tags: [Scholar Authors]
 *     description: Retrieve an author by their ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the author
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthorScholar'
 *       404:
 *         description: Author not found
 *         content:
 *           application/json:
 *             example:
 *               message: Author not found
 */

/**
 * @swagger
 * /scholar/author/name/{authorName}:
 *   get:
 *     summary: Get authors by name
 *     tags: [Scholar Authors]
 *     description: Retrieve authors by their name (partial match)
 *     parameters:
 *       - in: path
 *         name: authorName
 *         required: true
 *         description: Name of the author
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AuthorScholar'
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     AuthorScholar:
 *       type: object
 *       properties:
 *         scholar_id:
 *           type: string
 *         author_name:
 *           type: string
 *         department:
 *           type: string
 *         subject_area:
 *           type: array
 *           items:
 *             type: string
 *         documents:
 *           type: string
 *         image:
 *           type: string
 *         citation_by:
 *           type: object
 *           properties:
 *             table:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   citations:
 *                     type: object
 *                     properties:
 *                       all:
 *                         type: number
 *                       since_2018:
 *                         type: number
 *                   h_index:
 *                     type: object
 *                     properties:
 *                       all:
 *                         type: number
 *                       since_2018:
 *                         type: number
 *                   i10_index:
 *                     type: object
 *                     properties:
 *                       all:
 *                         type: number
 *                       since_2018:
 *                         type: number
 *             graph:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   year:
 *                     type: number
 *                   citations:
 *                     type: number
 */

const express = require("express");
const router = express.Router();
const Author = require('../models/Author.js');

router.get('/author', async (req, res, next) => {
    try {
        const { sortField, sortOrder, page } = req.query;
        const pageNumber = page || 1;
        const limit = 20;

        const sortQuery = {};
        if (sortField === 'h-index') {
            sortQuery.h_index = sortOrder === 'desc' ? -1 : 1;
        } else if (sortField === 'document-count') {
            sortQuery.documents = sortOrder === 'desc' ? -1 : 1;
        } else if (sortField === 'name') {
            sortQuery.author_name = sortOrder === 'desc' ? -1 : 1;
        }

        const authors = await Author.aggregate([
            {
                $addFields: {
                    documents: {
                        $cond: {
                            if: { $eq: ['$documents', ''] },
                            then: 0,
                            else: { $toInt: '$documents' }
                        }
                    },
                    h_index: {
                        $cond: {
                            if: { $eq: ['$citation_by.table.h_index.all', null] },
                            then: 0,
                            else: { $toInt: { $arrayElemAt: ['$citation_by.table.h_index.all', 0] } }
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 1,
                    author_name: 1,
                    department: 1,
                    subject_area: 1,
                    image: 1,
                    h_index: { $ifNull: ['$h_index', 0] },
                    documents: 1
                }
            },
            {
                $sort: sortQuery
            },
            {
                $skip: (pageNumber - 1) * limit
            },
            {
                $limit: limit
            }
        ]);

        res.json(authors);
    } catch (error) {
        next(error);
    }
});

router.get('/author/getTotal', (req, res, next) => {
    Author.countDocuments()
      .then((count) => {
        res.json({ count });
      })
      .catch((err) => {
        next(err);
      });
  });

router.get('/author/:id', (req, res, next) => {
    const authorId = req.params.id;
    Author.findById(authorId)
        .then((author) => {
            if (author.length === 0) {
                return res.status(404).json({ message: 'Author not found' });
            }
            res.json(author);
        })
        .catch((err) => {
            next(err);
        });
});

router.get('/author/name/:authorName', async (req, res, next) => {
    try {
        const { authorName } = req.params;
        const query = {};

        if (authorName) {
            const regex = new RegExp(`.*${authorName}.*`, 'i');
            query.author_name = { $regex: regex };
        }

        const authors = await Author.aggregate([
            {
                $addFields: {
                    h_index: {
                        $cond: {
                            if: { $eq: ['$citation_by.table.h_index.all', null] },
                            then: 0,
                            else: { $toInt: { $arrayElemAt: ['$citation_by.table.h_index.all', 0] } }
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 1,
                    author_name: 1,
                    department: 1,
                    subject_area: 1,
                    image: 1,
                    h_index: { $ifNull: ['$h_index', 0] },
                    documents: 1
                }
            },
            {
                $match: query
            }
        ]);
        res.json(authors);
    } catch (error) {
        next(error);
    }
});

module.exports = router;