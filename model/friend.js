module.exports = (sequelize, dataTypes) => {
	const Friend = sequelize.define(
		'Friend',
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
	Friend.hasOne(Friend, { foreignKey: 'friend_id', sourceKey: 'user_id', as: 'friendship' })
	return Friend;
}