const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const practiceHubService = require('../services/practiceHub.service');
const Exercise = require('../models/Exercise.model');
const UserProgress = require('../models/UserProgress.model');

/**
 * @route   POST /api/practice-hub/seed-exercises
 * @desc    Seed initial exercises (dev/admin only)
 * @access  Public (should be protected in production)
 */
router.post('/seed-exercises', async (req, res) => {
    try {
        const exercises = [
            {
                title: "Classic Tongue Twisters",
                description: "Master pronunciation with famous tongue twisters",
                category: "pronunciation",
                difficulty: "beginner",
                duration: 5,
                instructions: [
                    { step: 1, text: "Read each tongue twister slowly first" },
                    { step: 2, text: "Practice saying it 3 times slowly" },
                    { step: 3, text: "Gradually increase your speed" },
                    { step: 4, text: "Record yourself saying all three clearly" }
                ],
                practiceText: "Peter Piper picked a peck of pickled peppers. She sells seashells by the seashore. How much wood would a woodchuck chuck if a woodchuck could chuck wood?",
                targetMetrics: { minClarity: 70 },
                tags: ["articulation", "pronunciation", "quick", "beginner"]
            },
            {
                title: "Advanced Tongue Twisters",
                description: "Challenge your articulation with difficult combinations",
                category: "pronunciation",
                difficulty: "advanced",
                duration: 8,
                instructions: [
                    { step: 1, text: "Break down each twister into syllables" },
                    { step: 2, text: "Practice each one separately" },
                    { step: 3, text: "Try saying them at full speed" },
                    { step: 4, text: "Record all five without mistakes" }
                ],
                practiceText: "The sixth sick sheikh's sixth sheep's sick. Irish wristwatch, Swiss wristwatch. Pad kid poured curd pulled cod. Unique New York, you know you need unique New York. Red leather, yellow leather, repeat rapidly.",
                targetMetrics: { minClarity: 80, maxFillerWords: 0 },
                tags: ["articulation", "pronunciation", "challenge", "advanced"]
            },
            {
                title: "Alliteration Practice",
                description: "Perfect your consonant sounds with alliterative phrases",
                category: "pronunciation",
                difficulty: "intermediate",
                duration: 6,
                instructions: [
                    { step: 1, text: "Focus on the repeating consonant sound" },
                    { step: 2, text: "Exaggerate the sound while practicing" },
                    { step: 3, text: "Maintain consistent rhythm" },
                    { step: 4, text: "Record with clear enunciation" }
                ],
                practiceText: "Betty Botter bought some butter, but she said the butter's bitter. Silly Sally swiftly shooed seven silly sheep. Fred fed Ted bread and Ted fed Fred bread.",
                targetMetrics: { minClarity: 75 },
                tags: ["articulation", "pronunciation", "consonants"]
            },
            {
                title: "News Anchor Practice",
                description: "Read news articles with professional clarity and pace",
                category: "fluency",
                difficulty: "intermediate",
                duration: 10,
                instructions: [
                    { step: 1, text: "Find a news article (300-500 words)" },
                    { step: 2, text: "Read silently first to understand the content" },
                    { step: 3, text: "Read aloud as if presenting on TV" },
                    { step: 4, text: "Aim for 150-170 words per minute" }
                ],
                targetMetrics: { minClarity: 75, targetPace: { min: 150, max: 170 } },
                tags: ["professional", "fluency", "clarity"]
            },
            {
                title: "Pause Practice",
                description: "Replace filler words with intentional pauses",
                category: "filler-words",
                difficulty: "intermediate",
                duration: 8,
                instructions: [
                    { step: 1, text: "Choose a topic to speak about for 2 minutes" },
                    { step: 2, text: "Each time you want to say 'um' or 'like', pause instead" },
                    { step: 3, text: "Use pauses for emphasis and thinking" },
                    { step: 4, text: "Count your filler words - aim for zero!" }
                ],
                practiceText: "Speak about your favorite hobby, a recent movie you watched, or your plans for the weekend. Focus on eliminating all filler words.",
                targetMetrics: { maxFillerWords: 2 },
                tags: ["filler-words", "confidence", "advanced"]
            },
            {
                title: "Breathing & Vocal Warm-up",
                description: "Daily exercises to strengthen your speaking voice",
                category: "confidence",
                difficulty: "beginner",
                duration: 5,
                instructions: [
                    { step: 1, text: "Stand up straight with relaxed shoulders" },
                    { step: 2, text: "Take 5 deep breaths: inhale for 4, hold for 4, exhale for 4" },
                    { step: 3, text: "Hum at different pitches for 2 minutes" },
                    { step: 4, text: "Practice projecting your voice: 'Hello, everyone!'" }
                ],
                practiceText: "Good morning everyone! I'm excited to share my thoughts with you today. Speaking clearly and confidently is a skill that improves with practice.",
                tags: ["warmup", "daily", "foundation"]
            },
            {
                title: "Storytelling in 60 Seconds",
                description: "Practice concise and engaging storytelling",
                category: "fluency",
                difficulty: "advanced",
                duration: 10,
                instructions: [
                    { step: 1, text: "Pick a personal story or experience" },
                    { step: 2, text: "Plan beginning, middle, and end" },
                    { step: 3, text: "Tell the complete story in exactly 60 seconds" },
                    { step: 4, text: "Practice until it feels natural and engaging" }
                ],
                practiceText: "Tell a story about: a funny mishap, your first day at work/school, a memorable trip, or an important life lesson you learned.",
                targetMetrics: { minClarity: 70, maxFillerWords: 3 },
                tags: ["storytelling", "timing", "engagement"]
            },
            {
                title: "Metronome Speaking",
                description: "Control your pace with rhythm exercises",
                category: "pacing",
                difficulty: "intermediate",
                duration: 12,
                instructions: [
                    { step: 1, text: "Set a metronome to 60 BPM" },
                    { step: 2, text: "Speak one syllable per beat" },
                    { step: 3, text: "Gradually increase to 120 BPM" },
                    { step: 4, text: "Practice maintaining steady rhythm" }
                ],
                practiceText: "The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs. How vexingly quick daft zebras jump!",
                targetMetrics: { targetPace: { min: 140, max: 160 } },
                tags: ["pacing", "rhythm", "control"]
            },
            {
                title: "Vowel Clarity Exercise",
                description: "Improve vowel pronunciation and mouth positioning",
                category: "articulation",
                difficulty: "beginner",
                duration: 7,
                instructions: [
                    { step: 1, text: "Practice each vowel sound separately: A, E, I, O, U" },
                    { step: 2, text: "Exaggerate mouth movements" },
                    { step: 3, text: "Say words emphasizing different vowels" },
                    { step: 4, text: "Record and listen for clarity" }
                ],
                practiceText: "The cat sat on the mat. Pete meets Steve at the street. I like to ride my bike. Go slow over the old road. Cute puppy runs up the sunny summer day.",
                targetMetrics: { minClarity: 75 },
                tags: ["vowels", "articulation", "basics"]
            },
            {
                title: "Public Speaking Opener",
                description: "Practice delivering a compelling speech introduction",
                category: "confidence",
                difficulty: "intermediate",
                duration: 8,
                instructions: [
                    { step: 1, text: "Write a 30-second introduction about yourself" },
                    { step: 2, text: "Include: name, passion, and one interesting fact" },
                    { step: 3, text: "Practice with strong eye contact (imagine audience)" },
                    { step: 4, text: "Deliver with enthusiasm and confidence" }
                ],
                practiceText: "Good morning! My name is [Your Name], and I'm passionate about [Your Interest]. Today, I want to share something that changed my perspective on [Topic]. Let me tell you why this matters.",
                targetMetrics: { minClarity: 75, minFluency: 70 },
                tags: ["confidence", "public-speaking", "introduction"]
            }
        ];

        // Clear existing exercises
        await Exercise.deleteMany({});
        
        // Insert new exercises
        const insertedExercises = await Exercise.insertMany(exercises);
        
        res.json({ 
            success: true, 
            message: `Successfully seeded ${insertedExercises.length} exercises`,
            data: insertedExercises
        });
    } catch (error) {
        console.error('Error seeding exercises:', error);
        res.status(500).json({ success: false, message: 'Failed to seed exercises', error: error.message });
    }
});

