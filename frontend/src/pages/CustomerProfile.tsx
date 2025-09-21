import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/api';
import Layout from '../components/Layout';
import ArtistDashboard from '../components/ArtistDashboard';

interface ProfileFormData {
  fullName: string;
  age: string;
  location: string;
  skills: string;
  experienceLevel: string;
}

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  fullName?: string;
  age?: number;
  location?: string;
  skills?: string;
  experienceLevel?: string;
  profileCompleted?: boolean;
  aiProfileSummary?: string;
  favorites?: any[];
}

const CustomerProfile: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Debug: Log user data to see what we're getting
  console.log('CustomerProfile - User data:', user);
  console.log('CustomerProfile - User type:', user?.userType);
  
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [aiSummary, setAiSummary] = useState('');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const [formData, setFormData] = useState<ProfileFormData>({
    fullName: '',
    age: '',
    location: '',
    skills: '',
    experienceLevel: 'Beginner'
  });

  const experienceLevels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

  useEffect(() => {
    if (user) {
      loadUserProfile();
    }
  }, [user]);

  const loadUserProfile = async () => {
    try {
      setLoadingProfile(true);
      console.log('Loading user profile...');
      console.log('Token in localStorage:', localStorage.getItem('token'));
      
      // Use getProfile (which hits /auth/me) since it definitely works
      const response = await authAPI.getProfile();
      console.log('Profile response:', response);
      
      const profileData = response.data;
      setUserProfile(profileData);
      
      console.log('Profile data loaded:', profileData);
      console.log('Profile completed status:', profileData.profileCompleted);
      
      if (profileData.profileCompleted) {
        console.log('Profile is completed, setting states...');
        setShowSummary(false);
        setIsEditing(false);
        setAiSummary(profileData.aiProfileSummary || 'Profile completed successfully!');
      } else {
        console.log('Profile not completed, showing form...');
        setIsEditing(true);
        setFormData({
          fullName: profileData.fullName || '',
          age: profileData.age?.toString() || '',
          location: profileData.location || '',
          skills: profileData.skills || '',
          experienceLevel: profileData.experienceLevel || 'Beginner'
        });
      }
    } catch (error: any) {
      console.error('Error loading profile:', error);
      toast.error('Failed to load profile data: ' + (error.message || 'Unknown error'));
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const generateAISummary = async (profileData: any) => {
    try {
      setGeneratingAI(true);
      
      // Generate AI summary based on profile data
      const aiPrompt = `Generate a personalized art recommendation summary for a user with the following profile:
      Name: ${profileData.fullName}
      Age: ${profileData.age}
      Location: ${profileData.location}
      Skills: ${profileData.skills}
      Experience Level: ${profileData.experienceLevel}
      
      Create a friendly, personalized summary that recommends art styles, suggests artisan types to follow, and mentions specific art forms they might enjoy based on their skills and experience level.`;

      // For now, create a mock AI summary (you can integrate with real AI later)
      const mockSummary = `Welcome ${profileData.fullName}! Based on your ${profileData.experienceLevel.toLowerCase()} experience level and skills in ${profileData.skills}, we recommend exploring traditional crafts and contemporary art pieces. Your location in ${profileData.location} gives you access to unique cultural art forms. We suggest following artisans who specialize in techniques that complement your interests, and exploring both local and international art pieces that match your ${profileData.experienceLevel.toLowerCase()} appreciation level.`;

      setAiSummary(mockSummary);
      return mockSummary;
    } catch (error) {
      console.error('Error generating AI summary:', error);
      const fallbackSummary = `Welcome ${profileData.fullName}! Your profile has been saved successfully. Explore our curated collection of artworks and connect with talented artisans.`;
      setAiSummary(fallbackSummary);
      return fallbackSummary;
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submitted with data:', formData);
    
    if (!formData.fullName || !formData.age || !formData.skills) {
      console.log('Validation failed. Missing fields:', {
        fullName: !formData.fullName,
        age: !formData.age,
        skills: !formData.skills
      });
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      toast.loading('Saving your profile...', { id: 'profile-save' });

      const profileData = {
        ...formData,
        age: parseInt(formData.age)
      };

      // Generate AI summary
      const aiSummaryText = await generateAISummary(profileData);

      // Save profile with AI summary
      const updateData = {
        ...profileData,
        aiProfileSummary: aiSummaryText
      };

      console.log('Sending profile update with cleaned data (before request):', updateData);
      const response = await authAPI.updateProfile(updateData as any);
      console.log('Profile update response:', response);
      
      if (response.success) {
        console.log('Profile saved successfully, response data:', response.data);
        
        // Reload the profile to get the updated data
        await loadUserProfile();
        
        toast.success('Profile saved successfully!', { id: 'profile-save' });
        
        // Reset editing state to show the account view
        setIsEditing(false);
        setShowSummary(false);
      }
    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast.error(error.message || 'Failed to save profile', { id: 'profile-save' });
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    toast('You can complete your profile anytime from your account settings');
    navigate('/');
  };

  const testProfileUpdate = async () => {
    try {
      console.log('Testing profile update...');
      const testData = {
        fullName: 'Test Name',
        age: 25,
        location: 'Test Location',
        skills: 'Test Skills',
        experienceLevel: 'Beginner'
      };
      
      const response = await authAPI.updateProfile(testData);
      console.log('Test response:', response);
      toast.success('Test profile update successful!');
    } catch (error: any) {
      console.error('Test error:', error);
      toast.error('Test failed: ' + (error.message || 'Unknown error'));
    }
  };

  if (loadingProfile) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your profile...</p>
          </div>
        </div>
      </Layout>
    );
  }

  console.log('Rendering logic check:');
  console.log('userProfile?.profileCompleted:', userProfile?.profileCompleted);
  console.log('isEditing:', isEditing);
  console.log('loading:', loading);
  console.log('generatingAI:', generatingAI);
  console.log('Should show account view:', userProfile?.profileCompleted && !isEditing && !loading && !generatingAI);

  // If profile is completed and user is not editing, show account view
  if (userProfile?.profileCompleted && !isEditing && !loading && !generatingAI) {
    return (
      <Layout>
        <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Your Profile</h1>
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setShowSummary(false);
                    setFormData({
                      fullName: userProfile.fullName || '',
                      age: userProfile.age?.toString() || '',
                      location: userProfile.location || '',
                      skills: userProfile.skills || '',
                      experienceLevel: userProfile.experienceLevel || 'Beginner'
                    });
                  }}
                  className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors"
                >
                  Edit Profile
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">Personal Information</h3>
                  <div className="space-y-3">
                    <p><span className="font-medium">Name:</span> {userProfile.fullName || userProfile.name}</p>
                    <p><span className="font-medium">Email:</span> {userProfile.email}</p>
                    <p><span className="font-medium">Age:</span> {userProfile.age}</p>
                    <p><span className="font-medium">Location:</span> {userProfile.location}</p>
                    <p><span className="font-medium">Experience Level:</span> {userProfile.experienceLevel}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">Skills & Interests</h3>
                  <p className="text-gray-600">{userProfile.skills}</p>
                </div>
              </div>
              
              {userProfile.aiProfileSummary && (
                <div className="mt-8 p-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">AI Recommendations</h3>
                  <p className="text-gray-700">{userProfile.aiProfileSummary}</p>
                </div>
              )}
              
              <div className="mt-8 flex space-x-4">
                <button
                  onClick={() => setShowSummary(false)}
                  className="bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700 transition-colors"
                >
                  Edit Profile
                </button>
                <Link
                  to="/"
                  className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Debug: Check user data */}
      {console.log('Debug - User data:', user)}
      {console.log('Debug - User type:', user?.userType)}
      
      {/* Show Artist Dashboard for artists, Customer Profile for customers */}
      {user?.userType === 'artisan' ? (
        <ArtistDashboard />
      ) : (
        <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="w-24 h-24 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"/>
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-800 via-orange-700 to-red-800 mb-4">
              Your Art Profile
            </h1>
            <p className="text-xl text-gray-600">
              Tell us about yourself to get personalized art recommendations
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Profile Form */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Personal Information</h2>
              
              {/* Debug button */}
              <button
                type="button"
                onClick={testProfileUpdate}
                className="mb-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Test Profile Update
              </button>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-2">
                    Age *
                  </label>
                  <input
                    id="age"
                    name="age"
                    type="number"
                    required
                    min="13"
                    max="120"
                    value={formData.age}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="Enter your age"
                  />
                </div>

                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    id="location"
                    name="location"
                    type="text"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="City, Country"
                  />
                </div>

                <div>
                  <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-2">
                    Your Skills & Talents *
                  </label>
                  <textarea
                    id="skills"
                    name="skills"
                    required
                    rows={3}
                    value={formData.skills}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                    placeholder="Describe your artistic skills, hobbies, or talents..."
                  />
                </div>

                <div>
                  <label htmlFor="experienceLevel" className="block text-sm font-medium text-gray-700 mb-2">
                    Art Experience Level
                  </label>
                  <select
                    id="experienceLevel"
                    name="experienceLevel"
                    value={formData.experienceLevel}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  >
                    {experienceLevels.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>

                <div className="flex space-x-4">
                  <button
                    type="submit"
                    disabled={loading || generatingAI}
                    className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 text-white py-4 px-6 rounded-lg font-semibold hover:from-amber-700 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Saving...' : generatingAI ? 'Generating AI Summary...' : 'Save Profile'}
                  </button>
                  
                  {userProfile?.profileCompleted ? (
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-6 py-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSkip}
                      className="px-6 py-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Skip
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* AI Summary Display */}
            <div className="space-y-6">
              <div className={`bg-gradient-to-br from-amber-100 via-orange-100 to-red-100 rounded-2xl p-8 shadow-xl transition-all duration-500 ${showSummary ? 'opacity-100' : 'opacity-50'}`}>
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">AI Profile Summary</h3>
                </div>
                
                {showSummary ? (
                  <div className="space-y-4">
                    <p className="text-gray-700 leading-relaxed">{aiSummary}</p>
                    <div className="flex space-x-4 pt-4">
                      <Link 
                        to="/"
                        className="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-amber-700 hover:to-orange-700 transition-all"
                      >
                        Explore ArtisanHub
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                      </svg>
                    </div>
                    <p className="text-gray-600">Fill out your profile to get personalized art recommendations powered by AI</p>
                  </div>
                )}
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"/>
                      </svg>
                    </div>
                    <h4 className="font-bold text-gray-800">Favorites</h4>
                    <p className="text-2xl font-bold text-blue-600">{userProfile?.favorites?.length || 0}</p>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                    </div>
                    <h4 className="font-bold text-gray-800">Profile</h4>
                    <p className="text-2xl font-bold text-green-600">
                      {userProfile?.profileCompleted ? '✓' : '○'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}
    </Layout>
  );
};

export default CustomerProfile;