import ContainerTemplate from "component/dashboardComponent/containerTemplate"
import HeaderComponent from "../../headerComp"
import EmptyView from "component/emptyview"
import ListCard from "component/listcard"
import { useLocalSearchParams, useRouter } from "expo-router"
import { ScrollView, TouchableOpacity, View, ActivityIndicator, Animated, TextInput } from "react-native"
import { getProfessionsBySector } from "utilizes/fetchlistofjobs"
import { useEffect, useState, useRef } from "react"
import { ThemeTextsecond } from "component/ThemeText"
import { Textstyles } from "static/textFontsize"
import { Text } from "react-native"
import { useTheme } from "hooks/useTheme"
import { getColors } from "static/color"
import { Ionicons, FontAwesome5 } from "@expo/vector-icons"

const Category = () => {
  const router = useRouter()
  const { category } = useLocalSearchParams()
  const [professionalArray, setProfessionArray] = useState<any[]>([])
  const [filteredArray, setFilteredArray] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const scrollY = useRef(new Animated.Value(0)).current
  const categoryValue: any = category
  const { theme } = useTheme()
  const { secondaryTextColor, primaryColor, selectioncardColor, backgroundColortwo } = getColors(theme)
  
  // Fetch professions based on selected sector
  const getProfessionList = async () => {
    if (!categoryValue) {
      console.warn('No sector selected');
      setError('No sector selected');
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      console.log('🔍 Category page fetching professions for:', categoryValue);
      
      const professionalList = await getProfessionsBySector(categoryValue);
      setProfessionArray(professionalList);
      setFilteredArray(professionalList);
      
      // Empty data is not an error - let the UI handle it gracefully
      if (professionalList.length === 0) {
        console.log('ℹ️ No professions found for this sector - showing empty state UI');
      }
    } catch (err: any) {
      console.error('❌ Error in category page:', err);
      setError(err.message || 'Failed to load professions');
    } finally {
      setIsLoading(false);
    }
  };

  // Search functionality
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(() => {
      if (query.trim() === '') {
        setFilteredArray(professionalArray);
      } else {
        const filtered = professionalArray.filter((profession: any) =>
          profession.title.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredArray(filtered);
      }
    }, 300);
  };

  useEffect(() => {
    getProfessionList()
  }, [categoryValue])

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);
 console.log('ok')


  const handlenavprofession = (value: any) => {
   
    const navigationUrl = `/professionals?id=${value.id}&profession=${encodeURIComponent(value.title)}&sector=${category}`;
    router.push(navigationUrl);
  }

  return (
    <>
      <ContainerTemplate>
        {/* Animated Header */}
        <Animated.View
          style={{
            transform: [{
              translateY: scrollY.interpolate({
                inputRange: [0, 100],
                outputRange: [0, -20],
                extrapolate: 'clamp'
              })
            }]
          }}
        >
          <HeaderComponent title={category} />
        </Animated.View>
        
        <EmptyView height={20} />
        
        {/* Search Bar */}
        <View className="px-4 mb-6">
          <View 
            style={{
              backgroundColor: selectioncardColor,
              borderRadius: 16,
              elevation: 2,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 4,
            }}
            className="flex-row items-center px-4 py-3"
          >
            <Ionicons name="search" size={20} color={secondaryTextColor} />
            <TextInput
              className="flex-1 ml-3"
              placeholder="Search professions..."
              placeholderTextColor={secondaryTextColor}
              value={searchQuery}
              onChangeText={handleSearch}
              style={{
                color: theme === 'dark' ? '#FFFFFF' : '#1F2937',
                fontFamily: 'TTFirsNeue',
                fontSize: 16
              }}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => handleSearch("")}>
                <Ionicons name="close-circle" size={20} color={secondaryTextColor} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Stats Cards */}
        {!isLoading && !error && professionalArray.length > 0 && (
          <View className="px-4 mb-6">
            <View className="flex-row gap-4">
              <View 
                style={{
                  backgroundColor: primaryColor + '15',
                  borderRadius: 12,
                  padding: 16,
                  flex: 1
                }}
              >
                <View className="flex-row items-center">
                  <View 
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: primaryColor + '25',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}
                  >
                    <FontAwesome5 name="briefcase" size={14} color={primaryColor} />
                  </View>
                  <View className="ml-3">
                    <Text style={{ fontSize: 20, fontWeight: '600', color: primaryColor, fontFamily: 'TTFirsNeue' }}>
                      {professionalArray.length}
                    </Text>
                    <Text style={{ fontSize: 12, color: secondaryTextColor, fontFamily: 'TTFirsNeue', opacity: 0.7 }}>
                      Professions
                    </Text>
                  </View>
                </View>
              </View>
              
              <View 
                style={{
                  backgroundColor: primaryColor + '15',
                  borderRadius: 12,
                  padding: 16,
                  flex: 1
                }}
              >
                <View className="flex-row items-center">
                  <View 
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: primaryColor + '25',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}
                  >
                    <FontAwesome5 name="users" size={14} color={primaryColor} />
                  </View>
                  <View className="ml-3">
                    <Text style={{ fontSize: 20, fontWeight: '600', color: primaryColor, fontFamily: 'TTFirsNeue' }}>
                      {Math.floor(Math.random() * 50) + 10}
                    </Text>
                    <Text style={{ fontSize: 12, color: secondaryTextColor, fontFamily: 'TTFirsNeue', opacity: 0.7 }}>
                      Available
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Content */}
        <View className="flex-1 pb-5">
          <ScrollView
            contentContainerStyle={{ paddingBottom: 60, paddingTop: 20 }}
            showsVerticalScrollIndicator={false}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: false }
            )}
            scrollEventThrottle={16}
          >
            {isLoading ? (
              <View className="flex-1 justify-center items-center py-16">
                <ActivityIndicator size="large" color={primaryColor} />
                <Text style={{ marginTop: 16, opacity: 0.7, color: secondaryTextColor, fontFamily: 'TTFirsNeue' }}>
                  Loading professions...
                </Text>
              </View>
            ) : error ? (
              <View className="flex-1 justify-center items-center py-16 px-4">
                <View 
                  style={{
                    backgroundColor: backgroundColortwo + '15',
                    borderRadius: 16,
                    padding: 20,
                    alignItems: 'center'
                  }}
                >
                  <Ionicons name="alert-circle-outline" size={48} color={backgroundColortwo} />
                  <Text style={{ marginTop: 12, fontSize: 16, color: backgroundColortwo, fontFamily: 'TTFirsNeue', textAlign: 'center' }}>
                    {error}
                  </Text>
                  <TouchableOpacity 
                    onPress={getProfessionList}
                    style={{ 
                      marginTop: 16, 
                      paddingHorizontal: 24, 
                      paddingVertical: 12, 
                      backgroundColor: backgroundColortwo, 
                      borderRadius: 8 
                    }}
                  >
                    <Text style={{ color: '#FFFFFF', fontFamily: 'TTFirsNeue', fontWeight: '600' }}>
                      Retry
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : filteredArray.length > 0 ? (
              <View>
                {searchQuery.length > 0 && (
                  <View className="px-4 mb-4">
                    <Text style={{ color: secondaryTextColor, fontFamily: 'TTFirsNeue', opacity: 0.7 }}>
                      Found {filteredArray.length} result{filteredArray.length !== 1 ? 's' : ''} for "{searchQuery}"
                    </Text>
                  </View>
                )}
                {filteredArray.map((item: any, index: number) => (
                  <TouchableOpacity 
                    onPress={() => handlenavprofession(item)} 
                    key={index}
                    activeOpacity={0.7}
                  >
                    <ListCard
                      content={item.title || 'Profession'}
                      count={Math.floor(Math.random() * 20) + 5}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View className="flex-1 justify-center items-center py-16 px-4">
                <View 
                  style={{
                    backgroundColor: selectioncardColor,
                    borderRadius: 16,
                    padding: 32,
                    alignItems: 'center',
                    borderWidth: 2,
                    borderColor: secondaryTextColor + '20'
                  }}
                >
                  <Ionicons name="search-outline" size={48} color={secondaryTextColor} />
                  <Text style={{ marginTop: 16, fontSize: 16, color: secondaryTextColor, fontFamily: 'TTFirsNeue', textAlign: 'center' }}>
                    {searchQuery.length > 0 
                      ? `No professions found for "${searchQuery}"`
                      : 'No professions found for this sector'
                    }
                  </Text>
                  {searchQuery.length > 0 && (
                    <TouchableOpacity 
                      onPress={() => handleSearch("")}
                      style={{ 
                        marginTop: 16, 
                        paddingHorizontal: 20, 
                        paddingVertical: 10, 
                        backgroundColor: secondaryTextColor + '20', 
                        borderRadius: 8 
                      }}
                    >
                      <Text style={{ color: secondaryTextColor, fontFamily: 'TTFirsNeue' }}>
                        Clear Search
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </ContainerTemplate>
    </>
  )
}
export default Category