/**
 * @route   GET /api/practice-hub/recommendations
 * @desc    Get personalized exercise recommendations
 * @access  Private
 */
router.get('/recommendations', auth, async (req, res) => {
    try {
        const recommendations = await practiceHubService.getPersonalizedExercises(req.user._id);
        res.json({ success: true, data: recommendations });
    } catch (error) {
        console.error('Error fetching recommendations:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch recommendations', error: error.message });
    }
});

/**
 * @route   GET /api/practice-hub/daily-challenge
 * @desc    Get today's daily challenge
 * @access  Private
 */
router.get('/daily-challenge', auth, async (req, res) => {
    try {
        const challenge = await practiceHubService.getDailyChallenge(req.user._id);
        res.json({ success: true, data: challenge });
    } catch (error) {
        console.error('Error fetching daily challenge:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch daily challenge', error: error.message });
    }
});

/**
 * @route   POST /api/practice-hub/complete-exercise
 * @desc    Record exercise completion
 * @access  Private
 */
router.post('/complete-exercise', auth, async (req, res) => {
    try {
        console.log('🎯 Complete exercise request received');
        console.log('   - User ID:', req.user._id);
        console.log('   - Request body:', req.body);
        
        const { exerciseId, exerciseTitle, exerciseCategory, performance, analysisReportId } = req.body;
        
        if (!performance) {
            console.log('❌ Missing performance data');
            return res.status(400).json({ 
                success: false, 
                message: 'Performance data is required' 
            });
        }

        console.log('✅ Starting exercise completion recording...');
        
        // exerciseId can be a real MongoDB ObjectId or a generated string for daily challenges
        const result = await practiceHubService.recordExerciseCompletion(
            req.user._id,
            exerciseId || 'practice-session',
            performance,
            analysisReportId,  // Link to the full analysis report
            exerciseCategory   // Pass category for skill level updates
        );
        
        console.log('✅ Exercise completion recorded successfully!');
        res.json({ success: true, data: result });
    } catch (error) {
        console.error('❌ Error recording exercise completion:', error);
        res.status(500).json({ success: false, message: 'Failed to record completion', error: error.message });
    }
});

