import React, { useState, useEffect } from 'react';
import { Camera, Mail, User, MapPin, Phone, Calendar, Award, TrendingUp, Activity } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import api from '../../utils/api';
import Button from '../common/Button';
import Input from '../common/Input';
import Card from '../common/Card';
import LoadingSpinner from '../common/LoadingSpinner';

const ProfilePage = () => {
  const { user, updateUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(user?.avatar || null);
  const [toastMessage, setToastMessage] = useState(null);
  const [stats, setStats] = useState({
    totalSessions: 0,
    averageScore: 0,
    improvementRate: 0,
    totalPracticeTime: 0
  });

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    location: user?.location || '',
    bio: user?.bio || '',
  });

  useEffect(() => {
    fetchUserStats();
  }, []);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const fetchUserStats = async () => {
    try {
      const response = await api.get('/auth/profile/stats');
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setToastMessage({ type: 'error', message: 'Image size should be less than 5MB' });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const updateData = { ...formData };
      if (profileImage) {
        updateData.avatar = profileImage;
      }

      const response = await api.put('/auth/profile', updateData);
      
      // Update the user in the auth store
      if (updateUser) {
        updateUser(response.data.user);
      }

      setToastMessage({ type: 'success', message: 'Profile updated successfully!' });
      setIsEditing(false);
      setProfileImage(null);
    } catch (error) {
      setToastMessage({ type: 'error', message: error.response?.data?.message || 'Failed to update profile' });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FAFF] to-[#EEF2FF] dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            My Profile
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your account settings and view your progress
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <div className="flex flex-col items-center">
                {/* Profile Picture */}
                <div className="relative mb-4">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-[#F8FAFF]0 to-[#2A3A7A] flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>{getInitials(user?.name)}</span>
                    )}
                  </div>
                  
                  {isEditing && (
                    <label className="absolute bottom-0 right-0 bg-[#1FB6A6] hover:bg-primary-700 text-white p-2 rounded-full cursor-pointer shadow-lg transition-colors">
                      <Camera className="w-5 h-5" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {user?.name}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {user?.email}
                </p>

                {user?.provider && (
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 mb-4">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Connected via {user.provider.charAt(0).toUpperCase() + user.provider.slice(1)}
                  </div>
                )}

                <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Member since {formatDate(user?.createdAt)}
                </div>
              </div>
            </Card>

            {/* Stats Cards */}
            <div className="mt-6 space-y-4">
              <Card className="p-4 bg-gradient-to-br from-[#F8FAFF]0 to-[#2A3A7A] text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Practice Sessions</p>
                    <p className="text-3xl font-bold">{stats.totalSessions}</p>
                  </div>
                  <Activity className="w-10 h-10 opacity-80" />
                </div>
              </Card>

              <Card className="p-4 bg-gradient-to-br from-green-500 to-emerald-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Average Score</p>
                    <p className="text-3xl font-bold">{stats.averageScore}%</p>
                  </div>
                  <Award className="w-10 h-10 opacity-80" />
                </div>
              </Card>

              <Card className="p-4 bg-gradient-to-br from-[#EEF2FF]0 to-pink-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Improvement Rate</p>
                    <p className="text-3xl font-bold">+{stats.improvementRate}%</p>
                  </div>
                  <TrendingUp className="w-10 h-10 opacity-80" />
                </div>
              </Card>
            </div>
          </div>

          {/* Profile Information */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Personal Information
                </h3>
                {!isEditing ? (
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="outline"
                  >
                    Edit Profile
                  </Button>
                ) : (
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => {
                        setIsEditing(false);
                        setFormData({
                          name: user?.name || '',
                          email: user?.email || '',
                          phone: user?.phone || '',
                          location: user?.location || '',
                          bio: user?.bio || '',
                        });
                        setImagePreview(user?.avatar || null);
                        setProfileImage(null);
                      }}
                      variant="outline"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={isLoading}
                    >
                      {isLoading ? <LoadingSpinner size="small" /> : 'Save Changes'}
                    </Button>
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Full Name
                  </label>
                  {isEditing ? (
                    <Input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      {user?.name}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email Address
                  </label>
                  <p className="text-gray-900 dark:text-white px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    {user?.email}
                    <span className="ml-2 text-xs text-gray-500">(Cannot be changed)</span>
                  </p>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Phone className="w-4 h-4 inline mr-2" />
                    Phone Number
                  </label>
                  {isEditing ? (
                    <Input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Enter your phone number"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      {user?.phone || 'Not provided'}
                    </p>
                  )}
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    Location
                  </label>
                  {isEditing ? (
                    <Input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="Enter your location"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      {user?.location || 'Not provided'}
                    </p>
                  )}
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    About Me
                  </label>
                  {isEditing ? (
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      placeholder="Tell us about yourself..."
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg min-h-[100px]">
                      {user?.bio || 'No bio added yet'}
                    </p>
                  )}
                </div>
              </form>
            </Card>
          </div>
        </div>

        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
            <div className={`px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 ${
              toastMessage.type === 'success' 
                ? 'bg-green-500 text-white' 
                : 'bg-red-500 text-white'
            }`}>
              {toastMessage.type === 'success' ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              <span className="font-medium">{toastMessage.message}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
