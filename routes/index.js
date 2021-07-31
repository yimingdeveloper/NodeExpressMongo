const express = require('express');
const router = express.Router();

const myDb = require('../db/mySqliteDB.js');

/* GET home page. */
router.get('/', async function (req, res, next) {
  res.redirect('/players');
});

router.get('/players', async (req, res, next) => {
  const query = req.query.q || '';
  const page = +req.query.page || 1;
  const pageSize = +req.query.pageSize || 24;
  const msg = req.query.msg || null;

  try {
    let total = await myDb.getPlayerCount(query);
    let players = await myDb.getPlayers(query, page, pageSize);
    res.render('./pages/index', {
      players,
      query,
      msg,
      currentPage: page,
      lastPage: Math.ceil(total / pageSize),
    });
  } catch (err) {
    next(err);
  }
});

router.get('/players/:_id/edit', async (req, res, next) => {
  const _id = req.params._id;

  const msg = req.query.msg || null;
  try {
    let player = await myDb.getPlayerByID(_id);
    let positions = player.position;

    console.log('edit player', {
      player,
      positions,
      msg,
    });

    res.render('./pages/editPlayer', {
      player,
      positions,
      msg,
    });
  } catch (err) {
    next(err);
  }
});

router.post('/players/:_id/edit', async (req, res, next) => {
  const _id = req.params._id;
  const player = req.body;

  try {
    let updateResult = await myDb.updatePlayerByID(_id, player);
    console.log('update', updateResult);

    if (updateResult && updateResult.modifiedCount === 1) {
      res.redirect('/players/?msg=Updated');
    } else {
      res.redirect('/players/?msg=Error Updating');
    }
  } catch (err) {
    next(err);
  }
});

router.post('/players/:_id/addPosition', async (req, res, next) => {
  console.log('Add position', req.body);
  const _id = req.body._id;
  const position = req.body.position;

  try {
    let updateResult = await myDb.addPositionIDToPlayerID(_id, position);
    console.log('addPositionToPlayerID', updateResult);

    if (updateResult && updateResult.changes === 1) {
      res.redirect(`/players/${_id}/edit?msg=Position added`);
    } else {
      res.redirect(`/players/${_id}/edit?msg=Error Adding Position`);
    }
  } catch (err) {
    next(err);
  }
});

router.get('/players/:_id/removePosition/:position', async (req, res, next) => {
  console.log('Remove position', req.body);
  const _id = req.params._id;
  const position = req.params.position;

  try {
    let updateResult = await myDb.removePositionIDFromPlayerID(_id, position);
    console.log('removePositionFromPlayerID', updateResult);

    if (updateResult && updateResult.modifiedCount === 1) {
      res.redirect(`/players/${_id}/edit?msg=Position Removed`);
    } else {
      res.redirect(`/players/${_id}/edit?msg=Error Removing Position`);
    }
  } catch (err) {
    next(err);
  }
});

router.get('/players/:_id/delete', async (req, res, next) => {
  const _id = req.params._id;

  try {
    let deleteResult = await myDb.deletePlayerByID(_id);
    console.log('delete', deleteResult);

    if (deleteResult && deleteResult.deletedCount === 1) {
      res.redirect('/players/?msg=Deleted');
    } else {
      res.redirect('/players/?msg=Error Deleting');
    }
  } catch (err) {
    next(err);
  }
});

router.post('/createPlayer', async (req, res, next) => {
  const player = req.body;
  player.position = [];

  try {
    const insertRes = await myDb.insertPlayer(player);

    console.log('Inserted', insertRes);
    res.redirect('/players/?msg=Inserted');
  } catch (err) {
    console.log('Error inserting', err);
    next(err);
  }
});

module.exports = router;
