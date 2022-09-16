const Sequelize = require('sequelize');

const sequelize = new Sequelize('database', 'user', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	// sqlite only
	storage: 'database.sqlite',
});

export const Tokens = sequelize.define('tokens', {
	guildId: Sequelize.INTEGER,
	username: Sequelize.STRING,
	tokens: {
		type: Sequelize.INTEGER,
		allowNull: false,
		defaultValue: 0,
	},
});

export const Guilds = sequelize.define('guilds', {
	guildId: {
		type: Sequelize.INTEGER,
		unique: true,
		allowNull: false,
	},
});

// module.exports = { Tokens, Guilds };