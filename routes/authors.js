const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Author = require('../models/Author.js');


// http://localhost:8000/authors?sortField=document-count&sortOrder=desc
router.get('/', async (req, res, next) => {
    try {
        const { sortField, sortOrder, page } = req.query;
        const pageNumber = page || 1;
        const limit = 20;

        const sortQuery = {};
        if (sortField === 'h-index') {
            sortQuery['citation_by.table.h_index.all'] = sortOrder === 'desc' ? -1 : 1;
        } else if (sortField === 'document-count') {
            sortQuery.document_count = sortOrder === 'desc' ? -1 : 1;
        } else if (sortField === 'name') {
            sortQuery.author_name = sortOrder === 'desc' ? -1 : 1;
        }

        const authors = await Author.aggregate([
            {
                $lookup: {
                    from: 'articles',
                    localField: '_id',
                    foreignField: 'author_id',
                    as: 'articles'
                }
            },
            {
                $addFields: {
                    document_count: { $size: '$articles' }
                }
            },
            {
                $project: {
                    _id: 1,
                    author_name: 1,
                    department: 1,
                    subject_area: 1,
                    image: 1,
                    document_count: 1
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

router.get('/department/:department', (req, res, next) => {
    const { department } = req.params;
    const query = {};

    if (department) {
        const regex = new RegExp(department, 'i');
        query.department = { $regex: regex };
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