/**
 * @swagger
 * /scopus/author:
 *   get:
 *     summary: Get a list of authors
 *     tags: [Sopus Authors]
 *     parameters:
 *       - in: query
 *         name: sortField
 *         schema:
 *           type: string
 *         description: Field to sort by (h-index, document-count, name)
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *         description: Sorting order (asc, desc)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *     responses:
 *       200:
 *         description: List of authors
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AuthorScopus'
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /scopus/author/getTotal:
 *   get:
 *     summary: Get total count of authors
 *     tags: [Sopus Authors]
 *     responses:
 *       200:
 *         description: Total count of authors
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /scopus/author/{id}:
 *   get:
 *     summary: Get author by ID
 *     tags: [Sopus Authors]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the author
 *     responses:
 *       200:
 *         description: Author details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthorScopus'
 *       404:
 *         description: Author not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /scopus/author/name/{authorName}:
 *   get:
 *     summary: Get authors by name
 *     tags: [Sopus Authors]
 *     parameters:
 *       - in: path
 *         name: authorName
 *         schema:
 *           type: string
 *         required: true
 *         description: Name of the author
 *     responses:
 *       200:
 *         description: List of authors with matching name
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AuthorScopus'
 *       500:
 *         description: Internal server error
 */


/**
 * @swagger
 * components:
 *   schemas:
 *     AuthorScopus:
 *       type: object
 *       properties:
 *         author_scopus_id:
 *           type: string
 *         author_name:
 *           type: string
 *         citations:
 *           type: string
 *         citations_by:
 *           type: string
 *         documents:
 *           type: string
 *         wu_documents:
 *           type: string
 *         h_index:
 *           type: string
 *         subject_area:
 *           type: array
 *           items:
 *             type: string
 *         citations_graph:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               year:
 *                 type: number
 *               citations:
 *                 type: number
 *         documents_graph:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               year:
 *                 type: number
 *               documents:
 *                 type: number
 *         url:
 *           type: string
 */

const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Author = require('../models/AuthorScopus');

router.get('/author', async (req, res, next) => {
  try {
    const { sortField, sortOrder, page } = req.query;
    const pageNumber = page || 1;
    const limit = 20;

    const sortQuery = {};
    if (sortField === 'h-index') {
      sortQuery.h_index = sortOrder === 'desc' ? -1 : 1;
    } else if (sortField === 'document-count') {
      sortQuery.wu_documents = sortOrder === 'desc' ? -1 : 1;
    } else if (sortField === 'name') {
      sortQuery['author_name'] = sortOrder === 'desc' ? -1 : 1;
    }

    const authors = await Author.aggregate([
      {
        $addFields: {
          wu_documents: {
            $cond: {
              if: { $eq: ['$wu_documents', ''] },
              then: 0,
              else: { $toInt: '$wu_documents' }
            }
          },
          h_index: {
            $cond: {
              if: { $eq: ['$h_index', ''] },
              then: 0,
              else: { $toInt: '$h_index' }
            }
          }
        }
      },
      {
        $project: {
          _id: 1,
          author_scopus_id: 1,
          author_name: 1,
          citations: 1,
          h_index: 1,
          documents: 1,
          wu_documents: 1,
          citations_by: 1
        }
      },
      { $sort: sortQuery },
      { $skip: (pageNumber - 1) * limit },
      { $limit: limit }
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
  Author.find({ 'author_scopus_id': authorId })
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

router.get('/author/name/:authorName', (req, res, next) => {
  const { authorName } = req.params;
  const query = {};

  if (authorName) {
    const regex = new RegExp(`.*${authorName}.*`, 'i');
    query.author_name = { $regex: regex };
  }

  Author.find(query)
    .then((authors) => {
      res.json(authors);
    })
    .catch((err) => {
      next(err);
    });
});


module.exports = router;