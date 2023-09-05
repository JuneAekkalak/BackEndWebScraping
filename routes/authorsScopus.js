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
      sortQuery.author_name = sortOrder === 'desc' ? -1 : 1;
    }

    sortQuery._id = 1;

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
            $trim: {
              input: {
                $reduce: {
                  input: { $split: ['$author_name', ' '] },
                  initialValue: '',
                  in: {
                    $concat: [
                      '$$value',
                      ' ',
                      {
                        $concat: [
                          { $toUpper: { $substrCP: ['$$this', 0, 1] } },
                          { $toLower: { $substrCP: ['$$this', 1, { $strLenCP: '$$this' }] } }
                        ]
                      }
                    ]
                  }
                }
              }
            }
          }
        }
      },
      {
        $sort: { ...sortQuery },
      },
      { $skip: (pageNumber - 1) * limit },
      { $limit: limit },
      // { $skip: (pageNumber - 1) * Number(limit) },
      // { $limit: Number(limit) },
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
    const regex = new RegExp(`.*${authorName.replace(/ /g, '.*')}.*`, 'i');
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



















// router.get('/author/count', async (req, res, next) => {
//   try {
//     const authorCount = await Author.countDocuments();
//     console.log(authorCount);
//     res.json(authorCount);
//   } catch (err) {
//     next(err);
//   }
// });

// {
      //   $group: {
      //     _id: '$wu_documents',
      //     authors: { $push: '$$ROOT' },
      //     h_index: { $first: '$h_index' },
      //     author_name: { $first: '$author_name' },
      //   },
      // },
      // {
      //   $unwind: '$authors',
      // },
      // {
      //   $project: {
      //     _id: 0,
      //     author_scopus_id: '$authors.author_scopus_id',
      //     author_name: '$authors.author_name',
      //     citations: '$authors.citations',
      //     citations_by: '$authors.citations_by',
      //     documents: '$authors.documents',
      //     h_index: '$authors.h_index',
      //     subject_area: '$authors.subject_area',
      //     citations_graph: '$authors.citations_graph',
      //     documents_graph: '$authors.documents_graph',
      //     url: '$authors.url',
      //     wu_documents: '$authors.wu_documents'
      //   }
      // },