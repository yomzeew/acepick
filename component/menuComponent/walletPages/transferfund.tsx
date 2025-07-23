import { FlatList, ActivityIndicator, TouchableOpacity, View, Text, Modal } from "react-native";
import { useEffect, useState } from "react";
import InputComponent from "component/controls/textinput";
import { ThemeText, ThemeTextsecond } from "component/ThemeText";
import EmptyView from "component/emptyview";
import { Textstyles } from "static/textFontsize";
import { useTheme } from "hooks/useTheme";
import { getColors } from "static/color";
import { useMutation } from "@tanstack/react-query";
import {
  addAccountFn,
  deleteAccountFn,
  getAccountFn,
  getBanksFn,
  resolveAccountFn,
  transferInitiate,
  transferVerify
} from "services/userService";
import ButtonComponent from "component/buttoncomponent";
import { BankRecipient } from "type";
import { FontAwesome5 } from "@expo/vector-icons";
import { useDelay } from "hooks/useDelay";
import { AlertMessageBanner } from "component/AlertMessageBanner";
import { useRouter } from "expo-router";

interface BankDetailsProps {
  setshowmodal: (value: boolean) => void;
}

const TransferFund = ({ setshowmodal }: BankDetailsProps) => {
  const [amount, setAmount] = useState("");
  const [accountDetails,  setAccountDetails] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [shouldProceed, setShouldProceed] = useState<boolean>(false);
  const [bankDetails, setBankDetails] = useState<BankRecipient[]>([]);
  const [selectedRecipientCode, setSelectedRecipientCode] = useState<string | null>(null);
  const [selectModalVisible, setSelectModalVisible] = useState(false);

  const { theme } = useTheme();
  const { selectioncardColor, primaryColor,backgroundColor,backgroundColortwo} = getColors(theme);
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: getAccountFn,
    onSuccess: (response) => {
      setBankDetails(response.data);
    },
    onError: (error: any) => {
      console.error(error?.response?.data?.message || error?.message || "An unexpected error occurred");
    },
  });

  const mutationInitiate = useMutation({
    mutationFn: transferInitiate,
    onSuccess: (response) => {
        console.log(response)
      const transfer_code  = response.data.reference;

      mutationVerify.mutate( transfer_code );
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || error?.message || "An unexpected error occurred";
      setErrorMessage(msg);
    },
  });

  const mutationVerify = useMutation({
    mutationFn: transferVerify,
    onSuccess: (response) => {
      setSuccessMessage("Transfer successful");
      setShouldProceed(true);
      router.push("/paymentSuccess");
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || error?.message || "Transfer verification failed";
      setErrorMessage(msg);
    },
  });

  useEffect(() => {
    mutation.mutate();
  }, []);

  useDelay(() => {
    if (shouldProceed) {
      setshowmodal(false);
    }
  }, 2000, [shouldProceed]);

  useEffect(() => {
    if (selectedRecipientCode) {
      const selected = bankDetails.find((b) => b.recipientCode === selectedRecipientCode);
      if (selected) {
        setAccountDetails(selected.name+'-'+selected.bank);

      }

    }
  }, [selectedRecipientCode]);

  return (
    <>
      {successMessage && <AlertMessageBanner type="success" message={successMessage} />}
      {errorMessage && <AlertMessageBanner type="error" message={errorMessage} />}

      <View className="w-full h-full px-3 py-5">
        <ThemeText size={Textstyles.text_xsmall}>Beneficiary</ThemeText>
        <TouchableOpacity
          onPress={() => setSelectModalVisible(true)}
          className="w-full h-14 border border-gray-400 rounded-lg justify-center px-3"
        >
          <ThemeText size={Textstyles.text_xxxsmall}>
            {accountDetails || "Select beneficiary"} 
          </ThemeText>
        </TouchableOpacity>

        <EmptyView height={10} />
        <ThemeText size={Textstyles.text_xsmall}>Amount</ThemeText>
        <InputComponent
                  placeholder="Enter amount"
                  placeholdercolor="#888"
                  value={amount}
                  onChange={(text) => setAmount(text)}
                  keyboardType="numeric" 
                  color={primaryColor}        />

        <EmptyView height={20} />
        <ButtonComponent
          disabled={!amount || !selectedRecipientCode || mutationInitiate.isPending}
          isLoading={mutationInitiate.isPending}
          color={primaryColor}
          text="Withdraw Fund"
          textcolor="#fff"
          onPress={() => {
            const payload = {
              amount,
              recipientCode: selectedRecipientCode!,
              reason: "Withdrawal"
            };
            mutationInitiate.mutate(payload);
          }}
        />
      </View>

      {/* Beneficiary Selection Modal */}
      <Modal
        visible={selectModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectModalVisible(false)}
      >
        <View  className="flex-1 bg-black/30 justify-center items-center">
          <View style={{backgroundColor:backgroundColor}} className=" w-[90%] rounded-xl p-5 max-h-[70%]">
            <ThemeText size={Textstyles.text_cmedium}>
            <Text className="font-semibold mb-3 text-center">Select Beneficiary</Text>
            </ThemeText>
          
            {mutation.isPending ? (
              <ActivityIndicator size="small" />
            ) : (
              <FlatList
                data={bankDetails}
                keyExtractor={(item) => item.recipientCode}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedRecipientCode(item.recipientCode);
                      setSelectModalVisible(false);
                    }}
                    className="p-3 mb-2 border border-gray-200 rounded-md"
                    style={{ backgroundColor: selectioncardColor }}
                  >
                    <ThemeText size={Textstyles.text_xxxsmall}>
                    <Text className="font-medium">{item.name}</Text>

                    </ThemeText>
                   <ThemeTextsecond size={Textstyles.text_xxxsmall}>
                   <Text className="text-sm ">{item.bank} - {item.number}</Text>
                   </ThemeTextsecond>
                   
                  </TouchableOpacity>
                )}
              />
            )}
            <EmptyView height={10} />
            <ButtonComponent
              text="Close"
              color="#ccc"
              textcolor="#000"
              onPress={() => setSelectModalVisible(false)}
            />
          </View>
        </View>
      </Modal>
    </>
  );
};

export default TransferFund;
