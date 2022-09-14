const { SlashCommandBuilder, RoleManager, Colors, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { Guilds } = require('../database/database');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('register')
		.setDescription('Register your server for CronTokens!')
		// only server administrators are permitted to use this command
		.setDefaultMemberPermissions('8')
		.setDMPermission(false),

	async execute(interaction) {
		// TODO: maybe ask if there is already a role 'CronToken Admin'
		// allow each user to register themself
		// allow each user to remove themself (DELETE user and all their data pertaining to that server)
		// allow server manager to unregister the server (DELETE all data pertaining to the server)

		const row = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setCustomId('accept')
					.setLabel('Accept')
					.setStyle(ButtonStyle.Primary),
			);

		// warning message
		await interaction.reply({ content: 'This will register this server for CronToken usage. The server ID and registered users\' IDs will be stored in a database.' +
			'\n\nYou may remove the server data entirely or individual users may remove their data at any time.\n\nPlease click the button below to register!', components: [row], ephemeral: true });

		try {

			const filter = i => i.customId === 'accept' && i.user.id === interaction.user.id.toString();

			const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });

			collector.on('collect', async i => {
				// create RoleManager object
				const rm = new RoleManager(interaction.guild);

				const thisGuild = await Guilds.findOne({ where: { guildId: interaction.guild.id } });

				// check if guild is already in list of registered guilds
				if (!thisGuild) {
					await Guilds.create({ guildId: interaction.guild.id });

					// check if server does not have the crontoken admin role
					if (!interaction.guild.roles.cache.find(x => x.name === 'CronToken Admin')) {

						// generate a role that allows usage of admin-only commands for this bot
						await rm.create({
							name: 'CronToken Admin',
							color: Colors.Grey,
						});

						await i.update({ content: 'Server successfully registered for CronToken usage.\n\nPlease assign the "@CronToken Admin" role to users to entrust them with top-level CronToken management.', components: [] });
						console.log(`CronToken role created in server ${interaction.guild.id}`);
					}
					else {
						await i.update({ content: 'Server successfully registered for CronToken usage.\n\nIt looks like the "@CronToken Admin" role is already in this server.\n\nAssign this role to users to entrust them with top-level CronToken management.', components: [] });
						console.log(`CronToken role already in server ${interaction.guild.id}`);
					}

					console.log(`${interaction.guild.id} has been registered.`);
				}
				// check for crontoken role existence
				else if (thisGuild && !interaction.guild.roles.cache.find(x => x.name === 'CronToken Admin')) {

					await rm.create({
						name: 'CronToken Admin',
						color: Colors.Grey,
					});

					await i.update({ content: 'Server already registered for CronToken usage, but "@CronToken Admin" role was not found (was it deleted?).\n\nThe role has been generated. Please assign the "@CronToken Admin" role to users to entrust them with top-level CronToken management.', components: [] });
					console.log(`CronToken role created in server ${interaction.guild.id}`);
				}
				else {
					await i.update({ content: 'Server is already registered for CronToken usage.', components: [] });
					console.log(`${interaction.guild.id} already registered for CronToken usage`);
				}
			});
		}
		catch (error) {
			console.log(error);
		}
	},
};