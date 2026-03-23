import { FlatList, ActivityIndicator, TouchableOpacity, View, Text, Modal } from "react-native";
import { useEffect, useState } from "react";
import InputComponent from "component/controls/textinput";
import EmptyView from "component/emptyview";
import { ThemeText, ThemeTextsecond } from "component/ThemeText";
import { Textstyles } from "static/textFontsize";
import { useTheme } from "hooks/useTheme";
import { getColors } from "static/color";
import SearchableSelectComponent from "component/dashboardComponent/searchableSelectComponent";
import { useMutation } from "@tanstack/react-query";
import { addAccountFn, deleteAccountFn, getAccountFn, getBanksFn, resolveAccountFn } from "services/userService";
import ButtonComponent from "component/buttoncomponent";
import { BankRecipient } from "types/type";
import { Feather, FontAwesome5 } from "@expo/vector-icons";
import { useToast } from "context/ToastContext";

type Bank = {
  name: string;
  code: string;
};

interface BankDetailsProps {
  setshowmodal: (value: boolean) => void;
}

const BankDetails = ({ setshowmodal }: BankDetailsProps) => {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [bankNames, setBankNames] = useState<string[]>([]);
  const [selectedBankName, setSelectedBankName] = useState("");
  const [selectedBankCode, setSelectedBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");

  const { theme } = useTheme();
  const { primaryColor, secondaryTextColor, selectioncardColor, backgroundColortwo } = getColors(theme);
  const isDark = theme === "dark";
  const toast = useToast();

  const mutation = useMutation({
    mutationFn: getBanksFn,
    onSuccess: (response) => {
      const bankData = response.data;
      setBanks(bankData);
      setBankNames(bankData.map((bank: Bank) => bank.name));
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || error?.message || "Failed to load banks";
      toast.error("Error", msg);
    },
  });

  useEffect(() => {
    mutation.mutate();
  }, []);

  const mutationResolve = useMutation({
    mutationFn: resolveAccountFn,
    onSuccess: (response) => {
      console.log('🏦 resolveAccount full response:', JSON.stringify(response));
      const res = response.data?.data ?? response.data;
      console.log('🏦 resolveAccount parsed res:', JSON.stringify(res));
      setAccountName(res?.account_name || '');
    },
    onError: (error: any) => {
      console.log('🏦 resolveAccount ERROR:', error?.response?.data || error?.message || error);
      setAccountName("");
    },
  });

  useEffect(() => {
    const selected = banks.find((bank) => bank.name === selectedBankName);
    if (selected) setSelectedBankCode(selected.code);
  }, [selectedBankName]);

  useEffect(() => {
    if (accountNumber.length === 10 && selectedBankCode) {
      mutationResolve.mutate({ accountNumber, bankCode: selectedBankCode });
    }
  }, [accountNumber, selectedBankCode]);

  const mutationAddBank = useMutation({
    mutationFn: addAccountFn,
    onSuccess: () => {
      toast.success("Bank Added", "Bank account details saved successfully");
      setAccountNumber("");
      setAccountName("");
      setSelectedBankName("");
      setSelectedBankCode("");
      setTimeout(() => setshowmodal(false), 1500);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || error?.message || "Failed to add bank";
      toast.error("Error", msg);
    },
  });

  const handleSubmit = () => {
    if (!selectedBankName || !accountNumber || !accountName) {
      toast.error("Missing Fields", "Please fill in all bank details");
      return;
    }
    mutationAddBank.mutate({
      accountName,
      bank: selectedBankName,
      bankCode: selectedBankCode,
      accountNumber,
    });
  };

  return (
    <View style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 20 }}>
      <View style={{ alignItems: "center", marginBottom: 20 }}>
        <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: primaryColor + "15", alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
          <FontAwesome5 name="university" size={20} color={primaryColor} />
        </View>
        <Text style={{ fontSize: 16, fontWeight: "700", color: isDark ? "#F9FAFB" : "#111827" }}>Add Bank Account</Text>
        <Text style={{ fontSize: 12, color: secondaryTextColor, marginTop: 4 }}>Link your bank for withdrawals</Text>
      </View>

      <Text style={{ fontSize: 13, fontWeight: "600", color: isDark ? "#E5E7EB" : "#374151", marginBottom: 6 }}>Bank Name</Text>
      {mutation.isPending ? (
        <View style={{ height: 48, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="small" color={primaryColor} />
        </View>
      ) : (
        <SearchableSelectComponent
          title="Select Bank"
          width={100}
          data={bankNames}
          setValue={(val: string) => setSelectedBankName(val)}
          value={selectedBankName}
        />
      )}

      <EmptyView height={14} />
      <Text style={{ fontSize: 13, fontWeight: "600", color: isDark ? "#E5E7EB" : "#374151", marginBottom: 6 }}>Account Number</Text>
      <InputComponent
        color={primaryColor}
        placeholder="e.g 0123456789"
        placeholdercolor="#888"
        value={accountNumber}
        onChange={(text) => setAccountNumber(text)}
        keyboardType="numeric"
        maxLength={10}
      />

      <EmptyView height={14} />
      <Text style={{ fontSize: 13, fontWeight: "600", color: isDark ? "#E5E7EB" : "#374151", marginBottom: 6 }}>Account Name</Text>
      <View style={{ backgroundColor: selectioncardColor, borderRadius: 12, padding: 14, minHeight: 48, justifyContent: "center" }}>
        {mutationResolve.isPending ? (
          <ActivityIndicator size="small" color={primaryColor} />
        ) : accountName ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Feather name="check-circle" size={16} color={primaryColor} />
            <Text style={{ fontSize: 14, fontWeight: "600", color: primaryColor }}>{accountName}</Text>
          </View>
        ) : (
          <Text style={{ fontSize: 13, color: secondaryTextColor }}>Account name will appear here</Text>
        )}
      </View>

      <EmptyView height={24} />
      <ButtonComponent
        disabled={!accountNumber || !selectedBankName || !accountName || mutationAddBank.isPending}
        isLoading={mutationAddBank.isPending}
        color={primaryColor}
        text="Add Bank Account"
        textcolor="#ffffff"
        onPress={handleSubmit}
      />
    </View>
  );
};

