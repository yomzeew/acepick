import { TouchableOpacity, View } from "react-native"
import ContainerTemplate from "./dashboardComponent/containerTemplate"
import { ThemeText } from "./ThemeText"
import { Textstyles } from "static/textFontsize"
import { FontAwesome5 } from "@expo/vector-icons"
import EmptyView from "./emptyview"
import SelectComponent from "./dashboardComponent/selectComponent"
import { useEffect, useState } from "react"
import { getAllStates, getLgasByState } from "utilizes/fetchlistofstateandlga"
import { getAllSector, getProfessionsBySector } from "utilizes/fetchlistofjobs"
import Slider from "@react-native-community/slider"
import { useTheme } from "hooks/useTheme"
import { getColors } from "static/color"
import ButtonComponent from "./buttoncomponent"
import { useSelector } from "react-redux"
import { RootState } from "redux/store"
import { useMutation } from "@tanstack/react-query"
import { getArtisanListFn } from "services/userService"

interface FilterComponentProps {
    showmodal: boolean,
    setshowmodal: (value: boolean) => void;
    setfilterData:(value: any[]) => void;
    sector?:string

}


const FilterComponent = ({ showmodal, setshowmodal,setfilterData,sector='' }: FilterComponentProps) => {
    const finalSectorValue=sector===''?'':sector
    const [lga, setlga] = useState<string>("")
    const [state, setstate] = useState<string>("")
    const [lgalist, setlgalist] = useState<string[]>([])
    const statelist: string[] = getAllStates()
    const [sectorList, setSectorList] = useState<any[]>([]);
    const [professionArray, setProfessionArray] = useState<any[]>([]);
    const [sectorValue, setSectorValue] = useState<string>(finalSectorValue)
    const [professionValue, setProfessionValue] = useState<string>('')
    const [serviceCharge, setServiceCharge] = useState(0);
    const [radiusDistance, setRadiusDistance] = useState(0);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

      const {theme}=useTheme()
        const {secondaryTextColor,primaryColor}=getColors(theme)


    const getlgalist = () => {
        const lgaArray: string[] = getLgasByState(state)
        setlgalist(lgaArray)
    }
    // Load sectors when the component mounts
    useEffect(() => {
        const loadSectors = async () => {
            const sectors = await getAllSector();
            const arraySectors = sectors.map((item) => item.title)
            setSectorList(arraySectors);
        };

        loadSectors();
    }, []);

    // Fetch professions based on selected sector
    const getProfessionList = async () => {
        if (!sectorValue) {
            console.warn('No sector selected');
            return;
        }
        const professionalList = await getProfessionsBySector(sectorValue);
        const arrayProfessions = professionalList.map((item) => item.title)
        setProfessionArray(arrayProfessions);
    };

    useEffect(() => {
        getProfessionList()
    }, [sectorValue])

    useEffect(() => {
        getlgalist()
    }, [state])
// useSelector to get the token
const token:string=useSelector((state:RootState)=>(state.auth?.token)) || ''
   
    const mutation=useMutation({
      mutationFn: (query:string) => getArtisanListFn(token, query),
      onSuccess: (response:any) => {
          console.log('Fetched professionals:', response.data);
          setfilterData(response.data)
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

  
    const handleCloseModal = () => {
        setshowmodal(!showmodal)
    }
    const handleApply = () => {
        let queryParts = [];
    
        if (state) queryParts.push(`state=${encodeURIComponent(state)}`);
        if (lga) queryParts.push(`lga=${encodeURIComponent(lga)}`);
        if (sectorValue) queryParts.push(`sector=${encodeURIComponent(sectorValue)}`);
        if (professionValue) queryParts.push(`profession=${encodeURIComponent(professionValue)}`);
        if (serviceCharge) queryParts.push(`service_charge=${serviceCharge}`);
        if (radiusDistance) queryParts.push(`radius=${radiusDistance}`);
    
        const queryString = queryParts.join('&');
    
        console.log('Filter Query:', queryString);
    
        mutation.mutate(queryString, {
            onSuccess: () => {
                console.log('Filter applied successfully');
                setshowmodal(false);  // close modal
            },
            onError: (err) => {
                console.error('Error applying filter:', err);
            }
        });
    };
    
    return (
        <>
            <ContainerTemplate >
                <View className="w-full">
                    <View className="w-full items-end px-3 py-3">
                        <TouchableOpacity onPress={handleCloseModal} >
                            <FontAwesome5 name="times-circle" size={20} color="red" />
                        </TouchableOpacity>
                    </View>
                    <View className="w-full">
                        <ThemeText size={Textstyles.text_cmedium}>
                            Filter
                        </ThemeText>

                    </View>
                    <EmptyView height={10} />
                    <View className="w-full">
                        <ThemeText size={Textstyles.text_small}>
                            Filter by Sector
                        </ThemeText>
                        <SelectComponent title={"Select Sector"}
                            width={"100%"}
                            data={sectorList}
                            setValue={(text) => setSectorValue(text)}
                            value={sectorValue}
                        />
                    </View>
                    <EmptyView height={10} />
                    <View className="w-full">
                        <ThemeText size={Textstyles.text_small}>
                            Filter by Profession
                        </ThemeText>
                        <SelectComponent title={"Select Profession"}
                            width={"100%"}
                            data={professionArray}
                            setValue={(text) => setProfessionValue(text)}
                            value={professionValue}
                        />
                    </View>
                    <EmptyView height={10} />
                    <View className="w-full">
                        <ThemeText size={Textstyles.text_small}>
                            Filter by State
                        </ThemeText>
                        <SelectComponent title={"Select State"}
                            width={"100%"}
                            data={statelist}
                            setValue={(text) => setstate(text)}
                            value={state}
                        />
                    </View>
                    <EmptyView height={10} />
                    <View className="w-full">
                        <ThemeText size={Textstyles.text_small}>
                            Filter by LGA
                        </ThemeText>
                        <SelectComponent title={"Select LGA"}
                            width={"100%"}
                            data={lgalist}
                            setValue={(text) => setlga(text)}
                            value={lga}
                        />
                    </View>
                    <EmptyView height={10} />
                    <View className="w-full">
                        <ThemeText size={Textstyles.text_small}>
                            Filter by Services Charge (₦{serviceCharge.toLocaleString()})
                        </ThemeText>
                        <Slider
                            style={{ width: '100%', height: 40 }}
                            minimumValue={1000}
                            maximumValue={1000000}
                            step={1000}
                            minimumTrackTintColor={primaryColor}
                            maximumTrackTintColor={secondaryTextColor}
                            thumbTintColor={primaryColor}
                            value={serviceCharge}
                            onValueChange={setServiceCharge}
                        />
                    </View>

                    <EmptyView height={10} />

                    <View className="w-full">
                        <ThemeText size={Textstyles.text_small}>
                            Filter by Radius Distance ({radiusDistance} km)
                        </ThemeText>
                        <Slider
                            style={{ width: '100%', height: 40 }}
                            minimumValue={1}
                            maximumValue={10}
                            step={1}
                            minimumTrackTintColor={primaryColor}
                            maximumTrackTintColor={secondaryTextColor}
                            thumbTintColor={primaryColor}
                            value={radiusDistance}
                            onValueChange={setRadiusDistance}
                        />
                    </View>
                    <EmptyView height={10} />
                    <ButtonComponent color={primaryColor} text={"Apply"} textcolor={secondaryTextColor} onPress={handleApply}/>





                </View>
            </ContainerTemplate>
        </>
    )
}

export default FilterComponent