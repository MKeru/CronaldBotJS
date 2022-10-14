import { Tokens, Guilds } from '../database/database';

module.exports = {
	name: 'ready',
	once: true,
	execute(client: any) {
		// do Tokens.sync({force : true}) and Guilds.sync({force : true}) to reset the database for testing
		Tokens.sync();
		Guilds.sync();
		console.log('Tags successfully synced.');
		console.log(`Ready! Logged in as ${client.user.tag}`);
	},
};