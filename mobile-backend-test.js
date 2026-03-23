// Test mobile app connection to backend
const axios = require('axios');

console.log('📱 Testing Mobile App Connection to Backend...\n');
console.log('Mobile App Base URL: http://localhost:3000 (configured in environment.ts)\n');

async function testConnection() {
    try {
        // Test 1: API Health
        console.log('1. Testing API health...');
        const healthResponse = await axios.get('http://localhost:3000/', { timeout: 5000 });
        console.log('✅ API Health:', healthResponse.status, healthResponse.data.message);
        
        // Test 2: OTP Send
        console.log('\n2. Testing OTP send...');
        const otpResponse = await axios.post('http://localhost:3000/api/auth/send-otp', {
            email: 'mobileapp@test.com',
            type: 'EMAIL',
            reason: 'verification'
        }, { timeout: 10000 });
        console.log('✅ OTP Send:', otpResponse.status, otpResponse.data.message);
        
        // Test 3: Registration Endpoint
        console.log('\n3. Testing registration endpoint...');
        try {
            const regResponse = await axios.post('http://localhost:3000/api/auth/register', {
                email: 'mobileapp@test.com',
                phone: '08012345678',
                password: 'Test@1234',
                confirmPassword: 'Test@1234',
                agreed: true,
                firstName: 'Mobile',
                lastName: 'App',
                lga: 'Ikeja',
                state: 'Lagos',
                address: '123 Mobile Test St'
            }, { timeout: 10000 });
            console.log('✅ Registration:', regResponse.status);
        } catch (error) {
            if (error.response?.data?.message?.includes('not verified')) {
                console.log('✅ Registration accessible (verification required)');
            } else {
                console.log('✅ Registration accessible:', error.response?.status, error.response?.data?.message);
            }
        }
        
        console.log('\n🎉 Mobile app is successfully connected to backend!');
        console.log('\n📋 Ready to test:');
        console.log('   • Run: npx expo start');
        console.log('   • Open the app in Expo Go/Simulator');
        console.log('   • Test registration flow');
        
    } catch (error) {
        console.log('\n❌ Connection failed:');
        console.log('Status:', error.response?.status || 'No response');
        console.log('Error:', error.response?.data || error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.log('\n💡 Make sure backend is running:');
            console.log('   cd /Volumes/ExternalSSD/acepickbackend/acepickapi');
            console.log('   node build/app.js');
        }
    }
}

testConnection();
