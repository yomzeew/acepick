import { FlatList, ActivityIndicator, TouchableOpacity, View, Text,Modal } from "react-native";
import { useEffect, useState } from "react";
import InputComponent from "component/controls/textinput";
import SelectComponent from "component/dashboardComponent/selectComponent";
import EmptyView from "component/emptyview";
import { ThemeText, ThemeTextsecond } from "component/ThemeText";
import { Textstyles } from "static/textFontsize";
import { useTheme } from "hooks/useTheme";
import { getColors } from "static/color";
import SearchableSelectComponent from "component/dashboardComponent/searchableSelectComponent";
import { useMutation } from "@tanstack/react-query";
import { addAccountFn, deleteAccountFn, getAccountFn, getBanksFn, resolveAccountFn } from "services/userService";
import ButtonComponent from "component/buttoncomponent";
import { BankRecipient } from "type";
import { ScrollView } from "react-native-gesture-handler";
import { FontAwesome5 } from "@expo/vector-icons";
import { useDelay } from "hooks/useDelay";
import { AlertMessageBanner } from "component/AlertMessageBanner";

type Bank = {
  name: string;
  code: string;
};
interface BankDetailsProps{
    setshowmodal:(value:boolean)=>void
}

const BankDetails = ({setshowmodal}:BankDetailsProps) => {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [bankNames, setBankNames] = useState<string[]>([]); // array of just names for the SelectComponent
  const [selectedBankName, setSelectedBankName] = useState("");
  const [selectedBankCode, setSelectedBankCode] = useState("");

  const {theme}=useTheme()
const {primaryColor}=getColors(theme)
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
      const [successMessage, setSuccessMessage] = useState<string | null>(null);
      const [shouldProceed, setShouldProceed] = useState<boolean>(false);
    
    
      useEffect(() => {
        if (errorMessage) {
          const timer = setTimeout(() => {
            setErrorMessage(null);
          }, 4000);
          return () => clearTimeout(timer); // Cleanup on unmount or on new error
        }
      }, [errorMessage])
    
    
      useEffect(() => {
        if (successMessage) {
          const timer = setTimeout(() => {
            setSuccessMessage(null);
          }, 4000);
          return () => clearTimeout(timer); // Cleanup on unmount or on new error
        }
      }, [successMessage])
    
      useDelay(() => {
        if (shouldProceed) {
          setshowmodal(false)
        }
      }, 2000, [shouldProceed]);
    

 const mutation = useMutation({
       mutationFn:getBanksFn,
       onSuccess: (response) => {
        const bankData=response.data
        setBanks(bankData);
        setBankNames(bankData.map((bank: Bank) => bank.name));
        setLoading(false)
       },
       onError: (error: any) => {
         const msg =
           error?.response?.data?.message ||
           error?.message ||
           "An unexpected error occurred";
         console.error("Login failed:", msg);
       },
     });
     useEffect(()=>{
        mutation.mutate()
     },[])

     const mutationResolve = useMutation({
        mutationFn:resolveAccountFn,
        onSuccess: (response) => {
         const res =response.data.data
         console.log(res)
         setAccountName(res.account_name);
        },
        onError: (error: any) => {

          const msg =
            error?.response?.data?.message ||
            error?.message ||
            "An unexpected error occurred";
          console.error(msg);
          setAccountName("");
        },
      });

      useEffect(()=>{
         mutation.mutate()
      },[])

 

  // Update selected bank code from selected bank name
  useEffect(() => {
    const selected = banks.find((bank) => bank.name === selectedBankName);
    if (selected) setSelectedBankCode(selected.code);
  }, [selectedBankName]);

  // Resolve account to get account name
  useEffect(() => {
    const resolveAccount = async () => {
      if (accountNumber.length === 10 && selectedBankCode) {
        const payload={accountNumber,bankCode:selectedBankCode}
        mutationResolve.mutate(payload)
      }
    };
    resolveAccount();
  }, [accountNumber, selectedBankCode]);

  const mutationAddBank=useMutation({
    mutationFn:addAccountFn,
    onSuccess: (response) => {
    setSuccessMessage('Account Details Added Successfull')
    setShouldProceed(true)
    },
    onError: (error: any) => {

      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "An unexpected error occurred";
      console.error("Login failed:", msg);
      setErrorMessage(msg)
    },
  });
  const handleSubmit=()=>{
    const payload={
        "accountName": accountName,
        "bank": selectedBankName,
        "bankCode": selectedBankCode,
        "accountNumber":accountNumber
    }
    mutationAddBank.mutate(payload)
  }

  return (
    <>
       {successMessage && (
                    <AlertMessageBanner type="success" message={successMessage} />
                  )}
                  {errorMessage && (
                    <AlertMessageBanner type="error" message={errorMessage} />
                  )}
      <View className="w-full h-full px-3 py-5">
  
        <ThemeText size={Textstyles.text_xsmall}>Bank Name</ThemeText>
        <View className="w-full">
          {mutation.isPending ? (
            <ActivityIndicator size="small" />
          ) : (
            <SearchableSelectComponent
              title="Select Bank"
              width={100}
              data={bankNames} // plain array of names
              setValue={(val: string) => setSelectedBankName(val)}
              value={selectedBankName}
            />
          )}
        </View>

        <EmptyView height={10} />
        <ThemeText size={Textstyles.text_xsmall}>Account Number</ThemeText>
        <View>
          <InputComponent
            color=""
            placeholder="e.g 0123456789"
            placeholdercolor="#888"
            value={accountNumber}
            onChange={(text) => setAccountNumber(text)}
            keyboardType="numeric"
            maxLength={10}
          />
        </View>
        <EmptyView height={10} />
        <ThemeText size={Textstyles.text_xsmall}>Account Name</ThemeText>
        <View>
          <InputComponent
            color={primaryColor}
            placeholder="e.g Oluwasuyi Babayomi"
            placeholdercolor="#888"
            value={accountName}
            editable={false}
          />
        </View>
        <EmptyView height={10}/>
        <View>
            <ButtonComponent 
            disabled={!accountNumber || !selectedBankName || mutationAddBank.isPending}
            isLoading={mutationAddBank.isPending}
            color={primaryColor} 
            text={"Add Bank Details"} 
            textcolor={"#ffffff"} 
            onPress={handleSubmit }/>
        </View>
       
      </View>
    </>
  );
};

