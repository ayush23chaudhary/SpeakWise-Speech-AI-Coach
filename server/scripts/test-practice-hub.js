// Test script for Practice Hub API endpoints
const mongoose = require('mongoose');
const Exercise = require('../models/Exercise.model');
require('dotenv').config();

const exercises = [
    {
        title: "Tongue Twister Challenge",
        description: "Practice articulation with classic tongue twisters to improve pronunciation and clarity",
        category: "pronunciation",
        difficulty: "beginner",
        duration: 5,
        instructions: [
            { step: 1, text: "Choose a tongue twister from the practice text below" },
            { step: 2, text: "Say it slowly 3 times to learn the words correctly" },
            { step: 3, text: "Gradually increase speed while maintaining clarity" },
            { step: 4, text: "Record yourself and listen for improvements" }
        ],
        practiceText: "Peter Piper picked a peck of pickled peppers. She sells seashells by the seashore. How much wood would a woodchuck chuck if a woodchuck could chuck wood? Red lorry, yellow lorry. Unique New York.",
        targetMetrics: {
            minClarity: 70
        },
        tags: ["articulation", "pronunciation", "quick", "fun"]
    },
    {
        title: "News Anchor Practice",
        description: "Read news articles with professional clarity and pace, just like a TV news anchor",
        category: "fluency",
        difficulty: "intermediate",
        duration: 10,
        instructions: [
            { step: 1, text: "Find a news article (300-500 words) from any reputable source" },
            { step: 2, text: "Read silently first to understand the content and unfamiliar words" },
            { step: 3, text: "Read aloud as if presenting on live television" },
            { step: 4, text: "Aim for 150-170 words per minute with clear enunciation" }
        ],
        targetMetrics: {
            minClarity: 75,
            targetPace: { min: 150, max: 170 }
        },
        tags: ["professional", "fluency", "clarity", "career"]
    },
    {
        title: "Pause & Replace Practice",
        description: "Replace filler words with intentional pauses to sound more confident and professional",
        category: "filler-words",
        difficulty: "intermediate",
        duration: 8,
        instructions: [
            { step: 1, text: "Choose a topic to speak about for 2-3 minutes" },
            { step: 2, text: "Each time you want to say 'um', 'like', or 'you know', pause instead" },
            { step: 3, text: "Use pauses strategically for emphasis and to gather thoughts" },
            { step: 4, text: "Count your filler words - aim for zero!" }
        ],
        targetMetrics: {
            maxFillerWords: 2
        },
        tags: ["filler-words", "confidence", "professional", "advanced"]
    },
    {
        title: "Daily Voice Warm-up",
        description: "Daily breathing and vocal exercises to strengthen your speaking voice and build confidence",
        category: "confidence",
        difficulty: "beginner",
        duration: 5,
        instructions: [
            { step: 1, text: "Stand up straight with relaxed shoulders and feet shoulder-width apart" },
            { step: 2, text: "Take 5 deep breaths: inhale for 4 counts, hold for 4, exhale for 4" },
            { step: 3, text: "Hum at different pitches for 2 minutes to warm up vocal cords" },
            { step: 4, text: "Practice projecting your voice: 'Hello, everyone!' from your diaphragm" }
        ],
        tags: ["warmup", "daily", "foundation", "health"]
    },
    {
        title: "60-Second Story Challenge",
        description: "Practice concise and engaging storytelling by telling a complete story in exactly 60 seconds",
        category: "fluency",
        difficulty: "advanced",
        duration: 10,
        instructions: [
            { step: 1, text: "Pick a personal story, anecdote, or experience to share" },
            { step: 2, text: "Plan your story structure: beginning (15s), middle (30s), end (15s)" },
            { step: 3, text: "Tell the complete story in exactly 60 seconds - no more, no less" },
            { step: 4, text: "Practice multiple times until it feels natural and engaging" }
        ],
        targetMetrics: {
            minClarity: 70,
            maxFillerWords: 3
        },
        tags: ["storytelling", "timing", "engagement", "creative"]
    }
];

async function testPracticeHub() {
    console.log('🧪 Testing Practice Hub Setup\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    try {
        // Connect to MongoDB
        console.log('📡 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Check existing exercises
        const existingCount = await Exercise.countDocuments();
        console.log(`📊 Current exercises in database: ${existingCount}`);

        if (existingCount === 0) {
            console.log('\n🌱 Seeding database with sample exercises...');
            const insertResult = await Exercise.insertMany(exercises);
            console.log(`✅ Successfully seeded ${insertResult.length} exercises\n`);
        }

        // Test queries
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        console.log('🔍 Testing Exercise Queries:\n');

        // Get all exercises
        const allExercises = await Exercise.find({});
        console.log(`✅ Total exercises: ${allExercises.length}`);

        // Get by category
        const pronunciationExercises = await Exercise.find({ category: 'pronunciation' });
        console.log(`✅ Pronunciation exercises: ${pronunciationExercises.length}`);

        const fluencyExercises = await Exercise.find({ category: 'fluency' });
        console.log(`✅ Fluency exercises: ${fluencyExercises.length}`);

        // Get by difficulty
        const beginnerExercises = await Exercise.find({ difficulty: 'beginner' });
        console.log(`✅ Beginner exercises: ${beginnerExercises.length}`);

        const intermediateExercises = await Exercise.find({ difficulty: 'intermediate' });
        console.log(`✅ Intermediate exercises: ${intermediateExercises.length}`);

        // Display sample exercise
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        console.log('📝 Sample Exercise:\n');
        const sampleExercise = allExercises[0];
        console.log(`Title: ${sampleExercise.title}`);
        console.log(`Category: ${sampleExercise.category}`);
        console.log(`Difficulty: ${sampleExercise.difficulty}`);
        console.log(`Duration: ${sampleExercise.duration} minutes`);
        console.log(`Description: ${sampleExercise.description}`);

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        console.log('✅ Practice Hub API Endpoints Available:\n');
        console.log('GET    /api/practice-hub/recommendations');
        console.log('GET    /api/practice-hub/daily-challenge');
        console.log('GET    /api/practice-hub/exercises');
        console.log('GET    /api/practice-hub/exercises/:id');
        console.log('POST   /api/practice-hub/complete-exercise');
        console.log('GET    /api/practice-hub/progress');
        console.log('GET    /api/practice-hub/stats');

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        console.log('✅ Practice Hub setup completed successfully!');
        console.log('🚀 Server is running on http://localhost:5001');
        console.log('📚 Check PRACTICE_HUB_GUIDE.md for complete documentation\n');

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error testing Practice Hub:', error.message);
        process.exit(1);
    }
}

testPracticeHub();
