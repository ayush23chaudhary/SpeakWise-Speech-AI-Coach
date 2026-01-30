import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Users, 
  TrendingUp, 
  Heart, 
  MessageCircle, 
  Share2,
  Search,
  Filter,
  Clock,
  Eye,
  Bookmark,
  ArrowLeft,
  ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Community = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [bookmarkedArticles, setBookmarkedArticles] = useState([]);

  // Seed articles with research-based content
  const articles = [
    {
      id: 1,
      title: "The Power of Pausing: Mastering Strategic Silence",
      author: "Dr. Sarah Johnson",
      category: "technique",
      readTime: "5 min",
      views: 2340,
      likes: 156,
      comments: 23,
      date: "2026-01-25",
      image: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&q=80",
      excerpt: "Learn how strategic pauses can transform your speaking presence and help you command attention in any conversation.",
      content: `
## The Art of Strategic Silence

Research shows that effective speakers use pauses for three critical purposes:

### 1. Emphasis and Impact
Pausing before or after a key point gives your audience time to absorb important information. A well-placed pause can make your message up to 40% more memorable.

### 2. Reducing Filler Words
When you feel the urge to say "um" or "uh," pause instead. This creates a professional impression and gives you time to gather your thoughts.

### 3. Building Anticipation
Master speakers use pauses to create dramatic tension. Steve Jobs was famous for his strategic silences during product launches.

## Practical Exercise
Try the "3-Second Rule": After making an important point, count to three before continuing. This feels longer than it is but dramatically improves retention.

### Key Takeaways:
- Pause for 2-3 seconds after important points
- Replace filler words with brief silences
- Use pauses to signal transitions between topics
- Practice with recordings to find your natural rhythm
      `,
      tags: ["pausing", "technique", "confidence"],
      resources: [
        { title: "TED Talk: The Power of Silence", url: "#" },
        { title: "Research Paper: Pause Patterns in Effective Communication", url: "#" }
      ]
    },
    {
      id: 2,
      title: "Eliminating Filler Words: A 30-Day Challenge",
      author: "Michael Chen",
      category: "practice",
      readTime: "7 min",
      views: 1890,
      likes: 142,
      comments: 31,
      date: "2026-01-23",
      image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80",
      excerpt: "A structured approach to reducing 'um,' 'uh,' and 'like' from your speech in just 30 days.",
      content: `
## The Filler Word Phenomenon

Studies show that the average person uses 15-20 filler words per minute. While some fillers are natural, excessive use can undermine your credibility.

### Why We Use Filler Words
1. **Processing Time**: Our brain needs time to formulate thoughts
2. **Anxiety**: Nervousness triggers verbal crutches
3. **Habit**: Repeated patterns become automatic

### The 30-Day Challenge

#### Week 1: Awareness
- Record yourself daily for 2 minutes
- Count your filler words
- Identify your most common fillers

#### Week 2: Substitution
- Replace fillers with brief pauses
- Practice the "breath method" - breathe when you feel a filler coming
- Use transition phrases instead

#### Week 3: Practice
- Join a speaking group or practice with friends
- Give 5-minute presentations daily
- Get feedback on your progress

#### Week 4: Refinement
- Focus on high-pressure situations
- Practice impromptu speaking
- Celebrate your progress

## Pro Tips
- **The Awareness Band**: Wear a rubber band and snap it gently when you catch yourself using fillers
- **Video Practice**: Record video calls to see your progress
- **Mindful Speaking**: Slow down by 10-15% - most filler words disappear naturally

### Success Metrics
- Week 1: Baseline (15-20 fillers/min typical)
- Week 2: Reduce by 30%
- Week 3: Reduce by 60%
- Week 4: Maintain 5-7 fillers/min or less
      `,
      tags: ["filler-words", "practice", "challenge"],
      resources: [
        { title: "Filler Word Tracker App", url: "#" },
        { title: "Public Speaking Practice Groups", url: "#" }
      ]
    },
    {
      id: 3,
      title: "Voice Modulation: The Secret to Captivating Storytelling",
      author: "Emma Rodriguez",
      category: "technique",
      readTime: "6 min",
      views: 2105,
      likes: 189,
      comments: 27,
      date: "2026-01-20",
      image: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&q=80",
      excerpt: "Discover how varying your pitch, tone, and volume can make your stories unforgettable.",
      content: `
## The Music of Speech

Your voice is an instrument. Professional speakers use these techniques to keep audiences engaged:

### The Three Pillars of Voice Modulation

#### 1. Pitch Variation
- **High Pitch**: Excitement, questions, enthusiasm
- **Low Pitch**: Authority, seriousness, importance
- **Practice**: Record yourself reading children's books with different character voices

#### 2. Volume Control
- **Loud**: Emphasis, excitement, calls to action
- **Soft**: Intimacy, secrets, building suspense
- **The Whisper Technique**: Dropping to a near-whisper forces audience attention

#### 3. Speed & Rhythm
- **Fast**: Energy, excitement, urgency
- **Slow**: Importance, drama, emotional weight
- **Variable**: Natural conversation, engaging storytelling

### The Storytelling Framework

1. **The Hook** (Fast, excited tone): "Have you ever wondered why..."
2. **The Setup** (Moderate pace): "Research shows that..."
3. **The Tension** (Slow down, lower pitch): "But here's what most people miss..."
4. **The Resolution** (Vary dramatically): "The answer is..."

### Daily Practice Routine (10 minutes)
- **Minutes 0-3**: Vocal warm-ups (humming, scales)
- **Minutes 3-6**: Read news headlines with exaggerated emotion
- **Minutes 6-10**: Tell a 2-minute story three different ways

### Common Mistakes to Avoid
❌ Monotone delivery (same pitch throughout)
❌ Talking too fast when nervous
❌ Inconsistent volume (mumbling then shouting)
❌ Ignoring punctuation in written speeches

✅ Practice with emotion-rich content
✅ Record and analyze your patterns
✅ Study great speakers (Martin Luther King Jr., Maya Angelou)
      `,
      tags: ["voice", "storytelling", "modulation"],
      resources: [
        { title: "Voice Training Exercises", url: "#" },
        { title: "Famous Speeches Analyzed", url: "#" }
      ]
    },
    {
      id: 4,
      title: "The Science of First Impressions: 7 Seconds to Impact",
      author: "Dr. James Mitchell",
      category: "psychology",
      readTime: "8 min",
      views: 3210,
      likes: 245,
      comments: 42,
      date: "2026-01-18",
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80",
      excerpt: "Understanding the psychology behind first impressions and how your voice shapes perception.",
      content: `
## The 7-Second Window

Research by Princeton psychologists shows that we form lasting impressions in just 7 seconds. Your voice plays a crucial role.

### What Your Voice Reveals

#### Warmth (55% of first impression)
- Friendly, approachable tone
- Genuine smile (yes, people can hear it!)
- Positive energy in your greeting

#### Competence (45% of first impression)
- Clear articulation
- Steady pace
- Confident volume

### The VOICE Framework

**V - Volume**: Speak loudly enough to be heard easily
**O - Openness**: Use an inviting, warm tone
**I - Inflection**: Vary your pitch to show enthusiasm
**C - Clarity**: Enunciate clearly
**E - Energy**: Match appropriate energy level to situation

### Practical Applications

#### Job Interviews
- **Opening**: "Thank you so much for this opportunity" (warm, enthusiastic)
- **Throughout**: Balanced confidence and humility
- **Closing**: Strong, memorable exit

#### Networking Events
- **Approach**: Friendly, open tone
- **Introduction**: Clear, confident name pronunciation
- **Conversation**: Active listening cues ("I see," "That's interesting")

#### Presentations
- **First 30 seconds**: High energy, clear voice
- **Hook the audience**: Personal story or surprising fact
- **Establish authority**: Confident but not arrogant

### The Recovery Strategy
If you start poorly:
1. **Pause and Reset**: Take a breath
2. **Acknowledge**: Simple "Let me start over" works
3. **Bring Energy**: Restart with more enthusiasm
4. **Move Forward**: Don't dwell on the mistake

### Practice Exercise: The Mirror Method
1. Stand in front of mirror
2. Introduce yourself 5 times
3. Try different:
   - Volumes (soft to loud)
   - Speeds (slow to fast)
   - Emotions (serious to excited)
4. Find your optimal combination
5. Record and review

### Scientific Insights
- Lower-pitched voices perceived as more authoritative (but don't force it!)
- Moderate speaking speed (145-160 words/minute) rated most trustworthy
- Vocal variety indicates intelligence and engagement
      `,
      tags: ["psychology", "first-impressions", "interviews"],
      resources: [
        { title: "Princeton First Impressions Study", url: "#" },
        { title: "Vocal Psychology Research Database", url: "#" }
      ]
    },
    {
      id: 5,
      title: "Breathing Techniques for Confident Public Speaking",
      author: "Lisa Thompson",
      category: "wellness",
      readTime: "5 min",
      views: 1567,
      likes: 123,
      comments: 18,
      date: "2026-01-15",
      image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80",
      excerpt: "Master the breathing techniques that professional speakers use to stay calm and powerful.",
      content: `
## The Foundation of Great Speaking: Breath

Professional singers and speakers know: breath control is everything. Here's why and how.

### The Science of Breath and Speech

#### Diaphragmatic Breathing
- **What**: Breathing from your belly, not chest
- **Why**: More air, better control, less tension
- **How**: Place hand on belly; it should rise more than chest

#### The Speaking Breath Cycle
1. **Inhale**: Quick, silent, through nose (1-2 seconds)
2. **Speak**: Controlled exhale (6-8 seconds)
3. **Pause**: Natural break for next breath
4. **Repeat**: Establish rhythm

### Pre-Speech Breathing Routine (5 minutes)

#### Box Breathing (2 minutes)
- Inhale: Count to 4
- Hold: Count to 4
- Exhale: Count to 4
- Hold: Count to 4
- Repeat 5 times

#### 4-7-8 Technique (2 minutes)
- Inhale through nose: Count to 4
- Hold breath: Count to 7
- Exhale through mouth: Count to 8
- Powerful for anxiety reduction

#### Dynamic Breathing (1 minute)
- Quick inhale, forceful exhale
- Energizes before speaking
- Releases tension

### During Your Speech

#### Strategic Breath Placement
✅ **DO breathe at**:
- Punctuation marks (periods, commas)
- Natural thought transitions
- Before important points

❌ **DON'T breathe**:
- Mid-sentence randomly
- During quick list items
- When rushing anxiously

### Common Breathing Mistakes

**Shallow Chest Breathing**
- Problem: Runs out of air quickly, sounds breathy
- Solution: Practice belly breathing daily

**Holding Breath When Nervous**
- Problem: Increases anxiety, shaky voice
- Solution: Consciously exhale before speaking

**Over-Breathing**
- Problem: Hyperventilation, light-headedness
- Solution: Regular rhythm, don't over-prepare with too many deep breaths

### The 21-Day Breath Mastery Plan

**Week 1: Foundation**
- 5 min daily diaphragmatic breathing
- Notice your natural breath patterns
- Practice breathing while reading aloud

**Week 2: Integration**
- Apply techniques to short talks (2-3 min)
- Record and listen for breath sounds
- Work on silent, smooth inhales

**Week 3: Performance**
- Use in real situations
- Maintain calm under pressure
- Perfect your pre-speech routine

### Emergency Techniques

**Before Speaking** (30 seconds):
1. Close eyes
2. Three deep belly breaths
3. Roll shoulders back
4. Smile

**During Speech Anxiety**:
1. Pause naturally
2. One deep breath
3. Continue with renewed energy

### Pro Tips from Voice Coaches
- **Morning Ritual**: 5 minutes of breathing practice
- **Physical Exercise**: Improves lung capacity
- **Posture Matters**: Stand/sit tall for optimal breathing
- **Stay Hydrated**: Dry throat = poor breath control
      `,
      tags: ["breathing", "wellness", "anxiety-management"],
      resources: [
        { title: "Breathing Exercise Videos", url: "#" },
        { title: "Guided Meditation for Speakers", url: "#" }
      ]
    },
    {
      id: 6,
      title: "Storytelling Frameworks: Captivate Any Audience",
      author: "Robert Williams",
      category: "storytelling",
      readTime: "9 min",
      views: 2876,
      likes: 201,
      comments: 35,
      date: "2026-01-12",
      image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80",
      excerpt: "Five proven storytelling frameworks that work in interviews, presentations, and conversations.",
      content: `
## Why Stories Win

Data shows people remember stories 22 times more than facts alone. Here are the frameworks top speakers use.

### Framework 1: The Hero's Journey (for long-form)

**Structure:**
1. **Ordinary World**: Set the scene
2. **Call to Adventure**: The challenge appears
3. **Obstacles**: Struggles and setbacks
4. **Transformation**: Learning and growth
5. **New World**: Success and lessons learned

**Best for**: Career stories, overcoming challenges, inspirational talks

**Example Opening**: "Five years ago, I was terrified of public speaking. Today, I'll share how I transformed that fear into my greatest strength..."

### Framework 2: STAR Method (for interviews)

**Structure:**
- **S - Situation**: Set the context
- **T - Task**: Define the challenge
- **A - Action**: Explain your approach
- **R - Result**: Share the outcome

**Best for**: Job interviews, competency questions

**Example**: "When our team lost our biggest client (Situation), I needed to restore team morale (Task). I organized daily stand-ups and created a win-tracking system (Action), resulting in three new clients within 60 days (Result)."

### Framework 3: Problem-Agitation-Solution

**Structure:**
1. **Problem**: Identify the pain point
2. **Agitation**: Make them feel the urgency
3. **Solution**: Present your answer

**Best for**: Sales pitches, persuasive presentations

**Example**: "Most people struggle with public speaking anxiety (Problem). This costs them promotions, opportunities, and confidence (Agitation). Our proven 3-step system eliminates that fear in 30 days (Solution)."

### Framework 4: The 3-Act Story

**Structure:**
- **Act 1**: Setup (25% of time)
- **Act 2**: Conflict (50% of time)
- **Act 3**: Resolution (25% of time)

**Best for**: Presentations, keynotes, TED talks

**Key Elements:**
- **Hook**: Grab attention in first 10 seconds
- **Stakes**: Make audience care about outcome
- **Payoff**: Deliver satisfying conclusion

### Framework 5: Before-After-Bridge

**Structure:**
1. **Before**: Describe the problem state
2. **After**: Paint the ideal outcome
3. **Bridge**: Show how to get there

**Best for**: Motivational talks, coaching, mentoring

**Example**: "I used to freeze during presentations (Before). Now I deliver speeches to audiences of 500+ people (After). The secret was systematic desensitization training (Bridge)."

### Storytelling Best Practices

#### Opening Hooks
- Personal anecdote
- Surprising statistic
- Provocative question
- Bold statement

#### Middle Content
- Use vivid details (senses, emotions)
- Include dialogue for authenticity
- Build tension naturally
- Show, don't just tell

#### Strong Closings
- Call to action
- Memorable quote
- Circle back to opening
- Leave them inspired

### The Power of Vulnerability

Research by Brené Brown shows authentic stories with vulnerability create deeper connections.

**Include:**
- Real struggles
- Honest emotions
- Lessons from failures
- Personal growth

**Avoid:**
- Fake humility
- Oversharing
- Victimhood
- Unresolved trauma

### Practice Exercise: Story Bank

Create your personal story collection:

1. **Career Stories** (3-5 stories)
   - Biggest win
   - Major failure
   - Leadership moment
   - Team success
   - Innovation example

2. **Personal Growth** (3-5 stories)
   - Overcoming fear
   - Learning experience
   - Relationship lesson
   - Character-building moment
   - Transformative event

3. **Fun/Light** (2-3 stories)
   - Funny mistake
   - Unexpected adventure
   - Quirky experience

### Delivery Tips

**Voice Variation:**
- Characters: Different voices
- Emotions: Match vocal tone
- Pacing: Speed up for excitement, slow for drama

**Body Language:**
- Use gestures for emphasis
- Make eye contact
- Move with purpose
- Show emotion facially

**Timing:**
- Pause before key revelations
- Build suspense gradually
- Don't rush the ending

### Common Storytelling Mistakes

❌ Too long (over 3-4 minutes for most contexts)
❌ No clear point or lesson
❌ Too many details
❌ Monotone delivery
❌ No emotional connection

✅ Concise and purposeful
✅ Clear takeaway
✅ Essential details only
✅ Dynamic delivery
✅ Authentic emotion

### Advanced Techniques

**The Callback**: Reference earlier story elements later
**The Twist**: Unexpected revelation changes perspective
**The Metaphor**: Use symbolic comparison
**The Parallel**: Connect to audience's experiences
      `,
      tags: ["storytelling", "frameworks", "presentation"],
      resources: [
        { title: "TED Talks Masterclass", url: "#" },
        { title: "Story Structure Templates", url: "#" }
      ]
    }
  ];

  const categories = [
    { id: 'all', label: 'All Articles', icon: BookOpen },
    { id: 'technique', label: 'Techniques', icon: TrendingUp },
    { id: 'practice', label: 'Practice Guides', icon: Users },
    { id: 'psychology', label: 'Psychology', icon: MessageCircle },
    { id: 'wellness', label: 'Wellness', icon: Heart },
    { id: 'storytelling', label: 'Storytelling', icon: BookOpen }
  ];

  const filteredArticles = articles.filter(article => {
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.tags.some(tag => tag.includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const toggleBookmark = (articleId) => {
    setBookmarkedArticles(prev => 
      prev.includes(articleId)
        ? prev.filter(id => id !== articleId)
        : [...prev, articleId]
    );
  };

  if (selectedArticle) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Back Button */}
          <button
            onClick={() => setSelectedArticle(null)}
            className="flex items-center gap-2 text-[#1E2A5A] dark:text-blue-400 hover:text-[#2A3A7A] dark:hover:text-blue-300 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Community
          </button>

          {/* Article Header */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-6">
            <img 
              src={selectedArticle.image} 
              alt={selectedArticle.title}
              className="w-full h-64 object-cover"
            />
            <div className="p-8">
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {selectedArticle.readTime}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {selectedArticle.views} views
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  {selectedArticle.likes} likes
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" />
                  {selectedArticle.comments} comments
                </span>
              </div>

              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {selectedArticle.title}
              </h1>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#F8FAFF]0 to-[#6C63FF] rounded-full flex items-center justify-center text-white font-bold">
                    {selectedArticle.author.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedArticle.author}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{selectedArticle.date}</p>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {selectedArticle.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-[#EEF2FF] dark:bg-blue-900/30 text-[#2A3A7A] dark:text-blue-300 rounded-full text-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Article Content */}
              <div className="prose dark:prose-invert max-w-none">
                <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {selectedArticle.content}
                </div>
              </div>

              {/* Resources */}
              {selectedArticle.resources && selectedArticle.resources.length > 0 && (
                <div className="mt-8 p-6 bg-[#F8FAFF] dark:bg-blue-900/20 rounded-lg">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <ExternalLink className="w-5 h-5" />
                    Additional Resources
                  </h3>
                  <ul className="space-y-2">
                    {selectedArticle.resources.map((resource, index) => (
                      <li key={index}>
                        <a
                          href={resource.url}
                          className="text-[#1E2A5A] dark:text-blue-400 hover:underline flex items-center gap-2"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {resource.title}
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-4 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button className="flex items-center gap-2 px-4 py-2 bg-[#1E2A5A] hover:bg-[#2A3A7A] text-white rounded-lg transition-colors">
                  <Heart className="w-4 h-4" />
                  Like
                </button>
                <button 
                  onClick={() => toggleBookmark(selectedArticle.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    bookmarkedArticles.includes(selectedArticle.id)
                      ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <Bookmark className="w-4 h-4" />
                  {bookmarkedArticles.includes(selectedArticle.id) ? 'Bookmarked' : 'Bookmark'}
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors">
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Community Hub 🌟
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Learn from expert tips, techniques, and insights from the speaking community
              </p>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search articles, tips, techniques..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-3 mb-8 overflow-x-auto pb-2">
          {categories.map(category => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-[#1E2A5A] text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {category.label}
              </button>
            );
          })}
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-[#1E2A5A] dark:text-blue-400">{articles.length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Articles</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {articles.reduce((sum, a) => sum + a.views, 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Views</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-[#6C63FF] dark:text-[#6C63FF]">
              {articles.reduce((sum, a) => sum + a.likes, 0)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Likes</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {articles.reduce((sum, a) => sum + a.comments, 0)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Comments</div>
          </div>
        </div>

        {/* Articles Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map(article => (
            <div
              key={article.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
              onClick={() => setSelectedArticle(article)}
            >
              <img 
                src={article.image} 
                alt={article.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-3 py-1 bg-[#EEF2FF] dark:bg-blue-900/30 text-[#2A3A7A] dark:text-blue-300 rounded-full text-xs font-medium capitalize">
                    {article.category}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {article.readTime}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                  {article.title}
                </h3>

                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                  {article.excerpt}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      {article.likes}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      {article.comments}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {article.views}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleBookmark(article.id);
                    }}
                    className={`p-2 rounded-lg transition-colors ${
                      bookmarkedArticles.includes(article.id)
                        ? 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30'
                        : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                    }`}
                  >
                    <Bookmark className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#F8FAFF]0 to-[#6C63FF] rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {article.author.charAt(0)}
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-gray-900 dark:text-white">{article.author}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{article.date}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredArticles.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              No articles found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your filters or search query
            </p>
          </div>
        )}

      </div>
    </div>
  );
};

export default Community;
