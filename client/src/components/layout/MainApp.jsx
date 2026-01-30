import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import TabNavigation from './TabNavigation';
import NewDashboardHome from './NewDashboardHome';
import PerformanceStudio from '../studio/PerformanceStudio';
import AnalysisDashboard from '../analysis/AnalysisDashboard';
import ProgressTracker from '../progress/ProgressTracker';
import PracticeHub from '../practice/PracticeHub';
import InterviewSetup from '../interview/InterviewSetup';
import InterviewSession from '../interview/InterviewSession';
import InterviewReport from '../interview/InterviewReport';
import InterviewHistory from '../interview/InterviewHistory';
import JourneyMode from '../journey/JourneyMode';
import Community from '../community/Community';
import useThemeStore from '../../store/themeStore';

const MainApp = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const { isDark, setTheme } = useThemeStore();
  const location = useLocation();
  const navigate = useNavigate();

  // Initialize theme on app load
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Check for tab change from localStorage (set by Journey Mode)
  useEffect(() => {
    const savedTab = localStorage.getItem('activeTab');
    if (savedTab && location.pathname === '/dashboard') {
      setActiveTab(savedTab);
      localStorage.removeItem('activeTab'); // Clear after use
    }
  }, [location.pathname]);

  // Determine if we're on an interview or journey route (hide tabs)
  const isInterviewRoute = location.pathname.includes('/interview');
  const isJourneyRoute = location.pathname.includes('/journey');
  const hideTabNavigation = isInterviewRoute || isJourneyRoute;

  const handleAnalysisComplete = (analysisData) => {
    setCurrentAnalysis(analysisData);
    setActiveTab('analysis');
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'home':
        return <NewDashboardHome setActiveTab={setActiveTab} />;
      case 'studio':
        return <PerformanceStudio onAnalysisComplete={handleAnalysisComplete} />;
      case 'analysis':
        return <AnalysisDashboard analysisData={currentAnalysis} />;
      case 'progress':
        return <ProgressTracker />;
      case 'practice':
        return <PracticeHub />;
      default:
        return <NewDashboardHome setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
  {/* TabNavigation hidden as per request. Functionality remains active. */}
  {/* {!hideTabNavigation && <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />} */}
      <main>
        <Routes>
          {/* Journey Route */}
          <Route path="/journey" element={<JourneyMode />} />
          
          {/* Community Route */}
          <Route path="/community" element={<Community />} />
          
          {/* Interview Routes */}
          <Route path="/interview" element={<InterviewSetup />} />
          <Route path="/interview/:sessionId" element={<InterviewSession />} />
          <Route path="/interview/:sessionId/report" element={<InterviewReport />} />
          <Route path="/interview/history" element={<InterviewHistory />} />
          
          {/* Default Tab-based Navigation */}
          <Route path="/*" element={renderActiveTab()} />
        </Routes>
      </main>
    </div>
  );
};

export default MainApp;
