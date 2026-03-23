import React from "react"
import ContainerTemplate from "component/dashboardComponent/containerTemplate"
import HeaderComponent from "../../headerComp"
import EmptyView from "component/emptyview"
import { useLocalSearchParams, useRouter } from "expo-router"
import { 
  TouchableOpacity, 
  Text, 
  View, 
  Image, 
  ScrollView, 
  Animated, 
  ActivityIndicator, 
  RefreshControl,
  FlatList 
} from "react-native"
import { 
  AntDesign, 
  FontAwesome5, 
  FontAwesome6, 
  Ionicons 
} from "@expo/vector-icons"
import { useTheme } from "hooks/useTheme"
import { getColors } from "static/color"
import { Textstyles } from "static/textFontsize"
import { useEffect, useRef, useState } from "react"
import RatingStar from "component/rating"
import { ThemeText, ThemeTextsecond } from "component/ThemeText"
import { useSelector } from "react-redux"
import { RootState } from "redux/store"
import { useMutation } from "@tanstack/react-query"
import { getArtisanListFn } from "services/userService"
import { AlertMessageBanner } from "component/AlertMessageBanner"
import SliderModalTemplate from "component/slideupModalTemplate"
import ProfessionalFilter from "component/professionalFilter"
import { TextInput } from "react-native"

