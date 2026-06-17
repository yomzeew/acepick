import SwitchToProfessional from "component/menuComponent/profilePages/switchToProfessional"
import { View, Text, ScrollView } from "react-native"
export default SwitchToProfessional

export function ErrorBoundary({ error }: { error: Error }) {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#DC2626', marginBottom: 8 }}>
                Something went wrong
            </Text>
            <ScrollView>
                <Text style={{ fontSize: 12, color: '#6B7280' }}>{error.message}</Text>
            </ScrollView>
        </View>
    )
}
