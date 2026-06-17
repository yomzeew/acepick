import { TouchableOpacity, View, Text } from "react-native"
import ProfessionalCard from "./professionalCard"
import { useRouter } from "expo-router"
import { useMutation } from "@tanstack/react-query"
import { ListofSectors } from "services/listProfessionServices"
import { testConnection } from "services/connectionTest"
import { useEffect, useState } from "react"
import SectorSkeletonCard from "component/sectorSkeletonCard"
import { useTheme } from "hooks/useTheme"
import { getColors } from "static/color"

interface SectorsComponentProps {
    setErrorMessage: (value: string) => void
}

const SectorsComponent = ({ setErrorMessage }: SectorsComponentProps) => {
    const [data, setData] = useState<any[]>([])
    const router = useRouter()
    const { theme } = useTheme()
    const { secondaryTextColor } = getColors(theme)

    const mutation = useMutation({
        mutationFn: ListofSectors,
        onSuccess: async (dataResponse) => {
            console.log('📊 Sectors data received:', dataResponse);
            const transformedData = dataResponse.map((sector: any) => ({
                title: sector.title || sector.name,
                numOfProf: sector.numOfProf || 0, // Use real count from backend
                numOfJobs: sector.numOfJobs || 0, // Use real count from backend
                description: sector.description || ''
            }));
            console.log('📊 Transformed sectors data:', transformedData);
            setData(transformedData);
        },
        onError: (error: any) => {
            let msg = "An unexpected error occurred";
            if (error?.response?.data) {
                msg = error.response.data.message || error.response.data.error || JSON.stringify(error.response.data);
            } else if (error?.message) {
                msg = error.message;
            }
            setErrorMessage(msg);
            console.error("List of sectors fetch failed:", msg);
        },
    });

    useEffect(() => {
        // Test connection first
        testConnection();
        mutation.mutate();
    }, []);

    const handlenavcategory = (value: string) => {
        router.push(`/category/${value}`)
    }

    return (
        <View style={{ gap: 10 }}>
            {mutation.isPending ? (
                [1, 2, 3, 4].map((_, index) => (
                    <SectorSkeletonCard key={index} />
                ))
            ) : data.length > 0 ? (
                data.map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        onPress={() => handlenavcategory(item?.title || "Unknown")}
                        activeOpacity={0.7}
                    >
                        <ProfessionalCard
                            profession={item?.title || "Unknown"}
                            numOfProf={item?.numOfProf || 0}
                            numOfJobs={item?.numOfJobs || 0}
                        />
                    </TouchableOpacity>
                ))
            ) : (
                <View className="items-center py-8">
                    <Text style={{ fontSize: 14, color: secondaryTextColor, opacity: 0.5, fontFamily: 'TTFirsNeue' }}>
                        No sectors available
                    </Text>
                </View>
            )}
        </View>
    )
}
export default SectorsComponent