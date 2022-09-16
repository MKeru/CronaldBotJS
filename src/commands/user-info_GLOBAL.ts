// const { SlashCommandBuilder } = require('discord.js');
import { SlashCommandBuilder } from 'discord.js';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('user-info')
		.setDescription('Display your user information.'),
	async execute(interaction: any) {
		await interaction.reply(`Your username: ${interaction.user.tag}\nYour ID: ${interaction.user.id}`);
	},
};