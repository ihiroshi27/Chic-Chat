module.exports = (sequelize, dataTypes) => {
	const Chat = sequelize.define(
		'Chat',
		{
			id: {
				type: dataTypes.INTEGER,
				autoIncrement: true,
				allowNull: false,
				primaryKey: true
			},
			user_id1: {
				type: dataTypes.INTEGER,
				allowNull: false
			},
			user_id2: {
				type: dataTypes.INTEGER,
				allowNull: false
			},
			message: {
				type: dataTypes.TEXT,
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
	)
	return Chat;
}