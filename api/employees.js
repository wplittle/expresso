const express = require('express');
const employeesRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const timesheetsRouter = require('./timesheets');

employeesRouter.param('employeeId', (req, res, next, employeeId) => {
  const query = 'SELECT * FROM Employee WHERE Employee.id=$employeeId';
  const values = {
    $employeeId: employeeId
  };

  db.get(query, values, (err, employee) => {
    if(err) {
      next(err);
    } else if (employee) {
      req.employee = employee;
      next();
    } else {
      res.sendStatus(404);
    }
  });
});

employeesRouter.use('/:employeeId/timesheets', timesheetsRouter);

employeesRouter.get('/', (req, res, next) => {
  db.all('SELECT * FROM Employee', (err, employees) => {
    if(err) {
      next(err);
    } else {
      res.status(200).json({employees: employees});
    }
  });
});

employeesRouter.post('/', (req, res, next) => {
  const name = req.body.employee.name,
        position = req.body.employee.position,
        wage = req.body.employee.wage;
  if (!name || !position || !wage) {
    return res.sendStatus(400);
  }

  const query = 'INSERT INTO Employee (name, position, wage) VALUES ($name, $position, $wage)';
  const values = {
    $name: name,
    $position: position,
    $wage: wage
  };

  db.run(query, values, function(err) {
    if (err) {
      next(err);
    } else {
      db.get(`SELECT * FROM Employee WHERE Employee.id = ${this.lastID}`,
        (err, employee) => {
          res.status(201).json({employee: employee});
        });
    }
  });
});

employeesRouter.get('/:employeeId', (req, res, next) => {
  res.status(200).json({employee: req.employee});
  next();
});

employeesRouter.put('/:employeeId', (req, res, next) => {
  const name = req.body.employee.name,
        position = req.body.employee.position,
        wage = req.body.employee.wage;
  if (!name || ! position || !wage) {
    return res.sendStatus(400);
  }

  const query = 'UPDATE Employee SET name=$name, position=$position, wage=$wage WHERE Employee.id=$employeeId';
  const values = {
    $name: name,
    $position: position,
    $wage: wage,
    $employeeId: req.params.employeeId
  };

  db.run(query, values, function(err) {
    if(err) {
      next(err);
    } else {
      db.get(`SELECT * FROM Employee WHERE Employee.id = ${req.params.employeeId}`,
        (err, employee) => {
          res.status(200).json({employee: employee});
        });
    }
  });
});

employeesRouter.delete('/:employeeId', (req, res, next) => {
  const query = 'UPDATE Employee SET is_current_employee=$is_current_employee WHERE Employee.id=$employeeId';
  const values = {
    $is_current_employee: 0,
    $employeeId: req.params.employeeId
  };

  db.run(query, values, function(err) {
    if(err) {
      next(err);
    } else {
      db.get(`SELECT * FROM Employee WHERE Employee.id = ${req.params.employeeId}`,
        (err, employee) => {
          res.status(200).json({employee: employee});
        });
    }
  })
});

module.exports = employeesRouter;