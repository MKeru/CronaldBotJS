import { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } from 'discord.js';
import { Guilds, Tokens } from '../database/database';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('token')
		.setDescription('CronToken command.')
		.setDMPermission(false)
		// add subcommandgroup with 'generate', 'give', and 'register' subcommands
		.addSubcommand(subcommand =>
			subcommand
				.setName('generate')
				.setDescription('Generate CronTokens for a user. Admin only.')
				.addUserOption(option =>
					option
						.setName('user')
						.setDescription('Target user.')
						.setRequired(true))
				.addIntegerOption(option =>
					option
						.setName('number')
						.setDescription('The number of tokens to give the target user.')
						.setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('give')
				.setDescription('Give a number of your CronTokens to a user.')
				.addUserOption(option =>
					option
						.setName('user')
						.setDescription('Target user.')
						.setRequired(true))
				.addIntegerOption(option =>
					option
						.setName('number')
						.setDescription('The number of tokens to give the target user.')
						.setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('register')
				.setDescription('Register yourself with this server for CronTokens!')),
	async execute(interaction: any) {
		// end interaction if guild is not registered
		const checkGuild = await Guilds.findOne({ where: { guildId: interaction.guild.id } });
		if (!checkGuild) {
			interaction.reply({ content: 'This server is not registered for CronToken usage. Please register it with `/register` or ask a server administrator.', ephemeral: true });
			return;
		}

		// if subcommand is register add user to Tokens table
		const checkUser = await Tokens.findOne({ where: { guildId: interaction.guild.id, userId: interaction.user.id } });
		if (interaction.options.getSubcommand() === 'register') {
			// end interaction if user is already registered
			if (checkUser) {
				await interaction.reply({ content: 'You are already registered with this server.', ephemeral: true });
				return;
			}
			else {
				// send message to user with button to confirm registration
				const row = new ActionRowBuilder<ButtonBuilder>()
					.addComponents(
						new ButtonBuilder()
							.setCustomId('accept')
							.setLabel('Accept')
							.setStyle(ButtonStyle.Primary),
						new ButtonBuilder()
							.setCustomId('decline')
							.setLabel('Decline')
							.setStyle(ButtonStyle.Secondary),
					);
				await interaction.reply({ content: 'This will register you for CronToken usage in this server. Your user ID will be stored in a database.' +
				'\n\nYou may remove your data at any time with `/token unregister` which will also remove all tokens from your account.\n\nPlease click the accept button below to register!', components: [row], ephemeral: true });

				// create collector for button interaction
				const filter = (i: any) => (i.customId === 'accept' || i.customId === 'decline') && i.user.id === interaction.user.id;
				const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });

				// if user accepts registration add user to Tokens table
				collector.on('collect', async (i: any) => {
					if (i.customId === 'accept') {
						// close collector
						collector.stop();
						await Tokens.create({ guildId: interaction.guild.id, userId: interaction.user.id });
						await interaction.editReply({ content: 'You have been registered for CronToken usage in this server.', components: [] });
						
						return;
					}
					else if (i.customId === 'decline') {
						// close collector
						collector.stop();
						await interaction.editReply({ content: 'You have not been registered for CronToken usage in this server. If you would like to register, try again with `/token register`.', components: [] });
						
						return;
					}
				});
				// end interaction on timeout
				collector.on('end', async (collected: any, reason: any) => {
					if (reason === 'time') {
						// close collector
						collector.stop();
						// end interaction
						await interaction.editReply({ content: 'Timed out.', components: [] });
						
						return;
					}
				});
			}
		}

		// if subcommand is generate
		if (interaction.options.getSubcommand() === 'generate') {

			// end interaction if user does not have admin permissions or does not have the CronToken Admin role
			if (!interaction.member.permissions.has('ADMINISTRATOR') && !interaction.member.roles.cache.has('CronToken Admin')) {
				await interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
				return;
			}
			else {
				// get target user and number of tokens to give
				const targetUser = interaction.options.getUser('user');
				const number = interaction.options.getInteger('number');

				// end interaction if target user is not registered
				const checkTargetUser = await Tokens.findOne({ where: { guildId: interaction.guild.id, userId: targetUser.id } });
				if (!checkTargetUser) {
					await interaction.reply({ content: 'Target user does not have a CronToken account with this server. Please have them register with `/token register` to register.', ephemeral: true });
					return;
				}

				// update target user's tokens
				await Tokens.increment('tokens', { by: number, where: { guildId: interaction.guild.id, userId: targetUser.id } });

				// reply with success message
				await interaction.reply({ content: `Successfully generated ${number} CronTokens for ${targetUser.username}#${targetUser.discriminator}.`, ephemeral: true });
				return;
			}
		}

		// if subcommand is give
		if (interaction.options.getSubcommand() === 'give') {
			// end interaction if user is not registered
			if (!checkUser) {
				await interaction.reply({ content: 'You are not registered with this server. Please register with `/token register`.', ephemeral: true });
				return;
			}

			// get target user and number of tokens to give
			const targetUser = interaction.options.getUser('user');
			const number = interaction.options.getInteger('number');

			// end interaction if user does not have enough tokens
			if (checkUser.tokens < number) {
				await interaction.reply({ content: 'You do not have enough CronTokens to give.', ephemeral: true });
				return;
			}

			// end interaction if target user is not registered
			const checkTargetUser = await Tokens.findOne({ where: { guildId: interaction.guild.id, userId: targetUser.id } });
			if (!checkTargetUser) {
				await interaction.reply({ content: 'Target user does not have a CronToken account with this server. Please have them register with `/token register` to register.', ephemeral: true });
				return;
			}

			// warn user if they are giving all of their tokens and ask for confirmation with a button
			if (checkUser.tokens === number) {
				const row = new ActionRowBuilder<ButtonBuilder>();
				row.addComponents(
					new ButtonBuilder()
						.setCustomId('confirm')
						.setLabel('Confirm')
						.setStyle(ButtonStyle.Success),
					new ButtonBuilder()
						.setCustomId('cancel')
						.setLabel('Cancel')
						.setStyle(ButtonStyle.Secondary),
				);
				await interaction.reply({ content: 'Are you sure you want to give all of your CronTokens?', components: [row], ephemeral: true });

				const filter = (i: any) => (i.customId === 'confirm' || i.customId === 'cancel') && i.user.id === interaction.user.id;
				const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });
				collector.on('collect', async (i: any) => {
					if (i.customId === 'confirm') {
						// close collector
						collector.stop();
						// give tokens to target user
						await Tokens.increment('tokens', { by: number, where: { guildId: interaction.guild.id, userId: targetUser.id } });
						// remove tokens from user
						await Tokens.decrement('tokens', { by: number, where: { guildId: interaction.guild.id, userId: interaction.user.id } });
						// reply with success message
						await interaction.editReply({ content: `Successfully gave ${number} CronTokens to ${targetUser.username}#${targetUser.discriminator}.`, components: [] });
						
						return;
					}
					else if (i.customId === 'cancel') {
						// close collector
						collector.stop();
						// end interaction
						await interaction.editReply({ content: 'Cancelled.', components: [], ephemeral: true });
						return;
					}
				});
				collector.on('end', async (collected: any, reason: any) => {
					if (reason === 'time') {
						// close collector
						collector.stop();
						// end interaction
						await interaction.editReply({ content: 'Timed out.', components: [], ephemeral: true });
						
						return;
					}
				});
			}
			else {
				// give tokens to target user
				await Tokens.increment('tokens', { by: number, where: { guildId: interaction.guild.id, userId: targetUser.id } });
				// remove tokens from user
				await Tokens.decrement('tokens', { by: number, where: { guildId: interaction.guild.id, userId: interaction.user.id } });
				// reply with success message
				await interaction.reply({ content: `Successfully gave ${number} CronTokens to ${targetUser.username}#${targetUser.discriminator}.`, ephemeral: true });
				return;
			}
		}
	},
};