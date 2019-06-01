module.exports = (sequelize, dataTypes) => {
	const Reset = sequelize.define(
	   'Reset',
	   {
			token: {
				type: dataTypes.TEXT,
				allowNull: false,
				primaryKey: true
			},
		   user_id: {
			   type: dataTypes.INTEGER,
			   allowNull: false
		   },
		   email: {
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
   return Reset;
}