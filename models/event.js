const slugify = require("slugify");

module.exports = (sequelize, DataTypes) => {
  let Event = sequelize.define(
    "Event",
    {
      name: DataTypes.STRING,
      startDate: DataTypes.DATE,
      endDate: DataTypes.DATE,
      repeatsEveryXDays: { type: DataTypes.SMALLINT, allowNull: true },
      location: DataTypes.STRING,
      description: DataTypes.TEXT,
      embedCode: DataTypes.TEXT,
      published: DataTypes.BOOLEAN,
      slug: {
        type: DataTypes.STRING,
        allowNull: false,
        // unique: true,
      },
      isFeaturedOnHome: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      indexes: [
        {
          unique: true,
          fields: ["slug", "OrganizationId"], // Slug must be unique PER ORG
        },
      ],
    }
  );

  Event.addHook("beforeValidate", async (event) => {
    if (event.name && !event.slug) {
      let generatedSlug = slugify(event.name, { lower: true, strict: true });

      // Check if this slug already exists for THIS organization
      const existingEvent = await sequelize.models.Event.findOne({
        where: {
          slug: generatedSlug,
          OrganizationId: event.OrganizationId,
        },
      });

      // If it exists, append a short unique hash or timestamp
      if (existingEvent) {
        generatedSlug = `${generatedSlug}-${Math.floor(Math.random() * 1000)}`;
      }

      event.slug = generatedSlug;
    }
  });

  Event.associate = (models) => {
    Event.belongsTo(models.Image);
    Event.belongsTo(models.Organization, {
      foreignKey: {
        allowNull: false,
      },
    });
    Event.belongsToMany(models.Ministry, {
      through: "MinistryEvent",
    });
  };

  return Event;
};
