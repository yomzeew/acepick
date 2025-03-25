import ContainerTemplate from "component/dashboardComponent/containerTemplate"
import HeaderComponent from "../../headerComp"
import EmptyView from "component/emptyview"
import ListCard from "component/listcard"
import { useLocalSearchParams, useRouter } from "expo-router"
import { TouchableOpacity } from "react-native"

const Category=()=>{
    const router=useRouter()
    const {category}=useLocalSearchParams()
    const professions = [
        "Electrician",
        "Architect",
        "Surveyor",
        "Carpenter",
        "Welder",
        "Painter",
        "Labourer",
        "Plumber",
        "Bricklayer"
      ];

      const handlenavprofession=(value:string)=>{
        router.push(`professional/${value}`)
      }
      
return(
    <>
    <ContainerTemplate>
    <HeaderComponent title={category} />
    <EmptyView height={10} />
    {professions.map((item:string,index:number)=>(
        <TouchableOpacity onPress={()=>handlenavprofession(item)} key={index}>
             <ListCard
        content={item}
        />

        </TouchableOpacity>
       
    )) }

        
    </ContainerTemplate>
    </>
)
}
export default Category
