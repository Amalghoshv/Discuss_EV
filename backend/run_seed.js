const { seedData } = require('./utils/seedData');
const { connectDB } = require('./config/database');

const run = async () => {
  try {
    await connectDB();
    await seedData();
    console.log('Done');
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

run();
