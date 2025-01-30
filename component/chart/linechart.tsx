import React from 'react';
import { View, Dimensions, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useTheme } from '../../hooks/useTheme';
import { getColors } from '../../static/color';

const LineChartgraphy = () => {
    const { theme } = useTheme()
    const { primaryTextColor, selectioncardColor, primaryColor } = getColors(theme)

  return (
    <View >
      <LineChart
        data={{
          labels: ['FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL'], // X-axis labels
          datasets: [
            {
              data: [40000, 80000, 20000, 160000, 40000, 200000], // Y-axis values
            },
          ],
        }}
        width={Dimensions.get('window').width - 32} // Adjust for padding
        height={260}
        yAxisLabel="₦"
        yAxisSuffix=""
        yAxisInterval={1} // Optional: interval between grid lines
        chartConfig={{
          backgroundColor: selectioncardColor,
          backgroundGradientFrom: selectioncardColor,
          backgroundGradientTo: selectioncardColor,
          decimalPlaces: 0, // Display values without decimals
          color: (opacity = 1) =>`${primaryColor}`, // Line color
          labelColor: (opacity = 1) => primaryColor, // Label color
          style: {
            borderRadius: 5,
          },
          propsForDots: {
            r: '6',
            strokeWidth: '2',
            stroke: '#1f77b4',
          },
        }}
        bezier // Smooth curve
        style={{
          marginVertical: 0,
          borderRadius: 4,
        }}
      />
    </View>
  );
};



export default LineChartgraphy;

