/**
 * @swagger
 * /scopus/article/{id}:
 *   get:
 *     summary: Get an article by Object ID
 *     tags: [Scopus Articles]
 *     description: Retrieve an article by its ID
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
 *               $ref: '#/components/schemas/ArticleScopus'
 *       404:
 *         description: Article not found
 *         content:
 *           application/json:
 *             example:
 *               error: Article not found
 *
 * /scopus/article/authorId/{id}:
 *   get:
 *     summary: Get articles by author ID
 *     tags: [Scopus Articles]
 *     description: Retrieve articles by author's ID
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
 *                 $ref: '#/components/schemas/ArticleScopus'
 *       404:
 *         description: Articles not found for the given author ID
 *         content:
 *           application/json:
 *             example:
 *               error: Articles not found
 *
 * /scopus/article/eid/{eid}:
 *   get:
 *     summary: Get an article by EID
 *     tags: [Scopus Articles]
 *     description: Retrieve an article by its EID
 *     parameters:
 *       - in: path
 *         name: eid
 *         required: true
 *         description: EID of the article
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
 *                 $ref: '#/components/schemas/ArticleScopus'
 *       404:
 *         description: Article not found
 *         content:
 *           application/json:
 *             example:
 *               error: Article not found
 */


/**
 * @swagger
 * components:
 *   schemas:
 *     ArticleScopus:
 *       type: object
 *       properties:
 *         eid:
 *           type: string
 *         article_name:
 *           type: string
 *         source_id:
 *           type: string
 *         first_author:
 *           type: string
 *         co_author:
 *           type: array
 *           items:
 *             type: string
 *         co_author_department:
 *           type: array
 *           items:
 *             type: string
 *         volume:
 *           type: string
 *         issue:
 *           type: string
 *         pages:
 *           type: string
 *         document_type:
 *           type: string
 *         source_type:
 *           type: string
 *         issn:
 *           type: string
 *         original_language:
 *           type: string
 *         publisher:
 *           type: string
 *         abstract:
 *           type: string
 *         url:
 *           type: string
 *         author_scopus_id:
 *           type: string
 */

const express = require("express");
const router = express.Router();
const Article = require('../models/ArticleScopus');

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
        const article = await Article.find({ 'author_scopus_id': id });
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
        const article = await Article.find({ 'eid': eid })
            .select('eid first_author co_author');
        
        if (article.length === 0) {
            return res.status(404).json({ error: 'Article not found' });
        }
        
        res.json(article);
    } catch (err) {
        next(err);
    }
});



module.exports = router;

