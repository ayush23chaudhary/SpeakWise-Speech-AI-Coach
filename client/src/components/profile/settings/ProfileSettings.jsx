// client/src/components/profile/settings/ProfileSettings.jsx
import React, { useState } from 'react';
import api from '../../../utils/api';
import toast from 'react-hot-toast';
import OnboardingSettings from '../OnboardingSettings';

const ProfileSettings = ({ user, updateUser }) => {
  const [activeSection, setActiveSection] = useState('personal');
  const [loading, setLoading] = useState(false);

  // Personal Info
  const [personalInfo, setPersonalInfo] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    location: user?.location || '',
    bio: user?.bio || '',
    avatar: user?.avatar || '',
    coverPhoto: user?.coverPhoto || ''
  });

  // Preferences
  const [preferences, setPreferences] = useState({
    theme: user?.preferences?.theme || 'auto',
    language: user?.preferences?.language || 'en',
    accentPreference: user?.preferences?.accentPreference || 'neutral',
    difficultyLevel: user?.preferences?.difficultyLevel || 'beginner',
    focusAreas: user?.preferences?.focusAreas || [],
    notificationsEnabled: user?.preferences?.notificationsEnabled ?? true,
    reminderTime: user?.preferences?.reminderTime || '09:00',
    timezone: user?.preferences?.timezone || 'UTC'
  });

  // Privacy Settings
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: user?.privacySettings?.profileVisibility || 'public',
    showStats: user?.privacySettings?.showStats ?? true,
    showBadges: user?.privacySettings?.showBadges ?? true
  });

  // Social Links
  const [socialLinks, setSocialLinks] = useState({
    linkedin: user?.socialLinks?.linkedin || '',
    twitter: user?.socialLinks?.twitter || '',
    website: user?.socialLinks?.website || ''
  });

  const savePersonalInfo = async () => {
    try {
      setLoading(true);
      const response = await api.put('/auth/profile', personalInfo);
      updateUser(response.data.user);
      toast.success('Personal info updated successfully!');
    } catch (error) {
      console.error('Error updating personal info:', error);
      toast.error('Failed to update personal info');
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    try {
      setLoading(true);
      const response = await api.put('/auth/profile/preferences', { preferences });
      updateUser(response.data.user);
      toast.success('Preferences updated successfully!');
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast.error('Failed to update preferences');
    } finally {
      setLoading(false);
    }
  };

  const savePrivacySettings = async () => {
    try {
      setLoading(true);
      const response = await api.put('/auth/profile/preferences', { privacySettings });
      updateUser(response.data.user);
      toast.success('Privacy settings updated successfully!');
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      toast.error('Failed to update privacy settings');
    } finally {
      setLoading(false);
    }
  };

  const saveSocialLinks = async () => {
    try {
      setLoading(true);
      const response = await api.put('/auth/profile/preferences', { socialLinks });
      updateUser(response.data.user);
      toast.success('Social links updated successfully!');
    } catch (error) {
      console.error('Error updating social links:', error);
      toast.error('Failed to update social links');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === 'avatar') {
        setPersonalInfo({ ...personalInfo, avatar: reader.result });
      } else {
        setPersonalInfo({ ...personalInfo, coverPhoto: reader.result });
      }
    };
    reader.readAsDataURL(file);
  };

  const toggleFocusArea = (area) => {
    setPreferences(prev => ({
      ...prev,
      focusAreas: prev.focusAreas.includes(area)
        ? prev.focusAreas.filter(a => a !== area)
        : [...prev.focusAreas, area]
    }));
  };

  const sections = [
    { id: 'personal', label: 'Personal Info', icon: '👤' },
    { id: 'communication', label: 'Communication', icon: '🎯' },
    { id: 'preferences', label: 'Preferences', icon: '⚙️' },
    { id: 'privacy', label: 'Privacy', icon: '🔒' },
    { id: 'social', label: 'Social Links', icon: '🔗' }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Sidebar */}
      <div className="lg:col-span-1">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 space-y-2">
          {sections.map(section => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                activeSection === section.id
                  ? 'bg-[#1E2A5A] text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <span className="mr-2">{section.icon}</span>
              {section.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="lg:col-span-3">
        {activeSection === 'personal' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Personal Information</h3>

            {/* Avatar Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Profile Picture
              </label>
              <div className="flex items-center space-x-4">
                {personalInfo.avatar ? (
                  <img
                    src={personalInfo.avatar}
                    alt="Avatar"
                    className="h-20 w-20 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-full bg-[#EEF2FF] flex items-center justify-center text-2xl">
                    {personalInfo.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'avatar')}
                  className="text-sm"
                />
              </div>
            </div>

            {/* Cover Photo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Cover Photo
              </label>
              <div className="space-y-2">
                {personalInfo.coverPhoto && (
                  <img
                    src={personalInfo.coverPhoto}
                    alt="Cover"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'cover')}
                  className="text-sm"
                />
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Name
              </label>
              <input
                type="text"
                value={personalInfo.name}
                onChange={(e) => setPersonalInfo({ ...personalInfo, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Email (read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                value={personalInfo.email}
                disabled
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={personalInfo.phone}
                onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Location
              </label>
              <input
                type="text"
                value={personalInfo.location}
                onChange={(e) => setPersonalInfo({ ...personalInfo, location: e.target.value })}
                placeholder="City, Country"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Bio
              </label>
              <textarea
                value={personalInfo.bio}
                onChange={(e) => setPersonalInfo({ ...personalInfo, bio: e.target.value })}
                rows="4"
                maxLength="500"
                placeholder="Tell us about yourself..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <p className="text-sm text-gray-500 mt-1">{personalInfo.bio.length}/500</p>
            </div>

            <button
              onClick={savePersonalInfo}
              disabled={loading}
              className="w-full px-4 py-2 bg-[#1E2A5A] text-white rounded-lg hover:bg-[#2A3A7A] disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}

        {/* Communication Preferences Section */}
        {activeSection === 'communication' && (
          <div className="lg:col-span-3">
            <OnboardingSettings />
          </div>
        )}

        {activeSection === 'preferences' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Preferences</h3>

            {/* Theme */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Theme
              </label>
              <select
                value={preferences.theme}
                onChange={(e) => setPreferences({ ...preferences, theme: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto</option>
              </select>
            </div>

            {/* Accent Preference */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Accent Preference
              </label>
              <select
                value={preferences.accentPreference}
                onChange={(e) => setPreferences({ ...preferences, accentPreference: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="neutral">Neutral</option>
                <option value="american">American</option>
                <option value="british">British</option>
                <option value="australian">Australian</option>
              </select>
            </div>

            {/* Difficulty Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Difficulty Level
              </label>
              <select
                value={preferences.difficultyLevel}
                onChange={(e) => setPreferences({ ...preferences, difficultyLevel: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            {/* Focus Areas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Focus Areas
              </label>
              <div className="grid grid-cols-2 gap-2">
                {['pronunciation', 'fluency', 'vocabulary', 'grammar', 'confidence', 'business', 'casual', 'presentations'].map(area => (
                  <button
                    key={area}
                    onClick={() => toggleFocusArea(area)}
                    className={`px-3 py-2 rounded-lg capitalize transition-colors ${
                      preferences.focusAreas.includes(area)
                        ? 'bg-[#1E2A5A] text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {area}
                  </button>
                ))}
              </div>
            </div>

            {/* Notifications */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Enable Notifications
              </label>
              <button
                onClick={() => setPreferences({ ...preferences, notificationsEnabled: !preferences.notificationsEnabled })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.notificationsEnabled ? 'bg-[#1E2A5A]' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Reminder Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Daily Reminder Time
              </label>
              <input
                type="time"
                value={preferences.reminderTime}
                onChange={(e) => setPreferences({ ...preferences, reminderTime: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <button
              onClick={savePreferences}
              disabled={loading}
              className="w-full px-4 py-2 bg-[#1E2A5A] text-white rounded-lg hover:bg-[#2A3A7A] disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        )}

        {activeSection === 'privacy' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Privacy Settings</h3>

            {/* Profile Visibility */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Profile Visibility
              </label>
              <select
                value={privacySettings.profileVisibility}
                onChange={(e) => setPrivacySettings({ ...privacySettings, profileVisibility: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
                <option value="friends">Friends Only</option>
              </select>
              <p className="text-sm text-gray-500 mt-1">Control who can see your profile</p>
            </div>

            {/* Show Stats */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Show Statistics
                </label>
                <p className="text-sm text-gray-500">Display your progress stats on your profile</p>
              </div>
              <button
                onClick={() => setPrivacySettings({ ...privacySettings, showStats: !privacySettings.showStats })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  privacySettings.showStats ? 'bg-[#1E2A5A]' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    privacySettings.showStats ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Show Badges */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Show Badges
                </label>
                <p className="text-sm text-gray-500">Display your earned badges on your profile</p>
              </div>
              <button
                onClick={() => setPrivacySettings({ ...privacySettings, showBadges: !privacySettings.showBadges })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  privacySettings.showBadges ? 'bg-[#1E2A5A]' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    privacySettings.showBadges ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <button
              onClick={savePrivacySettings}
              disabled={loading}
              className="w-full px-4 py-2 bg-[#1E2A5A] text-white rounded-lg hover:bg-[#2A3A7A] disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Privacy Settings'}
            </button>
          </div>
        )}

        {activeSection === 'social' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Social Links</h3>

            {/* LinkedIn */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                LinkedIn
              </label>
              <input
                type="url"
                value={socialLinks.linkedin}
                onChange={(e) => setSocialLinks({ ...socialLinks, linkedin: e.target.value })}
                placeholder="https://linkedin.com/in/username"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Twitter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Twitter
              </label>
              <input
                type="url"
                value={socialLinks.twitter}
                onChange={(e) => setSocialLinks({ ...socialLinks, twitter: e.target.value })}
                placeholder="https://twitter.com/username"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Website */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Website
              </label>
              <input
                type="url"
                value={socialLinks.website}
                onChange={(e) => setSocialLinks({ ...socialLinks, website: e.target.value })}
                placeholder="https://yourwebsite.com"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <button
              onClick={saveSocialLinks}
              disabled={loading}
              className="w-full px-4 py-2 bg-[#1E2A5A] text-white rounded-lg hover:bg-[#2A3A7A] disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Social Links'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileSettings;
