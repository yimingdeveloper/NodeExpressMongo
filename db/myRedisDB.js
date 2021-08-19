const redis = require('redis');
const { promisify } = require('util');

const client = redis.createClient();
client.on('error', console.error);

client.p_zincrby = promisify(client.zincrby).bind(client);
client.p_zadd = promisify(client.zadd).bind(client);
client.p_zrange = promisify(client.zrange).bind(client);

async function addHotPlayer(player) {
  console.log('Add hot player.', player);
  return await client.p_zincrby(
    'hot',
    1,
    player.first_name + ' ' + player.last_name
  );
}

async function getHotPlayers() {
  console.log('Get hot players....');
  var res = await client.p_zrange('hot', 0, -1);
  return res;
}

module.exports.addHotPlayer = addHotPlayer;
module.exports.getHotPlayers = getHotPlayers;
