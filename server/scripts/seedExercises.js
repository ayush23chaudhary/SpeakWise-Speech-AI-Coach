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
            { step: 1, text: "Choose a tongue twister from the examples below" },
            { step: 2, text: "Say it slowly 3 times to learn the words correctly" },
            { step: 3, text: "Gradually increase speed while maintaining clarity" },
            { step: 4, text: "Record yourself saying it 5 times fast" }
        ],
        practiceText: "Choose any tongue twister from the examples below and practice saying it clearly at increasing speeds.",
        examples: [
            { type: "Easy", content: "Peter Piper picked a peck of pickled peppers", difficulty: "beginner" },
            { type: "Easy", content: "She sells seashells by the seashore", difficulty: "beginner" },
            { type: "Easy", content: "Red lorry, yellow lorry", difficulty: "beginner" },
            { type: "Medium", content: "How much wood would a woodchuck chuck if a woodchuck could chuck wood?", difficulty: "intermediate" },
            { type: "Medium", content: "Fuzzy Wuzzy was a bear. Fuzzy Wuzzy had no hair. Fuzzy Wuzzy wasn't fuzzy, was he?", difficulty: "intermediate" },
            { type: "Medium", content: "I saw Susie sitting in a shoe shine shop", difficulty: "intermediate" },
            { type: "Hard", content: "The sixth sick sheikh's sixth sheep's sick", difficulty: "advanced" },
            { type: "Hard", content: "Pad kid poured curd pulled cod", difficulty: "advanced" },
            { type: "Hard", content: "Irish wristwatch, Swiss wristwatch", difficulty: "advanced" },
            { type: "Hard", content: "Unique New York, you know you need unique New York", difficulty: "advanced" }
        ],
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
            { step: 1, text: "Choose a news excerpt from the examples below" },
            { step: 2, text: "Read silently first to understand the content and unfamiliar words" },
            { step: 3, text: "Read aloud as if presenting on live television" },
            { step: 4, text: "Aim for 150-170 words per minute with clear enunciation" }
        ],
        examples: [
            { type: "Technology", content: "Recent advancements in artificial intelligence are transforming industries worldwide. Companies are implementing AI solutions to improve efficiency, reduce costs, and enhance customer experiences. However, concerns about job displacement and ethical implications continue to spark debate among experts and policymakers.", difficulty: "intermediate" },
            { type: "Business", content: "The global economy showed signs of recovery this quarter, with major stock indices reaching new highs. Analysts attribute this growth to increased consumer spending and strong corporate earnings. However, inflation concerns remain a key focus for central banks as they navigate monetary policy decisions.", difficulty: "intermediate" },
            { type: "Science", content: "Scientists have made a breakthrough discovery in renewable energy technology. The new solar panel design increases efficiency by 40 percent while reducing manufacturing costs. This innovation could accelerate the transition to clean energy and help countries meet their climate goals more effectively.", difficulty: "intermediate" },
            { type: "Health", content: "Medical researchers announced promising results from a new treatment trial. The therapy showed significant improvement in patient outcomes with minimal side effects. Health officials are optimistic about its potential to address a major public health challenge affecting millions worldwide.", difficulty: "intermediate" },
            { type: "Environment", content: "Environmental conservation efforts are yielding positive results in several regions. Wildlife populations have increased, and ecosystems are recovering due to dedicated restoration programs. Experts emphasize the importance of continued funding and community involvement to maintain this progress.", difficulty: "beginner" }
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
            { step: 1, text: "Choose a topic from the examples below" },
            { step: 2, text: "Each time you want to say 'um', 'like', or 'you know', pause instead" },
            { step: 3, text: "Use pauses strategically for emphasis and to gather thoughts" },
            { step: 4, text: "Count your filler words - aim for zero!" }
        ],
        examples: [
            { type: "Professional", content: "Describe your ideal work environment", difficulty: "beginner" },
            { type: "Professional", content: "Explain a project you're proud of", difficulty: "intermediate" },
            { type: "Personal", content: "What motivates you to achieve your goals?", difficulty: "beginner" },
            { type: "Personal", content: "Describe your morning routine and why it works for you", difficulty: "beginner" },
            { type: "Explanatory", content: "Teach someone how to do your favorite hobby", difficulty: "intermediate" },
            { type: "Explanatory", content: "Explain a complex concept in simple terms", difficulty: "advanced" },
            { type: "Reflective", content: "What have you learned about yourself this year?", difficulty: "intermediate" },
            { type: "Opinion", content: "Your views on work-life balance", difficulty: "intermediate" }
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
            { step: 1, text: "Choose a story prompt from the examples below" },
            { step: 2, text: "Plan your story structure: beginning (15s), middle (30s), end (15s)" },
            { step: 3, text: "Tell the complete story in exactly 60 seconds - no more, no less" },
            { step: 4, text: "Practice multiple times until it feels natural and engaging" }
        ],
        examples: [
            { type: "Personal", content: "Tell about a time you overcame a fear", difficulty: "intermediate" },
            { type: "Personal", content: "Describe your most embarrassing moment", difficulty: "beginner" },
            { type: "Personal", content: "Share a lesson learned from failure", difficulty: "intermediate" },
            { type: "Creative", content: "A mysterious package arrives at your door", difficulty: "intermediate" },
            { type: "Creative", content: "You wake up with a superpower for one day", difficulty: "beginner" },
            { type: "Creative", content: "Your pet can suddenly talk - what do they say?", difficulty: "beginner" },
            { type: "Reflective", content: "A decision that changed your life", difficulty: "advanced" },
            { type: "Reflective", content: "The best advice you ever received", difficulty: "intermediate" },
            { type: "Funny", content: "A misunderstanding that turned into something funny", difficulty: "intermediate" },
            { type: "Travel", content: "An unexpected adventure while traveling", difficulty: "intermediate" }
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
            { step: 1, text: "Choose a random topic from the examples below" },
            { step: 2, text: "Give yourself 30 seconds to think" },
            { step: 3, text: "Speak for 2 minutes on that topic without stopping" },
            { step: 4, text: "Focus on maintaining flow, even if you need to pivot your points" }
        ],
        examples: [
            { type: "Opinion", content: "Is social media good or bad for society?", difficulty: "intermediate" },
            { type: "Opinion", content: "Should schools teach financial literacy?", difficulty: "intermediate" },
            { type: "Debate", content: "Remote work vs. office work - which is better?", difficulty: "intermediate" },
            { type: "Debate", content: "Is technology making us smarter or more dependent?", difficulty: "advanced" },
            { type: "Debate", content: "Should AI be regulated by governments?", difficulty: "advanced" },
            { type: "Abstract", content: "What does success mean to you?", difficulty: "advanced" },
            { type: "Abstract", content: "If you could change one thing about the world, what would it be?", difficulty: "advanced" },
            { type: "Hypothetical", content: "What would you do with unlimited resources?", difficulty: "beginner" },
            { type: "Hypothetical", content: "If you could meet any historical figure, who and why?", difficulty: "intermediate" },
            { type: "Personal", content: "What skill would you love to master and why?", difficulty: "beginner" },
            { type: "Trending", content: "The impact of artificial intelligence on jobs", difficulty: "advanced" },
            { type: "Trending", content: "Climate change solutions we can implement today", difficulty: "intermediate" }
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
            { step: 1, text: "Choose a vocabulary set from the examples below" },
            { step: 2, text: "Learn the meanings and pronunciations of each word" },
            { step: 3, text: "Create and speak sentences using each new word" },
            { step: 4, text: "Try to use these words in conversations throughout the day" }
        ],
        examples: [
            { type: "Professional", content: "Articulate, Collaborate, Innovative, Strategic, Facilitate", difficulty: "intermediate" },
            { type: "Professional", content: "Synergy, Leverage, Optimize, Streamline, Paradigm", difficulty: "advanced" },
            { type: "Academic", content: "Analyze, Synthesize, Evaluate, Hypothesize, Corroborate", difficulty: "advanced" },
            { type: "Academic", content: "Perspective, Context, Framework, Methodology, Criterion", difficulty: "intermediate" },
            { type: "Descriptive", content: "Eloquent, Vivid, Compelling, Nuanced, Profound", difficulty: "intermediate" },
            { type: "Descriptive", content: "Meticulous, Ubiquitous, Ephemeral, Resilient, Tenacious", difficulty: "advanced" },
            { type: "Persuasive", content: "Compelling, Credible, Substantiate, Advocate, Emphasize", difficulty: "intermediate" },
            { type: "Business", content: "Scalable, Sustainable, Disruptive, Agile, Benchmark", difficulty: "intermediate" },
            { type: "Everyday", content: "Diligent, Versatile, Pragmatic, Candid, Proactive", difficulty: "beginner" }
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
            { step: 1, text: "Choose a presentation topic from the examples below" },
            { step: 2, text: "Prepare a 3-minute presentation with clear structure" },
            { step: 3, text: "Focus on eye contact, gestures, and confident delivery" },
            { step: 4, text: "Review the recording and identify 3 areas to improve" }
        ],
        examples: [
            { type: "Business", content: "Present a new product idea to potential investors", difficulty: "advanced" },
            { type: "Business", content: "Quarterly results presentation to stakeholders", difficulty: "advanced" },
            { type: "Educational", content: "Teach a skill you're passionate about", difficulty: "intermediate" },
            { type: "Educational", content: "Explain a recent innovation in your field", difficulty: "advanced" },
            { type: "Inspirational", content: "Share your journey and lessons learned", difficulty: "intermediate" },
            { type: "Inspirational", content: "Why failure is important for success", difficulty: "intermediate" },
            { type: "Technical", content: "Introduce a new software tool to your team", difficulty: "advanced" },
            { type: "Technical", content: "Explain a complex process to non-technical audience", difficulty: "advanced" },
            { type: "Personal", content: "Your 5-year career plan and goals", difficulty: "intermediate" },
            { type: "Team", content: "Motivate your team during challenging times", difficulty: "advanced" }
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
