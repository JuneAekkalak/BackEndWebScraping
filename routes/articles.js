/**
 * @swagger
 * /scholar/article/{id}:
 *   get:
 *     summary: Get an article by ID from Scholar
 *     tags: [Scholar Articles]
 *     description: Retrieve an article by its ID from the Scholar route
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the article
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ArticleScholar'
 *       404:
 *         description: Article not found
 *         content:
 *           application/json:
 *             example:
 *               error: Article not found
 */

/**
 * @swagger
 * /scholar/article/authorId/{id}:
 *   get:
 *     summary: Get articles by author ID from Scholar
 *     tags: [Scholar Articles]
 *     description: Retrieve articles by author's ID from the Scholar route
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the author
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ArticleScholar'
 *       404:
 *         description: Articles not found for the given author ID
 *         content:
 *           application/json:
 *             example:
 *               error: Articles not found
 */


/**
 * @swagger
 * components:
 *   schemas:
 *     ArticleScholar:
 *       type: object
 *       properties:
 *         article_id:
 *           type: string
 *         article_name:
 *           type: string
 *         authors:
 *           type: array
 *           items:
 *             type: string
 *         publication_date:
 *           type: string
 *         conference:
 *           type: string
 *         institution:
 *           type: string
 *         journal:
 *           type: string
 *         volume:
 *           type: string
 *         issue:
 *           type: string
 *         pages:
 *           type: string
 *         publisher:
 *           type: string
 *         description:
 *           type: string
 *         total_citations:
 *           type: string
 *         scholar_id:
 *           type: string
 *         url:
 *           type: string
 *         author_id:
 *           type: string
 */

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