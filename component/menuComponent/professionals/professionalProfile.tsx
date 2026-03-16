import ContainerTemplate from "component/dashboardComponent/containerTemplate"
import HeaderComponent from "../../headerComp"
import BackComponent from "component/backcomponent"
import { useTheme } from "hooks/useTheme"
import { getColors } from "static/color"
import { ImageBackground, Touchable, TouchableOpacity, View, ScrollView } from "react-native"
import { Image, Text } from "react-native"
import { ThemeText, ThemeTextsecond } from "component/ThemeText"
import { AntDesign, FontAwesome5, FontAwesome6, Ionicons } from "@expo/vector-icons"
import { Textstyles } from "static/textFontsize"
import RatingStar from "component/rating"
import EmptyView from "component/emptyview"
import DraggablePanel from "component/bottomSheetcomp"
import Divider from "component/divider"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useMutation } from "@tanstack/react-query"
import { getProfessionDetailFn } from "services/userService"
import { useEffect, useState } from "react"
import { ProfessionalData } from "types/type"
import MockDataService from "services/mockDataService"



const ProfessionalProfile = () => {
    // Safe theme access with fallback
    let theme: "light" | "dark" = "light";
    let primaryColor = "#0366d8";
    let backgroundColor = "#ffffff";
    
    try {
        const themeContext = useTheme();
        theme = themeContext.theme;
        const colors = getColors(theme);
        primaryColor = colors.primaryColor;
        backgroundColor = colors.backgroundColor;
    } catch (error) {
        console.warn('Theme context not available, using default theme');
        // Use default values
        const defaultColors = getColors("light");
        primaryColor = defaultColors.primaryColor;
        backgroundColor = defaultColors.backgroundColor;
    }
    
    // Safe router access with fallback
    let router: any = null;
    let professionalId: string | string[] | undefined = undefined;
    
    try {
        router = useRouter();
        const params = useLocalSearchParams();
        professionalId = params.professionalId;
    } catch (error) {
        console.warn('Router context not available, using default values');
        // Use default values when router is not available
        professionalId = undefined;
    }

    // For professionals viewing their own profile, use default ID 1 (Mike Wilson)
    // In a real app, this would come from user context/auth state
    const professionalIdValue = Number(professionalId) || 1;

    // Validate professional ID
    if (!professionalIdValue || isNaN(professionalIdValue)) {
        console.error("❌ Invalid professional ID:", { professionalId, professionalIdValue });
        return (
            <ContainerTemplate>
                <View className="flex-1 justify-center items-center">
                    <ThemeText size={Textstyles.text_medium}>
                        Invalid Professional Profile
                    </ThemeText>
                    <ThemeTextsecond size={Textstyles.text_small}>
                        Professional ID is missing or invalid
                    </ThemeTextsecond>
                </View>
            </ContainerTemplate>
        );
    }

    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [data, setData] = useState<ProfessionalData | null>(null);

    useEffect(() => {
        if (errorMessage) {
            const timer = setTimeout(() => {
                setErrorMessage(null);
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [errorMessage]);

    const mutation = useMutation({
        mutationFn: getProfessionDetailFn,
        onSuccess: async (response) => {
            setData(response.data);
        },
        onError: (error: any) => {
            // Build detailed error for backend engineer
            const status = error?.response?.status || 'N/A';
            const statusText = error?.response?.statusText || '';
            const backendMsg = error?.response?.data?.message 
                || error?.response?.data?.error 
                || (error?.response?.data ? JSON.stringify(error.response.data) : '');
            const networkMsg = error?.message || '';
            
            const fullError = `[HTTP ${status}${statusText ? ' ' + statusText : ''}] ${backendMsg || networkMsg || 'Unknown error'}`;
            
            console.error("❌ Professional Details Error:", {
                professionalId: professionalIdValue,
                status,
                statusText,
                backendResponse: error?.response?.data,
                networkError: networkMsg,
                fullError
            });
        
            setErrorMessage(fullError);
        },
    });

    useEffect(() => {
        mutation.mutate(professionalIdValue); 
    }, [])

    if (!data) {
        return null; // or loading indicator
    }
    const handleNextFn=()=>{
        const fullName=data.profile.firstName+' '+data.profile.lastName
        const rating=data.avgRating
        const avatar=data.profile.avatar
        const professionalId=data.profile.userId
      router?.push(`/joborderLayout?professionalId=${professionalId}&avatar=${avatar}&fullName=${fullName}&rating=${rating}`)
        
    }

    return (
        <>
            <View style={{ backgroundColor: primaryColor }} className="h-full w-full">
                <ImageBackground resizeMode="cover" className="w-full flex-1 h-[100%] px-3 pt-[56px]" source={require('../../../assets/profilebg.png')}>
                    <BackComponent bordercolor={primaryColor} textcolor={primaryColor} />
                    <EmptyView height={20} />
                    <View className="w-full items-center">
                        <Image resizeMode="contain" source={require('../../../assets/profilepc.png')} className="w-32 h-32 rounded-full" />
                    </View>
                    <EmptyView height={20} />
                    <View className="items-center">
                        <Text style={[Textstyles.text_cmedium, { color: "#ffffff" }]}>{data.profile.firstName} {data.profile.lastName}</Text>
                        <EmptyView height={10} />
                        <View className="flex-row gap-x-2">
                            <FontAwesome5 color="red" name="toolbox" size={15} />
                            <Text style={[Textstyles.text_xsma, { color: "#ffffff" }]}>{data.profession.title}</Text>
                            <Text style={[Textstyles.text_xsma, { color: "#ffffff" }]}>{data.yearsOfExp} years</Text>
                        </View>
                        <EmptyView height={5} />
                        <View className="flex-row gap-x-2">
                            <FontAwesome6 name="location-dot" size={12} color={primaryColor} />
                            <Text style={[Textstyles.text_xsma, { color: "#ffffff" }]}>{data.profile.user.location.lga}, {data.profile.user.location.state} State</Text>
                        </View>
                        <EmptyView height={5} />
                        <View className="flex-row items-center gap-x-3">
                            <View>
                                <RatingStar numberOfStars={data.avgRating} />
                            </View>
                            <View className="flex-col">
                                <Text style={[Textstyles.text_small, { color: "#ffffff", fontWeight: 'bold' }]}>
                                    {data.avgRating.toFixed(1)} out of 5
                                </Text>
                                <Text style={[Textstyles.text_xxxsmall, { color: "#ffffff80" }]}>
                                    {data.profile.totalJobsCompleted > 0 ? `Based on ${data.profile.totalJobsCompleted} jobs` : 'No jobs yet'}
                                </Text>
                            </View>
                        </View>
                        <EmptyView height={5} />
                        <View>
                            <Text style={[Textstyles.text_xsma, { color: "#ffffff" }]}>Jobs Completed: {data.profile.totalJobsCompleted}</Text>
                        </View>
                    </View>
                    <EmptyView height={20} />
                    <View className="w-full items-center">
                        <TouchableOpacity onPress={handleNextFn} style={{ backgroundColor: primaryColor }} className="px-3 h-10 items-start justify-center rounded-2xl">
                            <Text style={[Textstyles.text_small, { color: "#ffffff" }]}>
                                Send a job request
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <DraggablePanel backgroundColor={backgroundColor}>
                        <ScrollView contentContainerStyle={{ paddingVertical: 20 }}>
                            <ProfessionalDetails data={data} />
                        </ScrollView>
                    </DraggablePanel>
                </ImageBackground>
            </View>
        </>
    )
}

export default ProfessionalProfile

interface ProfessionalDetailsProps {
    data: ProfessionalData;
}

const ProfessionalDetails = ({ data }: ProfessionalDetailsProps) => {
    const { theme } = useTheme()
    const { secondaryTextColor, primaryColor, backgroundColortwo, backgroundColor, selectioncardColor } = getColors(theme)
    const workExpArray = data.profile.experience ?? []
    const portfolioArr = data.profile.portfolio ?? []
    const educationArr = data.profile.education ?? []
    const professionalReviewsArr = data.profile.user.professionalReviews ?? []
    const certificationArr = data.profile.certification ?? []

    return (
        <>
            <View className="w-full h-full rounded-t-2xl px-3">
                <ThemeText size={Textstyles.text_medium}>
                    Overview
                </ThemeText>
                <View className={`${theme === "dark" ? "border-slate-300" : "border-slate-400"} border-b`} />
                <EmptyView height={10} />
                <ThemeText size={Textstyles.text_cmedium} >
                    About
                </ThemeText>
                <Text style={[Textstyles.text_xsma, { color: secondaryTextColor }]}>
                    {data.intro}
                </Text>
                <ThemeText size={Textstyles.text_cmedium} >
                    Work Experience
                </ThemeText>

                {workExpArray.length > 0 ? workExpArray.map((item) => (
                    <View key={item.id}>
                        <EmptyView height={10} />
                        <View>
                            <Text style={[Textstyles.text_cmedium, { color: secondaryTextColor }]}>
                                {item.postHeld}
                            </Text>
                            <Text style={[Textstyles.text_xsma, { color: secondaryTextColor }]}>
                                {item.workPlace}
                            </Text>
                            <Text style={[Textstyles.text_xsma, { color: secondaryTextColor }]}>
                                {item.startDate}- {item.endDate}
                            </Text>
                        </View>
                    </View>
                )) : <Text style={[Textstyles.text_cmedium, { color: secondaryTextColor }]}>
                    No Record for Work Experience
                </Text>}
               
                <EmptyView height={10} />
                <ThemeText size={Textstyles.text_medium} >
                    Portfolio and Work Samples
                </ThemeText>
                {portfolioArr.length > 0 ?
                    portfolioArr.map((item) => (
                        <View key={item.id}>
                            <EmptyView height={10} />
                            <View>
                                <Text style={[Textstyles.text_small, { color: secondaryTextColor }]}>
                                    {item.title}
                                </Text>
                                <EmptyView height={6} />
                                <Text style={[Textstyles.text_xsma, { color: secondaryTextColor }]}>
                                    {item.description}
                                </Text>
                                <EmptyView height={6} />
                                <View className="flex-row justify-around gap-x-2">
                                    <Image resizeMode="contain" source={require('../../../assets/samplework.png')} className="w-16 h-16 rounded-xl" />
                                    <Image resizeMode="contain" source={require('../../../assets/samplework.png')} className="w-16 h-16 rounded-xl" />
                                    <Image resizeMode="contain" source={require('../../../assets/samplework.png')} className="w-16 h-16 rounded-xl" />
                                    <Image resizeMode="contain" source={require('../../../assets/samplework.png')} className="w-16 h-16 rounded-xl" />
                                    <Image resizeMode="contain" source={require('../../../assets/samplework.png')} className="w-16 h-16 rounded-xl" />
                                </View>
                            </View>
                        </View>
                    )) : <Text style={[Textstyles.text_cmedium, { color: secondaryTextColor }]}>
                    No Record for Portfolio
                </Text>}
               
                <EmptyView height={10} />
                <ThemeText size={Textstyles.text_medium} >
                    Work Complete
                </ThemeText>
                <EmptyView height={10} />
                <View style={{ backgroundColor: selectioncardColor, elevation: 4 }} className="w-full px-3 py-2 h-36 rounded-2xl shadow-slate-300 shadow-sm justify-center">
                    <Text style={[Textstyles.text_small, { color: secondaryTextColor }]}>
                        Residential Renovation-Kitchen Remodelling
                    </Text>
                    <EmptyView height={6} />
                    <Text style={[Textstyles.text_xsma, { color: secondaryTextColor }]}>
                        Managed a Kitchen remodeling project, including
                        new cabinetry, electrical work and plumbing
                        upgrade
                    </Text>
                    <EmptyView height={6} />
                    <View className="flex-row justify-between">
                        <Text style={[Textstyles.text_small]} className="text-green-500">
                            N50,000
                        </Text>
                        <View className="flex-row gap-x-2">
                            <FontAwesome6 name="location-dot" size={12} color={primaryColor} />
                            <Text style={[Textstyles.text_xsma, { color: secondaryTextColor }]}>
                                Akure, Ondo State
                            </Text>
                        </View>
                    </View>
                    <Divider />
                    <EmptyView height={6} />
                    <View className="flex-row justify-between">
                        <View className="flex-row gap-x-2">
                            <FontAwesome6 name="location-dot" size={12} color={primaryColor} />
                            <Text style={[Textstyles.text_xsma, { color: secondaryTextColor }]}>
                                July 23, 2023
                            </Text>
                        </View>
                        <View className="flex-row gap-x-2">
                            <FontAwesome6 name="clock" size={12} color={primaryColor} />
                            <Text style={[Textstyles.text_xsma, { color: secondaryTextColor }]}>
                                3 months ago
                            </Text>
                        </View>
                    </View>
                </View>
                
                <EmptyView height={10} />
                <ThemeText size={Textstyles.text_medium} >
                    Education
                </ThemeText>
                {educationArr.length > 0 ? educationArr.map((item) => (
                    <View key={item.id}>
                        <EmptyView height={10} />
                        <View>
                            <Text style={[Textstyles.text_small, { color: secondaryTextColor }]}>
                                {item.course}
                            </Text>
                            <EmptyView height={6} />
                            <Text style={[Textstyles.text_xsma, { color: secondaryTextColor }]}>
                                {item.school}
                            </Text>
                            <EmptyView height={6} />
                        </View>
                    </View>
                )) : <Text style={[Textstyles.text_cmedium, { color: secondaryTextColor }]}>
                    No Record for Education
                </Text>}
                
                <Divider />
                <EmptyView height={10} />
                <ThemeText size={Textstyles.text_medium} >
                    Review
                </ThemeText>
               
                {professionalReviewsArr.length > 0 ? professionalReviewsArr.map((item) => (
                    <View key={item.id}>
                        <EmptyView height={10} />
                        <Text style={[Textstyles.text_small, { color: secondaryTextColor }]}>
                            {item.clientUser.profile.firstName} {item.clientUser.profile.lastName}
                        </Text>
                        <EmptyView height={6} />
                        <Text style={[Textstyles.text_xsma, { color: secondaryTextColor }]}>
                            {item.review}
                        </Text>
                        <EmptyView height={6} />
                        <RatingStar numberOfStars={item.rating} />
                        <EmptyView height={6} />
                        <Divider />
                    </View>
                )) : <Text style={[Textstyles.text_cmedium, { color: secondaryTextColor }]}>
                    No Reviews
                </Text>}
                
                <EmptyView height={10} />
                <ThemeText size={Textstyles.text_medium} >
                    Language
                </ThemeText>
                <EmptyView height={10} />
                <Text style={[Textstyles.text_small, { color: secondaryTextColor }]}>
                    {data.language}
                </Text>
                <EmptyView height={6} />

                <Divider />
                <EmptyView height={10} />
                {certificationArr.length > 0 ? certificationArr.map((item) => (
                    <View key={item.id}>
                        <ThemeText size={Textstyles.text_medium} >
                            Certification
                        </ThemeText>
                        <EmptyView height={10} />
                        <Text style={[Textstyles.text_small, { color: secondaryTextColor }]}>
                            {item.title}
                        </Text>
                        <Text style={[Textstyles.text_xsma, { color: secondaryTextColor }]}>
                            {item.date}
                        </Text>
                    </View>
                )) : <Text style={[Textstyles.text_cmedium, { color: secondaryTextColor }]}>
                    No Certifications
                </Text>}
            </View>
        </>
    )
}