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
          },
          author_name: {
            $concat: [
              { $toUpper: { $substrCP: ['$author_name', 0, 1] } },
              { $toLower: { $substrCP: ['$author_name', 1, { $strLenCP: '$author_name' }] } }
            ]
          }
        }
      },
      // {
      //   $project: {
      //     _id: 1,
      //     author_scopus_id: 1,
      //     author_name: 1,
      //     citations: 1,
      //     h_index: 1,
      //     documents: 1,
      //     wu_documents: 1,
      //     citations_by: 1
      //   }
      // },
      { $sort: { ...sortQuery } },
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

router.get('/author/:scopus_id', (req, res, next) => {
  const scopus_id = req.params.scopus_id;
  Author.findOne({ 'author_scopus_id': scopus_id })
    .then((author) => {
      if (!author) {
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