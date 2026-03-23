import axios from 'axios';
import { API_BASE_URL, sectorUrl } from 'utilizes/endpoints';

export const testConnection = async () => {
  console.log('🔧 Testing API connection...');
  console.log('📍 API_BASE_URL:', API_BASE_URL);
  console.log('📍 sectorUrl:', sectorUrl);
  
  try {
    // Test basic connectivity
    console.log('🌐 Testing basic connectivity...');
    const response = await axios.get(sectorUrl, { timeout: 5000 });
    console.log('✅ Connection successful!');
    console.log('📊 Response status:', response.status);
    console.log('📊 Data length:', response.data.data?.length || 0);
    return true;
  } catch (error: any) {
    console.log('❌ Connection failed!');
    console.log('🔍 Error type:', error.constructor.name);
    console.log('🔍 Error code:', error.code);
    console.log('🔍 Error message:', error.message);
    
    if (error.response) {
      console.log('📊 Response status:', error.response.status);
      console.log('📊 Response data:', error.response.data);
    } else if (error.request) {
      console.log('📡 Request made but no response received');
      console.log('📡 Request URL:', error.config?.url);
    } else {
      console.log('⚙️  Error setting up request');
    }
    
    return false;
  }
};

export const testMultipleEndpoints = async () => {
  const endpoints = [
    'https://acepickbackend.onrender.com/api/sectors',
    'http://localhost:3000/api/sectors',
    'http://127.0.0.1:3000/api/sectors', 
    'http://192.168.1.179:3000/api/sectors'
  ];
  
  console.log('🔧 Testing multiple endpoints...');
  
  for (const endpoint of endpoints) {
    try {
      console.log(`🌐 Testing ${endpoint}...`);
      const response = await axios.get(endpoint, { timeout: 3000 });
      console.log(`✅ ${endpoint} - SUCCESS (${response.data.data?.length || 0} sectors)`);
    } catch (error: any) {
      console.log(`❌ ${endpoint} - FAILED: ${error.message}`);
    }
  }
};
