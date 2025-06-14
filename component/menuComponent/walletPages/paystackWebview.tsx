import { useLocalSearchParams, useRouter } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { WebView } from "react-native-webview";
import { useMutation } from "@tanstack/react-query";
import { paymentVerify } from "services/userService";
import ContainerTemplate from "component/dashboardComponent/containerTemplate";
import HeaderComponent from "component/headerComp";
import { useEffect, useState } from "react";
import { baseUrl } from "utilizes/endpoints";

const PaymentWebView = () => {
  const { url, reference } = useLocalSearchParams();
  const router = useRouter();

  const paymentUrl = Array.isArray(url) ? url[0] : url;
  const paymentRef = Array.isArray(reference) ? reference[0] : reference;

  const [hasVerified, setHasVerified] = useState(false);

  const mutation = useMutation({
    mutationFn: paymentVerify,
    onSuccess: (data) => {
        console.log(data)
      if (data.data.transaction?.status === "success") {
        router.replace({
          pathname: "/paymentSuccess",
          params: { message: "Payment successful" },
        });
      } else {
        router.replace({
          pathname: "/paymentFail",
          params: { message: "Payment not successful. Try again." },
        });
      }
    },
    onError: () => {
      router.replace({
        pathname: "/paymentFail",
        params: { message: "Error verifying payment." },
      });
    },
  });

  const handleNavigationChange = (navState: any) => {
    const currentUrl = navState.url;

    const isRedirectToServer =
      currentUrl.startsWith("https://acepickapi-g3hcbwe6f4hefjc5.canadacentral-01.azurewebsites.net") &&
      currentUrl.includes("reference=");
      if (isRedirectToServer && !hasVerified) {
        const urlObj = new URL(currentUrl);
        const referenceFromUrl = urlObj.searchParams.get("reference");
        if(referenceFromUrl===paymentRef){
            router.replace({
                pathname: "/paymentSuccess",
                params: { message: "Payment successful" },
              });

        }
        else{
            router.replace({
                pathname: "/paymentFail",
                params: { message: "Payment not successful. Try again." },
              });

        }
      }

    // if (isRedirectToServer && !hasVerified) {
    //   setHasVerified(true);
    //   mutation.mutate(paymentRef);
    // }
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
