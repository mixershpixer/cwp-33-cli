'use strict'

const express = require('express');
const bodyParser = require('body-parser');
const { Ability, AbilityBuilder, ForbiddenError } = require('casl');

const apiRouter = require('./routes/api');
const port = process.env.PORT || 3000;


const app = express();

app.use(bodyParser.json());

app.use('/api', (req, res, next) => {
    const { rules, can, cannot } = AbilityBuilder.extract();
    const role = req.query.role || 'guest';

    console.log(role);

    if (role === 'guest') {
        can('read', 'all');
    }

    if (role === 'member') {
        can('read', 'all');
        can('create', 'Repo');
        can('update', 'Repo', { author: {$eq: req.query.author } });
        can(['create', 'update'], 'Commit');
    }

    if (role === 'moderator') {
        can('read', 'all');
        can('update', 'all');
        can('delete', 'all');
    }

    req.ability = new Ability(rules);

    next();
});

app.use('/api/v1/', apiRouter);

app.use((error, req, res, next) => {
    if (error instanceof ForbiddenError) {
        res.status(403).send({ message: error.message })
    } else {
        res.send(error);
    }
});

app.listen(port, function () {
    console.log(`Server is running on ${port}...`);
});