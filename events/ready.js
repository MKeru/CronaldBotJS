const Sequelize = require('sequelize');

module.exports = {
	name: 'ready',
	once: true,
	execute(client) {
		const sequelize = new Sequelize('database', 'user', 'password', {
			host: 'localhost',
			dialect: 'sqlite',
			logging: false,
			// sqlite only
			storage: 'database.sqlite',
		});

		const Tags = sequelize.define('tags', {
			name: {
				type: Sequelize.STRING,
				unique: true,
			},
			description: Sequelize.TEXT,
			username: Sequelize.STRING,
			usage_count: {
				type: Sequelize.INTEGER,
				defaultValue: 0,
				allowNull: false,
			},
		});

		// sync model in database
		Tags.sync({ force: true });

		console.log(`Ready! Logged in as ${client.user.tag}`);
	},
};