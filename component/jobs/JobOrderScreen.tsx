import { useMutation, useQuery } from "@tanstack/react-query"
import { AlertMessageBanner } from "component/AlertMessageBanner"
import InputComponent, { InputComponentTextarea } from "component/controls/textinput"
import { ProfessionalDetailsWithoutChat } from "component/dashboardComponent/clientdetail"
import ContainerTemplate from "component/dashboardComponent/containerTemplate"
import HeaderComponent from "component/headerComp"
import { ThemeTextsecond } from "component/ThemeText"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useCurrentLocation } from "hooks/useLocation"
import { useTheme } from "hooks/useTheme"
import { useEffect, useState } from "react"
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
    Modal,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { createJobFn } from "services/userService"
import { getColors } from "static/color"
import { Textstyles } from "static/textFontsize"
import DateTimePicker from '@react-native-community/datetimepicker'
import { sectorUrl, skillsUrl } from "utilizes/endpoints"
import axios from "axios"
import EmptyView from "component/emptyview"

const states = ['Lagos', 'Abuja', 'Port Harcourt', 'Kano', 'Ibadan', 'Benin City', 'Enugu', 'Aba', 'Jos', 'Ilorin', 'Oyo', 'Ondo', 'Maiduguri', 'Warri', 'Uyo']
const lgas: Record<string, string[]> = {
    'Lagos': ['Ikeja', 'Lagos Island', 'Eti-Osa', 'Surulere', 'Apapa', 'Agege', 'Ifako-Ijaiye', 'Kosofe', 'Mushin', 'Oshodi-Isolo'],
    'Abuja': ['Abuja Municipal', 'Bwari', 'Gwagwalada', 'Kuje', 'Kwali', 'Abaji'],
    'Port Harcourt': ['Obio-Akpor', 'Port Harcourt', 'Oyigbo', 'Okrika', 'Eleme', 'Ikwerre', 'Omuma'],
    'Kano': ['Kano Municipal', 'Nassarawa', 'Dala', 'Fagge', 'Gwale', 'Tarauni', 'Ungogo', 'Dawakin Tofa'],
    'Ibadan': ['Ibadan North', 'Ibadan South', 'Ibadan East', 'Ibadan West', 'Ibadan North-East', 'Ibadan North-West'],
    'Benin City': ['Oredo', 'Ikpoba-Okha', 'Ovia North-East', 'Ovia South-West', 'Uhunmwonde', 'Orhionmwon'],
    'Enugu': ['Enugu North', 'Enugu South', 'Enugu East', 'Enugu West', 'Nsukka', 'Udi', 'Ezeagu', 'Igbo-Eze'],
    'Aba': ['Aba North', 'Aba South', 'Obingwa', 'Osisioma', 'Ukwa East', 'Ukwa West'],
    'Jos': ['Jos North', 'Jos South', 'Jos East', 'Barkin Ladi', 'Bassa', 'Bokkos', 'Kanam', 'Kanke'],
    'Ilorin': ['Ilorin West', 'Ilorin East', 'Ilorin South', 'Moro', 'Ifelodun', 'Oyun', 'Offa', 'Oke-Ero'],
    'Oyo': ['Ibadan North', 'Ibadan South', 'Ibadan East', 'Ibadan West', 'Iseyin', 'Oyo', 'Ogbomoso', 'Saki'],
    'Ondo': ['Akure South', 'Akure North', 'Ose', 'Idanre', 'Ifedore', 'Owo'],
    'Maiduguri': ['Maiduguri', 'Jere', 'Konduga', 'Mafa', 'Dikwa', 'Bama', 'Gwoza', 'Kukawa'],
    'Warri': ['Warri South', 'Warri North', 'Ughelli North', 'Ughelli South', 'Ethiope East', 'Ethiope West', 'Sapele', 'Okpe'],
    'Uyo': ['Uyo', 'Eket', 'Ikot Ekpene', 'Obot Akara', 'Oruk Anam', 'Ini', 'Ibeno', 'Itu'],
}

