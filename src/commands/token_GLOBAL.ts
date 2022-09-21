import { SlashCommandBuilder } from 'discord.js';
import { Guilds } from '../database/database';
import { Generate } from './subcommands/token/generate';
import { Give } from './subcommands/token/give';
import { Register } from './subcommands/token/register';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('token')
		.setDescription('CronToken command.')
		.setDMPermission(false)
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
		// end any interaction if guild is not registered
		const checkGuild = await Guilds.findOne({ where: { guildId: interaction.guild.id } });
		if (!checkGuild) {
			interaction.reply({ content: 'This server is not registered for CronToken usage. Please register it with `/register` or ask a server administrator.', ephemeral: true });
			return;
		}

		// if subcommand is register
		if (interaction.options.getSubcommand() === 'register') {
			// call register.ts
			await Register(interaction);
			return;
		}

		// if subcommand is generate
		if (interaction.options.getSubcommand() === 'generate') {
			// call generate.ts
			await Generate(interaction);
			return;
		}

		// if subcommand is give
		if (interaction.options.getSubcommand() === 'give') {
			// call give.ts
			await Give(interaction);
			return;
		}
	},
};