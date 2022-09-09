const { REST } = require('@discordjs/rest');
const { Routes } = require('discord.js');
const dotenv = require('dotenv');

dotenv.config();

const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);

// for guild-based commands
rest.delete(Routes.applicationGuildCommand(process.env.CLIENT_ID, process.env.GUILD_ID, { body: [] }))
	.then(() => console.log('Successfully deleted guild command'))
	.catch(console.error);

// for global commands
rest.delete(Routes.applicationCommand(process.env.CLIENT_ID, { body: [] }))
	.then(() => console.log('Successfully deleted application command'))
	.catch(console.error);