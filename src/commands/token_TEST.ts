// const { SlashCommandBuilder } = require('discord.js');
import { SlashCommandBuilder } from 'discord.js';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('token')
		.setDescription('CronToken command.')
		.setDMPermission(false)
		.addSubcommand(subcommand =>
			subcommand
				.setName('generate')
				.setDescription('Generate CronTokens for a user.')
			// this command can only be used by the highest level cronaldbot role
			// FIXME: set permission for that role
				.addUserOption(option =>
					option
						.setName('user')
						.setDescription('Target user.')
						.setRequired(true))
				.addIntegerOption(option =>
					option
						.setName('number')
						.setDescription('The number of tokens to give the target user.')
						.setRequired(true))),
	async execute(interaction: any) {
		await interaction.reply(`Generated ${interaction.options.getInteger('number')} CronTokens for ${interaction.options.getUser('user')}.`);
	},
};