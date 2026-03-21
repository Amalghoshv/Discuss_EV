const { User, Post, Tag, PostTag } = require('../models');
const bcrypt = require('bcryptjs');

const seedData = async () => {
  try {
    console.log('🌱 Seeding default data...');

    // 1. Create Default Users (Official Accounts)
    const defaultUsers = [
      {
        username: 'discuss_ev',
        email: 'official@discussev.com',
        password: 'password123',
        firstName: 'DiscussEV',
        lastName: 'Official',
        bio: 'Welcome to the official DiscussEV account! Stay tuned for platform updates and community news.',
        role: 'admin',
        avatar: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?q=80&w=200&h=200&auto=format&fit=crop'
      },
      {
        username: 'tesla_master',
        email: 'tesla@ev-expert.com',
        password: 'password123',
        firstName: 'Tesla',
        lastName: 'Expert',
        bio: 'Everything Tesla! Tips, tricks, and the latest firmware updates.',
        avatar: 'https://images.unsplash.com/photo-1617788138017-80ad42243c5d?q=80&w=200&h=200&auto=format&fit=crop'
      },
      {
        username: 'ev_trends',
        email: 'trends@evworld.com',
        password: 'password123',
        firstName: 'EV',
        lastName: 'Insights',
        bio: 'Market trends, battery technology, and global EV infrastructure updates.',
        avatar: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=200&h=200&auto=format&fit=crop'
      }
    ];

    const seededUsers = [];
    for (const userData of defaultUsers) {
      const [user] = await User.findOrCreate({
        where: { username: userData.username },
        defaults: userData
      });
      seededUsers.push(user);
    }

    const [official, tesla, trends] = seededUsers;

    // 2. Create Default Tags
    const tagsData = ['Tech', 'Tesla', 'Charging', 'News', 'Battery', 'Tips'];
    const seededTags = [];
    for (const tagName of tagsData) {
      const tagSlug = tagName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const [tag] = await Tag.findOrCreate({
        where: { slug: tagSlug },
        defaults: { name: tagName }
      });
      seededTags.push(tag);
    }

    // 3. Create Initial Posts
    const postsData = [
      {
        userId: official.id,
        title: 'Welcome to DiscussEV Community!',
        content: `We are thrilled to have you here! DiscussEV is the place to share your electric vehicle journey, ask for advice, and connect with fellow enthusiasts. Check out our community guidelines and start posting!`,
        category: 'general',
        type: 'discussion'
      },
      {
        userId: official.id,
        title: 'Platform Update: New Glass UI Elements',
        content: `We've just rolled out a new premium "Glassmorphism" UI update. You'll notice better transparency and smoother transitions across all pages. Let us know what you think!`,
        category: 'technology',
        type: 'news'
      },
      {
        userId: tesla.id,
        title: 'Tesla Model Y: Winter Range Tips',
        content: `Driving your Tesla in the cold? Remember to pre-condition your battery before heading out. Using the "Scheduled Departure" feature can save up to 15% of your range in freezing temperatures.`,
        category: 'maintenance',
        type: 'article'
      },
      {
        userId: trends.id,
        title: 'The Future of Solid-State Batteries',
        content: `Researchers are making massive strides in solid-state battery technology. We expect to see the first production vehicles with this tech as early as 2027, promising double the energy density and nearly instant charging.`,
        category: 'technology',
        type: 'article'
      },
      {
        userId: trends.id,
        title: 'EV Adoption Hits Record High in Europe',
        content: `Over 25% of new car sales in major European markets are now fully electric. This trend is accelerating faster than industry analysts predicted!`,
        category: 'news',
        type: 'news'
      }
    ];

    for (const postData of postsData) {
      const [post, created] = await Post.findOrCreate({
        where: { title: postData.title },
        defaults: postData
      });
      
      if (created) {
        // Randomly associate tags
        const randomTags = seededTags.sort(() => 0.5 - Math.random()).slice(0, 2);
        for (const tag of randomTags) {
          await PostTag.create({ postId: post.id, tagId: tag.id });
        }
      }
    }

    console.log('✅ Default data seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding data:', error);
  }
};

module.exports = { seedData };