const Professional=()=>{
    const {theme}=useTheme()
    const {secondaryTextColor,primaryColor,selectioncardColor,backgroundColortwo}=getColors(theme)
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const  [artisanData,setArtisanData]=useState<any[]>([])
    const [filterData,setFilterData]=useState<any[]>([])
        const [showFilter,setshowFilter]=useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [refreshing, setRefreshing] = useState(false)
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const scrollY = useRef(new Animated.Value(0)).current

    useEffect(() => {
      if (errorMessage) {
        const timer = setTimeout(() => {
          setErrorMessage(null);
        }, 4000);
        return () => clearTimeout(timer); // Cleanup on unmount or on new error
      }
    }, [errorMessage]);
// useSelector to get the token
const token:string=useSelector((state:RootState)=>(state.auth?.token) ?? "") 
    const {id,profession,sector}=useLocalSearchParams()
    
    // Get profession name from query parameter
    const professionName = profession ? decodeURIComponent(profession.toString()) : "Profession"
    const finalSector:string=sector.toString() ?? ""

 // this one of the query
    const professionalId=Number(id)
    // here is the usemutation 
   
    const onRefresh = () => {
        setRefreshing(true);
        mutation.mutate(`professionId=${professionalId}`);
    };

    const mutation=useMutation({
      mutationFn: (query:string) => getArtisanListFn(token, query),
      onSuccess: (response:any) => {
          console.log('✅ Fetched professionals:', response.data?.length || 0);
          setArtisanData(response.data || [])
          setRefreshing(false);
          // optionally update local state here if you want to store the result
      },
      onError: (error:any) => {
        setRefreshing(false);
        let msg = "An unexpected error occurred";
    
        if (error?.response?.data) {
          // Try multiple common formats
          msg =
            error.response.data.message ||         // Common single message
            error.response.data.error ||           // Alternative key
            JSON.stringify(error.response.data);   // Fallback: dump full error object
        } else if (error?.message) {
          msg = error.message;
        }
      
        setErrorMessage(msg);
        console.error("❌ Failed to fetch professionals:", msg);
      },
      });

      useEffect(() => {
        mutation.mutate(`professionId=${professionalId}`);
    }, [professionalId]);

    useEffect(()=>{
      setArtisanData(filterData)
   },[filterData])


    const handlePressFilter=()=>{
      setshowFilter(!showFilter)
    }

    const handleSearch = (query: string) => {
        setSearchQuery(query)
        
        // Clear existing timeout
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current)
        }
        
        // Set new timeout for debounced search
        searchTimeoutRef.current = setTimeout(() => {
            let searchQueryParts = []
            if (professionalId) searchQueryParts.push(`professionId=${professionalId}`)
            if (query) searchQueryParts.push(`profession=${encodeURIComponent(query)}`)
            
            const queryString = searchQueryParts.join('&')
            mutation.mutate(queryString)
        }, 500) // 500ms debounce
    }

    


    return(
        <>
          {errorMessage && (
               <AlertMessageBanner type="error" message={errorMessage} />
             )}
            <SliderModalTemplate showmodal={showFilter} setshowmodal={setshowFilter} modalHeight={'70%'} >
            <ProfessionalFilter 
            showmodal={showFilter}
            setshowmodal={setshowFilter}
            setfilterData={setFilterData}
            professionId={professionalId}
            />
        </SliderModalTemplate>
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
                <HeaderComponent title={professionName}/>
            </Animated.View>
            
            <EmptyView height={20}/>
            
            {/* Filter Button */}
            <View className="absolute right-4 top-28 z-10">
                <TouchableOpacity 
                    onPress={handlePressFilter} 
                    style={{
                        backgroundColor: primaryColor,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                        elevation: 3
                    }} 
                    className="w-12 h-12 rounded-full items-center justify-center"
                >
                    <AntDesign size={20} color={"#ffffff"} name="filter"/>
                </TouchableOpacity>   
            </View>
            
            {/* Search Bar */}
            <View className="w-full px-4 mb-6">
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
                        placeholder="Search professionals by name..."
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
            {!mutation.isPending && artisanData.length > 0 && (
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
                                    <FontAwesome5 name="users" size={14} color={primaryColor} />
                                </View>
                                <View className="ml-3">
                                    <Text style={{ fontSize: 20, fontWeight: '600', color: primaryColor, fontFamily: 'TTFirsNeue' }}>
                                        {artisanData.length}
                                    </Text>
                                    <Text style={{ fontSize: 12, color: secondaryTextColor, fontFamily: 'TTFirsNeue', opacity: 0.7 }}>
                                        Professionals
                                    </Text>
                                </View>
                            </View>
                        </View>
                        
                        <View 
                            style={{
                                backgroundColor: backgroundColortwo + '15',
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
                                        backgroundColor: backgroundColortwo + '25',
                                        justifyContent: 'center',
                                        alignItems: 'center'
                                    }}
                                >
                                    <FontAwesome5 name="check-circle" size={14} color={backgroundColortwo} />
                                </View>
                                <View className="ml-3">
                                    <Text style={{ fontSize: 20, fontWeight: '600', color: backgroundColortwo, fontFamily: 'TTFirsNeue' }}>
                                        {artisanData.filter((item: any) => item.available).length}
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
            <View className="flex-1">
                <ArtisanPage 
                    artisanData={artisanData} 
                    isLoading={mutation.isPending}
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                />
            </View>

        </ContainerTemplate>
        </>
    )
}
export default Professional

  interface ArtisanPageProps{
    artisanData:any[];
    isLoading?: boolean;
    refreshing?: boolean;
    onRefresh?: () => void;
  }
  export const ArtisanPage=({artisanData, isLoading = false, refreshing = false, onRefresh}:ArtisanPageProps)=>{
    const artisanDataArray=artisanData
    const router=useRouter()
    const {theme} = useTheme()
    const {secondaryTextColor, primaryColor, selectioncardColor} = getColors(theme)
    const handlePress=(value:number)=>{
      const navigationUrl = `/professional/${value}?professionalId=${value}`;
      console.log('🔍 Navigating to professional profile:', { value, navigationUrl });
      router.push(navigationUrl);
    }
 
    return (
      <View className="flex-1 w-full">
        {isLoading && artisanDataArray.length === 0 ? (
            <View className="flex-1 justify-center items-center py-16">
                <ActivityIndicator size="large" color={primaryColor} />
                <Text style={{ marginTop: 16, opacity: 0.7, color: secondaryTextColor, fontFamily: 'TTFirsNeue' }}>
                    Loading professionals...
                </Text>
            </View>
        ) : (
            <FlatList
                data={artisanDataArray}
                renderItem={({ item, index }: {item: any, index: number}) => (
                    <TouchableOpacity 
                        onPress={()=>handlePress(item.id)} 
                        className="w-full" 
                        key={index}
                        activeOpacity={0.7}
                    >
                        <ListCard
                            title={item.profession?.title || 'Professional'}
                            firstName={item.profile?.firstName || 'John'}
                            lastName={item.profile?.lastName || 'Doe'}
                            state={item.profile?.user?.location?.state || 'Lagos'}
                            lga={item.profile?.user?.location?.lga || 'Ikeja'}
                            avatar={item.profile?.avatar || ''}
                            charges={item.chargeFrom}
                            available={item.available}
                            avgRating={item.avgRating}
                            verified={item.profile?.verified}
                        />
                    </TouchableOpacity>
                )}
                keyExtractor={(item: any, index: number) => item.id?.toString() || index.toString()}
                contentContainerStyle={{ 
                    paddingHorizontal: 16, 
                    paddingBottom: 100 
                }}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    !isLoading ? (
                        <View className="flex-1 justify-center items-center py-16">
                            <View 
                                style={{
                                    backgroundColor: selectioncardColor,
                                    borderRadius: 16,
                                    padding: 32,
                                    alignItems: 'center',
                                }}
                            >
                                <Ionicons name="people-outline" size={48} color={secondaryTextColor} />
                                <Text style={{ marginTop: 16, fontSize: 16, color: secondaryTextColor, fontFamily: 'TTFirsNeue', textAlign: 'center' }}>
                                    No professionals available for this profession
                                </Text>
                                <TouchableOpacity 
                                    onPress={onRefresh}
                                    style={{ 
                                        marginTop: 16, 
                                        paddingHorizontal: 20, 
                                        paddingVertical: 10, 
                                        backgroundColor: primaryColor + '20', 
                                        borderRadius: 8 
                                    }}
                                >
                                    <Text style={{ color: primaryColor, fontFamily: 'TTFirsNeue' }}>
                                        Refresh
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : null
                }
                getItemLayout={(data: any, index: number) => ({
                    length: 120, // Approximate height of each ListCard
                    offset: 120 * index,
                    index,
                })}
                removeClippedSubviews={true}
                maxToRenderPerBatch={10}
                updateCellsBatchingPeriod={50}
                initialNumToRender={10}
                windowSize={10}
            />
        )}
      </View>
    );
    
  }
interface ListCardProps{
    firstName:string;
    lastName:string;
    state:string;
    lga:string;
    charges:string;
    title:string;
    available:boolean;
    avatar:string;
    avgRating?:number;
    verified?:boolean;
}

// @ts-ignore
// eslint-disable-next-line react-native/no-unused-styles
const ListCard = React.memo(function ListCardComponent({firstName,lastName,state,lga,charges,title,available,avatar,avgRating,verified}:ListCardProps){
    const {theme}=useTheme()
    const { primaryColor, secondaryTextColor, selectioncardColor, backgroundColortwo } = getColors(theme)
    
    // Helper function to ensure text is always a string
    const safeText = (text: any) => {
        return text ? String(text) : ''
    }
    
    // Animation values
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;
    const translateXAnim = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        // Staggered entrance animation
        const timer = setTimeout(() => {
            Animated.parallel([
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(translateXAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();
        }, 100);

        return () => clearTimeout(timer);
    }, []);

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.98,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            tension: 100,
            friction: 4,
        }).start();
    };

    return (
        <>
        <Animated.View
            style={{
                transform: [{ scale: scaleAnim }, { translateX: translateXAnim }],
                opacity: opacityAnim,
            }}
        >
            <EmptyView height={6}/>
            <View 
                style={{
                    backgroundColor: selectioncardColor,
                    elevation: 4,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.08,
                    shadowRadius: 6,
                    borderRadius: 16,
                    overflow: 'hidden',
                    borderWidth: 1,
                    borderColor: theme === 'dark' ? '#374151' : '#E5E7EB'
                }}
                className="w-full"
            >
                {/* Status Indicator Line */}
                <View
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 2,
                        backgroundColor: available ? primaryColor : backgroundColortwo,
                    }}
                />
                
                <View className="w-full flex-row px-3 py-3">
                    {/* Avatar Section - Smaller */}
                    <View className="justify-center">
                        <View className="relative">
                            <Image 
                                resizeMode="cover" 
                                source={
                                    (() => {
                                        // Check if avatar is a valid URL
                                        if (!avatar || avatar.trim() === '') {
                                            return require('../../../assets/professional.png');
                                        }
                                        
                                        // Check if it's a placeholder URL
                                        if (avatar.includes('placehold.co') || avatar.includes('text=Avatar')) {
                                            return require('../../../assets/professional.png');
                                        }
                                        
                                        // Check if it starts with http/https or is a relative path
                                        if (avatar.startsWith('http') || avatar.startsWith('/')) {
                                            return { uri: avatar };
                                        }
                                        
                                        // Fallback to professional image
                                        return require('../../../assets/professional.png');
                                    })()
                                } 
                                className="w-12 h-12 rounded-full"
                                style={{
                                    borderWidth: 2,
                                    borderColor: available ? primaryColor + '20' : backgroundColortwo + '20',
                                    backgroundColor: theme === 'dark' ? '#374151' : '#F3F4F6'
                                }}
                                onError={(error) => {
                                    console.log('Avatar image load error:', error);
                                }}
                            />
                            {verified && (
                                <View 
                                    style={{
                                        position: 'absolute',
                                        bottom: -1,
                                        right: -1,
                                        width: 16,
                                        height: 16,
                                        backgroundColor: primaryColor,
                                        borderRadius: 8,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderWidth: 1.5,
                                        borderColor: '#FFFFFF'
                                    }}
                                >
                                    <FontAwesome5 name="check" size={8} color="#ffffff" />
                                </View>
                            )}
                        </View>
                    </View>
                    
                    {/* Content Section - More Compact */}
                    <View className="flex-1 justify-center ml-3">
                        {/* Name - Smaller */}
                        <View className="flex-row items-center mb-0.5">
                            <Text 
                                style={{ 
                                    fontSize: 14,
                                    fontWeight: '600',
                                    color: theme === 'dark' ? '#FFFFFF' : '#1F2937',
                                    fontFamily: 'TTFirsNeue',
                                    lineHeight: 18
                                }}
                                numberOfLines={1}
                            >
                                {`${safeText(firstName)} ${safeText(lastName)}`}
                            </Text>
                            {verified && (
                                <FontAwesome5 name="verified" size={11} color={primaryColor} style={{ marginLeft: 4 }} />
                            )}
                        </View>
                        
                        {/* Title - More Compact */}
                        <View className="flex-row items-center mb-0.5">
                            <FontAwesome5 color={primaryColor} name="toolbox" size={8} />
                            <Text style={{ 
                                fontSize: 11, 
                                color: secondaryTextColor, 
                                fontFamily: 'TTFirsNeue',
                                marginLeft: 4,
                                lineHeight: 14
                            }}
                            numberOfLines={1}
                            >
                                {safeText(title)}
                            </Text>
                        </View>
                        
                        {/* Location - More Compact */}
                        <View className="flex-row items-center mb-1">
                            <FontAwesome6 name="location-dot" size={9} color={primaryColor} />
                            <Text style={{ 
                                fontSize: 10, 
                                color: secondaryTextColor, 
                                fontFamily: 'TTFirsNeue',
                                marginLeft: 3,
                                lineHeight: 13
                            }}
                            numberOfLines={1}
                            >
                                {safeText(lga)}
                            </Text>
                            <Text style={{ 
                                fontSize: 10, 
                                color: secondaryTextColor + '60',
                                fontFamily: 'TTFirsNeue',
                                marginLeft: 2,
                                lineHeight: 13
                            }}
                            numberOfLines={1}
                            >
                                • {safeText(state)}
                            </Text>
                        </View>
                        
                        {/* Price and Rating - Same Row */}
                        <View className="flex-row items-center justify-between">
                            <Text style={{ 
                                fontSize: 12, 
                                color: primaryColor, 
                                fontFamily: 'TTFirsNeue',
                                fontWeight: '600',
                                lineHeight: 14
                            }}>
                                {charges ? `From N${safeText(charges)}` : 'Contact for pricing'}
                            </Text>
                            
                            {avgRating && (
                                <View className="flex-row items-center">
                                    <RatingStar numberOfStars={Math.round(avgRating)} />
                                    <Text style={{ 
                                        fontSize: 9, 
                                        color: secondaryTextColor, 
                                        fontFamily: 'TTFirsNeue',
                                        marginLeft: 3,
                                        lineHeight: 11
                                    }}>
                                        {avgRating.toFixed(1)}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>
                    
                    {/* Status Badge - Smaller */}
                    <View className="items-center justify-center ml-2">
                        <View 
                            style={{
                                backgroundColor: available ? primaryColor : backgroundColortwo,
                                borderRadius: 12,
                                paddingHorizontal: 8,
                                paddingVertical: 4,
                                shadowColor: available ? primaryColor : backgroundColortwo,
                                shadowOffset: { width: 0, height: 1 },
                                shadowOpacity: 0.15,
                                shadowRadius: 2,
                                elevation: 1
                            }}
                        >
                            <Text style={{ 
                                fontSize: 9, 
                                color: "#ffffff", 
                                fontFamily: 'TTFirsNeue',
                                fontWeight: '600',
                                lineHeight: 10
                            }}>
                                {available ? 'Available' : 'Busy'}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
        </Animated.View>
        </>
    )
});
