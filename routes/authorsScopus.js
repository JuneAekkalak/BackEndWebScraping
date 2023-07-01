const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Author = require('../models/AuthorScopus');

//findall
router.get('/', (req, res, next) => {
  const pageNumber = req.query.page || 1;
  const limit = 20;

  Author.find()
    .skip((pageNumber - 1) * limit)
    .limit(limit)
    .then((authors) => {
      res.json(authors);
    })
    .catch((err) => {
      next(err);
    });
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
  Author.findById(authorId)
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
