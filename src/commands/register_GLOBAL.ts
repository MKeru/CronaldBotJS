import { SlashCommandBuilder, Colors, ActionRowBuilder, ButtonBuilder, ButtonStyle, CommandInteraction } from 'discord.js';
const { Guilds } = require('../database/database');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('register')
		.setDescription('Register your server for CronTokens!')
		// only server administrators are permitted to use this command
		.setDefaultMemberPermissions('0')
		.setDMPermission(false),

	async execute(interaction: CommandInteraction) {
		// TODO: maybe ask if there is already a role 'CronToken Admin'
		// allow each user to register themself
		// allow each user to remove themself (DELETE user and all their data pertaining to that server)
		// allow server manager to unregister the server (DELETE all data pertaining to the server)

		// check if server is already registered for CronToken usage AND has CronToken Admin role
		// if so, end interaction
		const checkGuild = await Guilds.findOne({ where: { guildId: interaction.guild.id } });
		const roleExists = interaction.guild.roles.cache.find((x: any) => x.name === 'CronToken Admin');
		if (checkGuild && roleExists) {
			await interaction.reply({ content: 'This server is already registered for CronToken usage and has the CronToken Admin role.', ephemeral: true });
			return;
		}

		// check if server is already registered for CronToken usage and does NOT have CronToken Admin role
		else if (checkGuild && !roleExists) {
			// create CronToken Admin role in guild
			await interaction.guild.roles.create({
				name: 'CronToken Admin',
				color: Colors.Grey,
			});
			await interaction.reply({ content: 'This server is already registered for CronToken usage, but does not have CronToken Admin role (was it deleted?).\n\nIt has been generated.', ephemeral: true });
			return;
		}

		// start building accept message
		const row = new ActionRowBuilder<ButtonBuilder>()
			.addComponents(
				new ButtonBuilder()
					.setCustomId('accept')
					.setLabel('Accept')
					.setStyle(ButtonStyle.Primary),
			)
			.addComponents(
				new ButtonBuilder()
					.setCustomId('decline')
					.setLabel('Decline')
					.setStyle(ButtonStyle.Secondary),
			);

		// warning message
		await interaction.reply({ content: 'This will register this server for CronToken usage. The server ID and registered users\' IDs will be stored in a database.' +
			'\n\nYou may remove the server data entirely or individual users may remove their data at any time.\n\nPlease click the accept button below to register!', components: [row], ephemeral: true });

		const filter = (i: any) => (i.customId === 'accept' || i.customId === 'decline') && i.user.id === interaction.user.id.toString();
		const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });

		try {
			collector.on('collect', async i => {
				// stop collector
				collector.stop();
				if (i.customId === 'accept') {
					// add guildId to database
					await Guilds.create({ guildId: interaction.guild.id });
					// check if CronToken Admin role does not exist
					if (!roleExists) {
						// create CronToken Admin role in guild
						await interaction.guild.roles.create({
							name: 'CronToken Admin',
							color: Colors.Grey,
						});
						await i.update({ content: 'Server successfully registered for CronToken usage.\n\nPlease assign the "@CronToken Admin" role to users to entrust them with top-level CronToken management.', components: [] });
						console.log(`Server ${interaction.guild.id} was registered for CronToken usage and CronToken Admin role was generated successfully.`);
					}
					else if (roleExists) {
						await i.update({ content: 'Server successfully registered for CronToken usage.\n\nThe CronToken Admin role already exists in this server, so it was not generated.', components: [] });
						console.log(`Server ${interaction.guild.id} was registered for CronToken usage. CronToken Admin role already exists.`);
					}
				}
				else if (i.customId === 'decline') {
					await i.update({ content: 'Declined registration for CronToken usage.', components: [] });
					console.log(`Server ${interaction.guild.id} declined registration for CronToken usage.`);
				}
			});
			// timeout
			collector.on('end', async collected => {
				if (collected.size === 0) {
					// stop collector
					collector.stop();
					await interaction.editReply({ content: 'Registration timed out.', components: [] });
				}
			});
		}
		catch (error) {
			// stop collector
			collector.stop();
			console.log(error);
		}
	},
};