const { Tag } = require('./models');
const { sequelize } = require('./config/database');

const listTags = async () => {
  try {
    const tags = await Tag.findAll();
    console.log(`Tags (${tags.length}):`);
    tags.forEach(t => console.log(` - ${t.name} (slug: ${t.slug})`));
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

listTags();
