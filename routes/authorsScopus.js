const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Author = require('../models/AuthorScopus');

// http://localhost:8000/scopus/author?sortField=h-index&sortOrder=asc
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