const JobOrderScreen = () => {
    const [showmanuallocation, setShowmanuallocation] = useState(true)
    const { theme } = useTheme()
    const { primaryColor, secondaryTextColor, selectioncardColor, borderColor, successColor, backgroundColortwo } = getColors(theme)
    const { fullName, rating, avatar, professionalId } = useLocalSearchParams()
    const router = useRouter()
    
    // Debug: Log the professionalId to see what we're getting
    console.log('JobOrderScreen - professionalId:', professionalId, 'type:', typeof professionalId, 'length:', professionalId?.length)

    const [currentStep, setCurrentStep] = useState(1)
    const totalSteps = 4

    const [jobData, setJobData] = useState({
        title: '',
        description: '',
        category: '',
        skillsRequired: [] as string[],
        startDate: new Date(),
        deadline: new Date(),
        priority: 'NORMAL' as 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT',
        mode: 'PHYSICAL' as 'PHYSICAL' | 'VIRTUAL',
        state: '',
        lga: '',
        address: '',
        latitude: null as number | null,
        longitude: null as number | null,
        numOfJobs: 1,
    })

    const [manualaddress, setManualAddress] = useState('')
    const { address, loading: locationLoading, error: locationError } = useCurrentLocation()
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)

    const [showStartDatePicker, setShowStartDatePicker] = useState(false)
    const [showDeadlinePicker, setShowDeadlinePicker] = useState(false)

    // State/LGA modal
    const [showOption, setShowOption] = useState(false)
    const [isStateSelection, setIsStateSelection] = useState(true)
    
    // Success modal
    const [showSuccessModal, setShowSuccessModal] = useState(false)

    const { data: sectorsData, isLoading: sectorsLoading, error: sectorsError } = useQuery({
        queryKey: ['sectors'],
        queryFn: async () => {
            const response = await axios.get(sectorUrl)
            return response.data.data || response.data
        },
        retry: 2,
    })

    const jobCategories = sectorsData?.map((sector: any) => ({
        id: sector.id.toString(),
        name: sector.title,
        icon: 'briefcase',
    })) || []

    const { data: skillsData, isLoading: skillsLoading, error: skillsError } = useQuery({
        queryKey: ['skills'],
        queryFn: async () => {
            const response = await axios.get(skillsUrl)
            return response.data.data || response.data
        },
        retry: 2,
    })

    const availableSkills = skillsData?.map((skill: any) => skill.name) || []

    useEffect(() => {
        if (errorMessage) {
            const timer = setTimeout(() => setErrorMessage(null), 4000)
            return () => clearTimeout(timer)
        }
    }, [errorMessage])

    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => setSuccessMessage(null), 4000)
            return () => clearTimeout(timer)
        }
    }, [successMessage])

    const safeFullName = Array.isArray(fullName) ? fullName[0] : fullName ?? ""
    const safeRating = Array.isArray(rating) ? rating[0] : rating ?? 0
    const safeAvatar = Array.isArray(avatar) ? avatar[0] : avatar ?? 0
    const safeProfessionalId = Array.isArray(professionalId) ? professionalId[0] : professionalId ?? ""
    
    // Validate that professionalId is a valid UUID
    const isValidUUID = (id: string) => {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
        return uuidRegex.test(id)
    }
    
    if (!safeProfessionalId || !isValidUUID(safeProfessionalId)) {
        console.error('Invalid professionalId:', safeProfessionalId)
        setErrorMessage('Invalid professional selected. Please go back and select a professional.')
        return
    }

    const validateStep = (step: number) => {
        switch (step) {
            case 1:
                return jobData.title.trim().length >= 3 &&
                    jobData.description.trim().length >= 10 &&
                    jobData.category &&
                    jobData.skillsRequired.length > 0
            case 2:
                return jobData.startDate &&
                    jobData.deadline &&
                    jobData.deadline > jobData.startDate &&
                    true
            case 3:
                if (jobData.mode === 'PHYSICAL') {
                    return jobData.state && jobData.lga
                }
                return true
            case 4:
                return true
            default:
                return false
        }
    }

    const getStepErrors = (step: number) => {
        const errors: string[] = []
        switch (step) {
            case 1:
                if (!jobData.title.trim()) errors.push('Job title is required')
                else if (jobData.title.trim().length < 3) errors.push('Title must be at least 3 characters')
                if (!jobData.description.trim()) errors.push('Description is required')
                else if (jobData.description.trim().length < 10) errors.push('Description must be at least 10 characters')
                if (!jobData.category) errors.push('Please select a category')
                if (jobData.skillsRequired.length === 0) errors.push('Please select at least one skill')
                break
            case 2:
                if (!jobData.startDate) errors.push('Start date is required')
                if (!jobData.deadline) errors.push('Deadline is required')
                if (jobData.deadline && jobData.startDate && jobData.deadline <= jobData.startDate) {
                    errors.push('Deadline must be after start date')
                }
                break
            case 3:
                if (jobData.mode === 'PHYSICAL') {
                    if (!jobData.state) errors.push('State is required')
                    if (!jobData.lga) errors.push('LGA is required')
                }
                break
        }
        return errors
    }

    const handleNextStep = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(Math.min(currentStep + 1, totalSteps))
            setErrorMessage(null)
        } else {
            const errors = getStepErrors(currentStep)
            setErrorMessage(errors[0] || 'Please fill in all required fields')
        }
    }

    const handlePrevStep = () => setCurrentStep(Math.max(currentStep - 1, 1))

    const handleJobDataChange = (field: string, value: any) => {
        setJobData(prev => ({ ...prev, [field]: value }))
    }

    const handleSkillToggle = (skill: string) => {
        setJobData(prev => ({
            ...prev,
            skillsRequired: prev.skillsRequired.includes(skill)
                ? prev.skillsRequired.filter(s => s !== skill)
                : [...prev.skillsRequired, skill],
        }))
    }

    const mutation = useMutation({
        mutationFn: createJobFn,
        onSuccess: () => {
            setShowSuccessModal(true)
        },
        onError: (error: any) => {
            let msg = "An unexpected error occurred"
            if (error?.response?.data) {
                msg = error.response.data.message || error.response.data.error || JSON.stringify(error.response.data)
            } else if (error?.message) {
                msg = error.message
            }
            console.error(msg)
            setErrorMessage(msg)
        },
    })

    const handleCreateJob = () => {
        let finaladdress = jobData.address
        if (jobData.mode === 'PHYSICAL') {
            if (showmanuallocation) {
                if (!manualaddress) { setErrorMessage('Please enter address'); return }
                finaladdress = manualaddress
            } else {
                // Use state and LGA to create address if no manual address
                if (jobData.state && jobData.lga) {
                    finaladdress = `${jobData.lga}, ${jobData.state}`
                } else {
                    finaladdress = address
                }
            }
        }
        if (!finaladdress && jobData.mode === 'PHYSICAL') {
            setErrorMessage('Please select state and LGA or enter address manually.')
            return
        }
        mutation.mutate({
            title: jobData.title,
            description: jobData.description,
            address: finaladdress || 'Virtual job',
            professionalId: safeProfessionalId,
            numOfJobs: jobData.numOfJobs,
            mode: jobData.mode,
            // Include additional fields
            categoryId: jobData.category,
            startDate: jobData.startDate.toISOString(),
            deadline: jobData.deadline.toISOString(),
            priority: jobData.priority,
            state: jobData.mode === 'PHYSICAL' ? jobData.state : undefined,
            lga: jobData.mode === 'PHYSICAL' ? jobData.lga : undefined,
            skillsRequired: jobData.skillsRequired,
        })
    }

    const currentLgas = jobData.state && lgas[jobData.state] ? lgas[jobData.state] : []
    const modalData = isStateSelection ? states : currentLgas

    return (
        <>
            {successMessage && <AlertMessageBanner type="success" message={successMessage} />}
            {errorMessage && <AlertMessageBanner type="error" message={errorMessage} />}

            {/* State / LGA bottom sheet modal */}
            <Modal
                visible={showOption}
                transparent
                animationType="slide"
                onRequestClose={() => setShowOption(false)}
            >
                <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.45)' }}>
                    <View style={{
                        backgroundColor: theme === 'dark' ? '#1F2937' : '#fff',
                        borderTopLeftRadius: 24,
                        borderTopRightRadius: 24,
                        maxHeight: '60%',
                        paddingHorizontal: 16,
                        paddingBottom: 32,
                        paddingTop: 16,
                    }}>
                        {/* Handle bar */}
                        <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: '#D1D5DB', alignSelf: 'center', marginBottom: 16 }} />

                        {/* Header */}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                            <Text style={{ fontSize: 16, fontWeight: '700', color: theme === 'dark' ? '#fff' : '#1F2937' }}>
                                {isStateSelection ? 'Select State' : 'Select LGA'}
                            </Text>
                            <TouchableOpacity onPress={() => setShowOption(false)}>
                                <Ionicons name="close-circle" size={26} color={secondaryTextColor} />
                            </TouchableOpacity>
                        </View>

                        {/* List */}
                        <ScrollView showsVerticalScrollIndicator={false}>
                            {modalData.map((item) => (
                                <TouchableOpacity
                                    key={item}
                                    onPress={() => {
                                        if (isStateSelection) {
                                            handleJobDataChange('state', item)
                                            handleJobDataChange('lga', '') // reset LGA when state changes
                                        } else {
                                            handleJobDataChange('lga', item)
                                        }
                                        setShowOption(false)
                                    }}
                                    style={{
                                        paddingVertical: 14,
                                        borderBottomWidth: 1,
                                        borderBottomColor: borderColor,
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                    }}
                                >
                                    <Text style={{ color: secondaryTextColor, fontSize: 14 }}>{item}</Text>
                                    {(isStateSelection ? jobData.state === item : jobData.lga === item) && (
                                        <Ionicons name="checkmark-circle" size={18} color={primaryColor} />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Success Modal Overlay */}
            <Modal
                visible={showSuccessModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowSuccessModal(false)}
            >
                <View className="flex-1 justify-center items-center bg-black/50">
                    <View 
                        className="w-11/12 max-w-sm rounded-2xl p-6 items-center"
                        style={{ backgroundColor: theme === 'dark' ? '#1F2937' : '#fff' }}
                    >
                        {/* Success Icon */}
                        <View 
                            className="w-16 h-16 rounded-full items-center justify-center mb-4"
                            style={{ backgroundColor: successColor + '15' }}
                        >
                            <Ionicons name="checkmark-circle" size={40} color={successColor} />
                        </View>

                        {/* Success Text */}
                        <Text style={{ 
                            color: theme === 'dark' ? '#F9FAFB' : '#1F2937', 
                            fontSize: 20, 
                            fontWeight: '700', 
                            textAlign: 'center', 
                            marginBottom: 8 
                        }}>
                            Job Request Sent!
                        </Text>
                        <Text style={{ 
                            color: theme === 'dark' ? '#D1D5DB' : secondaryTextColor, 
                            fontSize: 14, 
                            textAlign: 'center', 
                            marginBottom: 24, 
                            lineHeight: 20 
                        }}>
                            Your job request has been successfully sent to the professional. They will review your request and respond shortly.
                        </Text>

                        {/* Action Buttons */}
                        <View className="w-full gap-3">
                            <TouchableOpacity
                                onPress={() => {
                                    setShowSuccessModal(false)
                                    router.replace('/(Authenticated)/(dashboard)/homelayout')
                                }}
                                className="w-full py-3 rounded-xl items-center"
                                style={{ backgroundColor: primaryColor }}
                            >
                                <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>
                                    Go to Home
                                </Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity
                                onPress={() => setShowSuccessModal(false)}
                                className="w-full py-3 rounded-xl items-center"
                                style={{ backgroundColor: theme === 'dark' ? '#374151' : '#F3F4F6' }}
                            >
                                <Text style={{ 
                                    color: theme === 'dark' ? '#D1D5DB' : '#6B7280', 
                                    fontWeight: '600', 
                                    fontSize: 16 
                                }}>
                                    View Request
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <ContainerTemplate>
                <HeaderComponent title={`Request a Job - Step ${currentStep}/${totalSteps}`} />

                {/* Progress Indicator */}
                <View className="flex-row justify-between items-center px-4 py-3 mb-4">
                    {[1, 2, 3, 4].map((step) => (
                        <View key={step} className="flex-1 items-center">
                            <View
                                className="w-8 h-8 rounded-full items-center justify-center"
                                style={{
                                    backgroundColor: step <= currentStep ? primaryColor : '#E5E7EB',
                                    borderWidth: 2,
                                    borderColor: step <= currentStep ? primaryColor : '#E5E7EB',
                                }}
                            >
                                <Text style={{ color: step <= currentStep ? '#fff' : '#9CA3AF', fontSize: 12, fontWeight: '600' }}>
                                    {step}
                                </Text>
                            </View>
                            <Text style={{ color: secondaryTextColor, fontSize: 10, marginTop: 4, textAlign: 'center' }}>
                                {step === 1 ? 'Details' : step === 2 ? 'Timeline' : step === 3 ? 'Location' : 'Review'}
                            </Text>
                        </View>
                    ))}
                </View>

                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === "ios" ? "padding" : undefined}
                    keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 0}
                >
                    <ScrollView
                        contentContainerStyle={{ paddingBottom: 40, paddingTop: 16 }}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* Professional Card */}
                        <View style={{ backgroundColor: selectioncardColor, borderColor }} className="rounded-2xl p-4 border mb-5">
                            <View className="flex-row items-center mb-2" style={{ gap: 8 }}>
                                <Ionicons name="person-outline" size={16} color={primaryColor} />
                                <Text style={{ color: secondaryTextColor, fontSize: 12, fontWeight: '600', letterSpacing: 0.3 }}>
                                    HIRING PROFESSIONAL
                                </Text>
                            </View>
                            <ProfessionalDetailsWithoutChat
                                fullName={safeFullName}
                                avatar={safeAvatar}
                                rating={safeRating}
                            />
                        </View>

                        {/* Step 1: Job Details */}
                        {currentStep === 1 && (
                            <View style={{ backgroundColor: selectioncardColor, borderColor }} className="rounded-2xl p-4 border mb-5">
                                <View className="flex-row items-center mb-4" style={{ gap: 8 }}>
                                    <Ionicons name="briefcase-outline" size={16} color={primaryColor} />
                                    <Text style={{ color: secondaryTextColor, fontSize: 12, fontWeight: '600', letterSpacing: 0.3 }}>
                                        JOB DETAILS
                                    </Text>
                                </View>

                                <ThemeTextsecond size={Textstyles.text_small}>Category</ThemeTextsecond>
                                <View className="mt-1 mb-4">
                                    {sectorsLoading ? (
                                        <View className="flex-row items-center justify-center py-4" style={{ gap: 8 }}>
                                            <ActivityIndicator size="small" color={primaryColor} />
                                            <Text style={{ color: secondaryTextColor, fontSize: 13 }}>Loading categories...</Text>
                                        </View>
                                    ) : sectorsError ? (
                                        <View className="flex-row items-center py-4" style={{ gap: 8 }}>
                                            <Ionicons name="alert-circle" size={18} color={backgroundColortwo} />
                                            <Text style={{ color: backgroundColortwo, fontSize: 13, flex: 1 }}>Failed to load categories.</Text>
                                        </View>
                                    ) : (
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                            <View className="flex-row gap-2">
                                                {jobCategories.map((cat: any) => (
                                                    <TouchableOpacity
                                                        key={cat.id}
                                                        onPress={() => handleJobDataChange('category', cat.id)}
                                                        className="px-4 py-2 rounded-xl border"
                                                        style={{
                                                            backgroundColor: jobData.category === cat.id ? primaryColor + '15' : 'transparent',
                                                            borderColor: jobData.category === cat.id ? primaryColor : borderColor,
                                                        }}
                                                    >
                                                        <View className="flex-row items-center" style={{ gap: 6 }}>
                                                            <Ionicons name={cat.icon as any} size={14} color={jobData.category === cat.id ? primaryColor : secondaryTextColor} />
                                                            <Text style={{ color: jobData.category === cat.id ? primaryColor : secondaryTextColor, fontSize: 12, fontWeight: '600' }}>
                                                                {cat.name}
                                                            </Text>
                                                        </View>
                                                    </TouchableOpacity>
                                                ))}
                                            </View>
                                        </ScrollView>
                                    )}
                                </View>

                                <ThemeTextsecond size={Textstyles.text_small}>Job Title</ThemeTextsecond>
                                <View className="mt-1 mb-4">
                                    <InputComponent
                                        color={primaryColor}
                                        placeholder="e.g. Kitchen Remodeling"
                                        placeholdercolor={secondaryTextColor}
                                        value={jobData.title}
                                        onChange={(value) => handleJobDataChange('title', value)}
                                    />
                                </View>

                                <ThemeTextsecond size={Textstyles.text_small}>Description</ThemeTextsecond>
                                <View className="mt-1 mb-4">
                                    <InputComponentTextarea
                                        color={primaryColor}
                                        placeholder="Describe what you need done..."
                                        placeholdercolor={secondaryTextColor}
                                        onChange={(value) => handleJobDataChange('description', value)}
                                        value={jobData.description}
                                    />
                                </View>

                                <ThemeTextsecond size={Textstyles.text_small}>Skills Required</ThemeTextsecond>
                                <View className="mt-1 mb-4">
                                    {skillsLoading ? (
                                        <View className="flex-row items-center justify-center py-4" style={{ gap: 8 }}>
                                            <ActivityIndicator size="small" color={primaryColor} />
                                            <Text style={{ color: secondaryTextColor, fontSize: 13 }}>Loading skills...</Text>
                                        </View>
                                    ) : skillsError ? (
                                        <View className="flex-row items-center py-4" style={{ gap: 8 }}>
                                            <Ionicons name="alert-circle" size={18} color={backgroundColortwo} />
                                            <Text style={{ color: backgroundColortwo, fontSize: 13, flex: 1 }}>Failed to load skills.</Text>
                                        </View>
                                    ) : (
                                        <View className="flex-row flex-wrap gap-2">
                                            {availableSkills.slice(0, 12).map((skill: any) => (
                                                <TouchableOpacity
                                                    key={skill}
                                                    onPress={() => handleSkillToggle(skill)}
                                                    className="px-3 py-1.5 rounded-full border"
                                                    style={{
                                                        backgroundColor: jobData.skillsRequired.includes(skill) ? primaryColor + '15' : 'transparent',
                                                        borderColor: jobData.skillsRequired.includes(skill) ? primaryColor : borderColor,
                                                    }}
                                                >
                                                    <Text style={{ color: jobData.skillsRequired.includes(skill) ? primaryColor : secondaryTextColor, fontSize: 11, fontWeight: '500' }}>
                                                        {skill}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    )}
                                </View>

                                <ThemeTextsecond size={Textstyles.text_small}>Number of Jobs</ThemeTextsecond>
                                <View className="mt-1">
                                    <InputComponent
                                        keyboardType="numeric"
                                        color={primaryColor}
                                        placeholder="1"
                                        placeholdercolor={secondaryTextColor}
                                        value={jobData.numOfJobs.toString()}
                                        onChange={(value) => handleJobDataChange('numOfJobs', parseInt(value) || 1)}
                                    />
                                </View>
                            </View>
                        )}

                        {/* Step 2: Timeline & Budget */}
                        {currentStep === 2 && (
                            <View style={{ backgroundColor: selectioncardColor, borderColor }} className="rounded-2xl p-4 border mb-5">
                                <View className="flex-row items-center mb-4" style={{ gap: 8 }}>
                                    <Ionicons name="calendar-outline" size={16} color={primaryColor} />
                                    <Text style={{ color: secondaryTextColor, fontSize: 12, fontWeight: '600', letterSpacing: 0.3 }}>
                                        TIMELINE & BUDGET
                                    </Text>
                                </View>

                                <ThemeTextsecond size={Textstyles.text_small}>Start Date</ThemeTextsecond>
                                <TouchableOpacity
                                    className="mt-1 mb-4 p-3 rounded-xl border"
                                    style={{ borderColor }}
                                    onPress={() => setShowStartDatePicker(true)}
                                >
                                    <Text style={{ color: primaryColor, fontSize: 14 }}>
                                        {jobData.startDate.toLocaleDateString()}
                                    </Text>
                                </TouchableOpacity>

                                <ThemeTextsecond size={Textstyles.text_small}>Deadline</ThemeTextsecond>
                                <TouchableOpacity
                                    className="mt-1 mb-4 p-3 rounded-xl border"
                                    style={{ borderColor }}
                                    onPress={() => setShowDeadlinePicker(true)}
                                >
                                    <Text style={{ color: primaryColor, fontSize: 14 }}>
                                        {jobData.deadline.toLocaleDateString()}
                                    </Text>
                                </TouchableOpacity>


                                <ThemeTextsecond size={Textstyles.text_small} >Priority</ThemeTextsecond>
                                <View className="flex-row gap-2 mt-2">
                                    {(['LOW', 'NORMAL', 'HIGH', 'URGENT'] as const).map((priority) => (
                                        <TouchableOpacity
                                            key={priority}
                                            onPress={() => handleJobDataChange('priority', priority)}
                                            className="px-3 py-2 rounded-xl border"
                                            style={{
                                                backgroundColor: jobData.priority === priority ? primaryColor + '15' : 'transparent',
                                                borderColor: jobData.priority === priority ? primaryColor : borderColor,
                                            }}
                                        >
                                            <Text style={{ color: jobData.priority === priority ? primaryColor : secondaryTextColor, fontSize: 12, fontWeight: '600' }}>
                                                {priority}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        )}

                        {/* Step 3: Location */}
                        {currentStep === 3 && (
                            <View style={{ backgroundColor: selectioncardColor, borderColor }} className="rounded-2xl p-4 border mb-5">
                                <View className="flex-row items-center mb-4" style={{ gap: 8 }}>
                                    <Ionicons name="location-outline" size={16} color={primaryColor} />
                                    <Text style={{ color: secondaryTextColor, fontSize: 12, fontWeight: '600', letterSpacing: 0.3 }}>
                                        JOB LOCATION
                                    </Text>
                                </View>

                                {/* Mode Toggle */}
                                <View className="flex-row mb-4" style={{ gap: 8 }}>
                                    {(['PHYSICAL', 'VIRTUAL'] as const).map((mode) => (
                                        <TouchableOpacity
                                            key={mode}
                                            onPress={() => handleJobDataChange('mode', mode)}
                                            className="flex-1 flex-row items-center justify-center py-2.5 rounded-xl"
                                            style={{
                                                backgroundColor: jobData.mode === mode ? primaryColor + '15' : 'transparent',
                                                borderWidth: 1.5,
                                                borderColor: jobData.mode === mode ? primaryColor : borderColor,
                                                gap: 6,
                                            }}
                                        >
                                            <Ionicons
                                                name={mode === 'PHYSICAL' ? 'business-outline' : 'globe-outline'}
                                                size={16}
                                                color={jobData.mode === mode ? primaryColor : secondaryTextColor}
                                            />
                                            <Text style={{ color: jobData.mode === mode ? primaryColor : secondaryTextColor, fontSize: 13, fontWeight: '600' }}>
                                                {mode === 'PHYSICAL' ? 'Physical' : 'Virtual'}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                {jobData.mode === 'PHYSICAL' && (
                                    <>
                                        {/* State and LGA */}
                                        <View className="flex-row mb-3" style={{ gap: 8 }}>
                                            <TouchableOpacity
                                                onPress={() => { setIsStateSelection(true); setShowOption(true) }}
                                                className="flex-1 py-3 rounded-xl border"
                                                style={{ borderColor }}
                                            >
                                                <Text style={{ color: jobData.state ? primaryColor : secondaryTextColor, textAlign: 'center' }}>
                                                    {jobData.state || 'Select State'}
                                                </Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                onPress={() => { if (jobData.state) { setIsStateSelection(false); setShowOption(true) } }}
                                                className="flex-1 py-3 rounded-xl border"
                                                style={{ borderColor, opacity: jobData.state ? 1 : 0.5 }}
                                                disabled={!jobData.state}
                                            >
                                                <Text style={{ color: jobData.lga ? primaryColor : secondaryTextColor, textAlign: 'center' }}>
                                                    {jobData.lga || 'Select LGA'}
                                                </Text>
                                            </TouchableOpacity>
                                        </View>

                                        {/* Location input toggle */}
                                        <View className="flex-row mb-3" style={{ gap: 8 }}>
                                            <TouchableOpacity
                                                onPress={() => setShowmanuallocation(true)}
                                                className="flex-1 flex-row items-center justify-center py-2.5 rounded-xl"
                                                style={{
                                                    backgroundColor: showmanuallocation ? primaryColor + '15' : 'transparent',
                                                    borderWidth: 1.5,
                                                    borderColor: showmanuallocation ? primaryColor : borderColor,
                                                    gap: 6,
                                                }}
                                            >
                                                <Ionicons name="navigate-outline" size={16} color={showmanuallocation ? primaryColor : secondaryTextColor} />
                                                <Text style={{ color: showmanuallocation ? primaryColor : secondaryTextColor, fontSize: 13, fontWeight: '600' }}>
                                                    Auto-detect
                                                </Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                onPress={() => setShowmanuallocation(false)}
                                                className="flex-1 flex-row items-center justify-center py-2.5 rounded-xl"
                                                style={{
                                                    backgroundColor: !showmanuallocation ? primaryColor + '15' : 'transparent',
                                                    borderWidth: 1.5,
                                                    borderColor: !showmanuallocation ? primaryColor : borderColor,
                                                    gap: 6,
                                                }}
                                            >
                                                <Ionicons name="pencil-outline" size={16} color={!showmanuallocation ? primaryColor : secondaryTextColor} />
                                                <Text style={{ color: !showmanuallocation ? primaryColor : secondaryTextColor, fontSize: 13, fontWeight: '600' }}>
                                                    Enter Manually
                                                </Text>
                                            </TouchableOpacity>
                                        </View>

                                        {showmanuallocation ? (
                                            <View className="rounded-xl p-3 mb-4" style={{ backgroundColor: theme === 'dark' ? '#1F2937' : '#F9FAFB' }}>
                                                {locationLoading ? (
                                                    <View className="flex-row items-center" style={{ gap: 8 }}>
                                                        <ActivityIndicator size="small" color={primaryColor} />
                                                        <Text style={{ color: secondaryTextColor, fontSize: 13 }}>Detecting your location...</Text>
                                                    </View>
                                                ) : locationError ? (
                                                    <View className="flex-row items-center" style={{ gap: 8 }}>
                                                        <Ionicons name="alert-circle" size={18} color={backgroundColortwo} />
                                                        <Text style={{ color: backgroundColortwo, fontSize: 13, flex: 1 }}>{locationError}. Try entering manually.</Text>
                                                    </View>
                                                ) : address ? (
                                                    <View className="flex-row items-center" style={{ gap: 8 }}>
                                                        <Ionicons name="checkmark-circle" size={18} color={successColor} />
                                                        <Text style={{ color: successColor, fontSize: 13, flex: 1 }}>{address}</Text>
                                                    </View>
                                                ) : (
                                                    <Text style={{ color: secondaryTextColor, fontSize: 13 }}>Waiting for location...</Text>
                                                )}
                                            </View>
                                        ) : (
                                            <InputComponent
                                                color={primaryColor}
                                                placeholder="Enter the job site address"
                                                placeholdercolor={secondaryTextColor}
                                                onChange={(value) => handleJobDataChange('address', value)}
                                                value={jobData.address}
                                            />
                                        )}
                                    </>
                                )}
                            </View>
                        )}

                        {/* Step 4: Review */}
                        {currentStep === 4 && (
                            <View style={{ backgroundColor: selectioncardColor, borderColor }} className="rounded-2xl p-4 border mb-5">
                                <View className="flex-row items-center mb-4" style={{ gap: 8 }}>
                                    <Ionicons name="checkmark-circle-outline" size={16} color={primaryColor} />
                                    <Text style={{ color: secondaryTextColor, fontSize: 12, fontWeight: '600', letterSpacing: 0.3 }}>
                                        REVIEW & SUBMIT
                                    </Text>
                                </View>

                                <View style={{ gap: 12 }}>
                                    {[
                                        { label: 'JOB TITLE', value: jobData.title },
                                        { label: 'CATEGORY', value: jobCategories.find((c: any) => c.id === jobData.category)?.name || 'Not selected' },
                                        { label: 'TIMELINE', value: `${jobData.startDate.toLocaleDateString()} - ${jobData.deadline.toLocaleDateString()}` },
                                        { label: 'PRIORITY', value: jobData.priority },
                                        { label: 'MODE', value: jobData.mode === 'PHYSICAL' ? `Physical - ${jobData.state}, ${jobData.lga}` : 'Virtual' },
                                    ].map(({ label, value }) => (
                                        <View key={label}>
                                            <Text style={{ color: secondaryTextColor, fontSize: 12, fontWeight: '600' }}>{label}</Text>
                                            <Text style={{ color: primaryColor, fontSize: 14, fontWeight: '500' }}>{value}</Text>
                                        </View>
                                    ))}

                                    <View>
                                        <Text style={{ color: secondaryTextColor, fontSize: 12, fontWeight: '600', marginBottom: 6 }}>SKILLS</Text>
                                        <View className="flex-row flex-wrap gap-1">
                                            {jobData.skillsRequired.map((skill) => (
                                                <Text
                                                    key={skill}
                                                    style={{
                                                        color: primaryColor,
                                                        fontSize: 11,
                                                        backgroundColor: primaryColor + '15',
                                                        paddingHorizontal: 8,
                                                        paddingVertical: 2,
                                                        borderRadius: 4,
                                                    }}
                                                >
                                                    {skill}
                                                </Text>
                                            ))}
                                        </View>
                                    </View>
                                </View>
                            </View>
                        )}

                        {/* Navigation Buttons */}
                        <View className={`${currentStep > 1 ? 'flex-row justify-between' : 'flex-row'} gap-3`}>
                                {currentStep > 1 && (
                                    <TouchableOpacity
                                        onPress={handlePrevStep}
                                        className="w-28 py-3 rounded-xl border"
                                        style={{ borderColor }}
                                    >
                                        <Text style={{ color: primaryColor, fontWeight: '600', textAlign: 'center' }}>Previous</Text>
                                    </TouchableOpacity>
                                )}
                                <TouchableOpacity
                                    onPress={currentStep === 4 ? handleCreateJob : handleNextStep}
                                    className={`${currentStep > 1 ? 'w-36' : 'w-full'} py-3 rounded-xl`}
                                    style={{ backgroundColor: primaryColor }}
                                    disabled={mutation.isPending}
                                >
                                    {mutation.isPending ? (
                                        <ActivityIndicator size="small" color="#fff" />
                                    ) : (
                                        <Text style={{ color: '#fff', fontWeight: '600', textAlign: 'center' }}>
                                            {currentStep === 4 ? 'Submit Job Request' : 'Next'}
                                        </Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                    </ScrollView>
                </KeyboardAvoidingView>

                {/* Date Pickers */}
                {showStartDatePicker && (
                    <DateTimePicker
                        value={jobData.startDate}
                        mode="date"
                        display="default"
                        onChange={(event, selectedDate) => {
                            setShowStartDatePicker(false)
                            if (selectedDate) handleJobDataChange('startDate', selectedDate)
                        }}
                    />
                )}
                {showDeadlinePicker && (
                    <DateTimePicker
                        value={jobData.deadline}
                        mode="date"
                        display="default"
                        onChange={(event, selectedDate) => {
                            setShowDeadlinePicker(false)
                            if (selectedDate) handleJobDataChange('deadline', selectedDate)
                        }}
                    />
                )}
            </ContainerTemplate>
        </>
    )
}

export default JobOrderScreen