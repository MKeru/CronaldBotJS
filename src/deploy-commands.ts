import * as fs from 'node:fs';
import * as path from 'node:path';
const { Routes } = require('discord.js');
const { REST } = require('@discordjs/rest');
import * as dotenv from 'dotenv';

dotenv.config();

const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

// commands appended with _TEST.js are only available in the test server
const testCommands = [];
const testCommandsPath = path.join(__dirname, 'commands');
const testCommandFiles = fs.readdirSync(testCommandsPath).filter(file => file.endsWith('_TEST.js'));

// usually all commands will be global
// do .setDMPermission(false) for SERVER ONLY commands (server.js for example)
const globalCommands = [];
const globalCommandsPath = path.join(__dirname, 'commands');
const globalCommandFiles = fs.readdirSync(globalCommandsPath).filter(file => file.endsWith('_GLOBAL.js'));

for (const file of testCommandFiles) {
	const filePath = path.join(testCommandsPath, file);
	const command = require(filePath);
	testCommands.push(command.data.toJSON());
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

		console.log(`Started refreshing ${testCommands.length} test application (/) commands.`);

		const testData = await rest.put(
			Routes.applicationGuildCommands(clientId, guildId),
			{ body: testCommands },
		);

		console.log(`Successfully reloaded ${testData.length} test application (/) commands.`);
	}
	catch (error) {
		console.error(error);
	}
})();
