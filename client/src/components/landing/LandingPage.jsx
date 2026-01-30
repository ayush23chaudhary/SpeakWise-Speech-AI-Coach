import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Mic, 
  TrendingUp, 
  Award, 
  BarChart3, 
  Target, 
  Zap,
  Menu,
  X,
  CheckCircle,
  ArrowRight,
  Briefcase,
  Users,
  BookOpen,
  Sparkles,
  Brain,
  LineChart,
  MessageCircle,
  PlayCircle
} from 'lucide-react';
import Button from '../common/Button';

const LandingPage = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: Mic,
      title: 'AI Speech Analysis',
      description: 'Real-time analysis of clarity, confidence, fluency, pace, tone, pronunciation, vocabulary, and grammar.',
      color: 'from-[#1FB6A6] to-[#17A293]',
      bgColor: 'bg-[#1FB6A6]/10'
    },
    {
      icon: Briefcase,
      title: 'AI Interview Practice',
      description: 'Mock interviews with AI-generated questions tailored to your job role. Get instant feedback on speech and content.',
      color: 'from-[#6C63FF] to-[#5A52E8]',
      bgColor: 'bg-[#6C63FF]/10'
    },
    {
      icon: Target,
      title: 'Journey Mode',
      description: 'Gamified learning path with 4 levels. Personalized tasks based on your goals and weak areas with AI-powered progression.',
      color: 'from-[#1FB6A6] to-[#17A293]',
      bgColor: 'bg-[#1FB6A6]/10'
    },
    {
      icon: Users,
      title: 'Practice Hub',
      description: 'Daily challenges and personalized exercises targeting your specific improvement areas with streak tracking.',
      color: 'from-[#1E2A5A] to-[#2A3A7A]',
      bgColor: 'bg-[#1E2A5A]/10'
    },
    {
      icon: BarChart3,
      title: 'Progress Tracking',
      description: 'Comprehensive analytics with skill radar charts, progress timelines, and practice heatmaps to visualize growth.',
      color: 'from-[#6C63FF] to-[#5A52E8]',
      bgColor: 'bg-[#6C63FF]/10'
    },
    {
      icon: Award,
      title: 'Achievement System',
      description: 'Earn badges and unlock achievements as you complete milestones. Track your streaks and celebrate wins.',
      color: 'from-[#1FB6A6] to-[#17A293]',
      bgColor: 'bg-[#1FB6A6]/10'
    },
    {
      icon: BookOpen,
      title: 'Community Hub',
      description: 'Access expert articles, tips, and speech techniques. Learn from curated content on interviewing and presentations.',
      color: 'from-[#1E2A5A] to-[#2A3A7A]',
      bgColor: 'bg-[#1E2A5A]/10'
    },
    {
      icon: Brain,
      title: 'Goal Setting',
      description: 'Set personalized goals (sessions, scores, streaks, skill improvement) and track automatic progress updates.',
      color: 'from-[#6C63FF] to-[#5A52E8]',
      bgColor: 'bg-[#6C63FF]/10'
    }
  ];

  const modes = [
    {
      icon: Sparkles,
      title: 'Journey Mode',
      description: 'Follow a structured 4-level path from Foundation Builder to Goal Master',
      features: ['AI-generated personalized tasks', 'Level-based progression', 'Skill improvement tracking']
    },
    {
      icon: Briefcase,
      title: 'Interview Mode',
      description: 'Practice with AI interviewer for technical, behavioral, and mixed interviews',
      features: ['Voice-enabled questions', 'Real-time transcription', 'Instant performance feedback']
    },
    {
      icon: PlayCircle,
      title: 'Performance Studio',
      description: 'Record and analyze your speech for any scenario or presentation',
      features: ['8 speech metrics analysis', 'Evaluator perception insights', 'Detailed recommendations']
    },
    {
      icon: Target,
      title: 'Practice Hub',
      description: 'Daily challenges and targeted exercises based on your weak areas',
      features: ['Personalized recommendations', 'Daily streak system', 'Skill level progression']
    }
  ];

  const stats = [
    { value: '95%', label: 'User Satisfaction' },
    { value: '24/7', label: 'Available' },
    { value: '100%', label: 'Free Forever' }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFF]">
      {/* Navbar */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-sm shadow-md' : 'bg-white/80 backdrop-blur-sm'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-[#1E2A5A] to-[#2A3A7A] rounded-lg flex items-center justify-center shadow-lg">
                <Mic className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-[#1E2A5A]">
                SpeakWise
              </span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-[#5A5A7A] hover:text-[#1E2A5A] transition-colors font-medium">
                Features
              </a>
              <a href="#modes" className="text-[#5A5A7A] hover:text-[#1E2A5A] transition-colors font-medium">
                Modes
              </a>
              <a href="#benefits" className="text-[#5A5A7A] hover:text-[#1E2A5A] transition-colors font-medium">
                Benefits
              </a>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/login')}
                className="border-[#6C63FF] text-[#6C63FF] hover:bg-[#6C63FF]/10"
              >
                Login
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/register')}
                className="bg-[#1FB6A6] hover:bg-[#17A293] text-white shadow-lg"
              >
                Get Started
              </Button>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-[#EEF2FF] transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-[#1E2A5A]" />
              ) : (
                <Menu className="w-6 h-6 text-[#1E2A5A]" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-[#EEF2FF] shadow-lg">
            <div className="px-4 py-4 space-y-3">
              <a 
                href="#features" 
                className="block py-2 text-[#5A5A7A] hover:text-[#1E2A5A] font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </a>
              <a 
                href="#modes" 
                className="block py-2 text-[#5A5A7A] hover:text-[#1E2A5A] font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Modes
              </a>
              <a 
                href="#benefits" 
                className="block py-2 text-[#5A5A7A] hover:text-[#1E2A5A] font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Benefits
              </a>
              <Button
                variant="primary"
                className="w-full bg-[#1FB6A6] hover:bg-[#17A293] text-white"
                onClick={() => navigate('/register')}
              >
                Get Started
              </Button>
              <Button
                variant="outline"
                className="w-full border-[#6C63FF] text-[#6C63FF] hover:bg-[#6C63FF]/10"
                onClick={() => navigate('/login')}
              >
                Login
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section - Deep gradient */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-br from-[#1E2A5A] via-[#2A3A7A] to-[#6C63FF]">
        {/* Background Decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#6C63FF] rounded-full mix-blend-overlay filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#1FB6A6] rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left space-y-8">
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                <Sparkles className="w-4 h-4 text-[#1FB6A6]" />
                <span className="text-sm font-medium text-white">
                  AI-Powered Speech Coach
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
                Master the Art of
                <span className="block text-[#1FB6A6]">
                  Effective Communication
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto lg:mx-0">
                Transform your speaking skills with AI-powered analysis, personalized feedback, and gamified learning. 
                Practice interviews, track progress, and achieve your communication goals.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => navigate('/register')}
                  className="group bg-[#1FB6A6] hover:bg-[#17A293] text-white shadow-lg"
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate('/guest')}
                  className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm"
                >
                  Try Demo
                </Button>
              </div>

              <div className="flex flex-wrap gap-6 justify-center lg:justify-start text-sm text-white/90">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-[#1FB6A6]" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-[#1FB6A6]" />
                  <span>Free forever</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-[#1FB6A6]" />
                  <span>AI-powered feedback</span>
                </div>
              </div>
            </div>

            {/* Right Content - Demo Card */}
            <div className="relative">
              <div className="relative rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-8 shadow-2xl">
                <div className="bg-white rounded-xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-[#1B1B1B]">Live Analysis</h3>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-[#1FB6A6] rounded-full animate-pulse"></div>
                      <span className="text-sm text-[#5A5A7A]">Active</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-[#5A5A7A]">Clarity</span>
                        <span className="font-semibold text-[#1FB6A6]">92%</span>
                      </div>
                      <div className="h-2 bg-[#EEF2FF] rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-[#1FB6A6] to-[#17A293] w-[92%] rounded-full"></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-[#5A5A7A]">Confidence</span>
                        <span className="font-semibold text-[#6C63FF]">88%</span>
                      </div>
                      <div className="h-2 bg-[#EEF2FF] rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-[#6C63FF] to-[#5A52E8] w-[88%] rounded-full"></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-[#5A5A7A]">Fluency</span>
                        <span className="font-semibold text-[#1FB6A6]">95%</span>
                      </div>
                      <div className="h-2 bg-[#EEF2FF] rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-[#1FB6A6] to-[#17A293] w-[95%] rounded-full"></div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#EEF2FF]">
                    <div className="flex items-center justify-center space-x-2 text-[#5A5A7A]">
                      <TrendingUp className="w-5 h-5 text-[#1FB6A6]" />
                      <span className="text-sm font-medium">+12% improvement this week</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating Badge */}
              <div className="absolute -top-4 -right-4 bg-white rounded-full p-4 shadow-lg border-4 border-[#6C63FF]/20">
                <Award className="w-8 h-8 text-[#6C63FF]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Very light purple/blue gradient */}
      <section id="features" className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#F8FAFF] via-[#F5F7FF] to-[#F0F4FF]">
        {/* Subtle decorative elements */}
        <div className="absolute inset-0 overflow-hidden opacity-30">
          <div className="absolute top-20 right-20 w-64 h-64 bg-[#6C63FF]/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-64 h-64 bg-[#1FB6A6]/5 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-[#1FB6A6]/20 rounded-full mb-4 shadow-sm">
              <Zap className="w-4 h-4 text-[#1FB6A6]" />
              <span className="text-sm font-medium text-[#1FB6A6]">Powerful Features</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1B1B1B] mb-4">
              Everything You Need to Excel
            </h2>
            <p className="text-lg text-[#5A5A7A] max-w-2xl mx-auto">
              Comprehensive AI-powered tools designed to transform you into a confident and effective communicator.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-white/80 backdrop-blur-sm rounded-xl p-6 border-2 border-white/60 hover:border-[#6C63FF]/30 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:bg-white"
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-lg flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-[#1B1B1B] mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-[#5A5A7A]">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modes Section - Light lavender/violet tint */}
      <section id="modes" className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#F0F4FF] via-[#EEF2FF] to-[#F8FAFF]">
        {/* Subtle decorative elements */}
        <div className="absolute inset-0 overflow-hidden opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#6C63FF]/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#1E2A5A]/5 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full mb-4 border border-[#6C63FF]/20 shadow-sm">
              <Brain className="w-4 h-4 text-[#6C63FF]" />
              <span className="text-sm font-medium text-[#6C63FF]">Practice Modes</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1B1B1B] mb-4">
              Choose Your Learning Path
            </h2>
            <p className="text-lg text-[#5A5A7A] max-w-2xl mx-auto">
              Four specialized modes designed to target different aspects of your communication journey.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {modes.map((mode, index) => (
              <div
                key={index}
                className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-white/60 hover:border-[#6C63FF]/30 hover:bg-white"
              >
                <div className="flex items-start space-x-4 mb-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#1E2A5A] to-[#2A3A7A] rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                    <mode.icon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-[#1B1B1B] mb-2">
                      {mode.title}
                    </h3>
                    <p className="text-[#5A5A7A]">
                      {mode.description}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3 ml-[72px]">
                  {mode.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-[#1FB6A6] flex-shrink-0" />
                      <span className="text-sm text-[#5A5A7A]">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits/Stats Section - Subtle off-white to pure white gradient */}
      <section id="benefits" className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#F8FAFF] to-white">
        {/* Very subtle decorative elements */}
        <div className="absolute inset-0 overflow-hidden opacity-10">
          <div className="absolute top-1/3 right-1/3 w-80 h-80 bg-[#1FB6A6]/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/3 left-1/3 w-80 h-80 bg-[#6C63FF]/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="relative rounded-3xl bg-gradient-to-br from-[#1E2A5A] via-[#2A3A7A] to-[#6C63FF] p-8 sm:p-12 lg:p-16 shadow-2xl overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-32 -translate-y-32"></div>
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-white rounded-full translate-x-32 translate-y-32"></div>
            </div>

            <div className="relative z-10">
              <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                  Trusted by Speakers Worldwide
                </h2>
                <p className="text-lg text-white/80 max-w-2xl mx-auto">
                  Join thousands of users improving their communication skills every day with SpeakWise.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all">
                    <div className="text-5xl sm:text-6xl font-bold text-white mb-2">
                      {stat.value}
                    </div>
                    <div className="text-xl font-semibold text-white/80">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#F8FAFF]">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-[#1FB6A6]/10 rounded-full mb-6">
            <MessageCircle className="w-4 h-4 text-[#1FB6A6]" />
            <span className="text-sm font-medium text-[#1FB6A6]">Start Your Journey Today</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold text-[#1B1B1B] mb-6">
            Ready to Transform Your Speaking Skills?
          </h2>
          <p className="text-lg text-[#5A5A7A] mb-8 max-w-2xl mx-auto">
            Join SpeakWise today and unlock the power of AI-driven speech coaching. Practice interviews, 
            track your progress, and become the confident speaker you've always wanted to be.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button
              variant="primary"
              size="xl"
              onClick={() => navigate('/register')}
              className="group bg-[#1FB6A6] hover:bg-[#17A293] text-white shadow-xl"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              variant="outline"
              size="xl"
              onClick={() => navigate('/login')}
              className="border-2 border-[#6C63FF] text-[#6C63FF] hover:bg-[#6C63FF]/10"
            >
              Sign In
            </Button>
          </div>

          <div className="flex flex-wrap gap-4 justify-center text-sm text-[#5A5A7A]">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-[#1FB6A6]" />
              <span>8 Speech Metrics</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-[#1FB6A6]" />
              <span>AI-Generated Interviews</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-[#1FB6A6]" />
              <span>Personalized Tasks</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-[#1FB6A6]" />
              <span>Progress Tracking</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-[#EEF2FF] bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-[#1E2A5A] to-[#2A3A7A] rounded-lg flex items-center justify-center shadow-md">
                <Mic className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-[#1E2A5A]">
                SpeakWise
              </span>
            </div>
            <div className="text-sm text-[#5A5A7A]">
              © 2026 SpeakWise. All rights reserved.
            </div>
            <div className="flex items-center space-x-6 text-sm text-[#5A5A7A]">
              <a href="#" className="hover:text-[#1FB6A6] transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-[#1FB6A6] transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-[#1FB6A6] transition-colors">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
