import ContainerTemplate from "component/dashboardComponent/containerTemplate"
import HeaderComponent from "../../headerComp"
import EmptyView from "component/emptyview"
import ListCard from "component/listcard"
import { useLocalSearchParams, useRouter } from "expo-router"
import { ScrollView, TouchableOpacity, View } from "react-native"
import { getProfessionsBySector } from "utilizes/fetchlistofjobs"
import { useEffect, useState } from "react"
import { ThemeTextsecond } from "component/ThemeText"
import { Textstyles } from "static/textFontsize"

const Category = () => {
  const router = useRouter()
  const { category } = useLocalSearchParams()
  const [professionalArray, setProfessionArray] = useState<any[]>([])
  const categoryValue: any = category
  // Fetch professions based on selected sector
  const getProfessionList = async () => {
    if (!categoryValue) {
      console.warn('No sector selected');
      return;
    }
    const professionalList = await getProfessionsBySector(categoryValue);
    setProfessionArray(professionalList);
  };

  useEffect(() => {
    getProfessionList()
  }, [categoryValue])



  const handlenavprofession = (value: any) => {
    router.push(`professional/${value.title}?id=${value.id}&sector=${category}`)
  }

  return (
    <>
      <ContainerTemplate>
        <HeaderComponent title={category} />
        <EmptyView height={10} />
        <View className="flex-1 pb-5">
          <ScrollView
            contentContainerStyle={{ paddingBottom: 60, paddingTop: 20 }}
            showsVerticalScrollIndicator={false}
          >
            {professionalArray.length > 0 ? (
              professionalArray.map((item:any, index: number) => (
                <TouchableOpacity onPress={() => handlenavprofession(item)} key={index}>
                  <ListCard
                    content={item.title}
                  />

                </TouchableOpacity>

              ))) : (<ThemeTextsecond size={Textstyles.text_cmedium}>
                No Record
              </ThemeTextsecond>)}

          </ScrollView>
        </View>
      </ContainerTemplate>
    </>
  )
}
export default Category
