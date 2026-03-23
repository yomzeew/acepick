// InvoiceScreen.tsx
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from 'hooks/useTheme';
import { useEffect, useState } from 'react';
import {
  ThemeText,
  ThemeTextsecond,
} from 'component/ThemeText';
import EmptyView from 'component/emptyview';
import HeaderComponent from 'component/headerComp';
import InputComponent, {
  InputComponentTextarea,
} from 'component/controls/textinput';
import ContainerTemplate from 'component/dashboardComponent/containerTemplate';
import Divider from 'component/divider';
import {
  SliderModalNoScrollview,
} from 'component/slideupModalTemplate';
import { FontAwesome6, Ionicons, MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { getColors } from 'static/color';
import { Textstyles } from 'static/textFontsize';
import { useMutation } from '@tanstack/react-query';
import { invoiceFn } from 'services/userService';
import { AlertMessageBanner } from 'component/AlertMessageBanner';
import { useDelay } from 'hooks/useDelay';

export interface Material {
  description: string;
  quantity: number;
  price: number;
  unit: string;
}
export const currency = (n: number) =>
  `₦${n.toLocaleString()}`;

const InvoiceScreen = () => {
  const { theme } = useTheme();
  const {
    primaryColor,
    secondaryTextColor,
    selectioncardColor,
    backgroundColortwo,
  } = getColors(theme);

  const { jobId } = useLocalSearchParams();

  // ───────────────────────────────── state
  const [showAdd, setShowAdd] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [shouldProceed, setShouldProceed] = useState<boolean>(false);

  const [durationUnit, setDurationUnit] = useState<'days' | 'months'>('days');
  const [durationValue, setDurationValue] = useState<string>('');
  const [workmanship, setWorkmanship] = useState<string>('');

  const [materials, setMaterials] = useState<Material[]>([]);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useDelay(() => {
    if (shouldProceed) {
      setShowSuccess(true);
    }
  }, 2000, [shouldProceed]);

  // ───────────────────────────────── derived
  const materialsTotal = materials.reduce(
    (acc, m) => acc + m.price * m.quantity,
    0
  );
  const grandTotal =
    (parseFloat(workmanship) || 0) + materialsTotal;

  // ───────────────────────────────── handler
  const handleDelete = (index: number) =>
    setMaterials((prev) => prev.filter((_, i) => i !== index));

  const mutation = useMutation({
    mutationFn: invoiceFn,
    onSuccess: (data) => {
      console.log(data);
      setSuccessMessage('Invoice Created Successfully');
      setMaterials([]);
      setWorkmanship('');
      setDurationUnit('days');
      setDurationValue('');
      setShouldProceed(true);
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
      console.error("failed:", msg);
    },
  });

  const handleSubmit = () => {
    const duration = parseInt(durationValue);
    const workmanshipamount = parseFloat(workmanship);

    // Validate required fields
    if (!durationValue || isNaN(duration) || duration <= 0) {
      setErrorMessage('Please enter a valid duration');
      return;
    }
    if (!workmanship || isNaN(workmanshipamount) || workmanshipamount <= 0) {
      setErrorMessage('Please enter a valid workmanship amount');
      return;
    }

    const payload = { jobId: Number(jobId), durationUnit, durationValue: duration, workmanship: workmanshipamount, materials };
    console.log(payload);
    mutation.mutate(payload);
  };

  // ───────────────────────────────── render
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
          <HeaderComponent title="Create Invoice" />
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
                  onDelete={() => handleDelete(index)}
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
              disabled={mutation.isPending}
              style={{ backgroundColor: primaryColor, opacity: mutation.isPending ? 0.7 : 1 }}
              className="h-14 rounded-2xl items-center justify-center flex-row"
            >
              {mutation.isPending ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Ionicons name="send" size={18} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={{ color: '#fff', fontSize: 16, fontFamily: 'TTFirsNeueMedium' }}>
                    Submit Invoice
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
          <EmptyView height={30} />
        </ScrollView>
      </ContainerTemplate>

      {/* ─── Add-material modal ──────────────────────── */}
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
              onAdd={(m) => {
                setMaterials((prev) => [...prev, m]);
                setShowAdd(false);
              }}
              onCancel={() => setShowAdd(false)}
            />
          </KeyboardAvoidingView>
        </SliderModalNoScrollview>
      )}

      {/* ─── Success modal ───────────────────────────── */}
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
            <ThemeText size={Textstyles.text_medium}>Invoice Created!</ThemeText>
            <EmptyView height={8} />
            <ThemeTextsecond size={Textstyles.text_xsmall}>
              Your invoice has been submitted successfully.
            </ThemeTextsecond>
            <EmptyView height={30} />
            <TouchableOpacity
              onPress={() => setShowSuccess(false)}
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
export default InvoiceScreen;

// ───────────────────────────────────────── helpers
interface MaterialCardProps {
  item: Material;
  onDelete: () => void;
}

export const MaterialCard: React.FC<MaterialCardProps> = ({
  item,
  onDelete,
}) => {
  const { theme } = useTheme();
  const { selectioncardColor, primaryColor, secondaryTextColor, backgroundColortwo } = getColors(theme);

  const subtotal = item.price * item.quantity;

  return (
    <View
      style={{ backgroundColor: selectioncardColor, borderWidth: 1, borderColor: secondaryTextColor + '15' }}
      className="w-full flex-row justify-between items-center px-4 py-3 rounded-xl mb-3"
    >
      <View className="flex-row items-center flex-1 mr-3">
        <View
          style={{ backgroundColor: primaryColor + '15' }}
          className="w-10 h-10 rounded-xl items-center justify-center mr-3"
        >
          <Ionicons name="cube" size={18} color={primaryColor} />
        </View>
        <View className="flex-1">
          <ThemeText size={Textstyles.text_small}>
            {item.description}
          </ThemeText>
          <ThemeTextsecond size={Textstyles.text_xsmall}>
            {item.quantity} {item.unit} × {currency(item.price)}
          </ThemeTextsecond>
        </View>
      </View>
      <View className="items-end">
        <Text style={{ color: primaryColor, fontSize: 15, fontFamily: 'TTFirsNeueMedium' }}>
          {currency(subtotal)}
        </Text>
        <TouchableOpacity onPress={onDelete} className="mt-1 flex-row items-center">
          <Ionicons name="trash-outline" size={13} color={backgroundColortwo} />
          <Text style={{ color: backgroundColortwo, fontSize: 11, marginLeft: 3 }}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

/* ------------------------------------------------------------------ */
/* -----------------  ADD-MATERIAL SLIDE-UP COMPONENT  -------------- */
/* ------------------------------------------------------------------ */

interface AddMaterialProps {
  onAdd: (m: Material) => void;
  onCancel: () => void;
}

export const AddMaterial = ({ onAdd, onCancel }: AddMaterialProps) => {
  const { theme } = useTheme();
  const { primaryColor, secondaryTextColor, selectioncardColor } = getColors(theme);
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [unit, setUnit] = useState('');

  const subTotal =
    (parseFloat(quantity) || 0) * (parseFloat(price) || 0);

  const isValid = description && quantity && price && unit;

  const handleAdd = () => {
    if (!isValid) return;
    onAdd({
      description,
      quantity: Number(quantity),
      price: Number(price),
      unit,
    });
  };

  return (
    <View className="flex-1 p-5">
      <View className="flex-row items-center mb-5">
        <View
          style={{ backgroundColor: primaryColor + '20' }}
          className="w-10 h-10 rounded-full items-center justify-center mr-3"
        >
          <Ionicons name="add-circle" size={22} color={primaryColor} />
        </View>
        <ThemeText size={Textstyles.text_medium}>Add Material</ThemeText>
      </View>

      <ThemeTextsecond size={Textstyles.text_xsmall}>Description</ThemeTextsecond>
      <EmptyView height={6} />
      <InputComponentTextarea
        multiline
        color={primaryColor}
        placeholder="e.g. PVC pipes, cement bags"
        placeholdercolor={secondaryTextColor}
        value={description}
        onChange={setDescription}
      />

      <EmptyView height={15} />
      <View className="w-full flex-row gap-x-2">
        <View className="w-1/3">
          <ThemeTextsecond size={Textstyles.text_xsmall}>Quantity</ThemeTextsecond>
          <EmptyView height={6} />
          <InputComponent
            keyboardType="numeric"
            color={primaryColor}
            placeholder="0"
            placeholdercolor={secondaryTextColor}
            value={quantity}
            onChange={setQuantity}
          />
        </View>
        <View className="flex-1">
          <ThemeTextsecond size={Textstyles.text_xsmall}>Price per unit</ThemeTextsecond>
          <EmptyView height={6} />
          <InputComponent
            keyboardType="numeric"
            prefix
            icon={
              <Text style={[Textstyles.text_medium, { color: '#fff' }]}>₦</Text>
            }
            color={primaryColor}
            placeholder="0.00"
            placeholdercolor={secondaryTextColor}
            value={price}
            onChange={setPrice}
          />
        </View>
      </View>

      <EmptyView height={15} />
      <ThemeTextsecond size={Textstyles.text_xsmall}>Unit type</ThemeTextsecond>
      <EmptyView height={6} />
      <InputComponent
        color={primaryColor}
        placeholder="e.g. pcs, bags, bucket"
        placeholdercolor={secondaryTextColor}
        value={unit}
        onChange={setUnit}
      />

      <EmptyView height={20} />
      <View
        style={{ backgroundColor: selectioncardColor, borderWidth: 1, borderColor: primaryColor + '30' }}
        className="rounded-xl px-4 py-3 flex-row justify-between items-center"
      >
        <ThemeTextsecond size={Textstyles.text_small}>Sub-total</ThemeTextsecond>
        <Text style={{ color: primaryColor, fontSize: 18, fontFamily: 'TTFirsNeueMedium' }}>
          {currency(subTotal)}
        </Text>
      </View>

      <EmptyView height={24} />
      <TouchableOpacity
        onPress={handleAdd}
        disabled={!isValid}
        style={{
          backgroundColor: isValid ? primaryColor : secondaryTextColor + '30',
        }}
        className="h-13 py-3 rounded-2xl items-center justify-center flex-row"
      >
        <Ionicons name="add-circle" size={20} color={isValid ? '#fff' : secondaryTextColor} style={{ marginRight: 6 }} />
        <Text style={{ color: isValid ? '#fff' : secondaryTextColor, fontSize: 15, fontFamily: 'TTFirsNeueMedium' }}>
          Add Material
        </Text>
      </TouchableOpacity>
      <EmptyView height={10} />
      <TouchableOpacity
        onPress={onCancel}
        className="h-12 rounded-2xl items-center justify-center"
        style={{ borderWidth: 1, borderColor: secondaryTextColor + '30' }}
      >
        <Text style={{ color: secondaryTextColor, fontSize: 15, fontFamily: 'TTFirsNeueMedium' }}>
          Cancel
        </Text>
      </TouchableOpacity>
    </View>
  );
};
  