import { View,Text } from "react-native"
import { ThemeTextsecond } from "./ThemeText"
import { Textstyles } from "static/textFontsize"

interface JobStatusProps {
  status: 'COMPLETED' | 'APPROVED' | 'DISPUTED' | 'PENDING' | 'DECLINED' | 'ONGOING' | 'CANCELED' | 'REJECTED' | string;
}

const JobStatusBar = ({ status }: JobStatusProps) => {
    // Define colors based on status
    const getStatusColor = () => {
        switch (status) {
            case 'COMPLETED':
                return { bg: 'bg-green-100', text: 'text-green-800' }
            case 'APPROVED':
                return { bg: 'bg-blue-100', text: 'text-blue-800' }
            case 'DISPUTED':
                return { bg: 'bg-yellow-100', text: 'text-yellow-800' }
            case 'PENDING':
                return { bg: 'bg-orange-100', text: 'text-orange-800' }
            case 'DECLINED':
            case 'REJECTED':
            case 'CANCELED':
                return { bg: 'bg-red-100', text: 'text-red-800' }
            case 'ONGOING':
                return { bg: 'bg-purple-100', text: 'text-purple-800' }
            default:
                return { bg: 'bg-gray-100', text: 'text-gray-800' }
        }
    }

    const { bg, text } = getStatusColor()

    return (
        <View className={`${bg} absolute right-0 rounded-l-2xl px-3 py-1`}>
            <Text
            style={[Textstyles.text_xsmall]}
                className={text}
            >
                {status.toLowerCase().split('_').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ')}
            </Text>
        </View>
    )
}

export default JobStatusBar