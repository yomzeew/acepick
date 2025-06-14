// EditInvoiceScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { useTheme } from 'hooks/useTheme';
import ContainerTemplate from 'component/dashboardComponent/containerTemplate';
import HeaderComponent from 'component/headerComp';
import EmptyView from 'component/emptyview';
import InputComponent, {
  InputComponentTextarea,
} from 'component/controls/textinput';
import Checkbox from 'component/controls/checkbox';
import ButtonFunction from 'component/buttonfunction';
import Divider from 'component/divider';
import {
  SliderModalNoScrollview,
} from 'component/slideupModalTemplate';
import {
  ThemeText,
  ThemeTextsecond,
} from 'component/ThemeText';
import { Textstyles } from 'static/textFontsize';
import { getColors } from 'static/color';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation } from '@tanstack/react-query';
import { AlertMessageBanner } from 'component/AlertMessageBanner';
import {
  fetchInvoice,   //  GET /invoices/:id   ➜ Promise<InvoiceDto>
  updateInvoiceFn //  PATCH /invoices/:id ➜ Promise<InvoiceDto>
} from 'services/userService';

import { currency } from './invoiceScreen'; // reuse helper
import { MaterialCard,AddMaterial } from './invoiceScreen';
import { Material } from 'type';
import ButtonComponent from 'component/buttoncomponent';
import { data } from 'autoprefixer';

/* ─────────────────────────────────────────────────────────────────── */

