const fs = require('node:fs');
const path = require('node:path');
const { Routes } = require('discord.js');
const { REST } = require('@discordjs/rest');
const dotenv = require('dotenv');

dotenv.config();

const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

// commands appended with _TEST.js are only available in the test server
const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('_TEST.js'));

// usually all commands will be global
// do .setDMPermission(false) for SERVER ONLY commands (server.js for example)
const globalCommands = [];
const globalCommandsPath = path.join(__dirname, 'commands');
const globalCommandFiles = fs.readdirSync(globalCommandsPath).filter(file => file.endsWith('_GLOBAL.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	commands.push(command.data.toJSON());
}

for (const file of globalCommandFiles) {
	const filePath = path.join(globalCommandsPath, file);
	const command = require(filePath);
	globalCommands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);

(async () => {
	try {
		console.log(`Started refreshing ${globalCommands.length} global application (/) commands.`);

		const data = await rest.put(
			Routes.applicationCommands(clientId),
			{ body: globalCommands },
		);

		console.log(`Successfully reloaded ${data.length} global application (/) commands.`);

		console.log(`Started refreshing ${commands.length} test application (/) commands.`);

		const testData = await rest.put(
			Routes.applicationGuildCommands(clientId, guildId),
			{ body: commands },
		);

		console.log(`Successfully reloaded ${testData.length} test application (/) commands.`);
	}
	catch (error) {
		console.error(error);
	}
})();
