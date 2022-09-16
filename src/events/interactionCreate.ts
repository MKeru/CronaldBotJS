module.exports = {
	name: 'interactionCreate',
	execute(interaction: any) {
		try {
			if (interaction.inGuild()) {
				console.log(`${interaction.user.tag} in #${interaction.guildId}#${interaction.channel.name} triggered an interaction.`);
			}
			else {
				console.log(`${interaction.user.tag} triggered an interaction through DM.`);
			}
		}
		catch (error) {
			console.log(error);
		}
	},
};