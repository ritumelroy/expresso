/*
Completed by Ritu Melroy, 2019
*/ 

const express = require('express');
const employeeRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

employeeRouter.param('employeeId', (req, res, next, employeeId) => {
    const sql ='SELECT * FROM Employee WHERE id = $employeeId';
    const val = {$employeeId: employeeId};

    db.get(sql, val, function(err, employee){
        if(err){
            next(err);
        } else if(employee){
            req.employee = employee;
            next();
        } else {
            res.sendStatus(404)
        }
    })
});


const timesheetsRouter = require('./timesheets.js');
employeeRouter.use('/:employeeId/timesheets', timesheetsRouter);


employeeRouter.get('/', (req, res, next) => {
    const sql = 'SELECT * FROM Employee WHERE is_current_employee = 1';
    db.all(sql, (err, employees) =>{
        res.status(200).json({employees: employees})
    });
});

employeeRouter.post('/', (req, res, next) => {
    const name = req.body.employee.name;
    const position =req.body.employee.position;
    const wage = req.body.employee.wage;

    const isCurrentEmployee = req.body.employee.isCurrentEmployee === 0 ? 0:1;

    if( !name || !position || !wage){
        res.sendStatus(400);
    }
    
    const sql = 'INSERT INTO Employee (name, position, wage, is_current_employee) VALUES ($name, $position, $wage, $isCurrentEmployee)';
    const val = {$name: name, $position: position, $wage:wage, $isCurrentEmployee:isCurrentEmployee};
    db.run(sql, val, function(err){
        if(err){
            next(err);
        } else {
            const sql = `SELECT * FROM Employee WHERE id = ${this.lastID}`;
            db.get(sql, function(err, row){
                if(err){
                    next(err);
                } else {
                    res.status(201).json({employee: row})
                }
            })
        }
    });
});

employeeRouter.get('/:employeeId', (req, res, next) => {
    res.status(200).json({employee: req.employee})    
});

employeeRouter.put('/:employeeId', (req, res, next) => {
    const name = req.body.employee.name;
    const position =req.body.employee.position;
    const wage = req.body.employee.wage;

    const isCurrentEmployee = req.body.employee.isCurrentEmployee === 0 ? 0:1;

    if( !name || !position || !wage){
        res.sendStatus(400);
    }

    const sql = 'UPDATE Employee SET name = $name, position =$position, wage =$wage, is_current_employee =$isCurrentEmployee WHERE id = $employeeId' ;
    const val = {$name: name, $position: position, $wage:wage, $isCurrentEmployee:isCurrentEmployee, $employeeId:req.params.employeeId};
    db.run(sql, val, function(err){
        if(err){
            next(err);
        } else {
            const sql = `SELECT * FROM Employee WHERE id = $employeeId`;
            const val = {$employeeId:req.params.employeeId};
            db.get(sql, val, function(err, employee){
                if(err){
                    next(err);
                } else {
                    res.status(200).json({employee: employee})
                }
            });
        }
    });

});

employeeRouter.delete('/:employeeId', (req, res, next)=>{
    const sql = `SELECT * FROM Employee WHERE id = $employeeId`;
    const val = {$employeeId:req.params.employeeId};
    db.get(sql, val, function(err, employee){
        if(err){
            next(err);
        } else {
            const sql = 'UPDATE Employee SET is_current_employee = 0'
            db.run(sql, (err)=>{
                if(err){
                    next(err);
                } else {
                    const sql = `SELECT * FROM Employee WHERE id = $employeeId`;
                    const val = {$employeeId:req.params.employeeId};
                    db.get(sql, val, function(err, employee){
                        if(err){
                            next(err);
                        } else {
                            res.status(200).json({employee: employee})
                        }
                    });
                }
            });
        }
    });
});

module.exports = employeeRouter;

