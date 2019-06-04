module.exports = (sequelize, dataTypes) => {
	const Notification = sequelize.define(
		'Notification',
		{
			type: {
				type: dataTypes.ENUM(["Request", "Message"]),
				allowNull: false,
				primaryKey: true
			},
			user_id: {
				type: dataTypes.INTEGER,
				allowNull: false,
				primaryKey: true
			},
			friend_id: {
				type: dataTypes.INTEGER,
				allowNull: false,
				primaryKey: true
			},
			message: {
				type: dataTypes.TEXT
			},
			readed: {
				type: dataTypes.BOOLEAN,
				defaultValue: false
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
	Notification.associate = (models) => {
		Notification.hasOne(models.User, { foreignKey: 'id', sourceKey: 'friend_id', as: 'friend' });
	};
	return Notification;
}