export default BankDetails;

interface BankDetailsCardProps {
  showmodal?: boolean;
}

export const BankDetailsCard = ({ showmodal }: BankDetailsCardProps) => {
  const { theme } = useTheme();
  const { selectioncardColor, primaryColor, secondaryTextColor, backgroundColortwo } = getColors(theme);
  const isDark = theme === "dark";
  const toast = useToast();

  const [bankDetails, setBankDetails] = useState<BankRecipient[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [selectedRecipientCode, setSelectedRecipientCode] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: getAccountFn,
    onSuccess: (response) => setBankDetails(response.data),
    onError: (error: any) => {
      const msg = error?.response?.data?.message || error?.message || "Failed to load accounts";
      toast.error("Error", msg);
    },
  });

  const mutationDelete = useMutation({
    mutationFn: deleteAccountFn,
    onSuccess: () => {
      toast.success("Deleted", "Bank account removed successfully");
      setConfirmVisible(false);
      setSelectedRecipientCode(null);
      fetchBankDetails();
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || error?.message || "Failed to delete account";
      toast.error("Error", msg);
    },
  });

  const fetchBankDetails = () => {
    setRefreshing(true);
    mutation.mutate(undefined, { onSettled: () => setRefreshing(false) });
  };

  useEffect(() => {
    fetchBankDetails();
  }, [showmodal]);

  const handleDeleteConfirm = () => {
    if (selectedRecipientCode) mutationDelete.mutate(selectedRecipientCode);
  };

  if (mutation.isPending && !refreshing) {
    return (
      <View style={{ paddingVertical: 20, alignItems: "center" }}>
        <ActivityIndicator size="small" color={primaryColor} />
      </View>
    );
  }

  return (
    <>
      <FlatList
        data={bankDetails}
        keyExtractor={(item) => item.recipientCode}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={{ paddingVertical: 24, alignItems: "center" }}>
            <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: selectioncardColor, alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
              <FontAwesome5 name="university" size={18} color={secondaryTextColor} />
            </View>
            <Text style={{ fontSize: 12, color: secondaryTextColor, fontStyle: "italic" }}>No bank accounts added yet</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View
            style={{ backgroundColor: selectioncardColor, borderRadius: 14, padding: 14, marginBottom: 10, flexDirection: "row", alignItems: "center" }}
          >
            <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: primaryColor + "15", alignItems: "center", justifyContent: "center" }}>
              <FontAwesome5 name="university" size={14} color={primaryColor} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={{ fontSize: 13, fontWeight: "600", color: isDark ? "#F9FAFB" : "#111827" }}>{item.name}</Text>
              <Text style={{ fontSize: 11, color: secondaryTextColor, marginTop: 2 }}>{item.bank} - {item.number}</Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                setSelectedRecipientCode(item.recipientCode);
                setConfirmVisible(true);
              }}
              style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: backgroundColortwo + '15', alignItems: "center", justifyContent: "center" }}
            >
              <FontAwesome5 name="trash" color={backgroundColortwo} size={13} />
            </TouchableOpacity>
          </View>
        )}
      />

      <Modal transparent animationType="fade" visible={confirmVisible} onRequestClose={() => setConfirmVisible(false)}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center" }}>
          <View style={{ backgroundColor: selectioncardColor, borderRadius: 16, padding: 24, width: "80%" }}>
            <View style={{ alignItems: "center", marginBottom: 16 }}>
              <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: backgroundColortwo + '15', alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
                <FontAwesome5 name="trash" size={18} color={backgroundColortwo} />
              </View>
              <Text style={{ fontSize: 16, fontWeight: "700", color: isDark ? "#F9FAFB" : "#111827", textAlign: "center" }}>Delete Bank Account?</Text>
              <Text style={{ fontSize: 12, color: secondaryTextColor, textAlign: "center", marginTop: 6 }}>This action cannot be undone</Text>
            </View>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <View style={{ flex: 1 }}>
                <ButtonComponent color="#E5E7EB" text="Cancel" textcolor="#374151" onPress={() => setConfirmVisible(false)} />
              </View>
              <View style={{ flex: 1 }}>
                <ButtonComponent color={backgroundColortwo} text="Delete" textcolor="#fff" isLoading={mutationDelete.isPending} onPress={handleDeleteConfirm} />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

