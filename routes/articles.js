const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Article = require('../models/Article.js');

// HTTP://127.0.0.1:8080/scholar/article/:id
// HTTP://127.0.0.1:8080/scholar/article/authorId/:authorId?

router.get('/article/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const article = await Article.findById(id);
        if (!article) {
            return res.status(404).json({ error: 'Article not found' });
        }
        res.json(article);
    } catch (err) {
        next(err);
    }
});

router.get('/article/arthorId/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const article = await Article.find({'author_id' : id});
        if (!article) {
            return res.status(404).json({ error: 'Article not found' });
        }
        res.json(article);
    } catch (err) {
        next(err);
    }
});

module.exports = router;