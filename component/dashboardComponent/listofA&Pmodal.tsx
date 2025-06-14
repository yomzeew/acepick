import ContainerTemplate from "component/dashboardComponent/containerTemplate"
import EmptyView from "component/emptyview"
import { useLocalSearchParams, useRouter } from "expo-router"
import { TouchableOpacity,Text,View, Image, ScrollView } from "react-native"
import { AntDesign,  FontAwesome5,  FontAwesome6 } from "@expo/vector-icons"
import { useTheme } from "hooks/useTheme"
import { getColors } from "static/color"
import { Textstyles } from "static/textFontsize"
import { useEffect, useRef, useState } from "react"
import SwitchMode from "component/switchmode"
import RatingStar from "component/rating"
import CorporateCard from "component/corporatecards"
import { ThemeText, ThemeTextsecond } from "component/ThemeText"
import { ArtisanPage,CorporatePage } from "component/menuComponent/professionals/professionPage"
import InputComponent from "component/controls/textinput"
import SliderModalTemplate, { SliderModalNoScrollview } from "component/slideupModalTemplate"
import FilterComponent from "component/filtermodal"
import { useSelector } from "react-redux"
import { useMutation } from "@tanstack/react-query"
import { RootState } from "redux/store"
import { getArtisanListFn } from "services/userService"
import { useDebounce } from "hooks/useDebounce"

interface ListofApmodalProps{
    professionalValue:string
}

const ListofAPmodal=({professionalValue}:ListofApmodalProps)=>{
    const {theme}=useTheme()
    const {secondaryTextColor,primaryColor}=getColors(theme)
    const [activePage, setActivePage] = useState("professional");
    const [showFilter,setshowFilter]=useState(false)
    const [filterData,setFilterData]=useState<any[]>([])
    const [professionSearch,setprofessionSearch]=useState('')

     const [errorMessage, setErrorMessage] = useState<string | null>(null);
        const  [artisanData,setArtisanData]=useState<any[]>([])
    
        useEffect(() => {
          if (errorMessage) {
            const timer = setTimeout(() => {
              setErrorMessage(null);
            }, 4000);
            return () => clearTimeout(timer); // Cleanup on unmount or on new error
          }
        }, [errorMessage]);
    // useSelector to get the token
    const token:string=useSelector((state:RootState)=>(state.auth?.token)?? "") 
       

        const mutation=useMutation({
          mutationFn: (query:string) => getArtisanListFn(token, query),
          onSuccess: (response:any) => {
              setArtisanData(response.data)
              // optionally update local state here if you want to store the result
          },
          onError: (error:any) => {
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
            console.error("failed:", msg);
          },
          });
    
          useEffect(() => {
            mutation.mutate(`profession=${professionalValue}`);
        }, [professionalValue]);

        const debouncedProfessionSearch = useDebounce(professionSearch, 500);  // 500ms delay

        useEffect(() => {
            if (debouncedProfessionSearch) {
                mutation.mutate(`profession=${debouncedProfessionSearch}`);
            }
        }, [debouncedProfessionSearch]);
        useEffect(()=>{
           setArtisanData(filterData)
        },[filterData])

    return(
        <>
        <SliderModalTemplate showmodal={showFilter} setshowmodal={setshowFilter} modalHeight={'100%'} >
            <FilterComponent 
            showmodal={showFilter}
            setshowmodal={setshowFilter}
            setfilterData={setFilterData}
            />
        </SliderModalTemplate>
        <ContainerTemplate>
            <EmptyView height={20}/>
           
            <SwitchMode 
            activePage={activePage} 
            setActivePage={setActivePage} 
            />
            <EmptyView height={20}/>
            <View className="w-full justify-center flex-row gap-x-3">
            <View className="w-4/5">
            <InputComponent value={professionSearch} onChange={setprofessionSearch} color={primaryColor} placeholder={"Search by Profession"} placeholdercolor={secondaryTextColor}/>
            </View>
          
            <TouchableOpacity onPress={()=>setshowFilter(!showFilter)} style={{backgroundColor:primaryColor}} className="px-2 py-2 w-16 h-16 items-center justify-center rounded-full">
                    <AntDesign size={24} color={"#ffffff"} name="filter"/>
                </TouchableOpacity>   
            </View>
            
            <EmptyView height={20} />
            {activePage==='professional'?<ArtisanPage artisanData={artisanData}/>:<CorporatePage/>}

        </ContainerTemplate>
        </>
    )
}
export default ListofAPmodal        