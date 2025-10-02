import { TouchableOpacity, View, Text } from "react-native";
import ContainerTemplate from "./dashboardComponent/containerTemplate";

interface FilterModalProps {
    showmodal: boolean;
    setshowmodal: (value: boolean) => void;
    setStatus: (value: string) => void;
}

const statusOptions = [
    { value: 'COMPLETED', label: 'Completed', bg: 'bg-green-100', text: 'text-green-800' },
    { value: 'APPROVED', label: 'Approved', bg: 'bg-blue-100', text: 'text-blue-800' },
    { value: 'DISPUTED', label: 'Disputed', bg: 'bg-yellow-100', text: 'text-yellow-800' },
    { value: 'PENDING', label: 'Pending', bg: 'bg-orange-100', text: 'text-orange-800' },
    { value: 'DECLINED', label: 'Declined', bg: 'bg-red-100', text: 'text-red-800' },
    { value: 'REJECTED', label: 'Rejected', bg: 'bg-red-100', text: 'text-red-800' },
    { value: 'CANCELED', label: 'Canceled', bg: 'bg-red-100', text: 'text-red-800' },
    { value: 'ONGOING', label: 'Ongoing', bg: 'bg-purple-100', text: 'text-purple-800' },
    { value: '', label: 'All Statuses', bg: 'bg-gray-100', text: 'text-gray-800' }
];

export const FilterModalByStatus = ({ showmodal, setshowmodal, setStatus }: FilterModalProps) => {
    const handlePickStatus = (value: string) => {
        setStatus(value);
        setshowmodal(!showmodal);
    };

    return (
        <ContainerTemplate>
            <View className="w-full items-center justify-center flex-row flex-wrap gap-2 p-2 pt-5">
                {statusOptions.map((option) => (
                    <TouchableOpacity
                        key={option.value}
                        onPress={() => handlePickStatus(option.value)}
                        className={`${option.bg} px-4 py-2 rounded-lg`}
                    >
                        <Text className={`${option.text} font-medium`}>
                            {option.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </ContainerTemplate>
    );
};

const statusOptionstwo = [
    { value: 'pending', label: 'Pending', bg: 'bg-orange-100', text: 'text-orange-800' },
    { value: 'accepted', label: 'Accepted', bg: 'bg-blue-100', text: 'text-blue-800' },
    { value: 'picked_up', label: 'Picked Up', bg: 'bg-yellow-100', text: 'text-yellow-800' },
    { value: 'confirm_pickup', label: 'Confirm Pickup', bg: 'bg-purple-100', text: 'text-purple-800' },
    { value: 'in_transit', label: 'In Transit', bg: 'bg-teal-100', text: 'text-teal-800' },
    { value: 'delivered', label: 'Delivered', bg: 'bg-green-100', text: 'text-green-800' },
    { value: 'confirm_delivery', label: 'Confirm Delivery', bg: 'bg-indigo-100', text: 'text-indigo-800' },
    { value: 'cancelled', label: 'Cancelled', bg: 'bg-red-100', text: 'text-red-800' },
    { value: '', label: 'All Statuses', bg: 'bg-gray-100', text: 'text-gray-800' }
  ];
  

export const FilterModalByStatusDelivery = ({ showmodal, setshowmodal, setStatus }: FilterModalProps) => {
    const handlePickStatus = (value: string) => {
        setStatus(value);
        setshowmodal(!showmodal);
    };

    return (
        <ContainerTemplate>
            <View className="w-full items-center justify-center flex-row flex-wrap gap-2 p-2 pt-5">
                {statusOptionstwo.map((option) => (
                    <TouchableOpacity
                        key={option.value}
                        onPress={() => handlePickStatus(option.value)}
                        className={`${option.bg} px-4 py-2 rounded-lg`}
                    >
                        <Text className={`${option.text} font-medium`}>
                            {option.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </ContainerTemplate>
    );
};
