// Test script to verify mobile app can connect to local backend
const axios = require('axios');

const API_BASE = 'https://acepickbackend.onrender.com';

async function testConnection() {
    console.log('🧪 Testing Mobile App Connection to Backend...\n');
    
    try {
        // Test 1: Basic API health check
        console.log('1. Testing API health...');
        const healthResponse = await axios.get(`${API_BASE}/`, { timeout: 5000 });
        console.log('✅ API is accessible:', healthResponse.status);
        
        // Test 2: OTP Send (Email)
        console.log('\n2. Testing OTP send (email)...');
        const otpData = {
            email: 'mobiletest3@example.com',
            type: 'EMAIL',
            reason: 'verification'
        };
        const otpResponse = await axios.post(`${API_BASE}/api/auth/send-otp`, otpData, { timeout: 10000 });
        console.log('✅ OTP send successful:', otpResponse.status);
        console.log('Response:', JSON.stringify(otpResponse.data, null, 2));
        
        // Test 3: OTP Verification
        console.log('\n3. Testing OTP verification...');
        const verifyData = {
            emailCode: { email: 'mobiletest3@example.com', code: '2995' } // Using actual OTP
        };
        const verifyResponse = await axios.post(`${API_BASE}/api/auth/verify-otp`, verifyData, { timeout: 10000 });
        console.log('✅ OTP verification successful:', verifyResponse.status);

        // Test 4: Registration endpoint availability
        console.log('\n4. Testing registration endpoint availability...');
        try {
            const regData = {
                email: 'mobiletest3@example.com',
                phone: '08098765432',
                password: 'Test@1234',
                confirmPassword: 'Test@1234',
                agreed: true,
                firstName: 'Mobile',
                lastName: 'Test',
                lga: 'Ikeja',
                state: 'Lagos',
                address: '123 Mobile Test St'
            };
            const regResponse = await axios.post(`${API_BASE}/api/auth/register`, regData, { timeout: 10000 });
            console.log('✅ Registration endpoint accessible:', regResponse.status);
        } catch (error) {
            if (error.response?.status === 404 && error.response?.data?.message?.includes('not verified')) {
                console.log('✅ Registration endpoint accessible (expected verification error)');
            } else {
                throw error;
            }
        }
        
        console.log('\n🎉 All connection tests passed!');
        console.log('📱 Mobile app should be able to connect to the backend.');
        
    } catch (error) {
        console.log('\n❌ Connection test failed:');
        console.log('Status:', error.response?.status || 'No response');
        console.log('Error:', error.response?.data || error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.log('\n💡 Make sure the backend API is running on https://acepickbackend.onrender.com');
            console.log('   Check the Render dashboard for deployment status');
        } else if (error.code === 'ERR_NETWORK') {
            console.log('\n💡 Network error - check if backend is running and accessible');
        }
    }
}

testConnection();
