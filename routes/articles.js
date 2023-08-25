const express = require("express");
const router = express.Router();
const Article = require('../models/Article.js');

router.get('/article/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const article = await Article.findById(id);
        if (article.length === 0) {
            return res.status(404).json({ error: 'Article not found' });
        }
        res.json(article);
    } catch (err) {
        next(err);
    }
});

router.get('/article/authorId/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const article = await Article.find({'author_id' : id});
        if (article.length === 0) {
            return res.status(404).json({ error: 'Article not found' });
        }
        res.json(article);
    } catch (err) {
        next(err);
    }
});

module.exports = router;