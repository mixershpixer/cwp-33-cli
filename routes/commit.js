'use strict'

const router = require('express').Router();
const data = require('../data/data.json');

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

function findByIds(array, id, repoId) {
    let result = null;

    for (let i = 0; i < array.length; i++) {
        if (array[i].id === id && array[i].repoId === repoId) {
            result = array[i];
            break;
        }
    }

    return result;
}

router.get('/', (req, res, next) => {
    try {
        req.ability.throwUnlessCan('read', 'Commit');

        const commits = [];
        for (let i = 0; i < data.commits.length; i++) {
            if (data.commits[i].repoId === req.repo.id) {
                commits.push(data.commits[i]);
            }
        }

        res.json(commits);
    } catch (error) {
        next(error);
    }
});

router.post('/', (req, res, next) => {
    try {
        req.ability.throwUnlessCan('update', req.repo);
        req.ability.throwUnlessCan('create', 'Commit');

        const commit = {
            id: data.commits[data.commits.length - 1].id + 1,
            repoId: req.repo.id,
            message: req.body.message,
            hash: req.body.hash
        };

        data.commits.push(commit);

        res.sendStatus(200);
    } catch (error) {
        next(error);
    }
});

router.param('id', (req, res, next) => {
    const commitId = Number.parseInt(req.params.id);

    if (!isNaN(commitId)) {
        const commit = findById(data.commits, commitId);

        if (commit) {
            req.commit = commit;
            next();
        } else {
            res.status(404).send('Commit doesn\'t exist');
        }

    } else {
        res.status(400).send('Invalid id');
    }
});

router.get('/:id', (req, res, next) => {
    try {
        req.ability.throwUnlessCan('read', 'Commit');
        const commit = findByIds(data.commits, req.commit.id, req.repo.id);
        res.json(commit);
    } catch (error) {
        next(error);
    }
});

router.put('/:id', (req, res, next) => {
    try {
        req.ability.throwUnlessCan('update', req.repo);
        req.ability.throwUnlessCan('update', req.commit);

        for (let i = 0; i < data.commits.length; i++) {
            if (data.commits[i].id === req.commit.id && data.commits[i].repoId === req.repo.id) {
                data.commits[i].message = req.body.message;
                data.commits[i].hash = req.body.hash;
                break;
            }
        }

        res.sendStatus(200);
    } catch (error) {

    }
});

router.delete('/:id', (req, res, next) => {
    try {
        req.ability.throwUnlessCan('delete', 'Commit');

        for (let i = 0; i < data.commits.length; i++) {
            if (data.commits[i].id === req.commit.id) {
                data.commits.splice(i, 1);
                break;
            }
        }

        res.sendStatus(200);
    } catch (error) {
        next(error);
    }
});

module.exports = router;