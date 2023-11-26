module.exports = (sequelize, DataTypes) => {
    let alias = 'Episode';
    let cols = {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
        },
        title: {
            type: DataTypes.STRING(500),
            allowNull: true,
        },
        number: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: true,
        },
        release_date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        rating: {
            type: DataTypes.DECIMAL(3, 1),
            allowNull: false,
        },
        season_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: true,
        },
    };
    let config = {
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        deletedAt: false,
    };
    const Episode = sequelize.define(alias, cols, config);

    Episode.associate = function (models) {
        Episode.belongsTo(models.Season, {
            as: 'season',
            foreignKey: 'season_id',
        });
    };

    return Episode;
};
