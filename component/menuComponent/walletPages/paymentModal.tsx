import { FontAwesome } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import EmptyView from "component/emptyview";
import { ThemeText, ThemeTextsecond } from "component/ThemeText";
import { useRouter } from "expo-router";
import { useTheme } from "hooks/useTheme";
import { useEffect, useState } from "react";
import { TextInput, TouchableOpacity, View, Text } from "react-native";
import { paymentInitiate } from "services/userService";
import { getColors } from "static/color";
import { Textstyles } from "static/textFontsize";
import { useToast } from "context/ToastContext";

interface PaymentProps {
  setErrorMessage: (value: any) => void;
  errorMessage: string;
  /** Called with the Paystack URL + reference once the API responds.
   *  The parent is responsible for closing the modal then navigating,
   *  so the native Modal layer is gone before the WebView screen appears. */
  onPaymentReady?: (url: string, reference: string) => void;
}

const PaymentModal = ({
  setErrorMessage,
  errorMessage,
  onPaymentReady,
}: PaymentProps) => {
  const { theme } = useTheme();
  const { primaryColor, secondaryTextColor, selectioncardColor } = getColors(theme);
  const toast = useToast();
  const router = useRouter();
  const [amount, setAmount] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");

  // Clear parent error message after 4 seconds
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const mutation = useMutation({
    mutationFn: paymentInitiate,
    onSuccess: (data) => {
      const { reference, authorization_url } = data.data;
      if (!authorization_url || !reference) return;

      toast.success("Payment initiated", "Redirecting to payment gateway...");

      if (onPaymentReady) {
        // Hand off to the parent — parent closes modal first, then navigates.
        // This guarantees the native Modal window is gone before the WebView
        // screen is pushed onto the navigation stack.
        onPaymentReady(authorization_url, reference);
      } else {
        // Fallback: navigate directly (no modal to close)
        router.push({
          pathname: "/paystackViewLayout",
          params: { url: authorization_url, reference, context: 'fund' },
        } as any);
      }
    },
    onError: (error: any) => {
      if (error?.bvnRequired) {
        toast.error("BVN Verification Required", "You must verify your BVN before performing transactions");
        router.push("/bvnactivationlayout" as any);
        return;
      }
      let msg = "An unexpected error occurred";
      if (error?.response?.data) {
        msg =
          error.response.data.message ||
          error.response.data.error ||
          JSON.stringify(error.response.data);
      } else if (error?.message) {
        msg = error.message;
      }
      setErrorMessage(msg);
    },
  });

  const handleNavBankPay = () => {
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      setErrorMsg("Please enter a valid amount");
      return;
    }
    setErrorMsg("");
    mutation.mutate({ amount: parsedAmount, description: "Wallet topup" });
  };

  return (
    <View className="p-5 items-center w-full">
      <EmptyView height={40} />
      <View className="w-full">
        <ThemeText size={Textstyles.text_xsma}>Enter Amount</ThemeText>
        {errorMsg && <Text style={[Textstyles.text_xsma, { color: "red" }]}>{errorMsg}</Text>}
        <View className="w-full h-12">
          <TextInput
            style={{ color: secondaryTextColor }}
            keyboardType="numeric"
            className="h-12 w-full text-lg border-b border-b-slate-400 pl-2"
            onChangeText={(text: string) => {
              const cleanText = text.replace(/[^0-9]/g, '');
              setAmount(cleanText);
            }}
            value={amount ? `₦${parseInt(amount).toLocaleString()}` : '₦'}
          />
        </View>
      </View>

      <EmptyView height={30} />
      <TouchableOpacity onPress={handleNavBankPay} disabled={mutation.isPending} className="w-full h-16">
        <View
          style={{ backgroundColor: selectioncardColor, elevation: 4, opacity: mutation.isPending ? 0.6 : 1 }}
          className="w-full h-full items-center flex-row gap-x-3 justify-center rounded-2xl"
        >
          <FontAwesome name="bank" color={primaryColor} size={16} />
          <ThemeTextsecond size={Textstyles.text_xmedium}>
            {mutation.isPending ? "Processing..." : "Deposit"}
          </ThemeTextsecond>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default PaymentModal;
