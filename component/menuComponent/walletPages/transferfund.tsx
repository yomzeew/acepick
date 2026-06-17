import { FlatList, ActivityIndicator, TouchableOpacity, View, Text, Modal } from "react-native";
import { useEffect, useState } from "react";
import InputComponent from "component/controls/textinput";
import EmptyView from "component/emptyview";
import { useTheme } from "hooks/useTheme";
import { getColors } from "static/color";
import { useMutation } from "@tanstack/react-query";
import { getAccountFn, transferInitiate, transferVerify } from "services/userService";
import ButtonComponent from "component/buttoncomponent";
import { BankRecipient } from "types/type";
import { Feather, FontAwesome5 } from "@expo/vector-icons";
import { useToast } from "context/ToastContext";
import { useSelector } from "react-redux";
import { RootState } from "redux/store";
import { formatAmount } from "utilizes/amountFormat";
import PinModal from "component/pinModal";

interface TransferFundProps {
  setshowmodal: (value: boolean) => void;
}

const TransferFund = ({ setshowmodal }: TransferFundProps) => {
  const [amount, setAmount] = useState("");
  const [bankDetails, setBankDetails] = useState<BankRecipient[]>([]);
  const [selectedRecipientCode, setSelectedRecipientCode] = useState<string | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<BankRecipient | null>(null);
  const [selectModalVisible, setSelectModalVisible] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);

  const { theme } = useTheme();
  const { selectioncardColor, primaryColor, secondaryTextColor, backgroundColor, backgroundColortwo } = getColors(theme);
  const isDark = theme === "dark";
  const toast = useToast();
  const wallet = useSelector((state: RootState) => state?.auth.user?.wallet);
  const currentBalance = Number(wallet?.currentBalance || 0);

  const mutation = useMutation({
    mutationFn: getAccountFn,
    onSuccess: (response) => setBankDetails(response.data),
    onError: (error: any) => {
      const msg = error?.response?.data?.message || error?.message || "Failed to load accounts";
      toast.error("Error", msg);
    },
  });

  const mutationInitiate = useMutation({
    mutationFn: transferInitiate,
    onSuccess: (response) => {
      const transferRef = response.data.reference;
      mutationVerify.mutate(transferRef);
    },
    onError: (error: any) => {
      // Handle BVN verification required error
      if (error?.bvnRequired) {
        toast.error("BVN Verification Required", "You must verify your BVN before performing transactions");
        setshowmodal(false);
        return;
      }

      const msg = error?.response?.data?.message || error?.message || "Withdrawal failed";
      toast.error("Withdrawal Failed", msg);
    },
  });

  const mutationVerify = useMutation({
    mutationFn: transferVerify,
    onSuccess: () => {
      toast.success("Withdrawal Initiated", "Your funds are being transferred to your bank account");
      setTimeout(() => setshowmodal(false), 1500);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || error?.message || "Transfer verification failed";
      toast.error("Verification Failed", msg);
    },
  });

  useEffect(() => {
    mutation.mutate();
  }, []);

  useEffect(() => {
    if (selectedRecipientCode) {
      const selected = bankDetails.find((b) => b.recipientCode === selectedRecipientCode);
      if (selected) setSelectedAccount(selected);
    }
  }, [selectedRecipientCode]);

  const handleWithdraw = () => {
    if (!selectedRecipientCode) {
      toast.error("No Account", "Please select a bank account");
      return;
    }
    if (!amount || Number(amount) <= 0) {
      toast.error("Invalid Amount", "Please enter a valid amount");
      return;
    }
    if (Number(amount) > currentBalance) {
      toast.error("Insufficient Balance", "You don't have enough funds for this withdrawal");
      return;
    }
    setShowPinModal(true);
  };

  const handlePinComplete = (pin: string) => {
    setShowPinModal(false);
    mutationInitiate.mutate({
      amount: Number(amount),
      recipientCode: selectedRecipientCode!,
      pin,
      reason: "Withdrawal",
    });
  };

  const isLoading = mutationInitiate.isPending || mutationVerify.isPending;

  return (
    <>
      <View style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 20 }}>
        {/* Header */}
        <View style={{ alignItems: "center", marginBottom: 24 }}>
          <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: backgroundColortwo + '15', alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
            <Feather name="arrow-up-right" size={24} color={backgroundColortwo} />
          </View>
          <Text style={{ fontSize: 17, fontWeight: "700", color: isDark ? "#F9FAFB" : "#111827" }}>Withdraw Funds</Text>
          <Text style={{ fontSize: 12, color: secondaryTextColor, marginTop: 4 }}>Transfer to your bank account</Text>
        </View>

        {/* Balance Info */}
        <View style={{ backgroundColor: selectioncardColor, borderRadius: 14, padding: 14, marginBottom: 20, flexDirection: "row", alignItems: "center" }}>
          <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: primaryColor + "15", alignItems: "center", justifyContent: "center" }}>
            <FontAwesome5 name="wallet" size={14} color={primaryColor} />
          </View>
          <View style={{ marginLeft: 12 }}>
            <Text style={{ fontSize: 11, color: secondaryTextColor }}>Available Balance</Text>
            <Text style={{ fontSize: 16, fontWeight: "700", color: isDark ? "#F9FAFB" : "#111827" }}>{formatAmount(currentBalance)}</Text>
          </View>
        </View>

        {/* Beneficiary */}
        <Text style={{ fontSize: 13, fontWeight: "600", color: isDark ? "#E5E7EB" : "#374151", marginBottom: 6 }}>Bank Account</Text>
        <TouchableOpacity
          onPress={() => setSelectModalVisible(true)}
          activeOpacity={0.7}
          style={{
            backgroundColor: selectioncardColor, borderRadius: 12, padding: 14, marginBottom: 16,
            flexDirection: "row", alignItems: "center", borderWidth: selectedAccount ? 1.5 : 0,
            borderColor: selectedAccount ? primaryColor + "40" : "transparent",
          }}
        >
          {selectedAccount ? (
            <>
              <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: primaryColor + "15", alignItems: "center", justifyContent: "center" }}>
                <FontAwesome5 name="university" size={13} color={primaryColor} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={{ fontSize: 13, fontWeight: "600", color: isDark ? "#F9FAFB" : "#111827" }}>{selectedAccount.name}</Text>
                <Text style={{ fontSize: 11, color: secondaryTextColor, marginTop: 1 }}>{selectedAccount.bank} - {selectedAccount.number}</Text>
              </View>
              <Feather name="check-circle" size={16} color={primaryColor} />
            </>
          ) : (
            <>
              <Feather name="plus-circle" size={18} color={secondaryTextColor} />
              <Text style={{ fontSize: 13, color: secondaryTextColor, marginLeft: 10 }}>Select bank account</Text>
              <View style={{ flex: 1 }} />
              <Feather name="chevron-down" size={16} color={secondaryTextColor} />
            </>
          )}
        </TouchableOpacity>

        {/* Amount */}
        <Text style={{ fontSize: 13, fontWeight: "600", color: isDark ? "#E5E7EB" : "#374151", marginBottom: 6 }}>Amount</Text>
        <InputComponent
          placeholder="Enter amount"
          placeholdercolor="#888"
          value={amount}
          onChange={(text) => setAmount(text)}
          keyboardType="numeric"
          color={primaryColor}
        />

        <EmptyView height={24} />
        <ButtonComponent
          disabled={!amount || !selectedRecipientCode || isLoading}
          isLoading={isLoading}
          color={backgroundColortwo}
          text="Withdraw"
          textcolor="#fff"
          onPress={handleWithdraw}
        />

        {Number(amount) > 0 && selectedAccount && (
          <View style={{ marginTop: 16, backgroundColor: selectioncardColor, borderRadius: 12, padding: 14 }}>
            <Text style={{ fontSize: 11, color: secondaryTextColor, textAlign: "center" }}>
              You are withdrawing {formatAmount(Number(amount))} to {selectedAccount.name} ({selectedAccount.bank})
            </Text>
          </View>
        )}
      </View>

      {/* PIN Modal */}
      <PinModal
        visible={showPinModal}
        mode="transaction"
        onComplete={handlePinComplete}
        onClose={() => setShowPinModal(false)}
        loading={isLoading}
      />

      {/* Beneficiary Selection Modal */}
      <Modal visible={selectModalVisible} transparent animationType="slide" onRequestClose={() => setSelectModalVisible(false)}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.3)", justifyContent: "center", alignItems: "center" }}>
          <View style={{ backgroundColor: backgroundColor, width: "90%", borderRadius: 16, padding: 20, maxHeight: "70%" }}>
            <View style={{ alignItems: "center", marginBottom: 16 }}>
              <Text style={{ fontSize: 16, fontWeight: "700", color: isDark ? "#F9FAFB" : "#111827" }}>Select Bank Account</Text>
            </View>

            {mutation.isPending ? (
              <View style={{ paddingVertical: 20, alignItems: "center" }}>
                <ActivityIndicator size="small" color={primaryColor} />
              </View>
            ) : bankDetails.length === 0 ? (
              <View style={{ paddingVertical: 24, alignItems: "center" }}>
                <FontAwesome5 name="university" size={20} color={secondaryTextColor} />
                <Text style={{ fontSize: 12, color: secondaryTextColor, marginTop: 8 }}>No bank accounts found. Add one first.</Text>
              </View>
            ) : (
              <FlatList
                data={bankDetails}
                keyExtractor={(item) => item.recipientCode}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => {
                  const isSelected = item.recipientCode === selectedRecipientCode;
                  return (
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedRecipientCode(item.recipientCode);
                        setSelectModalVisible(false);
                      }}
                      activeOpacity={0.7}
                      style={{
                        backgroundColor: selectioncardColor, borderRadius: 12, padding: 14, marginBottom: 8,
                        flexDirection: "row", alignItems: "center",
                        borderWidth: isSelected ? 1.5 : 0, borderColor: isSelected ? primaryColor : "transparent",
                      }}
                    >
                      <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: primaryColor + "15", alignItems: "center", justifyContent: "center" }}>
                        <FontAwesome5 name="university" size={13} color={primaryColor} />
                      </View>
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={{ fontSize: 13, fontWeight: "600", color: isDark ? "#F9FAFB" : "#111827" }}>{item.name}</Text>
                        <Text style={{ fontSize: 11, color: secondaryTextColor, marginTop: 1 }}>{item.bank} - {item.number}</Text>
                      </View>
                      {isSelected && <Feather name="check-circle" size={16} color={primaryColor} />}
                    </TouchableOpacity>
                  );
                }}
              />
            )}

            <EmptyView height={10} />
            <ButtonComponent text="Close" color="#E5E7EB" textcolor="#374151" onPress={() => setSelectModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </>
  );
};

export default TransferFund;
