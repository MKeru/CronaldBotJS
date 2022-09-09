// requires necessary discord.js classes
const { Client, GatewayIntentBits } = require('discord.js');
const dotenv = require('dotenv');

dotenv.config();

// creates a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// runs once when client is online
client.once('ready', () => {
	console.log('Ready!');
});

// log in using token from .env
client.login(process.env.BOT_TOKEN);