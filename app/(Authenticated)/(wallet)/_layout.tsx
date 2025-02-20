import { Stack } from "expo-router";

export default function WalletLayout() {
  return (
    <>

      <Stack 
    screenOptions={{
        headerShown: false,
        gestureEnabled: false, // Disable sliding back gesture
      }}
    >
      <Stack.Screen name="walletpay"/>
    </Stack>
  
    
    </>
  
  );
}