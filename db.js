const Sequelize = require('sequelize');
const config = require('./config');

const sequelize = new Sequelize(config.db.database, config.db.user, config.db.password, {
	host: config.db.host,
	dialect: 'mysql',
	define: {
		freezeTableName: true,
		timestamp: true
	}
});

const User = require('./model/user')(sequelize, Sequelize);
const Login = require('./model/login')(sequelize, Sequelize);
const Friend = require('./model/friend')(sequelize, Sequelize);
const Reset = require('./model/reset')(sequelize, Sequelize);
const Chat = require('./model/chat')(sequelize, Sequelize);
const Notification = require('./model/notification')(sequelize, Sequelize);

const db = {
	User,
	Login,
	Friend,
	Reset,
	Chat,
	Notification
}

Object.keys(db).forEach((model) => {
	if (db[model].associate) {
		db[model].associate(db);
	}
});

module.exports = {
	sequelize: sequelize,
	Op: Sequelize.Op,
	...db
}