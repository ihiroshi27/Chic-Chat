module.exports = (sequelize, dataTypes) => {
 	const Login = sequelize.define(
		'login',
		{
			id: {
				type: dataTypes.INTEGER,
				autoIncrement: true,
				allowNull: false,
				primaryKey: true
			},
			user_id: {
				type: dataTypes.INTEGER,
				allowNull: false
			},
			attempt: {
				type: dataTypes.STRING(255),
				allowNull: false
			},
			lat: {
				type: dataTypes.DOUBLE,
				allowNull: false
			},
			lng: {
				type: dataTypes.DOUBLE,
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
	return Login;
}