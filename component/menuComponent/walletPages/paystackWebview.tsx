import { useLocalSearchParams, useRouter } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { WebView } from "react-native-webview";
import { useEffect, useRef } from "react";
import ContainerTemplate from "component/dashboardComponent/containerTemplate";
import HeaderComponent from "component/headerComp";
import { useToast } from "context/ToastContext";
import { useSocket } from "hooks/useSocket";
import { paymentVerify } from "services/userService";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "redux/store";
import { updateUserFromDashboard } from "redux/slices/authSlice";
import { walletView } from "services/userService";


const PaymentWebView = () => {
  const { url, reference, context, jobId } = useLocalSearchParams();
  const router = useRouter();
  const { socket } = useSocket();
  const toast = useToast();

  const paymentUrl = Array.isArray(url) ? url[0] : url;
  const paymentRef = Array.isArray(reference) ? reference[0] : reference;
  const paymentContext = Array.isArray(context) ? context[0] : context;
  const paymentJobId = Array.isArray(jobId) ? jobId[0] : jobId;

  const role = useSelector((state: RootState) => state.auth.user?.role);
  const dispatch = useDispatch();

  // Use a ref instead of state — state updates are async and can't reliably
  // guard against double-triggers from rapid WebView navigation events.
  const hasVerifiedRef = useRef(false);

  const refreshWalletIfFund = async () => {
    if (paymentContext === "fund") {
      try {
        const res = await walletView();
        const wallet = res?.data || res?.wallet;
        if (wallet) dispatch(updateUserFromDashboard({ wallet }));
      } catch (_) {}
    }
  };

  const navigateAfterPayment = async (orderId?: string) => {
    await refreshWalletIfFund();
    if (router.canDismiss()) router.dismissAll();

    if (paymentContext === "fund") {
      // Navigate to the correct home screen based on the user's active role
      const homeDest =
        role === "professional"
          ? "/(Authenticated)/(professionalLayout)/(professionaldashboard)/homeprofessionalayout"
          : role === "delivery"
          ? "/(Authenticated)/(delivery)/deliverydashboardlayout"
          : "/(Authenticated)/(dashboard)/homelayout";
      router.replace(homeDest as any);
    } else if (paymentContext === "wallet") {
      router.replace("/(Authenticated)/(wallet)/walletpay" as any);
    } else if (paymentContext === "job") {
      const jobIdToUse = orderId || paymentJobId;
      if (jobIdToUse) {
        router.replace(`/(Authenticated)/(jobs)/jobdetailsLayout/${jobIdToUse}` as any);
      } else {
        router.replace("/(Authenticated)/(dashboard)" as any);
      }
    } else {
      // Marketplace: land on My Items (Bought) as the back-stack base,
      // then immediately push Order Details on top so the user sees their
      // order and can press Back → My Items → Marketplace naturally.
      router.replace("/(Authenticated)/(marketplace)/myItemsLayout?tab=Bought" as any);
      if (orderId) {
        // Small delay lets the replace settle before pushing on top
        setTimeout(() => {
          router.push(`/(Authenticated)/(marketplace)/orderproductdetails?id=${orderId}` as any);
        }, 150);
      }
    }
  };

  // Socket path: server pushes PAYMENT_SUCCESS after webhook confirms payment
  useEffect(() => {
    if (!socket || !paymentRef) return;

    const handlePaymentSuccess = (payload: {
      data?: {
        reference?: string;
        status?: string;
        orderId?: string;
        order?: { id?: string };
      };
    }) => {
      if (
        payload?.data?.reference === paymentRef &&
        payload?.data?.status === "success" &&
        !hasVerifiedRef.current
      ) {
        hasVerifiedRef.current = true;
        toast.success("Payment Successful", "Your payment has been completed successfully!");
        const orderId = payload?.data?.orderId || payload?.data?.order?.id;
        navigateAfterPayment(orderId);
      }
    };

    socket.on("PAYMENT_SUCCESS", handlePaymentSuccess);
    return () => {
      socket.off("PAYMENT_SUCCESS", handlePaymentSuccess);
    };
  }, [socket, paymentRef]);

  // WebView fallback: detect redirect to callback URL and verify manually
  const handleNavigationChange = (navState: any) => {
    const currentUrl: string = navState.url || "";

    // Match both dev.acepickdev.com and www.acepickdev.com callback redirects
    const isCallbackUrl =
      currentUrl.includes("acepickdev.com") &&
      (currentUrl.includes("reference=") || currentUrl.includes("trxref="));

    if (!isCallbackUrl || hasVerifiedRef.current) return;

    // Lock immediately (sync) before any async work
    hasVerifiedRef.current = true;

    toast.info("Verifying Payment", "Please wait while we confirm your payment...");

    paymentVerify(paymentRef as string)
      .then((result) => {
        // Normalise varying response shapes: result.data or result.result.data
        const data = result?.data ?? result?.result?.data ?? result;
        const status = data?.status;
        const orderId = data?.orderId ?? data?.order?.id ?? data?.id;

        if (status === "success") {
          toast.success("Payment Successful", "Your payment has been confirmed!");
        } else {
          toast.info("Payment Processing", "Your payment is being processed.");
        }
        navigateAfterPayment(orderId);
      })
      .catch(() => {
        toast.info("Payment Processing", "Your payment is being processed.");
        navigateAfterPayment();
      });
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
