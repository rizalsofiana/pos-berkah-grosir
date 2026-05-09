module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        username: { type: DataTypes.STRING(100), allowNull: false },
        password: { type: DataTypes.STRING(255), allowNull: false },
        role: {
            type: DataTypes.ENUM('owner', 'admin', 'cashier'),
            allowNull: false
        }
    }, { tableName: 'users', timestamps: false });

    return User;
};