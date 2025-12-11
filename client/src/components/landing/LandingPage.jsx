import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Mic, 
  TrendingUp, 
  Award, 
  BarChart3, 
  Target, 
  Zap,
  ChevronRight,
  Menu,
  X,
  Moon,
  Sun
} from 'lucide-react';
import Button from '../common/Button';

const LandingPage = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    // Check for dark mode preference
    const isDark = localStorage.getItem('theme') === 'dark' || 
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    }

    // Handle scroll for navbar transparency
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const features = [
    {
      icon: Mic,
      title: 'Real-Time Speech Analysis',
      description: 'Get instant feedback on your speaking performance with AI-powered analysis of clarity, pace, and tone.',
      color: 'from-blue-500 to-primary-600'
    },
    {
      icon: TrendingUp,
      title: 'Track Your Progress',
      description: 'Monitor your improvement over time with detailed analytics and personalized insights.',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Award,
      title: 'Personalized Exercises',
      description: 'Access tailored practice exercises designed to target your specific areas for improvement.',
      color: 'from-green-500 to-emerald-600'
    },
    {
      icon: BarChart3,
      title: 'Detailed Metrics',
      description: 'Analyze key speaking metrics including fluency, filler words, and confidence levels.',
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: Target,
      title: 'Goal Setting',
      description: 'Set personal speaking goals and track your journey to becoming a confident speaker.',
      color: 'from-cyan-500 to-blue-600'
    },
    {
      icon: Zap,
      title: 'AI-Powered Feedback',
      description: 'Receive intelligent recommendations powered by advanced AI to enhance your speaking skills.',
      color: 'from-yellow-500 to-orange-500'
    }
  ];

  const benefits = [
    {
      stat: '95%',
      label: 'Improvement Rate',
      description: 'Users see measurable improvement within 30 days'
    },
    {
      stat: '24/7',
      label: 'AI Coach Available',
      description: 'Practice anytime, anywhere with instant feedback'
    },
    {
      stat: '100%',
      label: 'Free Forever',
      description: 'All features available at no cost'
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200 relative overflow-hidden">
      {/* Wind Effect - Flowing gradient waves */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Multiple wind layers */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(59, 130, 246, 0.3) 25%, rgba(234, 179, 8, 0.3) 50%, rgba(147, 51, 234, 0.3) 75%, transparent 100%)',
            backgroundSize: '200% 100%',
            animation: 'wind-flow 15s linear infinite'
          }}
        ></div>
        <div 
          className="absolute inset-0 opacity-15"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(234, 179, 8, 0.4) 20%, rgba(59, 130, 246, 0.4) 40%, rgba(147, 51, 234, 0.4) 60%, rgba(234, 179, 8, 0.4) 80%, transparent 100%)',
            backgroundSize: '300% 100%',
            animation: 'wind-flow 20s linear infinite reverse'
          }}
        ></div>
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(147, 51, 234, 0.5) 30%, rgba(234, 179, 8, 0.5) 50%, rgba(59, 130, 246, 0.5) 70%, transparent 100%)',
            backgroundSize: '250% 100%',
            animation: 'wind-flow 25s linear infinite'
          }}
        ></div>
        
        {/* Diagonal wind streaks */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            background: 'linear-gradient(120deg, transparent 0%, rgba(59, 130, 246, 0.4) 30%, transparent 40%, rgba(234, 179, 8, 0.4) 60%, transparent 70%, rgba(147, 51, 234, 0.4) 85%, transparent 100%)',
            backgroundSize: '300% 300%',
            animation: 'wind-diagonal 18s linear infinite'
          }}
        ></div>
      </div>
      
      {/* Navbar */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-md' 
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center shadow-lg">
                <Mic className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
                SpeakWise
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <a href="#features" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                Features
              </a>
              <a href="#benefits" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                Benefits
              </a>
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Toggle dark mode"
              >
                {darkMode ? <Sun className="w-5 h-5 text-gray-300" /> : <Moon className="w-5 h-5 text-gray-700" />}
              </button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/login')}
              >
                Login
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/register')}
              >
                Sign Up Free
              </Button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center space-x-2">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {darkMode ? <Sun className="w-5 h-5 text-gray-300" /> : <Moon className="w-5 h-5 text-gray-700" />}
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                ) : (
                  <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-gray-900 border-t dark:border-gray-800 shadow-lg">
            <div className="px-4 py-4 space-y-3">
              <a 
                href="#features" 
                className="block py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </a>
              <a 
                href="#benefits" 
                className="block py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
                onClick={() => setMobileMenuOpen(false)}
              >
                Benefits
              </a>
              <Button
                variant="outline"
                className="w-full border-2 border-yellow-400 dark:border-yellow-500 hover:border-yellow-500 dark:hover:border-yellow-400 group"
                onClick={() => navigate('/guest')}
              >
                <Zap className="w-5 h-5 mr-2 text-yellow-500" />
                Try Demo - No Signup
              </Button>
              <Button
                variant="primary"
                className="w-full"
                onClick={() => navigate('/register')}
              >
                Sign Up Free
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate('/login')}
              >
                Login
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Animated Background Gradients */}
        <div className="absolute inset-0 -z-10">
          {/* Flowing gradient orbs */}
          <div 
            className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-30"
            style={{
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.8), rgba(147, 51, 234, 0.8))',
              animation: 'gradient-float 8s ease-in-out infinite'
            }}
          ></div>
          <div 
            className="absolute top-1/4 left-0 w-[500px] h-[500px] rounded-full blur-3xl opacity-25"
            style={{
              background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.6), rgba(251, 146, 60, 0.6))',
              animation: 'gradient-float 10s ease-in-out infinite reverse'
            }}
          ></div>
          <div 
            className="absolute bottom-0 left-1/3 w-96 h-96 rounded-full blur-3xl opacity-30"
            style={{
              background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.7), rgba(219, 39, 119, 0.7))',
              animation: 'gradient-float 12s ease-in-out infinite'
            }}
          ></div>
          
          {/* Animated gradient mesh */}
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              background: 'linear-gradient(45deg, transparent 30%, rgba(59, 130, 246, 0.1) 50%, transparent 70%), linear-gradient(-45deg, transparent 30%, rgba(234, 179, 8, 0.1) 50%, transparent 70%)',
              backgroundSize: '200% 200%',
              animation: 'gradient-mesh 15s ease infinite'
            }}
          ></div>
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left column - Text content */}
            <div className="text-center lg:text-left space-y-8">
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-50 dark:bg-primary-900/20 rounded-full border border-primary-200 dark:border-primary-800">
                <Zap className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
                  AI-Powered Speech Coach
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
                Master Your
                <span className="block bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                  Speaking Skills
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto lg:mx-0">
                Transform your communication with AI-powered speech analysis. Get real-time feedback, 
                track your progress, and become the confident speaker you've always wanted to be.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                {/* Try Demo - Primary CTA */}
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => navigate('/guest')}
                  className="group relative overflow-hidden bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 shadow-lg shadow-yellow-400/50 hover:shadow-yellow-500/50 border-0"
                >
                  <span className="relative z-10 flex items-center font-semibold">
                    <Zap className="w-5 h-5 mr-2 animate-pulse" />
                    Try Free Demo
                    <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Button>
                
                {/* Sign Up - Secondary CTA */}
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => navigate('/register')}
                  className="group"
                >
                  Get Started Free
                  <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                
                {/* Login - Tertiary */}
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate('/login')}
                  className="hidden sm:inline-flex"
                >
                  Login
                </Button>
              </div>

              <div className="flex flex-col gap-3">
                {/* Demo Badge - Most prominent */}
                <div className="inline-flex items-center justify-center lg:justify-start">
                  <div className="px-5 py-3 bg-gradient-to-r from-yellow-400/30 to-orange-400/30 border-2 border-yellow-400 dark:border-yellow-500 rounded-full backdrop-blur-sm shadow-lg animate-pulse">
                    <span className="text-base font-bold text-gray-900 dark:text-white flex items-center">
                      <Zap className="w-5 h-5 mr-2 text-yellow-600 dark:text-yellow-400" />
                      Try Demo FREE – No Signup Required!
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-6 justify-center lg:justify-start text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>100% Free Forever</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>AI-Powered Analysis</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right column - Visual element */}
            <div className="relative">
              <div 
                className="relative rounded-2xl p-8 shadow-2xl transform hover:scale-105 transition-transform duration-300"
                style={{
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 1), rgba(147, 51, 234, 0.9), rgba(234, 179, 8, 0.8))',
                  backgroundSize: '200% 200%',
                  animation: 'gradient-flow 6s ease infinite'
                }}
              >
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 space-y-4">
                  {/* Mock analysis interface */}
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Speech Analysis</h3>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Recording</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700 dark:text-gray-300">Clarity</span>
                        <span className="font-semibold text-primary-600 dark:text-primary-400">92%</span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-primary-500 to-primary-600 w-[92%] rounded-full animate-pulse"></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700 dark:text-gray-300">Fluency</span>
                        <span className="font-semibold text-purple-600 dark:text-purple-400">88%</span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-purple-500 to-purple-600 w-[88%] rounded-full animate-pulse"></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700 dark:text-gray-300">Confidence</span>
                        <span className="font-semibold text-green-600 dark:text-green-400">95%</span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-green-500 to-green-600 w-[95%] rounded-full animate-pulse"></div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t dark:border-gray-700">
                    <div className="flex items-center justify-center space-x-2 text-gray-700 dark:text-gray-300">
                      <TrendingUp className="w-5 h-5 text-green-500" />
                      <span className="text-sm font-medium">+12% improvement this week</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg animate-bounce-slow">
                <Award className="w-12 h-12 text-white" />
              </div>
              <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-lg animate-pulse-slow">
                <Target className="w-10 h-10 text-white" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-800/50 overflow-hidden">
        {/* Background gradients for features section */}
        <div className="absolute inset-0 -z-10">
          <div 
            className="absolute top-20 right-10 w-72 h-72 rounded-full blur-3xl opacity-20"
            style={{
              background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.6), rgba(251, 146, 60, 0.6))',
              animation: 'gradient-float 9s ease-in-out infinite'
            }}
          ></div>
          <div 
            className="absolute bottom-20 left-10 w-80 h-80 rounded-full blur-3xl opacity-20"
            style={{
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.6), rgba(147, 51, 234, 0.6))',
              animation: 'gradient-float 11s ease-in-out infinite reverse'
            }}
          ></div>
        </div>
        
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Powerful Features for
              <span className="block bg-gradient-to-r from-yellow-500 via-primary-600 to-purple-600 bg-clip-text text-transparent">
                Speaking Excellence
              </span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Everything you need to become a confident and effective speaker, powered by cutting-edge AI technology.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
              >
                <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits/Stats Section */}
      <section id="benefits" className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background gradient orbs */}
        <div className="absolute inset-0 -z-10">
          <div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-3xl opacity-20"
            style={{
              background: 'radial-gradient(circle, rgba(234, 179, 8, 0.4), rgba(59, 130, 246, 0.3), rgba(147, 51, 234, 0.4))',
              animation: 'gradient-pulse 8s ease-in-out infinite'
            }}
          ></div>
        </div>
        
        <div className="max-w-7xl mx-auto">
          <div 
            className="relative rounded-3xl p-8 sm:p-12 lg:p-16 shadow-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.95), rgba(147, 51, 234, 0.95), rgba(234, 179, 8, 0.85))',
              backgroundSize: '200% 200%',
              animation: 'gradient-flow 8s ease infinite'
            }}
          >
            {/* Animated overlay */}
            <div 
              className="absolute inset-0 opacity-30"
              style={{
                background: 'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%)',
                backgroundSize: '200% 200%',
                animation: 'gradient-mesh 10s ease infinite'
              }}
            ></div>
            
            <div className="relative text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Join Thousands of Successful Speakers
              </h2>
              <p className="text-lg text-primary-100 max-w-2xl mx-auto">
                Our users are seeing real results and transforming their communication skills every day.
              </p>
            </div>

            <div className="relative grid md:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="text-center backdrop-blur-sm bg-white/10 rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
                  <div className="text-5xl sm:text-6xl font-bold text-white mb-2">
                    {benefit.stat}
                  </div>
                  <div className="text-xl font-semibold text-white mb-2">
                    {benefit.label}
                  </div>
                  <div className="text-white/90">
                    {benefit.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-primary-50/30 dark:from-gray-800/50 dark:to-primary-900/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Ready to Transform Your Speaking Skills?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Start your journey to becoming a confident and effective speaker today. 
            Join thousands improving their communication skills with AI-powered feedback.
          </p>
          
          <div className="flex flex-col gap-6">
            {/* Primary CTA - Try Demo */}
            <div className="flex justify-center">
              <Button
                variant="primary"
                size="xl"
                onClick={() => navigate('/guest')}
                className="group relative overflow-hidden bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 shadow-xl shadow-yellow-400/50 hover:shadow-yellow-500/60 border-0 px-8"
              >
                <span className="relative z-10 flex items-center font-bold text-lg">
                  <Zap className="w-6 h-6 mr-2 animate-pulse" />
                  Try Free Demo Now
                  <ChevronRight className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
            </div>
            
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <span className="w-16 h-px bg-gray-300 dark:bg-gray-600"></span>
              <span>or</span>
              <span className="w-16 h-px bg-gray-300 dark:bg-gray-600"></span>
            </div>
            
            {/* Secondary CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="primary"
                size="xl"
                onClick={() => navigate('/register')}
                className="group"
              >
                Create Free Account
                <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                variant="outline"
                size="xl"
                onClick={() => navigate('/login')}
              >
                I Already Have an Account
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t dark:border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center">
                <Mic className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">SpeakWise</span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              © 2025 SpeakWise. All rights reserved.
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
              <a href="#" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
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
