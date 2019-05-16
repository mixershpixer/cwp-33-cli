'use strict'

const router = require('express').Router();
const data = require('../data/data.json');
const commitRouter = require('./commit');

function findById(array, id) {
    let result = null;

    for (let i = 0; i < array.length; i++) {
        if (array[i].id === id) {
            result = array[i];
            break;
        }
    }

    return result;
}

router.get('/', (req, res, next) => {
    try {
        req.ability.throwUnlessCan('read', 'Repo');
        res.json(data.repos);
    } catch (error) {
        next(error);
    }
});

router.post('/', (req, res, next) => {
    try {
        req.ability.throwUnlessCan('create', 'Repo');

        const repo = {
            id: data.repos[data.repos.length - 1].id + 1,
            name: req.body.name,
            author: req.body.author
        };

        data.repos.push(repo);
        res.sendStatus(200);
    } catch (error) {
        next(error);
    }
});

router.param('id', (req, res, next) => {
    const repoId = Number.parseInt(req.params.id);

    if (!isNaN(repoId)) {
        const repo = findById(data.repos, repoId);

        if (repo) {
            req.repo = repo;
            next();
        } else {
            res.status(404).send('Repo doesn\'t exist');
        }

    } else {
        res.status(400).send('Invalid id');
    }
});

router.get('/:id', (req, res, next) => {
    try {
        req.ability.throwUnlessCan('read', 'Repo');
        res.json(req.repo);
    } catch (error) {
        next(error);
    }
});

router.put('/:id', (req, res, next) => {
    try {
        req.ability.throwUnlessCan('update', req.repo);

        for (let i = 0; i < data.repos.length; i++) {
            if (data.repos[i].id === req.repo.id) {
                data.repos[i].name = req.body.name;
                data.repos[i].author = req.body.author;
                break;
            }
        }

        res.sendStatus(200);
    } catch (error) {
        next(error);
    }
});

router.delete('/:id', (req, res, next) => {
    try {
        req.ability.throwUnlessCan('delete', 'Repo');

        for (let i = 0; i < data.repos.length; i++) {
            if (data.repos[i].id === req.repo.id) {
                data.repos.splice(i, 1);
                break;
            }
        }

        res.sendStatus(200);
    } catch (error) {
        next(error);
    }
});

router.use('/:id/commits', commitRouter);

module.exports = router;