export default BankDetails;

interface BankDetailsCard{
    showmodal?:boolean
}
export const BankDetailsCard = ({showmodal}:BankDetailsCard) => {
  const { theme } = useTheme();
  const { selectioncardColor,primaryColor,backgroundColortwo } = getColors(theme);

  const [bankDetails, setBankDetails] = useState<BankRecipient[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [selectedRecipientCode, setSelectedRecipientCode] = useState<string | null>(null);


  const mutation = useMutation({
    mutationFn: getAccountFn,
    onSuccess: (response) => {
      setBankDetails(response.data);
    },
    onError: (error: any) => {
      console.error(
        error?.response?.data?.message || error?.message || "An unexpected error occurred"
      );
    },
  });

  const mutationDelete = useMutation({
    mutationFn: deleteAccountFn,
    onSuccess: (response) => {
      setBankDetails(response.data);
      setConfirmVisible(false);
      setSelectedRecipientCode(null);

    },
    onError: (error: any) => {
      console.error(
        error?.response?.data?.message || error?.message || "An unexpected error occurred"
      );
    },
  });

  const handleDelete = (recipientCode: string) => {
    mutationDelete.mutate(recipientCode);
  };



  const fetchBankDetails = () => {
    setRefreshing(true);
    mutation.mutate(undefined, {
      onSettled: () => {
        setRefreshing(false);
      },
    });
  };

  useEffect(() => {
    fetchBankDetails();
  }, [showmodal]);

  const handleDeleteConfirm = () => {
    if (selectedRecipientCode) {
      mutationDelete.mutate(selectedRecipientCode);
    }
  };

  if (mutation.isPending && !refreshing) return <ActivityIndicator size="small" />;
  return (
    <>
    <FlatList
      data={bankDetails}
      keyExtractor={(item) => item.recipientCode}
      contentContainerStyle={{ paddingVertical: 12 }}
      showsVerticalScrollIndicator={false}
      refreshing={refreshing}
      onRefresh={fetchBankDetails}
      ListEmptyComponent={
        <View className="w-full h-32 justify-center items-center">
          <Text className="text-gray-500">No bank details found.</Text>
        </View>
      }
      renderItem={({ item }) => (
        <View
          style={{ backgroundColor: selectioncardColor }}
          className="w-full h-24 p-3 mb-3 rounded-lg flex-row justify-between"
        >
          <View className="h-full justify-center">
            <ThemeText size={Textstyles.text_xsmall}>{item.name}</ThemeText>
            <ThemeText size={Textstyles.text_xxmedium}>
              {item.bank} - {item.number}
            </ThemeText>
          </View>

          <View className="h-full justify-center">
            <TouchableOpacity
              onPress={() => {
                setSelectedRecipientCode(item.recipientCode);
                setConfirmVisible(true);
              }}
              className="rounded-full h-12 w-12 justify-center items-center"
            >
              <View className="rounded-full h-12 w-12 bg-red-300 opacity-50 absolute" />
              <FontAwesome5 name="trash" color="red" size={16} />
            </TouchableOpacity>
          </View>
        </View>
      )}
    />

    {/* Confirm Modal */}
    <Modal
      transparent
      animationType="fade"
      visible={confirmVisible}
      onRequestClose={() => setConfirmVisible(false)}
    >
      <View className="flex-1 bg-black/40 justify-center items-center">
        <View style={{backgroundColor:selectioncardColor}} className="bg-white rounded-lg p-6 w-[80%]">
            <ThemeText size={Textstyles.text_cmedium}>
            <Text className="font-semibold mb-4 text-center">Confirm Delete</Text>
            </ThemeText>
          
          <ThemeTextsecond size={Textstyles.text_xxxsmall}>
            <Text className="text-center">
            Are you sure you want to delete this bank account?

            </Text>
          </ThemeTextsecond>
<EmptyView height={10}/>
          <View className="flex-row justify-between gap-x-3 w-full">
            <View className="w-[30%]">
            <ButtonComponent
              color="#ccc"
              text="Cancel"
              textcolor="#333"
              onPress={() => setConfirmVisible(false)}
            />

            </View>
            <View className="w-[30%]">
           
            <ButtonComponent
              color={primaryColor}
              text="Delete"
              textcolor="#fff"
              isLoading={mutationDelete.isPending}
              onPress={handleDeleteConfirm}
            />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  </>
  );
};

