import { useMutation } from "@tanstack/react-query";
import ContainerTemplate from "component/dashboardComponent/containerTemplate";
import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { getCategories } from "services/marketplaceServices";

interface FilterModalByCategoryProps {
  showmodal: boolean;
  setshowmodal: (value: boolean) => void;
  setCategory: (value: number | null) => void; // null means all categories
}

export const FilterModalByCategory = ({
  showmodal,
  setshowmodal,
  setCategory,
}: FilterModalByCategoryProps) => {
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const categoryMutation = useMutation({
    mutationFn: getCategories,
    onSuccess: (response) => {
      setCategoryData(response.data || []);
    },
    onError: (error: any) => {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to load categories";
      setErrorMessage(msg);
    },
  });

  useEffect(() => {
    if (showmodal) {
      categoryMutation.mutate(); // fetch categories only when modal opens
    }
  }, [showmodal]);

  const handlePickCategory = (value: number | null) => {
    setCategory(value);
    setshowmodal(false);
  };

  return (
      <View className="w-full items-center justify-center flex-row flex-wrap gap-2 p-2 pt-5">
        <TouchableOpacity
          onPress={() => handlePickCategory(null)}
          className="bg-gray-100 px-4 py-2 rounded-lg"
        >
          <Text className="text-gray-800 font-medium">All Categories</Text>
        </TouchableOpacity>

        {categoryMutation.isPending ? (
          <ActivityIndicator size="small" />
        ) : errorMessage ? (
          <Text className="text-red-500">{errorMessage}</Text>
        ) : (
          categoryData.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              onPress={() => handlePickCategory(cat.id)}
              className="bg-blue-100 px-4 py-2 rounded-lg"
            >
              <Text className="text-blue-800 font-medium">{cat.name}</Text>
            </TouchableOpacity>
          ))
        )}
      </View>
    
  );
};
