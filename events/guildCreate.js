module.exports = {
	name: 'guildCreate',
	once: true,
	execute(guild) {
		// FIXME: if server is not available, send a message when the server becomes available
		if (guild.available) {
			guild.systemChannel.send('greetings');
		}
		console.log(`Joined server ${guild.id}`);
	},
};