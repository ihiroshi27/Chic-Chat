module.exports = (sequelize, dataTypes) => {
	const Friend = sequelize.define(
		'friend',
		{
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
			blocked: {
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
	Friend.hasOne(Friend, { foreignKey: 'user_id', sourceKey: 'friend_id', as: 'friendship' })
	return Friend;
}