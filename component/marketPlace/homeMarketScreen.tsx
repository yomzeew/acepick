import { AntDesign, FontAwesome5 } from "@expo/vector-icons"
import ButtonFunction from "component/buttonfunction"
import StateandLga, { Modaldisplay } from "component/controls/stateandlga"
import ContainerTemplate from "component/dashboardComponent/containerTemplate"
import EmptyView from "component/emptyview"
import { SliderModalNoScrollview } from "component/slideupModalTemplate"
import { SwitchModalMarket } from "component/switchmode"
import { ThemeText, ThemeTextsecond } from "component/ThemeText"
import { useRouter } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { useTheme } from "hooks/useTheme"
import { useState } from "react"
import { ImageBackground, View, Text, TouchableOpacity, TextInput,Image } from "react-native"
import { getColors } from "static/color"
import { Textstyles } from "static/textFontsize"


const HomeMarketScreen = () => {
    const { theme } = useTheme()
    const { selectioncardColor, primaryColor, secondaryTextColor } = getColors(theme)
    const [showmodal, setshowmodal] = useState<boolean>(false)
    const router = useRouter();
    const [firstName, setFirstName] = useState<string>("")
    const [lastName, setLastName] = useState<string>("")
    const [lga, setlga] = useState<string>("")
    const [state, setstate] = useState<string>("")
    const [showOption, setShowOption] = useState<boolean>(false);
    const [isStateSelection, setIsStateSelection] = useState<boolean>(true); // Track if selecting state or LGA
    const [data, setData] = useState<string[]>([]);
    const [activePage, setActivePage] = useState("buy");
  

    return (
        <>
            <View className="h-full w-full">  
                <ImageBackground resizeMode="cover" source={require('../../assets/walletcard.png')} className="h-1/6 w-full py-3 px-3">
                    <View className="h-full justify-end">
                        <Text style={[Textstyles.text_medium,{color:"#ffffff"}]} >
                            Market
                        </Text>

                    </View>
                </ImageBackground>
                <ContainerTemplate>
                    <EmptyView height={20} />
                    <FilterCard
                        showmodal={showmodal}
                        setshowmodal={setshowmodal}
                    />
                    <EmptyView height={20} />
                    <SwitchModalMarket activePage={activePage} setActivePage={setActivePage}/>
                    <EmptyView height={20}/>
                    {activePage==='buy'?<View className="items-center justify-center flex-row flex-wrap gap-3 w-full">
                    <ProductCard/>
                    <ProductCard/>
                    <ProductCard/>
                    <ProductCard/>
                    </View>:
                    <View className="items-center justify-center flex-row flex-wrap gap-3 w-full">
                    <ProductCard/>
                    <ProductCard/>
                    <ProductCard/>

                    </View>}
                    
                </ContainerTemplate>

            </View>
            <TouchableOpacity onPress={()=>router.push('/addproductLayout')} style={{backgroundColor:primaryColor}} 
            className="absolute bottom-10 right-4 elevation-md shadow-md shadow-slate-500 z-50 w-16 h-16 rounded-full flex-row items-center justify-center">
                <Text style={[Textstyles.text_cmedium]}>+</Text>
                <FontAwesome5 size={20} name={"store"} />

             </TouchableOpacity>
            <SliderModalNoScrollview
                showmodal={showmodal}
                setshowmodal={setshowmodal}
                modalHeight={"50%"}
            >
                <>
                    <ContainerTemplate>
                        <View className="w-full items-end py-3">
                            <TouchableOpacity onPress={()=>setshowmodal(!showmodal)}>
                                <FontAwesome5 size={20} color="red" name="times-circle" />
                            </TouchableOpacity>

                        </View>
                        <ThemeText size={Textstyles.text_cmedium}>
                            Set Location
                        </ThemeText>
                        <EmptyView height={20} />
                        <StateandLga
                            state={state}
                            lga={lga}
                            setstate={(text: string) => setstate(text)}
                            setlga={(text: string) => setlga(text)}
                            isStateSelection={isStateSelection}
                            setIsStateSelection={(text: boolean) => setIsStateSelection(text)}
                            setShowOption={(text: boolean) => setShowOption(text)}
                            showOption={showOption}
                            data={data}
                            setData={(text: string[]) => setData(text)}
                        />
                        <EmptyView height={20} />
                        <ButtonFunction color={primaryColor } text={"Set Location"} textcolor={"#ffffff"} onPress={()=>setshowmodal(!showmodal)} />

                    </ContainerTemplate>

                </>



            </SliderModalNoScrollview>
            {showOption &&
                <Modaldisplay
                    data={data}
                    isStateSelection={isStateSelection}
                    setstate={(text: string) => setstate(text)}
                    setlga={(text: string) => setlga(text)}
                    setShowOption={(text: boolean) => setShowOption(text)}
                />
            }
           
        </>
    )
}
export default HomeMarketScreen

