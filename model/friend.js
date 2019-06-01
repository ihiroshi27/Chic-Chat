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
	return Friend;
}