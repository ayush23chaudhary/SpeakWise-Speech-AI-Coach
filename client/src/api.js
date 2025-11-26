import axios from 'axios';

// Use Vite's import.meta.env instead of process.env (Vite environment variables)
// In development, use the proxy (just '/api'), in production use full URL
const SERVER_BASE = import.meta.env.VITE_API_URL || '/api';

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
