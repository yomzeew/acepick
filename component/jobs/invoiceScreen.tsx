// InvoiceScreen.tsx
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    KeyboardAvoidingView,
    Platform,
  } from 'react-native';
  import { useTheme } from 'hooks/useTheme';
  import { useEffect, useState } from 'react';
  import {
    ThemeText,
    ThemeTextsecond,
  } from 'component/ThemeText';
  import EmptyView from 'component/emptyview';
  import HeaderComponent from 'component/headerComp';
  import Checkbox from 'component/controls/checkbox';
  import InputComponent, {
    InputComponentTextarea,
  } from 'component/controls/textinput';
  import ButtonFunction from 'component/buttonfunction';
  import ContainerTemplate from 'component/dashboardComponent/containerTemplate';
  import Divider from 'component/divider';
  import {
    SliderModalNoScrollview,
  } from 'component/slideupModalTemplate';
  import { FontAwesome6 } from '@expo/vector-icons';
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
    // ───────────────────────────────── hooks / colors
    const { theme }       = useTheme();
    const {
      primaryColor,
      secondaryTextColor,
      selectioncardColor,
      backgroundColortwo,
    } = getColors(theme);
  
    const { jobId }       = useLocalSearchParams();
  
    // ───────────────────────────────── state
    const [showAdd, setShowAdd]         = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [shouldProceed, setShouldProceed] = useState<boolean>(false);
    
      
  
    const [durationUnit, setDurationUnit]   = useState<'days' | 'months'>('days');
    const [durationValue, setDurationValue] = useState<string>('');      // keep raw for input
    const [workmanship, setWorkmanship]     = useState<string>('');
  
    const [materials, setMaterials] = useState<Material[]>([]);

    useEffect(() => {
        if (errorMessage) {
            const timer = setTimeout(() => {
                setErrorMessage(null);
            }, 4000);
            return () => clearTimeout(timer); // Cleanup on unmount or on new error
        }
    }, [errorMessage]);

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
            console.log(data)
            setSuccessMessage('Invoice Created Successfully')
            setMaterials([])
            setWorkmanship('')
            setDurationUnit('days')
            setDurationValue('')

            setShouldProceed(true)

        },
        onError: (error: any) => {
            let msg = "An unexpected error occurred";

            if (error?.response?.data) {
                // Try multiple common formats
                msg =
                    error.response.data.message ||         // Common single message
                    error.response.data.error ||           // Alternative key
                    JSON.stringify(error.response.data);   // Fallback: dump full error object
            } else if (error?.message) {
                msg = error.message;
            }

            setErrorMessage(msg);
            console.error(" failed:", msg);
        },
    });
    const handleSubmit = () => {
      // validation / API call here
      // …
      const duration=parseInt(durationValue)
      const workmanshipamount=parseFloat(workmanship)
      const payload={jobId:Number(jobId),durationUnit,durationValue:duration,workmanship:workmanshipamount,materials}
      console.log(payload)
      mutation.mutate(payload)
      
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
          <View className="flex-1">
            <HeaderComponent title="Invoice" />
            <EmptyView height={20} />
  
            {/* ─── Duration ─────────────────────────────── */}
            <ThemeTextsecond size={Textstyles.text_xsma}>
              Duration
            </ThemeTextsecond>
            <View className="flex-row gap-x-5 my-2">
              {(['days', 'months'] as const).map((u) => (
                <TouchableOpacity
                  key={u}
                  className="items-center"
                  onPress={() => setDurationUnit(u)}
                >
                  <ThemeText
                    size={Textstyles.text_xsmall}
                  >
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
  
            {/* ─── Workmanship ───────────────────────────── */}
            <EmptyView height={20} />
            <ThemeTextsecond size={Textstyles.text_xsma}>
              Workmanship
            </ThemeTextsecond>
            <InputComponent
              prefix
              icon={
                <Text
                  style={[
                    Textstyles.text_medium,
                    { color: '#fff' },
                  ]}
                >
                  ₦
                </Text>
              }
              keyboardType="numeric"
              value={workmanship}
              onChange={setWorkmanship}
              color={primaryColor}
              placeholder="0.00"
              placeholdercolor={secondaryTextColor}
            />
  
            {/* ─── Add material btn ─────────────────────── */}
            <EmptyView height={20} />
            <View className="items-end">
              <TouchableOpacity
                onPress={() => setShowAdd(true)}
                style={{ backgroundColor: primaryColor }}
                className="h-10 px-4 rounded-xl justify-center"
              >
                <ThemeTextsecond size={Textstyles.text_xsmall}>
                  + Add Material
                </ThemeTextsecond>
              </TouchableOpacity>
            </View>
  
            {/* ─── Material list ────────────────────────── */}
            <FlatList
              data={materials}
              keyExtractor={(_, i) => `${i}`}
              contentContainerStyle={{ paddingVertical: 20 }}
              renderItem={({ item, index }) => (
                <MaterialCard
                  item={item}
                  onDelete={() => handleDelete(index)}
                />
              )}
              ListEmptyComponent={
                <ThemeTextsecond size={Textstyles.text_xsmall}>
                  No materials added yet
                </ThemeTextsecond>
              }
            />
  
            {/* ─── Totals ───────────────────────────────── */}
            <Divider />
            <EmptyView height={10} />
            <ThemeTextsecond size={Textstyles.text_small}>
              Materials: {currency(materialsTotal)}
            </ThemeTextsecond>
            <ThemeText size={Textstyles.text_cmedium}>
              Grand Total: {currency(grandTotal)}
            </ThemeText>
  
            {/* ─── Submit btn ───────────────────────────── */}
            <View className="my-10">
              <ButtonFunction
                color={primaryColor}
                text="Submit"
                textcolor="#fff"
                onPress={handleSubmit}
              />
            </View>
          </View>
        </ContainerTemplate>
  
        {/* ─── Add-material modal ──────────────────────── */}
        {showAdd && (
          <SliderModalNoScrollview
            modalHeight="80%"
            showmodal={showAdd}
            setshowmodal={setShowAdd}
          >
            <KeyboardAvoidingView
              behavior={
                Platform.OS === 'ios' ? 'padding' : 'height'
              }
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
                Successful
              </ThemeText>
              <EmptyView height={40} />
              <ButtonFunction
                color={primaryColor}
                text="OK"
                textcolor="#fff"
                onPress={() => setShowSuccess(false)}
              />
            </View>
          </SliderModalNoScrollview>
        )}
      </>
    );
  };
  export default InvoiceScreen;
  
  // ───────────────────────────────────────── helpers
  interface MaterialCardProps{
    item: Material;
    onDelete: () => void;

  }
  
  export const MaterialCard: React.FC<MaterialCardProps>  = ({
    item,
    onDelete,
  }) => {
    const { theme }       = useTheme();
    const { selectioncardColor } = getColors(theme);
  
    const subtotal = item.price * item.quantity;
  
    return (
      <View
        style={{ backgroundColor: selectioncardColor, elevation: 4 }}
        className="w-full flex-row justify-between items-center px-3 py-2 rounded-xl mb-3"
      >
        <View className="w-2/3">
          <ThemeText size={Textstyles.text_small}>
            {item.description}
          </ThemeText>
          <ThemeTextsecond size={Textstyles.text_xsmall}>
            Qty: {item.quantity} {item.unit} · Price: {currency(item.price)}
          </ThemeTextsecond>
        </View>
        <View className="items-end">
          <TouchableOpacity onPress={onDelete}>
            <Text
              style={[
                Textstyles.text_xsmall,
                { color: 'red', marginBottom: 4 },
              ]}
            >
              delete
            </Text>
          </TouchableOpacity>
          <ThemeText size={Textstyles.text_small}>
            {currency(subtotal)}
          </ThemeText>
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
    const { theme }       = useTheme();
    const { primaryColor, secondaryTextColor } = getColors(theme);
    const [description, setDescription] = useState('');
    const [quantity, setQuantity]       = useState<string>('');
    const [price, setPrice]             = useState<string>('');
    const [unit, setUnit]               = useState('');
  
    const subTotal =
      (parseFloat(quantity) || 0) * (parseFloat(price) || 0);
  
    const handleAdd = () => {
      if (!description || !quantity || !price || !unit) return;
      onAdd({
        description,
        quantity: Number(quantity),
        price: Number(price),
        unit,
      });
    };
  
    return (
      <View className="flex-1 p-4">
        <ThemeText size={Textstyles.text_medium}>
          Add Material
        </ThemeText>
  
        <EmptyView height={15} />
        <InputComponentTextarea
          multiline
          color={primaryColor}
          placeholder="Description"
          placeholdercolor={secondaryTextColor}
          value={description}
          onChange={setDescription}
        />
  
        <EmptyView height={15} />
        <View className="w-full flex-row ">
            <View className='w-1/3'>
            <InputComponent
            keyboardType="numeric"
            color={primaryColor}
            placeholder="Qty"
            placeholdercolor={secondaryTextColor}
            value={quantity}
            onChange={setQuantity}
          />

            </View>
         <View className='w-2/3'>
         <InputComponent
            keyboardType="numeric"
            prefix
            icon={
              <Text
                style={[
                  Textstyles.text_medium,
                  { color: '#fff' },
                ]}
              >
                ₦
              </Text>
            }
            color={primaryColor}
            placeholder="Price"
            placeholdercolor={secondaryTextColor}
            value={price}
            onChange={setPrice}
          />
            </View>
          
        </View>
  
        <EmptyView height={10} />
        <InputComponent
          color={primaryColor}
          placeholder="Unit (e.g. pcs, bucket)"
          placeholdercolor={secondaryTextColor}
          value={unit}
          onChange={setUnit}
        />
  
        <EmptyView height={20} />
        <Divider />
        <EmptyView height={10} />
        <ThemeTextsecond size={Textstyles.text_small}>
          Sub-total: {currency(subTotal)}
        </ThemeTextsecond>
  
        <EmptyView height={30} />
        <ButtonFunction
          color={primaryColor}
          text="Add"
          textcolor="#fff"
          onPress={handleAdd}
        />
        <EmptyView height={10} />
        <ButtonFunction
          color={secondaryTextColor}
          text="Cancel"
          textcolor={primaryColor}
          onPress={onCancel}
        />
      </View>
    );
  };
  