/**
 * @route   GET /api/practice-hub/progress
 * @desc    Get user's progress and stats
 * @access  Private
 */
router.get('/progress', auth, async (req, res) => {
    try {
        let progress = await UserProgress.findOne({ userId: req.user._id });
        
        if (!progress) {
            // Create initial progress record
            progress = new UserProgress({ 
                userId: req.user._id,
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
            await progress.save();
        }

        res.json({ success: true, data: progress });
    } catch (error) {
        console.error('Error fetching progress:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch progress', error: error.message });
    }
});

/**
 * @route   GET /api/practice-hub/exercises
 * @desc    Get all available exercises (with optional filtering)
 * @access  Private
 */
router.get('/exercises', auth, async (req, res) => {
    try {
        const { category, difficulty, limit = 20 } = req.query;
        
        const query = { isActive: true };
        if (category) query.category = category;
        if (difficulty) query.difficulty = difficulty;

        const exercises = await Exercise.find(query).limit(parseInt(limit));
        
        res.json({ success: true, data: exercises, count: exercises.length });
    } catch (error) {
        console.error('Error fetching exercises:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch exercises', error: error.message });
    }
});

/**
 * @route   GET /api/practice-hub/exercises/:id
 * @desc    Get a specific exercise by ID
 * @access  Private
 */
router.get('/exercises/:id', auth, async (req, res) => {
    try {
        const exercise = await Exercise.findById(req.params.id);
        
        if (!exercise) {
            return res.status(404).json({ success: false, message: 'Exercise not found' });
        }

        res.json({ success: true, data: exercise });
    } catch (error) {
        console.error('Error fetching exercise:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch exercise', error: error.message });
    }
});

/**
 * @route   GET /api/practice-hub/stats
 * @desc    Get user's statistics summary
 * @access  Private
 */
router.get('/stats', auth, async (req, res) => {
    try {
        const progress = await UserProgress.findOne({ userId: req.user._id });
        
        if (!progress) {
            return res.json({ 
                success: true, 
                data: {
                    totalExercises: 0,
                    currentStreak: 0,
                    longestStreak: 0,
                    totalAchievements: 0,
                    averageSkillLevel: 0
                }
            });
        }

        const avgSkillLevel = Math.round(
            (progress.skillLevels.pronunciation + 
             progress.skillLevels.fluency + 
             progress.skillLevels.pacing + 
             progress.skillLevels.confidence + 
             progress.skillLevels.vocabulary) / 5
        );

        const stats = {
            totalExercises: progress.completedExercises.length,
            currentStreak: progress.dailyStreak.current,
            longestStreak: progress.dailyStreak.longest,
            totalAchievements: progress.achievements.length,
            averageSkillLevel: avgSkillLevel,
            skillLevels: progress.skillLevels,
            recentAchievements: progress.achievements.slice(-5).reverse()
        };

        res.json({ success: true, data: stats });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch stats', error: error.message });
    }
});

module.exports = router;
