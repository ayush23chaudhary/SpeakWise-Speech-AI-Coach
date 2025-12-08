import axios from 'axios';

// Use environment variable for API URL (falls back to /api for development with proxy)
const API_BASE_URL = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL 
  : 'http://localhost:5001';

const SERVER_BASE = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api'; // Use proxy in development

console.log('🔗 API Configuration:', {
  VITE_API_URL: import.meta.env.VITE_API_URL,
  SERVER_BASE: SERVER_BASE,
  mode: import.meta.env.MODE
});

export const analyzeAudio = async (audioBlob, token) => {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'speech-audio.webm');

  const config = {
    headers: {
      'Content-Type': 'multipart/form-data',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    // Optional: onUploadProgress
  };

  const url = `${SERVER_BASE}/speech/analyze`;
  const response = await axios.post(url, formData, config);
  
  console.log('📊 API Response:', response.data);
  
  // Backend returns { success, message, data: {...analysisData} }
  // We need to extract the data property which contains the actual analysis
  return response.data.data || response.data.report || response.data;
};
