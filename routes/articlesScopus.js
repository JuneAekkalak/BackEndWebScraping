const express = require("express");
const router = express.Router();
const Article = require('../models/ArticleScopus');

router.get('/article/:eid', async (req, res, next) => {
    try {
        const { eid } = req.params;
        const article = await Article.findOne({ 'eid': eid });
        if (!article) {
            return res.status(404).json({ error: 'Article not found' });
        }
        res.json(article);
    } catch (err) {
        next(err);
    }
});

router.get('/article/authorId/:scopus_id', async (req, res, next) => {
    try {
        const { scopus_id } = req.params;
        const article = await Article.find({ 'author_scopus_id': scopus_id });
        if (article.length === 0) {
            return res.status(404).json({ error: 'Article not found' });
        }
        res.json(article);
    } catch (err) {
        next(err);
    }
});

router.get('/article/eid/:eid', async (req, res, next) => {
    try {
        const { eid } = req.params;
        const article = await Article.findOne({ 'eid': eid })
            .select('eid first_author co_author');

        if (!article) {
            return res.status(404).json({ error: 'Article not found' });
        }

        res.json(article);
    } catch (err) {
        next(err);
    }
});



module.exports = router;