const EditInvoiceScreen = () => {
    
  const { invoiceId } = useLocalSearchParams<{ invoiceId: string }>();
  const router        = useRouter();

  const { theme }   = useTheme();
  const { primaryColor, secondaryTextColor, selectioncardColor } =
    getColors(theme);

  /* ───────────────────────── Invoice data ───────────────────────── */

  const {
    data: invoice,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ['invoice', invoiceId],
    queryFn : () => fetchInvoice(Number(invoiceId)),
    enabled : !!invoiceId,
  });

  console.log(invoice?.id,'second test')

  /* keep local copy so the form is controlled */
  const [durationUnit, setDurationUnit]   = useState<'days' | 'months'>('days');
  const [durationValue, setDurationValue] = useState<string>(''); // raw text
  const [workmanship, setWorkmanship]     = useState<string>('0');
  const [materials, setMaterials]         = useState<Material[]>([]);

  /* banner messages */
  const [errorMessage,   setErrorMessage]   = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  /* add-material modal & success modal */
  const [showAdd,     setShowAdd]     = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  /* pre-fill once invoice is fetched */
  useEffect(() => {
    if (!invoice) return;
    setDurationUnit((invoice.durationUnit ?? 'days') as 'days' | 'months');
    setDurationValue(String(invoice.durationValue ?? ''));
    setWorkmanship(String(invoice.workmanship ?? '0'));
    setMaterials(invoice.materials ?? []);
  }, [invoice]);

  /* derived totals */
  const materialsTotal = materials.reduce(
    (acc, m) => acc + m.price * m.quantity,
    0
  );
  const grandTotal =
    (parseFloat(workmanship) || 0) + materialsTotal;

  /* ───────────────────────── Update mutation ───────────────────── */

  const updateMutation = useMutation({
    mutationFn: (payload: any) => updateInvoiceFn(Number(invoiceId), payload),
    onSuccess : () => {
      setSuccessMessage('Invoice updated successfully');
      setShowSuccess(true);
      refetch();          // refresh cache with latest data
    },
    onError   : (e: any) => {
      const msg =
        e?.response?.data?.message ??
        e?.response?.data?.error ??
        e?.message ??
        JSON.stringify(e);
      setErrorMessage(msg);
    },
  });

  const handleSubmit = () => {
    if (!invoice) return;
    const body = {
      durationUnit,
      durationValue : Number(durationValue),
      workmanship   : Number(workmanship),
      materials,
    };
    updateMutation.mutate(body);
  };

  /* auto-dismiss banners */
  useEffect(() => {
    if (successMessage) {
      const t = setTimeout(() => setSuccessMessage(null), 4000);
      return () => clearTimeout(t);
    }
  }, [successMessage]);

  useEffect(() => {
    if (errorMessage) {
      const t = setTimeout(() => setErrorMessage(null), 4000);
      return () => clearTimeout(t);
    }
  }, [errorMessage]);

  /* ───────────────────────── UI ────────────────────────────────── */

  if (isFetching) {
    return (
      <ContainerTemplate>
        <View className='w-full h-full justify-center items-center'>
                   <ActivityIndicator color={primaryColor} style={{ marginTop: 30 }} />
                   </View>
      </ContainerTemplate>
    );
  }

  if (!invoice) {
    return (
      <ContainerTemplate>
           <HeaderComponent title="View Invoice" />
         <EmptyView height={10} />
         
              <View className='px-3'>
              <ThemeTextsecond size={Textstyles.text_cmedium}>
            Invoice not found
          </ThemeTextsecond>

              </View>
      </ContainerTemplate>
    );
  }

  return (
    <>
      {successMessage && (
        <AlertMessageBanner type="success" message={successMessage} />
      )}
      {errorMessage && (
        <AlertMessageBanner type="error" message={errorMessage} />
      )}

      <ContainerTemplate>
        <View className="flex-1">
          <HeaderComponent title="Edit Invoice" />
          <EmptyView height={20} />

          {/* Duration */}
          <ThemeTextsecond size={Textstyles.text_xsma}>Duration</ThemeTextsecond>
          <View className="flex-row gap-x-5 my-2">
            {(['days', 'months'] as const).map((u) => (
              <TouchableOpacity
                key={u}
                className="items-center"
                onPress={() => setDurationUnit(u)}
              >
                <ThemeText size={Textstyles.text_xsmall}>
                  {u[0].toUpperCase() + u.slice(1)}
                </ThemeText>
                <Checkbox
                  isChecked={durationUnit === u}
                  onToggle={() => setDurationUnit(u)}
                />
              </TouchableOpacity>
            ))}
          </View>
          <InputComponent
            keyboardType="numeric"
            value={durationValue}
            onChange={setDurationValue}
            color={primaryColor}
            placeholder="Duration value"
            placeholdercolor={secondaryTextColor}
          />

          {/* Workmanship */}
          <EmptyView height={20} />
          <ThemeTextsecond size={Textstyles.text_xsma}>Workmanship</ThemeTextsecond>
          <InputComponent
            prefix
            icon={<Text style={[Textstyles.text_medium, { color: '#fff' }]}>₦</Text>}
            keyboardType="numeric"
            value={workmanship}
            onChange={setWorkmanship}
            color={primaryColor}
            placeholder="0.00"
            placeholdercolor={secondaryTextColor}
          />

          {/* Add material button */}
          <EmptyView height={20} />
          <View className="items-end">
            <TouchableOpacity
              onPress={() => setShowAdd(true)}
              style={{ backgroundColor: primaryColor }}
              className="h-10 px-4 rounded-xl justify-center"
            >
              <ThemeTextsecond size={Textstyles.text_xsmall}>+ Add Material</ThemeTextsecond>
            </TouchableOpacity>
          </View>

          {/* Materials list */}
          <FlatList
            data={materials}
            keyExtractor={(_, i) => `${i}`}
            contentContainerStyle={{ paddingVertical: 20 }}
            renderItem={({ item, index }) => (
              <MaterialCard
                item={item}
                onDelete={() =>
                  setMaterials((prev) => prev.filter((_, i) => i !== index))
                }
              />
            )}
          />

          {/* Totals */}
          <Divider />
          <EmptyView height={10} />
          <ThemeTextsecond size={Textstyles.text_small}>
            Materials: {currency(materialsTotal)}
          </ThemeTextsecond>
          <ThemeText size={Textstyles.text_cmedium}>
            Grand Total: {currency(grandTotal)}
          </ThemeText>

          {/* Submit */}
          <View className="my-10">
            <ButtonComponent
              color={primaryColor}
              text="Update"
              textcolor="#fff"
              onPress={handleSubmit}
              isLoading={updateMutation.isPending}
            />
          </View>
        </View>
      </ContainerTemplate>

      {/* Add-material modal */}
      {showAdd && (
        <SliderModalNoScrollview
          modalHeight="80%"
          showmodal={showAdd}
          setshowmodal={setShowAdd}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
          >
            <AddMaterial
                onAdd={(m:any) => {
                    setMaterials((prev) => [...prev, m]);
                    setShowAdd(false);
                  }}
                  onCancel={() => setShowAdd(false)}
            />
          </KeyboardAvoidingView>
        </SliderModalNoScrollview>
      )}

      {/* Success modal */}
      {showSuccess && (
        <SliderModalNoScrollview
          modalHeight="60%"
          showmodal={showSuccess}
          setshowmodal={setShowSuccess}
        >
          <View className="items-center mt-16 px-6">
            <FontAwesome6
              name="circle-check"
              size={48}
              color={primaryColor}
            />
            <EmptyView height={20} />
            <ThemeText size={Textstyles.text_medium}>
              Invoice updated
            </ThemeText>
            <EmptyView height={40} />
            <ButtonFunction
              color={primaryColor}
              text="Close"
              textcolor="#fff"
              onPress={() => {
                setShowSuccess(false);
                router.back(); // go back to invoice view list
              }}
            />
          </View>
        </SliderModalNoScrollview>
      )}
    </>
  );
};

export default EditInvoiceScreen;
