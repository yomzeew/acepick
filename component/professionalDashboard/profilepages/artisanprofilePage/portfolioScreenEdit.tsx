import { FontAwesome5 } from "@expo/vector-icons"
import ButtonFunction from "component/buttonfunction"
import InputComponent, { InputComponentTextarea } from "component/controls/textinput"
import ContainerTemplate from "component/dashboardComponent/containerTemplate"
import EmptyView from "component/emptyview"
import HeaderComponent from "component/headerComp"
import SliderModalTemplate from "component/slideupModalTemplate"
import { ThemeText, ThemeTextsecond } from "component/ThemeText"
import { useTheme } from "hooks/useTheme"
import { useEffect, useState } from "react"
import { TouchableOpacity, View, Text, Image, ScrollView } from "react-native"
import { getColors } from "static/color"
import { Textstyles } from "static/textFontsize"

const PortfolioScreenEdit = () => {
    const { theme } = useTheme()
    const [showSlideUp, setShowSlideUp] = useState(false)
    const { primaryColor, secondaryTextColor, selectioncardColor, } = getColors(theme)

    const handleShowSlide = () => {
        setShowSlideUp(!showSlideUp)
    }
    return (
        <>
            {showSlideUp &&
                <SliderModalTemplate showmodal={showSlideUp} modalHeight={"90%"} setshowmodal={setShowSlideUp}>
                    <AddPortfolio setShowSlideUp={setShowSlideUp} />
                </SliderModalTemplate>
            }
            <ContainerTemplate>
                <View className="h-full w-full flex-col">
                    <HeaderComponent title={"Portfolio"} />
                    <View className="w-full items-end">
                        <TouchableOpacity onPress={handleShowSlide} className="bg-green-500 px-3 w-20 rounded-2xl items-center justify-center py-2">
                            <Text className="text-white">Add new</Text>
                        </TouchableOpacity>

                    </View>
                    <EmptyView height={20} />
                    <Portfolio />

                </View>
            </ContainerTemplate>
        </>
    )
}
export default PortfolioScreenEdit
interface AddNewPprtfolioProps {
    setShowSlideUp: (value: boolean) => void

}
const AddPortfolio = ({ setShowSlideUp }: AddNewPprtfolioProps) => {
    const { theme } = useTheme()
    const { primaryColor, secondaryTextColor, selectioncardColor, } = getColors(theme)
    
    const [projectTitle, setProjectTitle] = useState("")
    const [description, setDescription] = useState("")
    const [duration, setDuration] = useState("")
    const [projectDate, setProjectDate] = useState("")
    const [chargeAmount, setChargeAmount] = useState("")
    const [portfolioImages, setPortfolioImages] = useState<string[]>([])
    const [errors, setErrors] = useState<{[key: string]: string}>({})

    const formatCurrency = (value: string) => {
        const digits = value.replace(/\D/g, '');
        if (digits === '') return '';
        const number = parseInt(digits);
        return number.toLocaleString();
    }

    const handleChargeAmountChange = (value: string) => {
        const formatted = formatCurrency(value);
        setChargeAmount(formatted);
        setErrors(prev => ({ ...prev, chargeAmount: '' }));
    }

    const validateForm = () => {
        const newErrors: {[key: string]: string} = {};
        
        if (!projectTitle.trim()) {
            newErrors.projectTitle = 'Project title is required';
        }
        if (!description.trim()) {
            newErrors.description = 'Description is required';
        } else if (description.length > 120) {
            newErrors.description = 'Description must be 120 characters or less';
        }
        if (!duration.trim()) {
            newErrors.duration = 'Duration is required';
        }
        if (!projectDate) {
            newErrors.projectDate = 'Project date is required';
        }
        if (!chargeAmount) {
            newErrors.chargeAmount = 'Charge amount is required';
        }
        if (portfolioImages.length === 0) {
            newErrors.images = 'At least one portfolio image is required';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    const handleSubmit = () => {
        if (validateForm()) {
            setShowSlideUp(false)
        }
    }

    const handleImageUpload = () => {
        // Simulate image upload - in real app, this would use ImagePicker
        const newImage = `https://via.placeholder.com/100x100/59C5E0/FFFFFF?text=${portfolioImages.length + 1}`;
        setPortfolioImages(prev => [...prev, newImage]);
        setErrors(prev => ({ ...prev, images: '' }));
    }

    const handleRemoveImage = (index: number) => {
        setPortfolioImages(prev => prev.filter((_, i) => i !== index));
    }

    return (
        <>
            <View className="w-full h-auto px-3 py-5">
                <View className="w-full items-center">
                    <ThemeText size={Textstyles.text_medium}>
                        Add Portfolio
                    </ThemeText>
                </View>
                <EmptyView height={20} />
                <View className="w-full">
                    <InputComponent
                        color={primaryColor}
                        placeholder={"Project title"}
                        placeholdercolor={secondaryTextColor}
                        value={projectTitle}
                        onChange={(value) => {
                            setProjectTitle(value);
                            setErrors(prev => ({ ...prev, projectTitle: '' }));
                        }}
                    />
                    {errors.projectTitle && (
                        <Text style={[Textstyles.text_xxxsmall, { color: '#ef4444' }]} className="mt-1">
                            {errors.projectTitle}
                        </Text>
                    )}
                </View>
                <EmptyView height={20} />
                <View className="w-full">
                    <InputComponentTextarea
                        color={primaryColor}
                        placeholder={"Brief description"}
                        placeholdercolor={secondaryTextColor}
                        multiline
                        value={description}
                        onChange={(value) => {
                            setDescription(value);
                            setErrors(prev => ({ ...prev, description: '' }));
                        }}
                    />
                </View>
                <EmptyView height={10} />
                <View className="w-full items-end">
                    <ThemeTextsecond size={Textstyles.text_xsma}>
                        {description.length}/120 characters
                    </ThemeTextsecond>
                </View>
                {errors.description && (
                    <Text style={[Textstyles.text_xxxsmall, { color: '#ef4444' }]} className="mt-1">
                        {errors.description}
                    </Text>
                )}
                <EmptyView height={20} />
                <View className="w-full flex-row gap-x-2">
                    <View className="w-1/2">
                        <InputComponent
                            color={primaryColor}
                            placeholder={"Duration of project"}
                            placeholdercolor={secondaryTextColor}
                            value={duration}
                            onChange={(value) => {
                                setDuration(value);
                                setErrors(prev => ({ ...prev, duration: '' }));
                            }}
                        />
                        {errors.duration && (
                            <Text style={[Textstyles.text_xxxsmall, { color: '#ef4444' }]} className="mt-1">
                                {errors.duration}
                            </Text>
                        )}
                    </View>
                    <View className="w-1/2">
                        <InputComponent
                            color={primaryColor}
                            placeholder={"Date"}
                            placeholdercolor={secondaryTextColor}
                            prefix={true}
                            fieldType="date"
                            value={projectDate}
                            onChange={(value) => {
                                setProjectDate(value);
                                setErrors(prev => ({ ...prev, projectDate: '' }));
                            }}
                            icon={<FontAwesome5 name="calendar" size={20} color="#ffffff" />}
                        />
                        {errors.projectDate && (
                            <Text style={[Textstyles.text_xxxsmall, { color: '#ef4444' }]} className="mt-1">
                                {errors.projectDate}
                            </Text>
                        )}
                    </View>
                </View>
                <View className="w-full items-end">
                    <ThemeTextsecond size={Textstyles.text_xsma}>Project Date</ThemeTextsecond>
                </View>
                <EmptyView height={20} />
                <View className="w-full">
                    <InputComponent
                        color={primaryColor}
                        placeholder={"How much do you charge"}
                        placeholdercolor={secondaryTextColor}
                        prefix={true}
                        icon={<Text style={[Textstyles.text_medium]} className="text-white">₦</Text>}
                        keyboardType="numeric"
                        value={chargeAmount}
                        onChange={handleChargeAmountChange}
                    />
                    {errors.chargeAmount && (
                        <Text style={[Textstyles.text_xxxsmall, { color: '#ef4444' }]} className="mt-1">
                            {errors.chargeAmount}
                        </Text>
                    )}
                </View>
                <EmptyView height={20} />
                <ThemeText size={Textstyles.text_small}>
                    Your portfolio images
                </ThemeText>
                <EmptyView height={10} />
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View className="flex-row gap-x-2">
                        {portfolioImages.map((image, index) => (
                            <View key={index} className="relative">
                                <Image 
                                    source={{ uri: image }} 
                                    className="w-16 h-16 rounded-lg"
                                    resizeMode="cover"
                                />
                                <TouchableOpacity 
                                    onPress={() => handleRemoveImage(index)}
                                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full items-center justify-center"
                                >
                                    <FontAwesome5 size={8} name="times" color="#ffffff" />
                                </TouchableOpacity>
                            </View>
                        ))}
                        {portfolioImages.length < 5 && (
                            <TouchableOpacity onPress={handleImageUpload} className="w-16 h-16 rounded-lg items-center justify-center bg-slate-300 border-2 border-dashed border-slate-400">
                                <FontAwesome5 size={16} name="plus" color="#6b7280" />
                            </TouchableOpacity>
                        )}
                    </View>
                </ScrollView>
                {errors.images && (
                    <Text style={[Textstyles.text_xxxsmall, { color: '#ef4444' }]} className="mt-2 text-center">
                        {errors.images}
                    </Text>
                )}
                <EmptyView height={10} />
                <View className="w-full flex-row justify-between items-center">
                    <Text style={[Textstyles.text_xsmall, { color: secondaryTextColor }]}>
                        JPEG, PNG (Max 5mb each)
                    </Text>
                    <Text style={[Textstyles.text_xsmall, { color: secondaryTextColor }]}>
                        {portfolioImages.length}/5 images
                    </Text>
                </View>
                <EmptyView height={40} />
                <ButtonFunction color={primaryColor} text={"Finish"} textcolor={"#ffffff"} onPress={handleSubmit} />


            </View>
        </>
    )
}

const Portfolio = () => {
    const { theme } = useTheme()
    const { primaryColor, secondaryTextColor, selectioncardColor, } = getColors(theme)
    return (
        <>
            <View style={{ backgroundColor: selectioncardColor, elevation: 4 }} className="w-full h-auto   py-3 px-3 shadow-sm shadow-black  rounded-xl">
                <View className="w-full flex-row justify-between">
                    <View className="w-2/3">
                        <ThemeText size={Textstyles.text_small}>
                            Resisdential Renovation---Kitchen Remodelling
                        </ThemeText>
                    </View>
                    <View className="w-10 h-10 rounded-full items-center justify-center bg-red-500">
                        <FontAwesome5 size={16} color="#ffffff" name="trash" />
                    </View>


                </View>

                <ThemeTextsecond size={Textstyles.text_xsmall}>
                    Managed a Kitchen remodeling project including
                    new cabinetry electrical work and plumbling upgrade
                </ThemeTextsecond>
                <EmptyView height={10} />
                <View className="w-full flex-row justify-between">
                    <View>
                        <ThemeText size={Textstyles.text_xsmall}>
                            <FontAwesome5 name="clock" />
                            <Text> </Text>
                            3 months
                        </ThemeText>

                    </View>
                    <View>
                        <ThemeTextsecond size={Textstyles.text_xsmall}>
                            May 7,2022
                        </ThemeTextsecond>

                    </View>

                </View>
                <EmptyView height={10} />
                <GalleryView />


            </View>
        </>
    )
}

const GalleryView = () => {
    const [portfolioImages, setPortfolioImages] = useState([
        { id: 1, uri: 'https://via.placeholder.com/100x100/59C5E0/FFFFFF?text=1' },
        { id: 2, uri: 'https://via.placeholder.com/100x100/59C5E0/FFFFFF?text=2' },
        { id: 3, uri: 'https://via.placeholder.com/100x100/59C5E0/FFFFFF?text=3' },
        { id: 4, uri: 'https://via.placeholder.com/100x100/59C5E0/FFFFFF?text=4' },
        { id: 5, uri: 'https://via.placeholder.com/100x100/59C5E0/FFFFFF?text=5' },
    ])

    const handleImagePress = (imageId: number) => {
        // Handle image press for full view or editing
        console.log('Image pressed:', imageId)
    }

    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-x-2">
                {portfolioImages.map((image) => (
                    <TouchableOpacity 
                        key={image.id} 
                        onPress={() => handleImagePress(image.id)}
                        className="w-16 h-16 rounded-lg overflow-hidden"
                        style={{ backgroundColor: '#f3f4f6' }}
                    >
                        <Image 
                            source={{ uri: image.uri }} 
                            className="w-full h-full"
                            resizeMode="cover"
                            style={{ backgroundColor: '#e5e7eb' }}
                        />
                    </TouchableOpacity>
                ))}
                {/* Add more button */}
                <TouchableOpacity 
                    className="w-16 h-16 rounded-lg items-center justify-center bg-slate-300"
                    onPress={() => console.log('Add more images')}
                >
                    <FontAwesome5 size={16} name="plus" color="#6b7280" />
                </TouchableOpacity>
            </View>
        </ScrollView>
    )
}