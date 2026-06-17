import React from 'react'
import { View, Text } from 'react-native'
import ProfessionalProfile from "@pages/dashboard/professionalProfilePages"
import { useLocalSearchParams, useRouter } from "expo-router"

const ProfessionalProfileLayout = () => {
    const params = useLocalSearchParams()
    const router = useRouter()
    
    // Get the id parameter from the route
    const id = params.id
    
    // Reject invalid IDs
    if (!id || id === '(chatcallmessage)' || isNaN(Number(id))) {
        console.log('🚨 Rejecting invalid id:', id)
        
        // Redirect to dashboard
        setTimeout(() => {
            router.replace('/(Authenticated)/(dashboard)/homelayout')
        }, 1000)
        
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'red' }}>Invalid Professional ID</Text>
                <Text style={{ marginTop: 10 }}>Redirecting to dashboard...</Text>
                <Text style={{ marginTop: 10 }}>Received ID: {id}</Text>
            </View>
        )
    }
    
    // Load the professional profile component
    return (
        <>
            <ProfessionalProfile />
        </>
    )
}

export default ProfessionalProfileLayout
