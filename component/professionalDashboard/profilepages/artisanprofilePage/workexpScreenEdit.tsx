import { Feather, FontAwesome5 } from "@expo/vector-icons"
import ButtonFunction from "component/buttonfunction"
import InputComponent from "component/controls/textinput"
import ContainerTemplate from "component/dashboardComponent/containerTemplate"
import EmptyView from "component/emptyview"
import HeaderComponent from "component/headerComp"
import SliderModalTemplate from "component/slideupModalTemplate"
import { ThemeText, ThemeTextsecond } from "component/ThemeText"
import { useTheme } from "hooks/useTheme"
import { useState } from "react"
import { TouchableOpacity, View,Text } from "react-native"
import { getColors } from "static/color"
import { Textstyles } from "static/textFontsize"

const WorkExpScreenEdit=()=>{
    const {theme}=useTheme()
   const [showSlideUp, setShowSlideUp] = useState(false)
       const { primaryColor, secondaryTextColor, selectioncardColor, } = getColors(theme)
   
       const handleShowSlide = () => {
           setShowSlideUp(!showSlideUp)
       }
    return(
        <>
        {showSlideUp &&
                <SliderModalTemplate showmodal={showSlideUp} modalHeight={"90%"} setshowmodal={setShowSlideUp}>
                    <AddworkExp setShowSlideUp={setShowSlideUp}/>
                </SliderModalTemplate>
            }
        <ContainerTemplate>
                        <View className="h-full w-full flex-col">
                            <HeaderComponent title={"Work Experience"} />
                            <View className="w-full items-end">
                                <TouchableOpacity onPress={handleShowSlide} className="bg-green-500 px-3 w-20 rounded-2xl items-center justify-center py-2">
                                    <Text className="text-white">Add new</Text>
                                </TouchableOpacity>
        
                            </View>
                            <EmptyView height={20} />
                            <ListCard/>
                            <EmptyView height={20} />
                            <ListCard/>
        
                        </View>
                    </ContainerTemplate>
        </>
    )
}
export default WorkExpScreenEdit

const ListCard=()=>{
    const {theme}=useTheme()
    const [showSlideUp, setShowSlideUp] = useState(false)
        const { primaryColor, secondaryTextColor, selectioncardColor, } = getColors(theme)
    
    return(
        <>
          <View style={{ backgroundColor: selectioncardColor, elevation: 4 }} className="w-full h-36   py-3 px-3 shadow-sm shadow-black  rounded-xl">
            <View className="w-full flex-row justify-between items-baseline">
                <View>
                    <ThemeText size={Textstyles.text_cmedium}>
                    LEAD ELECTRICIAN
                    </ThemeText>

                </View>
                <View className="w-10 h-10 rounded-full items-center justify-center bg-red-500">
                    <FontAwesome5 size={16} color="#ffffff" name="trash" />
                </View>
            </View>
            <EmptyView height={10}/>
            <View className="flex-row items-center gap-x-2">
                
                    <Feather size={10} color={primaryColor} name="circle"/>
                    <ThemeTextsecond size={Textstyles.text_xsmall}>GLORIOUS WORLD OF ELECTRICALS CO. LTD</ThemeTextsecond>
               
            </View>
            <EmptyView height={5}/>
            <View className="flex-row items-center gap-x-2">
                <FontAwesome5 color={primaryColor} size={10} name="calendar"/>
                <ThemeTextsecond size={Textstyles.text_xsmall}>July 13, 2023 - September 2023</ThemeTextsecond>
           
        </View>
       
                                
          </View>
        </>
    )
}
interface AddworkExpProps{
    setShowSlideUp:(value:boolean)=>void
}
const AddworkExp=({setShowSlideUp}:AddworkExpProps)=>{
    const {theme}=useTheme()
        const { primaryColor, secondaryTextColor, selectioncardColor, } = getColors(theme)
        const [jobTitle, setJobTitle] = useState("")
        const [companyName, setCompanyName] = useState("")
        const [startDate, setStartDate] = useState("")
        const [endDate, setEndDate] = useState("")
        const [errors, setErrors] = useState<{[key: string]: string}>({})

        const validateForm = () => {
            const newErrors: {[key: string]: string} = {};
            
            if (!jobTitle.trim()) {
                newErrors.jobTitle = 'Job title is required';
            }
            if (!companyName.trim()) {
                newErrors.companyName = 'Company name is required';
            }
            if (!startDate) {
                newErrors.startDate = 'Start date is required';
            }
            if (!endDate) {
                newErrors.endDate = 'End date is required';
            } else if (startDate && new Date(endDate) < new Date(startDate)) {
                newErrors.endDate = 'End date must be after start date';
            }
            
            setErrors(newErrors);
            return Object.keys(newErrors).length === 0;
        }

        const handleSubmit=()=>{
            if (validateForm()) {
                setShowSlideUp(false)
            }
        }
    return(
        <>
        <View className="w-full h-auto px-3 py-5">
            <View className="items-center">
                <ThemeText size={Textstyles.text_medium}>
                    Work Experience
                </ThemeText>

            </View>
            <EmptyView height={20}/>
            <View className="w-full">
                <InputComponent 
                color={primaryColor} 
                placeholder={"Job Title"} 
                placeholdercolor={secondaryTextColor}
                value={jobTitle}
                onChange={(value) => {
                    setJobTitle(value);
                    setErrors(prev => ({ ...prev, jobTitle: '' }));
                }}
                />
                {errors.jobTitle && (
                    <Text style={[Textstyles.text_xxxsmall, { color: '#ef4444' }]} className="mt-1">
                        {errors.jobTitle}
                    </Text>
                )}
                <EmptyView height={20}/>
                <InputComponent 
                color={primaryColor} 
                placeholder={"Company Name"} 
                placeholdercolor={secondaryTextColor}
                value={companyName}
                onChange={(value) => {
                    setCompanyName(value);
                    setErrors(prev => ({ ...prev, companyName: '' }));
                }}
                />
                {errors.companyName && (
                    <Text style={[Textstyles.text_xxxsmall, { color: '#ef4444' }]} className="mt-1">
                        {errors.companyName}
                    </Text>
                )}
                 <EmptyView height={20}/>
                <InputComponent 
                color={primaryColor} 
                placeholder={"Start Date"} 
                placeholdercolor={secondaryTextColor} 
                prefix={true}
                fieldType="date"
                value={startDate}
                onChange={(value) => {
                    setStartDate(value);
                    setErrors(prev => ({ ...prev, startDate: '' }));
                }}
                icon={<FontAwesome5 name="calendar" size={20} color="#ffffff"/>} 
                />
                {errors.startDate && (
                    <Text style={[Textstyles.text_xxxsmall, { color: '#ef4444' }]} className="mt-1">
                        {errors.startDate}
                    </Text>
                )}
                <EmptyView height={20} />
                <InputComponent 
                color={primaryColor} 
                placeholder={"End Date"} 
                placeholdercolor={secondaryTextColor}  
                prefix={true}
                fieldType="date"
                value={endDate}
                onChange={(value) => {
                    setEndDate(value);
                    setErrors(prev => ({ ...prev, endDate: '' }));
                }}
                icon={<FontAwesome5 name="calendar" size={20} color="#ffffff"/>}
                />
                {errors.endDate && (
                    <Text style={[Textstyles.text_xxxsmall, { color: '#ef4444' }]} className="mt-1">
                        {errors.endDate}
                    </Text>
                )}

            </View>
            <EmptyView height={40} />
                <ButtonFunction color={primaryColor} text={"Finish"} textcolor={"#ffffff"} onPress={handleSubmit}/>

        </View>
        </>
    )
}