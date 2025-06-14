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
      <Stack.Screen name="cardpaymentlayout/[amount]" />
      <Stack.Screen name="bankdepositlayout/[amount]" />
      <Stack.Screen name="paymentLayout" />
      <Stack.Screen name="paymentSuccess" />
      <Stack.Screen name="paystackViewLayout" />
    </Stack>
  
    
    </>
  
  );
}