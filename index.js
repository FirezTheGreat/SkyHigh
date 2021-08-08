const SkyHigh = require('./structures/SkyHigh');
const config = require('./config.json');

const bot = new SkyHigh(config);
bot.start();