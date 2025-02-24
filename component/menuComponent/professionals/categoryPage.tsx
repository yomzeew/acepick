import BackComponent from "component/backcomponent"
import ContainerTemplate from "component/dashboardComponent/containerTemplate"
import HeaderComponent from "../profilePages/headerComp"
import EmptyView from "component/emptyview"
import ListCard from "component/listcard"

const Category=()=>{
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
      
return(
    <>
    <ContainerTemplate>
    <HeaderComponent title={'p'} />
    <EmptyView height={10} />
    {professions.map((item:string,index:number)=>(
        <ListCard
        content={item}
        />
    )) }

        
    </ContainerTemplate>
    </>
)
}
export default Category
