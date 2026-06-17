import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { ListofSectors } from 'services/listProfessionServices'
import { useTheme } from 'hooks/useTheme'
import { getColors } from 'static/color'
import { Feather } from '@expo/vector-icons'

const SectorsPageComponent = () => {
  const router = useRouter()
  const { theme } = useTheme()
  const { primaryColor, secondaryTextColor, backgroundColor, selectioncardColor, borderColor } = getColors(theme)
  const [sectors, setSectors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSectors = async () => {
      try {
        const data = await ListofSectors()
        setSectors(data)
      } catch (err: any) {
        setError(err.message || 'Failed to load sectors')
      } finally {
        setLoading(false)
      }
    }
    fetchSectors()
  }, [])

  const handleSectorPress = (sectorTitle: string) => {
    router.push(`/(Authenticated)/(profession)/category/${sectorTitle}`)
  }

  const handleBack = () => {
    router.back()
  }

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16 }}>
          <TouchableOpacity onPress={handleBack} style={{ marginRight: 16 }}>
            <Feather name="arrow-left" size={24} color={secondaryTextColor} />
          </TouchableOpacity>
          <Text style={{ fontSize: 18, fontFamily: 'TTFirsNeueMedium', color: secondaryTextColor }}>
            All Sectors
          </Text>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={primaryColor} />
        </View>
      </View>
    )
  }

  if (error) {
    return (
      <View style={{ flex: 1, backgroundColor }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16 }}>
          <TouchableOpacity onPress={handleBack} style={{ marginRight: 16 }}>
            <Feather name="arrow-left" size={24} color={secondaryTextColor} />
          </TouchableOpacity>
          <Text style={{ fontSize: 18, fontFamily: 'TTFirsNeueMedium', color: secondaryTextColor }}>
            All Sectors
          </Text>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }}>
          <Text style={{ color: secondaryTextColor, textAlign: 'center' }}>{error}</Text>
        </View>
      </View>
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16 }}>
        <TouchableOpacity onPress={handleBack} style={{ marginRight: 16 }}>
          <Feather name="arrow-left" size={24} color={secondaryTextColor} />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontFamily: 'TTFirsNeueMedium', color: secondaryTextColor }}>
          All Sectors
        </Text>
      </View>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={{ paddingHorizontal: 20, paddingTop: 0, paddingBottom: 20, gap: 12 }}>
          {sectors.map((sector) => (
            <TouchableOpacity
              key={sector.id}
              onPress={() => handleSectorPress(sector.title)}
              activeOpacity={0.7}
              style={{
                backgroundColor: selectioncardColor,
                borderColor: borderColor,
                borderWidth: 1,
                borderRadius: 12,
                padding: 16,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{
                  color: secondaryTextColor,
                  fontSize: 16,
                  fontFamily: 'TTFirsNeueMedium',
                  marginBottom: 4
                }}>
                  {sector.title}
                </Text>
                {sector.description && (
                  <Text style={{
                    color: secondaryTextColor,
                    fontSize: 14,
                    opacity: 0.7,
                    fontFamily: 'TTFirsNeue',
                  }}>
                    {sector.description}
                  </Text>
                )}
                <View style={{ flexDirection: 'row', gap: 16, marginTop: 8 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Feather name="users" size={14} color={primaryColor} />
                    <Text style={{
                      color: secondaryTextColor,
                      fontSize: 12,
                      fontFamily: 'TTFirsNeue',
                    }}>
                      {sector.numOfProf || 0} professionals
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Feather name="briefcase" size={14} color={primaryColor} />
                    <Text style={{
                      color: secondaryTextColor,
                      fontSize: 12,
                      fontFamily: 'TTFirsNeue',
                    }}>
                      {sector.numOfJobs || 0} jobs
                    </Text>
                  </View>
                </View>
              </View>
              <Feather name="chevron-right" size={20} color={secondaryTextColor} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  )
}

export default SectorsPageComponent
