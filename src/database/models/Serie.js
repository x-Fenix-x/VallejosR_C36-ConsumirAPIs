module.exports = (sequelize, dataTypes) => {
    let alias = 'Serie';
    let cols = {
        id: {
            type: dataTypes.BIGINT(10).UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
        },
        title: {
            type: dataTypes.STRING(500),
            allowNull: false,
        },
        release_date: {
            type: dataTypes.DATE,
            allowNull: false,
        },
        end_date: {
            type: dataTypes.DATE,
            allowNull: false,
        },
        genre_id: {
            type: dataTypes.INTEGER.UNSIGNED,
            allowNull: true,
        },
    };
    let config = {
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        deletedAt: false,
    };
    const Serie = sequelize.define(alias, cols, config);

    Serie.associate = function (models) {
        Serie.belongsTo(models.Genre, {
            as: 'genre',
            foreignKey: 'genre_id',
        });
    };

    return Serie;
};
