/*
Completed by Ritu Melroy, 2019
*/ 

const express = require('express');
const apiRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const employeeRouter = require('./employees');
apiRouter.use('/employees', employeeRouter);
const menusRouter = require('./menus.js');
apiRouter.use('/menus', menusRouter);

module.exports = apiRouter;

