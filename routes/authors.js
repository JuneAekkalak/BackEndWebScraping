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
                    },
                    citation_by: {
                        $cond: {
                            if: { $eq: ['$citation_by.graph', []] },
                            then: {},
                            else: '$citation_by'
                        }
                    }
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
        ]).collation({ locale: 'en_US', numericOrdering: true });
        
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

router.get('/author/:scholar_id', async (req, res, next) => {
    try {
        const { scholar_id } = req.params;
        const author = await Author.findOne({ 'scholar_id': scholar_id });

        if (!author) {
            return res.status(404).json({ error: 'Author not found' });
        }

        const authorData = {
            _id: author._id,
            scholar_id: author.scholar_id,
            author_name: author.author_name,
            department: author.department,
            subject_area: author.subject_area,
            documents: author.documents,
            image: author.image,
            citation_by: author.citation_by
        };

        if (Array.isArray(author.citation_by.graph) && author.citation_by.graph.length === 0) {
            authorData.citation_by = {}; 
        }

        res.json(authorData);
    } catch (err) {
        next(err);
    }
});


router.get('/author/name/:authorName', async (req, res, next) => {
    try {
        const { authorName } = req.params;
        const query = {};

        if (authorName) {
            const regex = new RegExp(`.*${authorName}.*`, 'i');
            query.author_name = { $regex: regex };
        }

        const pipeline = [
            {
                $addFields: {
                    h_index: {
                        $cond: {
                            if: { $eq: ['$citation_by.table.h_index.all', null] },
                            then: 0,
                            else: { $toInt: { $arrayElemAt: ['$citation_by.table.h_index.all', 0] } }
                        }
                    },
                    citation_by: {
                        $cond: {
                            if: { $eq: ['$citation_by.graph', []] },
                            then: {},
                            else: '$citation_by'
                        }
                    },
                }
            },
            {
                $match: query
            }
        ];

        const authors = await Author.aggregate(pipeline);
        res.json(authors);
    } catch (error) {
        next(error);
    }
});


module.exports = router;