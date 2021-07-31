const { MongoClient, ObjectId } = require('mongodb');

const uri = process.env.MONGO_URL || 'mongodb://localhost:27017';
const DB_NAME = 'football';
const COL_NAME = 'player';

async function getPlayers(query, page, pageSize) {
  console.log('myDB: getPlayers', query);

  const client = new MongoClient(uri);

  try {
    await client.connect();

    const queryObj = {
      first_name: { $regex: `^${query}`, $options: 'i' },
    };

    return await client
      .db(DB_NAME)
      .collection(COL_NAME)
      .find(queryObj)
      .sort({ created_on: -1 })
      .limit(pageSize)
      .skip((page - 1) * pageSize)
      .toArray();
  } finally {
    client.close();
  }
}

async function getPlayerCount(query) {
  console.log('myDB: getPlayerCount', query);

  const client = new MongoClient(uri);

  try {
    await client.connect();

    const queryObj = {
      first_name: { $regex: `^${query}`, $options: 'i' },
    };

    return await client.db(DB_NAME).collection(COL_NAME).find(queryObj).count();
  } finally {
    client.close();
  }
}

async function getPlayerByID(_id) {
  console.log('myDB:getPlayerByID', _id);

  const client = new MongoClient(uri);

  try {
    await client.connect();

    const queryObj = {
      // _id: new ObjectId(reference_id),
      _id: new ObjectId(_id),
    };

    return await client.db(DB_NAME).collection(COL_NAME).findOne(queryObj);
  } finally {
    client.close();
  }
}

async function getPositionsByPlayerID(player_id) {
  console.log('myDB: getPositionsByPlayerID', player_id);

  const client = new MongoClient(uri);

  try {
    await client.connect();

    const queryObj = {
      // _id: new ObjectId(reference_id),
      player_id: +player_id,
    };

    return await client.db(DB_NAME).collection(COL_NAME).findOne(queryObj);
  } finally {
    client.close();
  }
}

async function updatePlayerByID(_id, player) {
  console.log('myDB:updatePlayerByID', _id);

  const client = new MongoClient(uri);

  try {
    await client.connect();

    const filter = {
      _id: new ObjectId(_id),
    };

    const options = { upsert: true };

    const updateDoc = {
      $set: {
        ca: player.ca,
        pa: player.pa,
      },
    };

    return await client
      .db(DB_NAME)
      .collection(COL_NAME)
      .updateOne(filter, updateDoc, options);
  } finally {
    client.close();
  }
}

async function deletePlayerByID(_id) {
  console.log('myDB:deletePlayer', _id);

  const client = new MongoClient(uri);

  try {
    await client.connect();

    const queryObj = {
      _id: new ObjectId(_id),
    };

    return await client.db(DB_NAME).collection(COL_NAME).deleteOne(queryObj);
  } finally {
    client.close();
  }
}

async function insertPlayer(player) {
  console.log('myDB:insertPlayer', player);

  const client = new MongoClient(uri);

  try {
    await client.connect();

    const queryObj = player;

    return await client.db(DB_NAME).collection(COL_NAME).insertOne(queryObj);
  } finally {
    client.close();
  }
}

async function addPositionIDToPlayerID(_id, position) {
  console.log('addPositionIDToPlayerID', _id, position);

  const player = await getPlayerByID(_id);
  const positions = player.position;
  var newPositions = [];

  for (let p of positions) {
    newPositions.push(p);
  }
  newPositions.push(position);

  const client = new MongoClient(uri);

  try {
    await client.connect();
    const filter = {
      _id: new ObjectId(_id),
    };
    const options = { upsert: true };
    const updateDoc = {
      $set: {
        position: newPositions,
      },
    };

    return await client
      .db(DB_NAME)
      .collection(COL_NAME)
      .updateOne(filter, updateDoc, options);
  } finally {
    client.close();
  }
}

async function removePositionIDFromPlayerID(_id, position) {
  console.log('removePositionFromPlayerID', _id, position);
  const player = await getPlayerByID(_id);
  const positions = player.position;
  var newPositions = [];

  for (let p of positions) {
    if (p != position) {
      newPositions.push(p);
    }
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    const filter = {
      _id: new ObjectId(_id),
    };
    const options = { upsert: true };
    const updateDoc = {
      $set: {
        position: newPositions,
      },
    };

    return await client
      .db(DB_NAME)
      .collection(COL_NAME)
      .updateOne(filter, updateDoc, options);
  } finally {
    client.close();
  }
}

module.exports.insertPlayer = insertPlayer;
module.exports.getPlayerByID = getPlayerByID;
module.exports.deletePlayerByID = deletePlayerByID;
module.exports.addPositionIDToPlayerID = addPositionIDToPlayerID;
module.exports.getPlayers = getPlayers;
module.exports.getPlayerCount = getPlayerCount;
module.exports.getPositionsByPlayerID = getPositionsByPlayerID;
module.exports.updatePlayerByID = updatePlayerByID;
module.exports.removePositionIDFromPlayerID = removePositionIDFromPlayerID;