interface FilterCardProps {
    showmodal: boolean;
    setshowmodal: (value: boolean) => void
}

const FilterCard = ({ showmodal, setshowmodal }: FilterCardProps) => {
    const { theme } = useTheme()
    const { selectioncardColor, primaryColor, secondaryTextColor } = getColors(theme)
    return (
        <>
            <View style={{ backgroundColor: selectioncardColor, elevation: 4 }} className="w-full h-[12%] rounded-2xl shadow-slate-500 shadow-sm px-5 py-3 ">
                <EmptyView height={10} />
                <View className="flex-row w-full gap-x-3 items-center">
                    <View className="relative w-5/6">
                        <TouchableOpacity style={{ backgroundColor: '#033A62' }} className="h-12 w-12 z-50 absolute right-0 items-center justify-center rounded-full">
                            <FontAwesome5 color={"#ffffff"} size={20} name="arrow-right" />
                        </TouchableOpacity>
                        <TextInput
                            placeholder="electrictian"
                            placeholderTextColor={primaryColor}
                            placeholderClassName="text-blue-900"
                            style={{
                                backgroundColor: theme === 'dark' ? '#4F4F4F' : '#e2e8f0',
                                color: secondaryTextColor, borderColor: theme === 'dark' ? '#4F4F4F' : '#cbd5e1'
                            }}
                            className="rounded-3xl border h-12 px-3 w-full"
                        />
                    </View>
                    <TouchableOpacity onPress={() => setshowmodal(!showmodal)} style={{ backgroundColor: primaryColor }} className="w-12 h-12 rounded-full items-center justify-center">
                        <FontAwesome5 size={20} name="filter" color="#ffffff" />

                    </TouchableOpacity>



                </View>


            </View>

        </>
    )
}
const ProductCard=()=>{
    const router=useRouter()
    const { theme } = useTheme()
    const { selectioncardColor, primaryColor, secondaryTextColor } = getColors(theme)
    return(
        <>
        <TouchableOpacity onPress={()=>router.push('/productdetailsLayout')}  style={{ backgroundColor: selectioncardColor, elevation: 4 }} className="w-[45%] h-56 rounded-2xl shadow-slate-500 shadow-sm px-5 py-3 ">
            <View className="w-full items-center justify-center h-full">
                <Image className="w-16 h-16 rounded-full" source={require('../../assets/professionimage1.png')}/>
                <EmptyView height={20}/>
                <View className="flex-row items-center w-full justify-start">
                <ThemeText size={Textstyles.text_xxxsmall}>
                2 Gang electrical switch
                </ThemeText>
                {/* <TouchableOpacity>
                    <AntDesign size={20} color={primaryColor} name="like1"/>
                </TouchableOpacity> */}

                </View>
                <EmptyView height={10}/>
                <View className="w-full items-start">
                <Text style={[Textstyles.text_cmedium,{color:"green"}]}>
                    N30,0000
                </Text>
                </View>
                <EmptyView height={10}/>
                <View className="w-full items-start">
                <Text style={[Textstyles.text_cmedium,{color:"red"}]}>
                   Sold Out
                </Text>
                </View>
               

            </View>

        </TouchableOpacity>
        </>
    )
}