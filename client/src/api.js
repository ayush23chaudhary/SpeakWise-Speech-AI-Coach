import axios from 'axios';

// Use environment variable for API URL (falls back to localhost:5001 for development)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const SERVER_BASE = `${API_BASE_URL}/api`;

// console.log('🔗 API Configuration:', {
//   VITE_API_URL: import.meta.env.VITE_API_URL,
//   API_BASE_URL: API_BASE_URL,
//   SERVER_BASE: SERVER_BASE,
//   mode: import.meta.env.MODE
// });

export const analyzeAudio = async (audioBlob, token, evaluationMode = 'interview') => {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'speech-audio.webm');
  formData.append('evaluationMode', evaluationMode); // Add evaluation mode

  const config = {
    headers: {
      'Content-Type': 'multipart/form-data',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    // Optional: onUploadProgress
  };

  const url = `${SERVER_BASE}/speech/analyze`;
  const response = await axios.post(url, formData, config);
  
  console.log('✅ API Response:', response.data);
  
  // Backend returns { success, message, data: {...analysisData} }
  // We need to extract the data property which contains the actual analysis
  return response.data.data || response.data.report || response.data;
};

export const submitFeedback = async (feedbackData, token = null) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };

  const url = `${SERVER_BASE}/feedback/submit`;
  const response = await axios.post(url, feedbackData, config);
  
  console.log(' Feedback Response:', response.data);
  
  return response.data;
};
