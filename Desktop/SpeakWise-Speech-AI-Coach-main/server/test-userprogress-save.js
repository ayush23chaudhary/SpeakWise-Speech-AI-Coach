const mongoose = require('mongoose');
const UserProgress = require('./models/UserProgress.model');
require('dotenv').config();

async function testUserProgressSave() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Create a test user ID (use your actual user ID from the database)
        const testUserId = new mongoose.Types.ObjectId();
        console.log('📝 Test User ID:', testUserId);

        // Find or create user progress
        let userProgress = await UserProgress.findOne({ userId: testUserId });
        
        if (!userProgress) {
            console.log('📝 Creating new UserProgress...');
            userProgress = new UserProgress({ 
                userId: testUserId,
                completedExercises: [],
                dailyStreak: { current: 0, longest: 0 },
                skillLevels: {
                    pronunciation: 0,
                    fluency: 0,
                    pacing: 0,
                    confidence: 0,
                    vocabulary: 0
                },
                achievements: []
            });
        }

        console.log('📊 Current state:', {
            completedExercises: userProgress.completedExercises.length,
            streak: userProgress.dailyStreak.current
        });

        // Test 1: Add exercise with ObjectId
        console.log('\n🧪 Test 1: Adding exercise with ObjectId...');
        const exerciseObjectId = new mongoose.Types.ObjectId();
        userProgress.completedExercises.push({
            exerciseId: exerciseObjectId,
            completedAt: new Date(),
            performance: {
                clarity: 80,
                fluency: 75,
                pace: 70,
                fillerWords: 2
            },
            feedback: 'Test feedback with ObjectId'
        });

        // Test 2: Add exercise with string ID (daily challenge)
        console.log('🧪 Test 2: Adding exercise with string ID...');
        const stringExerciseId = `pronunciation-intermediate-${Date.now()}`;
        userProgress.completedExercises.push({
            exerciseId: stringExerciseId,
            completedAt: new Date(),
            performance: {
                clarity: 85,
                fluency: 80,
                pace: 75,
                fillerWords: 1
            },
            feedback: 'Test feedback with string ID'
        });

        // Update streak
        userProgress.dailyStreak.current = 1;
        userProgress.dailyStreak.longest = 1;
        userProgress.dailyStreak.lastPracticeDate = new Date();

        // Update skill levels
        userProgress.skillLevels.pronunciation = 5;
        userProgress.skillLevels.fluency = 3;

        console.log('\n💾 Attempting to save...');
        console.log('Document to save:', {
            userId: userProgress.userId,
            completedExercisesCount: userProgress.completedExercises.length,
            exerciseIds: userProgress.completedExercises.map(e => ({
                id: e.exerciseId,
                type: typeof e.exerciseId
            }))
        });

        await userProgress.save();
        console.log('✅ Save successful!');

        // Verify the save
        const saved = await UserProgress.findOne({ userId: testUserId });
        console.log('\n🔍 Verification:');
        console.log('   - Completed exercises:', saved.completedExercises.length);
        console.log('   - First exercise ID:', saved.completedExercises[0].exerciseId);
        console.log('   - Second exercise ID:', saved.completedExercises[1].exerciseId);
        console.log('   - Streak:', saved.dailyStreak.current);
        console.log('   - Skill levels:', saved.skillLevels);

        console.log('\n✅ All tests passed!');

        // Clean up test data
        console.log('\n🧹 Cleaning up test data...');
        await UserProgress.deleteOne({ userId: testUserId });
        console.log('✅ Test data removed');

    } catch (error) {
        console.error('❌ Error:', error);
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        if (error.errors) {
            console.error('Validation errors:', error.errors);
        }
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Disconnected from MongoDB');
    }
}

testUserProgressSave();
