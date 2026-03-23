import React, { useState } from "react"
import { TouchableOpacity, View, Text } from "react-native"
import ContainerTemplate from "./dashboardComponent/containerTemplate"
import { ThemeText } from "./ThemeText"
import { Textstyles } from "static/textFontsize"
import { FontAwesome5 } from "@expo/vector-icons"
import EmptyView from "./emptyview"
import { useTheme } from "hooks/useTheme"
import { getColors } from "static/color"
import ButtonComponent from "./buttoncomponent"
import { useSelector } from "react-redux"
import { RootState } from "redux/store"
import { useMutation } from "@tanstack/react-query"
import { getArtisanListFn } from "services/userService"

interface ProfessionalFilterProps {
    showmodal: boolean,
    setshowmodal: (value: boolean) => void;
    setfilterData: (value: any[]) => void;
    professionId?: number;
}

const ProfessionalFilter = ({ showmodal, setshowmodal, setfilterData, professionId }: ProfessionalFilterProps) => {
    const [filterType, setFilterType] = useState<'all' | 'nearest' | 'rating'>('all');
    const [minRating, setMinRating] = useState(0);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    
    const { theme } = useTheme();
    const { secondaryTextColor, primaryColor, backgroundColortwo } = getColors(theme);
    const token: string = useSelector((state: RootState) => (state.auth?.token) ?? "");

    const mutation = useMutation({
        mutationFn: (query: string) => getArtisanListFn(token, query),
        onSuccess: (response: any) => {
            console.log('Filtered professionals:', response.data);
            setfilterData(response.data);
        },
        onError: (error: any) => {
            let msg = "An unexpected error occurred";
            if (error?.response?.data) {
                msg = error.response.data.message || error.response.data.error || JSON.stringify(error.response.data);
            } else if (error?.message) {
                msg = error.message;
            }
            setErrorMessage(msg);
            console.error("Filter failed:", msg);
        },
    });

    const handleCloseModal = () => {
        setshowmodal(!showmodal);
    };

    const handleApply = () => {
        let queryParts = [];
        
        // Always include profession ID if available
        if (professionId) {
            queryParts.push(`professionId=${professionId}`);
        }
        
        // Add filter-specific parameters
        if (filterType === 'nearest') {
            queryParts.push('sortBy=distance');
            queryParts.push('order=asc');
        } else if (filterType === 'rating') {
            queryParts.push(`minRating=${minRating}`);
            queryParts.push('sortBy=rating');
            queryParts.push('order=desc');
        }
        
        const queryString = queryParts.join('&');
        console.log('Filter Query:', queryString);
        
        mutation.mutate(queryString, {
            onSuccess: () => {
                console.log('Filter applied successfully');
                setshowmodal(false);
            },
            onError: (err) => {
                console.error('Error applying filter:', err);
            }
        });
    };

    const FilterOption = ({ type, title, description, icon }: {
        type: 'all' | 'nearest' | 'rating';
        title: string;
        description: string;
        icon: string;
    }) => (
        <TouchableOpacity
            onPress={() => setFilterType(type)}
            style={{
                backgroundColor: filterType === type ? primaryColor + '15' : 'transparent',
                borderWidth: 2,
                borderColor: filterType === type ? primaryColor : secondaryTextColor + '30',
                borderRadius: 12,
                padding: 16,
                marginBottom: 12
            }}
        >
            <View className="flex-row items-start">
                <View
                    style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: filterType === type ? primaryColor : secondaryTextColor + '20',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginRight: 12
                    }}
                >
                    <FontAwesome5 
                        name={icon} 
                        size={18} 
                        color={filterType === type ? '#ffffff' : secondaryTextColor} 
                    />
                </View>
                <View className="flex-1">
                    <Text style={{
                        fontSize: 16,
                        fontWeight: '600',
                        color: theme === 'dark' ? '#FFFFFF' : '#1F2937',
                        fontFamily: 'TTFirsNeue',
                        marginBottom: 4
                    }}>
                        {title}
                    </Text>
                    <Text style={{
                        fontSize: 13,
                        color: secondaryTextColor,
                        fontFamily: 'TTFirsNeue',
                        lineHeight: 18
                    }}>
                        {description}
                    </Text>
                </View>
                {filterType === type && (
                    <View
                        style={{
                            width: 24,
                            height: 24,
                            borderRadius: 12,
                            backgroundColor: primaryColor,
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}
                    >
                        <FontAwesome5 name="check" size={12} color="#ffffff" />
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );

    return (
        <>
            <ContainerTemplate>
                <View className="w-full">
                    <View className="w-full items-end px-3 py-3">
                        <TouchableOpacity onPress={handleCloseModal}>
                            <FontAwesome5 name="times-circle" size={20} color="red" />
                        </TouchableOpacity>
                    </View>
                    <View className="w-full">
                        <ThemeText size={Textstyles.text_cmedium}>
                            Filter Professionals
                        </ThemeText>
                    </View>
                    <EmptyView height={20} />
                    
                    {/* Filter Options */}
                    <View className="w-full">
                        <FilterOption
                            type="all"
                            title="All Professionals"
                            description="Show all available professionals in this profession"
                            icon="users"
                        />
                        
                        <FilterOption
                            type="nearest"
                            title="Nearest First"
                            description="Show professionals closest to your location"
                            icon="location-arrow"
                        />
                        
                        <FilterOption
                            type="rating"
                            title="Highest Rated"
                            description="Show professionals with best ratings first"
                            icon="star"
                        />
                    </View>

                    {/* Rating Slider (only show when rating filter is selected) */}
                    {filterType === 'rating' && (
                        <>
                            <EmptyView height={20} />
                            <View className="w-full">
                                <ThemeText size={Textstyles.text_small}>
                                    Minimum Rating ({minRating} stars)
                                </ThemeText>
                                <View className="flex-row items-center justify-between mt-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <TouchableOpacity
                                            key={star}
                                            onPress={() => setMinRating(star)}
                                            style={{
                                                alignItems: 'center',
                                                opacity: star <= minRating ? 1 : 0.3
                                            }}
                                        >
                                            <FontAwesome5
                                                name="star"
                                                size={24}
                                                color={star <= minRating ? backgroundColortwo : secondaryTextColor}
                                            />
                                            <Text style={{
                                                fontSize: 11,
                                                color: secondaryTextColor,
                                                marginTop: 2,
                                                fontFamily: 'TTFirsNeue'
                                            }}>
                                                {star}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        </>
                    )}

                    <EmptyView height={20} />
                    
                    {errorMessage && (
                        <View style={{
                            backgroundColor: backgroundColortwo + '15',
                            borderWidth: 1,
                            borderColor: backgroundColortwo + '30',
                            borderRadius: 8,
                            padding: 12,
                            marginBottom: 16
                        }}>
                            <Text style={{
                                color: backgroundColortwo,
                                fontSize: 13,
                                fontFamily: 'TTFirsNeue',
                                textAlign: 'center'
                            }}>
                                {errorMessage}
                            </Text>
                        </View>
                    )}
                    
                    <ButtonComponent 
                        color={primaryColor} 
                        text="Apply Filter" 
                        textcolor="#ffffff" 
                        onPress={handleApply}
                    />
                </View>
            </ContainerTemplate>
        </>
    );
};

export default ProfessionalFilter;
