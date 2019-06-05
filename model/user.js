module.exports = (sequelize, dataTypes) => {
	const User = sequelize.define(
		'user',
		{
			id: {
				type: dataTypes.INTEGER,
				autoIncrement: true,
				allowNull: false,
				primaryKey: true
			},
			username: {
				type: dataTypes.STRING(255),
				allowNull: false,
				unique: true
			},
			password: {
				type: dataTypes.TEXT,
				allowNull: false
			},
			name: {
				type: dataTypes.STRING(255),
				allowNull: false
			},
			email: {
				type: dataTypes.STRING(255),
				allowNull: false,
				unique: true
			},
			mobile: {
				type: dataTypes.STRING(10),
				allowNull: false,
				unique: true
			},
			citizen_id: {
				type: dataTypes.STRING(13),
				allowNull: false,
				unique: true
			},
			profile: {
				type: dataTypes.STRING(255),
				allowNull: false
			},
			createdAt: {
				field: 'created_at',
				type: dataTypes.DATE,
			},
			updatedAt: {
				field: 'updated_at',
				type: dataTypes.DATE,
			}
		}
	);
	User.associate = (models) => {
		User.belongsTo(models.Notification, { foreignKey: 'id', targetKey: 'friend_id' });
	};
	return User;
}