const { Tokens, Guilds } = require('../database/database');

module.exports = {
	name: 'ready',
	once: true,
	execute(client) {
		Tokens.sync({ force: true });
		Guilds.sync({ force: true });
		console.log('Tags successfully synced.');
		console.log(`Ready! Logged in as ${client.user.tag}`);
	},
};