import React from 'react'
import { View, Text } from 'react-native'
import ProfessionalProfile from "@pages/dashboard/professionalProfilePages"
import { useLocalSearchParams, useRouter } from "expo-router"

const ProfessionalProfileLayout = () => {
    const { professionalId, byUser } = useLocalSearchParams()
    const router = useRouter()

    console.log('🔍 [professionalId].tsx Route params:', professionalId, 'byUser:', byUser)

    // Reject invalid professionalIds (allow numeric IDs whether they are professional-entity IDs or user IDs)
    if (!professionalId || professionalId === '(chatcallmessage)' || isNaN(Number(professionalId))) {
        console.log('🚨 Rejecting invalid professionalId:', professionalId)

        setTimeout(() => { router.back() }, 500)
        return null
    }

    return (
        <>
            <ProfessionalProfile />
        </>
    )
}

export default ProfessionalProfileLayout
