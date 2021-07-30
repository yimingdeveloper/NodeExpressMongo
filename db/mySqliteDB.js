const { MongoClient, ObjectId } = require('mongodb');

const uri = process.env.MONGO_URL || 'mongodb://localhost:27017';
const DB_NAME = 'football';
const COL_NAME = 'player';

async function getPlayers(query, page, pageSize) {
  console.log('myDB: getPlayers', query);

  const db = await open({
    filename: './db/football.db',
    driver: sqlite3.Database,
  });

  const stmt = await db.prepare(`
    SELECT * FROM player
    WHERE first_name LIKE @query or last_name LIKE @query
    ORDER BY player_id
    LIMIT @pageSize
    OFFSET @offset;
    `);

  const params = {
    '@query': query + '%',
    '@pageSize': pageSize,
    '@offset': (page - 1) * pageSize,
  };

  try {
    return await stmt.all(params);
  } finally {
    await stmt.finalize();
    db.close();
  }
}

async function getPlayerCount(query) {
  console.log('myDB: getPlayersCount', query);

  const db = await open({
    filename: './db/football.db',
    driver: sqlite3.Database,
  });

  const stmt = await db.prepare(`
    SELECT COUNT(*) AS count
    FROM player
    WHERE first_name LIKE @query or last_name LIKE @query;
    `);

  const params = {
    '@query': query + '%',
  };

  try {
    return (await stmt.get(params)).count;
  } finally {
    await stmt.finalize();
    db.close();
  }
}

async function getPlayerByID(player_id) {
  console.log('myDB:getPlayerByID', player_id);

  const db = await open({
    filename: './db/football.db',
    driver: sqlite3.Database,
  });

  const stmt = await db.prepare(`
    SELECT * FROM player
    WHERE player_id = @player_id;
    `);

  const params = {
    '@player_id': player_id,
  };

  try {
    return await stmt.get(params);
  } finally {
    await stmt.finalize();
    db.close();
  }
}

async function getPositionsByPlayerID(player_id) {
  console.log('myDB: getPositionsByPlayerID', player_id);

  const db = await open({
    filename: './db/football.db',
    driver: sqlite3.Database,
  });

  const stmt = await db.prepare(`
  SELECT position.name as position_name, position.position_id
  from player
  inner JOIN PlayerAndPosition
  on player.player_id=PlayerAndPosition.player_id
  INNER JOIN position
  on position.position_id=PlayerAndPosition.position_id
  WHERE player.player_id = @player_id;
  `);

  const params = {
    '@player_id': player_id,
  };

  try {
    return await stmt.all(params);
  } finally {
    await stmt.finalize();
    db.close();
  }
}

async function updatePlayerByID(player_id, player) {
  console.log('updatePlayerByID', player_id, player);

  const db = await open({
    filename: './db/football.db',
    driver: sqlite3.Database,
  });

  const stmt = await db.prepare(`
    UPDATE player
    SET
      CA = @CA,
      PA = @PA
    WHERE
       player_id = @player_id;
    `);

  const params = {
    '@player_id': player_id,
    '@CA': player.CA,
    '@PA': player.PA,
  };

  try {
    return await stmt.run(params);
  } finally {
    await stmt.finalize();
    db.close();
  }
}

async function deletePlayerByID(player_id) {
  console.log('deletePlayerByID', player_id);

  const db = await open({
    filename: './db/football.db',
    driver: sqlite3.Database,
  });

  const stmt = await db.prepare(`
    DELETE FROM player
    WHERE
       player_id = @player_id;
    `);

  const params = {
    '@player_id': player_id,
  };

  try {
    return await stmt.run(params);
  } finally {
    await stmt.finalize();
    db.close();
  }
}

async function insertPlayer(player) {
  const db = await open({
    filename: './db/football.db',
    driver: sqlite3.Database,
  });

  const stmt = await db.prepare(`INSERT INTO
    player(first_name, last_name, age, gender, height, weight, PA, CA, club_id)
    VALUES (@first_name, @last_name, @age, @gender, @height, @weight, @PA, @CA, @club_id);`);

  try {
    return await stmt.run({
      '@first_name': player.first_name,
      '@last_name': player.last_name,
      '@age': player.age,
      '@gender': player.gender,
      '@height': player.height,
      '@weight': player.weight,
      '@PA': player.PA,
      '@CA': player.CA,
      '@club_id': player.club_id,
    });
  } finally {
    await stmt.finalize();
    db.close();
  }
}

async function addPositionIDToPlayerID(player_id, position_id) {
  console.log('addPositionIDToPlayerID', player_id, position_id);

  const db = await open({
    filename: './db/football.db',
    driver: sqlite3.Database,
  });

  const stmt = await db.prepare(`
    INSERT INTO
    PlayerAndPosition(player_id, position_id)
    VALUES (@player_id, @position_id);
    `);

  const params = {
    '@player_id': player_id,
    '@position_id': position_id,
  };

  try {
    return await stmt.run(params);
  } finally {
    await stmt.finalize();
    db.close();
  }
}

async function removePositionIDFromPlayerID(player_id, position_id) {
  console.log('removePositionIDFromPlayerID', player_id, position_id);

  const db = await open({
    filename: './db/football.db',
    driver: sqlite3.Database,
  });

  const stmt = await db.prepare(`
    DELETE FROM PlayerAndPosition
    WHERE player_id=@player_id and position_id=@position_id;
    `);

  const params = {
    '@player_id': player_id,
    '@position_id': position_id,
  };

  try {
    return await stmt.run(params);
  } finally {
    await stmt.finalize();
    db.close();
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
