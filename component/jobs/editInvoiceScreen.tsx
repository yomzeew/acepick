// EditInvoiceScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { FontAwesome6, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useTheme } from 'hooks/useTheme';
import ContainerTemplate from 'component/dashboardComponent/containerTemplate';
import HeaderComponent from 'component/headerComp';
import EmptyView from 'component/emptyview';
import InputComponent from 'component/controls/textinput';
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
  fetchInvoice,
  updateInvoiceFn,
} from 'services/userService';

import { currency } from './invoiceScreen';
import { MaterialCard, AddMaterial } from './invoiceScreen';
import { Material } from 'types/type';

/* ─────────────────────────────────────────────────────────────────── */

const EditInvoiceScreen = () => {
  const { jobId } = useLocalSearchParams<{ jobId: string }>();
  const router = useRouter();

  const { theme } = useTheme();
  const { primaryColor, secondaryTextColor, selectioncardColor, backgroundColortwo } =
    getColors(theme);

  /* ───────────────────────── Invoice data ───────────────────────── */

  const {
    data: invoice,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ['invoice', jobId],
    queryFn: () => fetchInvoice(Number(jobId)),
    enabled: !!jobId,
  });

  /* keep local copy so the form is controlled */
  const [durationUnit, setDurationUnit] = useState<'days' | 'months'>('days');
  const [durationValue, setDurationValue] = useState<string>('');
  const [workmanship, setWorkmanship] = useState<string>('0');
  const [materials, setMaterials] = useState<Material[]>([]);

  /* banner messages */
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  /* add-material modal & success modal */
  const [showAdd, setShowAdd] = useState(false);
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
    mutationFn: (payload: any) => updateInvoiceFn(Number(jobId), payload),
    onSuccess: () => {
      setSuccessMessage('Invoice updated successfully');
      setShowSuccess(true);
      refetch();
    },
    onError: (e: any) => {
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
    updateMutation.mutate({
      durationUnit,
      durationValue: Number(durationValue),
      workmanship: Number(workmanship),
      materials,
    });
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
        <View className="w-full h-full justify-center items-center">
          <ActivityIndicator color={primaryColor} size="large" />
          <EmptyView height={12} />
          <ThemeTextsecond size={Textstyles.text_xsmall}>
            Loading invoice...
          </ThemeTextsecond>
        </View>
      </ContainerTemplate>
    );
  }

  if (!invoice) {
    return (
      <ContainerTemplate>
        <HeaderComponent title="Edit Invoice" />
        <View className="flex-1 justify-center items-center px-6">
          <Ionicons name="document-text-outline" size={56} color={secondaryTextColor + '40'} />
          <EmptyView height={12} />
          <ThemeTextsecond size={Textstyles.text_small}>
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
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <HeaderComponent title="Edit Invoice" />
          <EmptyView height={20} />

          {/* ─── Duration Section ─────────────────────── */}
          <View
            style={{ backgroundColor: selectioncardColor }}
            className="rounded-2xl px-4 py-4 mb-4"
          >
            <View className="flex-row items-center mb-3">
              <View
                style={{ backgroundColor: primaryColor + '20' }}
                className="w-8 h-8 rounded-full items-center justify-center mr-3"
              >
                <Ionicons name="time-outline" size={16} color={primaryColor} />
              </View>
              <ThemeText size={Textstyles.text_small}>Duration</ThemeText>
            </View>

            <View className="flex-row gap-x-4 mb-3">
              {(['days', 'months'] as const).map((u) => (
                <TouchableOpacity
                  key={u}
                  onPress={() => setDurationUnit(u)}
                  style={{
                    backgroundColor: durationUnit === u ? primaryColor : 'transparent',
                    borderWidth: durationUnit === u ? 0 : 1,
                    borderColor: secondaryTextColor + '40',
                  }}
                  className="flex-1 h-11 rounded-xl items-center justify-center"
                >
                  <Text
                    style={{
                      color: durationUnit === u ? '#fff' : secondaryTextColor,
                      fontFamily: 'TTFirsNeueMedium',
                      fontSize: 14,
                    }}
                  >
                    {u[0].toUpperCase() + u.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <InputComponent
              keyboardType="numeric"
              value={durationValue}
              onChange={setDurationValue}
              color={primaryColor}
              placeholder="Enter duration value"
              placeholdercolor={secondaryTextColor}
            />
          </View>

          {/* ─── Workmanship Section ──────────────────── */}
          <View
            style={{ backgroundColor: selectioncardColor }}
            className="rounded-2xl px-4 py-4 mb-4"
          >
            <View className="flex-row items-center mb-3">
              <View
                style={{ backgroundColor: primaryColor + '20' }}
                className="w-8 h-8 rounded-full items-center justify-center mr-3"
              >
                <MaterialIcons name="engineering" size={16} color={primaryColor} />
              </View>
              <ThemeText size={Textstyles.text_small}>Workmanship</ThemeText>
            </View>

            <InputComponent
              prefix
              icon={
                <Text style={[Textstyles.text_medium, { color: '#fff' }]}>₦</Text>
              }
              keyboardType="numeric"
              value={workmanship}
              onChange={setWorkmanship}
              color={primaryColor}
              placeholder="0.00"
              placeholdercolor={secondaryTextColor}
            />
          </View>

          {/* ─── Materials Section ────────────────────── */}
          <View
            style={{ backgroundColor: selectioncardColor }}
            className="rounded-2xl px-4 py-4 mb-4"
          >
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center">
                <View
                  style={{ backgroundColor: backgroundColortwo + '20' }}
                  className="w-8 h-8 rounded-full items-center justify-center mr-3"
                >
                  <Ionicons name="cube-outline" size={16} color={backgroundColortwo} />
                </View>
                <ThemeText size={Textstyles.text_small}>Materials</ThemeText>
                {materials.length > 0 && (
                  <View
                    style={{ backgroundColor: primaryColor }}
                    className="ml-2 w-6 h-6 rounded-full items-center justify-center"
                  >
                    <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>
                      {materials.length}
                    </Text>
                  </View>
                )}
              </View>

              <TouchableOpacity
                onPress={() => setShowAdd(true)}
                style={{ backgroundColor: primaryColor }}
                className="h-9 px-4 rounded-xl flex-row items-center justify-center"
              >
                <Ionicons name="add" size={18} color="#fff" />
                <Text style={{ color: '#fff', fontSize: 13, fontFamily: 'TTFirsNeueMedium', marginLeft: 4 }}>
                  Add
                </Text>
              </TouchableOpacity>
            </View>

            {materials.length === 0 ? (
              <View className="items-center py-6">
                <Ionicons name="cube-outline" size={40} color={secondaryTextColor + '40'} />
                <EmptyView height={8} />
                <ThemeTextsecond size={Textstyles.text_xsmall}>
                  No materials added yet
                </ThemeTextsecond>
              </View>
            ) : (
              materials.map((item, index) => (
                <MaterialCard
                  key={`${index}`}
                  item={item}
                  onDelete={() =>
                    setMaterials((prev) => prev.filter((_, i) => i !== index))
                  }
                />
              ))
            )}
          </View>

          {/* ─── Totals Card ──────────────────────────── */}
          <View
            style={{ backgroundColor: selectioncardColor, borderWidth: 1, borderColor: primaryColor + '30' }}
            className="rounded-2xl px-4 py-4 mb-4"
          >
            <View className="flex-row justify-between items-center mb-2">
              <ThemeTextsecond size={Textstyles.text_small}>Workmanship</ThemeTextsecond>
              <ThemeText size={Textstyles.text_small}>
                {currency(parseFloat(workmanship) || 0)}
              </ThemeText>
            </View>
            <View className="flex-row justify-between items-center mb-3">
              <ThemeTextsecond size={Textstyles.text_small}>Materials</ThemeTextsecond>
              <ThemeText size={Textstyles.text_small}>
                {currency(materialsTotal)}
              </ThemeText>
            </View>
            <Divider />
            <EmptyView height={10} />
            <View className="flex-row justify-between items-center">
              <Text style={{ color: primaryColor, fontSize: 16, fontFamily: 'TTFirsNeueMedium' }}>
                Grand Total
              </Text>
              <Text style={{ color: primaryColor, fontSize: 20, fontFamily: 'TTFirsNeueMedium' }}>
                {currency(grandTotal)}
              </Text>
            </View>
          </View>

          {/* ─── Submit btn ───────────────────────────── */}
          <View className="my-6">
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={updateMutation.isPending}
              style={{ backgroundColor: primaryColor, opacity: updateMutation.isPending ? 0.7 : 1 }}
              className="h-14 rounded-2xl items-center justify-center flex-row"
            >
              {updateMutation.isPending ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Ionicons name="save" size={18} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={{ color: '#fff', fontSize: 16, fontFamily: 'TTFirsNeueMedium' }}>
                    Update Invoice
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
          <EmptyView height={30} />
        </ScrollView>
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
              onAdd={(m: any) => {
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
          modalHeight="55%"
          showmodal={showSuccess}
          setshowmodal={setShowSuccess}
        >
          <View className="items-center justify-center flex-1 px-6">
            <View
              style={{ backgroundColor: primaryColor + '15' }}
              className="w-20 h-20 rounded-full items-center justify-center mb-5"
            >
              <FontAwesome6 name="circle-check" size={44} color={primaryColor} />
            </View>
            <ThemeText size={Textstyles.text_medium}>Invoice Updated!</ThemeText>
            <EmptyView height={8} />
            <ThemeTextsecond size={Textstyles.text_xsmall}>
              Your changes have been saved successfully.
            </ThemeTextsecond>
            <EmptyView height={30} />
            <TouchableOpacity
              onPress={() => {
                setShowSuccess(false);
                router.back();
              }}
              style={{ backgroundColor: primaryColor }}
              className="h-12 w-full rounded-2xl items-center justify-center"
            >
              <Text style={{ color: '#fff', fontSize: 15, fontFamily: 'TTFirsNeueMedium' }}>
                Done
              </Text>
            </TouchableOpacity>
          </View>
        </SliderModalNoScrollview>
      )}
    </>
  );
};

export default EditInvoiceScreen;
