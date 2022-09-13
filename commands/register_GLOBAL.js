const { SlashCommandBuilder, RoleManager, Colors } = require('discord.js');
const registeredGuilds = [];

/* another way to create a role
await interaction.guild.roles.create({
	name: 'Cron',
	color: Colors.grey,
	reason: 'cron reason',
});
*/

module.exports = {
	data: new SlashCommandBuilder()
		.setName('register')
		.setDescription('Register your server for CronTokens!')
		// only server administrators are permitted to use this command
		.setDefaultMemberPermissions('8')
		.setDMPermission(false),

	async execute(interaction) {
		// FIXME: start with ephemeral message with accept button asking if the command user is sure they want to register
		// maybe ask if there is already a role 'CronToken Admin'
		// "server, usernames, etc. will be stored in a database"
		// allow each user to register themself
		// allow each user to remove themself (DELETE user and all their data pertaining to that server)
		// allow server manager to unregister the server (DELETE all data pertaining to the server)

		// create RoleManager object
		const rm = new RoleManager(interaction.guild);

		// check if guild is already in list of registered guilds
		if (!registeredGuilds.includes(interaction.guild.id)) {

			// push guild to registration list
			registeredGuilds.push(interaction.guild.id);

			// check if server does not have the crontoken admin role
			if (!interaction.guild.roles.cache.find(x => x.name === 'CronToken Admin')) {

				// generate a role that allows usage of admin-only commands for this bot
				await rm.create({
					name: 'CronToken Admin',
					color: Colors.Grey,
				});

				await interaction.reply('Server successfully registered for CronToken usage.\n\nPlease assign the "@CronToken Admin" role to users to entrust them with top-level CronToken management.');
				console.log(`CronToken role created in server ${interaction.guild.id}`);
			}
			else {
				await interaction.reply('Server successfully registered for CronToken usage.\n\nIt looks like the "@CronToken Admin" role is already in this server.\n\nAssign this role to users to entrust them with top-level CronToken management.');
				console.log(`CronToken role already in server ${interaction.guild.id}`);
			}

			console.log(registeredGuilds);
		}
		// FIXME: add check for crontoken role existence
		else if (registeredGuilds.includes(interaction.guild.id) && !interaction.guild.roles.cache.find(x => x.name === 'CronToken Admin')) {

			await rm.create({
				name: 'CronToken Admin',
				color: Colors.Grey,
			});

			await interaction.reply('Server already registered for CronToken usage, but "@CronToken Admin" role was not found (was it deleted?).\n\nThe role has been generated. Please assign the "@CronToken Admin" role to users to entrust them with top-level CronToken management.');
			console.log(`CronToken role created in server ${interaction.guild.id}`);
		}
		else {
			await interaction.reply('Server is already registered for CronToken usage.');
			console.log(`${interaction.guild.id} already registered for CronToken usage`);
		}
	},
};