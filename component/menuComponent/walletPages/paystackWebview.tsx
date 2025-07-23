import { useLocalSearchParams, useRouter } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { WebView } from "react-native-webview";
import { useEffect, useState } from "react";
import ContainerTemplate from "component/dashboardComponent/containerTemplate";
import HeaderComponent from "component/headerComp";
import { useSocket } from "hooks/useSocket";


const PaymentWebView = () => {
  const { url, reference } = useLocalSearchParams();
  const router = useRouter();
  const {socket} = useSocket(); // your connected socket instance

  const paymentUrl = Array.isArray(url) ? url[0] : url;
  const paymentRef = Array.isArray(reference) ? reference[0] : reference;

  const [hasVerified, setHasVerified] = useState(false);

  useEffect(() => {
    if (!socket || !paymentRef) return;

    const handlePaymentSuccess = (payload: any) => {
      if (
        payload?.data?.reference === paymentRef &&
        payload?.data?.status === "success" &&
        !hasVerified
      ) {
        setHasVerified(true);
        router.replace({
          pathname: "/paymentSuccess",
          params: { message: "Payment successful" },
        });
      }
    };

    socket.on("PAYMENT_SUCCESS", handlePaymentSuccess);

    return () => {
      socket.off("PAYMENT_SUCCESS", handlePaymentSuccess);
    };
  }, [socket, paymentRef, hasVerified]);

  const handleNavigationChange = (navState: any) => {
    const currentUrl = navState.url;
    const isRedirectToServer =
      currentUrl.startsWith("https://www.acepickdev.com") &&
      currentUrl.includes("reference=");
    
    // Optional: add a fallback navigation or loading indicator
  };

  if (!paymentUrl || !paymentRef) return <ActivityIndicator />;

  return (
    <ContainerTemplate>
      <HeaderComponent title="Paystack Payment" />
      <View style={{ flex: 1 }}>
        <WebView
          source={{ uri: paymentUrl }}
          javaScriptEnabled
          domStorageEnabled
          startInLoadingState
          onNavigationStateChange={handleNavigationChange}
        />
      </View>
    </ContainerTemplate>
  );
};

export default PaymentWebView;
