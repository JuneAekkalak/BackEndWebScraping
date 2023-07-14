const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Author = require('../models/AuthorScopus');

// http://localhost:8000/authorsScopus?sortField=h-index&sortOrder=asc
router.get('/', async (req, res, next) => {
  try {
    const { sortField, sortOrder, page } = req.query;
    const pageNumber = page || 1;
    const limit = 20;

    const sortQuery = {};
    if (sortField === 'h-index') {
      sortQuery['h_index'] = sortOrder === 'desc' ? -1 : 1;
    } else if (sortField === 'document-count') {
      sortQuery['documents'] = sortOrder === 'desc' ? -1 : 1;
    } else if (sortField === 'name') {
      sortQuery['author_name'] = sortOrder === 'desc' ? -1 : 1;
    }

    const authors = await Author.find({})
      .sort(sortQuery)
      .skip((pageNumber - 1) * limit)
      .limit(limit);

    res.json(authors);
  } catch (error) {
    next(error);
  }
});

router.get('/getTotal', (req, res, next) => {
  Author.countDocuments()
    .then((count) => {
      res.json({ count });
    })
    .catch((err) => {
      next(err);
    });
});

router.get('/:id', (req, res, next) => {
  const authorId = req.params.id;
  Author.find({ 'author_scopus_id': authorId })
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

router.get('/author/:authorName', (req, res, next) => {
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