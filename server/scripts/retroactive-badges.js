// server/scripts/retroactive-badges.js
// Script to award badges to existing users who have already met achievement criteria

const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User.model');
const AchievementService = require('../services/achievement.service');

async function awardRetroactiveBadges() {
  try {
    console.log('🔄 Starting retroactive badge award process...\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // First, seed achievements if not already done
    await AchievementService.seedAchievements();
    console.log('✅ Achievements seeded\n');

    // Get all users
    const users = await User.find({});
    console.log(`📊 Found ${users.length} users\n`);

    let totalBadgesAwarded = 0;
    const userResults = [];

    // Process each user
    for (const user of users) {
      console.log(`\n👤 Processing user: ${user.name} (${user.email})`);
      
      // Check how many badges they already have
      const existingBadgeCount = user.badges ? user.badges.length : 0;
      console.log(`   - Current badges: ${existingBadgeCount}`);

      try {
        // Check and award badges
        const newBadges = await AchievementService.checkAndAwardBadges(user._id);
        
        if (newBadges.length > 0) {
          console.log(`   - ✨ Awarded ${newBadges.length} new badge(s):`);
          newBadges.forEach(badge => {
            console.log(`      🏆 ${badge.icon} ${badge.name} - ${badge.description}`);
          });
          totalBadgesAwarded += newBadges.length;
        } else {
          console.log(`   - ✓ No new badges to award`);
        }

        userResults.push({
          userId: user._id,
          name: user.name,
          email: user.email,
          previousBadges: existingBadgeCount,
          newBadges: newBadges.length,
          totalBadges: existingBadgeCount + newBadges.length
        });

      } catch (error) {
        console.error(`   - ❌ Error processing user: ${error.message}`);
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📈 RETROACTIVE BADGE AWARD SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total users processed: ${users.length}`);
    console.log(`Total badges awarded: ${totalBadgesAwarded}`);
    console.log('\nTop badge earners:');
    
    userResults
      .sort((a, b) => b.totalBadges - a.totalBadges)
      .slice(0, 5)
      .forEach((result, index) => {
        console.log(`${index + 1}. ${result.name}: ${result.totalBadges} badges (${result.newBadges} new)`);
      });

    console.log('\n✅ Retroactive badge award completed successfully!\n');

  } catch (error) {
    console.error('❌ Error in retroactive badge award:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the script
if (require.main === module) {
  awardRetroactiveBadges()
    .then(() => {
      console.log('\n🎉 Script completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Script failed:', error);
      process.exit(1);
    });
}

module.exports = awardRetroactiveBadges;
