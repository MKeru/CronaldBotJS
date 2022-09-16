// const { SlashCommandBuilder } = require('discord.js');
import { SlashCommandBuilder } from 'discord.js';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('server')
		.setDescription('Display server info.')
		.setDMPermission(false),
	async execute(interaction: any) {
		await interaction.reply(`Server name: ${interaction.guild.name}\nTotal members: ${interaction.guild.memberCount}`);
	},
};