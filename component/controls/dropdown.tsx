import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { getColors } from '../../static/color';
import { Textstyles } from '../../static/textFontsize';
import { useState } from 'react';
import { FontAwesome } from '@expo/vector-icons';

interface DropdownProps {
  label?: string;
  placeholder: string;
  options: { label: string; value: string }[];
  value?: string;
  onSelect: (value: string) => void;
  color?: string;
  placeholdercolor?: string;
  disabled?: boolean;
}

const Dropdown = ({ 
  label, 
  placeholder, 
  options, 
  value, 
  onSelect, 
  color, 
  placeholdercolor,
  disabled = false 
}: DropdownProps) => {
  const { theme } = useTheme();
  const { primaryColor, secondaryTextColor, backgroundColor, borderColor } = getColors(theme);
  const [modalVisible, setModalVisible] = useState(false);
  
  const selectedOption = options.find(option => option.value === value);
  const displayValue = selectedOption?.label || placeholder;

  return (
    <View className="w-full">
      {label && (
        <Text style={[Textstyles.text_small, { color: secondaryTextColor }]} className="mb-1">
          {label}
        </Text>
      )}
      <TouchableOpacity
        onPress={() => !disabled && setModalVisible(true)}
        disabled={disabled}
        className="w-full h-16 border rounded-lg flex-row items-center px-4"
        style={{
          borderColor: color || borderColor,
          backgroundColor: disabled ? '#f3f4f6' : 'transparent',
          opacity: disabled ? 0.5 : 1
        }}
      >
        <Text 
          style={{ 
            flex: 1, 
            color: value ? secondaryTextColor : placeholdercolor || secondaryTextColor 
          }} 
          className="text-base"
        >
          {displayValue}
        </Text>
        <FontAwesome 
          name="chevron-down" 
          size={16} 
          color={color || primaryColor} 
        />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View 
            className="w-11/12 max-h-80 rounded-xl p-4"
            style={{ backgroundColor }}
          >
            <View className="flex-row justify-between items-center mb-4">
              <Text style={[Textstyles.text_medium, { color: secondaryTextColor }]}>
                Select {label || 'Option'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <FontAwesome name="times" size={20} color={secondaryTextColor} />
              </TouchableOpacity>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              {options.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => {
                    onSelect(option.value);
                    setModalVisible(false);
                  }}
                  className="py-3 px-2 border-b"
                  style={{ 
                    borderBottomColor: theme === 'dark' ? '#374151' : '#E5E7EB',
                    backgroundColor: option.value === value ? (theme === 'dark' ? '#4B5563' : '#F3F4F6') : 'transparent'
                  }}
                >
                  <Text 
                    style={[
                      Textstyles.text_small, 
                      { 
                        color: secondaryTextColor,
                        fontWeight: option.value === value ? 'bold' : 'normal'
                      }
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Dropdown;
