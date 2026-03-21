const { User, Post, Follow } = require('./models');
const { sequelize } = require('./config/database');

const check = async () => {
  try {
    const userCount = await User.count();
    const postCount = await Post.count();
    const officialUsers = await User.findAll({
      where: { username: ['discuss_ev', 'tesla_master', 'ev_trends'] }
    });
    
    console.log(`📊 Database Status:`);
    console.log(`Users: ${userCount}`);
    console.log(`Posts: ${postCount}`);
    console.log(`Official Users Found: ${officialUsers.length}`);
    officialUsers.forEach(u => console.log(` - ${u.username} (${u.id})`));
    
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

check();
