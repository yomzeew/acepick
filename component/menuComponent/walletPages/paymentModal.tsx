import { FontAwesome } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import EmptyView from "component/emptyview";
import { ThemeText, ThemeTextsecond } from "component/ThemeText";
import { useRouter } from "expo-router";
import { useDelay } from "hooks/useDelay";
import { useTheme } from "hooks/useTheme";
import { useEffect, useState } from "react";
import { TextInput, TouchableOpacity, View, Text, Linking } from "react-native";
import { paymentInitiate, paymentVerify } from "services/userService";
import { getColors } from "static/color";
import { Textstyles } from "static/textFontsize";

interface PaymentProps {
  setSuccessMessage: (value: any) => void;
  setErrorMessage: (value: any) => void;
  errorMessage: string;
  successMessage: string;
}

const PaymentModal = ({
  setSuccessMessage,
  setErrorMessage,
  errorMessage,
  successMessage,
}: PaymentProps) => {
  const { theme } = useTheme();
  const { primaryColor, secondaryTextColor, selectioncardColor } = getColors(theme);
  const [amount, setAmount] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [ref, setRef] = useState<string>("");

  const [shouldProceed, setShouldProceed] = useState<boolean>(false);

  const router = useRouter();
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage(null);
      }, 4000);
      return () => clearTimeout(timer); // Cleanup on unmount or on new error
    }
  }, [errorMessage])
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 4000);
      return () => clearTimeout(timer); // Cleanup on unmount or on new error
    }
  }, [successMessage])
 

  // Clear error message after 4 seconds
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
      setRef(reference);
      setSuccessMessage("Payment initiated");
      console.log(authorization_url)
      if (authorization_url && reference) {
        router.push({
          pathname: "/paystackViewLayout",
          params: { url: authorization_url, reference },
        });
      }
    },
    onError: (error: any) => {
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
      console.error(msg);
    },
  });

 

  const handleNavBankPay = () => {
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      setErrorMsg("Please enter a valid amount");
      return;
    }
    setErrorMsg("");
    mutation.mutate(parsedAmount);
  };

  return (
    <View className="p-5 items-center w-full">
      <EmptyView height={40} />
      <View className="w-full">
        <ThemeText size={Textstyles.text_xsma}>Enter Amount</ThemeText>
        {errorMsg && <Text style={[Textstyles.text_xsma, { color: "red" }]}>{errorMsg}</Text>}
        <View className="w-full h-12">
          <View className="h-12 w-full absolute top-6">
            <ThemeText size={Textstyles.text_small}>₦</ThemeText>
          </View>
          <TextInput
            style={{ color: secondaryTextColor }}
            keyboardType="numeric"
            className="h-12 w-full text-lg border-b px-5 border-b-slate-400 mt-2"
            onChangeText={(text: string) => setAmount(text)}
            value={amount}
          />
        </View>
      </View>

      <EmptyView height={30} />
      <TouchableOpacity onPress={handleNavBankPay} className="w-full h-16">
        <View
          style={{ backgroundColor: selectioncardColor, elevation: 4 }}
          className="w-full h-full items-center flex-row gap-x-3 justify-center rounded-2xl"
        >
          <FontAwesome name="bank" color={primaryColor} size={16} />
          <ThemeTextsecond size={Textstyles.text_xmedium}>Deposit</ThemeTextsecond>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default PaymentModal;
 