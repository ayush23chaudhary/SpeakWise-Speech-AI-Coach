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
    },
    {
        title: "Metronome Speaking Exercise",
        description: "Control your speaking pace with rhythm exercises using a metronome",
        category: "pacing",
        difficulty: "intermediate",
        duration: 12,
        instructions: [
            { step: 1, text: "Set a metronome to 60 BPM (beats per minute)" },
            { step: 2, text: "Speak one syllable per beat, maintaining steady rhythm" },
            { step: 3, text: "Gradually increase to 120 BPM as you become comfortable" },
            { step: 4, text: "Practice reading a paragraph while maintaining consistent pace" }
        ],
        targetMetrics: {
            targetPace: { min: 140, max: 160 }
        },
        tags: ["pacing", "rhythm", "control", "technical"]
    },
    {
        title: "Power Pose & Projection",
        description: "Build confidence through body language and voice projection exercises",
        category: "confidence",
        difficulty: "beginner",
        duration: 7,
        instructions: [
            { step: 1, text: "Stand in a 'power pose' - hands on hips, chest out, for 2 minutes" },
            { step: 2, text: "Practice projecting your voice across a room without shouting" },
            { step: 3, text: "Speak these phrases with conviction: 'I am confident', 'I speak clearly'" },
            { step: 4, text: "Record yourself and notice the difference in your voice quality" }
        ],
        tags: ["confidence", "body-language", "motivation", "quick"]
    },
    {
        title: "Word Emphasis Training",
        description: "Learn to emphasize key words for more engaging and impactful communication",
        category: "tone",
        difficulty: "intermediate",
        duration: 10,
        instructions: [
            { step: 1, text: "Take a simple sentence: 'I never said she stole my money'" },
            { step: 2, text: "Say it 7 times, emphasizing a different word each time" },
            { step: 3, text: "Notice how meaning changes with different emphasis" },
            { step: 4, text: "Practice with your own sentences and speeches" }
        ],
        practiceText: "I never said she stole my money. Practice emphasizing each word: I, never, said, she, stole, my, money.",
        tags: ["emphasis", "expression", "engagement", "advanced"]
    },
    {
        title: "Articulation Drill",
        description: "Clear enunciation exercises focusing on consonants and vowel sounds",
        category: "articulation",
        difficulty: "beginner",
        duration: 8,
        instructions: [
            { step: 1, text: "Practice consonant sounds: P-T-K, B-D-G (repeat 10 times each)" },
            { step: 2, text: "Exaggerate mouth movements for each sound" },
            { step: 3, text: "Practice vowel sounds: A-E-I-O-U (hold each for 5 seconds)" },
            { step: 4, text: "Combine into simple words, focusing on clarity" }
        ],
        practiceText: "The lips, the teeth, the tip of the tongue. Repeat this clearly 10 times, gradually increasing speed.",
        targetMetrics: {
            minClarity: 75
        },
        tags: ["articulation", "fundamentals", "technical", "daily"]
    },
    {
        title: "Impromptu Speaking",
        description: "Develop quick thinking and smooth delivery by speaking on random topics",
        category: "fluency",
        difficulty: "advanced",
        duration: 15,
        instructions: [
            { step: 1, text: "Choose a random topic (use a random word generator if needed)" },
            { step: 2, text: "Give yourself 30 seconds to think" },
            { step: 3, text: "Speak for 2 minutes on that topic without stopping" },
            { step: 4, text: "Focus on maintaining flow, even if you need to pivot your points" }
        ],
        targetMetrics: {
            maxFillerWords: 5,
            minClarity: 65
        },
        tags: ["improvisation", "thinking", "challenge", "advanced"]
    },
    {
        title: "Volume Control Exercise",
        description: "Master dynamic speaking by practicing different volume levels",
        category: "tone",
        difficulty: "beginner",
        duration: 6,
        instructions: [
            { step: 1, text: "Say the same sentence at 3 volumes: whisper, normal, projected" },
            { step: 2, text: "Maintain clarity at all volume levels" },
            { step: 3, text: "Practice transitioning smoothly between volumes" },
            { step: 4, text: "Record and listen to ensure clarity is maintained" }
        ],
        practiceText: "The quick brown fox jumps over the lazy dog. Practice this at different volumes.",
        tags: ["volume", "control", "dynamics", "technical"]
    },
    {
        title: "Vocabulary Builder",
        description: "Expand your vocabulary and practice using new words in context",
        category: "vocabulary",
        difficulty: "intermediate",
        duration: 10,
        instructions: [
            { step: 1, text: "Learn 5 new words with their meanings and pronunciations" },
            { step: 2, text: "Create a sentence using each new word" },
            { step: 3, text: "Speak each sentence clearly and record yourself" },
            { step: 4, text: "Try to use these words in conversations throughout the day" }
        ],
        tags: ["vocabulary", "learning", "daily", "education"]
    },
    {
        title: "Breath Control Practice",
        description: "Improve stamina and voice quality through breathing exercises",
        category: "confidence",
        difficulty: "beginner",
        duration: 8,
        instructions: [
            { step: 1, text: "Practice diaphragmatic breathing: hand on belly, breathe deeply" },
            { step: 2, text: "Inhale for 4 counts, hold for 4, exhale for 8 counts (repeat 5 times)" },
            { step: 3, text: "Say the alphabet on one breath, maintaining consistent volume" },
            { step: 4, text: "Gradually increase until you can speak longer phrases smoothly" }
        ],
        tags: ["breathing", "stamina", "foundation", "health"]
    },
    {
        title: "Presentation Practice",
        description: "Simulate real presentation scenarios to build practical speaking skills",
        category: "confidence",
        difficulty: "advanced",
        duration: 15,
        instructions: [
            { step: 1, text: "Prepare a 3-minute presentation on any topic" },
            { step: 2, text: "Practice in front of a mirror or record yourself" },
            { step: 3, text: "Focus on eye contact, gestures, and confident delivery" },
            { step: 4, text: "Review the recording and identify 3 areas to improve" }
        ],
        targetMetrics: {
            minClarity: 75,
            maxFillerWords: 5,
            targetPace: { min: 140, max: 170 }
        },
        tags: ["presentation", "professional", "comprehensive", "career"]
    },
    {
        title: "Speed Reading Challenge",
        description: "Improve pace control by practicing reading at different speeds while maintaining clarity",
        category: "pacing",
        difficulty: "intermediate",
        duration: 10,
        instructions: [
            { step: 1, text: "Select a 500-word passage to read" },
            { step: 2, text: "Read at your normal pace first and time yourself" },
            { step: 3, text: "Read 10% faster while maintaining clarity (set a timer)" },
            { step: 4, text: "Find your optimal pace where speed and clarity balance" }
        ],
        targetMetrics: {
            targetPace: { min: 150, max: 180 },
            minClarity: 70
        },
        tags: ["pacing", "reading", "control", "challenge"]
    }
];

async function seedExercises() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing exercises
        const deleteResult = await Exercise.deleteMany({});
        console.log(`🗑️  Cleared ${deleteResult.deletedCount} existing exercises`);

        // Insert new exercises
        const insertResult = await Exercise.insertMany(exercises);
        console.log(`✅ Successfully seeded ${insertResult.length} exercises`);

        // Display summary
        console.log('\n📊 Exercise Summary:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        const categories = {};
        const difficulties = {};
        
        exercises.forEach(ex => {
            categories[ex.category] = (categories[ex.category] || 0) + 1;
            difficulties[ex.difficulty] = (difficulties[ex.difficulty] || 0) + 1;
        });

        console.log('\nBy Category:');
        Object.entries(categories).forEach(([cat, count]) => {
            console.log(`  ${cat}: ${count} exercises`);
        });

        console.log('\nBy Difficulty:');
        Object.entries(difficulties).forEach(([diff, count]) => {
            console.log(`  ${diff}: ${count} exercises`);
        });

        console.log('\n✨ Database seeding completed successfully!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding exercises:', error);
        process.exit(1);
    }
}

// Run the seed function
seedExercises();
