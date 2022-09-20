const Sequelize = require('sequelize');

const sequelize = new Sequelize('database', 'user', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	// sqlite only
	storage: 'database.sqlite',
});

export const Tokens = sequelize.define('tokens', {
	guildId: {
		type: Sequelize.INTEGER,
		allowNull: false,
		unique: false,
	},
	userId: {
		type: Sequelize.INTEGER,
		allowNull: false,
		unique: false,
	},
	tokens: {
		type: Sequelize.INTEGER,
		allowNull: false,
		defaultValue: 0,
		unique: false,
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