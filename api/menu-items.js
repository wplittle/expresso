const express = require('express');
const menuitemsRouter = express.Router({mergeParams: true});

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

menuitemsRouter.param('menuItemId', (req, res, next, menuItemId) => {
  const query = 'SELECT * FROM MenuItem WHERE MenuItem.id=$menuItemId';
  const values = {
    $menuItemId: menuItemId
  };

  db.get(query, values, (err, item) => {
    if(err) {
      next(err);
    } else if (item) {
      req.menuItem = item;
      next();
    } else {
      res.sendStatus(404);
    }
  });
});

menuitemsRouter.get('/', (req, res, next) => {
  const query = 'SELECT * FROM MenuItem WHERE MenuItem.menu_id=$menuId';
  const values = {
    $menuId: req.params.menuId
  };

  db.all(query, values, (err, items) => {
    if(err) {
      next(err);
    } else {
      res.status(200).json({menuItems: items});
    }
  });
});

menuitemsRouter.post('/', (req, res, next) => {
  const name = req.body.menuItem.name,
        description = req.body.menuItem.description,
        inventory = req.body.menuItem.inventory,
        price = req.body.menuItem.price;
  if (!name || !description || !inventory || !price) {
    return res.sendStatus(400);
  }

  const query = 'INSERT INTO MenuItem (name, description, inventory, price, menu_id) VALUES ($name, $description, $inventory, $price, $menuId)';
  const values = {
    $name: name,
    $description: description,
    $inventory: inventory,
    $price: price,
    $menuId: req.params.menuId
  };

  db.run(query, values, function(err) {
    if (err) {
      next(err);
    } else {
      db.get(`SELECT * FROM MenuItem WHERE MenuItem.id = ${this.lastID}`,
        (err, item) => {
          res.status(201).json({menuItem: item});
        });
    }
  });
});

menuitemsRouter.put('/:menuItemId', (req, res, next) => {
  const name = req.body.menuItem.name,
        description = req.body.menuItem.description,
        inventory = req.body.menuItem.inventory,
        price = req.body.menuItem.price;
  if (!name || !description || !inventory || !price) {
    return res.sendStatus(400);
  }

  const query = 'UPDATE MenuItem SET name=$name, description=$description, inventory=$inventory, price=$price ' +
                'WHERE MenuItem.id=$menuItemId';
  const values = {
    $name: name,
    $description: description,
    $inventory: inventory,
    $price: price,
    $menuItemId: req.params.menuItemId
  };

  db.run(query, values, function(err) {
    if(err) {
      next(err);
    } else {
      db.get(`SELECT * FROM MenuItem WHERE MenuItem.id = ${req.params.menuItemId}`,
        (err, item) => {
          res.status(200).json({menuItem: item});
        });
    }
  });
});

menuitemsRouter.delete('/:menuItemId', (req, res, next) => {
  db.run(`DELETE FROM MenuItem WHERE MenuItem.id=${req.params.menuItemId}`, function(err) {
    if(err) {
      next(err);
    } else {
      res.sendStatus(204);
    }
  })
});

module.exports = menuitemsRouter;