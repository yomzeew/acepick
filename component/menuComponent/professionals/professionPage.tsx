import ContainerTemplate from "component/dashboardComponent/containerTemplate"
import HeaderComponent from "../../headerComp"
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
import { useSelector } from "react-redux"
import { RootState } from "redux/store"
import { useMutation } from "@tanstack/react-query"
import { getArtisanListFn } from "services/userService"
import { AlertMessageBanner } from "component/AlertMessageBanner"
import SliderModalTemplate from "component/slideupModalTemplate"
import FilterComponent from "component/filtermodal"

const Professional=()=>{
    const {theme}=useTheme()
    const {secondaryTextColor,primaryColor}=getColors(theme)
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const  [artisanData,setArtisanData]=useState<any[]>([])
    const [filterData,setFilterData]=useState<any[]>([])
    const [activePage, setActivePage] = useState("professional");
    const [showFilter,setshowFilter]=useState(false)

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
    const {profession,id,sector}=useLocalSearchParams()
    const finalSector:string=sector.toString() ?? ""

 // this one of the query
    const professionalId=Number(id)
    // here is the usemutation 
   
    const mutation=useMutation({
      mutationFn: (query:string) => getArtisanListFn(token, query),
      onSuccess: (response:any) => {
          console.log('Fetched professionals:', response.data.length);
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
        mutation.mutate(`professionId=${professionalId}`);
    }, [professionalId]);

    useEffect(()=>{
      setArtisanData(filterData)
   },[filterData])


    const handlePressFilter=()=>{
      setshowFilter(!showFilter)
    }

    


    return(
        <>
          {errorMessage && (
               <AlertMessageBanner type="error" message={errorMessage} />
             )}
            <SliderModalTemplate showmodal={showFilter} setshowmodal={setshowFilter} modalHeight={'80%'} >
            <FilterComponent 
            showmodal={showFilter}
            setshowmodal={setshowFilter}
            setfilterData={setFilterData}
            sector={finalSector}
            />
        </SliderModalTemplate>
        <ContainerTemplate>
            <HeaderComponent title={profession}/>
            <EmptyView height={20}/>
            <View className="absolute right-3 top-28">
                <TouchableOpacity onPress={handlePressFilter} style={{backgroundColor:primaryColor}} className="px-2 py-2 rounded-full">
                    <AntDesign size={24} color={"#ffffff"} name="filter"/>
                </TouchableOpacity>   
            </View>
            <SwitchMode 
            activePage={activePage} 
            setActivePage={setActivePage} 
            />
            <EmptyView height={20} />
            {activePage==='professional'?<ArtisanPage artisanData={artisanData}/>:<CorporatePage/>}

        </ContainerTemplate>
        </>
    )
}
export default Professional

export const CorporatePage = () => {
  const router=useRouter()
    const arraysample = [1, 2, 3, 4, 5, 6,7,8,9];
    const handlePress=(value:number)=>{
      router.push("corporateprofileLayout")
      
    }
  
    return (
      <View className="flex-1 w-full px-3">
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom:100}}>
          <View className="flex-row flex-wrap gap-2 w-full  justify-between">
            {arraysample.map((item, index) => (
              <TouchableOpacity onPress={()=>handlePress(item)} className="w-[48%]" key={index}>
                <Card />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  };
  interface ArtisanPageProps{
    artisanData:any[]
  }
  export const ArtisanPage=({artisanData}:ArtisanPageProps)=>{
    const artisanDataArray=artisanData
    const router=useRouter()
    const arraysample = [1, 2, 3, 4, 5, 6,7,8,9];
    const handlePress=(value:number)=>{
      router.push(`/professionalprofileLayout?professionalId=${value}`)
      
    }
 
    return (
      <View className="flex-1 w-full px-3">
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom:100}}>
            {artisanDataArray.length>0?artisanDataArray.map((item, index) => (
              <TouchableOpacity onPress={()=>handlePress(item.id)} className="w-full" key={index}>
                <ListCard
                title={item.profession.title}
                firstName={item.profile.firstName}
                lastName={item.profile.lastName}
                state={item.profile.user.location.state}
                lga={item.profile.user.location.lga}
                avatar={item.profile.avatar}
                charges={item.chargeFrom}
                available={item.available}

                />
              </TouchableOpacity>
            )): <ThemeTextsecond size={Textstyles.text_cmedium}>
            No Profession Available
        </ThemeTextsecond>}
        </ScrollView>
      </View>
    );
    
  }



const Card=()=>{
    const {theme}=useTheme()
    const { primaryColor, secondaryTextColor, selectioncardColor } = getColors(theme)
    return(
        <>
        <CorporateCard>
        <View className="w-full items-center">
            <Image source={require('../../../assets/corporate.png')} className="w-16 h-16 rounded-full" resizeMode="cover" />
            <EmptyView height={10}/>
            <Text className="text-center" style={[Textstyles.text_xmedium,{color:secondaryTextColor}]}>
                PowerTech Electric Services
            </Text>
            <EmptyView height={10}/>
            <View className="flex-row gap-x-2">
            <FontAwesome6 name="location-dot" size={12} color={primaryColor} />
                <Text style={[Textstyles.text_xsma,{color:secondaryTextColor}]}>Ibadan,Oyo State</Text>
            </View>
            <EmptyView height={10}/>
            <RatingStar numberOfStars={3}/>

        </View>
        </CorporateCard>
     
        </>
    )
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

}

const ListCard=({firstName,lastName,state,lga,charges,title,available,avatar}:ListCardProps)=>{
    const {theme}=useTheme()
    const { primaryColor, secondaryTextColor, selectioncardColor } = getColors(theme)
    return(
        <>
        <EmptyView height={10}/>
        <View style={{backgroundColor:selectioncardColor, elevation:4}} className="w-full py-2 h-36 rounded-2xl shadow-slate-300 shadow-sm justify-center">
            <View className="w-full h-full flex-row justify-around px-3 py-3">
                <View className="w-[20%] h-full justify-center">
                    <Image resizeMode="cover"  source={{uri:avatar}}  className="w-16 h-16 rounded-full"/>
                </View>
                <View className="w-[50%] justify-center ">
                    <ThemeText size={Textstyles.text_cmedium}>
                        {firstName} {lastName}
                    </ThemeText>
                    <View className="flex-row gap-x-2">
                    <FontAwesome5 color={primaryColor} name="toolbox" size={10} />
                    <ThemeTextsecond size={Textstyles.text_xsmall}>
                     {title}
                    </ThemeTextsecond>
                    </View>
                    <View className="flex-row gap-x-2">
            <FontAwesome6 name="location-dot" size={12} color={primaryColor} />
                <Text style={[Textstyles.text_xsma,{color:secondaryTextColor}]}>{lga},{state} State</Text>
            </View>
                    <ThemeText size={Textstyles.text_xsmall}>
                        {charges===null?'':'Charges from N'+charges}
                    </ThemeText>

                   

                </View>
                <View className="w-[100%] flex-col justify-between">
                    {available?<View className="bg-green-600 rounded-2xl px-2 py-1">
                        <Text style={[Textstyles.text_xsmall,{color:"#ffffff"}]}>
                           Available
                        </Text>
                    </View>:
                    <View className="bg-red-600 rounded-2xl px-2 py-1">
                        <Text style={[Textstyles.text_xsmall,{color:"#ffffff"}]}>
                            Not Available
                        </Text>
                    </View>
                    }
                    <View>

                    </View>


                </View>

            </View>

        </View>
        
        </>
    )
}





