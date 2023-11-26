module.exports = (sequelize, DataTypes) => {
    let alias = 'Season';
    let cols = {
        id: {
            type: DataTypes.BIGINT(10).UNSIGNED,
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
        end_date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        serie_id: {
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
    const Season = sequelize.define(alias, cols, config);

    Season.associate = function (models) {
        Season.belongsTo(models.Serie, {
            as: 'serie',
            foreignKey: 'serie_id',
        });
    };

    return Season;
};
