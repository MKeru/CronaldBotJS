const { SlashCommandBuilder } = require('discord.js');
const registeredGuilds = [];

module.exports = {
	data: new SlashCommandBuilder()
		.setName('register')
		.setDescription('Register your server for CronTokens!')
		.setDMPermission(false),
	async execute(interaction) {
		if (!registeredGuilds.includes(interaction.guild.id)) {
			registeredGuilds.push(interaction.guild.id);
			await interaction.reply('Server successfully registered for CronToken usage.');
			console.log(registeredGuilds);
		}
		else {
			await interaction.reply('Server is already registered for CronToken usage.');
			console.log(`${interaction.guild.id} already registered.`);
		}
	},
};